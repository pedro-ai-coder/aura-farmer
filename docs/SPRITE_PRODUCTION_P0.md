# AF-ART-P0 — Production sprite replacement plan

**Approval:** Art Bible + Gate A direction approved 2026-10-10. **Status:** production assets pending.

Current game uses original **runtime-generated pixel textures** (`src/game/render/pixelArt.ts`). These are first-pass placeholders, **not** the individually drawn/exported sprite sheets envisioned in `docs/ART_BIBLE.md`. The visual look and palette were approved; complete editable sprite animation sources have **not** been delivered. Do not misrepresent AI concept images or procedural pixel placeholders as production animation assets.

## Four production batches, in order

| Batch | Deliverables from artist | Animation tags, source frames | Integration acceptance |
|---|---|---|---|
| ART-P0-1 | The Sigma, NPC, Hater and Beta Bro | Sigma 48px idle 4 / move 6 / hurt 2 / flex_charge 4 / flex_success 3 / death 6; NPC and Hater 48px idle 2 / move 4 / hit 1 / death 4; Beta 64px similar | Real atlases load; nearest sampling; stable feet pivot; gameplay hitboxes unchanged; readability Android |
| ART-P0-2 | Big Hater boss | 128px idle 4 / move 4 / attack 5 / hurt 2 / death 8 | Boss windup identifiable; hitbox/health bar aligned; 5-wave loop and victory unchanged |
| ART-P0-3 | XP crystal, player/hostile shots, Mewing Jaw, Ohio Orbiter, FLEX, Aura Burst, Focus and impacts | 16px pickups/projectiles; 32–64px VFX with 4–6 frames where appropriate | Hostile coral vs gold player shots; VFX may not conceal warnings; capped FX load |
| ART-P0-4 | 16 buff icons + Ultimate 67, light arena tiles/props, upgrade cards and banners | 16/24px icons, 32px tiles; scalable 9-slice cards; keep text in code | Touch hit targets unaffected, UI English, cards readable in landscape and portrait |

**Owner roles:** game director approves exported art; artist creates source artwork/animation & verifies original rights; Codex imports exports/sets animation tags and pivots and runs tests. This is a production *plan*, not a claim that an external pixel artist has been hired.

## Format and source requirements

- Each delivered sprite has an editable `.aseprite` source, transparent `.png` sprite atlas and frame/tag `.json`, or a fully editable, properly licensed equivalent with exact same metadata.
- Texture naming/pivots must follow `docs/ART_BIBLE.md`; 2px atlas extrusion/padding to prevent seams.
- Visual source frame bounds: player/NPC/Hater 48×48, Beta 64×64, boss 128×128. These are sprite frame sizes **not** collision geometry.
- Every asset needs screenshot in-game at 1x and mobile landscape size, permission to use commercially, version ID.
- Original sprites only; no copied Brotato, Riot, streamer likenesses, or unlicensed art.
- Keep procedural `px-` textures as fallback until replacement has passed visual and automated checks.

## Integration strategy

1. Accept the delivered sprite assets in a separate branch (do not bundle into the mobile fullscreen feature).
2. Add a reusable Phaser atlas loader + animation registration, keeping `Arena` simulation logic untouched.
3. Replace sprite texture keys incrementally in `PixelWorld`, preserve one Phaser Image per active entity, stable ID mapping and effects layers. Keep origin at feet center for actor sprites.
4. Compare still frames and movement side by side with current visuals. Prefer nearest-neighbor filtering on sprite textures, without softening text.
5. Test in Android landscape (fullscreen when supported) and portrait; retain 90-enemy cap and measure real-device performance.
6. Merge one batch at a time only after TypeScript, Vitest, Vite build, Playwright desktop/mobile and real gameplay review. Vercel production only after green CI and approval.

## Milestones for signoff

- **B1:** Sigma + three enemies (first game build with hand-drawn animated characters).
- **B2:** Boss and combat animations (gameplay/readability review).
- **B3:** Weapons and VFX (combat clarity review).
- **B4:** UI/arena/icons (release candidate; Android / desktop review).

If art source is not yet available, *do not start a fake sprite integration*. Keep the current deployed version and request art delivery for B1. Production task tracking is separate from the fullscreen feature.

## Fullscreen mobile release (separate task)

This PR provides immersive mobile landscape gameplay. Native Fullscreen and Screen Orientation APIs are attempted from the player's touch; browsers that reject them get a CSS immersive fallback and a rotate-device prompt. On iPhone Safari in a regular browser tab, browser chrome may remain visible; a dedicated installed home-screen experience is a separate future enhancement. Recheck Android Chrome on physical hardware after release.
