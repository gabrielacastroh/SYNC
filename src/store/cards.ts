import { produce } from 'immer';
import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import type { Card, CardId, ColumnId, BoardId } from '@/types';

export interface CardsState {
  cards: Record<CardId, Card>;
  addCard: (columnId: ColumnId, boardId: BoardId, title?: string) => Card;
  updateCard: (
    id: CardId,
    updates: Partial<
      Pick<Card, 'title' | 'description' | 'labels' | 'assignedMemberIds' | 'dueDate' | 'columnId'>
    >
  ) => void;
  deleteCard: (id: CardId) => void;
  moveCard: (cardId: CardId, targetColumnId: ColumnId, index: number) => void;
  hydrate: (cards: Record<CardId, Card>) => void;
}

export const useCardsStore = create<CardsState>((set, get) => ({
  cards: {},

  addCard: (columnId: ColumnId, boardId: BoardId, title = '') => {
    const id = uuid() as CardId;
    const now = Date.now();
    const card: Card = {
      id,
      columnId,
      boardId,
      title: title.trim() || 'Untitled card',
      description: '',
      labels: [],
      assignedMemberIds: [],
      dueDate: null,
      createdAt: now,
      updatedAt: now,
    };
    set(
      produce((state: CardsState) => {
        state.cards[id] = card;
      })
    );
    return card;
  },

  updateCard: (
    id: CardId,
    updates: Partial<
      Pick<Card, 'title' | 'description' | 'labels' | 'assignedMemberIds' | 'dueDate' | 'columnId'>
    >
  ) => {
    set(
      produce((state: CardsState) => {
        const card = state.cards[id];
        if (card) Object.assign(card, updates, { updatedAt: Date.now() });
      })
    );
  },

  deleteCard: (id: CardId) => {
    set(
      produce((state: CardsState) => {
        delete state.cards[id];
      })
    );
  },

  moveCard: (cardId: CardId, targetColumnId: ColumnId, _index: number) => {
    const card = get().cards[cardId];
    if (!card) return;
    const fromColumnId = card.columnId;
    if (fromColumnId === targetColumnId) return;

    set(
      produce((state: CardsState) => {
        const c = state.cards[cardId];
        if (c) {
          c.columnId = targetColumnId;
          c.updatedAt = Date.now();
        }
      })
    );
    // Column card orders are updated by the dnd layer
  },

  hydrate: (cards: Record<CardId, Card>) => {
    set({ cards: cards ?? {} });
  },
}));
