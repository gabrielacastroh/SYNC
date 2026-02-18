import { useDroppable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, ChevronDown, ChevronRight, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import type { Column } from '@/types';
import { useColumnsStore, useActivityStore } from '@/store';
import { Button } from '@/components/ui/button';
import { CardList } from '@/features/cards/CardList';
import { ColumnMenu } from './ColumnMenu';
import { cn } from '@/utils/cn';

const COLUMN_DRAG_PREFIX = 'col-';

interface BoardColumnProps {
  column: Column;
}

export function BoardColumn({ column }: BoardColumnProps): React.ReactElement {
  const [menuOpen, setMenuOpen] = useState(false);
  const updateColumn = useColumnsStore((s) => s.updateColumn);
  const toggleCollapsed = useColumnsStore((s) => s.toggleCollapsed);
  const addActivity = useActivityStore((s) => s.addActivity);

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: `column-${column.id}`,
  });

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `${COLUMN_DRAG_PREFIX}${column.id}` });

  const setRef = (node: HTMLDivElement | null): void => {
    setNodeRef(node);
    setDroppableRef(node);
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setRef}
      style={style}
      className={cn(
        'flex-shrink-0 w-80 rounded-xl border border-border/80 bg-card/95 dark:bg-card/90 shadow-soft flex flex-col overflow-hidden',
        isDragging && 'opacity-92 shadow-elevation z-10',
        isOver && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
      )}
    >
      <header className="relative sticky top-0 z-10 pt-1 px-3.5 pb-3.5 border-b border-border/60 bg-muted/40 dark:bg-muted/25 flex items-center gap-2 rounded-t-xl">
        <div className="absolute inset-x-0 top-0 h-1 rounded-t-xl bg-primary/80" aria-hidden />
        <button
          className="touch-none p-1.5 rounded-lg hover:bg-muted cursor-grab active:cursor-grabbing transition-colors mt-0.5"
          {...attributes}
          {...listeners}
          type="button"
          aria-label="Drag column"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
        <button
          type="button"
          onClick={() => toggleCollapsed(column.id)}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors mt-0.5"
          aria-label={column.collapsed ? 'Expand' : 'Collapse'}
        >
          {column.collapsed ? (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
        <input
          className="flex-1 min-w-0 bg-transparent font-semibold text-sm border-none outline-none focus:ring-0 px-1.5 rounded mt-0.5"
          value={column.title}
          onChange={(e) => updateColumn(column.id, { title: e.target.value })}
          onBlur={(e) => {
            const v = e.target.value.trim();
            if (v && v !== column.title) {
              updateColumn(column.id, { title: v });
              addActivity(column.boardId, 'column_renamed', { columnId: column.id, columnTitle: v });
            }
          }}
        />
        <ColumnMenu
          column={column}
          open={menuOpen}
          onOpenChange={setMenuOpen}
          trigger={
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Column menu"
              className="rounded-lg"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          }
        />
      </header>
      {!column.collapsed && (
        <div className="flex-1 overflow-y-auto scrollbar-thin p-4 min-h-[120px]">
          <CardList columnId={column.id} boardId={column.boardId} />
        </div>
      )}
    </div>
  );
}
