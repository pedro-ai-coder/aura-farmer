# Phase 4.17 — Real-damage complete-run QA and boss evidence

## Goal

Close the major evidence gap left by the six-minute survival baseline. Measure actual nine seeded runs for all three launch heroes through five waves, the four scheduled event bosses, Big Hater, and the berserk phase where reached. Do not assume that green build checks prove a full game can be completed.

## Evidence collection

The existing deterministic, pickup-aware simulation remains unprotected: real enemy AI, contact/projectile/area damage, real XP, drops, equipment caps, Flex, Safe Spot, and loss conditions are active. This iteration **selects a real legendary upgrade rather than always deferring it**, which is essential for a representative boss attempt.

- Heroes: Sigma, Cool Kid, Alpha Chad
- Seeds: 47001, 47002, 47003 for each hero
- Horizon: 1,200 seconds of active game time, or actual victory/defeat
- Normal CI: 9 six-minute attempts, each repeated to check determinism
- Scoped workflow: 9 up-to-20-minute attempts on the relevant PR, archived for review for three days
- Evidence fields: seed, hero, outcome, active time, wave, HP, level, kills, XP, damage dealt/taken by source, healing, shield absorption, Flex uses, equipment, legendary chosen, each event boss killed or remaining, Big Hater spawned/defeated/HP, berserk observed, specials spawned/collected and one-minute snapshots

## Run locally

```bash
npm ci --no-audit --no-fund
npm run typecheck
npm test
npm run build
npm run test:browser
AURA_ADAPTIVE_FULL_QA=1 npm test -- adaptive-build-balance.test.ts
```

The last command emits nine `[adaptive-balance-full]` JSON reports and must not be omitted from this iteration's acceptance review. The dedicated `Complete-run boss QA` GitHub workflow runs it only when the test harness or workflow changes on a PR, or via manual dispatch. It is **not a recurring CI job**.

## Acceptance gates

- [ ] Confirm exact final commit, TypeScript, Vitest, build, Playwright, scoped complete-run workflow, security and Vercel status.
- [ ] Collect nine extended run records and identify the wave at each genuine loss.
- [ ] Determine whether any real run reaches the Big Hater, passes the 18-minute berserk threshold, and wins or dies; never convert missing progress into an artificial win.
- [ ] Compare hero survival, damage-by-source, XP progression (level checkpoints), legendary acquisition and miniboss outcomes.
- [ ] Identify any late-game bottleneck for an evidence-led combat tuning PR.
- [ ] Manually play each hero through later waves; test aiming, Flex, shields, Aura Snack and Aura Magnet, and verify that item variety feels fair.
- [ ] Owner explicitly approves the PR before merge.

A bot which aggressively collects drops is **not representative of a typical player**. Strong automated survivability is necessary but insufficient for release acceptance. This PR does not modify gameplay values, persist data, introduce paid services, or add new mechanics. Full-release balance remains pending until both automated evidence and human playtests are reviewed.
