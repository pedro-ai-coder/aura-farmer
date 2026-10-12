# Aura Arena unified visual release — October 2026

Visual release includes all six code-authored hero animations, four rival classes (NPC/Hater/Beta/BIG HATER), new geometric non-botanical stage, XP, projectiles and frame-timed pooled combat FX. Menus, loading, HUD, selection, upgrades, pause, wave celebration, results, achievements and rankings use one arcade skin.

Default route now uses this full visual treatment. The `?visual=legacy` route preserves old art for comparisons. Gate A/B preview flags also remain.

Combat stats, unlock requirements, achievements, local progression, hitboxes and backend have not been changed. Preview-only character unlocks do not carry into production.

**Source honesty:** these visuals are purpose-authored editable TypeScript native-pixel sprite studies. They are not layered Aseprite hand-painted atlas masters. Full independent artist production, authored layered masters, and physical low-end Android performance testing remain separate launch-quality obligations.

QA: TypeScript, Vitest, Vite build, Chromium desktop / landscape / portrait, five-wave behavior, fullscreen texture refresh, player/in-game visual key verification.
