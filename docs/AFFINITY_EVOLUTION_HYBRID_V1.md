# Aura Farmer — Affinities & Transformations (Hybrid / Option C)

**Design status:** direction Option C approved by player on 2026-10-12. **DOCUMENTATION ONLY; NOT IMPLEMENTED.**
**Relationship:** extension of the [locked Game Design v1.0](GAME_DESIGN_V1_LOCKED.md). The approved 3 weapons + 3 passives, 5 waves / ~5-minute run, one miniboss Core every wave, healing pickups, character Mastery, capped permanent stats and larger follow-camera obstacle map remain **unchanged**. Treat numbers, character additions and particular recipes below as **proposed balancing and scope**, not separate approvals.
**Goal:** meaningful visible transformation fueled by chosen style of play, *without* adding five separate inventory systems or forcing all players into a predefined route.

## 1. Approved direction: HYBRID — new Evolvers + preserved legacy heroes

The player chose **Option C**, not a replacement of the existing cast. Keep all six existing hero identities, unlocks, run records, achievements, artwork and playable access (where already unlocked). **Do not delete/rename character IDs** when migrating profiles.

Two **new starter archetypes** form the first transformation pilot:
- **Cool Kid** — flexible front-line starter. With **Alpha** as primary affinity and the proper upgraded weapon/passive: transforms into **Giga Chad** during a run. This is a distinct evolution **form**, not a permanent new hero slot.
- **Nerd** — flexible ranged starter. With **Sigma** as primary affinity and the proper upgraded weapon/passive: transforms into **Sigma Kid** during a run.

Retain the original six as **Veteran Heroes** in the character select: **The Sigma**, **Alpha Chad**, **The Rizzler**, **Ohio Kid**, **Fanum Lord** and **Six-Seven Kid**. Their existing unlock restrictions and per-hero Mastery persist. Veterans can collect affinities, use matching weapons/passives and evolve **weapons** immediately, but **new full-body form transformations** should start with the two Evolver archetypes. Later art/content waves may add unique Veteran transformations **without** making these a prerequisite for a playable overhaul.

### Presentation to avoid roster overload

In the launch selection show two tabs: **Evolvers** (Cool Kid, Nerd) and **Veterans** (existing six), plus one consistent character-detail panel with role, starting weapon, special, passive, affinity preference, mastery and preview of potential transformation. This provides an eventual roster of **8 selectable bases**, while keeping new animation/transformation art limited to **2** initial pilots. If budgets/performance are constrained, spotlight four (Cool Kid, Nerd, Rizzler, Ohio) in the home carousel but keep all six Veterans reachable from the selection menu.

No saved Sigma or Alpha Chad should silently turn into Cool Kid or Nerd. Giga Chad must not be confused in UI with the already selectable **Alpha Chad**, and Sigma Kid must not be confused with **The Sigma**. State both parent character and current form in the HUD.

## 2. Three initial affinity pickups — not three new spendable currencies

The **three affinities** are Alpha, Sigma and Rizz. Each has one clear gameplay theme and a unique collectible silhouette, icon and accessible non-color identity:

| Affinity | Icon + suggested art | Gameplay pool | Example skill opportunities |
|---|---|---|---|
| **Alpha Essence** | Orange hex / fist | Tank, melee, stagger, shields, armor | Mewing Jaw, Drip Check, Gigachad Slam |
| **Sigma Essence** | Cyan diamond / crosshair | Ranged, crit, penetration, precision | Aura Shot, Mewing Streak, Sigma Precision |
| **Rizz Essence** | Violet circle / heart-wave | Crowd control, slow, status chains, support | Rizz Aura, Infinite Rizz, crowd-pulse upgrades |

**Resources remain unambiguous**:
- **XP** (normal green diamond): run levels + ordinary 3-option level-up.
- **Aura** (yellow bolt meter): combat momentum charging the future **manual FLEX Ultimate**. The legacy automatic Aura Burst will be removed in the redesign; Aura is never converted to Essence.
- **HP** (red heart): healing/survival.
- **Essences** (three themed icons): *non-spendable run-only affinity progress*. They do **not** occupy any of the 3+3 build slots, do not function as a fourth shop currency and reset at end of run.
- **Miniboss Aura Core**: a *guaranteed rare reward event* after each wave miniboss, not an essence-meter fill and not automatically an extra weapon slot.

Avoid separate Alpha/Sigma/Rizz wallets with prices. The player sees compact primary + secondary affinity progress instead of four new resource bars. Essences inform build offers and a possible form transformation, **not** direct automatic equipping on contact.

## 3. Concrete drop and reward loop

1. Standard enemies still drop **XP** as the baseline. Some drop **one affinity essence**, visibly indicated by enemy type or clear rarity cue; any character may pick up any type. Healing drops are handled separately.
2. On picking an essence, progress the appropriate affinity counter and show brief feedback (e.g. `SIGMA +1`). Nothing is automatically equipped; no six-slot violation.
3. On an XP level-up, the **three legal options** are weighted toward the collected affinity: if the player has been finding Alpha pickups, they see more Alpha-themed melee/defense items, but cross-affinity hybrids remain attainable. Show small ALPHA/SIGMA/RIZZ chips on each option, plus current tier and evolution recipe.
4. At a miniboss death, the Core **guarantees one legal item upgrade/new skill or evolution**. It is the **same already-approved one-Core-per-wave event**; there is no extra boss loot tax for transformation.
5. An **Evolver form transformation** is an eligible Core choice after its conditions are met. It upgrades the signature starting weapon **and changes the hero's form in the same event**. It is never two simultaneous rewards.
6. If a proposed drop would be unreachable inside an obstacle/outside the world, spawn at the nearest reachable location or collect it automatically after a short timeout. Do not allow farming unlimited essence while a timed miniboss/boss is alive.

**Suggested offer weighting, for simulation only:** with a primary affinity, ~60% of viable offered items aligned to primary, ~25% neutral or synergistic secondary, ~15% wildcards (conditional on legal inventory/options). The precise algorithm must re-normalize over **eligible** items, avoid offering duplicates or seventh-slot items, and may use a deterministic seed. These numbers are not locked.

**Suggested affinity pacing, for playtest only:** first clear dominant affinity can be selected naturally by wave 2; reasonable builds should qualify for first major transformation **at the wave 3 or 4 Core**. Ensure enough XP weapon levels and passive choices by that point. Safety net: if the player is one essence short at the wave 4 Core, offer a deliberate conversion or affinity-choice from that Core rather than leaving progression to impossible bad RNG; do not guarantee the transformation without meeting the required weapon/passive recipe.

## 4. Primary and secondary affinity — depth without a combinatorial explosion

Use the **dominant collected type** as primary affinity and the second highest as secondary, with deterministic tie handling. Show one main affinity visibly and up to one secondary synergy in the HUD. Collecting all three types remains legal; the third does not consume slots and is not deleted.

**MVP transformation budget: one major form transformation per run**, for eligible Evolvers only. A secondary affinity can modify **one attack trait** of the primary evolution (e.g., a Sigma crit accent on Giga Chad's slam, or a Rizz slow on Sigma Kid's piercing shot); secondary themes do **not** create nine new full-character sprite sets.

Examples:
- Cool Kid + **Alpha** primary (+ Sigma secondary) → **Giga Chad**, melee slam with one capped critical follow-up; still tank/melee.
- Nerd + **Sigma** primary (+ Rizz secondary) → **Sigma Kid**, piercing projectiles with a brief slow on a cooldown; still ranged DPS.
- Cool Kid + **Rizz** primary, or Nerd + **Alpha** primary: **do not promise a full transformation in the first pilot**. They can build and evolve regular matching weapons while retaining base form, and the UI must disclose that the full-form recipe is not yet unlocked/available. Additional branches are future content, never fake locked promises.

A primary affinity is **not** a class restriction: existing Veteran heroes can create Alpha/Sigma/Rizz builds regardless of their native class. The affinity only biases choices and grants applicable weapon evolutions.

## 5. Explicit form recipes and slot accounting (pilot)

These two are **proposals requiring playtest**, but should be used as initial implementation targets:

### Cool Kid → Giga Chad
- Base: flexible close-combat beginner with a **Mewing Jaw** starter weapon occupying weapon slot 1. Intrinsic passive is a small, capped bonus when fighting near enemies; active skill is a short self-protection move.
- Conditions: **Alpha primary** with a modest collected-essence threshold, **Mewing Jaw Lv4**, **Drip Check Lv2+** (one of max three passive slots), and an unspent miniboss Core.
- Reward: spend **one** Core; Mewing Jaw becomes **Gigachad Slam** (same weapon slot), form becomes **Giga Chad**, with larger telegraphed melee cone + bounded knockback; any shield/HP scaling is capped.
- This recipe must not turn into the existing **Alpha Chad** character or grant permanent free Mastery progression to Alpha Chad.

### Nerd → Sigma Kid
- Base: fragile ranged beginner with an **Aura Shot** starting weapon occupying weapon slot 1. Intrinsic passive slightly rewards sustained precise attacks; active skill improves positioning or focus.
- Conditions: **Sigma primary**, **Aura Shot Lv4**, **Mewing Streak Lv2+** (passive slot), and an unspent miniboss Core.
- Reward: spend **one** Core; Aura Shot becomes **Sigma Precision** (same weapon slot), form becomes **Sigma Kid**, with capped crit penetration and distinctive shot/firing animation.
- Rizz-secondary adds a minor control proc with a cooldown, not a second form or damage-scaling exploit.

**General rule:** a transform is a *signature weapon evolution with an avatar/form update*, not a separate seventh equipment item, additional Mastery character or universally required condition to defeat BIG HATER. Existing non-transform weapon evolutions remain valid.

## 6. Drops by enemy theme — readable, fair and compatible with classes

Initial suggested affinities for current and planned mobs:
- **NPC / all-round fodder**: mostly XP; when essence drops, any of three types.
- **Beta Bro / bruiser**: biased Alpha Essence.
- **Hater / ranged sniper**: biased Sigma Essence.
- **Control-type future elite**: biased Rizz Essence.
- **Minibosses**: ALWAYS the Core and a healing opportunity; themed enemy may drop extra affinity essence but does **not** change the guaranteed Core into an arbitrary color.
- **BIG HATER**: final victory and Mastery rewards, not a sixth Core after victory.

Do not hard-lock one affinity behind an enemy that spawns only in a late wave; wave-one drop pools must permit both Alpha and Sigma starter paths. Spawn/drop quotas should be deterministic enough to prevent grind bottlenecks. Avoid exposing gameplay through loot-box-style random purchases.

## 7. Character Mastery and unlock policy

- **Mastery attaches to the selected base character**, not the temporary form (Cool Kid gains Cool Kid Mastery after a Giga Chad run; Nerd gains Nerd Mastery after a Sigma Kid run). The temporary form resets after each run.
- Existing six Veterans' Mastery/unlocks/achievement progress and historical results must be migrated/preserved exactly. New base IDs `cool-kid` and `nerd` are proposed; do not reuse `sigma` or `alpha` IDs.
- The **recipe book** is visible and explains affinity/weapon/passive/Core prerequisites. Specific evolutions can be unlocked by reasonable Mastery and map objectives; never make players grind many hours before first viable transformation. A short tutorial guarantees enough early drops to demonstrate one mechanic without automatically granting a form.
- Keep small capped permanent stats from the core game design (example capped +5% HP, +3% damage, +3% speed at high Mastery; values under playtest).
- On game over, summary displays base hero, final form (if any), primary/secondary affinity, build, wave, minibosses, evolutions, and Mastery XP earned. Do not send any data to an online service.

## 8. UX + accessibility

- **At most three types of essence** in first playable slice, not six. The full six-slot loadout remains directly visible and always clearly labeled **WEAPONS 0/3 | PASSIVES 0/3**.
- Compact `Alpha / Sigma / Rizz` affinity selector (3 icon pips, one dominant highlight) separate from universal HP/Aura/XP bars. Unique silhouettes/icons plus labels — **never color alone**.
- Hover/tap a skill or Core reward for full description and synergy recipe. Display `READY TO EVOLVE` when appropriate; do not interrupt movement to open cards in the middle of real-time combat.
- Transformation is a **brief, reduced-motion-aware** clear transition between waves/inside paused Core-choice, with explicit new name, sprite silhouette and one changed combat mechanic; no animation blocking input or obscuring a live hitbox.
- All pickups and off-camera Core/Heal drops require collision-safe placement and readable direction arrows in the larger camera map.

## 9. Implementation scope & tests (NO CODING YET)

The implementation roadmap should be reordered to minimize rewrites:

1. **Affinity registry + drops in the simulation:** 3 collectible essence IDs, run counters, seeded weighted legal offers and no resource duplication; XP/Aura/HP remain independent. Test distribution, no unlock softlocks, no seventh item.
2. **3+3 items / evolutions:** existing buffs categorized and leveled, max-tier logic and one-Core upgrade consumption, with responsive recipe UI. Test legality, deterministic run and no extra slot.
3. **New starters + pilot transformations:** Cool Kid→Giga Chad; Nerd→Sigma Kid; keep six Veterans selectable and their original save IDs. Test exact prerequisites, identity integrity, one transformation per run, secondary trait caps and unique art/skill FX.
4. **Miniboss/Core/HP + stage pacing:** five minibosses in five waves, collection fallback, heals and fifth-wave BIG HATER order. Ensure average run length remains ~5 minutes; one evolution attainable in a normal run by wave 3–4.
5. **Bigger world and enemy navigation:** camera, walls, collision-safe drops, AoE/proj line of sight, nav AI and fullscreen/mobile.
6. **Offline per-character Mastery migration + tuning/QA:** new base characters, capped stat boosts, map unlocks, old-save preservation, class balance, readability and real-device tests. Backend/monetization stay out of scope.

**Acceptance criteria:** (a) existing Sigma/Alpha/other profiles and unlocked heroes survive migration; (b) a Cool Kid run can demonstrably become Giga Chad and a Nerd run can become Sigma Kid without exceeding 3+3 slots; (c) unrelated essence never invalidates an inventory; (d) a regular five-minute run provides practical access to one form evolution if player chooses compatible items; (e) low-end mobile readability and reliable pickup collision; (f) all five minibosses guarantee a valid Core.

## 10. Unresolved tuning, without reopening Option C

The user's **hybrid direction is decided**. These specifics remain **recommendations**, not an implementation authorization or locked balance:
- Number of initially unlocked new starters versus whether both are available immediately.
- Exact essence drop frequencies, weighting/pity rules and transformation affinity threshold.
- Exact Cool Kid/Nerd weapon damage, passive level requirements and secondary proc cooldown.
- Whether a single Core can be spent on an essence-threshold completion (trade-off with guaranteed upgrade).
- Which Veteran hero receives the first optional additional full-body transformation.
- Exact sprite budgets and alternate form branches, later affinities Ohio / 67.
- Competitive ranking normalization, XP economics and live-service features.

**No source code, tests, assets, unlock tables, gameplay behavior, backend or monetization are changed by this specification.**

## 11. Approved FLEX Ultimate compatibility

[One Aura-charged FLEX Ultimate](FLEX_ULTIMATE_V1.md) replaces standalone Focus. Alpha/Sigma/Rizz Essence collected during each run influences WHICH FLEX power the build gains; Essence is not spent to activate it. Cool Kid + Alpha gains a roughly five-second invulnerable, player-steered Giga Chad Rampage; Nerd + Sigma gains precision Overclock; Veterans retain hero identities and get class-specific variations of three main affinity families. FLEX can charge before a form evolution; when a miniboss Core later evolves the character, the same single FLEX gains visual/mechanical identity rather than an extra ability. The six-slot limit, five-wave timing and miniboss guaranteed rewards remain unchanged. This is documented only, not implemented.
