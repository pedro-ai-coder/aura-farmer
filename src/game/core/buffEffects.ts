import { distance, type Vec2 } from './math';

export interface BuffTarget extends Vec2 {
  id: number;
  hp: number;
  playerHit?: boolean;
  rizzSlowUntil?: number;
}
export interface BounceState { hostile: boolean; damage: number; bounced?: boolean; targetId?: number }

/** Choose once at impact; a bounced projectile can hit only its selected target. */
export function findBounce<T extends BuffTarget>(shot: BounceState, origin: T, enemies: T[]): T | undefined {
  if (shot.hostile || shot.bounced) return undefined;
  let closest: T | undefined;
  let radius = 145;
  for (const enemy of enemies) {
    if (enemy.id === origin.id || enemy.hp <= 0) continue;
    const d = distance(origin, enemy);
    if (d <= radius && (!closest || d < radius)) { closest = enemy; radius = d; }
  }
  return closest;
}

export function firstHitDamage(enemy: BuffTarget, maxHp: number, damage: number, stacks: number): number {
  const first = !enemy.playerHit && enemy.hp === maxHp;
  enemy.playerHit = true;
  return damage * (first ? 1 + stacks * .15 : 1);
}

export function rizzPulse(enemies: BuffTarget[], origin: Vec2, now: number): void {
  for (const enemy of enemies) {
    if (enemy.hp > 0 && distance(origin, enemy) <= 145) enemy.rizzSlowUntil = now + 2500;
  }
}

export function rizzSpeed(enemy: BuffTarget, isBoss: boolean, now: number): number {
  return now < (enemy.rizzSlowUntil ?? 0) ? (isBoss ? .85 : .75) : 1;
}

/** Per-run effects. Caller supplies active simulation time, never wall time. */
export class BuffEffects {
  deluluUsed = false;
  invulnerableUntil = 0;
  rizzPulseUntil = 0;
  ultimate67Announced = false;
  private nextHealAt: number | undefined;

  beginWave(): void {
    this.deluluUsed = false;
    this.invulnerableUntil = 0;
    this.rizzPulseUntil = 0;
  }

  receiveDamage(hp: number, damage: number, now: number, delulu: boolean) {
    if (now < this.invulnerableUntil) return { hp, ignored: true, saved: false };
    if (delulu && !this.deluluUsed && damage >= hp) {
      this.deluluUsed = true;
      this.invulnerableUntil = now + 1250;
      return { hp: 1, ignored: false, saved: true };
    }
    return { hp: Math.max(0, hp - damage), ignored: false, saved: false };
  }

  tookDamage(now: number): void { this.nextHealAt = now + 8000; }

  heal(hp: number, maxHp: number, now: number, lastDamageAt: number, enabled: boolean): number {
    if (!enabled) { this.nextHealAt = undefined; return hp; }
    // First tick after eight clean seconds, then every five. No retroactive ticks on acquisition.
    this.nextHealAt ??= Math.max(now, lastDamageAt + 8000);
    this.nextHealAt = Math.max(this.nextHealAt, lastDamageAt + 8000);
    if (now < this.nextHealAt) return hp;
    const ticks = 1 + Math.floor((now - this.nextHealAt) / 5000);
    this.nextHealAt += ticks * 5000;
    return Math.min(maxHp, hp + ticks * 2);
  }

  volleyMessage(bounceEquipped: boolean): string {
    if (bounceEquipped && !this.ultimate67Announced) {
      this.ultimate67Announced = true;
      return 'ULTIMATE 67';
    }
    return 'SIX SEVEN!';
  }
}
