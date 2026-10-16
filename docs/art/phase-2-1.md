# Phase 2.1 — Hero animation assets

Generated with the built-in image generation tool on 2026-10-16, using the existing approved runtime atlas for each character as the identity/style reference. Original files remain unchanged. No paid API or external service was added.

| File | Content | Runtime crop metadata |
|---|---|---|
| `public/assets/runtime/alpha-rear-v2.png` | 12 poses: NE, N, NW; four-frame cycles | `src/browser/hero-rear-frames.json` |
| `public/assets/runtime/cool-kid-flex-v2.png` | Eight poses for temporary Rampage form | `src/browser/hero-flex-frames.json` |
| `public/assets/runtime/cool-kid-rear-v2.png` | Four north-facing running poses | `src/browser/hero-rear-frames.json` |

The files retain the generated alpha channel. Phaser reads explicit padded rectangles, not a guessed uniform grid. One scale per source sheet preserves body proportions. Existing front/side, attack, hurt, defeat and Flex drawings remain in use. Rear views are newly authored; symmetric lateral directions may reuse flipped drawings without lettering. Character facing and weapon aiming remain separate. New illustrations do not change collision geometry.

## Alpha prompt

Use case: identity-preserve. Project sprite atlas supplement. Reference image is the approved Alpha Chad game character; keep exactly his cartoon linework, blond spiky hair, huge muscular arms, white tank top, black trousers, black gloves, black gold trainers and metal weight-plate shield. Produce ONLY 12 full-body sprites on a transparent background in a strict 4 column by 3 row evenly spaced grid, large clear margins between cells. All figures same scale, same foot baseline within their cell, nothing cropped. Row 1: four distinct consecutive running cycle poses facing northeast (away and right, back three-quarter view). Row 2: four consecutive running cycle poses facing NORTH, completely away from viewer, visible back of head and tank top, no face. Row 3: four consecutive running poses facing northwest (away and left, back three-quarter). Each four-frame cycle: left-foot contact, passing, right-foot contact, passing. No front-facing poses, no text, no labels, no arrows, no floor or shadow, no extra characters. Preserve hand-held shield consistently on his anatomical left side. Crisp game-ready inked cartoon, not pixel art. This supplements the reference; do not reproduce its existing layout.

## Cool Kid prompt

Use case: identity-preserve. Game animation supplement. Match EXACTLY the reference Cool Kid cartoon character: blue pompom beanie, blue hoodie white undershirt, black pants, blue sneakers and small white keyboard held in hand, same proportions and ink style. Produce ONLY four full-body sprites evenly spaced in one horizontal row, all facing NORTH completely away from viewer (back of beanie, back of hoodie; no visible face or front crown logo). Four distinct consecutive running poses: left foot contact, passing, right foot contact, passing. All same scale and same foot baseline, generous transparent margins and clear gaps, do not crop keyboard or hat. Actual transparent background. No shadows, no lettering, no labels, no front-facing poses, no UI. These are a consistent looping rear-facing run cycle supplement for the existing approved atlas.

## Review evidence

The browser suite produces `animation-{sigma,cool-kid,alpha}.png` contact sheets from the actual Phaser texture/frame selections at 1.5× gameplay scale, plus `north-run-{hero}.png` at normal viewport scale. These are CI artifacts, not replacement art. Unit tests check crop bounds against PNG headers, frame coverage, phase timing, pause, wall contact and restart. These checks do not establish human playtest quality or device performance. Enemy animations and combat-effect artwork are intentionally outside this PR.

## Cool Kid transformation prompt

Use case: identity-preserve. Asset: transparent game sprite atlas for Cool Kid's temporary Giga Chad Rampage transformation. Reference shows approved character. Preserve his youthful cartoon face, blue pompom crown beanie, blue hoodie, white shirt hem, black trousers, blue trainers, and keyboard prop; exact same bold inked cartoon style and colors. Temporary form is clearly broader, muscular shoulders and strong arms inside the blue hoodie, powerful confident posture, recognizably THE SAME Cool Kid not a blond Alpha or different character. Generate exactly EIGHT separate full-body poses in an evenly spaced strict FOUR column TWO row grid, ample transparent padding, no ground/shadows/text/labels/cell lines. Face screen RIGHT in all cells, consistent scale and foot baseline. Reading order: 1 crouching transformation startup, shoulders broadening, fists clenched; 2 fully transformed muscular triumphant flex stance; 3 running full-form left foot contact; 4 running full-form passing pose; 5 running full-form right foot contact; 6 running full-form opposite passing pose; 7 full-form braking/recovery crouch; 8 returning to normal smaller build, relaxed standing pose. Keep the head the SAME SIZE across all poses and change body bulk only. No glowing clouds that obscure silhouette. All hands, keyboard, pompom and shoes fully inside each cell, no overlap with neighbors. Actual alpha transparency.

Follow-up spacing correction: Keep all eight drawings, poses, identity, colors, linework and reading order unchanged. Repack on a transparent four-column/two-row canvas with wide empty gutters between the bounding rectangles. Keep scale identical. Complete pompom, keyboard and shoes. No text, grid or shadows; only change spacing and padding.

Rampage uses up to approximately 84 U of visual height, with the normal collision shape unchanged. It remains transformed during boss-hit feedback and returns to the regular atlas when Flex expires. Normal locomotion has eight logical directions; action/transform drawings use the authored right-facing orientation and symmetric left-facing playback.
