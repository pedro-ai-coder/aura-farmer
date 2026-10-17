# Phase 4.12 — Adaptive build balance validation

## Goal

Measure whether players who deliberately select existing area-clear weapons and defensive passives survive longer than the first-offer-only baseline from PR #76, following the early defensive offer changes in PR #78.

## Method

- Three heroes (Sigma, Cool Kid, Alpha Chad), three fixed seeds each.
- Real enemy AI, contact damage, attacks, XP collection, equipment choices, Flex and early defeats.
- Deterministic, transparent selection heuristic: prioritize healing at critical HP, defensive passives when injured, area weapons and useful upgrades; select a legal replacement when slots are full.
- Deterministic guided movement seeks nearby pickups, keeps moving around obstacles, and avoids visible enemies; uses Flex when charged. The original twelve-second square was too prone to getting stuck at map boundaries. Neither policy substitutes for human playtesting.
- Default CI (updated in PR #83): nine 360-second attempts, each replayed to check determinism and cover the 3:15 Reply Guy event; damage totals are attributed to their enemy kind.
- Extended suite: nine up-to-1,200-second attempts, logging one-minute snapshots and outcomes.

## Run

```bash
npm ci
npm run typecheck
npm test
npm run build
npm run test:browser
AURA_ADAPTIVE_FULL_QA=1 npm test -- adaptive-build-balance.test.ts
```

Collect the `[adaptive-balance-early]` and `[adaptive-balance-full]` JSON lines and compare them with `[balance-full-run]` from PR #76. Report survival distribution, wave reached, equipment, damage taken/dealt, shield absorption, Flex, XP and boss outcome. Do not infer improved win rates without actual comparative results.

## Acceptance

- [ ] All nine extended attempts executed and logged on an identified commit.
- [ ] Compare adaptive selection against the original fixed-first-option policy.
- [ ] Identify whether early deaths persist in wave 2 and whether area/defensive choices are acquired.
- [ ] TypeScript, Vitest, build, Playwright and Vercel green.
- [ ] Manual playtest and balance sign-off before claiming the game is tuned.

No gameplay mechanics or numeric balance values are changed by this PR.
