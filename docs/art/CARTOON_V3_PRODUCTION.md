# AF-ART-V3 — Public-facing cartoon art and three playable arenas

**Implementation:** `feat/cartoon-public-art-maps-v3`  
**State:** engineering-quality candidate, **not release-approved until CI and hands-on user testing**.

## Design language
Aura Farmer is a **comic survivor arcade**: flat printed-paper textures, high-contrast character silhouettes, bright daylight arenas, asymmetrical scene props and functional bold typography. Avoid SaaS dashboards, blurred neon gradients, homogeneous human proportions, oversized rounded cards and UI baked into screenshots. The real combat scene is the art reference.

Palette: pale warm paper (`#f7edcd`), ink (`#253449`), Aura gold (`#f8c45f`), Hater coral (`#e57461`), teal accents (`#6eaab0`). No dark full-screen visual fog or unreadable enemy silhouettes.

## All selectable heroes
| ID | Art identity | Source / state poses |
|---|---|---|
| sigma | angular hood, sharp black silhouette, gold chest sigil | `characters/sigma.svg`, `characters/poses/sigma-*.svg` |
| alpha | exaggerated broad shoulders, golden hair, squared jaw | `characters/alpha.svg`, `characters/poses/alpha-*.svg` |
| rizzler | tall purple coat, dark glasses, narrow shape | `characters/rizzler.svg`, `characters/poses/rizzler-*.svg` |
| ohio | forward-facing cap, bright blue tracksuit, runner shoes | `characters/ohio.svg`, `characters/poses/ohio-*.svg` |
| fanum | sturdy round jacket, oversized TAX bag, muted green | `characters/fanum.svg`, `characters/poses/fanum-*.svg` |
| six-seven | slender yellow jersey, oversized 67 marking | `characters/six-seven.svg`, `characters/poses/six-seven-*.svg` |
| cool-kid | blue pom-pom beanie, layered street jacket and sneakers | `characters/cool-kid.svg`, `characters/poses/cool-kid-*.svg` |
| nerd | oversized square glasses, necktie, hand-held device | `characters/nerd.svg`, `characters/poses/nerd-*.svg` |

Every hero has **six rendered states** (idle, run-a, run-b, attack, flex, hurt) chosen in Phaser via current simulation signals. Drawings have transparent 128×128 SVG source boundaries. Run animation is two alternating drawings, not a complete 8-direction atlas. Menu portrait uses the exact idle source. No underlying hero ID, numerical stats, FLEX mechanics, passive cap, unlock or saved profile was changed.

## Enemies
NPC is an inattentive phone carrier; Hater is a pink jagged shouting silhouette; Beta Bro wears distinctive headphones; Big Hater has a large gold crown and regal mass. Each has 4 sprites (idle, move, attack, hit), with boss displayed larger.

## All three playable worlds
| ID | World | Solid props | Unique identity |
|---|---|---|---|
| ruin-alley | Ruin Alley | 9 | sunlit street markings, spraypaint, dumpsters and crates |
| crown-chamber | Crown Chamber | 10 | light sandstone, twelve ring markers, columns and crown emblem |
| toxic-rooftop | Toxic Rooftop | 10 | open daylight roof, pipes, fans, warning stripes, no hidden damage mechanics |

Worlds are **1,800×1,320**, camera follows hero, and all props affect collision, projectile stopping and enemy navigation. All five waves and current bosses take place within the chosen world. Map artwork is authored in `src/game/render/ruinAlleyArt.ts` / `worldVariantsArt.ts`; collision geometry in `src/game/core/worldMaps.ts`. Interactive map picker: Home → MAPS → choose world; map is represented by a query parameter, e.g. `?visual=cartoon&map=toxic-rooftop`. Changing maps reloads the Phaser scene **before play**; saved progression and character unlocks are retained. Classic `?visual=arena` remains available unchanged.

## Main menu and UX
- Responsive comic-paper UI in `src/styles/cartoonV3.css`, following V2.
- Home → Heroes / Maps / Achievements / Rankings / Settings.
- Real menu map thumbnails: `public/assets/cartoon/v1/arenas/preview-*.svg`. No card displays unavailable gameplay.
- Existing native control semantics, touch/keyboard focus and game HUD are retained.
- Map chooser chooses an actual collision geometry, not just a cosmetic background.

## Files and manifest
`public/assets/cartoon/v1/asset-manifest.json` describes actual asset files and separately marked planned texture atlases. No copyright-protected third-party sprites are copied. The eight original hero illustrations and four enemies are SVGs with editable paths. All character states have art files on this branch.

## Not implemented (avoid inflated claims)
- High-budget 8-direction animation cycles, authored effects for every weapon, unique audio tracks, final scene cutscenes, hazard damage on Rooftop.
- Exported sprite atlas PNG+JSON and tilemap JSON files; current Phaser loads SVGs as textures and scene geometry is code-drawn.
- Additional balance changes / permanent economy / new multiplayer backend.

## Release gate
Do not report **ready to test** until the precise PR SHA has completed **TypeScript, Vitest, Vite build and all Playwright browser suites successfully**. Investigate logs and fix regressions on branch, repeat CI until green. Then human smoke test all 8 characters, all 3 arena maps, five waves, mobile portrait/landscape joystick, level-up, FLEX and save migration. PR should not auto-merge.
