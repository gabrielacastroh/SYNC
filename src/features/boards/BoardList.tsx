import { useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Sun, Moon } from 'lucide-react';
import type { BoardId } from '@/types';
import { useBoardsStore, useColumnsStore, useCardsStore } from '@/store';
import { useUIStore } from '@/store/ui';
import { Button } from '@/components/ui/button';
import { BoardListCard } from './BoardListCard';
import { BoardListEmptyState } from './BoardListEmptyState';
import { cn } from '@/utils/cn';

export function BoardList(): React.ReactElement {
  const navigate = useNavigate();
  const boardsRecord = useBoardsStore((s) => s.boards);
  const boards = useMemo(() => Object.values(boardsRecord), [boardsRecord]);
  const createBoard = useBoardsStore((s) => s.createBoard);
  const theme = useUIStore((s) => s.theme);
  const setTheme = useUIStore((s) => s.setTheme);

  const handleCreateBoard = useCallback((): void => {
    const board = createBoard('Untitled Board');
    navigate(`/board/${board.id}`);
  }, [createBoard, navigate]);

  const cleanupBoardBeforeDelete = useCallback((boardId: BoardId): void => {
    const board = useBoardsStore.getState().boards[boardId];
    if (!board) return;
    const columns = useColumnsStore.getState().columns;
    board.columnOrder.forEach((columnId) => {
      const col = columns[columnId];
      if (col) {
        col.cardOrder.forEach((cardId) => useCardsStore.getState().deleteCard(cardId));
        useColumnsStore.getState().deleteColumn(columnId);
      }
    });
  }, []);


  useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
      if (
        e.key === 'n' &&
        !e.ctrlKey &&
        !e.metaKey &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA' &&
        !document.querySelector('[role="dialog"]')
      ) {
        const path = window.location.pathname;
        if (path === '/' || path === '') {
          e.preventDefault();
          handleCreateBoard();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleCreateBoard]);

  return (
    <div
      className={cn(
        'min-h-screen w-full flex flex-col',
        'bg-gradient-to-b from-[#fafafa] to-[#f3f3f3]',
        'dark:from-[#0f0f10] dark:to-[#18181b]'
      )}
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div
          className="absolute inset-0 opacity-[0.015] dark:opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-64 rounded-full blur-3xl dark:hidden"
          style={{
            background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255,255,255,0.4) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-64 rounded-full blur-3xl hidden dark:block"
          style={{
            background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255,255,255,0.06) 0%, transparent 70%)',
          }}
        />
      </div>

      <div className="relative flex-shrink-0 border-b border-border/60 bg-white/70 dark:bg-[#0f0f10]/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-10 py-8 sm:py-10">
          <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-8">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground">
                SYNC
              </h1>
              <p className="text-muted-foreground mt-2 text-sm sm:text-base">
                Collaborative boards for modern teams
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                className="rounded-xl h-10 w-10 transition-all duration-200 hover:bg-black/5 dark:hover:bg-white/10"
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4 text-foreground" />
                ) : (
                  <Moon className="h-4 w-4 text-foreground" />
                )}
              </Button>
              <Button
                size="lg"
                onClick={handleCreateBoard}
                className={cn(
                  'gap-2 h-11 px-6 text-sm font-medium rounded-xl shrink-0',
                  'bg-foreground text-background hover:bg-foreground/90',
                  'dark:bg-white dark:text-[#0f0f10] dark:hover:bg-white/90 dark:border dark:border-neutral-700',
                  'shadow-sm hover:shadow-md transition-all duration-200'
                )}
              >
                <Plus className="h-4 w-4" />
                New Board
              </Button>
            </div>
          </header>
        </div>
      </div>

      <div className="relative flex-1 max-w-6xl mx-auto w-full px-6 sm:px-8 lg:px-10 py-12 sm:py-14">
        {boards.length === 0 ? (
          <BoardListEmptyState onCreateBoard={handleCreateBoard} />
        ) : (
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={cn(
              'rounded-2xl border border-border/50 p-7 sm:p-8',
              'bg-white/80 dark:bg-[#18181b]/90',
              'shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06),0_4px_24px_-8px_rgba(0,0,0,0.04)]',
              'dark:shadow-[0_2px_12px_-4px_rgba(0,0,0,0.3)]'
            )}
          >
            <div className="flex items-center gap-3 mb-7">
              <h2 className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Recent boards
              </h2>
              <div className="flex-1 h-px bg-border/60" aria-hidden />
            </div>
            <motion.ul
              className="grid gap-6 sm:gap-7 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: { staggerChildren: 0.05, delayChildren: 0.05 },
                },
                hidden: {},
              }}
            >
              <AnimatePresence mode="popLayout">
                {boards.map((board, i) => (
                  <motion.li
                    key={board.id}
                    layout
                    variants={{
                      hidden: { opacity: 0, y: 16 },
                      visible: { opacity: 1, y: 0 },
                    }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="min-h-[180px]"
                  >
                    <BoardListCard
                      board={board}
                      onDeleteCleanup={cleanupBoardBeforeDelete}
                      layoutIndex={i}
                    />
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
          </motion.section>
        )}
      </div>
    </div>
  );
}
