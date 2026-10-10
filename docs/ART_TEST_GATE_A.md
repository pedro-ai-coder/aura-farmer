# AURA FARMER — GATE A: ART TEST BRIEF

**AF-ART-GATE-A** | **Status:** READY FOR CONCEPT REVIEW; NOT APPROVED FOR ASSET PRODUCTION  
**Scope:** Concept art / static visual test only. **Do not change game code, sprites in use, renderer, hitboxes, controls, or the Vercel deployment.**

Links: [Art Bible](ART_BIBLE.md) | [Gameplay design](GAME_DESIGN.md) | [Combat specification](COMBAT_SPEC.md).

## 1. Approved decisions

- Style: **Pixel Cartoon Brainrot Arcade**, 3/4 top-down, chibi proportions, readable action.
- Sigma: dark hoodie, angular hairstyle, **gold chest Aura symbol**; original character, not a portrait or adaptation of a streamer.
- **Change requested:** a *lighter* palette. Start from **Lavender Pop Arcade** in the Art Bible; exact HEX colors remain provisional.
- Produce this Gate A concept before committing to the complete P0 sprite inventory.
- All eventual player-facing words in the game will be English.

## 2. Concept hypothesis: light arena, dark readable figures

The game should feel colorful and friendly **without** becoming a neon soup. Arena is light lavender / cream, with only subtle floor details. Player remains the most recognizable object using dark hoodie + gold emblem. Danger attacks are coral with an outlined telegraph; XP is green; the Hater is magenta. Keep the HUD dark-plum or with dark text against light panels.

### Candidate color swatches

| Role | Color |
| --- | --- |
| Cream / page | #F6F0EA |
| Lavender arena | #DDD6F0 |
| Alternative tile | #C6B6E5 |
| Dark outline / UI ink | #302747 |
| Sigma hoodie | #44345F |
| Sigma violet highlight | #8B5BD8 |
| Gold Aura symbol | #FFCC51 |
| Hater magenta | #EA568A |
| Danger telegraph | #E75154 |
| NPC desaturated | #89839E |
| XP green | #24AF7A |
| Focus cyan | #2CB4C7 |

**Alternative B** may darken the arena slightly within a still-light palette, to improve outlined attack readability. Do NOT substitute the former dark-purple palette.

## 3. Precisely scoped artist deliverables

| ID | Deliverable | Notes | Output |
| --- | --- | --- | --- |
| GA-01 | **Sigma** — 3 black-and-white silhouette thumbnails, 1 colored idle pose | 48×48 transparent frame; angular hair, dark hoodie, gold chest mark; center-feet pivot | PNG concept sheet + eventual source |
| GA-02 | **NPC + Hater** — 2 different static sprites | 48×48; NPC blank rounded block, Hater thorny magenta aggressive profile; distinguish in grayscale | PNG, side-by-side at 1x, 2x, 4x |
| GA-03 | **FLEX** — charged and success visual exploration | One 64×64 sample + runtime-sized conceptual halo; golden success, short clear warning for charge | 2-frame concept, not production animation |
| GA-04 | **Arena/light palette test** — small tile sample | 32×32 floor base and alt samples, subtle shading | 2 tiles PNG or a clean mockup |
| GA-05 | **Full gameplay composition** | 960×600: Sigma, 6–12 enemies, green XP, gold player shots, red hostile bullet, telegraph, small HUD, mobile UI reference | Annotated PNG |
| GA-06 | **Mobile crops / scale tests** | Test actual visual size from 390×844 portrait and 844×390 landscape **within page/game framing**, with touch buttons visible | 2 device previews |
| GA-07 | **Readability comparison** | color vs grayscale; compare light Palette A and light Palette B | 2 color tests + grayscale proof |

### Forbidden in Gate A

- No 16 buff icon production pack.
- No boss animated sheets or 50+ sprite animations.
- No new enemies, content or gameplay logic.
- No Phaser asset integration or CSS redesign.
- No changes to the production branch or Vercel.
- No use of copyrighted game art or unlicensed asset packs.

## 4. Style constraints for the artist

1. Low-detail expressive eyes, large angular hairstyle, legible gold chest symbol on Sigma.
2. Character outline 1–2 source pixels, stable, not lost on lavender background.
3. Light upper-left, 4–6 dominant colors per sprite (not counting transparent pixels and outline).
4. Distinct figure silhouettes: Sigma compact + hair; NPC round/neutral; Hater spiky/aggressive.
5. No smooth airbrush/AI-softened downsample pixel shapes. Pixels should look consciously placed.
6. Threats must be more visually prominent than decorative props.
7. Concept sprites must not imply new colliders or animation speeds.
8. Font is only part of visual comparison; text stays code-rendered in the actual game.
9. For generative concept previews, note explicitly that images are **visual direction references, not production sprites**; redraw as coherent pixel assets before integration.

## 5. Approval matrix — human review

Rate each **PASS / REVISE / REJECT**. The Gate is not approved until all essential items pass.

| Check | Pass conditions |
| --- | --- |
| Art direction | Pixel-cartoon, playful, 3/4 top-down, independently original |
| Approved protagonist | Hoodie dark, hair angular, gold chest mark visible at gameplay size |
| Palette | Brighter than previous dark-purple design; light but desaturated arena, not washed out |
| Silhouettes | NPC vs Hater vs Sigma identifiable without color |
| Attack readability | Hostile bullet and telegraph visible at a glance on light floor |
| VFX | FLEX charge != FLEX success; no covering the player entirely |
| Mobile | 390×844 portrait and 844×390 landscape readable; buttons unobstructed |
| Visual hierarchy | XP green, Aura gold, danger coral distinct, even in busy scenes |
| Technical viability | Sizes/pivots documented; art can be exported as PNG and later atlas |
| IP/licensing | Original designs and usable rights confirmed |

### Approval choices

1. **Approve Gate A:** authorize the P0 production sprites (still a separate Codex implementation ticket).
2. **Approve with revisions:** revise precisely named fields, return another sample.
3. **Reject:** revisit palette or character; keep current public game as-is.

## 6. Codex instructions (when a real artist's assets exist)

For now Codex should only inspect documentation and organize tickets. After Gate A approval, and when licensed PNG + source sprites are delivered, Codex can build the sprite loader, animations and a staged preview **in a separate PR**. Preserve gameplay and mobile inputs; run Node/Vitest/Playwright; keep all visual changes out of production until approved.

## 7. Evidence and project status

- Art Bible changed in existing draft PR #10 on branch `docs/af-art-bible-review`.
- User-approved direction/Sigma decisions are documented.
- **Palette and final visual concepts await approval**, despite initial conceptual explorations.
- Any AI-generated illustration shown in conversation is a **concept mockup**, not a game-ready `.aseprite`, spritesheet or atlas.
- PR #10 intentionally stays **Draft**. No merge, no production deploy.
