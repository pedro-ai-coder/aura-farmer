# Visual Runtime Slice — Batch B1 · art preview
Date: 2026-10-12

**Branch scope:** artwork integration before any backend work. The concept boards in the project were supplied as flattened AI-art direction images with multiple entities and editorial labels. They are **not** shippable, transparent per-frame sprite atlases and cannot honestly be described as final animation assets. Do not slice them indiscriminately into production frames.

## Implemented
- An original *editable SVG still* preview pack based on the approved visual vocabulary: Sigma farmer, Witherroot NPC, Aurabud Hater, Thornling Beta and Witherroot Colossus boss.
- Matching XP, friendly/hostile shots, aura accent and arena illustration.
- Runtime loading isolated to `?runtimeArt=1` (e.g. a Vercel branch-preview URL with that query).
- Non-preview sessions continue using established original Sigma B1 / Alpha B2 / Rizzler B3 animation atlases and current enemy textures.
- Texture-key feature-gate and fallback: no simulation, collision, HP, scoring or persistence changes.
- Subtle squash/bob only (presentation). No claim that these **static images** constitute an artist-created animation spritesheet.
- Browser tests verify gate, textures and existing controls.

## Still required for final asset sign-off
1. Export source-accurate transparent character animation frame sequences (idle/move/hurt/flex/death) and their metadata. Existing high-quality sprite production rules in `docs/SPRITE_PRODUCTION_P0.md` apply.
2. Create original enemy animation atlases (idle/move/hit/death); an animated Colossus boss with attack windup, hit and death.
3. Produce cap-limited sprite-frame VFX: slash, heal, spawn telegraph, Aura Burst, enemy death. These static interim SVGs do not replace those atlases.
4. Produce aligned terrain/props tiles and keep enemies readable in large swarms; revise decorative world if too busy.
5. Validate Android landscape and low-end performance. Owner signs off before enabling `runtimeArt` by default.

## Validation
`npm ci && npm run typecheck && npm test && npm run build && npm run test:browser`
Run browser tests on the ordinary route *and* `/?runtimeArt=1`. Compare density in five-wave combat (up to 90 enemies). Backend PR #18 stays untouched.
