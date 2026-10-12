# Decisions — Aura Farmer

- D-001: Original top-down roguelite inspired by Brotato/Swarm, not a clone.
- D-002: Cartoon 2D rounded art style.
- D-003: FLEX is a risk action, separate from character special.
- D-004: Browser solo keyboard first; mobile and multiplayer later.
- D-005: Discord Activity and authoritative server are a future phase.
- D-006: Phaser 3.90 + TypeScript + Vite for v0.1.
- D-007: XP and Aura are distinct; shop/coins follow later.
- D-008: Procedural 2D graphics for initial prototype.
- D-009: Five waves of 50 seconds, boss in final wave.
- D-010: Test build and real gameplay before moving ahead.

## Open playtest questions
Is FLEX +25 balanced? Are upgrades too frequent? Is the boss feasible? Do animations remain readable with many enemies?

## D-011–D-020 — Game Design v1.0 (2026-10-12, locked for next gameplay release)

- D-011: Exactly 6 loadout slots: 3 weapons (including starting weapon) + 3 passives. No seventh equipped item.
- D-012: 5 combat waves; normal completed run targets approximately 5 minutes total, not a hard defeat timer.
- D-013: Weapon levels 1–4, passive levels 1–3. Synergistic evolutions replace their weapon slot and require max level + passive + miniboss Core.
- D-014: Exactly one miniboss per wave; each grants one guaranteed legal ability/evolution reward. Wave 5 also has BIG HATER final boss after the miniboss.
- D-015: Dedicated heal pickups and bounded HP recovery; Aura and XP remain separate resources.
- D-016: Six existing heroes occupy complementary Tank / Ranged DPS / Melee DPS / Control / Bruiser / Ranged AoE roles, with class skills plus universal FLEX.
- D-017: Per-character persistent Mastery from every run, unlocking challenges/maps/options and **small capped permanent attribute increases**.
- D-018: Larger scrollable world with follow camera, solid obstacles, collision-safe spawns and enemy navigation.
- D-019: Current game/production continues unchanged until a separately authorized implementation phase; documentation changes do not imply code completion.
- D-020: Gameplay and player review precede backend, public leaderboard verification and monetization. Existing achievements/local profile must survive migration.

**Canonical future rules:** [Game Design v1.0](GAME_DESIGN_V1_LOCKED.md). The older D-009 (five 50s waves) and `COMBAT_SPEC.md` describe the **currently implemented** older build; v1.0 fixes only the five-wave/~five-minute target and leaves individual timings to balance QA.

## D-021–D-025 — Hybrid affinity and transformations (2026-10-12)

- **D-021 [APPROVED]** Choose hybrid **Option C**: retain established Aura Farmer heroes while introducing new evolvable starter archetypes; avoid replacing/deleting saved character identities.
- **D-022 [APPROVED DIRECTION]** Alpha, Sigma and Rizz are the **initial three** affinity themes. Collectible essence progress influences the associated item/upgrade drops, rather than instantly auto-equipping items or adding currency slots. Essence is separate from battle Aura, XP, HP and guaranteed miniboss Aura Cores.
- **D-023 [PROPOSED PILOT]** Cool Kid (Alpha affinity) → Giga Chad and Nerd (Sigma affinity) → Sigma Kid, with weapon Lv4 + compatible passive + essence progress + a miniboss Core. Each transformation also evolves a weapon **in the same existing slot**. One major form per run.
- **D-024 [GUARDRAIL]** Preserve 3 weapons + 3 passives, 5 waves ~5 min, 5 minibosses/Cores, heals, capped permanent Mastery and larger scrolling world. Existing six hero save IDs, unlocks, achievements and local history survive migration. Combat Mastery belongs to original selected base, not temporary evolved form.
- **D-025 [NOT YET LOCKED]** Specific drop percentages, affinity threshold, secondary-affinity bonuses, archetype HP/attack stats, number of further evolved branches, unlock schedule and VFX implementation remain tuning proposals. No gameplay implementation or backend/monetization begins in this documentation change.

See [Hybrid Affinity & Evolution extension](AFFINITY_EVOLUTION_HYBRID_V1.md) and [Game Design v1.0](GAME_DESIGN_V1_LOCKED.md).

## D-026–D-030 — Single FLEX Ultimate direction (2026-10-12)

- **D-026 [APPROVED]** One prominent, manually activated FLEX power charged by Aura Farming replaces standalone Focus in the NEXT gameplay version. Existing deployed v0.6 mechanics are historical and unchanged for now.
- **D-027 [APPROVED]** FLEX effect follows primary Alpha/Sigma/Rizz affinity, selected character, equipped build and current evolved form. FLEX remains outside 3 weapons + 3 passives. Essence does not pay Aura charge.
- **D-028 [APPROVED CONCEPT]** Cool Kid + Alpha uses Giga Chad Rampage: approximately five seconds of damage immunity and steerable enemy-trampling collision damage. No instant-kill bosses or wall-clip immunity.
- **D-029 [RECOMMENDATION]** Ready FLEX never auto-casts; replace old automatic 100-Aura Burst and stationary 3-nearby-enemy check. Do not allow active FLEX kills to recharge the same FLEX. Prominent mobile/keyboard ready and active HUD, accessible reduced motion.
- **D-030 [BALANCE OPEN]** Suggested threshold 100, first charge wave 1–2, 2–4 uses/run, boss collision damage ~20–25% max boss HP per cast, Aura rank bonus continuity and variant durations require playtests.

Detailed specification: [FLEX_ULTIMATE_V1.md](FLEX_ULTIMATE_V1.md). D-003 and earlier FLEX+Focus proposals are historical for the current build, superseded for the future design.
