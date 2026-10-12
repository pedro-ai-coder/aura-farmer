import Phaser from 'phaser';
import type { Arena } from '../core/arena';
import type { EnemyType } from '../data/enemies';
import { getCharacter } from '../data/characters';
import { ENEMIES } from '../data/enemies';
import { SIGMA_B1, sigmaB1Frame, type SigmaPose } from './sigmaB1';
import { ALPHA_B2, alphaB2Frame, type AlphaPose } from './alphaB2';
import { RIZZLER_B3, rizzlerB3Frame, type RizzlerPose } from './rizzlerB3';
import { createGateA, isGateA, gateASigmaKey, gateAEnemyKey, type GateASigmaPose } from './gateAArena';

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
  if (!scene.textures.exists(key)) {
    scene.textures.addCanvas(key, pixelCanvas(size, draw))?.setFilter(Phaser.Textures.FilterMode.NEAREST);
  }
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

  // Calm top-down arena dressing. Pixel clusters sit below gameplay entities,
  // deliberately desaturated so danger colors and XP remain unambiguous.
  for (let row = 0; row < 14; row++) {
    for (let col = 0; col < 28; col++) {
      const x = 26 + col * 33, y = 102 + row * 34;
      const id = (col * 37 + row * 19 + col * row * 3) % 41;
      if (id === 3 || id === 13) {
        c.fillStyle = '#c3b3df'; c.fillRect(x+4,y+10,9,2);
        c.fillRect(x+11,y+12,3,4); c.fillRect(x+8,y+16,2,3);
        c.fillStyle = '#e9e3f6'; c.fillRect(x+5,y+8,4,1);
      } else if (id === 23) {
        c.fillStyle = '#b9c7dc'; c.fillRect(x+6,y+13,7,2);
        c.fillStyle = '#eee8f6'; c.fillRect(x+8,y+11,5,2);
      } else if (id === 35) {
        c.fillStyle = '#c6b6e5'; c.fillRect(x+3,y+9,2,5); c.fillRect(x+5,y+11,5,2);
        c.fillStyle = '#e9e3f6'; c.fillRect(x+2,y+8,3,1);
      }
    }
  }
  // Four flat ornamental stone emblems (decals, not solid obstacles).
  for (const [x,y] of [[52,127],[866,127],[52,535],[866,535]]) {
    c.fillStyle = '#c2b3dd'; c.fillRect(x,y,46,28);
    c.fillStyle = '#e6def2'; c.fillRect(x+3,y+3,40,21);
    c.fillStyle = '#d2c5e8'; c.fillRect(x+6,y+6,34,16);
    c.fillStyle = '#ae99d3'; c.fillRect(x+20,y+5,5,17);
    c.fillRect(x+11,y+12,23,4);
    c.fillStyle = '#f6f0ea'; c.fillRect(x+21,y+8,2,9);
  }
  // Double-line arcade frame and illuminated corners.
  c.fillStyle = '#76609e'; c.fillRect(12,91,936,2);
  c.fillStyle = '#44345f'; c.fillRect(12,585,936,4);
  for (const x of [20,915]) {
    for (const y of [100,554]) {
      c.fillStyle = '#8b5bd8'; c.fillRect(x,y,22,3);
      c.fillRect(x,y,3,20);
      c.fillStyle = '#ffcc51'; c.fillRect(x+3,y+3,6,2);
    }
  }
  if (!scene.textures.exists('px-floor')) scene.textures.addCanvas('px-floor',base);
}

/** Reusable display objects; simulation/hitboxes stay in the Arena core. */
export class PixelWorld {
  private readonly gateA = isGateA();
  private impactSprites: Phaser.GameObjects.Image[] = [];
  private player: Phaser.GameObjects.Image;
  private enemies = new Map<number, Phaser.GameObjects.Image>();
  private drops: Phaser.GameObjects.Image[] = [];
  private shots: Phaser.GameObjects.Image[] = [];
  private orbiter: Phaser.GameObjects.Image;
  private shadowLayer: Phaser.GameObjects.Graphics;
  private actionLayer: Phaser.GameObjects.Graphics;
  private previousEnemies = new Map<number,{x:number;y:number;hp:number;type:EnemyType}>();
  private hitFlashes = new Map<number,number>();
  private impacts: Array<{x:number;y:number;until:number;type:EnemyType}> = [];
  private facingRight = true;
  private lastX = 480;
  private lastY = 330;
  private lastClock = 0;
  private lastCharacter = 'sigma';
  private lastFlexSuccesses = 0;
  private flexSuccessStartedAt = -1;
  private deathStartedAt = -1;

  constructor(private scene: Phaser.Scene) {
    createPixelTextures(scene);
    createGateA(scene);
    scene.add.image(480,300,this.gateA && scene.textures.exists('ga-floor') ? 'ga-floor' : 'px-floor').setDepth(-10);
    this.shadowLayer = scene.add.graphics().setDepth(.65);
    this.actionLayer = scene.add.graphics().setDepth(1.65);
    this.player = scene.add.image(480,330,scene.textures.exists(SIGMA_B1.texture) ? SIGMA_B1.texture :
      scene.textures.exists('spr-sigma') ? 'spr-sigma' : 'px-player-idle').setDepth(1.2);
    this.orbiter = scene.add.image(480,330,scene.textures.exists('spr-items') ? 'spr-items' : 'px-orbiter',3).setDepth(1.1).setVisible(false);
  }
  sync(a: Arena): void {
    const frame = Math.floor(a.clock / 180) % 2;
    const pose = a.flex.state === 'charging' ? 'flex'
      : a.clock > 0 && a.clock - a.lastDamageAt < 180 ? 'hurt'
      : frame === 0 ? 'walk1' : 'walk2';
    const moveX = a.pos.x - this.lastX;
    if (Math.abs(moveX) > .18) this.facingRight = moveX > 0;
    const playerMoving = Math.hypot(moveX, a.pos.y - this.lastY) > .18;
    this.lastX = a.pos.x; this.lastY = a.pos.y;
    const characterSprite = 'spr-' + a.characterId;
    const hasCharacterSheet = this.scene.textures.exists(characterSprite);
    const hasDefaultSheet = this.scene.textures.exists('spr-sigma');
    const sigmaB1 = a.characterId === 'sigma' && this.scene.textures.exists(SIGMA_B1.texture);
    const alphaB2 = a.characterId === 'alpha' && this.scene.textures.exists(ALPHA_B2.texture);
    const rizzlerB3 = a.characterId === 'rizzler' && this.scene.textures.exists(RIZZLER_B3.texture);
    if (a.characterId !== this.lastCharacter || a.clock < this.lastClock) {
      this.lastCharacter = a.characterId;
      this.deathStartedAt = -1;
      this.flexSuccessStartedAt = -1;
      this.lastFlexSuccesses = a.flexSuccesses;
    }
    this.lastClock = a.clock;
    const gaSigma = this.gateA && a.characterId === 'sigma' && this.scene.textures.exists('ga-sigma-idle-0');
    if (gaSigma) {
      if (a.flexSuccesses > this.lastFlexSuccesses) this.flexSuccessStartedAt = a.clock;
      this.lastFlexSuccesses = a.flexSuccesses;
      if (a.mode !== 'dead') this.deathStartedAt = -1;
      let animation: GateASigmaPose = 'idle';
      let elapsed = a.clock;
      if (a.mode === 'dead') {
        if (this.deathStartedAt < 0) this.deathStartedAt = this.scene.time.now;
        animation = 'death';
        elapsed = this.scene.time.now - this.deathStartedAt;
      } else if (a.mode === 'win') {
        animation = 'flex_success';
      } else if (a.mode === 'playing' && a.lastDamageAt > 0 && a.clock - a.lastDamageAt < 180) {
        animation = 'hurt'; elapsed = a.clock - a.lastDamageAt;
      } else if (a.mode === 'playing' && a.flex.state === 'charging') {
        animation = 'flex_charge';
      } else if (a.mode === 'playing' && this.flexSuccessStartedAt >= 0 &&
                 a.clock - this.flexSuccessStartedAt < 345) {
        animation = 'flex_success'; elapsed = a.clock - this.flexSuccessStartedAt;
      } else if (a.mode === 'playing' && playerMoving) {
        animation = 'move';
      }
      this.player.setTexture(gateASigmaKey(animation,elapsed));
    } else if (sigmaB1) {
      if (a.flexSuccesses > this.lastFlexSuccesses) this.flexSuccessStartedAt = a.clock;
      this.lastFlexSuccesses = a.flexSuccesses;
      if (a.mode !== 'dead') this.deathStartedAt = -1;
      let animation: SigmaPose = 'idle';
      let elapsed = a.clock;
      if (a.mode === 'dead') {
        if (this.deathStartedAt < 0) this.deathStartedAt = this.scene.time.now;
        animation = 'death';
        elapsed = this.scene.time.now - this.deathStartedAt;
      } else if (a.mode === 'win') {
        animation = 'flex_success';
        elapsed = a.clock;
      } else if (a.mode === 'playing' && a.lastDamageAt > 0 && a.clock - a.lastDamageAt < 180) {
        animation = 'hurt';
        elapsed = a.clock - a.lastDamageAt;
      } else if (a.mode === 'playing' && a.flex.state === 'charging') {
        animation = 'flex_charge';
        elapsed = a.clock;
      } else if (a.mode === 'playing' && this.flexSuccessStartedAt >= 0 &&
                 a.clock - this.flexSuccessStartedAt < 345) {
        animation = 'flex_success';
        elapsed = a.clock - this.flexSuccessStartedAt;
      } else if (a.mode === 'playing' && playerMoving) {
        animation = 'move';
      }
      this.player.setTexture(SIGMA_B1.texture, sigmaB1Frame(animation,elapsed));
    } else if (alphaB2) {
      if (a.flexSuccesses > this.lastFlexSuccesses) this.flexSuccessStartedAt = a.clock;
      this.lastFlexSuccesses = a.flexSuccesses;
      if (a.mode !== 'dead') this.deathStartedAt = -1;
      let animation: AlphaPose = 'idle';
      let elapsed = a.clock;
      if (a.mode === 'dead') {
        if (this.deathStartedAt < 0) this.deathStartedAt = this.scene.time.now;
        animation = 'death';
        elapsed = this.scene.time.now - this.deathStartedAt;
      } else if (a.mode === 'win') {
        animation = 'flex_success';
        elapsed = a.clock;
      } else if (a.mode === 'playing' && a.lastDamageAt > 0 && a.clock - a.lastDamageAt < 180) {
        animation = 'hurt';
        elapsed = a.clock - a.lastDamageAt;
      } else if (a.mode === 'playing' && a.flex.state === 'charging') {
        animation = 'flex_charge';
      } else if (a.mode === 'playing' && this.flexSuccessStartedAt >= 0 &&
                 a.clock - this.flexSuccessStartedAt < 345) {
        animation = 'flex_success';
        elapsed = a.clock - this.flexSuccessStartedAt;
      } else if (a.mode === 'playing' && a.jawUntil > a.clock) {
        // Mewing Jaw starter is Alpha Chad's heavy punch. Match 6 attack
        // frames to the existing 160ms melee strike, without changing damage.
        animation = 'punch';
        elapsed = 160 - (a.jawUntil - a.clock);
      } else if (a.mode === 'playing' && playerMoving) {
        animation = 'move';
      }
      this.player.setTexture(ALPHA_B2.texture, alphaB2Frame(animation, elapsed));
    } else if (rizzlerB3) {
      if (a.flexSuccesses > this.lastFlexSuccesses) this.flexSuccessStartedAt = a.clock;
      this.lastFlexSuccesses = a.flexSuccesses;
      if (a.mode !== 'dead') this.deathStartedAt = -1;
      let animation: RizzlerPose = 'idle';
      let elapsed = a.clock;
      if (a.mode === 'dead') {
        if (this.deathStartedAt < 0) this.deathStartedAt = this.scene.time.now;
        animation = 'death';
        elapsed = this.scene.time.now - this.deathStartedAt;
      } else if (a.mode === 'win') {
        animation = 'flex_success';
      } else if (a.mode === 'playing' && a.lastDamageAt > 0 && a.clock - a.lastDamageAt < 180) {
        animation = 'hurt';
        elapsed = a.clock - a.lastDamageAt;
      } else if (a.mode === 'playing' && a.flex.state === 'charging') {
        animation = 'flex_charge';
      } else if (a.mode === 'playing' && this.flexSuccessStartedAt >= 0 &&
                 a.clock - this.flexSuccessStartedAt < 345) {
        animation = 'flex_success';
        elapsed = a.clock - this.flexSuccessStartedAt;
      } else if (a.mode === 'playing' && a.effects.rizzPulseUntil > a.clock) {
        // Visual-only cast using the existing 300ms crowd-control pulse.
        animation = 'cast';
        elapsed = Math.max(0, 300 - (a.effects.rizzPulseUntil - a.clock));
      } else if (a.mode === 'playing' && playerMoving) {
        animation = 'move';
      }
      this.player.setTexture(RIZZLER_B3.texture, rizzlerB3Frame(animation, elapsed));
    } else if (hasCharacterSheet || hasDefaultSheet) {
      // Legacy atlas stays in place as a safe fallback and for other characters.
      const actorFrame = a.mode !== 'playing' ? frame :
        pose === 'flex' ? 4 : pose === 'hurt' ? 5 : playerMoving ? 2 + frame : frame;
      this.player.setTexture(hasCharacterSheet ? characterSprite : 'spr-sigma',actorFrame);
    } else this.player.setTexture('px-player-' + (a.mode === 'playing' ? pose : 'idle'));
    this.player.setPosition(a.pos.x, a.pos.y).setFlipX(!this.facingRight)
      .setTint(gaSigma || sigmaB1 || alphaB2 || rizzlerB3 || hasCharacterSheet ? 0xffffff : getCharacter(a.characterId).color);
    if (a.clock > 180 && a.clock - a.lastDamageAt < 115) this.player.setTintFill(0xffe7f0);
    this.player.setAlpha(a.clock < a.effects.invulnerableUntil ? .65 : 1);
    this.shadowLayer.clear();
    this.actionLayer.clear();
    if (a.mode === 'playing' || a.mode === 'upgrades' || a.mode === 'between') {
      this.shadowLayer.fillStyle(0x302747,.23).fillEllipse(a.pos.x,a.pos.y+17,33,9);
      this.shadowLayer.fillStyle(0xffcc51,.17).fillEllipse(a.pos.x,a.pos.y+17,19,5);
    }
    const alive = new Set<number>();
    for (const enemy of a.enemies) {
      alive.add(enemy.id);
      let img = this.enemies.get(enemy.id);
      if (!img) {
        const spriteKey = 'spr-' + enemy.type;
        const gateKey=(enemy.type==='npc'||enemy.type==='hater') ? 'ga-'+enemy.type+'-idle-0' : '';
        img = this.scene.add.image(enemy.x,enemy.y,
          this.gateA && gateKey && this.scene.textures.exists(gateKey) ? gateKey :
          this.scene.textures.exists(spriteKey) ? spriteKey : 'px-'+enemy.type+'-0').setDepth(1);
        this.enemies.set(enemy.id,img);
      }
      const bob = Math.floor((a.clock + enemy.id*77) / 260) % 2;
      const spriteKey = 'spr-' + enemy.type;
      const previous = this.previousEnemies.get(enemy.id);
      const hitNow=!!previous && enemy.hp < previous.hp;
      if (hitNow) this.hitFlashes.set(enemy.id,a.clock+105);
      const gateEnemy=this.gateA && (enemy.type==='npc'||enemy.type==='hater')
        && this.scene.textures.exists('ga-'+enemy.type+'-move-0');
      if (gateEnemy) {
        const type=enemy.type as 'npc'|'hater';
        img.setTexture(hitNow ? 'ga-'+type+'-hit-0' : gateAEnemyKey(type,a.clock,enemy.id));
      } else if (this.scene.textures.exists(spriteKey)) img.setTexture(spriteKey, bob + 2);
      else img.setTexture('px-'+enemy.type+'-'+bob);
      if (previous && Math.abs(enemy.x-previous.x)>0.15) img.setFlipX(enemy.x>previous.x);
      img.setPosition(enemy.x,enemy.y);
      if ((this.hitFlashes.get(enemy.id)??0)>a.clock) img.setTintFill(0xfff2e7);
      else img.clearTint();
      this.previousEnemies.set(enemy.id,{x:enemy.x,y:enemy.y,hp:enemy.hp,type:enemy.type});
      const boss = enemy.type === 'boss';
      this.shadowLayer.fillStyle(0x302747,boss ? .32 : .20)
        .fillEllipse(enemy.x,enemy.y+(boss?31:enemy.type==='beta'?19:13),boss?88:enemy.type==='beta'?42:29,boss?16:9);
      if (boss) {
        const w=112, x=enemy.x-w/2, y=Math.max(111,enemy.y-65), health=Phaser.Math.Clamp(enemy.hp/ENEMIES.boss.hp,0,1);
        this.actionLayer.fillStyle(0x302747,.94).fillRoundedRect(x-2,y-2,w+4,13,4);
        this.actionLayer.fillStyle(0xffebdb,1).fillRect(x,y,w,9);
        this.actionLayer.fillStyle(0xea568a,1).fillRect(x,y,Math.max(0,w*health),9);
        this.actionLayer.fillStyle(0xffcc51,1).fillRect(x+1,y+1,Math.max(0,(w-2)*health),2);
      }
      if (enemy.type==='hater' && enemy.nextShot-a.clock>0 && enemy.nextShot-a.clock<360) {
        this.actionLayer.lineStyle(2,0xe75154,.6).strokeCircle(enemy.x,enemy.y,27+(enemy.nextShot-a.clock)/40);
      }
    }
    for(const [id,img] of this.enemies) if(!alive.has(id)){
      const last = this.previousEnemies.get(id);
      if (last && a.mode === 'playing' && this.impacts.length < 24)
        this.impacts.push({x:last.x,y:last.y,until:a.clock+310,type:last.type});
      img.destroy(); this.enemies.delete(id); this.previousEnemies.delete(id); this.hitFlashes.delete(id);
    }
    this.impacts=this.impacts.filter(fx=>fx.until>a.clock);
    if (this.gateA) {
      while(this.impactSprites.length<this.impacts.length && this.impactSprites.length<24)
        this.impactSprites.push(this.scene.add.image(0,0,'ga-hit-0').setDepth(1.7));
      this.impactSprites.forEach((img,i)=>{
        const fx=this.impacts[i];
        img.setVisible(!!fx);
        if(fx){
          const index=Math.min(3,Math.floor((1-(fx.until-a.clock)/310)*4));
          img.setTexture('ga-hit-'+index).setPosition(fx.x,fx.y);
        }
      });
    } else for(const fx of this.impacts) {
      const p=1-(fx.until-a.clock)/310, radius=7+17*p;
      const color=fx.type==='npc'?0x89839e:fx.type==='beta'?0x69bfa8:0xea568a;
      this.actionLayer.lineStyle(p<.5?3:2,color,(1-p)*.65).strokeCircle(fx.x,fx.y,radius);
      for(let j=0;j<4;j++){
        const angle=j*Math.PI/2+.2;
        this.actionLayer.fillStyle(j===0?0xffcc51:color,(1-p)*.88)
          .fillRect(fx.x+Math.cos(angle)*radius-2,fx.y+Math.sin(angle)*radius-2,4,4);
      }
    }
    const atlas = this.scene.textures.exists('spr-items');
    while(this.shots.length<a.shots.length) this.shots.push(this.scene.add.image(0,0,
      this.gateA ? 'ga-shot-friendly' : atlas ? 'spr-items' : 'px-shot').setDepth(1.4));
    this.shots.forEach((img,i)=>{
      const shot=a.shots[i]; img.setVisible(!!shot);
      if(shot) {
        if (this.gateA) img.setTexture(shot.hostile?'ga-shot-hostile':'ga-shot-friendly');
        else if(atlas) img.setTexture('spr-items',shot.hostile?1:0);
        else img.setTexture(shot.hostile?'px-hostile':'px-shot');
        img.setPosition(shot.x,shot.y);
      }
    });
    while(this.drops.length<a.drops.length) this.drops.push(this.scene.add.image(0,0,this.gateA ? 'ga-xp' : atlas ? 'spr-items' : 'px-xp').setDepth(.8));
    this.drops.forEach((img,i)=>{
      const drop=a.drops[i]; img.setVisible(!!drop);
      if(drop) {
        if(this.gateA)img.setTexture('ga-xp');
        else if(atlas)img.setTexture('spr-items',2);
        img.setPosition(drop.x,drop.y-2-Math.sin(a.clock/230+i)*2);
        img.setRotation(Math.sin(a.clock/460+i)*.10);
      }
    });
    // Reusable, low-noise projectile trails: never allocate a GameObject per shot.
    if (a.mode === 'playing') {
      for (let i=0;i<a.shots.length && i<64;i++) {
        const shot=a.shots[i], angle=Math.atan2(shot.vy,shot.vx);
        this.actionLayer.fillStyle(shot.hostile ? 0xe75154 : 0xffcc51,.36)
          .fillRect(shot.x-Math.cos(angle)*11-2,shot.y-Math.sin(angle)*11-2,4,4);
        this.actionLayer.fillStyle(shot.hostile ? 0xf5bac5 : 0xfff8e7,.58)
          .fillRect(shot.x-Math.cos(angle)*5-1,shot.y-Math.sin(angle)*5-1,3,3);
      }
    }
    if (this.scene.textures.exists('spr-items')) this.orbiter.setTexture('spr-items',3);
    this.orbiter.setVisible(a.buffs['ohio-orbiter']>0);
    if(a.buffs['ohio-orbiter'])this.orbiter.setPosition(a.orb.x,a.orb.y);
  }
}
