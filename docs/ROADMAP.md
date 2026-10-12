# Roadmap — Aura Farmer

**Current design direction:** [Game Design v1.0 — LOCKED, documentation only](GAME_DESIGN_V1_LOCKED.md). This is the plan for the **next gameplay overhaul**, not functionality already deployed. The old sprint history remains below.

## Next priority — v1.0 gameplay design implementation (NOT STARTED)

- [x] Phase 0 — Freeze decisions: 3 weapons + 3 passives, five ~5-minute waves, character Mastery with small attribute boosts, bigger obstacle map with follow camera.
- [x] Phase 1a — Three affinity drops + true weapon/passive inventory: 3+3 strict cap, real 4-level attacking weapons, existing passives with original maximum up to 3, legal reward selection and in-game loadout UI. See [Equipment slice](EQUIPMENT_WEAPONS_SLICE.md).
- [ ] Phase 1b — Core-gated weapon evolution recipes, transformations and full buff remapping, pending miniboss and progression phases.
- [x] Phase 2a — FLEX playable slice: one chargeable, manually activated Aura FLEX, Alpha/Sigma/Rizz effects, highlighted PC/mobile HUD, Cool Kid/Nerd starter studies. Separate Focus and automatic Burst removed.
- [ ] Phase 2b — Full Giga Chad/Sigma Kid form evolutions via Aura Cores, 3+3 build synergies, all-class balancing. One primary form transformation per run.
- [ ] Phase 3 — Encounters: miniboss every wave and guaranteed Core; separate final BIG HATER; healing pickups and recovery pacing.
- [ ] Phase 4 — World: camera following on ~1600×1000 stage, 6–10 obstacles, collision/pathfinding and projectile line-of-sight.
- [ ] Phase 5 — Per-character offline Mastery: per-run XP, Lv1–20 proposal, capped small permanent attributes, map/difficulty unlocks, safe profile migration.
- [x] Phase 6a — **First combat rebalance slice:** reduce multiplicative equipment snowball, add per-wave enemy threat, reduce free healing, and distinguish Cool Kid invulnerable Rampage from Alpha Chad defensive shockwave FLEX. Initial tuning only: [v0.8 balance details](COMBAT_BALANCE_V08.md).
- [ ] Phase 6b — Full balance and QA: run win rates, FLEX impact, 5-minute pacing, synergy reliability, boss/obstacle pathfinding, responsive fullscreen, real-device FPS and player acceptance.
- [ ] **Rules and gameplay acceptance before backend / monetization** — blocked until previous phases reviewed.

**Approved design extension:** [Single Aura-charged FLEX Ultimate](FLEX_ULTIMATE_V1.md) supersedes Focus, automatic Aura Burst and the old audience FLEX for the NEXT gameplay version. Details such as charge threshold, duration balance and boss damage caps remain tuning proposals.

**Approved design extension:** [Hybrid Affinities & Evolutions — Option C](AFFINITY_EVOLUTION_HYBRID_V1.md). Three run-only essence types Alpha/Sigma/Rizz inform upgrade drops, while XP/Aura/HP and Core remain distinct; existing heroes and profiles are preserved. Exact drop rates, transformation levels and recipes are balancing proposals.

**Frozen constraints** are in section 1 of the design; individual timings, percentages, recipes, Mastery thresholds, exact dimensions and map placements are **proposals awaiting playtest**. No implementation or deployment is part of the design-lock commit.

---

# Roadmap — Aura Farmer

## Sprint 0 (AF-000 first)
- [x] AF-000 Verify install, typecheck, tests, build, browser smoke test; update validation
- [x] AF-001 Basic Phaser/Vite/TypeScript scaffold
- [x] AF-002 Movement, auto shooting, health
- [x] AF-003 NPC, Hater, Beta Bro and boss
- [x] AF-004 Risk FLEX
- [x] AF-005 Aura ranks and Aura Burst
- [x] AF-006 XP and upgrade choices
- [x] AF-007 Five waves and game over/victory loop
- [ ] AF-008 Gameplay QA and balancing
- [ ] AF-009 FX, controls and UI polish
- [x] AF-010 Host HTTPS web preview

AF-000 now has executed validation recorded in docs/VALIDATION.md. AF-001–007 have automated logic/browser coverage; AF-008 human balancing remains open.

## Sprint 1
AF-101 Refactor ArenaScene into systems; AF-102 Shop + coins; AF-103 Aura Challenges; AF-104 Alpha/Rizzler; AF-105 mobile touch controls (implemented in a PR; physical-device QA pending).

## Sprint 2
AF-201 Network contracts; AF-202 Colyseus 2 players; AF-203 4-player coop; AF-204 Discord Activity; AF-205 performance/reconnections.

## v0.3 — Brainrot Invasion (AF-301, issue #8)
Proposed content spec: [BRAINROT_CONTENT_V03.md](BRAINROT_CONTENT_V03.md).
This is the next content priority; #7 (AF-008) can be resumed later. If both progress in parallel, coordinate overlapping combat/UI changes.
- [ ] PR 1: 6 new buffs (Crash Out, Skibidi Bounce, Delulu, Touch Grass, Mogged, Rizz Aura), Ultimate 67 synergy
- [ ] PR 2: Yap Goblin, Ohio Glitch, Fanum Thief with telegraphed behaviors and XP refunds
- [ ] PR 3: Fanum Tax Raid (wave 2) and SIX SEVEN SURGE (wave 3), mobile-friendly HUD and tests
- [ ] Real Android playtest and balancing


## v0.6 — Quality & Performance

- [x] Auto-pause active runs when a tab becomes hidden; require explicit resume
- [x] Clear queued keyboard actions and touch movement when paused
- [x] Remove redundant Phaser sprite texture rebinding when key/frame are unchanged
- [x] Native fullscreen controls synchronized with external enter/exit
- [x] Add desktop/phone Chromium regression coverage and a rules-review document
- [ ] Physical Android/iOS playtest and sustained FPS/thermal benchmarks (needs devices)
- [ ] Human difficulty / game-rules review **before** backend or monetization

See [V06_QUALITY_AND_RULES.md](V06_QUALITY_AND_RULES.md).
