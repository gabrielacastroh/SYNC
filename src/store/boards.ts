import { produce } from 'immer';
import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import type { Board, BoardId } from '@/types';

export interface BoardsState {
  boards: Record<BoardId, Board>;
  activeBoardId: BoardId | null;
  createBoard: (name: string) => Board;
  setActiveBoard: (id: BoardId | null) => void;
  updateBoard: (id: BoardId, updates: Partial<Pick<Board, 'name' | 'columnOrder'>>) => void;
  deleteBoard: (id: BoardId) => void;
  reorderColumns: (boardId: BoardId, columnOrder: Board['columnOrder']) => void;
}

export const useBoardsStore = create<BoardsState>((set) => ({
  boards: {},
  activeBoardId: null,

  createBoard: (name: string) => {
    const id = uuid() as BoardId;
    const now = Date.now();
    const board: Board = {
      id,
      name: name.trim() || 'Untitled Board',
      columnOrder: [],
      createdAt: now,
      updatedAt: now,
    };
    set(
      produce((state: BoardsState) => {
        state.boards[id] = board;
        state.activeBoardId = id;
      })
    );
    return board;
  },

  setActiveBoard: (id: BoardId | null) => {
    set({ activeBoardId: id });
  },

  updateBoard: (id: BoardId, updates: Partial<Pick<Board, 'name' | 'columnOrder'>>) => {
    set(
      produce((state: BoardsState) => {
        const board = state.boards[id];
        if (board) {
          Object.assign(board, updates, { updatedAt: Date.now() });
        }
      })
    );
  },

  deleteBoard: (id: BoardId) => {
    set(
      produce((state: BoardsState) => {
        delete state.boards[id];
        if (state.activeBoardId === id) {
          const ids = Object.keys(state.boards) as BoardId[];
          state.activeBoardId = ids[0] ?? null;
        }
      })
    );
  },

  reorderColumns: (boardId: BoardId, columnOrder: Board['columnOrder']) => {
    set(
      produce((state: BoardsState) => {
        const board = state.boards[boardId];
        if (board) {
          board.columnOrder = columnOrder;
          board.updatedAt = Date.now();
        }
      })
    );
  },
}));
