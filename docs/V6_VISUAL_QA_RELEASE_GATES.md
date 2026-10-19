# Visual V6 — Browser Evidence, Dense-Wave Readability and Performance

**Status:** QA instrumentation. Not a visual sign-off, not a benchmark on physical hardware and not proof of an uninterrupted successful run.  
**Baseline:** `main` at branch creation, after owner-merged V3 PR #93. V4 (UI) and V5 (arena) are **separate pending PRs** and their final combined release cannot be signed off until they merge after owner approval.

## Explicit evidence levels

| Result | What it can establish | What it cannot establish |
| --- | --- | --- |
| Screenshot of the actual Phaser canvas in a real browser | Which game assets, enemies, rings, HUD and telegraphs are rendered at a stated viewport | Difficulty, continuous movement correctness, enemy combat accuracy, player success |
| Deterministic crowded-wave scene fixture | Contrast and occlusion of approved silhouettes and hostile warnings with dozens of actors | The natural spawn distribution, balance, actual late-wave player survival |
| Chromium CI `requestAnimationFrame` timing | Rough render-loop frame pacing on the shared CI runner for this exact test commit | 60 FPS on a real desktop GPU, 30 FPS on a phone, device heating, battery life, network |
| Playwright mobile viewport/touch simulation | CSS viewport, controls and fullscreen hint regressions in emulated dimensions | Real touch-latency, notch/safe-area, Safari/Android browser fullscreen, device rotation reliability |
| Nine-seed full-length gameplay simulation | Scenario-specific seeded completions and genuine boss damage under deterministic input policy | Human controls, fun, accessibility, graphical performance |
| Physical player-controlled 15–20 min run | Whether the **human** can complete the web demo and read the graphics during actual play | Broader hardware and character coverage from a single run |

**Do not publish a claim that the demo is final simply because any one of these evidence layers is green.**

## What this PR adds

`tests/browser/v6-visual-performance.spec.ts` saves visual QA fixtures for:

1. **1280×720 desktop:** 25+ actual enemy objects spanning the approved wave types, an existing hostile Area and a friendly pulse, plus actual shielding. One screenshot with full effects, one with reduced effects. Uses the production renderer, approved sprites, Phaser and DOM HUD.
2. **915×412 landscape mobile emulation:** same controlled dense scene, reduced effects, touch-zone present.
3. **390×844 portrait emulation:** actual currently implemented rotation/fullscreen guidance, explicitly captured as **not** approved portrait gameplay.
4. **Render timing:** around two seconds of `requestAnimationFrame` samples for each desktop/effects and landscape case; writes JSON to `test-results/v6-*-render-observations.json` with frame count, observed FPS, p95 frame milliseconds, viewport, DPR and user-agent.

The fixture freezes only the simulation clock so actor positioning is reproducible, while Phaser continues drawing. It deliberately **does not count** as a normal player run. No hard performance FPS threshold is asserted on shared virtual CI hardware; minimum nonzero frames catches nonrendering or crashed clients.

Images and machine-readable JSON are archived in the ordinary **browser-test-results** artifact for owner review. No new engine, service, tracking, credentials, gameplay changes or image creation.

## Product release acceptance still required

- [ ] V4 and V5 owner-approved merges, then combined visual acceptance on `main`.
- [ ] Desktop 1280×720, 1920×1080, 800×600: gameplay, all modal states, fullscreen, keyboard/mouse controls, HUD with boss and legendary choices; no clipping.
- [ ] Actual phone landscape and portrait/orientation/fullscreen tests, outside letterbox joystick restriction, device-safe areas and modal actions.
- [ ] Real playthrough of Sigma, Cool Kid and Alpha Chad; legitimate Big Hater win, including **post-18:00 berserk scenario**, no weapon/passive slot violations or unintended persistence.
- [ ] Real reference hardware measurements targeting GDD desktop **60 FPS** and reduced-profile **stable 30 FPS** on mobile, under real enemy density.
- [ ] Actual 9+ weapon visuals, shields/expiry, Aura Snack/Magnet, three Flex effects under game action and actual item visibility at play scale.
- [ ] Art gaps from PR #90 audit resolved or explicitly owner-accepted as demo exceptions. Especially the GDD's **nine illustrated weapon + 28 passive icon exports** are not silently completed by existing glyphs.
- [ ] TypeScript, Vitest, build, Playwright, scoped full-game QA, secret scan and exact-SHA Vercel preview all passing on release candidate.
- [ ] Owner explicit approval of every PR before merge, then manual release signoff.

### After visual V6

Prepare a single **Web Demo Release Candidate** only after the above issues are closed. Discord Activity remains a separate future adaptation. No backend, multiplayer, login, paid storage or new monetization is part of this visual program.

## Engineering acceptance for this instrumentation-only PR

- [ ] Captures and JSON archived at exact commit in GitHub Actions.
- [ ] Explicitly label emulation / CI limitations.
- [ ] Browser suite green with fixed rendering fixture and no genuine game-rule changes.
- [ ] Owner approval before merge; do not mark Web Demo released.
