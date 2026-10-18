# Visual Production Backlog — Browser Demo (Option A)

**Dependency:** approved **Option A / Cartoon Arcade** and GDD Annex A. Product rules and numeric balance are independent work. The PR labels below are proposed sequential numbers, not proof that those PRs already exist. Begin each PR from updated `main` and obtain owner approval before merge.

| Proposed PR | Scope / source art | Finished evidence and acceptance | Not in scope |
| --- | --- | --- | --- |
| **#93 — Visual Audit & Art Direction** | Inventory approved masters and runtime art; code-level gap register; gameplay screenshot baseline; lock Option A production contract | Source- and SHA-traceable inventory artifact, desktop/mobile current-state screenshots, exact missing-asset descriptions, priority matrix and review criteria | Generating art, visual replacement, gameplay tuning |
| **#94 — Character Animation Overhaul** | Sigma, Cool Kid and Alpha Chad: approved master integration, idle/run 8 logical directions, attack/hurt/defeat, Flex start/active/exit | State/direction reference captures (8×3), pivots/alpha verified, GDD A.5 frame minimums or explicit review-approved exceptions, no animation/gameplay desync | New heroes, combat changes |
| **#95 — Enemy & Boss Animation Overhaul** | NPC, Hater, specialist enemies, elites, event bosses and Big Hater/boss-berserk | Clearly distinguishable silhouettes at gameplay size, recorded windup/impact/recover and normal/berserk samples, grounded occlusion/hitboxes, no invisible attacks | New species or boss mechanics |
| **#96 — Weapons, Shields & Flex VFX** | Nine weapons, active solo passives, separate shield/HP/XP/Aura cues, Aura Snack, Aura Magnet and unique Flex VFX | A real visual comparison for each attack family; telegraph not hidden under friendly VFX; effects match actual damage tick; low effects mode remains readable | Changing damage, cooldowns or drops |
| **#97 — HUD, Menus & Equipment Cards** | Home, hero selector, gameplay HUD, level-up choices, legendary grid, inventory, pause, results and item illustrations | English copy, readable icon at 32×32, consistent approved comic theme, safe areas, no HUD/modals overlap at tested dimensions, input focus preserved | UI-only pseudo-currency, backend |
| **#98 — Environment & Arena Polish** | Ruin Alley floor/props/shadows, visible cover, gameplay depth and camera consistency | Before/after at matching viewport, obstacles match physics, hero/enemy foot shadows anchored, clean central attack area | New playable maps or collision redesign |
| **#99 — Visual QA & Performance** | Regression review across all preceding PRs, desktop/mobile, dense waves, boss and berserk | Art owner review on actual game footage/screenshots, all technical gates green, measured reference FPS, clipping/silhouette/mobile report, remaining exceptions explicitly tracked | Declaring Discord or multiplayer complete |

## Working order and dependency gates

1. **#93 is evidence, not art production.** The current runtime captures and SHA-256 inventory must be available before comparing future changes. Confirm the concept and style proof with the owner.
2. **#94 and #95 author actor silhouettes and animation**; battle effects (#96) reference actual final poses so timings/scale do not get repeated rework.
3. **#97 aligns UI vocabulary with art and VFX** rather than building unrelated generic widgets.
4. **#98 integrates the actors into the arena** after their footprint and readability are stable.
5. **#99 validates the entire user experience** at human-scale play speeds and device sizes; green TypeScript/unit/browser checks alone do not constitute a visual sign-off.

## Asset request template for each missing image

Record **target PR**, gameplay object/state, approved source to adapt, exact needed frame(s)/direction(s), pixel export target, runtime scale, pivot/alpha needs, color/shape references to A.2–A.3, rights/provenance and explicit owner image-generation authorization. If that authorization is missing, leave the gap open and reuse an existing approved asset or clearly labeled temporary placeholder. **No automatic graphics generation.**

## Definition of "done" for a graphical PR

- [ ] GDD references and all changed art paths listed in the PR.
- [ ] Owner approved any newly generated or replaced image; master assets preserved.
- [ ] Before/after captures at consistent viewport and runtime conditions, with exact SHA.
- [ ] Relevant animation state/direction matrix inspected visually, not only counted in JSON.
- [ ] No gameplay behavior, hitboxes, RNG, cooldowns, upgrade rules or persistent data changed.
- [ ] TypeScript, Vitest, build, Playwright and Vercel green on final commit.
- [ ] Keyboard/touch and FPS impact checked; genuine owner approval **before merge**.

## Separate release gates

This visual program begins after critical combat and progression stabilization. **Sigma/Cool Kid ability to finish the game, berserk victory, mobile fullscreen usability and complete functional acceptance remain gameplay/UX release gates**, not tasks that can be marked complete by approving an art PR. The first solo web demo excludes Discord Activity; Discord adaptation follows only after web acceptance.
