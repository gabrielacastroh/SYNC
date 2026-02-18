import { useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { ArrowLeft, LayoutGrid, History, Sun, Moon } from 'lucide-react';
import type { BoardId, ColumnId, CardId } from '@/types';
import { useBoardsStore, useColumnsStore, useCardsStore } from '@/store';
import { useActivityStore } from '@/store/activity';
import { useUIStore } from '@/store/ui';
import { Button } from '@/components/ui/button';
import { ColumnList } from '@/features/columns/ColumnList';
import { PresenceAvatars } from '@/features/presence/PresenceAvatars';
import { ActivityPanel } from '@/features/activity/ActivityPanel';
import { cn } from '@/utils/cn';

export function BoardView(): React.ReactElement {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  const id = (boardId ?? '') as BoardId;
  const board = useBoardsStore((s) => s.boards[id]);
  const columnOrder = useMemo(() => board?.columnOrder ?? [], [board?.columnOrder]);
  const columns = useColumnsStore((s) => s.columns);
  const cards = useCardsStore((s) => s.cards);
  const reorderColumns = useBoardsStore((s) => s.reorderColumns);
  const reorderCards = useColumnsStore((s) => s.reorderCards);
  const moveCard = useCardsStore((s) => s.moveCard);
  const addActivity = useActivityStore((s) => s.addActivity);
  const activityPanelOpen = useUIStore((s) => s.activityPanelOpen);
  const toggleActivityPanel = useUIStore((s) => s.toggleActivityPanel);
  const theme = useUIStore((s) => s.theme);
  const setTheme = useUIStore((s) => s.setTheme);

  const COLUMN_DRAG_PREFIX = 'col-';
  const columnIds = useMemo(() => new Set(columnOrder), [columnOrder]);
  const cardIds = useMemo(() => new Set(Object.keys(cards)), [cards]);

  const updateBoard = useBoardsStore((s) => s.updateBoard);

  useEffect(() => {
    if (!board?.columnOrder.length) return;
    const validOrder = board.columnOrder.filter((cid) => columns[cid]);
    if (validOrder.length !== board.columnOrder.length) {
      updateBoard(id, { columnOrder: validOrder });
    }
  }, [board?.columnOrder, columns, id, updateBoard]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeStr = String(active.id);
    const overStr = String(over.id);

    if (activeStr.startsWith(COLUMN_DRAG_PREFIX)) {
      const activeColumnId = activeStr.slice(COLUMN_DRAG_PREFIX.length) as ColumnId;
      const overColumnId = overStr.startsWith('column-')
        ? (overStr.replace('column-', '') as ColumnId)
        : overStr.startsWith(COLUMN_DRAG_PREFIX)
          ? (overStr.slice(COLUMN_DRAG_PREFIX.length) as ColumnId)
          : (overStr as ColumnId);
      if (!columnIds.has(activeColumnId) || !columnIds.has(overColumnId)) return;
      const oldIndex = columnOrder.indexOf(activeColumnId);
      const newIndex = columnOrder.indexOf(overColumnId);
      if (oldIndex === -1 || newIndex === -1) return;
      const next = [...columnOrder];
      const [removed] = next.splice(oldIndex, 1);
      next.splice(newIndex, 0, removed);
      reorderColumns(id, next);
      return;
    }

    const activeId = activeStr as CardId;
    const card = cards[activeId];
    if (!card) return;

    if (overStr.startsWith('column-')) {
      const targetColumnId = overStr.replace('column-', '') as ColumnId;
      if (card.columnId !== targetColumnId) {
        moveCard(activeId, targetColumnId, 0);
        const targetCol = columns[targetColumnId];
        if (targetCol) {
          reorderCards(targetColumnId, [activeId, ...targetCol.cardOrder.filter((c) => c !== activeId)]);
        }
        const fromCol = columns[card.columnId];
        if (fromCol) {
          reorderCards(card.columnId, fromCol.cardOrder.filter((c) => c !== activeId));
        }
        addActivity(id, 'card_moved', {
          cardId: activeId,
          cardTitle: card.title,
          fromColumnId: card.columnId,
          toColumnId: targetColumnId,
        });
      }
      return;
    }

    const overCard = cards[overStr as CardId];
    if (!overCard) return;
    if (overCard.columnId !== card.columnId) {
      moveCard(activeId, overCard.columnId, 0);
      const targetCol = columns[overCard.columnId];
      if (targetCol) {
        const idx = targetCol.cardOrder.indexOf(overCard.id);
        const newOrder = [...targetCol.cardOrder.filter((c) => c !== activeId)];
        newOrder.splice(idx, 0, activeId);
        reorderCards(overCard.columnId, newOrder);
      }
      const fromCol = columns[card.columnId];
      if (fromCol) {
        reorderCards(card.columnId, fromCol.cardOrder.filter((c) => c !== activeId));
      }
      addActivity(id, 'card_moved', {
        cardId: activeId,
        cardTitle: card.title,
        fromColumnId: card.columnId,
        toColumnId: overCard.columnId,
      });
    } else {
      const fromCol = columns[card.columnId];
      if (!fromCol) return;
      const oldIndex = fromCol.cardOrder.indexOf(activeId);
      const newIndex = fromCol.cardOrder.indexOf(overCard.id);
      if (oldIndex === -1 || newIndex === -1) return;
      const next = [...fromCol.cardOrder];
      const [removed] = next.splice(oldIndex, 1);
      next.splice(newIndex, 0, removed);
      reorderCards(card.columnId, next);
    }
  };

  if (!board) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-muted-foreground mb-5 text-lg">Board not found</p>
          <Button variant="outline" onClick={() => navigate('/')} className="rounded-lg gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to boards
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col h-screen bg-background dark:bg-[hsl(240,10%,5%)]">
        <header className="sticky top-0 z-30 flex-shrink-0 border-b border-border/80 bg-card/90 dark:bg-card/85 backdrop-blur-md px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="icon-sm" onClick={() => navigate('/')} aria-label="Back" className="rounded-lg">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-bold truncate text-foreground">{board.name}</h1>
          </div>
          <div className="flex items-center gap-1.5">
            <PresenceAvatars />
            <Button
              variant={activityPanelOpen ? 'secondary' : 'ghost'}
              size="icon-sm"
              onClick={toggleActivityPanel}
              aria-label="Activity"
              className="rounded-lg"
            >
              <History className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle theme"
              className="rounded-lg"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </header>

        <main className="flex-1 min-h-0 flex overflow-hidden bg-gradient-to-br from-muted/20 via-background to-muted/30 dark:from-muted/10 dark:via-background dark:to-muted/15">
          <div className="flex-1 min-h-0 min-w-0 p-6 overflow-auto">
            <ColumnList boardId={id} />
          </div>
          {activityPanelOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="border-l border-border/80 bg-card/95 dark:bg-card/90 backdrop-blur-sm flex-shrink-0 overflow-hidden flex flex-col shadow-soft"
            >
              <ActivityPanel boardId={id} />
            </motion.aside>
          )}
        </main>
      </div>
    </DndContext>
  );
}
