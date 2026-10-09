# Agent instructions — Aura Farmer

Source of truth in order: docs/DECISIONS.md, docs/COMBAT_SPEC.md, docs/TECH_PLAN.md, docs/ROADMAP.md, docs/GAME_DESIGN.md.

- FLEX is an independent risky action: 1s immobile, attacks disabled, 15s cooldown, >=3 enemies within 145px for +25 Aura, interrupted on damage.
- Aura 0-100 is separate from XP and coins; burst at 100 resets to 40.
- Original Cartoon 2D visuals. No copied Riot or Brotato sprites.
- Web solo prototype first. Do not add multiplayer or Discord in v0.1.
- Pure logic must be testable without Phaser. TypeScript strict mode.
- Begin with AF-000: npm install; commit package-lock.json; typecheck, tests, build, browser smoke test. Update docs/VALIDATION.md.
- Small PRs, no unverified claims or silent gameplay changes.
