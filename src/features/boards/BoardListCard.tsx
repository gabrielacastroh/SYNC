import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutGrid, Clock } from 'lucide-react';
import type { Board } from '@/types';
import type { BoardId } from '@/types';
import { useBoardsStore } from '@/store';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { BoardCardMenu } from './BoardCardMenu';
import { DeleteBoardModal } from './DeleteBoardModal';
import { cn } from '@/utils/cn';

function formatLastUpdated(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString();
}

interface BoardListCardProps {
  board: Board;
  onDeleteCleanup: (boardId: BoardId) => void;
  layoutIndex: number;
}

export function BoardListCard({ board, onDeleteCleanup, layoutIndex }: BoardListCardProps): React.ReactElement {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(board.name);
  const inputRef = useRef<HTMLInputElement>(null);

  const updateBoard = useBoardsStore((s) => s.updateBoard);
  const deleteBoard = useBoardsStore((s) => s.deleteBoard);
  const setActiveBoard = useBoardsStore((s) => s.setActiveBoard);
  const activeBoardId = useBoardsStore((s) => s.activeBoardId);

  const columnCount = board.columnOrder.length;

  useEffect(() => {
    setEditValue(board.name);
  }, [board.name]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const saveName = (): void => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== board.name) {
      updateBoard(board.id, { name: trimmed });
    } else {
      setEditValue(board.name);
    }
    setEditing(false);
  };

  const cancelEdit = (): void => {
    setEditValue(board.name);
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveName();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      cancelEdit();
    }
  };

  const handleCardClick = (e: React.MouseEvent): void => {
    if ((e.target as HTMLElement).closest('[data-board-card-menu]')) return;
    if (editing) return;
    setActiveBoard(board.id);
    navigate(`/board/${board.id}`);
  };

  const handleDoubleClick = (e: React.MouseEvent): void => {
    if ((e.target as HTMLElement).closest('[data-board-card-menu]')) return;
    e.preventDefault();
    setEditing(true);
  };

  const handleRenameFromMenu = (): void => {
    setMenuOpen(false);
    setEditing(true);
  };

  const handleDeleteFromMenu = (): void => {
    setMenuOpen(false);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = (): void => {
    onDeleteCleanup(board.id);
    deleteBoard(board.id);
    setDeleteModalOpen(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: layoutIndex * 0.03 }}
        layout
        className="h-full"
      >
        <Card
          className={cn(
            'cursor-pointer transition-all duration-300 ease-out h-full flex flex-col p-6 group rounded-xl border',
            'bg-white/90 dark:bg-neutral-900/60 border-border/60',
            'hover:scale-[1.02] hover:shadow-md hover:border-border dark:hover:border-neutral-600',
            'shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.2)]',
            activeBoardId === board.id &&
              'ring-1 ring-foreground/20 dark:ring-white/20 bg-neutral-100/80 dark:bg-neutral-800/60 border-foreground/10 dark:border-white/10'
          )}
          onClick={handleCardClick}
          onDoubleClick={handleDoubleClick}
        >
          <div className="flex items-start justify-between gap-2 mb-6">
            <div className="min-w-0 flex-1">
              {editing ? (
                <Input
                  ref={inputRef}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={saveName}
                  onKeyDown={handleKeyDown}
                  className="text-lg font-semibold h-9 px-2 -ml-1 rounded-lg border-border/80"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <h3 className="text-lg font-semibold text-foreground truncate tracking-tight">
                  {board.name}
                </h3>
              )}
            </div>
            <div data-board-card-menu>
              <BoardCardMenu
                open={menuOpen}
                onOpenChange={setMenuOpen}
                onRename={handleRenameFromMenu}
                onDelete={handleDeleteFromMenu}
              />
            </div>
          </div>

          <div className="mt-auto space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2.5">
              <LayoutGrid className="h-4 w-4 shrink-0 opacity-60" />
              <span>{columnCount} {columnCount === 1 ? 'column' : 'columns'}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Clock className="h-4 w-4 shrink-0 opacity-60" />
              <span>{formatLastUpdated(board.updatedAt)}</span>
            </div>
          </div>
        </Card>
      </motion.div>

      <DeleteBoardModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        boardId={board.id}
        boardName={board.name}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
