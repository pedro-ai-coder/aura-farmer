import type { EnemyPose } from './enemy-animation';

/** Small local orientation marker for attacks that already have a real
 * simulation windup and impact deadline. Presentation only: never schedules
 * damage, moves an enemy, or invents a new warning window.
 */
export interface EnemyTelegraph {
    angle: number;
    radius: number;
    progress: number;
    kind: 'windup' | 'impact';
    boss: boolean;
}

const CHARGED_KINDS = new Set([
    'hater', 'ratio-ram', 'doomscroller', 'ping-sniper',
    'reply-guy', 'mod-supremo', 'ohio-express', 'doomscroll-prime', 'boss',
]);

export function enemyTelegraph(pose: EnemyPose, time: number): EnemyTelegraph | undefined {
    const { enemy } = pose;
    const attack = enemy.attackPose;
    if (!attack || !CHARGED_KINDS.has(enemy.kind) || time < attack.start ||
        time >= attack.end || !['windup', 'impact'].includes(pose.state)) return;
    const windup = Math.max(0, attack.impact - attack.start);
    return {
        angle: attack.angle,
        radius: enemy.radius + (enemy.kind === 'boss' ? 17 : 10),
        progress: pose.state === 'impact' ? 1 : windup ? Math.max(0, Math.min(1, (time - attack.start) / windup)) : 1,
        kind: pose.state,
        boss: enemy.kind === 'boss',
    };
}
