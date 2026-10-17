import { describe, expect, it } from 'vitest';
import { Run } from './run';
import type { Choice } from './inventory';

const heroes = ['sigma', 'cool-kid', 'alpha'] as const;
const seeds = [47001, 47002, 47003] as const;
const defensive = new Set(['thick-skin', 'built-different', 'certified-w', 'big-chad', 'homie-check', 'so-back', 'too-sigma']);
const areaWeapons = new Set(['brainrot-feed', 'touch-grass', 'personal-space']);

function choiceScore(c: Choice, run: Run): number {
    if (c.kind === 'heal') return run.hp < run.maxHp * .4 ? 150 : -20;
    if (c.kind === 'shield') return run.hp < run.maxHp * .4 ? 95 : -10;
    const item = c.item;
    if (!item) return -100;
    let score = c.kind === 'weapon' ? 45 : 20;
    if (c.action === 'upgrade') score += 15;
    if (c.action === 'new') score += 12;
    if (defensive.has(item.id)) score += run.hp < run.maxHp * .65 ? 75 : 25;
    if (areaWeapons.has(item.id)) score += 35;
    if (c.kind === 'weapon' && run.inventory.weapons.length < 3) score += 12;
    if (c.kind === 'passive' && run.inventory.passives.length < 5) score += 8;
    return score;
}

function simulate(hero: typeof heroes[number], seed: number, limit: number) {
    const run = new Run(hero, seed);
    let ticks = 0;
    let selections = 0;
    const milestones: { second: number; wave: number; hp: number; level: number; weapons: number; passives: number }[] = [];
    let nextMilestone = 60;
    while (run.time < limit && run.mode !== 'lost' && run.mode !== 'won') {
        if (run.mode === 'upgrade') {
            const ranked = run.choices.map((c, index) => ({ index, score: choiceScore(c, run) }))
                .sort((a, b) => b.score - a.score || a.index - b.index);
            let chosen = false;
            for (const { index } of ranked) {
                const choice = run.choices[index];
                const replaceId = choice.kind === 'weapon' ? run.inventory.weapons[0]?.id : run.inventory.passives[0]?.id;
                if (run.choose(index, choice.action === 'replace' ? replaceId : undefined)) {
                    chosen = true;
                    selections++;
                    break;
                }
            }
            if (!chosen) throw new Error(`No legal upgrade: ${hero}/${seed}`);
            continue;
        }
        if (run.mode === 'legendary') { run.deferLegendary(); continue; }
        if (run.mode !== 'playing') throw new Error(`Unexpected mode: ${run.mode}`);
        const phase = Math.floor(run.time / 12) % 4;
        const move = [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 0, y: -1 }][phase];
        if (run.aura >= 100) run.activateFlex();
        run.update(.25, move);
        if (++ticks > limit * 5 + 100) throw new Error('Simulation stalled');
        if (run.time >= nextMilestone) {
            milestones.push({ second: nextMilestone, wave: run.wave, hp: Math.round(run.hp), level: run.level,
                weapons: run.inventory.weapons.length, passives: run.inventory.passives.length });
            nextMilestone += 60;
        }
    }
    return { hero, seed, seconds: Number(run.time.toFixed(2)), wave: run.wave, outcome: run.mode,
        level: run.level, hp: Number(run.hp.toFixed(2)), kills: run.kills, xp: run.xpCollected,
        damageTaken: Number(run.damageTaken.toFixed(2)), damageDealt: Number(run.damageDealt.toFixed(2)),
        healing: Number(run.healing.toFixed(2)), flex: run.flexCount, shields: Number(run.protection.toFixed(2)),
        selections, weapons: run.inventory.weapons.map(i => i.id), passives: run.inventory.passives.map(i => i.id),
        bossDefeated: run.bossDefeated, milestones };
}

describe('phase 4.12: adaptive-build early-wave balance', () => {
    for (const hero of heroes) for (const seed of seeds) {
        it(`${hero}/${seed} survives or reports real defeat deterministically`, () => {
            const first = simulate(hero, seed, 180);
            const replay = simulate(hero, seed, 180);
            expect(first).toEqual(replay);
            expect(first.seconds).toBeGreaterThan(0);
            expect(first.seconds).toBeLessThanOrEqual(180.25);
            expect(first.weapons.length).toBeLessThanOrEqual(3);
            expect(first.passives.length).toBeLessThanOrEqual(5);
            expect(first.damageTaken).toBeGreaterThanOrEqual(0);
            if (first.outcome === 'won') expect(first.bossDefeated).toBe(true);
            console.info('[adaptive-balance-early]', JSON.stringify(first));
        }, 60_000);
    }
});

describe.skipIf(process.env.AURA_ADAPTIVE_FULL_QA !== '1')('phase 4.12: full-length adaptive builds', () => {
    for (const hero of heroes) for (const seed of seeds) {
        it(`${hero}/${seed} full attempt`, () => {
            const result = simulate(hero, seed, 1200);
            console.info('[adaptive-balance-full]', JSON.stringify(result));
            expect(result.seconds).toBeGreaterThan(0);
            expect(['playing', 'won', 'lost']).toContain(result.outcome);
            if (result.outcome === 'won') expect(result.bossDefeated).toBe(true);
        }, 120_000);
    }
});
