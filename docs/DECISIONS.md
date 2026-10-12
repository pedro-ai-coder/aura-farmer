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
