import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AppRoutes } from '@/routes';
import { CommandPalette } from '@/features/command-palette/CommandPalette';
import { CardDetailModal } from '@/features/cards/CardDetailModal';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toast';
import { useUIStore } from '@/store/ui';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { startRealtimeSimulation } from '@/services/realtimeSimulation';
import type { BoardId } from '@/types';

export default function App(): React.ReactElement {
  const location = useLocation();
  const selectedCardId = useUIStore((s) => s.selectedCardId);
  const setSelectedCard = useUIStore((s) => s.setSelectedCard);

  useKeyboardShortcuts();

  const boardId = location.pathname.startsWith('/board/')
    ? (location.pathname.replace('/board/', '').split('/')[0] ?? '') as BoardId
    : null;

  useEffect(() => {
    if (!boardId) return;
    const stop = startRealtimeSimulation(boardId);
    return stop;
  }, [boardId]);

  return (
    <TooltipProvider>
      <div className="flex flex-col min-h-screen">
        <AppRoutes />
      </div>
      <CommandPalette />
      <AnimatePresence>
        {selectedCardId && (
          <CardDetailModal
            cardId={selectedCardId}
            onClose={() => setSelectedCard(null)}
          />
        )}
      </AnimatePresence>
      <Toaster />
    </TooltipProvider>
  );
}
