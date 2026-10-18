import type { EnemyKind } from '../catalog/enemies';

/** Weighted enemy eligibility for solo wave spawns.
 * Later waves retain all eligible enemies while limiting the proportion of
 * overlapping ground hazards and long-distance snipers.
 */
export function weightedSpawnPool(pool: readonly EnemyKind[], wave: number, time: number): EnemyKind[] {
    if (wave === 1 && time >= 90)
        return ['npc', 'npc', 'npc', 'npc', 'npc', 'npc', 'npc', 'hater'];
    if (wave === 2)
        return [...pool.filter(k => k !== 'hater'), ...pool.filter(k => k !== 'hater'), 'hater'];
    if (wave >= 3)
        // Haters remained at full roster weight on wave three, undoing the
        // early-wave ranged-pressure reduction. Keep all ranged/hazard threats
        // present but do not double their spawn share.
        return pool.flatMap(k => k === 'doomscroller' || k === 'ping-sniper' || k === 'hater'
            ? [k] : [k, k]);
    return [...pool];
}
