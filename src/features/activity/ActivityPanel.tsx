import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Activity, Move, Edit3, Trash2, Columns } from 'lucide-react';
import type { BoardId } from '@/types';
import { useActivityStore } from '@/store/activity';
import { cn } from '@/utils/cn';

interface ActivityPanelProps {
  boardId: BoardId;
}

const typeConfig: Record<
  string,
  { icon: React.ReactNode; label: string; className: string }
> = {
  card_created: { icon: <Edit3 className="h-3.5 w-3.5" />, label: 'Card created', className: 'text-blue-600 dark:text-blue-400' },
  card_moved: { icon: <Move className="h-3.5 w-3.5" />, label: 'Card moved', className: 'text-amber-600 dark:text-amber-400' },
  card_edited: { icon: <Edit3 className="h-3.5 w-3.5" />, label: 'Card edited', className: 'text-foreground/80' },
  card_deleted: { icon: <Trash2 className="h-3.5 w-3.5" />, label: 'Card deleted', className: 'text-red-600 dark:text-red-400' },
  column_renamed: { icon: <Columns className="h-3.5 w-3.5" />, label: 'Column renamed', className: 'text-emerald-600 dark:text-emerald-400' },
  column_created: { icon: <Columns className="h-3.5 w-3.5" />, label: 'Column created', className: 'text-emerald-600 dark:text-emerald-400' },
  column_deleted: { icon: <Trash2 className="h-3.5 w-3.5" />, label: 'Column deleted', className: 'text-red-600 dark:text-red-400' },
};

function formatTime(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString();
}

function activityMessage(a: ReturnType<typeof useActivityStore.getState>['activities'][string]): string {
  const p = a.payload;
  switch (a.type) {
    case 'card_created':
      return `"${p.cardTitle ?? 'Card'}" created`;
    case 'card_moved':
      return `"${p.cardTitle ?? 'Card'}" moved`;
    case 'card_edited':
      return `"${p.cardTitle ?? 'Card'}" edited`;
    case 'card_deleted':
      return `Card deleted`;
    case 'column_renamed':
      return `Column renamed to "${p.columnTitle ?? ''}"`;
    case 'column_created':
      return `Column "${p.columnTitle ?? ''}" created`;
    case 'column_deleted':
      return `Column deleted`;
    default:
      return 'Activity';
  }
}

export function ActivityPanel({ boardId }: ActivityPanelProps): React.ReactElement {
  const activitiesRecord = useActivityStore((s) => s.activities);
  const activities = useMemo(
    () =>
      Object.values(activitiesRecord)
        .filter((a) => a.boardId === boardId)
        .sort((a, b) => b.timestamp - a.timestamp),
    [activitiesRecord, boardId]
  );

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b flex items-center gap-2">
        <Activity className="h-4 w-4 text-muted-foreground" />
        <h2 className="font-medium text-sm">Activity</h2>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-2">
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activity yet.</p>
        ) : (
          activities.map((a, i) => {
            const config = typeConfig[a.type] ?? { icon: null, label: 'Activity', className: '' };
            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex gap-2 text-sm"
              >
                <span className={cn('flex-shrink-0 mt-0.5', config.className)}>
                  {config.icon}
                </span>
                <div className="min-w-0">
                  <p className="text-foreground">{activityMessage(a)}</p>
                  <p className="text-xs text-muted-foreground">{formatTime(a.timestamp)}</p>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
