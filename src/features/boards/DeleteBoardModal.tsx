import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { BoardId } from '@/types';

interface DeleteBoardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boardId: BoardId | null;
  boardName: string;
  onConfirm: () => void;
}

export function DeleteBoardModal({
  open,
  onOpenChange,
  boardName,
  onConfirm,
}: DeleteBoardModalProps): React.ReactElement {
  const handleConfirm = (): void => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onClose={() => onOpenChange(false)}
        className="sm:max-w-md"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <DialogHeader>
            <DialogTitle className="text-xl">Delete board</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{boardName}&quot;? This will remove the board and all its columns and cards. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirm}>
              Delete board
            </Button>
          </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
