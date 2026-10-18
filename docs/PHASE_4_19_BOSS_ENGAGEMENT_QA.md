# Phase 4.19 — Big Hater engagement and hero-balance evidence

## Problem

The validated nine-seed PR #86 candidate allowed **Alpha Chad to reach Big Hater in 3/3 runs**, but the boss retained almost all of its 30,000 HP at the 20-minute test horizon. Sigma and Cool Kid did not reach the final encounter with these fixed seeds.

The existing guided survival bot had **no Big Hater target**: once the regular enemy list cleared at 15:00, it continued following an eight-second square. Close-range weapons could therefore not hit the boss. This is a QA input-policy gap, **not evidence that the production weapons cannot hit or that the boss should lose HP automatically**.

## Test-harness change (not a production mechanic)

- After the real 15:00 boss spawn, steer toward the boss's current position while circling at a weapon-appropriate distance.
- Use the existing **manual aim** input to target the boss. The production game's closest-target auto-aim and normal projectile/area collisions are unchanged.
- Keep actual boss damage, defense, telegraphs, shots, collision, regeneration, berserk, healing, enemy AI and regular damage.
- Avoid active circle hazards and obstructions where possible. This is a deterministic strategy that is **not representative of human skill**.
- Record actual boss HP damage, time within close attack range, and closest approach.
- Add a separate isolated encounter regression that confirms each starter weapon can damage Big Hater via the same public combat engine. That fast-forward fixture is **not** counted as a victory or as a complete game.

## Evidence and acceptance

- [ ] Run the same nine hero/seed complete attempts with the updated boss-attack policy and report true wins/losses/remaining boss HP.
- [ ] Compare results through wave five with PR #86. The movement policy before 15:00 must remain unchanged so early survival is comparable.
- [ ] Separate **boss targeting problems** (inadequate engagement range or line of sight) from **combat balance problems** (damage too low, unavoidable attacks, unfair berserk regeneration).
- [ ] If Big Hater still cannot be defeated with legal items and an engaged bot, propose an evidence-driven numeric adjustment for explicit owner review; do not grant free damage.
- [ ] Confirm TypeScript, Vitest, build, Playwright, secret audit, scoped full-run QA and Vercel for the final PR SHA.
- [ ] Manual gameplay across Sigma, Cool Kid and Alpha Chad, including boss entrance, damage feedback and victory, remains a product acceptance gate.
- [ ] Explicit owner approval before merge.

**No new services, persistence, login, backend, equipment, or unapproved mechanics.** The PR validates the existing approved combat design; it does not yet resolve Sigma/Cool Kid late-wave survival or certify game completion.
