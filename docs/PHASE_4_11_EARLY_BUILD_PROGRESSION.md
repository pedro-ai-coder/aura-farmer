# Phase 4.11 — Early-wave build progression

## Problem

Player reports: Sigma defeated at 4:01 (wave 2, level 11); Cool Kid defeated at 3:29 (wave 2, level 10). Both demonstrate difficulty before the boss, but two examples cannot establish overall win rates.

## Change

During waves 1–2, the three normal level-up offers now reserve one slot for an **existing, role-eligible defensive passive** when at least one legal candidate exists. The selection remains seeded and deterministic.

This does not add passives, change rarity restrictions, change level caps, grant free items, or adjust damage and enemy stats. The player still chooses whether to invest in defense.

## Validation

- [ ] Unit tests verify three distinct, legal offers and a defensive choice for all three heroes in waves 1–2.
- [ ] TypeScript, Vitest, build, Playwright and Vercel pass on final HEAD.
- [ ] Run the nine complete seeded attempts from PR #76; compare wave reach and survival before/after this change.
- [ ] Human test confirms that a defensive option is understandable and useful, while AOE builds remain viable.
- [ ] Boss difficulty remains meaningful.

This is a **targeted progression experiment**, not a claim that early difficulty is fully balanced.
