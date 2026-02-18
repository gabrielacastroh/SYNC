import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { usePresenceStore } from '@/store/presence';
import { AvatarWithFallback } from '@/components/ui/avatar';
import { Tooltip } from '@/components/ui/tooltip';

export function PresenceAvatars(): React.ReactElement {
  const usersRecord = usePresenceStore((s) => s.users);
  const users = useMemo(() => Object.values(usersRecord).sort((a, b) => b.lastSeen - a.lastSeen), [usersRecord]);

  if (users.length === 0) return <div className="w-9" />;

  return (
    <div className="flex items-center -space-x-2">
      {users.slice(0, 5).map((user, i) => (
        <Tooltip key={user.id} content={`${user.name}${user.currentCardId ? ' (editing)' : ''}`}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className={cn(
              'rounded-full ring-2 ring-background',
              user.currentCardId && 'ring-2 ring-primary/50 ring-offset-2 ring-offset-background animate-presence-pulse'
            )}
          >
            <AvatarWithFallback name={user.name} color={user.avatarColor} className="h-8 w-8 text-xs" />
          </motion.div>
        </Tooltip>
      ))}
      {users.length > 5 && (
        <span className="text-xs text-muted-foreground pl-1.5 font-medium">+{users.length - 5}</span>
      )}
    </div>
  );
}
