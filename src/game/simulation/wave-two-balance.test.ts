import { describe, expect, it } from 'vitest';
import { WAVES, WAVE_SECONDS, BOSS_START } from '../catalog/content';

describe('phase 4.14: second-wave difficulty adjustment', () => {
    it('eases wave-two pressure without weakening its health scaling', () => {
        expect(WAVES[1].hp).toBe(1.3);
        expect(WAVES[1].damage).toBe(.88);
        expect(WAVES[1].density).toBe(1);
        expect(WAVES[1].damage).toBeGreaterThan(WAVES[0].damage);
        expect(WAVES[1].density).toBeGreaterThan(WAVES[0].density);
        expect(WAVES[2].damage).toBeGreaterThan(WAVES[1].damage);
        expect(WAVES[2].density).toBeGreaterThan(WAVES[1].density);
    });
    it('preserves wave duration, boss timing, and later-wave progression', () => {
        expect(WAVES).toHaveLength(5);
        expect(WAVE_SECONDS).toBe(180);
        expect(BOSS_START).toBe(900);
        expect(WAVES[1].weights).toEqual([70, 28, 2]);
        expect(WAVES[2].hp).toBe(1.65);
        expect(WAVES[3].damage).toBe(1.35);
        expect(WAVES[4].damage).toBe(1.58);
    });
});
