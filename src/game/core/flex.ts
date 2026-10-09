import { GAME } from './constants';
import { clamp } from './math';

export type FlexState = 'ready' | 'charging' | 'cooldown';
export type FlexResult = 'waiting' | 'success' | 'no-audience' | 'interrupted';
export class FlexSystem {
  state: FlexState = 'ready';
  startedAt = 0;
  cooldownUntil = 0;

  tryStart(now: number): boolean {
    if (!this.isReady(now)) return false;
    this.startedAt = now;
    this.state = 'charging';
    return true;
  }
  isReady(now: number): boolean {
    return this.state === 'ready' || (this.state === 'cooldown' && now >= this.cooldownUntil);
  }
  interrupt(now: number): FlexResult {
    if (this.state !== 'charging') return 'waiting';
    this.end(now);
    return 'interrupted';
  }
  update(now: number, nearbyEnemies: number): FlexResult {
    if (this.state === 'cooldown' && now >= this.cooldownUntil) this.state = 'ready';
    if (this.state !== 'charging' || now - this.startedAt < GAME.flexDurationMs) return 'waiting';
    this.end(now);
    return nearbyEnemies >= 3 ? 'success' : 'no-audience';
  }
  progress(now: number): number {
    return this.state === 'charging' ? clamp((now - this.startedAt) / GAME.flexDurationMs, 0, 1) : 0;
  }
  secondsUntilReady(now: number): number {
    return this.isReady(now) ? 0 : Math.ceil((this.cooldownUntil - now) / 1000);
  }
  private end(now: number): void {
    this.state = 'cooldown';
    this.cooldownUntil = now + GAME.flexCooldownMs;
  }
}
