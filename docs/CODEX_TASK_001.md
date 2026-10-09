# AF-000 — Initial validation and hardening

Goal: turn Aura Farmer 0.1 scaffold into a working browser demo.

1. Use Node 22 and npm install; commit generated package-lock.json.
2. Run npm run typecheck, npm test, npm run build; fix any problems.
3. Run npm run dev and smoke test in Chromium (preferably Playwright): start, movement, autofire, collisions, XP, upgrade choices, success/failure FLEX, Sigma Focus, waves, boss, win/loss and restart.
4. Confirm FLEX only rewards +25 Aura if at least 3 enemies within 145px. Check interrupt, cooldown and that upgrades pause simulation.
5. Fix issues without rewriting the design. Update docs/VALIDATION.md with verified commands and results.

Out of scope: multiplayer, Discord, mobile, store, monetization, backend.
