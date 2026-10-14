import type Phaser from 'phaser';
import type { CharacterId } from '../data/characters';
import type { EnemyType } from '../data/enemies';

export const CARTOON_HERO_IDS = [
  'sigma','alpha','rizzler','ohio','fanum','six-seven','cool-kid','nerd',
] as const satisfies readonly CharacterId[];
export const CARTOON_ENEMY_IDS = ['npc','hater','beta','boss'] as const satisfies readonly EnemyType[];
export const cartoonHeroKey = (id: CharacterId): string => 'ct-hero-' + id;
export const cartoonEnemyKey = (id: EnemyType): string => 'ct-enemy-' + id;
export const cartoonHeroSrc = (id: CharacterId): string => '/assets/cartoon/v1/characters/' + id + '.svg';

export function preloadCartoonArt(scene: Phaser.Scene): void {
  for (const id of CARTOON_HERO_IDS) {
    scene.load.svg(cartoonHeroKey(id), 'assets/cartoon/v1/characters/' + id + '.svg', {width: 96,height: 96});
  }
  for (const id of CARTOON_ENEMY_IDS) {
    scene.load.svg(cartoonEnemyKey(id), 'assets/cartoon/v1/enemies/' + id + '.svg',
      {width: id === 'boss' ? 144 : 96, height: id === 'boss' ? 144 : 96});
  }
}
