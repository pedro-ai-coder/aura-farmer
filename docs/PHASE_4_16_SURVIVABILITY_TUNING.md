# Phase 4.16 — Early-wave survivability and ranged-enemy pressure

## Player evidence

Two manual playtests reported defeat in wave two: Cool Kid at 3:29 (level 10) and Sigma at 4:01 (level 11). Both occurred after Reply Guy arrived at 3:15.

The original wave-one roster selected NPC and Hater with equal probability after 1:30. This generated too many ranged shooters, each launching a projectile every 2.4 seconds. The GDD specifies a three-second Hater interval.

## Proposed balance values

| Parameter | Main before | This PR | Change |
| --- | ---: | ---: | --- |
| Wave 1 enemy damage multiplier | 1.00 | 0.80 | -20% |
| Wave 1 spawn-density multiplier | 1.00 | 0.90 | -10% |
| Wave 2 enemy damage multiplier | 1.08 | 0.88 | -18.5% |
| Wave 2 spawn-density multiplier | 1.12 | 1.00 | -10.7% |
| Wave 1 Hater share after 1:30 | 50% | 12.5% | -75% relative |
| Wave 2 Hater share | 20% | about 11.1% | about -44% relative |
| Hater projectile cooldown | 2.4s | 3.0s | matches GDD |
| Reply Guy base/contact/cone damage | 18 | 14 | -22.2% |

Phone Guy NPC base damage remains **8**. We tested a temporary reduction to 5.5, but it did not materially improve melee/tank survival, so it was reverted rather than retaining an ineffective change. All regular mob HP and XP values, hero stats, weapons, passives, shield rules, Flex, upgrade caps, boss encounters and waves 3-5 are unchanged. Reply Guy still appears at 3:15, has 1,400 HP and spawns four NPCs every 12 seconds.

## Validation defects discovered and corrected

The Vitest configuration originally excluded `src/**/*.test.ts`, leaving numerous previous balance suites unexecuted. Both `tests/**/*.test.ts` and `src/**/*.test.ts` are now included. Five previously hidden failing tests were corrected to respect hero mitigation and boss spawn/upgrade restrictions; the production rules were not weakened to make tests pass.

The previous square-moving simulation repeatedly collided with arena boundaries. The guided policy now collects nearby XP, avoids walls, and closes distance to ranged shooters with melee/tank heroes. It reports actual damage by source and records nine deterministic attempts of up to six minutes, including the 3:15 miniboss.

Earlier guided traces showed all three Sigma attempts reaching 3:00, while three Cool Kid and three Alpha attempts died in wave one. Lowering only Phone Guy damage did not solve this; ranged Hater projectiles accounted for most HP damage to these heroes. The Hater population/cadence changes above target that specific problem.

## Required before merge

1. Confirm TypeScript, all discovered Vitest tests, build, Playwright and Vercel on final HEAD.
2. Review the nine guided six-minute traces, including losses and enemy damage attribution. Confirm whether Cool Kid and Alpha can reach wave three more reliably.
3. Separately execute nine optional complete attempts: `AURA_ADAPTIVE_FULL_QA=1 npm test -- adaptive-build-balance.test.ts`. Preserve genuine early defeats.
4. Manually play Sigma, Cool Kid and Alpha Chad, including Reply Guy, AOE builds, shield feedback and Flex.
5. Verify later waves and Big Hater remain challenging; obtain owner approval before merge.

This remains a gameplay balance **proposal**, not a claim that the whole game is balanced. No new mechanics, persistence, login, backend or paid services are introduced.
