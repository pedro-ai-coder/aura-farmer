import Phaser from 'phaser';
import type { Arena } from '../core/arena';
import type { EnemyType } from '../data/enemies';

// Original pixel characters produced from deliberate pixel rectangles at a fixed
// low-resolution grid. No third-party assets, animation libraries, or downloads.
export const ART = {
  paper: 0xf6f0ea, floor: 0xddd6f0, tile: 0xc6b6e5,
  ink: 0x302747, hoodie: 0x44345f, aura: 0xffcc51,
  hater: 0xea568a, hostile: 0xe75154, xp: 0x24af7a,
} as const;

type PixelContext = CanvasRenderingContext2D;
function block(c: PixelContext, color: string, x: number, y: number, w: number, h: number): void {
  c.fillStyle = color;
  c.fillRect(x, y, w, h);
}
const INK = '#302747', HOOD = '#44345f', SKIN = '#f5bc93', GOLD = '#ffcc51';
function pixelCanvas(size: number, painter: (c: PixelContext) => void): HTMLCanvasElement {
  // Paint an authentic 24x24 pixel grid, then upscale using nearest-neighbor.
  // This avoids antialiased rectangles at non-integer display sizes.
  const low = document.createElement('canvas');
  low.width = 24; low.height = 24;
  painter(low.getContext('2d', { alpha: true })!);
  const canvas = document.createElement('canvas');
  canvas.width = size; canvas.height = size;
  const c = canvas.getContext('2d', { alpha: true })!;
  c.imageSmoothingEnabled = false;
  c.drawImage(low, 0, 0, size, size);
  return canvas;
}
function player(c: PixelContext, pose: 'idle' | 'walk1' | 'walk2' | 'flex' | 'hurt'): void {
  const b = (color: string, x: number, y: number, w: number, h: number) => block(c, color, x, y, w, h);
  const walking = pose === 'walk1' || pose === 'walk2';
  b(INK, 6, 19, 5, 3); b(INK, 13, 19, 5, 3);
  b('#eed37e', walking && pose === 'walk1' ? 5 : 6, 20, 4, 2);
  b('#eed37e', walking && pose === 'walk2' ? 14 : 13, 20, 4, 2);
  b(INK, 5, 11, 14, 9); b(HOOD, 6, 12, 12, 7);
  b('#5f4b83', 7, 13, 9, 2);
  if (pose === 'flex') { // folded arms: exaggerated, risky pose
    b(INK, 3, 13, 18, 4); b('#6a538e', 4, 14, 16, 2);
    b(GOLD, 2, 9, 2, 3); b(GOLD, 20, 9, 2, 3);
  } else {
    b(INK, 3, 13, 4, 6); b(HOOD, 4, 14, 2, 4);
    b(INK, 17, 13, 4, 6); b(HOOD, 18, 14, 2, 4);
    b(SKIN, 3, walking && pose === 'walk2' ? 19 : 18, 3, 2);
    b(SKIN, 18, walking && pose === 'walk1' ? 19 : 18, 3, 2);
  }
  b(GOLD, 10, 15, 4, 3); b('#fff4c3', 11, 15, 2, 1);
  b(INK, 6, 4, 12, 9); b(SKIN, 7, 6, 10, 6);
  b('#e5a97d', 7, 10, 10, 2);
  b('#221d36', 5, 4, 14, 3); b('#221d36', 7, 2, 8, 3);
  b('#221d36', 8, 1, 3, 2); b('#221d36', 14, 2, 3, 2);
  b('#514368', 8, 3, 3, 2); b('#514368', 13, 4, 3, 1);
  if (pose === 'hurt') {
    b('#e75154', 7, 7, 10, 3);
    b('#fff4e4', 9, 9, 2, 1); b('#fff4e4', 14, 9, 2, 1);
  } else {
    b(INK, 9, 8, 2, 2); b(INK, 14, 8, 2, 2);
    b('#f8f2e7', 9, 8, 1, 1); b('#f8f2e7', 14, 8, 1, 1);
    b(INK, pose === 'flex' ? 10 : 11, 11, 3, 1);
  }
}
function npc(c: PixelContext, pose: number): void {
  const b = (color: string, x: number, y: number, w: number, h: number) => block(c, color, x, y, w, h);
  b(INK, 7, 19, 4, 3); b(INK, 13, 19, 4, 3);
  b(INK, 5, 11, 14, 9); b('#89839e', 6, 12, 12, 7);
  b(INK, 4, 4 + pose, 16, 11); b('#b8b1c6', 5, 5 + pose, 14, 9);
  b('#ebe2e9', 7, 6 + pose, 8, 2);
  b(INK, 9, 10 + pose, 2, 2); b(INK, 15, 10 + pose, 2, 2);
  b('#817992', 11, 13 + pose, 3, 1);
}
function hater(c: PixelContext, pose: number): void {
  const b = (color: string, x: number, y: number, w: number, h: number) => block(c, color, x, y, w, h);
  b(INK, 4, 12, 17, 10); b('#ba3f70', 6, 14, 13, 6);
  b(INK, 4, 4 + pose, 16, 11); b('#ea568a', 5, 6 + pose, 14, 8);
  b(INK, 5, 1 + pose, 4, 6); b(INK, 16, 1 + pose, 3, 6);
  b('#ea568a', 6, 3 + pose, 2, 3); b('#ea568a', 16, 3 + pose, 2, 3);
  b(INK, 7, 9 + pose, 5, 3); b(INK, 14, 9 + pose, 4, 3);
  b('#fff4e4', 8, 9 + pose, 2, 1); b('#fff4e4', 15, 9 + pose, 2, 1);
  b(INK, 10, 13 + pose, 6, 1); b('#f9dfc5', 11, 13 + pose, 2, 1);
}
function beta(c: PixelContext, pose: number): void {
  const b = (color: string, x: number, y: number, w: number, h: number) => block(c, color, x, y, w, h);
  b(INK, 2, 11, 20, 11); b('#69bfa8', 4, 12, 16, 8);
  b(INK, 5, 3 + pose, 14, 13); b('#93ddba', 6, 4 + pose, 12, 10);
  b('#519e90', 5, 10 + pose, 14, 4); b(INK, 8, 8 + pose, 3, 3);
  b(INK, 15, 8 + pose, 2, 3); b('#dcedd9', 10, 12 + pose, 6, 1);
  b('#538a80', 7, 16, 4, 2); b('#538a80', 14, 16, 4, 2);
}
function boss(c: PixelContext, pose: number): void {
  const b = (color: string, x: number, y: number, w: number, h: number) => block(c, color, x, y, w, h);
  b(INK, 2, 11, 20, 12); b('#ab315f', 3, 13, 18, 8);
  b(INK, 0, 11, 6, 9); b(INK, 18, 11, 6, 9);
  b('#ea568a', 1, 12, 5, 6); b('#ea568a', 18, 12, 5, 6);
  b(INK, 5, 4 + pose, 14, 11); b('#ea568a', 6, 5 + pose, 12, 9);
  b(GOLD, 6, 2 + pose, 12, 4); b(INK, 6, 4 + pose, 12, 2);
  b(GOLD, 5, 1 + pose, 3, 4); b(GOLD, 11, 0 + pose, 3, 5);
  b(GOLD, 17, 1 + pose, 2, 4);
  b(INK, 7, 9 + pose, 5, 3); b(INK, 14, 9 + pose, 4, 3);
  b('#fff8e7', 8, 9 + pose, 2, 1); b('#fff8e7', 15, 9 + pose, 2, 1);
  b(INK, 9, 13 + pose, 8, 4); b('#fff8e7', 10, 13 + pose, 2, 2);
  b('#fff8e7', 15, 13 + pose, 2, 2);
  b(GOLD, 10, 17, 4, 3);
}
function gem(c: PixelContext): void {
  const b = (color: string, x: number, y: number, w: number, h: number) => block(c, color, x, y, w, h);
  b(INK, 9, 5, 6, 2); b(INK, 6, 7, 12, 9); b(INK, 9, 16, 6, 3);
  b('#24af7a', 8, 7, 8, 8); b('#aafed4', 10, 7, 4, 5);
  b('#4dd5a4', 11, 15, 3, 2);
}
function orb(c: PixelContext, hostile: boolean): void {
  const outer = hostile ? '#9f2c5a' : '#a96718';
  const core = hostile ? '#e75154' : '#ffcc51';
  block(c, outer, 5, 9, 14, 7); block(c, outer, 9, 5, 7, 14);
  block(c, core, 7, 8, 10, 9); block(c, '#fff8e7', 10, 9, 4, 4);
}
function createKey(scene: Phaser.Scene, key: string, size: number, draw: (c: PixelContext) => void): void {
  if (!scene.textures.exists(key)) scene.textures.addCanvas(key, pixelCanvas(size, draw));
}
export function createPixelTextures(scene: Phaser.Scene): void {
  (['idle','walk1','walk2','flex','hurt'] as const).forEach(p => createKey(scene, 'px-player-'+p, 48, c => player(c, p)));
  (['npc','hater','beta','boss'] as EnemyType[]).forEach(type => {
    const size = type === 'boss' ? 128 : type === 'beta' ? 64 : 48;
    for (let f = 0; f < 2; f++) createKey(scene, `px-` + type + '-' + f, size, c => {
      if (type === 'npc') npc(c, f);
      else if (type === 'hater') hater(c, f);
      else if (type === 'beta') beta(c, f);
      else boss(c, f);
    });
  });
  createKey(scene, 'px-xp', 16, gem);
  createKey(scene, 'px-shot', 14, c => orb(c, false));
  createKey(scene, 'px-hostile', 16, c => orb(c, true));
  createKey(scene, 'px-orbiter', 22, c => orb(c, false));
  const base = document.createElement('canvas'); base.width = 960; base.height = 600;
  const c = base.getContext('2d')!;
  c.fillStyle = '#f6f0ea'; c.fillRect(0,0,960,600);
  c.fillStyle = '#302747'; c.fillRect(8,87,944,505);
  c.fillStyle = '#ddd6f0'; c.fillRect(12,91,936,497);
  for(let y=96; y<580; y+=32) for(let x=16; x<945; x+=32) {
    c.fillStyle = ((x/32+y/32)%7 < 2) ? '#d8d0eb' : '#ddd6f0';
    c.fillRect(x,y,32,32);
    if((Math.floor(x/32)*11 + Math.floor(y/32)*7)%19===0) {
      c.fillStyle = '#c6b6e5'; c.fillRect(x+9,y+13,4,3); c.fillRect(x+16,y+8,3,3);
    }
  }
  c.fillStyle = '#f6f0ea'; c.fillRect(0,0,960,82);
  c.fillStyle = '#302747'; c.fillRect(0,79,960,4);
  c.fillStyle = '#c6b6e5'; c.fillRect(12,91,936,3);
  if (!scene.textures.exists('px-floor')) scene.textures.addCanvas('px-floor',base);
}

/** Reusable display objects; simulation/hitboxes stay in the Arena core. */
export class PixelWorld {
  private player: Phaser.GameObjects.Image;
  private enemies = new Map<number, Phaser.GameObjects.Image>();
  private drops: Phaser.GameObjects.Image[] = [];
  private shots: Phaser.GameObjects.Image[] = [];
  private orbiter: Phaser.GameObjects.Image;

  constructor(private scene: Phaser.Scene) {
    createPixelTextures(scene);
    scene.add.image(480,300,'px-floor').setDepth(-10);
    this.player = scene.add.image(480,330,'px-player-idle').setDepth(1.2);
    this.orbiter = scene.add.image(480,330,'px-orbiter').setDepth(1.1).setVisible(false);
  }
  sync(a: Arena): void {
    const frame = Math.floor(a.clock / 180) % 2;
    const pose = a.flex.state === 'charging' ? 'flex'
      : a.clock > 0 && a.clock - a.lastDamageAt < 180 ? 'hurt'
      : frame === 0 ? 'walk1' : 'walk2';
    this.player.setTexture('px-player-' + (a.mode === 'playing' ? pose : 'idle'))
      .setPosition(a.pos.x, a.pos.y);
    this.player.setAlpha(a.clock < a.effects.invulnerableUntil ? .65 : 1);
    const alive = new Set<number>();
    for (const enemy of a.enemies) {
      alive.add(enemy.id);
      let img = this.enemies.get(enemy.id);
      if (!img) {
        img = this.scene.add.image(enemy.x,enemy.y,'px-'+enemy.type+'-0').setDepth(1);
        this.enemies.set(enemy.id,img);
      }
      const bob = Math.floor((a.clock + enemy.id*77) / 260) % 2;
      img.setTexture('px-'+enemy.type+'-'+bob).setPosition(enemy.x,enemy.y);
    }
    for(const [id,img] of this.enemies) if(!alive.has(id)){img.destroy();this.enemies.delete(id);}
    while(this.shots.length<a.shots.length) this.shots.push(this.scene.add.image(0,0,'px-shot').setDepth(1.4));
    this.shots.forEach((img,i)=>{const shot=a.shots[i];img.setVisible(!!shot);if(shot)img.setTexture(shot.hostile?'px-hostile':'px-shot').setPosition(shot.x,shot.y);});
    while(this.drops.length<a.drops.length) this.drops.push(this.scene.add.image(0,0,'px-xp').setDepth(.8));
    this.drops.forEach((img,i)=>{const drop=a.drops[i];img.setVisible(!!drop);if(drop)img.setPosition(drop.x,drop.y);});
    this.orbiter.setVisible(a.buffs['ohio-orbiter']>0);
    if(a.buffs['ohio-orbiter'])this.orbiter.setPosition(a.orb.x,a.orb.y);
  }
}
