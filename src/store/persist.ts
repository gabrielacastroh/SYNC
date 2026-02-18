import type { BoardId } from '@/types';
import { loadFromStorage, saveToStorage } from '@/utils/storage';
import { useBoardsStore } from './boards';
import { useColumnsStore } from './columns';
import { useCardsStore } from './cards';
import { useActivityStore } from './activity';

const STORAGE_VERSION = 1;

let hydrating = false;

interface PersistedData {
  version: number;
  boards: Record<string, ReturnType<typeof useBoardsStore.getState>['boards'][string]>;
  activeBoardId: BoardId | null;
  columns: ReturnType<typeof useColumnsStore.getState>['columns'];
  cards: ReturnType<typeof useCardsStore.getState>['cards'];
  activity: ReturnType<typeof useActivityStore.getState>['activities'];
}

export function persistStores(): void {
  if (hydrating) return;
  const data: PersistedData = {
    version: STORAGE_VERSION,
    boards: useBoardsStore.getState().boards,
    activeBoardId: useBoardsStore.getState().activeBoardId,
    columns: useColumnsStore.getState().columns,
    cards: useCardsStore.getState().cards,
    activity: useActivityStore.getState().activities,
  };
  saveToStorage(data as unknown as Parameters<typeof saveToStorage>[0]);
}

export function hydrateStores(): void {
  const data = loadFromStorage() as Partial<PersistedData> | null;
  if (!data?.boards || !data?.columns || !data?.cards || data?.activity === undefined) return;
  hydrating = true;
  try {
    useBoardsStore.setState({
      boards: data.boards as PersistedData['boards'],
      activeBoardId: data.activeBoardId ?? null,
    });
    useColumnsStore.getState().hydrate(data.columns as PersistedData['columns']);
    useCardsStore.getState().hydrate(data.cards as PersistedData['cards']);
    useActivityStore.getState().hydrate(data.activity as PersistedData['activity']);
  } finally {
    hydrating = false;
  }
}
