# Phase 4.18 — Late-wave survival tuning and full-run comparison

## Problem confirmed by Phase 4.17

Nine seeded 20-minute-or-death attempts used actual enemy combat, ordinary XP, healing, item upgrades, and Flex. Every attempt died **before** the 15:00 Big Hater entrance. Sigma consistently lost around 6:36–6:58 at Mod Supremo (wave 3), Cool Kid around 6:32–9:17, and Alpha Chad around 10:53–14:13. Damage attribution showed Doomscroller persistent hazards and Mod Supremo in wave three, followed by substantial Ping Sniper ranged damage in waves four and five. See [the PR #85 evidence and run logs](https://github.com/pedro-ai-coder/aura-farmer/actions/runs/39118324028).

The GDD specifies Doomscroller hazard warnings and six-second attack intervals, and Ping Sniper with a **six-second firing interval**. The existing code shot every **4.8 seconds** with Ping Sniper. Wave multipliers are subject to owner balance approval.

## Proposed numeric adjustments

| Value | Previous main | Candidate |
| --- | ---: | ---: |
| Wave 3 mob damage | 1.30× | 1.15× |
| Wave 3 spawn density | 1.40× | 1.28× |
| Wave 4 mob damage | 1.50× | 1.35× |
| Wave 4 spawn density | 1.65× | 1.48× |
| Wave 5 mob damage | 1.75× | 1.58× |
| Wave 5 spawn density | 1.90× | 1.72× |
| Doomscroller relative weighting, wave 3+ | one normal pool entry | one entry versus two for other normal enemy kinds |
| Ping Sniper relative weighting, wave 4+ | one normal pool entry | one entry versus two for other normal enemy kinds |
| Ping Sniper shot cooldown | 4.8 s | 6.0 s (**GDD alignment**) |

No wave 1/2 balance value, enemy HP/XP, player attributes, Flex, weapons, passives, miniboss or Big Hater timing/damage is changed. Every unlocked enemy remains eligible. Relative threat weights reduce the **share**, not the total spawn count beyond the listed density adjustments. Spawn RNG stays deterministic. The five-wave damage and density ramp still strictly increases.

## Controlled comparison

Re-run the same nine seeded guided attempts as in Phase 4.17 (heroes Sigma, Cool Kid, Alpha Chad × seeds 47001–47003), with the same deterministic movement and upgrade policy. Do **not** alter the bot while comparing balance parameters. Collect `[adaptive-balance-full]` JSON from `Complete-run boss QA`.

Compare, per hero: actual survival time, wave reached, minbosses defeated, remaining life and level, damage by source, legendary selection, whether Big Hater spawns at 15:00, berserk at 18:00 where reached, and win/loss outcome. Improvement should be reported numerically rather than assumed. **A successful test workflow only means observations were collected, not that the game is sufficiently balanced.**

## Acceptance

- [ ] TypeScript, all Vitest suites, build, Playwright, security audit and Vercel green on the final commit.
- [ ] Full-length workflow passed and nine actual results recorded with exact SHA.
- [ ] Compare against Phase 4.17 baseline; identify harmful regressions and whether at least some runs reach the boss.
- [ ] Manually test wave-three Doomscroller telegraphs, Mod Supremo, sniper shots and all three heroes in browser.
- [ ] Keep dedicated Big Hater and complete victory validation outstanding until achieved.
- [ ] Explicit owner approval before merge.

This is an **experimental balance change**, not a release sign-off. No persistence changes, login, backend, paid services or newly invented mechanics.
