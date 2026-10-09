export type BuffId = 'sigma' | 'alpha' | 'mewing' | 'locked-in' | 'drip' | 'speed' | 'six-seven' | 'thick-skin' | 'mewing-jaw' | 'ohio-orbiter';
export interface BuffDefinition { id: BuffId; name: string; description: string; maxStacks: number; rarity: 'COMUM' | 'RARO' | 'ÉPICO' }
export const BUFFS: BuffDefinition[] = [
  { id: 'sigma', name: 'Sigma Aura', description: '+15% dano enquanto tiveres 50+ Aura.', maxStacks: 2, rarity: 'RARO' },
  { id: 'alpha', name: 'Alpha Aura', description: '+1,5% dano por inimigo próximo (máx. 10).', maxStacks: 2, rarity: 'RARO' },
  { id: 'mewing', name: 'Mewing Streak', description: '+10% probabilidade crítica após 8 s sem dano.', maxStacks: 2, rarity: 'COMUM' },
  { id: 'locked-in', name: 'Locked In', description: '+25% cadência após 8 s sem dano.', maxStacks: 2, rarity: 'RARO' },
  { id: 'drip', name: 'Drip Check', description: 'Reduz 1 ponto de dano recebido.', maxStacks: 3, rarity: 'COMUM' },
  { id: 'speed', name: 'Bro Has Motion', description: '+12% velocidade de movimento.', maxStacks: 3, rarity: 'COMUM' },
  { id: 'six-seven', name: 'Six Seven', description: 'A cada 67 mortes lança 7 projéteis radiais.', maxStacks: 1, rarity: 'ÉPICO' },
  { id: 'thick-skin', name: 'Absolute Unit', description: '+20 de vida máxima e recupera 20 HP.', maxStacks: 3, rarity: 'COMUM' },
  { id: 'mewing-jaw', name: 'Mewing Jaw', description: 'Desbloqueia pancada automática de proximidade.', maxStacks: 1, rarity: 'RARO' },
  { id: 'ohio-orbiter', name: 'Ohio Orbiter', description: 'Desbloqueia orbe giratório que causa dano.', maxStacks: 1, rarity: 'ÉPICO' },
];
export type BuffLevels = Record<BuffId, number>;
export function emptyBuffLevels(): BuffLevels {
  return Object.fromEntries(BUFFS.map(buff => [buff.id, 0])) as BuffLevels;
}
export function availableBuffs(levels: BuffLevels): BuffDefinition[] {
  return BUFFS.filter(buff => levels[buff.id] < buff.maxStacks);
}
