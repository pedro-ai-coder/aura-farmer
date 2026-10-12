# Gate A — Aura Arena (playable visual test)

**Branch**: feature/gate-a-aura-arena-playable
**URL toggle**: ?gateA=1
**Scope**: visual-only. PR is review-only; DO NOT merge without game director approval.

## What is genuinely integrated
- New author-controlled, native-pixel (48x48) Sigma key poses, animated by the existing live game state: idle4 / move6 / hurt2 / FLEX charge4 / success3 / death6.
- Two 48x48 rivals, NPC and Hater, idle/move/hit/death studies: caricatured opponents, **not** vegetable/forest enemies.
- Modular 32px stage paint, desaturated slate arena with peripheral caution stripes and geometric decals, empty central combat surface.
- Green XP pickup, differentiable friendly/hostile shots, a four-frame hit/shock sprite.
- Separate preview identity for home/selection/loading and navigation labels, no botany or fake global event.
- Correctly gated by URL; visiting without ?gateA=1 continues to use shipped visual textures. The currently shipped hero/enemy sheets remain available.
- No backend, input, RNG, hitbox, spawning, score or timing changes.

## Intentionally not "final"
This is a Gate A playable **pixel-art study authored in code**. It is NOT an Aseprite hand-drawn production master or an approved animation atlas; no assertion that an independent human artist painted sprites. Alpha Chad, Rizzler, Ohio, Fanum, Six Seven, Beta and boss continue using their current gameplay art; their redesign comes after Gate A approval. The old menu style still appears in non-preview URLs.

## Acceptance
- Actual preview must display ga-floor, ga-sigma, ga-npc, ga-hater and ga-xp; compare in a running game at 960x600 and 844x390.
- Recognizable silhouettes, no nonfunctional farming motifs. The Hater bullet should stand apart from the XP pickup in color and shape.
- Five-wave run, pause/resume, upgrade and keyboard/mobile actions remain unchanged.
- 90 enemy render performance and browser CI. Avoid accidental changes to main.

### Fullscreen texture restoration (iteration 3)
- Refresh native CanvasTexture assets on fullscreenchange/WebGL context restoration.
- Verify texture keys **and individual sprite-sheet frames** for player, enemy, pickup, projectile, hit and Ohio Orbiter images; restore a known fallback instead of Phaser's black/green missing-texture square.
- Test invalidated Gate A frames, fullscreen/exit transitions and 2-dimensional rendering with live enemy death hit effect.
