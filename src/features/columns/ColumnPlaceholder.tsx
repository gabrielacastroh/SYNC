import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import type { BoardId } from '@/types';
import { useBoardsStore, useColumnsStore } from '@/store';
import { useActivityStore } from '@/store/activity';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/utils/cn';

interface ColumnPlaceholderProps {
  boardId: BoardId;
}

export function ColumnPlaceholder({ boardId }: ColumnPlaceholderProps): React.ReactElement {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const addColumn = useColumnsStore((s) => s.addColumn);
  const updateBoard = useBoardsStore((s) => s.updateBoard);
  const addActivity = useActivityStore((s) => s.addActivity);

  const handleAdd = (): void => {
    const t = title.trim() || 'Untitled';
    const col = addColumn(boardId, t);
    updateBoard(boardId, { columnOrder: [...(useBoardsStore.getState().boards[boardId]?.columnOrder ?? []), col.id] });
    addActivity(boardId, 'column_created', { columnId: col.id, columnTitle: t });
    setTitle('');
    setAdding(false);
  };

  if (adding) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex-shrink-0 w-80 rounded-xl border border-dashed border-border/80 bg-muted/30 dark:bg-muted/20 p-4 flex flex-col gap-3"
      >
        <Input
          placeholder="Column title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAdd();
            if (e.key === 'Escape') setAdding(false);
          }}
          autoFocus
        />
        <div className="flex gap-2">
          <Button size="sm" onClick={handleAdd}>
            Add
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>
            Cancel
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0.9 }}
      animate={{ opacity: 1 }}
      onClick={() => setAdding(true)}
      className={cn(
        'flex-shrink-0 w-80 rounded-xl border-2 border-dashed border-muted-foreground/30',
        'flex items-center justify-center gap-2 px-4 py-5 bg-muted/20 dark:bg-muted/10 text-muted-foreground',
        'hover:bg-muted/40 hover:border-muted-foreground/50 hover:text-foreground transition-all duration-200'
      )}
    >
      <Plus className="h-4 w-4" />
      Add column
    </motion.button>
  );
}
