# Aura Farmer v0.3 — Brainrot Invasion (Content Spec)

Status: APPROVED FOR DEVELOPMENT. Implement through short reviewable Codex PRs from the latest `main`. AF-008 (#7) remains useful but is not a blocker; if it is developed in parallel, coordinate changes touching Arena and HUD to avoid conflicts.

The current live version is solo, English UI, Phaser 3 + TS + Vite, five 50-second waves, 90-enemy hard cap, Android touch layout and desktop keyboard controls. Preserve all of these. There is already an existing `Six Seven` buff; do not duplicate it.

## Goals

- Raise the active buff pool from 10 to **16**.
- Introduce 3 new enemy types (Yap Goblin, Ohio Glitch, Fanum Thief), keeping the existing three and Big Hater boss.
- Introduce two wave events: Fanum Tax Raid, Six Seven Surge.
- Make builds interesting by adding distinct attack/defense/sustain/crowd-control mechanics.
- Events must be understandable at a glance on portrait mobile and must not spawn unfair, untelegraphed damage.
- No new currency, shop, backend, multiplayer or original art dependency in this milestone.

## New buff catalog (English game text)

All entries must be defined in the existing data-driven `src/game/data/buffs.ts` catalog, including rarity and max stacks. Numbers are starting playtest hypotheses, not final balance.

| Buff ID | In-game name | Rarity | Max stacks | Mechanic / player-facing description |
| --- | --- | --- | --- | --- |
| `crash-out` | Crash Out | RARE | 1 | When HP <= 35% of max HP: +40% damage dealt, +20% incoming damage. "Low HP, high chaos. +40% damage, but +20% damage taken." |
| `skibidi-bounce` | Skibidi Bounce | EPIC | 1 | Non-hostile projectiles that hit an enemy may bounce exactly once to the closest *different* enemy within 145px; new hit deals 55% of previous projectile damage. Prevent bounce chains, self hits, and double-hitting the original enemy. "Your shots bounce once for 55% damage." |
| `delulu` | Delulu Is the Solulu | EPIC | 1 | Prevent one lethal hit per wave, leave player at 1 HP and give 1.25 seconds invulnerability. Reset charge only on entering a new wave, not from opening upgrades. "Ignore one fatal hit per wave." |
| `touch-grass` | Touch Grass | COMMON | 1 | After 8 continuous combat seconds without taking damage, heal 2 HP every 5 seconds up to current max HP. No healing while between waves/in upgrades. "Heal slowly after avoiding damage." |
| `mogged` | Mogged | COMMON | 2 | +15% damage per stack on the first player hit received by each enemy (full-health condition). Must work on bosses without duplicating procs. "First hit on an enemy deals +15% damage." |
| `rizz-aura` | Rizz Aura | RARE | 1 | Every 12 kills, pulse and slow enemies within 145px by 25% for 2.5 seconds. Bosses may be slowed up to 15%. "Every 12 kills, slow nearby enemies." |

**Existing synergy**: when `Six Seven` and `Skibidi Bounce` are both equipped, all seven existing Six Seven radial projectiles are eligible for a single bounce. Display a small "ULTIMATE 67" message on the first volley after the combination is acquired; do not create an extra active ability.

Engineering: `combatStats` should provide derived stats where appropriate; special effects must be in reusable simulation helpers (Phaser-free) rather than deeply embedding UI. Ensure all upgrades remain obtainable through the existing level-up choice system. Do not change existing 10 buff IDs or base numbers.

## Enemy roster

Each new enemy must have its own recognizable procedurally drawn silhouette/color and readable telegraph.

| Enemy type | Role | First appears | Proposed base stats | Behavior |
| --- | --- | --- | --- | --- |
| `yap-goblin` | cone-control | Wave 2 | HP 45, speed 48, contact damage 7, XP 12 | Stops/turns to aim a clearly drawn 65° cone of range 170px, telegraphs >= 0.7s, then emits one damage pulse (8 HP) every >=3.5s. Can be dodged, single damage evaluation per pulse. |
| `ohio-glitch` | repositioning | Wave 3 | HP 42, speed 54, contact damage 8, XP 14 | Every >=6s (when in range) flashes with a 0.5s telegraph and relocates <=110px toward the player; never directly on the player (keep >=130px separation on landing), never outside arena bounds. |
| `fanum-thief` | loot predator | Event wave 2 (and optional later) | HP 55, speed 95, contact damage 5, XP 15 | Prioritizes loose XP crystals, accumulating `stolenXp` (capped at 30 XP). On defeat, drops XP equal to all crystals it stole. Event thief escapes at its event timeout. Never remove XP already held by the player. |

Spawn balancing: cap total enemy count at existing `GAME.maxEnemies` (90). No teleports inside character hitbox, sudden unavoidable AoE, or offscreen immortal enemies. Existing boss remains Big Hater, unchanged except for compatibility with buffs.

## Timed events (one per run, fixed and deterministic initial schedule)

Events take place while the game continues: do not pause combat for events. Use ACTIVE SIMULATION time (frozen when upgrades/intermission pauses); all timers must reset on restart. Provide a brief high-contrast event banner, sound hook without copyrighted clips, countdown/progress HUD visible on mobile. Events shall be data-driven, using a small `EventDirector` or equivalent pure-core module.

### Fanum Tax Raid — wave 2, active second 18

- Spawn exactly one special `fanum-thief` with warning and distinct icon. Starts a 15s escape timer.
- While alive, thief seeks and collects loose XP drops; tracks `stolenXp` (<=30).
- If defeated before the deadline, drop the stolen XP again and grant +20 Aura once, plus enemy's regular XP drop. Say "FANUM TAX REFUNDED!".
- If timer expires, remove this thief (and only its stolen XP), say "FANUM TAX PAID 💀"; never take player inventory/XP levels.
- The event ends exactly once; no double payout, no carried state after restart or wave transition.
- If under enemy cap pressure, prioritize this single thief.

### SIX SEVEN SURGE — wave 3, active second 7

- Show "SIX SEVEN!" and 2s pre-attack warning; dramatic but short, nonblocking.
- Schedule 7 batches of 6 specially tagged NPCs over approximately 14s (42 attempts). Spawn only within the global 90-enemy cap; defer rather than instantly flood if crowded. Existing ambient spawn may be throttled.
- Track surge-tagged enemies eliminated. Goal: kill 20 for +25 Aura, awarded once, with "SIX SEVEN CERTIFIED!" message.
- Fairness: if the global cap or short wave remaining time prevents at least 20 surge enemies from appearing, adjust goal to the number of surge enemies actually spawned (never award for 0 kills) and clearly update HUD. No impossible objective.
- Event terminates on completing the objective or when the wave ends; never reward twice. Existing Six Seven buff can still activate by kill count.
- Keep important attack warnings and player readable, especially at 390x844 and 844x390.

## Scope breakdown for Codex

Use 3 small PRs from freshly updated `main`, in this order:
1. Content core: buff definitions, implementations, tests (including Ultimate 67 interaction).
2. Enemies: AI state/telegraphs, XP recovery and procedural visuals, tests.
3. Events: timing and UI, + mobile and desktop Playwright tests, playtest tuning.

Run `npm run typecheck`, `npm test`, `npm run build`, `npm run test:browser` on each PR before merging. Do not bypass CI. Preserve English UI and touch controls.

## Required tests

- Correct buff rarity/stack limit; all six selectable through normal upgrades; crit/fire-rate calculations unchanged without new buffs.
- Crash Out incoming/outgoing conditional; Delulu once per wave + invulnerability; Touch Grass uses active time and clamps heal; Mogged triggers exactly once per enemy; bounce never chains.
- Enemy AI deterministic under injected RNG, telegraphs before hitting, no glitch jump within safe distance, thief cannot steal already collected XP.
- Events once per expected wave/time; pause freezes event clock; restart resets all event state; cap never exceeds 90; event rewards once; spawn-pressure fallback makes surge achievable.
- Playwright: desktop input remains intact, mobile PLAY/FLEX/FOCUS/upgrade still work, clear event HUD in portrait + landscape, run survives full 5-wave lifecycle without exceptions.
- Human QA: one desktop and one real Android run; record readability, approximate FPS, difficulty, whether events feel fair.

## Deferred ideas / next release

- Rizz Check objective zone.
- The Algorithm final boss.
- Two more buffs: `Brainrot Overload` (high fire-rate tradeoff) and `Fanum Tax Deal` (XP tradeoff).
- Deep visual refresh, cosmetics, co-op and Discord integration.
