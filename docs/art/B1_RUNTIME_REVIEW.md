# B1 — new original Cartoon Arcade hero sprites (review)

This PR **changes the actual playable Phaser hero artwork**, not merely documentation.

## Contents

- Three newly authored **transparent vector sprite sheets**, each 800 × 896, with 16 original cartoon poses across a 4 × 4 layout:
  - `sigma-hero.svg` — deep-ink hood, golden medallion, throwable black cap.
  - `cool-kid-hero.svg` — blue pompom beanie, blue hoodie, white keyboard.
  - `alpha-hero.svg` — blond spikes, muscular silhouette, white tank top and metal shield.
- Browser scene now rasterizes SVGs with Phaser, maps animation state and walk stride to per-character authored cells, and keeps a consistent foot baseline and 64-unit hero silhouette.
- Dedicated rear locomotion drawings for northbound movement. Lateral orientation continues to use existing animation flip selection.
- Existing special Flex animation sequences and four-stage defeat animations deliberately remain unchanged until accepted replacements exist.
- Review gallery at **`/assets/cartoon/b1/`** (open on the Vercel PR preview), with independently selectable animated states and contact sheets.
- Tests for asset integrity, frame mappings, original Flex fallback, full browser asset load and in-game texture selection.
- Asset provenance is in `public/assets/cartoon/b1/manifest.json`.

## Acceptance checks

1. Compare Sigma, Cool Kid and Alpha Chad at real game zoom on desktop and mobile.
2. Verify idle/run/attack/hurt and **rear-facing motion**, including mirrored directions.
3. Compare each silhouette against its previously approved identity; flag any unwanted changes.
4. Verify no outlines, accessory fragments or opaque backgrounds spill into neighboring frames.
5. Inspect B1 gameplay screenshots from the Playwright artifacts when available.
6. Verify that the three character-specific Flex effects and defeat sequences still play.
7. CI: TypeScript, unit tests, build, Playwright Chromium must all pass before merge; do not treat technical success as visual approval.

## Limitations

- This is the first **runtime visual implementation**, not final B1 art acceptance.
- This PR does not add enemy art, revise the arena, weapons/icons, or alter game balance.
- The hand-authored vector aesthetic should be checked against the approved Option A artwork before replacing more assets.
- All previously approved PNG masters and runtime atlases are preserved for rollback.
- Do not merge without explicit owner approval. No paid services or new runtime packages.
