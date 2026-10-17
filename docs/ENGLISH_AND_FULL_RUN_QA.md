# English-language policy and full-run QA

## Language policy

English is the canonical language for all player-facing UI, gameplay messages, menus, accessibility labels, documentation, GDD updates, PR titles/descriptions and technical reports. Conversations with the project owner may remain in European Portuguese.

Preserve branded names, approved item/character names, stable IDs, save keys, and migration compatibility. Do not change gameplay mechanics to translate text. Translate existing Portuguese GDD requirements faithfully; do not silently reinterpret design decisions. Use English in all new documentation and code comments.

## Full-run acceptance plan

Run Sigma, Cool Kid and Alpha Chad across reproducible seeds, with real enemy attacks and damage enabled. Record the commit, seed, browser, viewport, character, build choices, elapsed active time, wave, kills, damage taken/dealt, XP, healing, Safe Spot use, pickups, Flex activations, boss entry, berserk, and final outcome.

Validate five 180-second waves, pause and modal clock freezing, upgrade/legendary choices, boss at 900 seconds, berserk timing, and victory/defeat. Compare results across characters without inventing balance thresholds absent from the GDD. Confirm desktop and mobile landscape UI and input.

## Exit criteria

- [ ] All Portuguese player-facing strings and project documents identified and translated.
- [ ] GDD translated without changing approved mechanics or identifiers.
- [ ] Reproducible complete-run tests and recorded measurements for all three heroes.
- [ ] TypeScript, Vitest, build, Playwright and Vercel green on final PR HEAD.
- [ ] Manual functional acceptance recorded; no known regressions.

This checklist is pending. A successful deployment alone is not acceptance.
