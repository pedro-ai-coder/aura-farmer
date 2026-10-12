# AURA FARMER — VISUAL BIBLE v2.1

**Status:** Gate A art direction reset after game director feedback · **Date:** 2026-10-12  
**Art direction:** **AURA ARENA — handcrafted meme-combat arcade**, not agriculture.  
**Authority:** supersedes conflicting environment, enemy, props and UI-material guidance in `ART_BIBLE.md`, `VISUAL_IDENTITY_V2.md`, and earlier versions of this document for **future production**. Combat and engineering contracts remain unchanged.

> **Meaning of “Farm”:** players *farm Aura* — status, confidence, style, reputation and power — by surviving hordes, making plays and using FLEX. They do **not** farm crops. The plant/forest/cursed-garden Gate A exploration is **rejected**. Do not turn a visual motif into gameplay, a plant faction or a farm simulator. Previously generated concept sheets are references that have **not** been approved or turned into production sprites.

## 1. Visual promise

**One-sentence pitch:** a fast, funny, expressive arena survivors game where exaggerated streetwear heroes defeat waves of absurd rivals, build outrageous powers and earn Aura.

Visual inspirations are **mechanical and stylistic references, not assets to copy**:
- **Brotato** — clean arena readability, chunky silhouettes, simple combat states.
- **Swarm** — contrasting skills, clear threat zones, excitement during combat.
- **Brawl Stars** — confident posing, compact personality-driven characters and accessible cards.
- **Megabonk / meme culture** — irreverent playfulness and signature moves without reliance on any existing meme face or copyrighted property.

**Five identity rules:**
1. **A recognizable silhouette at real gameplay size.** Head/torso/limbs, accessory and attitude are readable as a single shape.
2. **Consistent production craft.** Pixel art is drawn at native pixel resolution with constrained palette, light source, and frame-to-frame anatomy; vector UI and pixels meet through coherent silhouettes and a common color system.
3. **A clear hierarchy during chaos.** Quiet ground, recognizable mobs, unmistakable hero, crystal-clear danger shots and rewards.
4. **Personality in motion.** Anticipation, contact, short recovery, expressive face and hit pause (where supported); no all-purpose particle spam.
5. **Humor through character design, not visual noise.** FLEX is the signature event; bosses are caricatures, not overgrown plants.

### Explicitly forbidden for future Gate A assets
- Trees, woods, foliage borders, pots, vegetable crops, flowers, root monsters, enchanted forest, wooden fences, hay bales, barns, farm sheds or giant fantasy crystals as the core identity.
- Generic AI-fantasy atmosphere, painterly textures, bloom clouds, disconnected ornaments, detailed storybook backgrounds and over-decorated HUD.
- A UI where buttons look like timber signs or every corner sprouts leaves.
- Sprites cropped from a flattened AI illustration or claimed to be hand-pixelled when no editable source exists.
- Copying LoL/Brotato/Brawl Stars character or user-interface artwork, streamer likenesses or brand identities.

This does not prohibit a tiny easter egg referencing the **verb** “farm”; it prohibits the **agricultural theme** from setting the look.

## 2. Arena visual world

**Gate A environment:** `Aura Training Arena`. A simple, repeatable stage that looks like a purpose-built combat map, not a location in a forest.

- **Ground:** desaturated midnight slate / warm charcoal or muted lilac alternative, tiled or segmented with sparse hand-placed geometric scuffs, seams, diagonal stripes, insignia stamps and hazard lines; 32×32 repeatable tiles.
- **Arena frame:** clean painted metal, synthetic mats, rubber pads, small scoreboard fixtures or outlined barriers **outside** gameplay paths; no new physical colliders.
- **Props (optional/perimeter only):** stacked training blocks, sparring dummy, power-cell crate, painted sign, small speaker, light fixture, caution marker, trophy podium, Aura emblem. Keep the center nearly blank to make 90 enemies readable.
- **Wave variation:** a subtle shift in stage stripe color or displayed waveform. Glows only around real energy/hostile threats. No fictional “cursed farm spreading” event.
- **Backdrop rule:** the room must look convincing assembled from **modular shapes** without a full illustration under the player. No photoreal imagery.

### Functional colors — Gate A candidates, not frozen
| Semantic use | Candidate | Constraint |
|---|---|---|
| Outline | `#202638` | 1–2 native pixels on sprites |
| Arena floor | `#515D72` | low-detail desaturated field |
| Floor highlight | `#717B92` | quiet seams/decal surfaces |
| UI body | `#142941` | dark, even surface under text |
| UI frame | `#53718C` | consistent simple 2px edges |
| Primary Aura gold | `#F9C954` | skill/charge/rewards, not every button ornament |
| Hero focus cyan | `#57C7EE` | skill cues; different shape from XP |
| XP green | `#36CD94` | pickups only, crisp outline |
| Hater hostile coral | `#FF697A` | unmistakable threat bullets |
| Boss / corruption violet | `#B35BE4` | controlled enemy cast, not ambient bloom |
| Ivory | `#FFF2D7` | primary text on dark panels |
| Alert yellow | `#F9E47E` | warnings and reward pop, with icon |

**Contrast:** text 4.5:1 normal, 3:1 large labels; significant controls and threat telegraphs 3:1 or more against actual composited ground. Distinguish shot types by **silhouette plus color**, and judge screenshots in grayscale. Compare muted-slate and toned-lavender floor variants at the same camera and character scale; choose one through playtesting.

## 3. Sprite construction, common to every character

| Property | Production rule |
|---|---|
| Camera | 3/4 top-down view, consistent foot baseline and shadows, no mixed perspective |
| Frame | player, NPC and Hater: **48×48**; Beta **64×64**; boss **128×128** |
| Proportions | head 35–45% of drawn height; oversized hands/feet where readable |
| Line work | 1–2 pixel native color outline, never randomly absent/huge |
| Palette | around 5–8 main sprite colors plus outline, single upper-left light source |
| Shading | one deliberate shadow + highlight, no uncontrolled painting/dithering |
| Animation | key poses drawn individually with stable costume, facial features and pivots |
| Export | editable layered source, PNG RGBA, JSON frames/tags/duration/pivots, 2px atlas extrude |
| Collision | immutable: game core defines ranges, HP, speed, collision and cooldowns |
| Scale | nearest-neighbor on sprite textures, avoid globally pixelating text/UI |
| Shadows | small ellipse on a separate depth layer, not baked into each animation frame |

A production atlas is *not* an AI picture with frames cropped from it. Each pose should withstand inspection at 1× and 4×, side by side.

## 4. Heroes: six unique silhouettes

| ID | Silhouette | Controlled attitude | Color / identity |
|---|---|---|---|
| The Sigma | angular spiky hair; dark hoodie; gold Aura chest mark; chunky shoes | calm main-character stance, assertive FLEX | navy/gold |
| Alpha Chad | wide shoulders, oversized gloves, stable center of mass | slow heavy hits / exaggerated confident jaw | orange/slate |
| The Rizzler | sleek posture, strong hair/glasses outline, floating scarf or collar | fluid charisma, confident special cast | magenta/blue |
| Ohio Kid | forward-leaning runner, oversize trainers, asymmetric hoodie | sprint and fast shots, body consistently tilted | cyan/dark |
| Fanum Lord | compact broad form, messenger bag / badge, expressive hands | collecting XP with speed and cheeky pose | mint/indigo |
| Six Seven Kid | angular cap / visor, clear 67 insignia | radial firing pose and visible number gesture | gold/navy |

**Portraits:** each hero gets a *separate* RGBA portrait, not a six-frame strip shrunk into an avatar; silhouette, hair, outfit and accessories must match gameplay. UI locked state does not distort the image.

**Tags:** at minimum `idle`4, `move`6, `hurt`2, `flex_charge`4, `flex_success`3, `death`6; bespoke animations (e.g., Alpha punch or Rizzler cast) only for real mechanics. Preserve existing sprites until the replacement has passed runtime QA.

## 5. Enemies / boss — rivals, not vegetation

The actual enemy classes remain `npc`, `hater`, `beta` and `boss`; do not retheme them as sprouts/root monsters.

| Type | Silhouette | Key behavior communicated |
|---|---|---|
| NPC | rounded, deliberately generic weak rival; bulky head, little feet | low-threat approaching mob |
| Hater | sharp hair/hood profile, pointed shoulders and hostile eyes | ranged threat with readable pre-shot warning |
| Beta Bro | stocky blocky heavy opponent, squared jaw/shoulders and large shoes | slower durable foe; mass visible at a glance |
| BIG HATER | taller/very wide angry rival with crooked crown or outsized spikes, giant hands | theatrical boss attack windup and defeat |

Each NPC, Hater and Beta atlas: `idle`2, `move`4, `hit`1, `death`4; attack poses only if game logic provides attack window. Boss: `idle`4, `move`4, `attack`5, `hurt`2, `death`8. Telegraph timing must be sourced from core state, not invented by VFX.

## 6. Attacks, pickups, events

A **focused** graphic language rather than fireworks everywhere:
- **Aura Shot:** cyan/gold projectile, compact arrow or comet with controlled white center.
- **Hostile shot:** coral/magenta pointed diamond or spiky disc, differentiated in silhouette.
- **XP crystal:** small green angular gem, no forest sparkles or magically hovering flowers.
- **Impact:** 4 angular key poses 100–170ms; crit 5 more pronounced key poses 150–240ms.
- **FLEX:** body anticipation with distinctive locked stance, then short gold shock ring on success; fail has a subdued pop.
- **Aura Burst:** ring 6 frames and strong brief number/sfx cue, not full-screen bloom.
- **Wave complete / boss entrance:** quick label/number, relevant short audio/visual sting, then clear exit.
- **Heal / Focus:** small semantic icon and limited short FX; cap active impact FX around 24 and decorative trails around 64 subject to actual performance measurement.

Visual order: arena → noninteractive props → shadows → drops → enemies/player → shots/telegraphs → combat FX → HUD/overlays. No camera-shaking constantly; respect reduced-motion preference. Affected input and core logic must not change.

## 7. UI system: remove “fantasy farm” decoration from the next art pass

The shipped interface is a **working foundation**, not final art approval. Future UI production uses:
- Flat, tactile arcade panels with a limited painted-metal/plastic language, two border thicknesses, repeatable corner geometries.
- Hero silhouettes, short dynamic captions, bold emphasis on PLAY, hero selection and active wave.
- Rarity by label + frame shape + hue; text rendered by DOM/Phaser, never included in image backgrounds.
- 9-slice frames for upgrades, results, settings, main menu, button states (hover/press/focus/disabled). No leaf corner overlay, woodcut sign or random crystal foliage on every panel.
- Full screen set: home, selection, HUD, upgrades, pause/settings, loading, between waves, boss, achievements, rankings, results.
- Full compatibility with 844×390 landscape and 390×844 portrait; maintain existing touch hitboxes, local progress and keyboard shortcuts.

**Important:** do not silently rip out approved functional menus in this Gate A. First approve the material/style frame next to the current UI; implement staged replacements after signoff.

## 8. Source, rights and review protocol

Every proposed *production* sprite and UI asset requires:
1. Editable source file (Aseprite or equivalent original layered master) and documented provenance/commercial rights.
2. Transparent sprite PNG (or vector master for UI only), animation metadata and stable origin/feet pivot.
3. Native-pixel and 4× previews, grayscale silhouettes and in-game capture at real scale.
4. Matching palette, outline, lighting and anatomy across all tags and poses. No detached screenshot chunks or erroneous six-frame portraits.
5. Phaser loader with existing textures as fallback until visual sign-off; no changes to `src/game/core/arena.ts`.
6. `npm run typecheck`, `npm test`, `npm run build`, `npm run test:browser`; mobile QA and 90-enemy density/perf.
7. Explicit game-director acceptance, including screenshots of actual gameplay. Green CI is **not** artistic acceptance.

Source/exports (only create files when real assets exist):
```text
art/source/characters/char_sigma.aseprite
art/source/enemies/enemy_hater.aseprite
art/source/ui/ui_upgrade_panel.aseprite
art/source/environment/tile_arena_base.aseprite
public/assets/art/v2/characters/char_sigma.png + .json
public/assets/art/v2/enemies/enemy_hater.png + .json
public/assets/art/v2/ui/ui_upgrade_panel.png
public/assets/art/v2/tiles/tile_arena_base.png
```

## 9. Gate A reset — what should be approved next

The earlier generated forest / root enemy / wooden fence artwork is rejected. It cannot be treated as approved references or production assets.

**Deliver *one coherent test pack*, not full atlas production yet:**
- 3 bold silhouettes of Sigma; one finalized still + portrait + 2 key-poses for movement/FLEX.
- NPC and Hater each with 3 silhouettes, one approved still/animated proof.
- 2 variants of a **clean geometric arena floor** (slate and muted lilac), base and subtle decal 32×32.
- XP gem in green and one 4-frame hit FX (no leaves).
- One **neutral 960×600 gameplay composition** at actual intended scale, real HUD, one hero, 10/45/90-enemy crops, explicit hostile shot and XP pickup.
- UI crop showing an arcade panel/button surface without faux wood/foliage.

**Reject** if there are plants as main identity, impossible source frames, weak grayscale silhouette, cluttered center, excessive glows, disjoint hero/enemy style or illegible mobile size.

**Review dimensions:** 960×600 reference; 844×390 Android landscape; 390×844 portrait. Gameplay systems untouched. Get visual acceptance before making complete animation atlases.

## 10. Gates after direction approval

Gate B: all six heroes/portraits and 4 enemy classes have correct animated atlases and game previews.  
Gate C: combat pickups/VFX, modular arena and all user-facing UI have coherent styling and reduced-motion/contrast validation.  
Gate D: a complete five-wave playthrough and device performance/rights review, explicitly approved.  
**Backend remains blocked until Gate D.**
