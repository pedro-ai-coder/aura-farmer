# Visual Audit — Option A / Cartoon Arcade (stage V0, actual GitHub PR #90)

**Status:** evidence and production planning; NOT art sign-off or a gameplay release.  
**Source of truth:** [GDD V2.0, Annex A](GDD.md) (especially A.1–A.10), [asset policy](ASSET_POLICY.md), and the runtime code on the PR's `main` base.  
**Design decision:** **Option A — Cartoon Arcade is final.** Do not revive Options B/C, copy another game's sprites, introduce sci-fi/neon styling, or ask to change the art direction. All PR descriptions, new docs and in-game labels remain in English.

## Method and evidence levels

1. **Code inspected:** `src/browser/scene.ts`, `hero-animation.ts`, `enemy-animation.ts`, `enemy-textures.ts`, `hero-frames.json`, `hero-rear-frames.json`, `hero-flex-frames.json`, `enemy-frames.json`, `src/styles/app.css`, and existing Playwright tests.
2. **Asset references inspected:** approved master paths in GDD A.14 and actual runtime loader paths in `BrowserScene.preload()`. Source references prove what the runtime *loads or attempts to load*, not that the images meet an art-quality bar.
3. **Byte-level inventory:** `npm run assets:inventory` writes `reports/asset-inventory.json` with all image paths, byte counts, extensions, SHA-256 and byte-identical duplicate groups. CI stores it in the browser test artifact; never delete duplicates merely because hashes match.
4. **Runtime evidence:** `tests/browser/visual-baseline.spec.ts` records screenshots of current game UI across desktop/mobile profiles in the Playwright artifact. These are **before** captures, not redesigned images. No user-approved gameplay visuals have been replaced.
5. **Not yet verified by this desk audit:** actual silhouette contrast at play scale, frame-to-frame drawing consistency, animation polish, wave-density readability, real phone fullscreen behavior, visual accessibility and target FPS. These require inspection of the captured files and actual hardware.

### Source-art and runtime-asset map

| Category | Approved master or code reference | Runtime state / risk | Production owner |
| --- | --- | --- | --- |
| Sigma | `public/assets/cartoon/option-a-v1/characters/sigma.png` | `/assets/runtime/sigma-atlas.png`; 48 frame rectangles in `hero-frames.json`; inspect rear diagonals and action readability at 48–64 world units | stage V1 |
| Cool Kid | `public/assets/cartoon/option-a-v1/characters/cool-kid.png` | `cool-kid-atlas.png` (40 frames), `cool-kid-rear-v2.png` (4 frames), `cool-kid-flex-v2.png` (8 frames); code reuses front/diagonal groups for several directions | stage V1 |
| Alpha Chad | `public/assets/cartoon/option-a-v1/characters/alpha.png` | `alpha-atlas.png` (48 frames), `alpha-rear-v2.png` (12 frames); direction groups reuse frames, requiring visual check | stage V1 |
| Enemy families | Approved masters: `enemies/phone-guy.png`, `enemies/hater.png`, `enemies/big-hater.png` | `enemy-frames.json` has **17 actor/state families, eight frames each**, sourced from `enemies-a-v2.png`, `enemies-b-v2.png`, `events-v2.png`, and `haters-v2.png`; no assumption that 8 animation states means 8 directions | stage V2 |
| Boss | Approved `enemies/big-hater.png` | Both `boss` and `boss-berserk` have eight recorded frames; compare attack warning, scale, silhouette, regen and FULL HATER MODE | stage V2 |
| Ruin Alley | `public/assets/cartoon/option-a-v1/maps/ruin-alley.png` | Loaded as `ruin` and stretched to world bounds; props/cover are partly drawn as reused atlas frames. Inspect landmarks, collisions, layering and floor contrast | stage V5 |
| Additional maps | `maps/crown-court.png`, `maps/toxic-garden.png` | **Approved static masters, not demo gameplay maps.** Do not present them as implemented or add them to this solo slice | Later content |
| Main menu | `ui/main-menu.png` | Approved master exists per GDD A.14; runtime home is primarily CSS/DOM. Compare its composition with Option A without claiming the PNG is integrated | stage V4 |
| Weapons and drops | Phaser graphics in `scene.ts`, icons/text in `app.ts` | Functional but partly procedural shapes/text. GDD A.8 requires distinct silhouettes, attack timing, shield and pickup semantics; new illustrated icons are pending | stage V3 and #97 |

**Verified image inventory:** the first [PR #90 browser CI artifact](https://github.com/pedro-ai-coder/aura-farmer/actions/runs/39174099544) contained **21 image assets**: **10 approved masters** in `option-a-v1` and **11 runtime PNG files**, with **zero byte-identical duplicate groups**. The artifact includes the actual filenames, byte sizes and SHA-256; these are factual byte-level results, not an opinion on finish quality.

**First screenshots inspected:** in the same run's earlier functional captures, the **home menu** already uses warm paper panels, recognizable hero portraits and outlined buttons. **Ruin Alley** is illustrated with distinct landmarks and an unobstructed central path. A **Big Hater boss impact** frame has a visible coral danger circle. However, smaller HUD/build-chip/body text and secondary menu copy in `src/styles/app.css` use **9–12 px** sizes at the 1280×720 reference layout, below GDD A.9's **16 px minimum effect/body text**. Mark this as an explicit PR V4 legibility issue, rather than concluding all existing UI is approved. These captures demonstrate selected states only, not crowded-wave action clarity.

**Counts above are frame-rectangle/metadata counts, not an artistic assessment or proof of directional completeness.** Exact file-existence, bytes and hash values come from the generated CI inventory rather than guessed asset sizes.

### Gap / risk register, ordered by production dependency

| ID | Priority | Observed technical fact / gap to verify | GDD anchor | Proposed resolution |
| --- | --- | --- | --- | --- |
| VIS-01 | P0 | Cool Kid run groups reuse front/diagonal frames and rear sheet covers only one direction with 4 frames; eight-direction requirement is not yet verifiably met | A.4–A.5 | Separate approved-model sprite/animation pass, compare idle/run/attack/hurt/Flex in eight directions (V1) |
| VIS-02 | P0 | Alpha direction groups reuse existing frames; rear sheet has 12 frames for three directions. Check direction coverage and transition continuity | A.4–A.5 | Dedicated directional art or approved reuse; retain signature shoulders/hair and readable shield (V1) |
| VIS-03 | P0 | Enemy animation maps move/idle/windup/impact/recover/hurt/death to eight frames per family. This is **state coverage**, not eight-direction movement/attack verification | A.6 | Verify actual art/silhouette and telegraph directions per species; boss/berserk hero-size check (V2) |
| VIS-04 | P0 | Shields, AoE, item drops and Flex are rendered with several generic Phaser circles/lines; must confirm they remain distinguishable at wave density | A.8, C.1.3–4 | Approved sprite/icon effects, timing-true warnings, reduced-particles mobile variant (V3) |
| VIS-05 | P0 | Inspected home/arena screenshots have coherent paper/ink colors, but HUD/build-chip and secondary menu copy use 9–12 px CSS text, below the GDD's 16 px body reference. Glyph-based ability icons remain unillustrated | A.2, A.8–A.9 | Preserve approved styling; improve readability, item icons, nonoverlapping panels and six legendary cards (V4) |
| VIS-06 | P1 | Ruin Alley is an image backdrop with some reuse-based obstacle visuals; terrain/cover perspective, collision consistency and hero footprint need side-by-side review | A.7 | Stage prop/shadow pass without gameplay or collision changes (V5) |
| VIS-07 | P0 | Runtime contrast, clipping, bad alpha halos and mobile fullscreen have not been signed off on actual devices | A.5, A.10, C.1 | Baseline screenshot artifact + physical device review; final QA (V6) |
| VIS-08 | P1 | 60 FPS desktop target and stable 30 FPS reduced profile are requirements, **not measured metrics** in this audit | Section 16, A.10 | Define reference devices, crowded-wave test scene, profile and measured FPS (V6) |
| VIS-09 | P1 | GDD reference concept lives at `docs/references/exec-751c31ed-f3c5-4a5f-894e-92f42146c607.png`. Need human side-by-side review; a reference drawing is not a gameplay screenshot | A.1–A.2 | Owner visual checkpoint before authoring any missing images (V0 handoff, V1 kickoff) |

## Baseline screenshots, not marketing renders

Run `npm run test:browser -- visual-baseline.spec.ts`, or read the screenshots attached to the **Playwright Chromium / browser-test-results** artifact from the PR's CI run. The test records a desktop home at 1280×720 and 1920×1080, in-game **all three launch heroes**, their individual Flex presentations, an upgrade panel, pause, Big Hater and berserk, and portrait/landscape mobile captures.

The boss and upgrade captures use explicit **test-only simulation fixtures** to reach those UI states; they do **not** prove a real player can reach the boss or win. Flex and berserk screenshots are captured as **isolated test fixtures**, not continuous combat evidence; crowded-wave visuals and real animation recordings remain **uncaptured** until a controlled dense-combat scene or real human run provides representative images. Do not fabricate before/after panels or call this pass a visual overhaul.

### Handoff / owner checkpoint

- [ ] Download CI screenshot and asset-inventory artifacts and inspect *actual pixels* at play scale with the GDD Option A concept.
- [ ] Approve a single coherent style proof for Sigma, Cool Kid, Alpha Chad, an NPC/Hater, one shield/AoE effect, Ruin Alley and one UI card **before** authoring missing graphics.
- [ ] Identify missing frames/icons by file path, dimensions, states, pivot, and allowed source/rights. An identified need **is not permission to generate or replace an image**.
- [ ] Compare later graphic PR screenshots with this captured baseline at identical viewport sizes and commit IDs.
- [ ] Keep the solo web slice focused: no additional maps, heroes, mechanics, service costs or persistent dependencies.

**Audit completion means a reproducible plan and baseline evidence exist. It does not certify Option A artwork is already complete.**
