# AURA FARMER — Game Design v1.0 (rules baseline)

**Status: gameplay-direction decisions LOCKED — 2026-10-12. Documentation only; NOT IMPLEMENTED.**
**Owner decision source:** character/weapon design discussion followed by four explicit selections (6 slots, 5 waves ~5 min, small permanent boosts, large scrolling obstacle map).
**Primary rule document for the next gameplay release.** Supersedes *planned* mechanics in older v0.1 / v0.6 documents. For what the current deployed build ACTUALLY does, consult `docs/COMBAT_SPEC.md` (v0.1 baseline) and the TypeScript simulation. Do not claim that any rules below are already live.

## 1. Locked design contract (do not revise without user direction)

1. **Six-slot loadout**: exactly **three weapon slots and three passive slots**, including the character's starting weapon in the three weapon slots. Players cannot equip a seventh slot. New level-up options may upgrade existing items when category slots are full.
2. **Short run**: **five combat waves**, targeting **approximately five minutes total play** (including selection/inter-wave downtime in typical play). This is a *target*, not an instant-loss timer. The final boss must remain finishable.
3. **Permanent progression**: every character gains persistent Character Mastery XP from runs. Mastery unlocks more levels/maps/challenges/skill options and **small capped permanent attribute benefits**, never unlimited stat growth.
4. **Larger scrolling map**: gameplay world is larger than the rendered viewport. The camera follows the player. Solid obstacles create meaningful navigation and projectile interaction.
5. **One miniboss in every wave**, including wave five, with **one guaranteed ability/evolution reward** on defeat. Wave five ALSO contains a separate final boss, BIG HATER.
6. **Build evolution and synergy**: weapons have four upgrade levels before one transformed/evolved state; passives have three levels. Evolution requires a max-level weapon and a compatible passive, plus a miniboss Aura Core (or equivalent guaranteed upgrade reward). Evolutions replace, never add, a slot.
7. **HP and Aura remain distinct**: healing pickups and build-based healing are part of gameplay. Aura continues to be combat momentum and FLEX/Burst fuel, not the HP meter or premium currency.
8. **Distinct playable combat classes**, while preserving the identities of all six existing Aura Farmer heroes.
9. **No backend/monetization implementation** until this gameplay overhaul has been built, tested, and gameplay rules reviewed.

## 2. Combat loop and timings

`Select hero + unlocked arena → clear 5 waves → collect XP / level-up choices → fight a miniboss every wave → claim Core → build/evolve → beat BIG HATER → earn run result + per-character Mastery → unlock challenges/maps.`

**Initial tuning proposal** (NOT frozen numbers): waves 1–4 **45 seconds** each; wave 5 **65 seconds**. Total base combat = **245 seconds (4:05)**; player decision screens and realistic boss combat create an approximately **5-minute run**. Pause all combat clocks during upgrade/Core selection. No artificial game-over at exactly 5:00.

| Wave | Base combat target | Encounter | Guaranteed milestone |
|---|---:|---|---|
| 1 | 45 s | Intro miniboss | First Aura Core: helps fill a weapon or passive slot |
| 2 | 45 s | Mobile miniboss | Core: upgrade/evolution eligibility |
| 3 | 45 s | Ranged miniboss | Core: build specialization |
| 4 | 45 s | Durable / area miniboss | Core: final-build preparation |
| 5 | 65 s | **Wave 5 miniboss**, followed by **BIG HATER** | Fifth Core BEFORE final boss; victory only by defeating BIG HATER |

**Encounter contract**: miniboss telegraphed around 60–65% of each wave; the wave cannot complete without killing its miniboss and collecting or resolving its Core. Spawn outside player collision range and never inside an obstacle. Normal spawn intensity decreases while unresolved miniboss/final-boss encounters are active so the arena remains readable. If the timed interval ends while a boss lives, combat continues without infinite XP farming; no automatic win. In wave five, BIG HATER enters only after the miniboss Core is resolved. Boss location indicator works outside camera view.

**Reward contract**: a defeated miniboss always generates ONE guaranteed Core tied to a reachable position, automatically collected after a short timeout if pickup navigation would prevent collection. Player chooses one of up to three *legal* outcomes: new weapon/passive (if appropriate slot open), level of equipped weapon/passive, eligible evolution. Duplicate or full-slot offers must reroll into legal offers; if no upgrade remains, give a useful fallback (heal or temporary combat benefit), never an unusable reward. There are five guaranteed Core moments per run.

## 3. Build inventory and evolution

- Three **weapons** maximum. Starting weapon occupies one slot; two more weapon slots remain available.
- Three **passives** maximum. Each passive at most **level 3**, each weapon at most **level 4**, followed by **one evolution**; max-level equipment remains effective.
- FLEX and each hero's signature active `SPACE` skill are **character controls**, not weapon/passive slots.
- Class passives are intrinsic traits and do not use a passive loadout slot.
- Choose one of three valid options at XP milestones; stop simulation during decisions. Once six slots fill, offer only owned upgrades/evolutions or defined fallback rewards. Rerolls and category weights are balancing variables, not finalized rules.
- One Core can either improve the build or trigger an evolution. Evolution requires `weapon Lv4 + compatible passive + Core`, consumes that Core, and **replaces** the existing weapon at the same slot.
- Build recipes shown in the collection/build screen before a run; visually signal an evolution-ready weapon in the Core choice UI.
- Every offensive weapon should have at least one viable evolution path; test that a typical five-minute run can reach at least one without unusually lucky random drops.
- Avoid dead-end combinations and softlocks when all items are maxed.

**Proposed initial recipes (subject to balance, names/mechanics provisional)**:

| Weapon | Matching passive | Evolution | New behavior |
|---|---|---|---|
| Mewing Jaw | Drip Check | Gigachad Slam | Wider melee cone / knockback |
| Aura Shot | Mewing Streak | Sigma Precision | Crit projectile penetration |
| Ohio Dash | Bro Has Motion | Ohio Overdrive | Speed trail damage after dash |
| Rizz Aura | Skibidi Bounce | Infinite Rizz | Chain slows / area control |
| Fanum Tax | Touch Grass | Tax Collector | Bounded damage-to-heal loop |
| 67 Volley | Locked In | Ultimate 67 | Faster radial volleys with burst |

**Migration from current buffs**: inventory is refactored from today's 16 independent cumulative buff IDs. Map recognizable buffs to weapon/passive upgrades or character traits, preserve the core FLEX mechanic, deprecate any incompatible buff (with an explicit mapping/migration), and version the run rules. Do not silently strip permanent achievements or unlocked heroes.

## 4. Playable classes — starting kits and player agency

Each of six existing heroes owns a distinctive **starting weapon (1 slot)**, an **intrinsic passive** and a **class-special ability (`SPACE`, outside slots)**. Universal `E` = FLEX; movement and auto-attacks remain simple. Unique actives have visible cooldown/readability and cannot replace the player's choice to reposition.

| Existing hero | Combat identity | Strategic advantage | Weakness / counterbalance |
|---|---|---|---|
| **Alpha Chad** | **Tank / melee** | High HP, armor, short-range slam, shield special | Slow and vulnerable to kiting |
| **The Sigma** | **Ranged DPS / balanced** | Reliable aimed Aura Shot and burst Focus | Less sustain than tanks |
| **Ohio Kid** | **Mobile melee DPS** | Dash, close-range bursts, dodge mobility | Fragile in crowds |
| **The Rizzler** | **Control / support** | Area slow and zone damage | Lower direct single-target DPS |
| **Fanum Lord** | **Bruiser / sustain** | Close-range attacks, self-heal, XP magnet | Needs engagement; cannot heal passively to full |
| **Six-Seven Kid** | **Ranged AoE DPS** | Wide volley, multi-target and ricochets | Vulnerable to individual heavy targets |

The references are **Brotato** (legible fast auto-battles + constrained builds) and **League of Legends Swarm** (character roles, weapon synergies, unlock progression). All art, names, lore, code and attacks remain original to Aura Farmer; no Riot assets required. Do not copy League of Legends champions into the game.

## 5. Health, healing, Aura and XP

Three separate resources:
- **HP**: damage reduces it; at zero, run ends (unless a defensive skill saves the player). Healing always capped to current max HP; shields are separate temporary buffers.
- **Aura**: acquired from risk-based FLEX and combat; powers existing Aura rank/Burst interactions, remains separate from HP. No default paid conversion or automatic HP purchase with Aura.
- **XP**: collected on the map to level *within the run* and gain six-slot loadout choices; resets next run.

**Initial heal balancing candidates** (TUNABLE, not agreed fixed rates):
- World **Heal pickup**: ~12% of max HP; visible, with clear pickup range, never spawns inside obstacles.
- Miniboss: **guaranteed small heal opportunity** (e.g. 15% HP medkit) in addition to its Core; not a replacement for the Core. Player on full health may skip it.
- Wave transition: ~10% of max HP, excluding any overheal.
- Touch Grass passive: bounded out-of-combat regen; Fanum conditional sustain: limited proc rate to avoid immortal builds.
- Optional gentle low-health drop weighting can be playtested, but avoid invisible rigging or infinite health loops.

Health, shields and Aura colors/icons are distinct, readable on mobile and with reduced flashing enabled.

## 6. Character Mastery and unlocks

The existing **Run Level** (XP earned during one attempt) is not the same as **Character Mastery** (persistent XP gained after every run, win or lose).

**Locked principle**: successful and failed runs both earn persistent character XP, weighted by wave progress and minibosses defeated, with a victory bonus. Each character has an independent Mastery level. **Initial proposal**: Lv1–20, with mild monotonic XP thresholds (tuning required). Keep achievements/unlock states already saved. Suggested milestones:

| Mastery | Provisional unlock |
|---|---|
| 1 | Core character kit |
| 3 | New skill/evolution recipe |
| 5 | Eligibility for map/difficulty Tier 2 when prerequisite challenge completed |
| 8 | Alternate class-skill variant or build recipe |
| 12 | Advanced map/difficulty Tier 3 challenges |
| 20 | Cosmetic mastery badge/skin and title |

**Small permanent stats**: e.g. by Lv20 at most **+5% max HP**, **+3% damage**, **+3% speed** cumulative. Distribution, stacking, HP/damage rounding and balance values require playtests. Never unlimited power scaling, pay-to-win or unlock-grind mandatory for first clear. Competitive equalized mode can ignore Mastery stats while retaining progression unlocks.

**Map unlocks**: unlocked *globally for the player* once a map challenge and modest Mastery prerequisite are satisfied, rather than forcing full replay on all six heroes. Higher difficulties/tier unlocks can require clearing earlier maps. Distinguish 1) run level, 2) character Mastery, 3) map/difficulty tiers in the UI.

**Persistence**: retain guest/offline `localStorage` until backend phase is explicitly authorized. Version profile migration from `profile:v1` to `v2` when implementing; maintain selected character, hero unlocks, run history, achievements and settings. Import/migration must be repeatable/idempotent with a fallback on corrupt saves. No account/login requirement.

## 7. Scrollable arena and solid obstacles

First map target **world ~1600×1000** versus current fixed 960×600 presentation. The **camera follows the player smoothly** and clamps at world edges. World/render coordinates are separate, HUD/controls stay screen-fixed. Camera works with mouse/keyboard and thumb controls, mobile portrait and landscape, and fullscreen/resizes.

**Initial obstacle prototype**: 6–10 readable solid structures distributed among clear movement lanes. Props do not resemble farms, fields or trees. Define an obstacle collision layer reused for player, enemy navigation, and projectiles. Do not spawn a hero, boss, enemy, Heal, XP or Core inside a wall or outside reachable routes; safe spawn radius and obstacle-aware collision resolution are mandatory.

Design requirements: simple deterministic steering/waypoints for enemies, no trapped bosses, corridor width suitable for both tank and boss, line-of-sight/shooting rules, projectile stop/bounce behavior consistent with skills. Directional cues for off-camera elites, miniboss Core and medkit. Avoid giant camera jumps and hidden ambush damage. Performance benchmark on emulated mobile first; real-device sustained-FPS and thermal testing remains required.

Candidate maps: Aura Arena Central (first), Ohio Underground (tier 2), Rizz District (tier 3), Sigma Tower (later). Only map one is in initial implementation scope unless a separate content milestone is accepted.

## 8. Planned implementation batches — gated by testing, not monetization

**Phase 0 — Design baseline (THIS DOCUMENT ONLY):** lock core choices, list tuning variables, preserve old design as historical reference, update roadmap and decision log. No gameplay code, no Vercel preview required.

**Phase 1 — Builds/data migration:** introduce weapon/passive registry, hard 3+3 slots, level 1–4 weapons, level 1–3 passives, legal-choices generator, existing buff mapping, upgrade and evolution UX. Unit tests: no seventh item, no dead choices, evolution slot preservation, consistency with seeded RNG.

**Phase 2 — Character identity:** six role-balanced character starting weapons, built-in passives, `SPACE` actives, effects/sprites and class-specific UI. Keep FLEX universally accessible. Test combat, cooldown, auto-attacks, class win viability.

**Phase 3 — Wave encounters, minibosses and HP:** five guaranteed minibosses with unique telegraphed attacks, reachable Core choices, heal pickups, boss phase after wave-five miniboss and inter-wave heals. Test forced drop, no reward duplication, time overtime, boss unlock and pickups under full/zero HP.

**Phase 4 — World & camera:** larger traversable map, solid collision geometry, enemy steering and line-of-sight, correct projectile collision and map pickup placement, minimap/indicators if needed. Test corners, boss pathing, fullscreen, portrait/mobile HUD and no clipping.

**Phase 5 — Offline Mastery:** per-hero XP persistence, Lv1–20, small stat cap, map tiers/unlocks, profile migration, clearer post-run feedback. Test backward-compatible saves, defeat XP, repeated result idempotency, no duplicate unlocks, accountless operation.

**Phase 6 — QA & balancing:** 5-minute target, build viability, high/low-sustain balance, FX visibility, boss pacing, no performance regressions. Check frame time, load time, FPS and physical Android/iOS devices; 60 FPS desktop / 30 FPS entry-level mobile are performance goals, not verified outcomes. Only after user gameplay review: discuss backend/rankings and monetization scope.

Each implementation batch (when authorized later) should ship as a feature branch → test suite → Vercel preview → reviewed/validated merge. Do not start these phases merely because the documentation was merged.

## 9. Open balance variables (explicitly NOT locked by user)

- Exact wave timings/spawn seconds and boss overtime limits; 5 waves / ~5-minute target **are** locked.
- Base HP, HP restore percentages, heal drop frequencies and shields.
- Specific evolution recipes and unlock milestones, and whether **1 reroll per wave** is enabled.
- Mastery XP curve and permanent attribute caps; small capped bonuses **are** locked.
- Specific map dimensions, obstacle count/layout and minimum corridor widths; larger scrolling solid-obstacle arena **is** locked.
- Difficulties and leaderboards, scoring system and whether competitive runs normalize Mastery stat modifiers.

These require automated balance simulations + hands-on review *after gameplay implementation*. No server, store, subscriptions, ads or purchases are approved at this stage.
