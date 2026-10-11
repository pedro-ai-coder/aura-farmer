# Art Sprint B2 — Alpha Chad

**Status:** Integrated in feature branch, pending CI/Android review.
**Scope:** The Alpha Chad playable character (only), Lavender Pop Arcade Art Bible.

## Art package

- `public/assets/pixel/alpha-b2.png`: **31 frames, 48×48 native pixels**, RGBA-transparent indexed PNG (1488×48 sheet).
- `public/assets/pixel/alpha-portrait.png`: independent 48×48 character-select/home portrait, larger quiff, angular face, tank body and chest badge.
- `public/assets/pixel/alpha-b2.json`: animations, frame offsets and frame rates.
- `src/game/render/alphaB2.ts`: runtime frame selector.
- `art/source/alpha/generate.mjs`: **editable original deterministic generation source**; run `node art/source/alpha/generate.mjs` from repository root to regenerate PNGs.

No third-party art or fonts. These are original code-authored pixel bitmaps and are **not** being represented as externally commissioned artwork or hand-painted Aseprite masters. A layered `.aseprite` source and artist refinement remain follow-up quality work.

## Character direction

Broad heroic/tank silhouette, orange/golden training vest, oversized fists/wristbands, tawny skin, angular brown quiff and pronounced jaw, gold lightning crest. Character must remain visually different from dark-hoodie Sigma even at 48px.

| Pose | Frames | Timing |
|---|---|---|
| idle | 0–3 | 175ms |
| move | 4–9 | 95ms |
| punch | 10–15 | 28ms (single 160ms melee hit) |
| flex_charge | 16–19 | 155ms |
| flex_success | 20–22 | 115ms |
| hurt | 23–24 | 90ms |
| death | 25–30 | 115ms |

## Integration

`ArenaScene.preload` registers `spr-alpha-b2`, and `PixelWorld.sync` renders its 7 animation tags **only for Alpha Chad**. The starting Mewing Jaw swing already exists in `Arena`; the attack animation tracks `jawUntil` and ends when the melee window ends. No combat formula or timing is changed. Sigma B1 and the other four characters remain untouched.

Home and character select use `alpha-portrait.png`. The original `spr-alpha` atlas remains loaded as a fallback should the new sheet fail to load.

## Gate

1. Play Alpha Chad in landscape on an actual Android, verify attack animation, step and hurt visibility.
2. Confirm no blurred scaling, visual hitbox misalignment, shimmering outlines or performance regression against Sigma.
3. Green TypeScript, Vitest, build, Chromium Playwright (including 844×390 smoke test).
4. Merge/deploy only after green checks. Do not activate database, cloud saves or login as part of B2.

This is a meaningful sprite/animation upgrade, but not final manual sprite polishing; the rest of the roster, enemy packs and Aseprite masters remain future art sprints.
