/**
 * Limpia títulos que dejó la simulación en tiempo real
 * (ej. "card Revised", "card WIP") y los reemplaza por "Untitled card".
 */
import { useCardsStore } from './cards';
import { persistStores } from './persist';

const SIMULATION_SUFFIXES = [' Revised', ' WIP', ' Done', ' In review', ' Updated'];

function isSimulationTitle(title: string): boolean {
  return SIMULATION_SUFFIXES.some((suffix) => title.endsWith(suffix));
}

export function migrateSimulationTitles(): void {
  const cards = useCardsStore.getState().cards;
  let changed = false;
  const updates: Array<{ id: string; title: string }> = [];
  for (const card of Object.values(cards)) {
    if (isSimulationTitle(card.title)) {
      updates.push({ id: card.id, title: 'Untitled card' });
      changed = true;
    }
  }
  if (!changed) return;
  for (const { id, title } of updates) {
    useCardsStore.getState().updateCard(id as import('@/types').CardId, { title });
  }
  persistStores();
}
