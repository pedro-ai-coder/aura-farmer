# Aura Farmer — Cartoon V1 asset pack (playable first pass)

## What is here
This folder contains **original, editable vector artwork** for 8 selectable heroes, 4 existing enemy types and **one** playable arena skin. It uses a brighter comic-cartoon palette (cyan, lavender, orange, gold) and black-ink outlines inspired by the approved art direction. These are actual runtime textures; they are not crops of promotional concept mockups.

Paths:
- `characters/{sigma,alpha,rizzler,ohio,fanum,six-seven,cool-kid,nerd}.svg`
- `enemies/{npc,hater,beta,boss}.svg`
- `arenas/aura-court.svg`

The game uses `?visual=cartoon` (default for this branch) and retains `?visual=arena` (previous Aura Arena skin) and `?visual=legacy` for comparison. **No previous assets are removed.**

## Production status
These SVGs are a **first playable, consistent cartoon art pass**. They are **not** the rendered AI mockups, frame-by-frame animation sheets, a promise of ten fully animated final characters, or the three scrolling maps proposed in the Production Bible. Phaser uses the SVGs as static rasterized runtime textures with restrained bob/tilt motions on active actors. Collision rules, balance, slots and saves remain unchanged.

No image-generation-produced artwork has been claimed as separately layered animation sprites. Commercial/public release requires reviewing originality, character consistency, readability on physical phones, performance and rights before approving a full final asset batch.

## Editing
SVGs are standard W3C vectors: open in Inkscape, Illustrator or compatible software. Keep the `viewBox`, transparent outside the silhouette, outlines and consistent center/feet composition. Reuse the **same file** as game sprite and menu portrait; do not copy mockup screenshots into runtime.

## Future backlog, NOT part of this art-only PR
- Directional idle/run/hurt/attack/FLEX/death atlases for eight heroes, two **form** transformations Giga Chad/Sigma Kid.
- Production atlas animations for all existing enemy families and eventual five planned minibosses.
- Three scrolling obstacle maps: Ruin Alley / Crown Chamber / Toxic Rooftop. The shipped `aura-court.svg` is a visual skin only, not one of those scrolling maps.
- Dedicated FLEX/weapon FX, nine-slice panels, menu UI assets and testing at 390×844 / 844×390.
- Gameplay maps, obstacle collision, new boss encounters, Aura Cores, permanent Mastery; these are **separate** gameplay PRs.

## Rules preserved
8 base hero IDs; 3 weapon + 3 passive equipment limit; 5 waves; one manually activated 5s affinity-dependent FLEX; local save compatibility and browser-friendly menu controls. There is no independent Focus button, no fake coins, and no 'Arenas' menu until that feature exists.
