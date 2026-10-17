import { describe, expect, it } from 'vitest';
import { Run } from './run';
import type { Choice } from './inventory';
import { distance, move as worldMove } from './world';

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

/** A deterministic player-like movement policy that avoids walking into walls.
 * Unlike the former 12-second fixed square, it collects nearby drops and kites
 * visible enemies. Enemy AI, contact damage and collision remain fully active.
 */
function guidedMovement(run: Run) {
    if (run.hp < run.maxHp * .6 &&
        run.time >= run.safeSpotReadyAt &&
        distance(run.pos, run.safeSpot) < run.safeSpot.radius - 12)
        return { x: 0, y: 0 };

    const visible = run.enemies.filter(e => e.born <= run.time && e.hp > 0 &&
        distance(e, run.pos) < 260);
    const closestDrop = run.drops.reduce<typeof run.drops[number] | undefined>((closest, d) => {
        const value = distance(run.pos, d);
        return value < 260 && (!closest || value < distance(run.pos, closest)) ? d : closest;
    }, undefined);
    const healTarget = run.hp < run.maxHp * .6 &&
        run.time >= run.safeSpotReadyAt && distance(run.pos, run.safeSpot) < 340;
    const target = healTarget ? run.safeSpot : closestDrop;
    const phase = Math.floor(run.time / 8) % 4;
    const preferred = [
        { x: 1, y: 0 }, { x: 0, y: 1 },
        { x: -1, y: 0 }, { x: 0, y: -1 },
    ][phase];
    const diagonal = Math.SQRT1_2;
    const candidates = [
        { x: 1, y: 0 }, { x: diagonal, y: diagonal }, { x: 0, y: 1 },
        { x: -diagonal, y: diagonal }, { x: -1, y: 0 },
        { x: -diagonal, y: -diagonal }, { x: 0, y: -1 },
        { x: diagonal, y: -diagonal },
    ];
    let best = preferred, bestScore = -Infinity;
    const travel = run.hero.speed * .25;
    for (const candidate of candidates) {
        const next = worldMove(run.pos, candidate.x * travel, candidate.y * travel);
        const progress = distance(run.pos, next);
        if (progress < 8) continue;
        const threatPenalty = visible.reduce((sum, e) =>
            sum + Math.pow(Math.max(0, 140 - distance(next, e)), 2) / 65, 0);
        const targetProgress = target
            ? distance(run.pos, target) - distance(next, target) : 0;
        const score = progress * .15 - threatPenalty + targetProgress * 1.6 +
            (candidate.x * preferred.x + candidate.y * preferred.y) * 5;
        if (score > bestScore) { bestScore = score; best = candidate; }
    }
    return best;
}

function simulate(hero: typeof heroes[number], seed: number, limit: number) {
    const run = new Run(hero, seed);
    // Attribute actual HP loss to the enemy that caused it; shielded/mitigated
    // hits contribute only the damage that reached player HP.
    const damageBySource: Record<string, number> = {};
    const applyHurt = run.hurt.bind(run);
    run.hurt = (raw, source, contact = false, hazard = false) => {
        const before = run.damageTaken;
        applyHurt(raw, source, contact, hazard);
        const applied = run.damageTaken - before;
        if (applied > 0) {
            const key = source?.kind ?? (hazard ? 'hazard' : 'unknown');
            damageBySource[key] = (damageBySource[key] ?? 0) + applied;
        }
    };
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
        const input = guidedMovement(run);
        if (run.aura >= 100) run.activateFlex();
        run.update(.25, input);
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
        bossDefeated: run.bossDefeated,
        damageBySource: Object.fromEntries(Object.entries(damageBySource).map(([key, value]) => [key, Number(value.toFixed(2))])),
        milestones };
}

describe('phase 4.16: guided six-minute survival QA', () => {
    for (const hero of heroes) for (const seed of seeds) {
        it(`${hero}/${seed} survives or reports real defeat deterministically`, () => {
            const first = simulate(hero, seed, 360);
            const replay = simulate(hero, seed, 360);
            expect(first).toEqual(replay);
            expect(first.seconds).toBeGreaterThan(0);
            expect(first.seconds).toBeLessThanOrEqual(360.25);
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
