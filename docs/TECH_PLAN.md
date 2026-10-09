# Technical Plan — Aura Farmer v0.1

Stack: Phaser 3.90, TypeScript strict, Vite 6, Vitest 3, Node 22.
Architecture: src/game/core pure mechanic modules (aura/flex/progression/math/constants); src/game/data buffs/enemies; src/game/scenes/ArenaScene.ts for simulation orchestration; src/game/render/textures.ts for Cartoon procedural visuals; src/main.ts bootstrap; tests in tests/.
Principles: deterministic core logic when possible; don't entangle Phaser with core business rules. Keep paths compatible with relative Vite base './'.
Run locally: npm install; npm run dev. Validate: npm run typecheck; npm test; npm run build.
AF-000 is hard blocker before additional features: npm install, lockfile, build, browser smoke test, fix all regressions.
Later: refactor simulation components; a server-authoritative Colyseus system for co-op; embed same web client as Discord Activity only after core gameplay approval.
Risks: frame-dependent timers, projectile/enemy performance, balancing of FLEX, licensing of third-party assets (use original art only).
