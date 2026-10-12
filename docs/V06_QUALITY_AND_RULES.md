# Aura Farmer v0.6 — Quality, Stability & Performance

## Implemented
- Automatic pause when the browser tab becomes hidden during active combat. No background damage, cooldown advancement, lost waves or silent defeats.
- Explicit RESUME action after returning. Existing pause/menu logic and all screen transitions unchanged.
- Clearing joystick and key-event buffers on pause (including when Scene.update is skipped). This avoids queued FLEX/FOCUS/upgrade actions leaking across pause boundaries.
- Skip redundant Phaser Image.setTexture calls when the current key and frame already match, avoiding repeated geometry/event/GPU state changes per frame.
- Native fullscreenchange now synchronizes the immersive HUD even when fullscreen is entered outside the in-game toggle; exiting resets layout/controls.
- Browser regression tests for background pause, stale key safety, external fullscreen, frame binding efficiency, mobile pause/resume.

## Deliberately unchanged pending game-rules review
- HP, armor, enemy damage/speed/spawn cadence, wave duration, boss win requirement and difficulty curve.
- FLEX radius/duration/reward/cooldown, Focus timing, Aura/XP, shot damage, upgrade weights and unlock rules.
- Score calculation, local records, cosmetics/economy and leaderboard contract.

## QA and known limitations
- CI: npm run typecheck, npm test, npm run build and npm run test:browser; browser tests run Chromium headless and emulated mobile resolutions.
- No physical Android/iOS device or genuine sustained FPS/thermal benchmark is claimed; requires user/device QA.
- The game remains solo/local-save only. No backend or monetization is part of v0.6.

## Rules to agree before any backend/monetization work
1. Session target: keep 5 × 50s waves, or shorten for mobile? How much maximum boss-only overtime?
2. Difficulty: fixed, adaptive by player performance, or three preset difficulties? Enemy caps, special attacks and elite cadence.
3. FLEX: should 3 enemies within 145px for 1s remain the core challenge? Is +25 Aura balanced?
4. Progression: unlock characters via accumulated XP and 67 kills, or add quest-based unlocks?
5. Scoring: should rankings prioritize victory/time, score, survival or a separate competitive mode?
6. Game modes: Classic first versus endless/survival with co-op planned later.