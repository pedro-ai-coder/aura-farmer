# Visual V5 — Ruin Alley Environment Grounding

**Source:** GDD Annex A.7 and the approved Ruin Alley asset `public/assets/cartoon/option-a-v1/maps/ruin-alley.png`. **Option A — Cartoon Arcade** remains the chosen art direction.

## Real issue and minimal approved-asset change

Ruin Alley already has a fully illustrated floor/background, but the two actual blocking covers and the actors were not using one coherent ground-contact shadow language. Props floated perceptually on the illustration while hero/enemy shadows differed in opacity and offset.

The V5 graphics pass makes them visually grounded:
- Creates one cached, static Phaser Graphics layer below the actors, using **only the two true cover centers/radii from `src/game/simulation/world.ts`**. Each receives a restrained navy ground-contact ellipse and warm-paper rim. The actual collision circles are unchanged and remain authoritative.
- Draws one unified world-space contact shadow underneath active hero and enemies using their actual foot position and radius, with bounds to prevent huge boss shadows from hiding threats.
- Reuses the existing `ruin-alley.png` and the approved enemy-atlas cover artwork, with exactly the same master image dimensions, world coordinates, sprite pivots, cover physics, rendering camera and movement.
- Creates no new graphic files or atlas art, background landmarks, new solid walls, arena variants, HUD panels, maps, enemy behavior or paid dependencies.

## Test evidence

`tests/environment-vfx.test.ts` checks that cached cover shading uses the exact world positions/radii (and remains non-walkable), that no additional obstacles are invented, that shadows are clamped and that collision data is never mutated.

`tests/browser/v5-ruin-alley.spec.ts` verifies on a real Phaser game that the static layer exists below the actors, that Ruin Alley remains 1448 × 1086, two visible cover props correspond to the two actual physical blockers, and mobile landscape keeps a usable touch zone. These tests capture two real screenshots at **1280×720 desktop** and **915×412 landscape mobile** in `test-results/`.

The **old GDD world-size reference 1800 × 1320 is not a runtime dimension**; this pass retains the already validated 1448 × 1086 approved image and current world geometry. Player movement, attacks, physics, line-of-sight, and enemy navigation are not changed.

## Known gaps / acceptance

- Actual map master still has fixed painted environmental detail; adding arbitrary sprite props without colliders would violate A.7. Any *new illustrated* object or extra cover needs separate owner design/art authorization and, where appropriate, a separate gameplay PR.
- The actor shadows are screen-space artwork in world coordinates, **not** independent physical colliders.
- The V4 HUD/menus PR is a separate independent change. This branch starts from merged V3 `main` and should be merged **only after explicit owner approval**, with conflicts checked against future merged visual branches.
- Dense-wave visibility and actual device FPS remain V6 checks. This pass alone does not certify a polished playable demo.

### Final gates
- [ ] TypeScript, Vitest, production build
- [ ] Full Playwright Chromium, both real screenshots inspected
- [ ] Secret exposure audit and Vercel Ready on exact head
- [ ] No regression in cover collision, walkability, bullet occlusion, fullscreen/touch
- [ ] Owner visual acceptance and explicit approval before merge
