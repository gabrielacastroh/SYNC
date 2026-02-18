import { v4 as uuid } from 'uuid';
import type { BoardId, PresenceId } from '@/types';
import { useBoardsStore } from '@/store/boards';
import { useColumnsStore } from '@/store/columns';
import { useCardsStore } from '@/store/cards';
import { useActivityStore } from '@/store/activity';
import { usePresenceStore } from '@/store/presence';
import { MOCK_MEMBER_NAMES } from '@/utils/constants';

let simulationInterval: ReturnType<typeof setInterval> | null = null;

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

export function startRealtimeSimulation(boardId: BoardId): () => void {
  const presenceId = `sim-${uuid()}` as PresenceId;
  usePresenceStore.getState().addOrUpdateUser(presenceId, randomItem(MOCK_MEMBER_NAMES));

  simulationInterval = setInterval(() => {
    const boards = useBoardsStore.getState().boards;
    const board = boards[boardId];
    if (!board || board.columnOrder.length === 0) return;

    const columns = useColumnsStore.getState().columns;
    const cards = useCardsStore.getState().cards;
    const columnIds = board.columnOrder.map((id) => columns[id]).filter(Boolean);
    const allCards = Object.values(cards).filter((c) => c.boardId === boardId);
    if (allCards.length === 0) return;

    // Solo simula mover cards entre columnas (no edita títulos)
    if (Math.random() < 0.3) {
      const card = randomItem(allCards);
      const col = randomItem(columnIds);
      if (col && card.columnId !== col.id) {
        useCardsStore.getState().moveCard(card.id, col.id, 0);
        const targetCol = useColumnsStore.getState().columns[col.id];
        if (targetCol) {
          const newOrder = [card.id, ...targetCol.cardOrder.filter((id) => id !== card.id)];
          useColumnsStore.getState().reorderCards(col.id, newOrder);
        }
        const fromCol = useColumnsStore.getState().columns[card.columnId];
        if (fromCol) {
          useColumnsStore.getState().reorderCards(card.columnId, fromCol.cardOrder.filter((id) => id !== card.id));
        }
        useActivityStore.getState().addActivity(boardId, 'card_moved', {
          cardId: card.id,
          cardTitle: card.title,
          fromColumnId: card.columnId,
          toColumnId: col.id,
          userName: 'Simulated user',
        });
        usePresenceStore.getState().setUserLocation(presenceId, null, col.id);
      }
    }
  }, 4000 + Math.random() * 6000);

  return (): void => {
    if (simulationInterval) {
      clearInterval(simulationInterval);
      simulationInterval = null;
    }
    usePresenceStore.getState().removeUser(presenceId);
  };
}
