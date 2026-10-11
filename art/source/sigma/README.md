# Sigma — B1 native 48×48 art pilot

The definitive **visual direction** is already approved: dark violet hoodie, angular dark hair, gold chest Aura symbol, Lavender Pop arcade background.

This is the first higher-detail **Sigma production candidate**, not yet a sign-off for the entire six-hero roster. Unlike the earlier 24×24 source enlarged to 48×48, every sprite in `public/assets/pixel/sigma-b1.png` is authored at a full **native 48×48 pixel grid**, with 25 transparent indexed frames. `sigma-portrait.png` is a distinct single-frame portrait for the menus.

## Editing the bitmap source

The original, pixel-editable PNG is `public/assets/pixel/sigma-b1.png`. Open the sheet in Aseprite or another pixel editor; import as **25 horizontal cells of 48×48**, keeping nearest-neighbor scale and alpha. The frame tags and delays are in `public/assets/pixel/sigma-b1.json`, mirrored in `src/game/render/sigmaB1.ts`. Do not resample these textures smoothly.

The PNG itself is editable; **layered .aseprite source is still a follow-on deliverable** and must not be claimed complete. The original authoring prototype used pixel-grid geometric primitives and expressive pose variants, without third-party artwork. A more detailed manual pass will refine folds, hair, face and turnarounds after the Game Director reviews the result.

## Contract

| Tag | Frames | Milliseconds/frame |
|---|---|---|
| idle | 0–3 | 175 |
| move | 4–9 | 100 |
| hurt | 10–11 | 90 |
| flex_charge | 12–15 | 160 |
| flex_success | 16–18 | 115 |
| death | 19–24 | 115 |

Keep origin at 0.5/0.5 as with the current render. The frame dimensions **never change the combat hitbox**. The legacy `spr-sigma` atlas remains a runtime fallback.

## Gate B acceptance before a full merge

1. Game Director sees the new Sigma in a real landscape match, plus idle/FLEX/death poses side by side.
2. Poses read clearly on 844×390 mobile and desktop without hiding projectiles/XP.
3. No animation jitter or unexpected collision changes; FPS remains stable with 90 enemies.
4. CI green: TypeScript, Vitest, Vite, Playwright desktop/mobile.
5. Game Director approves Sigma as the visual quality bar for other five characters.
