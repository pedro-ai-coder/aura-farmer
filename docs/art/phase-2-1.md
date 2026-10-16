# Phase 2.1 — Hero animation assets

Generated with the built-in image generation tool on 2026-10-16, using the existing approved runtime atlas for each character as the identity/style reference. Original files remain unchanged. No paid API or external service was added.

| File | Content | Runtime crop metadata |
|---|---|---|
| `public/assets/runtime/alpha-rear-v2.png` | 12 poses: NE, N, NW; four-frame cycles | `src/browser/hero-rear-frames.json` |
| `public/assets/runtime/cool-kid-rear-v2.png` | Four north-facing running poses | `src/browser/hero-rear-frames.json` |

The files retain the generated alpha channel. Phaser reads explicit padded rectangles, not a guessed uniform grid. One scale per source sheet preserves body proportions. Existing front/side, attack, hurt, defeat and Flex drawings remain in use. Rear views are newly authored; symmetric lateral directions may reuse flipped drawings without lettering. Character facing and weapon aiming remain separate. New illustrations do not change collision geometry.

## Alpha prompt

Use case: identity-preserve. Project sprite atlas supplement. Reference image is the approved Alpha Chad game character; keep exactly his cartoon linework, blond spiky hair, huge muscular arms, white tank top, black trousers, black gloves, black gold trainers and metal weight-plate shield. Produce ONLY 12 full-body sprites on a transparent background in a strict 4 column by 3 row evenly spaced grid, large clear margins between cells. All figures same scale, same foot baseline within their cell, nothing cropped. Row 1: four distinct consecutive running cycle poses facing northeast (away and right, back three-quarter view). Row 2: four consecutive running cycle poses facing NORTH, completely away from viewer, visible back of head and tank top, no face. Row 3: four consecutive running poses facing northwest (away and left, back three-quarter). Each four-frame cycle: left-foot contact, passing, right-foot contact, passing. No front-facing poses, no text, no labels, no arrows, no floor or shadow, no extra characters. Preserve hand-held shield consistently on his anatomical left side. Crisp game-ready inked cartoon, not pixel art. This supplements the reference; do not reproduce its existing layout.

## Cool Kid prompt

Use case: identity-preserve. Game animation supplement. Match EXACTLY the reference Cool Kid cartoon character: blue pompom beanie, blue hoodie white undershirt, black pants, blue sneakers and small white keyboard held in hand, same proportions and ink style. Produce ONLY four full-body sprites evenly spaced in one horizontal row, all facing NORTH completely away from viewer (back of beanie, back of hoodie; no visible face or front crown logo). Four distinct consecutive running poses: left foot contact, passing, right foot contact, passing. All same scale and same foot baseline, generous transparent margins and clear gaps, do not crop keyboard or hat. Actual transparent background. No shadows, no lettering, no labels, no front-facing poses, no UI. These are a consistent looping rear-facing run cycle supplement for the existing approved atlas.

## Review evidence

The browser suite produces `animation-{sigma,cool-kid,alpha}.png` contact sheets from the actual Phaser texture/frame selections at 1.5× gameplay scale, plus `north-run-{hero}.png` at normal viewport scale. These are CI artifacts, not replacement art. Unit tests check crop bounds against PNG headers, frame coverage, phase timing, pause, wall contact and restart. These checks do not establish human playtest quality or device performance. Enemy animations and combat-effect artwork are intentionally outside this PR.
