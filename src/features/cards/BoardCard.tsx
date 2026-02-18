import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { Calendar, MessageSquare, Trash2 } from 'lucide-react';
import type { Card as CardType } from '@/types';
import { useCardsStore, useColumnsStore, useActivityStore } from '@/store';
import { useUIStore } from '@/store/ui';
import { AvatarWithFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { CardLabels } from './CardLabels';
import { cn } from '@/utils/cn';
import { MOCK_MEMBERS } from '@/services/mockMembers';

interface BoardCardProps {
  card: CardType;
}

export function BoardCard({ card }: BoardCardProps): React.ReactElement {
  const setSelectedCard = useUIStore((s) => s.setSelectedCard);
  const deleteCard = useCardsStore((s) => s.deleteCard);
  const columns = useColumnsStore((s) => s.columns);
  const reorderCards = useColumnsStore((s) => s.reorderCards);
  const addActivity = useActivityStore((s) => s.addActivity);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const isDraggingStyle = isDragging
    ? { boxShadow: '0 24px 56px -12px rgba(0, 0, 0, 0.22)', scale: 1.02, rotate: '1deg' }
    : undefined;

  const assigned = card.assignedMemberIds
    .map((id) => MOCK_MEMBERS.find((m) => m.id === id))
    .filter(Boolean);

  const handleDelete = (e: React.MouseEvent): void => {
    e.stopPropagation();
    const column = columns[card.columnId];
    if (column?.cardOrder) {
      reorderCards(card.columnId, column.cardOrder.filter((id) => id !== card.id));
    }
    addActivity(card.boardId, 'card_deleted', { cardId: card.id, cardTitle: card.title });
    deleteCard(card.id);
    setSelectedCard(null);
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={{ ...style, ...isDraggingStyle }}
      layout
      initial={false}
      className={cn(isDragging && 'opacity-95 z-20')}
    >
      <Card
        className={cn(
          'p-4 cursor-pointer transition-all duration-200 ease-out group rounded-xl',
          'border border-border/80 shadow-soft',
          'hover:shadow-elevation hover:-translate-y-0.5 hover:border-primary/30'
        )}
        onClick={() => setSelectedCard(card.id)}
      >
        <div className="flex items-start justify-between gap-2 mb-3">
          <div {...attributes} {...listeners} className="touch-none cursor-grab active:cursor-grabbing flex-1 min-w-0">
          {card.labels.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              <CardLabels labels={card.labels} />
            </div>
          )}
            <p className="font-semibold text-sm text-foreground line-clamp-2 break-words leading-snug">
              {card.title}
            </p>
          </div>
          <button
            type="button"
            onClick={handleDelete}
            className="shrink-0 p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Eliminar card"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-border/40">
          <div className="flex items-center gap-2.5 min-w-0 text-muted-foreground">
            {card.dueDate && (
              <span className="flex items-center gap-1.5 text-xs font-medium">
                <Calendar className="h-3.5 w-3 shrink-0 opacity-75" />
                {card.dueDate}
              </span>
            )}
            {card.description.trim() && (
              <MessageSquare className="h-3.5 w-3 shrink-0 opacity-75" />
            )}
          </div>
          {assigned.length > 0 && (
            <div className="flex -space-x-2.5">
              {assigned.slice(0, 3).map((m) => (
                <AvatarWithFallback
                  key={m!.id}
                  name={m!.name}
                  color={m!.avatarColor}
                  className="h-7 w-7 border-2 border-card text-[10px] ring-2 ring-background shadow-sm"
                />
              ))}
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
