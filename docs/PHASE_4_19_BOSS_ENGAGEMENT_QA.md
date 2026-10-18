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

## First confirmed complete wins (real damage, no injected victory)

On code commit `e86d83ed7003c00661b586d0ded38bb55e0fcf03`, the [nine-seed boss workflow](https://github.com/pedro-ai-coder/aura-farmer/actions/runs/39124527420) completed successfully with all 18 simulation checks green. The bot's pre-15:00 input and build policy were unchanged compared with PR #86. Only the **post-entrance movement and aim policy** changed.

| Hero | Seed | Result | Time | Boss HP damage | Remaining player HP |
| --- | ---: | --- | ---: | ---: | ---: |
| Sigma | 47001 | Defeat — wave 4 | 10:22 | 0 | 0 |
| Sigma | 47002 | Defeat — wave 3 | 7:24 | 0 | 0 |
| Sigma | 47003 | Defeat — wave 5 | 13:07 | 0 | 0 |
| Cool Kid | 47001 | Defeat — wave 3 | 7:15 | 0 | 0 |
| Cool Kid | 47002 | Defeat — wave 3 | 6:42 | 0 | 0 |
| Cool Kid | 47003 | Defeat — wave 5 | 12:41 | 0 | 0 |
| Alpha Chad | 47001 | **Won** | **17:29** | **30,000** | **127.71** |
| Alpha Chad | 47002 | **Won** | **17:20** | **30,000** | **239.18** |
| Alpha Chad | 47003 | **Won** | **17:38** | **30,000** | **103.04** |

The Alpha Chad victories occur **before** the 18:00 berserk threshold; they do not validate recovering from berserk. In the earlier PR #86 survival-only bot, Alpha reached berserk 3/3 times but did virtually no boss damage. This strongly indicates a **test player engagement problem**, not a need to cut Big Hater's approved 30,000 HP.

The full-run test now also **requires at least one legitimate 30,000-HP boss defeat** in the fixed seeds. It will not pass simply because the bot survives 20 minutes. This does not prove a human can reliably win, nor does it show Sigma or Cool Kid reaching Big Hater. They remain the priority for a separately approved **hero survivability/progression balance** iteration.

## Known incomplete functional acceptance

- No Sigma or Cool Kid complete-run victory in these seeds.
- No playthrough validating a victorious run *after entering* the berserk state.
- No manual on-device playtest of Big Hater attacks, aiming, and final result screen.
- No production damage, defensive stats or equipment numbers have been changed in this evidence-focused PR.

## Evidence and acceptance

- [ ] Run the same nine hero/seed complete attempts with the updated boss-attack policy and report true wins/losses/remaining boss HP.
- [ ] Compare results through wave five with PR #86. The movement policy before 15:00 must remain unchanged so early survival is comparable.
- [ ] Separate **boss targeting problems** (inadequate engagement range or line of sight) from **combat balance problems** (damage too low, unavoidable attacks, unfair berserk regeneration).
- [ ] If Big Hater still cannot be defeated with legal items and an engaged bot, propose an evidence-driven numeric adjustment for explicit owner review; do not grant free damage.
- [ ] Confirm TypeScript, Vitest, build, Playwright, secret audit, scoped full-run QA and Vercel for the final PR SHA.
- [ ] Manual gameplay across Sigma, Cool Kid and Alpha Chad, including boss entrance, damage feedback and victory, remains a product acceptance gate.
- [ ] Explicit owner approval before merge.

**No new services, persistence, login, backend, equipment, or unapproved mechanics.** The PR validates the existing approved combat design; it does not yet resolve Sigma/Cool Kid late-wave survival or certify game completion.
