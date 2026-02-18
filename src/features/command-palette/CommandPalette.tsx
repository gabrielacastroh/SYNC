import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, LayoutDashboard, Plus } from 'lucide-react';
import { useUIStore, useBoardsStore } from '@/store';
import { Input } from '@/components/ui/input';
import { cn } from '@/utils/cn';

export function CommandPalette(): React.ReactElement | null {
  const open = useUIStore((s) => s.commandPaletteOpen);
  const closeCommandPalette = useUIStore((s) => s.closeCommandPalette);
  const openCommandPalette = useUIStore((s) => s.openCommandPalette);
  const boardsRecord = useBoardsStore((s) => s.boards);
  const boards = useMemo(() => Object.values(boardsRecord), [boardsRecord]);
  const createBoard = useBoardsStore((s) => s.createBoard);
  const setActiveBoard = useBoardsStore((s) => s.setActiveBoard);
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return boards.slice(0, 5);
    return boards.filter((b) => b.name.toLowerCase().includes(q));
  }, [boards, query]);

  useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openCommandPalette();
      }
      if (e.key === 'Escape') closeCommandPalette();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [openCommandPalette, closeCommandPalette]);

  useEffect(() => {
    if (open) setQuery('');
    setSelected(0);
  }, [open]);

  useEffect(() => {
    setSelected((s) => Math.min(s, Math.max(0, filtered.length - 1)));
  }, [filtered.length]);

  const run = (action: () => void): void => {
    action();
    closeCommandPalette();
  };

  function highlightMatch(name: string, q: string): React.ReactNode {
    if (!q.trim()) return name;
    const lower = name.toLowerCase();
    const lowerQ = q.trim().toLowerCase();
    const i = lower.indexOf(lowerQ);
    if (i === -1) return name;
    return (
      <>
        {name.slice(0, i)}
        <mark className="bg-primary/20 text-foreground rounded px-0.5 font-medium">
          {name.slice(i, i + lowerQ.length)}
        </mark>
        {name.slice(i + lowerQ.length)}
      </>
    );
  }

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 z-[100] flex items-start justify-center pt-[18vh] p-4 bg-black/60 backdrop-blur-sm"
        onClick={closeCommandPalette}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -8 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg bg-card border border-border/80 rounded-xl shadow-elevation overflow-hidden"
        >
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border/80">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search boards or run action..."
              className="border-0 focus-visible:ring-0 h-10 text-base"
              autoFocus
            />
          </div>
          <div className="max-h-[55vh] overflow-y-auto py-2">
            <button
              type="button"
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 text-left text-sm rounded-lg mx-1.5 transition-colors',
                selected === 0 ? 'bg-muted' : 'hover:bg-muted/70'
              )}
              onMouseEnter={() => setSelected(0)}
              onClick={() =>
                run(() => {
                  const board = createBoard('Untitled Board');
                  setActiveBoard(board.id);
                  navigate(`/board/${board.id}`);
                })
              }
            >
              <Plus className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>New board</span>
            </button>
            {filtered.map((board, i) => (
              <button
                key={board.id}
                type="button"
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 text-left text-sm rounded-lg mx-1.5 transition-colors',
                  selected === i + 1 ? 'bg-muted' : 'hover:bg-muted/70'
                )}
                onMouseEnter={() => setSelected(i + 1)}
                onClick={() =>
                  run(() => {
                    setActiveBoard(board.id);
                    navigate(`/board/${board.id}`);
                  })
                }
              >
                <LayoutDashboard className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>{highlightMatch(board.name, query)}</span>
              </button>
            ))}
            {filtered.length === 0 && query && (
              <p className="px-4 py-5 text-sm text-muted-foreground">No boards found.</p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
