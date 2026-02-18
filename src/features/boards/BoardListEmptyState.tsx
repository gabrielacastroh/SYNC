import { motion } from 'framer-motion';
import { LayoutDashboard, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

interface BoardListEmptyStateProps {
  onCreateBoard: () => void;
}

export function BoardListEmptyState({ onCreateBoard }: BoardListEmptyStateProps): React.ReactElement {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn(
        'flex flex-col items-center justify-center py-28 px-8 rounded-2xl border border-border/50',
        'bg-white/80 dark:bg-[#18181b]/90',
        'shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06),0_4px_24px_-8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_12px_-4px_rgba(0,0,0,0.3)]'
      )}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.12, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="rounded-2xl bg-neutral-100/80 dark:bg-neutral-800/40 p-10 mb-8"
      >
        <LayoutDashboard className="h-20 w-20 text-muted-foreground/60" strokeWidth={1.2} />
      </motion.div>
      <p className="text-center text-muted-foreground text-base sm:text-lg max-w-md mb-8 leading-relaxed">
        Create your first board to start collaborating.
      </p>
      <Button
        size="lg"
        onClick={onCreateBoard}
        className={cn(
          'gap-2 text-sm px-6 py-5 h-auto font-medium rounded-xl',
          'bg-foreground text-background hover:bg-foreground/90',
          'dark:bg-white dark:text-[#0f0f10] dark:hover:bg-white/90 dark:border dark:border-neutral-700',
          'shadow-sm hover:shadow-md transition-all duration-200'
        )}
      >
        <Plus className="h-4 w-4" />
        Create your first board
      </Button>
    </motion.section>
  );
}
