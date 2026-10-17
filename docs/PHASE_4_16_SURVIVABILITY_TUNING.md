# Phase 4.16 — Substantial opening-wave survivability pass

## Why this is different from the previous QA-only iterations

Two manual playtests resulted in deaths with different heroes immediately after wave two began:

| Hero | Defeat | Wave | Level |
| --- | --- | --- | --- |
| Cool Kid | 3:29 | 2 | 10 |
| Sigma | 4:01 | 2 | 11 |

The GDD places the Reply Guy mini-boss at **3:15**. Its cone attack, contact damage and four additional NPCs every 12 seconds overlap with the regular wave-two escalation. The early-wave defensive and area-weapon offers added in prior PRs did not directly reduce this incoming pressure. The wave-one Hater selection was **50% after 1:30**, causing a large number of ranged shooters to accumulate; the GDD describes this as an introduction, not half of all new enemies.

## Proposed numerical tuning

| Value | Main before | This PR | Relative change |
| --- | ---: | ---: | ---: |
| Wave 1 enemy damage multiplier | 1.00 | 0.80 | −20% |
| Wave 1 spawn-density multiplier | 1.00 | 0.90 | −10% |
| Wave 2 enemy damage multiplier | 1.08 | 0.88 | −18.5% |
| Wave 2 spawn-density multiplier | 1.12 | 1.00 | −10.7% |
| Phone Guy (NPC) base contact damage | 8 | 5.5 | −31.3% |\n| Wave 1 Hater spawn share after 1:30 | 50% | 20% | −60% share |\n| Hater projectile attack cooldown | 2.4s | 3.0s | +25% interval (matches GDD) |\n| Reply Guy base/contact/cone damage | 18 | 14 | −22.2% |

In combination with the wave multipliers, a regular Phone Guy contact falls from 8.00 to 4.40 damage in wave one and from 8.64 to 4.84 damage in wave two before hero resistance or shields. The NPC's health, speed, XP reward and spawn cadence stay unchanged, so players can still progress through XP rather than facing fewer rewards.\n\nWave two remains more dangerous than wave one. Wave-two mob HP remains 1.30×; all rarity probabilities, XP, weapons, passives, shield rules, Flex mechanics and hero starting stats remain unchanged. Reply Guy still spawns at 3:15 with 1,400 HP, spawns four NPCs every 12 seconds, and retains its attack cadence. Waves 3–5, their event schedules and the Big Hater are unaffected.

## Automated findings so far\n\nThe previous Vitest glob omitted source-level simulation suites; this PR enables them and executes a **mandatory six-minute (360s) seeded comparison** for the three heroes. This includes the first Reply Guy encounter. With the old fixed-square bot, six of nine three-minute attempts ended in wave one, but that bot repeatedly walked into arena boundaries. A subsequent wall-aware pickup/kiting bot still lost all three Cool Kid and Alpha Chad attempts before three minutes with the initial wave/Reply Guy changes. Reducing only Phone Guy damage produced no meaningful improvement, suggesting the Hater projectile composition was the true pressure source; the test now records damage by enemy kind. These failures led to additional Phone Guy contact tuning in this PR. Re-run the same guided policy at the final commit to establish whether this improves outcomes. These scripted policies are not a substitute for manual play.\n\n## Required evidence before merge

1. Confirm TypeScript, Vitest, build, Playwright and Vercel on the final commit.
2. Run PR #79's nine full-length adaptive attempts on both main and this branch; report actual deaths, survival times, wave reach, XP, damage and boss outcomes. Run `AURA_ADAPTIVE_FULL_QA=1 npm test -- adaptive-build-balance.test.ts` separately; normal CI does not execute that optional suite.
3. Run manual game sessions with Sigma, Cool Kid and Alpha Chad, including the Reply Guy event, shield pickups, area builds and Flex. Record character, seed when available, wave reached, and why the run ended.
4. Verify that wave three is reachable in ordinary play without making wave four, wave five or Big Hater trivial.
5. If the change does not materially improve early survival, do not call this balanced; revise tuning based on evidence.

The numbers are a **proposed gameplay adjustment for owner review**, not a claim that balance has been solved. No new mechanics, login, backend, persistence requirements or paid services are introduced.
