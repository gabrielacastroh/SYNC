import { useRef, useEffect } from 'react';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

export interface BoardCardMenuAction {
  id: 'rename' | 'delete';
  label: string;
  icon: React.ReactNode;
  destructive?: boolean;
}

interface BoardCardMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRename: () => void;
  onDelete: () => void;
  className?: string;
}

const actions: BoardCardMenuAction[] = [
  { id: 'rename', label: 'Rename', icon: <Pencil className="h-4 w-4" /> },
  { id: 'delete', label: 'Delete', icon: <Trash2 className="h-4 w-4" />, destructive: true },
];

export function BoardCardMenu({
  open,
  onOpenChange,
  onRename,
  onDelete,
  className,
}: BoardCardMenuProps): React.ReactElement {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent): void => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onOpenChange(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, onOpenChange]);

  const handleAction = (actionId: BoardCardMenuAction['id']): void => {
    onOpenChange(false);
    if (actionId === 'rename') onRename();
    if (actionId === 'delete') onDelete();
  };

  return (
    <div ref={ref} className={cn('relative', className)}>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="h-8 w-8 rounded-md opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onOpenChange(!open);
        }}
        aria-label="Board options"
      >
        <MoreHorizontal className="h-4 w-4" />
      </Button>
      {open && (
        <div
          className="absolute right-0 top-full mt-1 z-10 min-w-[140px] py-1 rounded-lg border bg-card shadow-lg"
          role="menu"
        >
          {actions.map((action) => (
            <button
              key={action.id}
              type="button"
              role="menuitem"
              className={cn(
                'w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors',
                action.destructive
                  ? 'text-destructive hover:bg-destructive/10'
                  : 'text-foreground hover:bg-muted'
              )}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleAction(action.id);
              }}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
