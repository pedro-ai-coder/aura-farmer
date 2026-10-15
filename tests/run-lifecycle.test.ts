import { describe, expect, it } from 'vitest';
import { CAPS, HEROES } from '../src/game/catalog/content';
import { distance } from '../src/game/simulation/world';
import { Run } from '../src/game/simulation/run';
import { readSave, recordResult } from '../src/browser/save';

/** Protected-player fixture: real clock, spawns, weapons, drops and legal offers.
 * This verifies integration through all waves, NOT survival balance or a human playtest.
 */
describe('phase 1 closeout — continuous seeded lifecycle', () => {
    for (const hero of HEROES)
        it(`${hero.id}: progresses continuously through five waves, resolves boss and resets`, () => {
            const r = new Run(hero.id, 451);
            r.hurt = () => {}; // Isolate progression from the later difficulty/playtest phase.
            const waves = new Set<number>();
            let choices = 0, legendary = 0;
            for (let frame = 0; frame < 6000 && r.mode !== 'won'; frame++) {
                if (r.mode === 'legendary') {
                    // Exercise promotion of each hero's starter, without granting a fourth slot.
                    const index = r.choices.findIndex(c => c.item?.id === hero.starter);
                    expect(r.choose(index)).toBe(true); legendary++;
                }
                else if (r.mode === 'upgrade') {
                    const index = r.choices.findIndex(c => c.kind === 'weapon' && c.action === 'new');
                    const selected = index >= 0 ? index : 0;
                    const choice = r.choices[selected];
                    const list = choice.kind === 'weapon' ? r.inventory.weapons : r.inventory.passives;
                    expect(r.choose(selected, list[0]?.id)).toBe(true); choices++;
                }
                else {
                    const drop = [...r.drops].sort((a, b) => distance(a, r.pos) - distance(b, r.pos))[0];
                    const target = drop ?? r.target() ?? { x: 724, y: 610 };
                    const angle = Math.atan2(target.y - r.pos.y, target.x - r.pos.x);
                    // A small deterministic steering offset prevents the controller sticking to cover.
                    const steer = angle + .5 * Math.sin(r.time * 2);
                    r.update(.25, { x: Math.cos(steer), y: Math.sin(steer), flex: true });
                }
                waves.add(r.wave);
                expect(r.inventory.weapons.length).toBeLessThanOrEqual(3);
                expect(r.inventory.passives.length).toBeLessThanOrEqual(5);
                for (const item of [...r.inventory.weapons, ...r.inventory.passives])
                    expect(item.level).toBeLessThanOrEqual(CAPS[item.rarity]);
                expect(Number.isFinite(r.hp + r.xp + r.aura + r.damageDealt)).toBe(true);
                if (r.time >= 1200 && r.mode === 'playing') break;
            }
            expect([...waves]).toEqual([1, 2, 3, 4, 5]);
            expect(r.time).toBeGreaterThanOrEqual(900);
            expect(choices).toBeGreaterThan(0); expect(legendary).toBe(1);
            expect(r.xpCollected).toBeGreaterThanOrEqual(560);
            expect(r.damageDealt).toBeGreaterThan(0); expect(r.flexCount).toBeGreaterThan(0);
            // Resolve surviving boss explicitly: this fixture makes no claim about player DPS viability.
            if (r.mode !== 'won') {
                expect(r.boss).toBeDefined();
                r.hitEnemy(r.boss!, 1e9);
            }
            expect(r.mode).toBe('won');
            const save = recordResult(readSave({ getItem: () => null, setItem: () => {} }), r, hero.id);
            expect(save.wins).toBe(1); expect(save.results[0].hero).toBe(hero.id);
            const fresh = new Run(hero.id, 451);
            expect(fresh.inventory.weapons).toHaveLength(1); expect(fresh.inventory.passives).toHaveLength(0);
            expect(fresh.aura).toBe(0); expect(fresh.level).toBe(1); expect(fresh.kills).toBe(0);
        }, 120000);
});
