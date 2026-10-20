# B2.2 — Renderer budget: cached geometry and render-only culling

**Baseline:** B2.1 (PR #99), 53 Chromium tests green; raw baseline in GitHub Actions run 39466744476, artifact `browser-test-results`. Benchmark values below were observed on shared CI hardware; they are **not** targets, physical desktop FPS or phone measurements.

| Reference | 20 enemies | 50 enemies | 100 enemies |
|---|---:|---:|---:|
| Desktop 1280×720, frozen, full VFX — FPS | 11.2 | 10.6 | 10.1 |
| Desktop frame p95, ms | 157.6 | 161.8 | 181.8 |
| Mobile viewport emulated 915×412 — FPS | 22.0 | 21.2 | 18.3 |
| Mobile frame p95, ms | 88.9 | 82.6 | 95.2 |

The source `B2_1_BASELINE.md` explains fixture constraints. JS draw p95 in the 100-enemy desktop fixture was ~3.8 ms, substantially below the ~182 ms observed frame p95: this suggests graphics/browser scheduling is a major contributor *on that CI runner*, **not** proof of a specific bottleneck or gain.

## Changes in B2.2

1. **Cached ground contacts.** Player/enemy foot-contact ellipses keep the same ink, relative sizes and offsets but are converted once per radius into very small transparent runtime canvas textures. Phaser Images follow actual actor coordinates. Removed repeated `Graphics.fillEllipse` tessellation (~2× each visible actor per frame); shadows fade/disappear with defeated actors and clean up on menu. No PNG files are generated or changed.
2. **Cached Safe Spot geometry.** The static healing station is drawn to a dedicated Graphics object only on a new run or readiness/coordinate change, not on every rendered frame. Animated charge/cooldown arcs remain dynamic and tied to simulation time.
3. **Camera-aware presentation culling.** Only draw graphics for areas, projectile marks, drops, telegraphs and effects intersecting a generously expanded actual Phaser camera worldView. Boss/area rings and line warnings preserve their full visual reach. Actor visuals outside the view are not created or updated, but all enemies continue running in simulation; actors become visible upon entering the view.
4. **Less per-frame overhead.** Reuse the enemy walk accumulator and visible ID sets, avoid `effects.slice(-24)`, update text glyphs only if content changes, and clear menu Graphics only once on exiting a run.
5. **Rendering metrics unchanged.** Keep B2.1 `?fps=1` diagnostics, percentile reporting and deterministic 20/50/100 fixture, so the next CI run captures comparable *observations*, not absolute hardware benchmarks.

## Safety and test plan

- `tests/scene-visibility.test.ts`: camera bounds, generous telegraph extents, no changes to simulation areas.
- `tests/browser/b2-2-render-optimization.spec.ts`: real Phaser renderer, cached foot shadows, distant actors culled and restored when the camera moves, unchanged combat model in a frozen fixture, clean reset to menu.
- Existing Vitest, 53 Playwright regression tests (including B2.1 performance baseline), TypeScript, build, security audit and Vercel must pass.
- Manual review on desktop and *physical* phone: original 3 hero PNGs, enemy contact shadows, healing station, edge-of-camera telegraphs, joystick/fullscreen, bosses and no visual clipping. The future B2.3 will change the camera separately.

## Acceptance and interpretation

A successful B2.2 is correct render-only behavior, no gameplay regressions, and **measured before/after metrics**, not automatically a higher FPS result on noisy CI. The baseline file outputs on the B2.2 HEAD will be archived in the Playwright artifact under the same names. Compare the same viewport, enemy count, effects and simulation mode. If FPS or frame p95 worsens consistently, revise the strategy before making further renderer changes.

**User workflow authorization (20 Oct 2026):** after all required checks pass, subsequent PRs may be merged and the next iteration started without separate approval. Do not merge a red or pending PR.
