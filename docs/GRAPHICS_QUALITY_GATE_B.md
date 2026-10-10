# Aura Farmer — Graphics Quality Gate B

**Status:** VISUAL-POLISH PROTOTYPE, review requested from Game Director.
**Priority decision:** 2026-10-11 — art quality before database provisioning, cloud persistence, login and public leaderboards.
**Visual identity:** Approved Lavender Pop Arcade from [ART_BIBLE.md](ART_BIBLE.md).

## Current reality

The game has exported PNG sheets, but they are still **low-detail, code-authored bitmaps**, not professional, hand-pixelled characters. The character-select screen and gameplay work; the art remains prototype quality.

**This PR is the first visual polish pass, NOT a claim that a professional pixel artist has delivered the final character animation sources.**

## Gate B — priorities in order

### 1. Original character sprite polish (required for final approval)
- All six playable characters need original **48×48 native-pixel** editable master art with consistent lighting and a silhouette test without color. Current 24×24 designs upscaled 2× are placeholders.
- Unique front/side expressions and shoes/props with stable in-game `feet_center` pivots.
- State sequences per hero: idle 4 frames (6fps), move 6 frames (10fps), hurt 2, FLEX charging 4, FLEX success 3, death 6. Provide PNG atlases, frame metadata and source `.aseprite` or another layered editable original master.
- **The Sigma:** navy hoodie, angular black hair, golden chest mark (approved). Alpha = broad orange/tank; Rizzler = magenta/glasses; Ohio = cyan/glitch; Fanum = mint/backpack; Six Seven = gold cap/number motif.
- Show each on 844×390 Android landscape and 16:9 desktop at *actual* gameplay scale. Silhouettes must remain distinct with colors removed.

### 2. Enemy/boss sprite polish
- NPC/Hater/Beta need walking, hit and death poses, staggering, attack readability. Big Hater requires idle, pursuit, attack wind-up, attack and KO sequences. Frames remain 48/64/128px per Art Bible.
- Telegraphs are pink/coral with clear shape and outline; warnings at least 250ms before ranged attacks. Health bar must not occlude the HUD.

### 3. Combat VFX
- Player shots gold/ivory, hostile shots coral, XP green.
- Impact flashes, limited particles, enemy poof, focus and FLEX pulses, boss health bar; no strobe or high visual noise.
- Cap effects to 24 active and decorative trails to 64; never allocate one Phaser Graphics per enemy.
- 90-enemy performance acceptance on a physical midrange Android.

### 4. Environment and menus
- Intentional 32px terrain marks, four corner ornaments, visual frame corners, restrained floor texture (no decorative colliders).
- Arcade-style HUD, HP/Aura/XP/time segment cues, character portraits and gold primary actions.
- Polish upgrade cards, achievements, collection and rarity iconography after player characters and boss.

## Already implemented in this prototype PR

- Arena decals + stone ornaments and frame corners; no new gameplay obstacles.
- Dynamic character/enemy ground shadows, facing direction, enemy hit flashes, capped defeat poofs, boss health bar and subtle ranged warning rings, XP hover and capped projectile trails.
- Improved high-contrast HUD panels and responsive character cards within the approved palette.

**Not yet delivered:** handmade editable production animation masters, full enemy death sheets, all detailed buff icons and boss action animation. Existing bitmaps remain interim art.

## Gate B review / release workflow

1. Compare screenshots under identical desktop, Android landscape and portrait gameplay conditions.
2. Obtain Game Director feedback on scale, sprite clarity, HUD and effects.
3. Produce original editable hero masters and source animations with verified commercial-use rights.
4. Integrate one character/enemy class at a time, documenting frame tags, pivots, screenshots and real-device performance.
5. Require TypeScript, Vitest, Vite build, desktop/mobile Playwright green and a physical Android review before release.

## Backend paused

- Existing localStorage progression remains; never remove saved achievements/settings/character.
- [Supabase schema PR #18](https://github.com/pedro-ai-coder/aura-farmer/pull/18) stays **Draft**. No cloud persistence, login or public rankings until graphics work is completed and approved.

## Acceptance for the full visual-quality milestone

- Distinct character silhouettes at mobile size with original editable art masters for all six heroes.
- Stable native pixel frame tags, readable idle/move/hurt/FLEX/death animations.
- Boss attacks and ranged Hater threats legible before impact; color hierarchy safe in bright environments.
- Mobile and desktop UI readable with no major performance regression.
- Game Director approval of final art review.
