# Visual V4 — HUD, Menus and Equipment Cards (Option A)

The owner-confirmed **Option A — Cartoon Arcade** remains the only art direction. This iteration builds on merged PR #93 and only changes DOM/CSS presentation. No combat rules, saves, collisions, gameplay inputs, authentication, new images or paid dependencies are introduced.

## Implemented

- **Readable desktop typography:** modal description and equipment card body text target **16px at the 1280×720 reference size**, with stronger hierarchy in headings, rarities, badges, item comparisons and hero selection. The compact HUD is slightly enlarged without covering the arena.
- **Nine weapons / current passive subset:** inventory slots now show the *existing catalog glyph icons* alongside slot number, name, rarity, level and interval. These are visible temporary typographic identities **not substitutes for final GDD A.8 illustrated 64px assets**.
- **Normal upgrade:** three equally sized cards with consistently aligned names, descriptions, comparisons, rarity outlines and accessible selected/focus state.
- **Legendary:** six choices fit a desktop **three-column / two-row grid**; small screens retain two columns with a scrollable modal, avoiding forced microtext or clipped confirm/defer buttons.
- **Option A styling:** dark ink contour, warm paper surfaces, aura gold for readiness, teal support and restrained purple rarities. No new futuristic/neon language.
- **Responsive layout:** existing landscape joystick/safe-area and scrolling behaviors are preserved, with restrained scaling for short phone viewports. No overlay touch events added.

## Evidence and QA

`tests/browser/v4-visual-ui.spec.ts` records **five real browser snapshots** of home, HUD, build, normal upgrade and six legendary cards at 1280×720, plus landscape legendary mobile. *(Six total snapshots.)* The tests verify actual computed font sizes, eight equipment slots with icons, a real two-row legendary grid, selected/confirm behavior, scrollable mobile controls and a visible playable joystick zone after leaving the modal.

Unchanged tests continue to cover normal upgrade selection, mobile joystick, pauses, full gameplay and browser routes.

## Explicit remaining product work

The GDD requires **nine final painted weapon icons and 28 passive icons**. This UI iteration does **not** generate them or claim those illustrations are finished. A separate owner-approved image-production stage is required. True mobile on-device readability and visual acceptance, dense wave legibility, performance, Sigma/Cool Kid survival and post-berserk victory remain release checks.

## Planned next steps

- **V5 — Ruin Alley world integration:** ground-contact shadows, cover readability/occlusion and world-space prop polish, keeping physics untouched.
- **V6 — Visual QA/performance:** device sizes, dense encounters, measurable FPS evidence and full-run visual acceptance.
- **Web Demo functional release gate:** player-controlled complete wins and difficulty acceptance before Discord Activity adaptation.

## Acceptance

- [ ] TypeScript, Vitest, build, full Playwright, secret exposure audit and Vercel Ready on final SHA.
- [ ] Human test at reference desktop and actual mobile device.
- [ ] Explicit owner approval before merging.

**No auto-merge.**
