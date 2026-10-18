# Visual Production Contract — Option A / Cartoon Arcade

**Approved direction:** Option A, as defined in [GDD Annex A.1–A.10](GDD.md). This document translates the approved art direction into implementation checks. It does **not** authorize a redesign or override the GDD. Screenshots from the actual game, not stock references or renderings, are the acceptance evidence.

## Visual grammar

- **Shape:** compact, expressive silhouettes; intentional asymmetry; oversized hands/head/shoulders as appropriate to each character. Maintain character-specific proportions, not a recolored common body.
- **Ink:** strong dark navy outlines with heavier exterior contours than internal lines; clear alpha edges and consistent visible thickness at the true game scale.
- **Surface:** broad flat colors and one or two illustrated shadow masses; restrained ink texture, no persistent artificial glow or plastic gradients.
- **Camera:** elevated arena view, footprints anchored to ground with simple shadows, fixed gameplay hitboxes independent of sprite bounds. Covers and collision must visually agree.
- **Readability:** environment floor lower-contrast than player/foes/projectiles. Character silhouette, hostile telegraph, and attack direction take precedence over decorative detail.
- **Typography:** expressive/comic headings, but clear effect/body copy of at least **16 px** at reference desktop layout per GDD A.9; accessible focus and button hit targets.
- **Motion:** artists supply true poses, not permanent bob/tilt/shake as a substitute for missing frames; render timing must agree with simulation impact/windup/recovery. Reduced-motion and low-effect modes remain functional.

## Approved colors and roles

| Role | Canonical value | Usage / distinguishers |
| --- | --- | --- |
| Warm paper | `#F7EDCD` | Menu and UI surfaces, neutral backdrops |
| Dark ink | `#253449` | Text, frame outlines, contour strokes |
| Aura gold | `#F8C45F` | Flex charge/ready; distinguish from legendary by icon, position and shape |
| Hater coral | `#E57461` | Damage/hostile warnings, enemy projectiles |
| Support teal | `#6EAAB0` | Defensive absorption, shields, ally buffs |

These are semantic anchors from GDD A.3, **not** a ban on additional clothing, rarity or map colors. Common, rare, epic, legendary must be conveyed by symbol and text as well as color; danger telegraphs must not be only red versus green. Do not introduce an unrelated neon UI theme.

## Character production targets — PR #94

| Hero | Must remain identifiable without labels | Specific verification |
| --- | --- | --- |
| Sigma | Angular hood, dark silhouette, golden chest emblem | Run/aim independently oriented; cap projectile clear; stare does not erase hood |
| Cool Kid | Blue pompom cap, layered streetwear, sneakers | Athletic motion, distinct rampage transformation (not Alpha silhouette), four frames/run direction |
| Alpha Chad | Broad shoulder/arms, golden hair, squared jaw | Heavier footfall/slams, front-facing protection and shield clarity, dedicated rear poses where needed |

Per GDD A.5: **8 logical directions**, **4 run frames per direction**, **2 idle frames**, **3 attack frames**, **4 combined hurt/defeat frames** and **at least 6 Flex drawings when transforming**. Directional mirroring is acceptable only when logos/accessories are not accidentally reversed. Start from the approved master artwork; preserve transparent originals. Initial runtime target canvas **128×128** for actor exports (adjust if readability demands) and **256×256** for portraits, roughly **48–64 world units** tall in gameplay. Atlas rectangles, alpha, pivot and frame origins must stay stable.

**Acceptance evidence:** capture each hero in 8 directions, idle/run/attack/hurt/defeat and all Flex stages at normal viewport; confirm no sliding, popping, hair/accessory inversion, clipped limbs or incorrect hitboxes. Count states and visually inspect frames; metadata alone cannot prove they are distinct drawings.

## Enemy and boss targets — PR #95

NPC/Phone Guy, Hater, Beta Bot, Doomscroller, Ping Sniper and all active enemy families require individual silhouettes; do not present atlas metadata as final silhouettes. Windup/impact/recovery for projectile and charge enemies must visually correspond to the locked attack direction. Elite rank requires more than recoloring. Big Hater retains crown, pink body, white shirt and huge fists; berserk changes expression and timing without obscuring telegraphs or granting invisible attack phases.

**Acceptance evidence:** a side-by-side unlit silhouette sheet at game scale; recorded windup/impact frames for ranged/melee/hazard enemies; separate boss normal/berserk screenshots and telegraph/hitbox alignment checks.

## Weapons, Flex, shields and drops — PR #96

Every one of the nine weapons needs recognizable animation/projectile/attack shape matching GDD A.8. Area attacks show precise affected regions without covering the player or hiding hostile warnings. Shield absorption, expiry, healing and cooldown are visibly distinct. Aura Snack and Aura Magnet must be distinct in shape as well as hue; ordinary XP crystals remain separate. Each hero's Flex should have an unmistakable start, active and exit state, visually different from other heroes' Flex.

**Acceptance evidence:** real input/combat recordings for every attack family, shield absorption/expiry, pickups and Flex. No visual frame changes should alter combat ticks, damage or invulnerability. Limit VFX draw calls/particles on phones.

## HUD, modals and item illustrations — PR #97

- HUD: HP/shield, XP/level, wave/time and Flex all independently legible; boss HP/timer appears without displacing critical gameplay controls.
- Reference **1280×720**: permanent panels should generally stay within **15% of usable game area** (GDD A.9). Item comparison belongs in a separate actionable panel.
- Upgrade: 3 normal cards and 6 legendary cards (two rows), both readable with no modal stacking or clipped confirmation controls.
- Illustrations: approved GDD target is **at least 64×64 exports**, legible at **32×32**; visual matches attack in game, even across rarity variants. The full catalog's icons need not be declared complete if only the current solo subset is delivered.
- Inputs: desktop focus rings and mobile safe-area/landscape fallbacks must survive visual restyling. English UI copy only.

## Environment — PR #98

Ruin Alley is the only required playable map in the initial solo web demo. Keep authored landmarks, side passages and real cover. Match visual ground contact, shadow, prop perspective and collision. Do not silently introduce Crown Court/Toxic Garden as playable maps; their approved PNG masters are future content.

## Quality evidence — PR #99

Test **1280×720**, **1920×1080**, **800×600**, **mobile landscape 915×412** and a portrait viewport. Desktop 60 FPS and low-profile stable 30 FPS are **targets that require measurement on a defined device**, not assertions about the current build. Check high enemy density, fullscreen transitions, safe areas, upgrade cards, boss/bursts, frame clipping and reduced-motion/effects. A screenshot is insufficient for animation timing: include a short actual gameplay video or frame-by-frame test evidence.

## Art authorization / separation of concerns

Reuse approved files in `public/assets/cartoon/option-a-v1` first, then runtime files in `public/assets/runtime`, following `docs/ASSET_POLICY.md`. **Do not generate or replace artwork without the owner's explicit image-production approval.** This confirmed approval of **Option A as the style** does not automatically waive the separate requirement for new image creation. Keep old masters unchanged and record provenance of any eventual new assets. Graphic PRs do not alter gameplay formulas or persistence.
