# FLEX Ultimate playable implementation — v0.7 horizontal slice

**Status:** Implemented in feature branch as an independently playable FLEX + affinity slice. See original proposal [FLEX_ULTIMATE_V1.md](FLEX_ULTIMATE_V1.md).

## Implemented in this slice
- Replace old separate Focus and automatic Aura Burst with one 100-point manual Aura-charged FLEX.
- FLEX activation starts immediately and lasts 5 seconds on simulation time; active kills cannot refill its own gauge. Rank milestones (25/50/75) remain earned for the run after consuming charge.
- Three distinct family behaviors: **Alpha Rampage** (5s invulnerable, steerable high-speed collision attack with per-enemy hit delay and 25% per-cast boss-trample cap, normal ranged auto-fire suspended); **Sigma Overclock** (increased fire rate, crit damage and one capped piercing follow-up); **Rizz Takeover** (controlled slowing pulses and bounded AoE damage).
- Three readable collectible affinity essence drops, visible tint-coded pickups and affinity counts. Enemy class biases drops; dominant affinity informs FLEX effect and XP upgrade offers; minority affinity remains legal. XP/Aura and essence are separate.
- First two new selectable Archetypes **Cool Kid** and **Nerd** with original native-pixel code-authored animations and portraits. Existing six heroes retain all IDs and save data. Both new heroes are unlocked by default; unlocked checks for Fanum and Six-Seven unchanged.
- One prominent flexible FLEX HUD, large mobile one-button activation, keyboard E, short activation spotlight; remove independent SPACE Focus and old tutorial/control text.
- v0.6 auto-pause and input flushing still apply; game still runs the existing five-wave and final-boss system.

## Intentionally not yet included in this FLEX slice
- The full **3 weapons + 3 passives inventory overhaul** and item Lv4/passive Lv3 recipes.
- **Permanent** Giga Chad/Sigma Kid character-form evolution via miniboss Aura Core. Cool Kid/Nerd have **temporary FLEX animation silhouettes**, not an unlocked evolved form. This is the next phase's mechanic, not a fabricated achievement.
- **Five minibosses/guaranteed Cores**, expanded scrolling obstacle map, Mastery XP/offline profile v2 migration, heal pickups and backend/monetization.
- Hand-painted layered source sprite masters and physical Android/iOS performance testing.

## Balance/validation notes
- All new numbers are first playable tuning values, not confirmed optimal after human playtests: 100 Aura charge, +5 or +7 Aura per kill, 38% enemy affinity drop chance, 5s FLEX duration, Sigma fire boost 2.6×, Rizz pulse 700ms, Alpha boss trample cap 25% and full temporary invulnerability.
- Existing stats and 16 buff IDs are retained for compatibility until the six-slot transition. Since Aura Burst now tracks FLEX activations in the old result field, UI achievement strings and later backend rules need migration before verified global leaderboards.
- Browser and Vitest regression coverage includes six existing heroes, two new starters, state transitions, Alpha boss cap, Essence selection, phone HUD and post-pause safety.
- This is a VISIBLE gameplay slice of the wider locked Game Design v1.0, not a claim of the entire design being implemented.
