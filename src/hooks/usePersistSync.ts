import { useEffect } from 'react';
import { persistStores } from '@/store/persist';
import { useBoardsStore } from '@/store/boards';
import { useColumnsStore } from '@/store/columns';
import { useCardsStore } from '@/store/cards';
import { useActivityStore } from '@/store/activity';

export function usePersistSync(): void {
  useEffect(() => {
    const unsubB = useBoardsStore.subscribe(persistStores);
    const unsubC = useColumnsStore.subscribe(persistStores);
    const unsubCards = useCardsStore.subscribe(persistStores);
    const unsubA = useActivityStore.subscribe(persistStores);
    return () => {
      unsubB();
      unsubC();
      unsubCards();
      unsubA();
    };
  }, []);
}
