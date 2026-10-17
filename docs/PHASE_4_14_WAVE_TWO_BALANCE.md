# Phase 4.14 — Wave-two difficulty tuning

## Evidence and hypothesis

Two manual playtests reported early defeat: Cool Kid at 3:29 (wave 2, level 10) and Sigma at 4:01 (wave 2, level 11). Both were before the wave-three transition. The sample is small; it motivates a narrowly scoped experiment, not a claim that every hero is too weak.

## Targeted experiment

Reduce the wave-two **Comment Section** enemy damage multiplier from **1.15 to 1.08** and spawn-density multiplier from **1.20 to 1.12**. Leave wave-two enemy HP at **1.30**, item rarity weights unchanged, and all other waves, boss, weapon and passive statistics untouched. Difficulty still increases over wave one.

These numbers are provisional. Keep or revise them only after comparing real runs with the pre-change baseline.

## Acceptance requirements

- [ ] Run TypeScript, Vitest, production build, Playwright and Vercel on final HEAD.
- [ ] Execute nine adaptive full-run attempts (three seeds × three heroes) on both base and this branch, preserving all actual early deaths.
- [ ] Compare median survival, wave reached, XP, damage taken, Flex usage and boss outcomes.
- [ ] Human playtest verifies early difficulty feels fair while wave three and Big Hater remain challenging.
- [ ] Document before/after outcomes and any regressions before requesting merge.

No new mechanics, services, persistence or account requirements. This PR is an experiment and is not yet evidence of a balanced release.
