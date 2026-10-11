# Aura Farmer — interface polish, before backend

This package follows PR #26 and the user-approved menu, buff and HUD styleframes.

## UI checklist
- [x] Home and character selection flow already supplied by the first visual slice
- [x] Shared wood, stone, crystal and foliage ornaments implemented as editable SVG UI resources
- [x] Character/health/Aura/level/wave HUD refreshed without changing the Phaser simulation
- [x] In-game MENU button includes normal / hover / press states, retains accessible button semantics and pause behavior
- [x] Level-up choices use controlled, semantic icons linked to their actual buffs (not static mockup text)
- [x] Wave-complete is a single HTML modal layer with working click/tap/keyboard continuation
- [x] Pause, settings, character cards, leaderboard, results and loading all share the style sheet
- [x] Responsive layout and reduced-motion rules remain active
- [ ] Production sprite atlases matching the approved hero / enemies / world images. Current runtime world assets are the prior pixel-art batch
- [ ] Dedicated hand-painted 9-slice exports from the approved artboards. Current SVGs are editable production stand-ins
- [ ] Full art polish on rewards/achievements icons, hit VFX and stage environment for complete style parity

## Interaction rules
Only the active modal takes pointer input. The wave modal is independent of level-up and result screens. A real confirm action drives the next wave. No new gameplay stats, online rankings, or backend calls have been introduced.

## QA gate
Run `npm ci`, `npm run typecheck`, `npm test`, `npm run build`, `npm run test:browser`.
On 390x844 and 844x390 devices, verify all selectors visible and non-overlapping; control flow between wave/level-up and pause preserved. Vercel preview remains separate from main and the backend PR #18 stays untouched.

## Priority next
Finish converting the approved visual references into individual transparent production sprites/atlases and replace the placeholder battle arena textures; then pursue backend only after UI/graphic signoff.
