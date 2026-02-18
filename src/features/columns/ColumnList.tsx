import { useMemo } from 'react';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import type { BoardId, ColumnId } from '@/types';
import { useBoardsStore, useColumnsStore } from '@/store';
import { BoardColumn } from './BoardColumn';
import { ColumnPlaceholder } from './ColumnPlaceholder';

const EMPTY_COLUMN_ORDER: ColumnId[] = [];
const COLUMN_DRAG_PREFIX = 'col-';

interface ColumnListProps {
  boardId: BoardId;
}

export function ColumnList({ boardId }: ColumnListProps): React.ReactElement {
  const board = useBoardsStore((s) => s.boards[boardId]);
  const columnOrder = board?.columnOrder?.length ? board.columnOrder : EMPTY_COLUMN_ORDER;
  const columns = useColumnsStore((s) => s.columns);

  const orderedColumns = useMemo(
    () =>
      columnOrder
        .map((id) => columns[id])
        .filter(Boolean),
    [columnOrder, columns]
  );

  const sortableColumnIds = useMemo(
    () => columnOrder.map((cid) => `${COLUMN_DRAG_PREFIX}${cid}`),
    [columnOrder]
  );

  return (
    <SortableContext items={sortableColumnIds} strategy={horizontalListSortingStrategy}>
      <div className="flex items-start gap-5 overflow-x-auto overflow-y-hidden pb-5 scrollbar-thin flex-1 min-h-[280px] h-full">
        {orderedColumns.map((col) => (
          <BoardColumn key={col.id} column={col} />
        ))}
        <ColumnPlaceholder boardId={boardId} />
      </div>
    </SortableContext>
  );
}
