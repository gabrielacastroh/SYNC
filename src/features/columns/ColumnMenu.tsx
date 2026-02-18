import type { Column } from '@/types';
import { useColumnsStore, useBoardsStore, useCardsStore } from '@/store';
import { useActivityStore } from '@/store/activity';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ColumnMenuProps {
  column: Column;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: React.ReactNode;
}

export function ColumnMenu({ column, open, onOpenChange, trigger }: ColumnMenuProps): React.ReactElement {
  const deleteColumn = useColumnsStore((s) => s.deleteColumn);
  const board = useBoardsStore((s) => s.boards[column.boardId]);
  const cards = useCardsStore((s) => s.cards);
  const deleteCard = useCardsStore((s) => s.deleteCard);
  const addActivity = useActivityStore((s) => s.addActivity);
  const updateBoard = useBoardsStore((s) => s.updateBoard);

  const handleDelete = (): void => {
    const cardIds = column.cardOrder;
    cardIds.forEach((id) => {
      deleteCard(id);
      addActivity(column.boardId, 'card_deleted', { cardId: id, cardTitle: cards[id]?.title });
    });
    deleteColumn(column.id);
    const nextOrder = (board?.columnOrder ?? []).filter((id) => id !== column.id);
    updateBoard(column.boardId, { columnOrder: nextOrder });
    addActivity(column.boardId, 'column_deleted', { columnId: column.id, columnTitle: column.title });
    onOpenChange(false);
  };

  return (
    <>
      {trigger}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent onClose={() => onOpenChange(false)}>
          <DialogHeader>
            <DialogTitle>Columna: {column.title || 'Sin título'}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            ¿Eliminar esta columna y todas sus cards? No se puede deshacer.
          </p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Eliminar columna
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
