import type { EnemyKind } from '../catalog/enemies';
import type { Point } from './world';
export interface Enemy extends Point {
    id: number;
    kind: EnemyKind;
    hurtAt: number;
    attackPose?: { start: number; impact: number; end: number; angle: number };
    hp: number;
    maxHp: number;
    damage: number;
    radius: number;
    elite: boolean;
    born: number;
    nextAttack: number;
    nextAux: number;
    contactAt: number;
    angle: number;
    slow: number;
    slowUntil: number;
    weaken: number;
    weakenUntil: number;
    shield: number;
    shieldUntil: number;
    phase: number;
    stagger: number;
    staggerUntil: number;
    staggerLocked: number;
    staggerWindow: number;
    staggerAdded: number;
    regenAt: number;
    chargeUntil: number;
    chargeAngle: number;
}
export interface Projectile extends Point {
    at?: number;
    id: number;
    angle: number;
    speed: number;
    remaining: number;
    damage: number;
    radius: number;
    hostile: boolean;
    source: number;
    weapon: string;
    activation: number;
    pierce: number;
    hit: number[];
    primary: boolean;
}
export interface Area extends Point {
    id: number;
    shape: 'circle' | 'cone' | 'line' | 'ring';
    radius: number;
    width: number;
    angle: number;
    arc: number;
    at: number;
    end: number;
    nextTick: number;
    damage: number;
    hostile: boolean;
    source: number;
    weapon: string;
    activation: number;
    primary: boolean;
    hit: number[];
    label: string;
    start: number;
    gap?: number;
    maxHits?: number;
    weaponPower?: number;
}
export interface Drop extends Point {
    id: number;
    xp: number;
    /** Omitted for standard Aura/XP crystals. */
    kind?: 'snack' | 'magnet';
}
export interface Shield {
    amount: number;
    until: number;
}
export interface Effect extends Point {
    id: number;
    kind: 'hit' | 'heal' | 'shield' | 'flex' | 'level' | 'attack';
    until: number;
    text?: string;
    radius: number;
}
export interface Input {
    x: number;
    y: number;
    aim?: Point;
    manual?: boolean;
    flex?: boolean;
}
export type RunMode = 'playing' | 'upgrade' | 'legendary' | 'paused' | 'won' | 'lost';
