# Visual Identity Milestone 1 — 2026-10-11

**Direction:** original arcade-fantasy, warm farm/cold corruption, restrained bloom and bold legible panels. This is the first in-game vertical slice, not a claim that the approved concept sheets have been converted to final PNG character atlases.

## Integrated in this branch
- Standalone identity stylesheet loaded after legacy CSS so combat logic and existing responsive rules remain intact.
- Original editable SVG world and hero illustration used in the main menu and initial boot loading view; no external image dependencies.
- Redesigned main menu with prominent Play, hero focus, local profile, settings, local rankings and event teaser. Existing navigation/actions stay unchanged.
- Dark panel/wood-gold/cyan UI design applied consistently across meta menus, character selection, pause, results and level-up overlay.
- Real Phaser asset-loading progress from the loader, hidden on completion; never invent simulated percentages.
- Lightweight on-screen wave, boss and Aura Burst banners driven by existing Phaser state, without changing timing or scoring.
- Phaser HUD colors/panels aligned to the identity; game combat remains intact.
- Reduced motion preference honored for animations; small landscape and portrait adaptations.

## Known limitations / next passes
- The approved high-detail key art, portrait atlases, UI sprite sheet and animation atlases remain concept art and are NOT present as production sprite assets here.
- The new SVG assets are original first-pass interim illustrations, not pixel-perfect reproductions of the approved concept boards.
- Existing pixel sprites/world tiles are still the same assets. Final hero/enemy atlas integration needs transparent production sprites with frames/animation metadata.
- The teaser event is decorative, not a new event system or paid offer; world events need real backend/game events before becoming clickable.
- Loading is shown during actual first Phaser preload; existing run transitions have no asset load and therefore no fake loading screen.
- Sound design, animated world props and sprite-driven impact VFX are a subsequent separate pass.

## QA
Run `npm ci`, `npm run typecheck`, `npm test`, `npm run build`, and `npm run test:browser`.
Check menu/character selection on desktop, 390x844 portrait, 844x390 landscape, and fullscreen mobile. Confirm Play → choose hero → run → MENU → resume and quit. Confirm all local save and achievements tests.
