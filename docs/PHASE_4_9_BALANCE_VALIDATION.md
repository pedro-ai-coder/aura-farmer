# PR #76 — Full-Run Balance Validation

## Scope and reproducibility

This iteration measures the existing solo web build. It does not change game rules, hero statistics, drop rates, or progression thresholds.

- Heroes: Sigma, Cool Kid, Alpha Chad.
- Seeds: 47001, 47002, 47003 per hero.
- Standard CI: nine 45-second real-combat attempts, each replayed to assert determinism.
- Extended QA: nine up-to-1,200-second attempts with actual enemy AI, contact damage, projectiles, weapon attacks, and pickups enabled.
- Fixed movement: eight seconds in each cardinal direction, clockwise; activate Flex whenever available; choose the first normal upgrade; defer legendary offers.
- Outcomes are measured rather than forced: early death is legitimate evidence of difficulty, **not** proof that a 15-minute run has passed.

## Commands

```bash
npm ci
npm run typecheck
npm test
npm run build
npm run test:browser
AURA_FULL_RUN_QA=1 npm test -- phase-4-9-balance-validation.test.ts
```

Capture `[balance-baseline]` and `[balance-full-run]` JSON lines from Vitest logs. Each line includes hero, seed, active time, wave, outcome, HP, level, kills, XP, damage dealt/taken, healing, Flex activations, Safe Spot usage, upgrades, and boss outcome.

## Review and acceptance

- [ ] Record the exact commit and environment for each run.
- [ ] Attach all nine complete-run results, including deaths and failures.
- [ ] Compare median survival, wave reached, damage dealt/taken, and Flex use by hero.
- [ ] Review whether the fixed movement policy is representative; follow up with human-controlled playtests.
- [ ] Confirm boss entry, berserk, victory/defeat and responsive desktop/mobile controls manually.
- [ ] Verify TypeScript, Vitest, build, Playwright and Vercel on the final commit.
- [ ] Identify balance problems with evidence before changing approved mechanics.

**This PR is not a completed balance sign-off until the extended suite has run and the results have been reviewed.**
