# FLEX ULTIMATE — Aura-charged, build-dependent special

**Design approved 2026-10-12; the FLEX Ultimate and Essence systems have a first playable implementation.** Additional phases are tracked in [FLEX_IMPLEMENTATION_SLICE.md](FLEX_IMPLEMENTATION_SLICE.md).
**Extends:** Game Design v1.0, Hybrid Affinities Option C.
**Supersedes planned future mechanics:** independent Focus/SPACE skill, stationary audience-based FLEX, automatic Aura Burst at 100. Those old special abilities were replaced by the first FLEX Ultimate gameplay slice.

## 1. The one-action rule

There is **one** special action: FLEX. PC uses E; mobile uses a single prominent FLEX button. No standalone Focus or second active special. Characters remain distinct through starting weapon, intrinsic passive, class, affinity, evolved form and the **effect of their FLEX**.

FLEX lives **outside the 3 weapons + 3 passives**, so it never consumes an inventory slot. Alpha/Sigma/Rizz Essences from drops remain non-spendable affinity counters and do **not** directly pay the FLEX cost. XP controls run levels; HP controls survival; Aura alone fills the FLEX gauge. The miniboss Aura Core is a **different** reward (upgrades/evolutions); it does not automatically fill FLEX.

## 2. Charge and activation — initial tuning proposal

State machine: **FARM (0–99) → FLEX READY (100) → press E → ACTIVE → RECOVER → FARM**.

- Earn Aura Farming charge by combat/kills, skilled close-range actions, wave events and class-modified combat. Charge contributions and threshold to be balanced. **100 Aura is a proposed threshold**, not a final numeric approval.
- Once full, the gauge holds at READY and the game highlights the large FLEX action. **No automatic trigger** and no automatic reset-to-40 Aura Burst.
- The player activates FLEX when it matters (crowds, low HP, miniboss, BIG HATER). Charge is spent at activation. Active effect lasts a fixed time based on variant; cool-down is principally the need to recharge.
- No one-second immobile cast or three-enemy-audience requirement; those were the older mechanics and are replaced.
- While FLEX is ACTIVE, the player does **not generate new FLEX charge** from ability damage, kills, blocked attacks or spawned items. Prevent unbounded refill loops. A short post-activation grace/lock (1–2 seconds) is an option if needed.
- **Proposed pacing:** first FLEX attainable within waves 1–2; approximately 2–4 uses in a typical five-minute run. Low-health and close-combat classes must be able to charge it, rather than having their progress repeatedly erased by hits.
- Existing Aura rank thresholds/bonuses (25/50/75) need a deliberate migration. Recommendation: the one meter measures spendable FLEX charge while modest earned rank milestones persist for the run, so activating FLEX does not remove all passive earned buffs. No second charge bar or new economy. Test to prevent a snowball.
- Use simulation time for duration/charges, so pause, switching browser tabs, level-up screens and mobile fullscreen never silently expire FLEX.

## 3. FLEX power resolver: build matters without 24 custom abilities

A FLEX is selected from: **primary affinity (Alpha/Sigma/Rizz) + selected hero/active evolution form + equipped weapon/passive synergies**, with at most one small secondary-affinity modifier. Snapshot the result at activation; do not change active effects midcast.

**Alpha — RAMPAGE:** temporary invulnerability/unstoppable body attack, contact damage and knockback. Strong crowd cleanup; bosses receive limited damage.

**Sigma — OVERCLOCK:** enhanced automatic fire, precision, crit chance/penetration, higher single-target damage. No invulnerability by default.

**Rizz — AURA TAKEOVER:** large slow/control pulses, spread of status effects, conditional defense/heal with strict limits. Boss crowd-control resistance applies.

Specific showcase examples (mechanical names are provisional):
- **Cool Kid + Alpha:** Giga Chad Rampage, 5s invulnerable player-steered stampede; weapon/equipment can widen hit path.
- **Nerd + Sigma:** Sigma Kid Overclock, rapid penetrating critical shots for approximately 5s, capped hit/multishot.
- **Alpha Chad + Alpha:** Unstoppable Chad, larger defensive rush without changing into the separate Giga Chad form.
- **The Sigma + Sigma:** Sigma Lock-In, precision burst with a critical chaining cap.
- **The Rizzler + Rizz:** Infinite Rizz Pulse, wave of control + delayed area pulses.
- **Ohio Kid + Alpha/Sigma:** Ohio Blitz, faster dashes with a single Alpha shove or Sigma crit modifier.
- **Fanum Lord + Alpha/Rizz:** Fanum Tax Break, close-range pressure with limited capped sustain.
- **Six-Seven Kid + Sigma:** 67 Overdrive, enhanced radial volleys with projectile-count/ricochet caps.

ALL heroes can still build any of the three affinities. Unlisted combinations use the corresponding affinity's core FLEX family plus a class-aware tweak, **not** a fourth unrelated currency, unusable power or unique animation for every hero/affinity pair. Without any essence drops, the base hero still gets a useful neutral FLEX when charge is full.

## 4. Highlight: Cool Kid + Alpha → Giga Chad Rampage

**Player's requested fantasy:** gather enough Aura → activate FLEX manually → be indestructible for **around five seconds** → steer directly through crowds of enemies, damaging and knocking them away.

- Temporary **complete damage immunity** during the advertised time. Incoming hits are visually blocked; no silent exceptions that chip HP, no retroactive save if the player already died.
- **Player-steered** charge; not a non-interactive cutscene. Boost movement moderately while respecting solid world obstacles, map borders and enemy separation.
- Contact damage is **per target with an internal hit interval**. No per-render-frame damage exploits. Ordinary enemies can be one-hit defeated if appropriately weak.
- Elite/miniboss targets take strong **but capped** damage; bosses resist knockback and cannot be automatically erased by one FLEX. Suggested starting cap is **20–25% of a boss's max HP per activation**, subject to playtests.
- Enemy deaths during the effect can still drop normal XP/heal/essences according to rules, but those kills **do not recharge the active FLEX**.
- This FLEX can be usable before Cool Kid's permanent-for-this-run **Giga Chad form transformation**. The form remains a distinct weapon Lv4 + compatible passive + miniboss Core choice. Evolving the form changes visuals/amplifies impact in a bounded way, not a second invulnerability skill, free activation or extra slot.
- Example hybrid: Alpha primary + Sigma secondary adds one limited critical follow-up; Alpha primary + Rizz secondary adds short crowd slow. A single secondary modifier, never an extra five-second FLEX.

**5s invulnerability is explicitly the user's example;** validate with bosses and survival curves before treating it as final balance. Goal: powerful and fun without making the last boss trivial.

## 5. HUD: make FLEX the centerpiece

- Prominent **AURA 0–100** bar and a clearly readable **FLEX READY — E** indicator, with icon/name of current affinity variant and a large reachable mobile control.
- Remove the separate Focus button and independent SPACE hint from the planned HUD. Optional SPACE can be an alternate binding to the **same** FLEX action, never a second skill.
- At READY: restrained glow/color pulse and single sound cue, without repeating flashing or obscuring enemies. With reduced motion: steady contrast, text and icon.
- During ACTIVE: large **GIGA CHAD RAMPAGE — 5.0s** timer, clear invulnerability FX and brief end-of-effect warning. Maintain visual differentiation between active FLEX, Evolution Core and heal pickup.
- Current dominant/secondary affinity must be recognizable by both icon/label and color. Show actual FLEX effect preview/tooltip in character/build and pause screens.
- Short first-run tutorial explains **farm Aura → ready → manually press → powered phase → recharge**.

## 6. Interaction, safety, tests and scope

- FIVE waves ~five minutes, one miniboss + guaranteed Aura Core each wave, BIG HATER last, heals, six-slot builds, one form transformation/run and offline Mastery are all unchanged.
- FLEX readiness must not be lost accidentally during upgrade or Core-choice screen. No input buffering into a paused/dead/gameover state.
- Keep enemy collisions and player movement valid during trampling; projectiles, contact damage, boss caps and kills must be consistent with frame-independent simulation, rather than Phaser rendering frequency.
- Test 0/99/100 boundary, double activation, charging under low HP, all affinity+class fallbacks, tie-breaking, pause/tab hide during ACTIVE, map collision, large boss hitbox, zero recursive charge, mobile pointer/key activation and proper legacy save/result migration.
- More powerful flexes cannot make mastery progression/online competitive rules pay-to-win; the verified ranking contract is future scope.

**Locked conceptual choice:** one prominent Aura-charged manually activated FLEX replacing Focus; affinity/build-specific buffs; a ~5s invulnerable trample for Cool Kid/Alpha. **Not locked yet:** 100-point threshold, precise Aura yields, FLEX uses/run, other FLEX durations, 20–25% boss cap, rank retention, cooldown details, stats and VFX intensity.

**Implementation status is tracked separately in [FLEX_IMPLEMENTATION_SLICE.md](FLEX_IMPLEMENTATION_SLICE.md).** This specification also contains balance directions not yet implemented.
