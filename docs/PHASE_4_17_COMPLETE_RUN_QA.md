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

## First complete-run results — reproducible evidence

Source: [Complete-run boss QA, GitHub Actions run #39118324028](https://github.com/pedro-ai-coder/aura-farmer/actions/runs/39118324028), tested code commit `023a0f9930975f1c37bdb045a3a029b19e5ae203`. The dedicated test workflow passed **18 tests (nine six-minute deterministic checks and nine extended attempts)**. This means the **test execution and invariants succeeded**, not that a game was won.

| Hero | Seed | Actual active time | Wave reached | Level | Final outcome |
| --- | ---: | ---: | ---: | ---: | --- |
| Sigma | 47001 | 6:44 | 3 | 16 | Defeat during Mod Supremo |
| Sigma | 47002 | 6:36 | 3 | 15 | Defeat during Mod Supremo |
| Sigma | 47003 | 6:58 | 3 | 16 | Defeat during Mod Supremo |
| Cool Kid | 47001 | 6:32 | 3 | 15 | Defeat during Mod Supremo |
| Cool Kid | 47002 | 9:17 | 4 | 21 | Defeat as Ohio Express entered |
| Cool Kid | 47003 | 6:46 | 3 | 15 | Defeat during Mod Supremo |
| Alpha Chad | 47001 | 14:13 | 5 | 25 | Defeat during Doomscroll Prime |
| Alpha Chad | 47002 | 13:07 | 5 | 25 | Defeat during Doomscroll Prime |
| Alpha Chad | 47003 | 10:53 | 4 | 24 | Defeat after Ohio Express |

**Outcome: 9/9 defeats, 0/9 reached Big Hater at 15:00, 0/9 saw berserk or won.** Every attempt defeated the first Reply Guy, so its earlier bottleneck improved under this guided policy. Four attempts acquired a legendary item; five died before the legendary phase at 9:00.

The logs attribute large amounts of stage-three damage to **Doomscroller** (up to 242 HP to a Cool Kid run), with **Mod Supremo** and remaining Haters adding pressure. Two Alpha Chad runs in wave five took roughly **601 and 611 HP damage from Ping Snipers**. These are priority investigation targets, not proof of incorrect individual damage values. Compare their attack telegraphs, overlap, spawn frequency, player avoidance and shield availability before choosing new balance numbers.

### Product-readiness consequence

The current browser PoC has **not** met the complete-game playability criterion. This iteration should be reviewed as an **evidence-gathering PR only**. A later, separately scoped balance PR should investigate the wave-three and wave-five damage concentrations, followed by another identical complete-run comparison. It is not appropriate to declare the Big Hater validated, adjust boss HP blindly, or call the current design balanced based on a green workflow.

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
