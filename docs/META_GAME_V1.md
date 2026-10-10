# AURA FARMER — META GAME / PERSISTENCE DESIGN v1.0

**Status:** APPROVED 2026-10-10; v0.4/v0.5 playable systems implemented in PR #17; online backend and public rankings remain proposals  
**Based on:** repository main inspected 2026-10-10. Tech is Phaser 3 + TypeScript + Vite on Vercel; current core `Arena` starts with Sigma and has only a run-scoped progression system. No database, backend functions, login, persistent save or leaderboards currently implemented. Art direction: approved Lavender Pop Pixel Cartoon.

## 1. North star — the complete player loop

`Launch → Home → Pick Character → Choose Mode → Run (5 waves) → Results → Save personal best + achievements + XP unlocks → Home`.

Design priorities:
1. Fun gameplay and replayability, **not a mandatory login gate**.
2. Every character must be viable; strategic differences rather than objective power creep.
3. Privacy and safety by default, especially because game humor may appeal to minors.
4. Leaderboards should show **verified** records only, not arbitrary client values.
5. Build in small PRs, keep browser and Android landscape fully playable after each merge.

## 2. Game state / navigation and UX

Required routes/screens (may be Phaser scenes or HTML overlay router, architect chooses after prototype):
- `BOOT`: load save / assets; show quick splash on loading.
- `HOME`: PLAY; CHARACTERS; ACHIEVEMENTS; LEADERBOARDS (disabled/"COMING SOON" until backend); COLLECTION; SETTINGS. Last used character visible.
- `CHARACTER_SELECT`: carousel/grid of 4 initial characters, 2 unlockable. Portrait, difficulty, 2-passive-plus-starting-weapon description, progress toward unlock, locked preview, confirm selection.
- `MODE_SELECT`: Classic (five 50s waves, Big Hater), Daily Challenge (future), Endless (future). Only Classic clickable initially.
- `GAME`: existing `ArenaScene` and controls unchanged; pause available from touch and keyboard, settings overlay, exit confirmation.
- `RESULTS`: win/defeat, selected character, elapsed active time, wave, kills, level, Aura peaks, FLEX success/fail, XP, score, personal-best indicator, achievements and unlocks obtained. Retry / Home.
- `ACHIEVEMENTS`: categories Combat / Aura / Exploration / Character; icon/title/description/progress, unlock date, reward if any.
- `LEADERBOARDS`: Classic Global / Character / Weekly / Daily (later); name display, rank, score, character, date; player opt-in and privacy controls.
- `COLLECTION`: discovered buffs, bosses, enemies and cosmetics (progress flags only to start).
- `SETTINGS`: SFX/music volume, reduce flashes/motion, joystick size and side, language EN, save/export/reset, optional account connection.

Mobile requirements: landscape first, responsive safe areas and thumb reach; portrait degraded gracefully; keyboard/controller can navigate menus; minimum 44×44 CSS touch areas; UI text remains HTML/Phaser text, not baked into sprite PNGs. Never cover gameplay HUD with touch UI. Add pause and resume-from-focus-loss. Back buttons should not silently discard runs.

## 3. Player and character roster

**Starting launch roster (4 playable at first character-select release)**

| ID | Name | Identity / gameplay | Example baseline modifiers to playtest | Starting weapon | Passive/trigger |
|----|----|----|----|----|----|
| `sigma` | The Sigma | Balanced all-rounder; maintains existing game's behavior | HP 100%, damage 100%, move 100% | Aura Shot | Starts with current FLEX/Focus; no extra penalty |
| `alpha` | Alpha Chad | Melee tank, more risky in crowds | HP +20%, move -8%, ranged damage -10% | Mewing Jaw | +10% close-range damage near 3 enemies |
| `rizzler` | The Rizzler | Control and survival | HP -10%, damage -8%, slow effects +15% duration | Rizz Pulse (low damage) | Brief slow pulse after 12 kills; non-stacking with Rizz Aura unless carefully defined |
| `ohio` | Ohio Kid | Fast, fragile, evasive | HP -25%, move +18%, crit +5pp | Ohio Blaster | Every X meters moved grants a capped bonus shot (playtest to tune) |

**Achievement-unlock roster (phase after core selection)**

| ID | Name | Unlock condition (candidate) | Mechanical identity |
|----|----|----|----|
| `fanum` | Fanum Lord | Collect 500 cumulative XP across runs | XP pickup +25%; slower projectile fire; scavenger |
| `six-seven` | Six Seven Kid | Kill 67 enemies in a single run AND trigger Six Seven at least once | Radial shots with limited target bounce; fragile, high variance |

**Progression contract:**
- All characters use the same core controls: move, autoattack, FLEX, FOCUS (or a clearly described character-specific passive).
- Character definitions must be **data-driven**: `id`, `name`, `startingStats`, `startingWeaponId`, `passiveId`, `unlockRuleId`, `spriteKey`, `description` and `balanceVersion`.
- Modifiers calculated centrally, not hard-coded throughout `Arena.step()`; run constructors accept `characterId` and seed (optional). Restart preserves selected character; return Home can change it.
- Characters may alter starting weapons/passives but must not make standard upgrades unavailable unless explained in UI.
- Unlock only via achievements/play (no pay-to-win); equal access to leaderboards, with separate per-character boards for fairness.
- Existing Sigma and boss functionality must remain regression-compatible; sprite sheets must be new original pixel art, following `docs/ART_BIBLE.md`.

## 4. Achievements / challenges

All achievement definitions are **versioned, data-driven and event based**. Events from core: `run_started`, `enemy_killed`, `flex_started`, `flex_success`, `flex_interrupted`, `xp_collected`, `buff_chosen`, `wave_cleared`, `boss_defeated`, `run_finished`, `character_unlocked`.

Suggested initial 12 achievements:

| Achievement | Objective | Rewards |
|---|---|---|
| First Aura | Finish first run | Badge |
| No Aura? | Win Classic once | Badge |
| Touch Grass | Clear wave without taking damage | Badge |
| Main Character | Win with Sigma | Cosmetic badge |
| Flex On Them | 10 successful FLEX uses cumulative | Badge |
| FLEX Master | 3 successful FLEX in one run | Badge |
| Skill Issue | Lose to Big Hater | Humorous badge |
| SIX SEVEN | Kill 67 enemies in one run | Progress toward Six Seven Kid |
| Ultimate 67 | Trigger Six Seven + Skibidi Bounce synergy | Badge |
| Loot Goblin | Collect 500 XP cumulative | Fanum Lord |
| Character Arc | Win with 3 distinct characters | Badge |
| God Aura | Trigger Aura Burst 10 times cumulative | Badge |

Progress must come from authoritative run event aggregation (for local system, from current run), not frame-by-frame UI polling. Idempotency: event ID and run ID prevent duplicate rewards, unlocks and leaderboard entries. Offline achievements persist locally and merge into an authenticated profile later, with basic conflict resolution; not all client-side records qualify for verified leaderboards.

Avoid manipulative daily streak FOMO, random paid upgrades or punitive login gating.

## 5. Local persistence FIRST (no new backend to start)

Use `localStorage` for **small** versioned profile data (settings, unlocks, achievements, personal bests), keeping save payload small; optionally IndexedDB for larger run history/replays. Profiles survive browser refresh on same device. Consider private browser/cookie clearing: saves may disappear. Offer save export/import as JSON with schema validation and user confirmation.

Schema `SaveV1` proposal:
- `schemaVersion`, `localProfileId` (random UUID), `createdAt`, `updatedAt`
- `selectedCharacterId`, `unlockedCharacterIds`, `achievementProgress`, `achievementUnlockedAt`
- `personalBests` keyed by mode + character + balance version
- `lifetimeStats`, `settings`
- `lastCompletedRunSummary` and capped `runHistory` (e.g., max 50)
- No user-generated public nickname or PII in local save.

Never persist current `Arena` object as raw JSON (it has class instances and internal timers); only durable state and results. On corrupted save, recover without preventing Play. Versioned migration `v1→v2`. No external telemetry for the offline phase.

## 6. Proposed online architecture (NOT YET PROVISIONED)

`Phaser 3 / Vite (Vercel static) → Profile/Rankings service (Vercel Functions at /api or Supabase Edge Functions) → Supabase Postgres + Auth`.

Why: minimal infrastructure changes, relational leaderboards/achievement metadata, account support, RLS, SQL queries, backup/migration tools. Supabase is a **recommendation**, no project or DB is currently linked or created. Keep gameplay playable if online services are unavailable.

Auth MVP:
- Guest without login works offline. Later optional Supabase anonymous auth for cloud identity, then upgrade/link email or OAuth only when requested by player.
- Anonymous auth user IDs are not portable after clearing browser storage without account linking. Explain this in UI before relying on cloud progress.
- Explicit consent + age-appropriate privacy; do not collect email, birth date, precise location or public free-form chat for core gameplay.

Tables (Postgres):
- `profiles` (`user_id` PK references auth user, `display_name` nullable/moderated, `visibility`, `created_at`, `updated_at`)
- `profile_progress` (`user_id` PK, `save_schema_version`, `last_seen`, `level_account`, `xp_account`)
- `character_unlocks` (`user_id`, `character_id`, `unlocked_at`) unique user+character
- `achievements` (`achievement_id` PK, `version`, `definition_json`, `active`) catalog
- `player_achievements` (`user_id`, `achievement_id`, `progress`, `unlocked_at`) unique user+achievement
- `runs` (`run_id` UUID PK, `user_id`, `character_id`, `mode`, `rules_version`, `seed`, `started_at`, `finished_at`, `wave`, `kills`, `score`, `duration_ms`, `verified`, `verification_reason`)
- `leaderboard_entries` (`season_id`, `mode`, `character_id`, `user_id`, `best_run_id`, `score`, `recorded_at`) composite unique for player/character/season/mode
- `seasons` (`season_id` PK, `start_at`, `end_at`, `rules_version`, `status`)
- `daily_challenges` (`day` PK, `seed`, `rules_version`, `scenario_id`) later

Important constraints:
- Enable RLS with least-privilege policies on exposed tables, especially ``profiles`, `character_unlocks` and `player_achievements`. Never place Supabase secret/service-role keys in the browser.
- A client-submitted `score`, `kills` or `runFinished` is **not** proof of a legitimate game. Do not insert raw client claims directly into public/official rankings.
- Backend run session token + expiry, fixed game rules version/seed + rate limits, score sanity checks and nonces are minimum best-effort protections. For competitive **verified** leaderboards, deterministic replay/event verification or server-authoritative result validation must be completed before public release. Browser-only anti-tampering is insufficient.
- Store only necessary player data; nickname moderation, opt-in leaderboard, no public email or contact fields, privacy/export/delete support. No social DMs/chat at launch.
- Document reset rules and equal conditions for Classic/Daily; never mix different balance versions or game modes in ranking tables.
- Never make the game require an internet connection for solo Classic runs.

## 7. Ranking rules

**Classic:** score after win/defeat, with a stable server-side formula. Suggested prototype:
`score = 100 × clearedWaves + 10 × kills + 25 × successfulFlex + 5 × levelReached + 500 × bossDefeated`.
Adjust during balancing; score calculation should be shared deterministic code and a versioned contract. Use a *validated* run only.

Leaderboards:
1. Classic Global (best score by player, per balance version).
2. Classic per character (prevents Sigma overwhelming specialist scores).
3. Weekly challenge with same seed/rules for all players.
4. Daily challenge (fixed seed, single scored attempt, retries for practice unranked), **later**.

Show top 50, player standing, most recent run, privacy preferences, refresh/rate limit. Guest/unverified progress remains local and should be labeled "Personal best (unverified)" until verified. Moderation and nickname constraints required before public display.

## 8. Release roadmap / PR slicing

### v0.4 — Game shell + local persistence (P0)
PR 1: `GameShell` with menu, pause and results, keyboard + landscape touch navigation; keep existing intro behind feature gate until validated.
PR 2: `SaveV1` with schema migration, import/export/reset, achievements event pipeline, end screen; explicit no backend.
Acceptance: refresh retains selected character/unlocks/results, achievements award once; no loss of gameplay, no crashes in private mode or storage unavailable; browser unit/mobile tests green.

### v0.5 — Playable character roster (P0)
PR 3: data-driven `CharacterDefinition` and selecting Sigma / Alpha / Rizzler / Ohio; independent starting stats, passives, weapon keys.
PR 4: respective original pixel sprite sheets and menu selection portraits with animated previews (needs Art Bible artist input).
PR 5: Fanum / Six Seven unlock rules + achievements UI.
Acceptance: starting stats/loadouts truly change the Arena; all Classic victories possible in automated tests; no character breaks controls; art recognizable.

### v0.6 — Account and database (P1)
PR 6: provision Supabase project securely **after owner confirmation**; SQL migrations, RLS tests, anonymous auth/optional account link, read/write profile synchronization; offline-first conflict resolution.
Acceptance: two browser sessions using same *linked* account can sync; anon sessions remain playable; inaccessible profiles stay private; secrets only server-side.

### v0.7 — Verified leaderboards (P1)
PR 7: server verification pipeline and backend functions for validated runs (anti-tamper); scoring/season/rules version; public opt-in nickname moderation, filters; privacy/delete/export support.
PR 8: Daily seed challenge, per-character boards.
Acceptance: fake/unverified submissions rejected; public leaderboards only verified runs; rate limited; deterministic test runs pass.

### v0.8 — "Real game" polish (P2)
Music/sfx, transitions, controls settings, accessible text/icons, 1–2 new bosses, collection view, unlock animations, analytics **only with appropriate notice/consent**. Discord/coop remains later and needs separate backend.

**Implementation note:** Game Director approved the plan; menus, six playable characters, offline achievements and local saves were delivered in PR #17. Supabase, account sync, security validation and official leaderboards remain future work (staged database schema in draft PR #18, not provisioned). New online services still require explicit configuration and security QA.

## 9. Architecture notes for Codex

- Current core: `src/game/core/arena.ts` contains run-specific state, and restart is `Object.assign(this, new Arena(this.random))`. Introduce constructor options `characterId` and `runSeed` with backwards-compatible default `sigma`, keep RNG determinism.
- Existing `Mode` is `intro | playing | upgrades | between | dead | win`. UI-level meta screen states must be separate from Arena combat mode. Do **not** mix `home` or `leaderboards` into combat state machine.
- Existing `src/game/scenes/ArenaScene.ts` owns HUD and input; avoid re-creating `Arena` on every navigation; factor session management into `GameSession` or a controller.
- Keep scripts `npm run typecheck`, `npm test`, `npm run build`, `npm run test:browser` and physical Android smoke tests.
- Art uses `docs/ART_BIBLE.md` approved Lavender Pop identity; incremental asset replacement with fallback.
- Vercel production on `main`, avoid author-permission deployment errors.

## 10. References

- Supabase Auth anonymous sign-ins: https://supabase.com/docs/guides/auth/auth-anonymous
- Supabase data security and RLS: https://supabase.com/docs/guides/database/secure-data
- Vercel Vite + Functions: https://vercel.com/docs/frameworks/frontend/vite
- Existing: `docs/ROADMAP.md`, `docs/ART_BIBLE.md`, `docs/SPRITE_PRODUCTION_P0.md`.
