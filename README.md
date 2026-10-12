# AURA FARMER — Pixel Cartoon Brainrot Roguelite

A fast-paced solo browser roguelite built with Phaser 3, TypeScript, and Vite. Survive five waves, collect XP and affinity essences, charge FLEX Ultimate and defeat the Big Hater.

## Play online

**[Play Aura Farmer](https://aura-farmer-ecru.vercel.app)**

The Vercel deployment tracks `main`. Visuals are now **Aura Arena by default**; `?visual=legacy` is available for old-art comparison. Changes appear once merged and the production build succeeds.

## Game menu and progression (FLEX Ultimate slice)

The updated main menu offers **PLAY CLASSIC**, **CHARACTERS**, **ACHIEVEMENTS**, **LEADERBOARDS** (local/unverified results only), and **SETTINGS**.

- Six starting characters: **The Sigma**, **Alpha Chad**, **The Rizzler**, **Ohio Kid**, plus new Evolvers **Cool Kid** and **Nerd** with original pixel sprite studies.
- Two unlockable Veteran heroes: **Fanum Lord** (+25% collected XP) and **Six Seven Kid** (starts with Six Seven). Existing profile unlocks are preserved.
- Every character has distinct starting gameplay stats and a dedicated native-pixel code-authored visual study, animation and menu portrait. These studies are not separately hand-painted layered atlas masters.
- **12 local achievements**, unlock progress, recent run history and personal-best scores persist in browser `localStorage`. The save is per browser/device and clearing site data can erase it. Guests can always play without an account.
- The in-game **MENU** button pauses the simulation. After victory or defeat, the results panel shows kills, XP, Aura, FLEX performance and score.
- Online accounts, permanent cloud saves and *verified* public rankings are **not yet implemented**. A client-side submitted score cannot safely become an official online record.
- Local score formula (subject to balancing): 100 × waves cleared + 10 × kills + 25 × successful FLEX + 5 × level + 500 if Big Hater defeated.
- Scope of this slice: [FLEX Implementation](docs/FLEX_IMPLEMENTATION_SLICE.md). The full six-slot builds, five miniboss Cores, evolved forms, healing pickups, world and permanent Mastery remain [future game-design phases](docs/GAME_DESIGN_V1_LOCKED.md). Backend provisioning remains separate.

## Mobile controls

Open the same game URL on your phone — no app installation required. Use the **virtual joystick** to move, earn Aura in combat, and activate **FLEX Ultimate** when the gauge reaches 100. Alpha, Sigma and Rizz builds have distinct FLEX powers; there is no separate Focus. The on-screen **PLAY / NEXT WAVE / RETRY** button replaces Enter, and upgrade buttons let you choose buffs by touch. Rotating to **landscape** gives a larger game view, but portrait controls are supported as well.

**Immersive landscape on Android:** tap **FULL SCREEN** next to the game actions. The game requests browser fullscreen and attempts to lock landscape orientation where supported. The arena is in the center, the joystick on the left and the single FLEX/upgrade buttons on the right. Tap **EXIT** to return to the normal page. If the phone stays vertical, turn it sideways manually and ensure auto-rotate is enabled.

**Fallback:** embedded browsers or iPhone Safari may reject native fullscreen/orientation lock. The game then fills the webpage viewport using CSS and offers a rotate-device prompt, but browser bars may remain visible. Native browser fullscreen and forced landscape cannot be guaranteed on every phone. Do not lock the game globally into landscape; portrait mode remains playable outside immersive mode.

**Art production:** the default Aura Arena includes six original native-pixel character studies, NPC/Hater/Beta/BIG HATER, a geometric arena and combat FX produced as editable TypeScript/Canvas art. Final layered, artist-created Aseprite masters are still a separate production obligation under [Sprite Production P0](docs/SPRITE_PRODUCTION_P0.md).

## Run locally

Requires Node.js 22 (see `.nvmrc`) and npm. In your local checkout:

```bash
nvm use                 # if you use nvm
npm ci
npm run dev
```

Open the URL printed by Vite. No login, API keys, backend, or external services required. For a production-like run, use `npm run build` followed by `npm run preview`.

| Key | Action |
| --- | --- |
| ENTER | Start, advance to the next wave, or restart |
| WASD / arrow keys | Move; weapons automatically target the closest enemy |
| E | FLEX: stand still and stop attacking for 1s; keep at least 3 enemies within 145px to earn +25 Aura |
| SPACE | Sigma Focus: slow enemies for 3s |
| 1 / 2 / 3 | Choose an upgrade; the game pauses during selection |
| F3 | Show FPS and simulation diagnostics |

Collect green crystals to gain XP. Getting hit interrupts FLEX and costs 20 Aura. FLEX enters a 15-second cooldown after it ends or is interrupted. At 100 Aura, Aura Burst gives +20% damage for 6 seconds and resets the meter to 40. Reaching the end of the final wave is not enough: the boss must also be defeated.

All in-game UI, buff descriptions, and combat messages are in English. Meme-themed names (such as Sigma, Mewing, and Six Seven) are intentionally kept.

## Testing

```bash
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:browser
```

On Linux, `npx playwright install --with-deps chromium` can also install system browser dependencies. The browser tests start their own Vite server on port 4174; screenshots and traces go to `test-results/` and are not committed.

Validation history and limitations: [docs/VALIDATION.md](docs/VALIDATION.md). The Phaser-independent combat simulation lives in `src/game/core/arena.ts`, and the rendering/input scene lives in `src/game/scenes/ArenaScene.ts`.

**v0.6 stability:** hidden browser tabs automatically pause an active run and require RESUME; buffered keys and touch movement are cleared on pause, fullscreen controls follow native fullscreen transitions, and unchanged sprites no longer rebind Phaser textures every frame. See [Quality & rules review](docs/V06_QUALITY_AND_RULES.md). The v0.6 pass deliberately does **not** change damage, timers, wave balance, scoring or progression; those are awaiting player review before backend or monetization.

Human difficulty balancing and performance tests on physical Android/iOS hardware are still needed. Multiplayer, Discord, shop and cloud persistence remain future features.

## Equipment & weapons (new 3 + 3 system)

The game now enforces **3 weapon slots + 3 passive slots**. Aura Shot is the starting weapon for every hero; Alpha/Cool Kid also carry Mewing Jaw, Rizzler begins with Rizz Pulse, and Six-Seven Kid carries 67 Volley. **Available weapons**: Aura Shot, Mewing Jaw, Ohio Orbiter, 67 Volley, and Rizz Pulse. Equipped weapons level from 1 to 4 and use visible autonomous attacks; passives use up to 3 levels. Category limits apply to actual XP upgrade choices and are enforced inside the simulation, not just the UI. Two small on-screen panels display occupied/empty slots and levels, with weapon/passive category labels in the upgrade dialog. FLEX remains outside the equipment inventory.

This is the [equipment implementation slice](docs/EQUIPMENT_WEAPONS_SLICE.md); miniboss Cores, evolving forms, permanent Mastery and larger scrolling maps are still future work. It does not add backend or monetization.
