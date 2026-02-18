import { create } from 'zustand';
import type { UIState as UIStateType, CardId } from '@/types';

export interface UIStateSlice extends UIStateType {
  setTheme: (theme: UIStateType['theme']) => void;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  toggleActivityPanel: () => void;
  setActivityPanelOpen: (open: boolean) => void;
  setSelectedCard: (cardId: CardId | null) => void;
  setEditingCard: (cardId: CardId | null) => void;
  setModalOpen: (open: boolean) => void;
}

export const useUIStore = create<UIStateSlice>((set) => ({
  theme: 'light',
  commandPaletteOpen: false,
  activityPanelOpen: false,
  selectedCardId: null,
  editingCardId: null,
  modalOpen: false,

  setTheme: (theme) => {
    set({ theme });
    try {
      localStorage.setItem('sync-theme', theme);
    } catch {
      // ignore
    }
  },
  openCommandPalette: () => set({ commandPaletteOpen: true }),
  closeCommandPalette: () => set({ commandPaletteOpen: false }),
  toggleActivityPanel: () => set((s) => ({ activityPanelOpen: !s.activityPanelOpen })),
  setActivityPanelOpen: (open) => set({ activityPanelOpen: open }),
  setSelectedCard: (cardId) => set({ selectedCardId: cardId }),
  setEditingCard: (cardId) => set({ editingCardId: cardId }),
  setModalOpen: (open) => set({ modalOpen: open }),
}));
