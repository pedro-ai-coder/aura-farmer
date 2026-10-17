# Phase 4.16 — Special-drop and upgrade variety follow-up

## New player feedback

A human tester could not defeat or survive the first mini-boss (Reply Guy). Level-up offers felt repetitive, Aura Magnet was not seen, and Aura Snack healing drops felt too rare. These are **playtest findings**, not evidence that later waves or Big Hater are balanced.

## Verified causes in production code

- Ordinary kills rolled **1.8% Aura Snack** and **0.3% Aura Magnet**; elites rolled **12% and 2.5%**, respectively.
- After only **two uncollected specials of the same kind anywhere on the map**, no more of that kind could spawn. A distant pickup could therefore permanently suppress all later opportunities.
- Waves one and two reserved two of three level-up cards for defense and area damage **even after both were already equipped**, leading to frequent repetition.
- Special pickups required the same 38-unit proximity as XP crystals, despite their low frequency.

## Candidate changes awaiting owner playtest

| Item | Before | This PR |
| --- | --- | --- |
| Normal-kill Aura Snack chance | 1.8% | 5.0% |
| Normal-kill Aura Magnet chance | 0.3% | 2.0% |
| Elite Aura Snack chance | 12% | 20% |
| Elite Aura Magnet chance | 2.5% | 8% |
| Maximum visible specials per kind | 2 (no replacements) | 5; recycle the oldest uncollected special of the same kind |
| Aura Snack pickup distance | 38 world units | 56 |
| Aura Magnet pickup distance | 38 world units | 72 |
| Regular XP pickup distance | 38 | 38 (unchanged) |
| Early defensive and area-clear guarantees | Repeated on every wave 1/2 upgrade | Only apply until a suitable item is acquired |

Drop probabilities are independent, use **one seeded random roll per eligible kill**, and preserve regular XP crystals exactly. At 200 ordinary kills, the probability of at least one generated magnet is approximately **98.2%**, assuming all 200 kills are eligible. This is a spawn probability, not a guarantee the player collects or sees it.

The current special pool only includes **Aura Snack** and **Aura Magnet**; this change does not invent any additional item, shop, currency or backend. Three weapon slots, five passive slots, rarities, caps and hero kits remain unchanged.

## Validation

- [ ] TypeScript, all Vitest suites, build, Playwright, secret audit, and Vercel preview green on the final SHA.
- [ ] Normal/elite special drop distribution deterministic in multiple seeds; XP remains intact when on-map specials are recycled.
- [ ] Pickup radii and one-time magnet XP collection verified.
- [ ] Legal, varied upgrade offers verified across all three heroes after AOE and defense acquisition.
- [ ] Nine real-damage seeded six-minute runs include **specials spawned vs collected**, Reply Guy defeated, and HP remaining for live event bosses.
- [ ] Check whether the first boss is actually defeated or remains alive in the simulations; do not claim the miniboss is fixed based on survival alone.
- [ ] Human playtest: see at least one magnet, reach pickups, experience less repetitive upgrades, and report Reply Guy's difficulty.
- [ ] Optional full-length runs and later-wave/boss sign-off still required.

This remains a **Draft** iteration. A green CI build does not prove satisfactory gameplay or authorize merge.
