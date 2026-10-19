# V3 — Weapons, Shields, Pickups and Flex VFX (Option A)

**Visual direction:** Approved **Option A — Cartoon Arcade**, GDD Annex A.3, A.8 and A.10.  
**Base:** current `main` after owner-merged Visual V2 PR #92.  
**Art license:** No new PNG/SVG or generated artwork, and no master file replacement. Only procedural Phaser graphics reuse existing weapon/pose identities; new illustrated icon exports remain a **separate owner-authorized art request** under `docs/ASSET_POLICY.md`.

## Problem confirmed before editing

The weapons already have nine distinct mechanics, but the renderer still drew most **player projectiles as the same yellow line/circle**, and all damaging areas with the same gold circle/cone/line fill. Active shield and three hero Flexes used interchangeable rings. An Aura Snack and Aura Magnet were differentiated mainly by color, competing with the environment and regular XP drops.

The simulation in `src/game/simulation/weapons.ts` is unchanged. These are **presentation-only** repairs.

## Delivered visual grammar

The V3 renderer `src/browser/combat-vfx.ts` gives each weapon a distinct flat-ink silhouette **inside the actual simulated hit region**:

| Weapon | Existing attack | V3 visual | Distinguishing shape |
| --- | --- | --- | --- |
| Ratio Blaster | Aimed projectile | Ink/gold comment dart with tiny trailing line | Sharp triangle |
| No Cap | Piercing projectile; legendary line area | Crown/brim flat cap, not a generic projectile; restrained legendary line accent | Wide cap |
| Brainrot Feed | Delayed point explosion | Paper phone with ink casing and message strokes within the true circle | Phone |
| Keyboard Warrior | Two hits at separate simulation instants | Keycap/keyboard bars within each actual melee cone | Parallel key rows |
| Ban Hammer | Heavy delayed cone, optional line | Dark handle and large perpendicular head | T-shaped hammer |
| Touch Grass | Wide slow cone | Teal whip stem with flat leaves | Branch/leaf |
| Cope Shield | Shield-bash cone | Teal crest facing the hit direction | Shield triangle |
| Chad Hands | Melee combo/cone | Twin cartoon ink fists | Two square gloves |
| Personal Space | Area pulse | Segmented short teal ring, no continuous glow | Broken circle |

These geometric accents are **not replacements for final approved weapon icons/illustrated sprites**. GDD A.8 still requires their owner-approved 64×64 exports and artwork synchronized with the approved weapon silhouettes. No attack area is widened, delayed or added by the visuals.

### Protection, Flex and drops

- **Shield absorption:** dark-ink plus solid-teal barrier with a small paper crest, only if the simulation has a positive active shield. Expiry is shown by disappearance when the real shield expires; no false shield is drawn.
- **Sigma Stare:** compact fixed-eye reticle with four tick marks; it does not pretend to lock onto targets other than the actual character's gameplay target.
- **Cool Kid Rampage:** directional dual sprint chevrons; the movement heading is taken from `movementFacing`.
- **Alpha Hold:** three restrained teal shield segments, not Sigma's reticle or Cool Kid's speed lines; actual Alpha slam damage areas get their own short impact motif.
- **Aura Snack:** a mint-green flat medicine token with a paper cross. **Aura Magnet:** purple horseshoe with separate end caps. **XP crystals:** unchanged cyan diamonds.
- **No scheduled shot leaks:** delayed legendary Ratio Blaster secondary projectiles are invisible until `shot.at <= run.time`, matching their real shot activation (the old renderer prematurely drew them).
- **Enemy danger retained:** hostile shots stay coral; hostile attack areas render from unchanged simulation shape and time. The friendly decorative accent is drawn before enemy-local locked-aim indicators, so it cannot overwrite their ink chevrons. No effects flash across the entire screen.

### Reduced-effects policy and cost

The same recognisable cap, shield, pickup and Flex symbols are retained with reduced effects. Optional keyboard flourishes are halved, and the Flex exit pulse is suppressed. No external textures, sound, animation timers, extra sprites, random effects or paid services are added. One shared `Phaser.GameObjects.Graphics` renderer batches the motifs and existing marks; no extra GPU image assets are loaded. Actual dense-wave FPS still needs device measurement in V6.

## Evidence

- `tests/combat-vfx.test.ts` verifies exactly nine distinct weapon motifs from the shared catalog, distinct Ratio/No Cap projectiles, seven different non-projectile accents, hostile cue preservation, reduced-mode retention, unique Snack/Magnet/XP silhouettes, three different Flex symbols and no mutation to Area/Projectile/Run objects.
- `tests/browser/combat-vfx-review.spec.ts` captures **14 actual Phaser game-canvas images**: nine weapons, one shield/three drops, three Flexes and one reduced-effects state. These use **declared local art fixtures** held at paused simulation time; they are not fabricated claims of complete playthroughs.
- All screenshots are saved as `test-results/v3-*.png` and included in the existing GitHub Actions `browser-test-results` artifact. Compare them with PR #90 visual baselines and the previous V2 merge.
- Final commit must pass TypeScript, Vitest, Vite build, Chromium Playwright, secrets audit and exact-SHA Vercel preview. Human playtest must inspect dense-wave and phone readability before approving visuals.

## Remaining visual production

This PR does **not** finish all GDD A.8 artwork: nine weapon icons and 28 passive icons exported at >=64×64 and legible at 32×32, rarity artwork, bespoke cap/hammer/keyboard/phone animation frames, boss impact polish, sound synchronization and all passive effect cues require separate source-art approval and can only be counted as done with actual gameplay evidence. They are explicit follow-ups, not silent scope reductions.

## Project handoff after V3

1. **V4 — HUD, menus and item cards:** readable 16px reference body copy, nine weapons/passive icon integration once authorized, three common/six legendary choices, boss bars, portrait/landscape responsive layout, no modal overlap.
2. **V5 — Ruin Alley environment:** foreground/cover/contact shadows, grounded perspective, restrained floor contrast, existing collision alignment; no new playable map.
3. **V6 — Visual QA and performance:** full run captures, dense waves, berserk, desktop/mobile hardware checks, reduced effects and measured 60/30 FPS targets, remaining approved-art requests.
4. **Web Demo release acceptance (separate gameplay gate):** improve Sigma/Cool Kid survivability; demonstrate a legitimate victory after 18:00 berserk, human-controlled game completion and reliable mobile fullscreen; no Discord Activity claim.
5. **Discord Activity adaptation only after Web Demo sign-off**, without inventing backend, login or multiplayer.

### Acceptance checklist

- [ ] All 14 V3 browser captures verified on final SHA, at true play scale.
- [ ] Nine weapon appearances distinguished, hostile attack telegraphs readable in crowded scenes.
- [ ] Real shield gain/absorption/expiry, pickup/reduced-mode contrast and each character's active Flex inspected by the owner.
- [ ] TypeScript, Vitest, build, Playwright, secret scan and Vercel green.
- [ ] Explicit owner approval before merge.

**V3 is an integration polish iteration, not approval to produce new images. No gameplay stat, RNG, hitbox, persistence, account or monetization change.**
