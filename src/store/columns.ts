import { produce } from 'immer';
import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import type { Column, ColumnId, BoardId } from '@/types';

export interface ColumnsState {
  columns: Record<ColumnId, Column>;
  addColumn: (boardId: BoardId, title: string) => Column;
  updateColumn: (
    id: ColumnId,
    updates: Partial<Pick<Column, 'title' | 'cardOrder' | 'collapsed'>>
  ) => void;
  deleteColumn: (id: ColumnId) => void;
  reorderCards: (columnId: ColumnId, cardOrder: Column['cardOrder']) => void;
  toggleCollapsed: (id: ColumnId) => void;
  hydrate: (columns: Record<ColumnId, Column>) => void;
}

export const useColumnsStore = create<ColumnsState>((set, get) => ({
  columns: {},

  addColumn: (boardId: BoardId, title: string) => {
    const id = uuid() as ColumnId;
    const now = Date.now();
    const column: Column = {
      id,
      boardId,
      title: title.trim() || 'Untitled',
      cardOrder: [],
      collapsed: false,
      createdAt: now,
      updatedAt: now,
    };
    set(
      produce((state: ColumnsState) => {
        state.columns[id] = column;
      })
    );
    return column;
  },

  updateColumn: (id: ColumnId, updates: Partial<Pick<Column, 'title' | 'cardOrder' | 'collapsed'>>) => {
    set(
      produce((state: ColumnsState) => {
        const col = state.columns[id];
        if (col) Object.assign(col, updates, { updatedAt: Date.now() });
      })
    );
  },

  deleteColumn: (id: ColumnId) => {
    set(
      produce((state: ColumnsState) => {
        delete state.columns[id];
      })
    );
  },

  reorderCards: (columnId: ColumnId, cardOrder: Column['cardOrder']) => {
    set(
      produce((state: ColumnsState) => {
        const col = state.columns[columnId];
        if (col) {
          col.cardOrder = cardOrder;
          col.updatedAt = Date.now();
        }
      })
    );
  },

  toggleCollapsed: (id: ColumnId) => {
    set(
      produce((state: ColumnsState) => {
        const col = state.columns[id];
        if (col) {
          col.collapsed = !col.collapsed;
          col.updatedAt = Date.now();
        }
      })
    );
  },

  hydrate: (columns: Record<ColumnId, Column>) => {
    set({ columns: columns ?? {} });
  },
}));
