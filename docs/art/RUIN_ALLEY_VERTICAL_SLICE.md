# AF-WORLD-002 — Ruin Alley / first playable map + editorial cartoon UX

**Status:** first functional map for review, NOT three full maps nor a final animation pack.

## Functional map
| Property | Implemented |
|---|---|
| World bounds | 1800 x 1320 units |
| Player start | (900,680), clear central fighting lane |
| Camera | 960 x 600 follows player; HUD remains anchored |
| Solid obstacles | Nine authored skip, crate and barrier collision boxes |
| Chasing enemies | Simple obstacle avoidance; not A* pathfinding |
| Shots | Sweep/line check so friendly and enemy projectiles hit solid props |
| Spawn | World-safe, distant from player and outside walls |
| Artwork | Original geometric paving, inked props, hand-authored signs; less neon and glare |
| Interface | Flat arcade paper/button language in cartoonV2.css, functional HTML controls |

## Modes
- Cartoon first-pass is default / ?visual=cartoon: Ruin Alley gameplay.
- ?visual=arena: legacy non-scrolling arena and existing skin.
- ?visual=legacy: prior pixel artwork and classic arena.

## Files
- src/game/core/worldMaps.ts — solid geometry, collision, spawns, projectiles.
- src/game/core/arena.ts — optional world physics; default bare Arena unit tests remain classic.
- src/game/render/ruinAlleyArt.ts — author-drawn arena art.
- src/game/render/pixelArt.ts — no old 960x600 floor when world active.
- src/game/scenes/ArenaScene.ts — camera scroll, world FX and fixed HUD.
- src/styles/cartoonV2.css — flat paper and arcade UI system; no glass gradient cards.
- public/assets/cartoon/v1/ui/ruin-alley-poster.svg — editable menu poster art.
- tests/worldMaps.test.ts and tests/browser/world-map.spec.ts — regression tests.

## Gameplay contract retained
Eight playable base characters, 5 waves, boss victory condition, 3+3 loadout, one FLEX Ultimate, affinities, mobile input, local saves. No fictitious coins, map selector, separate FOCUS, Aura Core, Mastery or miniboss features.

## Mandatory validation before merging
- npm ci
- npm run typecheck
- npm test
- npm run build
- npm run test:browser
- Manually test a complete 5-wave run, all nine obstacles, all four map edges, mobile joystick/FLEX and pause.
- Manual visual QA: screenshots before/after, FPS at 90 enemies, readability and touch controls.

## Explicitly deferred
- Crown Chamber and Toxic Rooftop are not implemented.
- Eight directional hero animation atlases, fully distinctive silhouettes and final sprite master art.
- Map selection, A* pathfinding, minibosses, Aura Cores, new evolution rules and permanent Mastery.
- This slice deliberately avoids claiming final art quality.

**CI note:** GitHub Actions may be quota-limited. Tests are committed but should only be called passed after local runner evidence.