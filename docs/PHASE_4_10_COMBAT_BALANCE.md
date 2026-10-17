# Phase 4.10 — Combat balance and survivability review

## Player-reported issue

A Sigma run ended at 4:01 in wave 2, level 11. The player reported high early difficulty, weak perceived area clearing and shield visibility. One screenshot is a reproduction lead, not sufficient evidence for a global numeric rebalance.

## Existing mechanics verified in source

- Ranged: Brainrot Feed (circular blast), No Cap (piercing line).
- Melee: Touch Grass (wide cone), Ban Hammer (cone and push).
- Tank: Personal Space (circular pulse), Cope Shield (shield on hit).
- Shared defensive passives: Built Different, Thick Skin, Certified W.
- Other defensive options include Big Chad Energy, We Are So Back and Too Sigma to Fall.

## Required evidence before numeric tuning

1. Run all nine full-length seeded attempts from PR #76; retain JSON output and early deaths.
2. Add a player-like policy that selects damage, AOE and survivability upgrades instead of always selecting option zero. Compare survival and wave reach.
3. Compare early survival (0–180s, 180–360s), XP gained, upgrade frequency, Flex activation, effective shield absorption, area damage and boss reach for each hero.
4. Check whether the player can recognize shield absorption and AOE hits in the HUD and world effects.
5. Only then propose numeric changes to enemy density/damage, XP offers or weapon values; include before/after evidence and avoid adding unapproved mechanics.

## Automated guardrails

`combat-balance-guardrails.test.ts` asserts role-specific AOE availability, common defensive choices, shield absorption and the effectiveness of Thick Skin for all three heroes.

## Exit criteria

- [ ] All new guardrail tests pass.
- [ ] TypeScript, Vitest, build, Playwright and Vercel pass on the final PR commit.
- [ ] Nine complete attempts reviewed with actual outcomes.
- [ ] Quantified balance adjustments and regression comparison, if needed.
- [ ] Human playtest verifies that early survival, shield feedback and AOE clearing are readable.

This PR establishes measurable safety checks. It does **not** claim that the difficulty has already been corrected.
