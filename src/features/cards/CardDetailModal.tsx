import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, MessageSquare, User, Trash2 } from 'lucide-react';
import type { Card as CardType, CardLabel, LabelColor } from '@/types';
import { useCardsStore, useColumnsStore, useActivityStore } from '@/store';
import { useUIStore } from '@/store/ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CardLabels } from './CardLabels';
import { LABEL_COLORS } from '@/utils/constants';
import { MOCK_MEMBERS } from '@/services/mockMembers';
import { cn } from '@/utils/cn';

interface CardDetailModalProps {
  cardId: string | null;
  onClose: () => void;
}

export function CardDetailModal({ cardId, onClose }: CardDetailModalProps): React.ReactElement | null {
  const card = useCardsStore((s) => (cardId ? s.cards[cardId] : null));
  const updateCard = useCardsStore((s) => s.updateCard);
  const deleteCard = useCardsStore((s) => s.deleteCard);
  const reorderCards = useColumnsStore((s) => s.reorderCards);
  const columns = useColumnsStore((s) => s.columns);
  const addActivity = useActivityStore((s) => s.addActivity);
  const setSelectedCard = useUIStore((s) => s.setSelectedCard);
  const activitiesRecord = useActivityStore((s) => s.activities);
  const activities = useMemo(
    () =>
      cardId && card
        ? Object.values(activitiesRecord)
            .filter((a) => a.boardId === card.boardId && a.payload.cardId === cardId)
            .sort((a, b) => b.timestamp - a.timestamp)
        : [],
    [activitiesRecord, cardId, card]
  );
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setDescription(card.description);
      setDueDate(card.dueDate ?? '');
    }
  }, [card]);

  if (!card) return null;

  const handleSaveTitle = (): void => {
    const t = title.trim() || 'Untitled card';
    if (t !== card.title) {
      updateCard(card.id, { title: t });
      addActivity(card.boardId, 'card_edited', { cardId: card.id, cardTitle: t });
    }
  };

  const handleSaveDescription = (): void => {
    if (description !== card.description) {
      updateCard(card.id, { description: description.trim() });
      addActivity(card.boardId, 'card_edited', { cardId: card.id, cardTitle: card.title });
    }
  };

  const handleDueDateChange = (value: string): void => {
    setDueDate(value);
    updateCard(card.id, { dueDate: value || null });
  };

  const toggleMember = (memberId: string): void => {
    const next = card.assignedMemberIds.includes(memberId)
      ? card.assignedMemberIds.filter((id) => id !== memberId)
      : [...card.assignedMemberIds, memberId];
    updateCard(card.id, { assignedMemberIds: next });
  };

  const addLabel = (text: string, color: LabelColor): void => {
    const newLabel: CardLabel = {
      id: `label-${Date.now()}`,
      text,
      color,
    };
    const next = [...card.labels, newLabel];
    updateCard(card.id, { labels: next });
  };

  const removeLabel = (labelId: string): void => {
    updateCard(card.id, {
      labels: card.labels.filter((l) => l.id !== labelId),
    });
  };

  const handleDeleteCard = (): void => {
    const column = columns[card.columnId];
    if (column) {
      reorderCards(card.columnId, column.cardOrder.filter((id) => id !== card.id));
    }
    addActivity(card.boardId, 'card_deleted', { cardId: card.id, cardTitle: card.title });
    deleteCard(card.id);
    setSelectedCard(null);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card border rounded-lg shadow-soft-lg w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="p-4 border-b flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
              className="text-base font-medium border-0 px-0 focus-visible:ring-0 h-auto py-0"
            />
            {card.labels.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                <CardLabels labels={card.labels} />
              </div>
            )}
          </div>
          <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <MessageSquare className="h-4 w-4" />
              Description
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleSaveDescription}
              placeholder="Add a description..."
              className="w-full min-h-[80px] rounded-md border bg-transparent px-3 py-2 text-sm resize-y"
            />
          </div>

          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Calendar className="h-4 w-4" />
              Due date
            </div>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => handleDueDateChange(e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <User className="h-4 w-4" />
              Assignees
            </div>
            <div className="flex flex-wrap gap-2">
              {MOCK_MEMBERS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => toggleMember(m.id)}
                  className={cn(
                    'flex items-center gap-2 rounded-full px-2 py-1 text-xs border transition-colors',
                    card.assignedMemberIds.includes(m.id)
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:bg-muted'
                  )}
                >
                  <span
                    className="h-5 w-5 rounded-full flex items-center justify-center text-white text-[10px]"
                    style={{ backgroundColor: m.avatarColor }}
                  >
                    {m.name.slice(0, 1)}
                  </span>
                  {m.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground mb-2">Labels</div>
            <div className="flex flex-wrap gap-1 mb-2">
              {card.labels.map((l) => (
                <span
                  key={l.id}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-muted"
                >
                  {l.text}
                  <button
                    type="button"
                    onClick={() => removeLabel(l.id)}
                    className="hover:text-destructive"
                    aria-label="Remove label"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <select
              className="rounded-md border px-2 py-1 text-sm"
              value=""
              onChange={(e) => {
                const v = e.target.value;
                if (v) {
                  const [text, color] = v.split('|');
                  if (text && color) addLabel(text, color as LabelColor);
                  e.target.value = '';
                }
              }}
            >
              <option value="">Add label</option>
              {LABEL_COLORS.map((c) => (
                <option key={c} value={`Label ${c}|${c}`}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {activities.length > 0 && (
            <div>
              <div className="text-sm text-muted-foreground mb-2">Activity</div>
              <ul className="space-y-2 text-sm">
                {activities.slice(0, 10).map((a) => (
                  <li key={a.id} className="text-muted-foreground">
                    {a.type === 'card_edited' && `Edited`}
                    {a.type === 'card_moved' && `Moved`}
                    {' · '}
                    {new Date(a.timestamp).toLocaleString()}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="pt-4 mt-4 border-t">
            <Button
              type="button"
              variant="destructive"
              className="w-full"
              onClick={handleDeleteCard}
            >
              <Trash2 className="h-4 w-4" />
              Eliminar card
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
