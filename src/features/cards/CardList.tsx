import { useMemo } from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { CardId, ColumnId, BoardId } from '@/types';
import { useColumnsStore, useCardsStore } from '@/store';
import { BoardCard } from './BoardCard';
import { CardPlaceholder } from './CardPlaceholder';

const EMPTY_CARD_ORDER: CardId[] = [];

interface CardListProps {
  columnId: ColumnId;
  boardId: BoardId;
}

export function CardList({ columnId, boardId }: CardListProps): React.ReactElement {
  const column = useColumnsStore((s) => s.columns[columnId]);
  const cards = useCardsStore((s) => s.cards);
  const cardOrder = column?.cardOrder?.length ? column.cardOrder : EMPTY_CARD_ORDER;
  const orderedCards = useMemo(
    () =>
      cardOrder
        .map((id) => cards[id])
        .filter(Boolean),
    [cardOrder, cards]
  );

  return (
    <SortableContext items={cardOrder} strategy={verticalListSortingStrategy}>
      <div className="space-y-3">
        {orderedCards.map((card) => (
          <BoardCard key={card.id} card={card} />
        ))}
        <CardPlaceholder columnId={columnId} boardId={boardId} />
      </div>
    </SortableContext>
  );
}
