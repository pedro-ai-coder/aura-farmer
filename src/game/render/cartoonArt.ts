import type Phaser from 'phaser';
import type { CharacterId } from '../data/characters';
import type { EnemyType } from '../data/enemies';

/** Cartoon V1 is the default art-only presentation. Old art remains available. */
export function isCartoonArt(): boolean {
  const p = new URLSearchParams(window.location.search);
  return !['arena','legacy'].includes(p.get('visual') ?? '') &&
    !p.has('gateA') && !p.has('gateB');
}
export const CARTOON_HERO_IDS = [
  'sigma','alpha','rizzler','ohio','fanum','six-seven','cool-kid','nerd',
] as const satisfies readonly CharacterId[];
export const CARTOON_ENEMY_IDS = ['npc','hater','beta','boss'] as const satisfies readonly EnemyType[];
export const cartoonHeroKey = (id: CharacterId): string => 'ct-hero-' + id;
export type CartoonHeroPose = 'idle' | 'run-a' | 'run-b' | 'attack' | 'flex' | 'hurt';
export const CARTOON_HERO_POSES = ['idle','run-a','run-b','attack','flex','hurt'] as const;
export const cartoonHeroPoseKey = (id:CharacterId,pose:CartoonHeroPose):string => pose==='idle'?cartoonHeroKey(id):cartoonHeroKey(id)+'-'+pose;
export const cartoonEnemyKey = (id: EnemyType): string => 'ct-enemy-' + id;
export type CartoonEnemyPose = 'idle'|'move'|'attack'|'hit';
export const CARTOON_ENEMY_POSES = ['idle','move','attack','hit'] as const;
export const cartoonEnemyPoseKey = (id:EnemyType,pose:CartoonEnemyPose):string => pose==='idle'?cartoonEnemyKey(id):cartoonEnemyKey(id)+'-'+pose;
export const cartoonHeroSrc = (id: CharacterId): string => '/assets/cartoon/v1/characters/' + id + '.svg';

export function preloadCartoonArt(scene: Phaser.Scene): void {
  if (!isCartoonArt()) return;
  for (const id of CARTOON_HERO_IDS) {
    for(const pose of CARTOON_HERO_POSES){
      const filename=pose==='idle'? 'assets/cartoon/v1/characters/'+id+'.svg':'assets/cartoon/v1/characters/poses/'+id+'-'+pose+'.svg';
      scene.load.svg(cartoonHeroPoseKey(id,pose), filename, {width: 128,height: 128});
    }
  }
  for (const id of CARTOON_ENEMY_IDS) {
    for(const pose of CARTOON_ENEMY_POSES){
      const filename=pose==='idle'?'assets/cartoon/v1/enemies/'+id+'.svg':'assets/cartoon/v1/enemies/poses/'+id+'-'+pose+'.svg';
      const size=id==='boss'?160:128;
      scene.load.svg(cartoonEnemyPoseKey(id,pose), filename, {width:size,height:size});
    }
  }
  scene.load.svg('ct-arena', 'assets/cartoon/v1/arenas/aura-court.svg', {width: 960,height: 600});
}
