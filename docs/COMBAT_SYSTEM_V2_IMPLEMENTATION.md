# Combat System V2 — migration and delivery order

Status: **isolated code registry committed; NOT integrated into the playable runtime**.

## Authority and coordination
- Owner's newer decision supersedes the 3+3 loadout and Alpha/Sigma/Rizz essence mechanics in GAME_DESIGN_V1_LOCKED.md.
- Do not merge this work over current art/world/CI changes. Rebase on the latest main AFTER existing work is reviewed. In particular, leave PR #46 CI/security work untouched, and do not interfere with unfinished #18, #29, #40–42.
- Keep existing hero IDs, saved unlocks, map rendering and the recently merged Ruin Alley world slice.
- Existing active design plans are historical when conflicting with V2. Update docs/DECISIONS.md, docs/GAME_DESIGN_V1_LOCKED.md and docs/ROADMAP.md only at integration point after rebase, so concurrent authors are not overwritten.

## Accepted mechanics
- One universal Aura meter, independent of XP; 100 threshold, manual E/touch FLEX, no affinity variants or Focus.
- One mechanically distinct Flex per existing character. Registry currently defines eight planned personalities (six veterans and Cool Kid/Nerd), but IDs **must be verified against production roster** before wiring.
- Exactly 3 weapons from 6, four ranks. Five passive slots and exactly 28 available passives: 10 normal to 4, 8 rare to 3, 6 epic to 2, 4 legendary to 1; at most one legendary.
- Passive offer gates: rare at XP 3, epic at XP 6, legendary at XP 10; legal offers only; fallback heal when exhausted.
- Five combat waves maintained with escalating coefficients: HP 1.22^(wave-1), damage 1.13^(wave-1), spawn density 1.18^(wave-1).
- Offensive secondary procs never proc another secondary proc. Cap cumulative continuous passive bonus damage at +75%, weapon cooldown reduction at 35%, crit probability at 50%, passive damage reduction at 35%, and movement speed at 180% of base.
- Combat charge during active Flex does not refill Aura; boss contact burst limited to 25% max HP per Cool Kid activation.

## Implementation sequence (dependencies, not parallel merges)
1. Rebase on main after in-flight map/design/security work. Inventory production hero IDs, weapon identifiers, existing persistence and reward generation. Build a migration table, preserving save compatibility.
2. Adopt src/game/combatV2.ts canonical registries into simulation. Map existing five weapon behaviors and implement missing sixth archetype; replace former weapon roster only after integration tests.
3. Implement new passive offer generator, XP gating and 5-slot authoritative enforcement inside simulation and UI. Remove old affinity, evolution-recipe and Focus decisions from active gameplay (without deleting legacy saves).
4. Implement hero-specific, 100-Aura manual Flex logic with damage/time/boss caps, effects and character-specific HUD labels. Wire all existing heroes and ensure map collision/pause/touch support.
5. Balance each of five waves and miniboss/final boss behaviors within existing Ruin Alley map; keep progression, achievements and unlocks backward compatible.
6. Align desktop/mobile HUD and tutorial with three weapons + five passives + one Flex; do not regress recently authored cartoon artwork.
7. Validate exact commit: TypeScript, Vitest, build, Playwright desktop/mobile, legacy save migration, five-wave simulated playthroughs and READY Vercel preview. Conduct hands-on difficulty review before merge.

## Explicit blockers / no false positives
This branch currently adds only an isolated, typed V2 registry and its deterministic unit contract tests. It does **not** implement steps 2–7 in the live game, has not been run in a local npm runtime, and cannot be represented as feature-complete. Keep PR draft and do not merge or deploy until all gates pass.
