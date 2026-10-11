# Gate B1 — The Sigma pilot: 48px native character animation

**Status:** READY FOR ART REVIEW, CI pending. **Not final art direction signoff / not approved for production merge.**

## What's changed

| Old | Sigma B1 candidate |
|---|---|
| Source shapes at 24×24 upscaled to 48px | Individually rendered at native 48×48 |
| 2 idle + 2 movement poses | 4 idle + 6 running poses |
| 1 pain and 1 FLEX pose | 2 hurt + 4 FLEX charge + 3 FLEX success |
| No real death animation | 6 distinct death frames |
| Strip preview shared with other sprites | Dedicated single-frame Sigma portrait in HOME/CHARACTERS |
| No named animation timing contract | Frame tags, bounds and durations in `sigma-b1.json` and TypeScript |

**Assets:** `public/assets/pixel/sigma-b1.png`, `sigma-portrait.png`, `sigma-b1.json`. The PNGs are source-resolution editable pixels, not rendered concept-sheet screenshots. See `art/source/sigma/README.md` for Aseprite import. A layered `.aseprite` source file is still required before marking all final art complete.

## In-game integration

- `ArenaScene.preload` registers the original Sigma B1 sheet.
- `PixelWorld.sync` picks Sigma B1 frames in mode idle/move, on damage, during FLEX charging and success, on death; other characters continue using existing art.
- If `spr-sigma-b1` is unavailable, existing `spr-sigma` / `px-player-*` graphics remain as fallback.
- No changes to HP, XP, waves, buff selection, FLEX success conditions, collision boxes, saves or mobile controls.
- Avoid continuously allocating sprite objects; change frames on the existing player Image.

## Art review

1. Inspect the 25-pose contact sheet and animated preview (attached in Game Director review conversation).
2. Play Sigma on desktop and a physical Android phone in horizontal fullscreen.
3. Test IDLE, MOVE, FLEX CHARGE (near 3 enemies), FLEX SUCCESS, HURT, DEATH. Compare with old Sigma and other characters in the same arena.
4. Evaluate silhouette, hoodie and golden chest emblem legibility at normal Android in-game scale.
5. Authorize or request revisions. **Do not treat this pilot as approval of the full six-character animation pack.**
6. For final hand-polished production, provide layered editable master (.aseprite or equivalent), side turnarounds and well-aligned pivots.

## Technical acceptance

TypeScript, Vitest, Vite build and Playwright must pass on the final commit; browser check confirms 25+ atlas frames, hero texture, portrait and landscape screenshot. CI-emulated mobile does not replace testing on a physical Android device.

**Future sequence:** Sigma revision/final approval → Alpha Chad → Rizzler → Ohio Kid → Fanum Lord → Six Seven Kid → NPC/Hater/Beta Bro → Big Hater → VFX/icons.

**Online database/auth is still paused.** The Supabase proposal in draft PR #18 is untouched.
