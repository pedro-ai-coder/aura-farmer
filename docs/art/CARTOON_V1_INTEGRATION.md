# AF-CARTOON-001 — Cartoon V1 integration and asset registry

**Status:** first playable art pass for review. **Not the final illustrated/animated production pack.** This change is art-only and intentionally preserves gameplay and local profile saves.

## View modes
- default or `?visual=cartoon`: first-pass cartoon assets for all 8 selectable characters, 4 enemies and the brighter **Aura Court** arena background
- `?visual=arena`: previous procedurally drawn Aura Arena presentation
- `?visual=legacy`: legacy pixel variant

Only the UI skin, hero/enemy images and background are swapped. No independent Focus, new items, currency, profile schema, map selector, hitbox or balancing changes.

## Runtime file mapping
| Category | IDs / paths | Where used |
|---|---|---|
| 8 heroes | `public/assets/cartoon/v1/characters/*.svg` | `GameShell` portraits and featured hero, `PixelWorld` active player |
| 4 enemies | `public/assets/cartoon/v1/enemies/{npc,hater,beta,boss}.svg` | `PixelWorld.sync()`, original IDs and hitboxes retained |
| Arena | `public/assets/cartoon/v1/arenas/aura-court.svg` | Phaser stage background, **decoration only** |
| Loader | `src/game/render/cartoonArt.ts` | `ArenaScene.preload()` image keys `ct-*` |
| Presentation | `src/styles/cartoonV1.css` | Menu and responsive treatment |
| Legacy support | `?visual=arena` / `?visual=legacy` | Comparison / rollback |

All SVG files are separately editable source assets. They deliberately do not embed/generated screenshot UI, fake in-game currencies or labels with unimplemented gameplay claims.

## QA / production checklist
- Confirm 8 hero SVGs, 4 enemy SVGs and arena render without missing texture indicators.
- Confirm hero selection, old unlock rules and persistently selected hero; Alpha/Sigma/Rizz FLEX still have their existing gameplay differences.
- Confirm FIVE waves, Big Hater defeat gate, 3 weapons + 3 passives, XP upgrades, local achievements and scores remain unchanged.
- Confirm keyboard E and mobile FLEX button, joystick, portrait/landscape, pause on hidden tab, and fullscreen fallback.
- Check contrast and target visibility at 960x600, 390x844, 844x390 and in a busy 90-enemy situation.
- Future: add directional animation strips & artist masters for all 8; the initial sprites use a restrained idle/move tilt. Only this later phase can claim final sprites.
- Future: create **real** scrolling/obstacle maps and their collision/navigation systems separately (see `docs/GAME_DESIGN_V1_LOCKED.md`). This PR intentionally has one arena skin.
- Offline tests: `npm run typecheck`, `npm test`, `npm run build`, `npm run test:browser`; CI may be unavailable owing to GitHub Actions limits.

## Rights and originality
Every runtime SVG in Cartoon V1 was directly authored as simple vector geometry for this project; no Brotato sprites, fonts, images or copyrighted UI assets are copied. The previously generated AI mockups are *visual concepts*, not the source for runtime textures.

## Paths for review
- [New characters](../../public/assets/cartoon/v1/characters)
- [New enemies](../../public/assets/cartoon/v1/enemies)
- [New arena](../../public/assets/cartoon/v1/arenas)
- [Asset authoring notes](../../public/assets/cartoon/v1/README.md)
