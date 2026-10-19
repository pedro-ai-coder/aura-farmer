# V2 — Enemy and Big Hater Animation Integration (Option A)

**Basis:** merged PR #91, `docs/GDD.md` Annex A.6, `docs/VISUAL_PRODUCTION_CONTRACT.md` and `docs/ASSET_POLICY.md`.  
**Art direction:** Option A / Cartoon Arcade. No new art generated, original approved PNGs untouched, no combat changes.

## What we actually have

`src/browser/enemy-frames.json` describes **17 actor variants**, each with **8 authored runtime frame references**: four locomotion/idle frames, a windup, an impact, a hurt/stagger and a defeat. One variant is the Big Hater in berserk mode, distinct from its normal frames. The runtime source art comes from `enemies-a-v2.png`, `enemies-b-v2.png`, `events-v2.png`, and `haters-v2.png`, with masks assembled by `enemy-textures.ts`.

These are **eight states/frames**, not eight distinct directional drawings. Mirroring for enemy aim direction is still necessary. The master concept is under `public/assets/cartoon/option-a-v1`, and all artwork production still requires separate owner image-generation/replacement approval.

## Two concrete presentation improvements

### 1. Windup now releases into recovery

Before this iteration the same frame **4** (wound-up anticipation) was shown in both **windup** and **recovery**. Immediately after frame **5** (impact) an enemy visually wound up a second time, even when no further attack was scheduled. The animator now uses **neutral frame 0** for recovery and keeps the simulation-owned `attackPose` deadline unchanged.

This corrects the interpretation of the approved source art without changing contact/projectile damage, boss stages, stagger duration, area shape or cooldown.

### 2. Local attack orientation is readable and truthful

`enemy-telegraph.ts` now derives a small ink-outlined, aura-gold windup ring and attack-direction chevron for enemies with existing `attackPose` cues (Hater, Ratio Ram, Doomscroller, Ping Sniper, active event bosses, Big Hater). The marker:

- starts **exactly** when the simulation schedules an attack and ends at the actual `attackPose.end`;
- follows the **locked `attackPose.angle`**, not the player's later position;
- fills with the actual existing windup progress and briefly turns coral on impact;
- is rendered **beneath the enemy**, keeps its shape in reduced-effects mode, and is never drawn for dead or merely idling enemies;
- creates **no new attack or warning window** and does not alter hitboxes, enemy AI, projectile trajectory or damage;
- does not replace the existing actual world-space circle/line/cone/ring attack region, nor turn the whole screen red.

For Big Hater berserk, a small coral ink ring anchors the already approved berserk pose; the existing boss health HUD/actual attack telegraphs remain responsible for detailed feedback.

## Actual visual evidence and QA

- `tests/browser/enemy-boss-art-review.spec.ts` saves **`test-results/v2-approved-enemy-boss-art-sheet.png`**: all **136 existing source-art frame selections** across 17 actor variants and 8 states, from Phaser-loaded approved assets, including both normal and berserk Big Hater.
- The same test probes seven real attack-ready families in windup/impact/recovery, verifying the locked direction and the absence of a stale warning during recovery.
- `tests/enemy-animation.test.ts` validates cue deadlines, no cue for support-only/idle/stagger/defeat, impact-before-recovery ordering and unmodified combat.
- Existing Playwright visual baselines and sprite snapshots remain unchanged. Screenshots are snapshots of **actual current runtime asset pixels**, not illustrations of missing sprites or proof of a completed wave.
- Run TypeScript, Vitest, build, Playwright, secret audit and Vercel on the final SHA, and inspect artifact PNG at game scale.

## Honest remaining art-production gaps

| GDD A.6 requirement | Status after this integration | Next owner-controlled action |
| --- | --- | --- |
| Distinct silhouettes for NPC, Hater, Beta Bot, specialist enemies and event bosses | Approved source sheets load 17 variants; pixel-level final silhouette sign-off still open | Inspect contact sheets alongside actual busy combat video |
| Charge/projectile windup and real locked aim | Presentation now uses real deadlines and directional chevron | Human mobile/desktop review for scale and clarity at enemy density |
| Authored directional attack poses for each family | **Not complete**: each family has authored pose states but not eight distinct directional sets | Request owner authorization for any missing drawn frames; preserve masters |
| Elite accessory, outline **and scale** | Elite radius already has 1.2× scale and an aura-gold ring; unique accessory sprites not yet supplied | Separate approved art request; do not fake accessories via recolor |
| Big Hater crown, pink body, white shirt, oversized fists; distinctive berserk | Existing normal and berserk art variants + local coral aura; no new silhouette | Actual human boss/berserk encounter and art checkpoint |
| Polished audio, high-density VFX, attack-family effects | Deliberately out of V2 scope | V3 effects/audio work after separate scoping and approval |

No GDD or asset policy change is implied by an integration PR. New PNG sprites, replacing atlas sheets, hero poses, maps, monetization and gameplay numbers are **not included**.

## Final acceptance

- [ ] 136-frame contact sheet collected and inspected at normal gameplay scale.
- [ ] Locked attack indicators remain visible during genuine enemies' windups and never after recovery.
- [ ] Boss normal and berserk visibly distinct; no invisible hazards or misleading telegraphs.
- [ ] Reduced-effects mode uses fixed, readable markers.
- [ ] TypeScript, Vitest, Playwright, build, security audit and Vercel green on latest SHA.
- [ ] Owner explicitly approves PR before merge.
