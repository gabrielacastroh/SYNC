import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useUIStore } from '@/store/ui';
import { useBoardsStore, useColumnsStore, useCardsStore } from '@/store';
import { useActivityStore } from '@/store/activity';
import type { BoardId, ColumnId } from '@/types';

export function useKeyboardShortcuts(): void {
  const { boardId } = useParams<{ boardId: string }>();
  const openCommandPalette = useUIStore((s) => s.openCommandPalette);
  const closeCommandPalette = useUIStore((s) => s.closeCommandPalette);
  const selectedCardId = useUIStore((s) => s.selectedCardId);
  const setSelectedCard = useUIStore((s) => s.setSelectedCard);
  const setModalOpen = useUIStore((s) => s.setModalOpen);

  useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        setSelectedCard(null);
        setModalOpen(false);
        closeCommandPalette();
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openCommandPalette();
        return;
      }
      if (e.key === 'b' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        openCommandPalette();
        return;
      }
      if (!boardId) return;
      const bid = boardId as BoardId;
      const board = useBoardsStore.getState().boards[bid];
      const columns = useColumnsStore.getState().columns;
      const firstColumnId = board?.columnOrder?.[0] ? (columns[board.columnOrder[0]] ? board.columnOrder[0] : null) : null;

      if (e.key === 'n' && !e.ctrlKey && !e.metaKey && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        if (firstColumnId) {
          const card = useCardsStore.getState().addCard(firstColumnId as ColumnId, bid);
          const col = useColumnsStore.getState().columns[firstColumnId];
          if (col) {
            useColumnsStore.getState().reorderCards(firstColumnId as ColumnId, [...col.cardOrder, card.id]);
          }
          useActivityStore.getState().addActivity(bid, 'card_created', { cardId: card.id, cardTitle: card.title });
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [
    boardId,
    openCommandPalette,
    closeCommandPalette,
    setSelectedCard,
    setModalOpen,
  ]);
}
