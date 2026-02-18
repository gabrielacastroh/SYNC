import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import type { ColumnId, BoardId } from '@/types';
import { useColumnsStore, useCardsStore } from '@/store';
import { useActivityStore } from '@/store/activity';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/utils/cn';

interface CardPlaceholderProps {
  columnId: ColumnId;
  boardId: BoardId;
}

export function CardPlaceholder({ columnId, boardId }: CardPlaceholderProps): React.ReactElement {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const addCard = useCardsStore((s) => s.addCard);
  const reorderCards = useColumnsStore((s) => s.reorderCards);
  const addActivity = useActivityStore((s) => s.addActivity);

  const handleAdd = (): void => {
    const card = addCard(columnId, boardId, title.trim() || 'Untitled card');
    const col = useColumnsStore.getState().columns[columnId];
    if (col) {
      reorderCards(columnId, [...col.cardOrder, card.id]);
    }
    addActivity(boardId, 'card_created', { cardId: card.id, cardTitle: card.title });
    setTitle('');
    setAdding(false);
  };

  if (adding) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-dashed border-border/80 bg-muted/30 dark:bg-muted/20 p-3 space-y-3"
      >
        <Input
          placeholder="Card title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAdd();
            if (e.key === 'Escape') setAdding(false);
          }}
          className="text-sm rounded-lg"
          autoFocus
        />
        <div className="flex gap-2">
          <Button size="sm" onClick={handleAdd} className="rounded-lg">
            Add card
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setAdding(false)} className="rounded-lg">
            Cancel
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.button
      type="button"
      initial={false}
      onClick={() => setAdding(true)}
      className={cn(
        'w-full rounded-xl border border-dashed border-muted-foreground/25',
        'flex items-center justify-center gap-2 py-3.5 text-sm text-muted-foreground',
        'hover:bg-muted/40 hover:text-foreground hover:border-muted-foreground/40 transition-all duration-200'
      )}
    >
      <Plus className="h-4 w-4" />
      Add card
    </motion.button>
  );
}
