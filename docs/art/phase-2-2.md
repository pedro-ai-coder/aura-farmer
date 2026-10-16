# Phase 2.2 — Enemies and boss

Four transparent source sheets generated in this project on 16 October 2026 are integrated without changing their pixels. No further image generation was needed in this continuation. The original option-A masters and static atlas remain unchanged. The full original generation prompts were not available in the resumed workspace; they are not reconstructed here.

| Runtime file | Source generation ID | Rows |
|---|---|---|
| enemies-a-v2.png | 9d49f17a-6f68-4e5b-a60a-0f1f819bb8b3 | Reply Goblin, Beta Bot, Ratio Ram, Doomscroller |
| enemies-b-v2.png | db99083a-3a83-47e9-a50e-74b22c48f0ba | Hype Bot, Fanum Leech, Ping Sniper, Copium Puffer |
| events-v2.png | 3d60bedd-a847-4d4c-9473-b390d6ec1d48 | Comment Mod, Reply Guy, Mod Supremo, Ohio Express, Doomscroll Prime |
| haters-v2.png | 60e1ad38-9bd0-4fa1-8afb-1b05ac00e5d8 | Phone Guy, Hater, Big Hater, Full Hater Mode |

Each row contains four walk drawings, anticipation, impact, hurt/fall and a grounded death drawing. JSON stores individual source rectangles, component masks, foot pivots and a fixed standing-height scale per row. At load time, the renderer clips adjacent drawings into padded canvas textures; this prevents an overlapping accessory from being cut off or leaking into its neighbour. Raw source textures are released after compilation. `tools/index-enemy-atlases.py SOURCE_DIRECTORY` reproduces the metadata using Pillow, NumPy and SciPy. Runtime does not require Python. These are authored lateral poses with symmetric horizontal facing, not eight separately drawn views. Terminal remains a stationary object, fading when destroyed. Corpse sequences combine the hurt/fall and grounded drawings; they are not four new death frames.

Attack deadlines and locked angles come from the actual simulation emissions. Anticipation persists until the attack deadline, followed by impact/recovery. Sustained hazards keep their own telegraphs; the actor does not repeatedly strike for every hazard tick. Contact and support cues are immediate, with no invented damage or delay. Pending attack cues take priority over hurt feedback; stagger overrides them. Walk cycles advance by actual distance and freeze when stationary or paused. Death snapshots are bounded to 64, removed from combat immediately, and fade over 0.85 seconds; wave retirement produces no death. Final boss fall can finish on a separate visual clock after victory. Restart clears presentation state.

Big Hater uses a separate aggressive row in berserk (eyes, posture and fists), including after death; the normal hitbox and all damage/resistance values remain unchanged. A distinct synthesized audio cue plays once on the berserk transition and respects mute. No screen-wide flash.

## Validation evidence

Unit tests cover the catalog, texture bounds, timing, locked facing, support/contact cues, pause/restart, death bounds and berserk. Browser tests render four contact sheets from loaded Phaser frames and capture actual boss anticipation/impact in the arena. Existing full-run and browser regressions remain required. CI results and the reviewed commit are recorded in the PR.

Limits: the atlas drawings do not replace projectile/hazard artwork (phase 2.3), mobile controls (phase 3), difficulty playtests (phase 4) or real-device performance validation (phase 5). Automated fixtures control state; they are not a normal human playthrough. Four high-resolution sheets add approximately 9.2 MB of PNG downloads; reduced runtime exports and device budgets remain part of the performance phase. No extra service or paid API is introduced.
