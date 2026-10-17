# Phase 4.13 — Early-wave area-clear availability

## Rationale

Player feedback reports deaths at 3:29 (Cool Kid) and 4:01 (Sigma), with area-clear weapons and shields not sufficiently prominent in the early build. PR #78 introduced a defensive option in early offers; this iteration makes the existing role-specific area-clear weapon similarly discoverable.

## Implementation

In waves 1–2, normal level-up selections reserve one slot for a legal defensive passive and one for a legal area-clear weapon when available. The third slot remains subject to the normal upgrade/candidate selection process. All selections are deterministic for a given seed. Existing rarity restrictions, three weapon slots, five passive slots, level caps and combat damage values are unchanged.

Area-clear candidates: Brainrot Feed (ranged), Touch Grass (melee), Personal Space (tank). This does not grant equipment automatically; players choose among the same three offers.

## Acceptance

- [ ] Test that each of the three heroes receives three distinct legal offers including defense and area-clear in waves 1 and 2.
- [ ] TypeScript, Vitest, build, Playwright and Vercel green on the final commit.
- [ ] Compare nine complete adaptive runs against PR #79 with actual survival results.
- [ ] Human playtest confirms AOE readability and build choice variety.
- [ ] No boss balance regression.

The change improves discoverability, not guaranteed survival or win rate.
