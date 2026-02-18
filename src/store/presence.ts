import { produce } from 'immer';
import { create } from 'zustand';
import type { PresenceUser, PresenceId, CardId, ColumnId } from '@/types';
import { AVATAR_COLORS } from '@/utils/constants';

export interface PresenceState {
  users: Record<PresenceId, PresenceUser>;
  currentUserId: PresenceId | null;
  setCurrentUser: (id: PresenceId | null) => void;
  setUserLocation: (
    userId: PresenceId,
    cardId: CardId | null,
    columnId: ColumnId | null
  ) => void;
  addOrUpdateUser: (id: PresenceId, name: string, avatarColor?: string) => void;
  removeUser: (id: PresenceId) => void;
  getUsersInBoard: () => PresenceUser[];
}

let colorIndex = 0;
function nextColor(): string {
  const color = AVATAR_COLORS[colorIndex % AVATAR_COLORS.length] ?? '#737373';
  colorIndex += 1;
  return color;
}

export const usePresenceStore = create<PresenceState>((set, get) => ({
  users: {},
  currentUserId: null,

  setCurrentUser: (id: PresenceId | null) => {
    set({ currentUserId: id });
  },

  setUserLocation: (
    userId: PresenceId,
    cardId: CardId | null,
    columnId: ColumnId | null
  ) => {
    set(
      produce((state: PresenceState) => {
        const u = state.users[userId];
        if (u) {
          u.currentCardId = cardId;
          u.currentColumnId = columnId;
          u.lastSeen = Date.now();
        }
      })
    );
  },

  addOrUpdateUser: (id: PresenceId, name: string, avatarColor?: string) => {
    set(
      produce((state: PresenceState) => {
        if (state.users[id]) {
          state.users[id].name = name;
          state.users[id].lastSeen = Date.now();
          if (avatarColor) state.users[id].avatarColor = avatarColor;
        } else {
          state.users[id] = {
            id,
            name,
            avatarColor: avatarColor ?? nextColor(),
            currentCardId: null,
            currentColumnId: null,
            lastSeen: Date.now(),
          };
        }
      })
    );
  },

  removeUser: (id: PresenceId) => {
    set(
      produce((state: PresenceState) => {
        delete state.users[id];
        if (state.currentUserId === id) state.currentUserId = null;
      })
    );
  },

  getUsersInBoard: () => {
    return Object.values(get().users).sort(
      (a, b) => b.lastSeen - a.lastSeen
    );
  },
}));
