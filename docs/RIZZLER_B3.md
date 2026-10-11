# Art Sprint B3 — The Rizzler (native 48px)

Character-specific, original 48×48 indexed pixel art for The Rizzler (crowd control). This is a code-authored asset, **not an external artist commission** and not a hand-drawn Aseprite file.

- **Distinct silhouette:** slim pink jacket, sweeping purple side curl, gold heart badge and raised arm in the Rizz Aura cast.
- **Atlas:** `public/assets/pixel/rizzler-b3.png`; 28 frames arranged in one horizontal strip; `rizzler-b3.json` defines seven tagged states.
- **Menu portrait:** `public/assets/pixel/rizzler-portrait.png`; a separate full-frame bust, not a stretched spritesheet.
- **Editable original source:** `node art/source/rizzler/generate.mjs` reproducibly rewrites atlas and portrait (indexed transparent PNG, nearest-neighbor).
- **Animation:** idle 4; move 6; Rizz cast 3; FLEX charge 4; FLEX success 3; hurt 2; death 6.
- **Gameplay integrity:** only visual animation switches when the already-existing 300ms Rizz Aura pulse occurs. XP, damage, control radius, cooldown, hitbox and FPS simulation are untouched.
- **Fallback:** the previous `rizzler.png` remains available when the B3 atlas cannot load.
- **Validation:** run `npm run typecheck && npm test && npm run build && npm run test:browser`; check character select, cast after twelve kills, portrait/landscape Android readability and pixel sharpness at real size before merging.

This art is a visual iteration toward production quality and remains subject to human visual acceptance.
