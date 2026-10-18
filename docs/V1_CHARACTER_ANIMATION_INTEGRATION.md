# V1 — Character Animation: Approved-Asset Integration and Remaining Art

**Art direction:** GDD Annex A.1–A.5 — Option A / Cartoon Arcade, already chosen and immutable for this iteration.  
**Base:** `main` after merged PR #90 (visual audit).  
**Scope:** Sigma, Cool Kid, Alpha Chad. No new hero, gameplay change, image generation or replacement of approved artwork.

## Verified existing runtime resources

| Hero | Existing atlas | Additional art already present | Current movement routing |
| --- | --- | --- | --- |
| Sigma | `public/assets/runtime/sigma-atlas.png` — **48 rectangles** | None needed for default run directions; rear diagonals are embedded in the atlas | 8 logical directions × 4 walk frames from the atlas; NW uses the explicitly required mirror |
| Cool Kid | `cool-kid-atlas.png` — **40 rectangles** | `cool-kid-rear-v2.png` — **4** rear frames; `cool-kid-flex-v2.png` — **8** transformation frames | Six authored atlas movement groups + north rear group; mirrored east frame group for west |
| Alpha Chad | `alpha-atlas.png` — **48 rectangles** | `alpha-rear-v2.png` — **12** rear frames | Front-facing movement groups in atlas plus NW/N/NE rear frames; mirrored east for west |

Counts represent existing texture rectangles and **must not** be reported as unique painted poses unless pixel-inspected. These files remain unchanged in this PR. The original masters stay under `public/assets/cartoon/option-a-v1/characters`.

### Fixed by this integration pass

**Movement auto-aim flip regression:** the renderer previously selected the *walking* texture group using `movementFacing`, but left the image's flip default dependent on the separate `facing` (aiming) angle. A moving target could therefore flip a running character halfway through a four-frame stride while the hero kept walking in the same direction. For all eight directions and three heroes, the visual mirror policy now depends only on the chosen source art and movement direction:

- Sigma: mirror **NW** (authored rear diagonal faces the opposite way).
- Cool Kid and Alpha: mirror **W** (explicit reuse of the east-oriented art).
- Existing dedicated rear art is drawn without automatic aim flips.
- Standing/attack orientation still uses the actual **aim direction**: movement and aiming remain independent.

The animation change is **presentation-only**. It does not modify movement, colliders, weapon targeting, attack timing, RNG, Flex duration or save data.

## Second observed rendering problem: neighbouring atlas fragments

The **actual sprite contact sheets** from the initial V1 evidence run showed stray pixels from adjacent authored drawings inside several tightly packed atlas rectangles. Examples:

- **Cool Kid attack frames 27–28:** the next drawing's shoe appears to the right of the keyboard strike, and the previous drawing's keyboard floats at the left of the following pose.
- **Cool Kid hurt frames 29–30:** narrow edge fragments flicker beside the falling character.
- **Alpha attack frames 34–36:** a stray neighbouring shoe, shield edge or ink mark appears beside the intended slam/attack pose.

These are runtime atlas extraction artifacts, not missing new character designs. `src/browser/hero-frame-mattes.ts` now extracts seven affected poses into tiny runtime canvases and clears **only documented source-edge bands**. The approved source PNGs and original cropped frame sizes remain intact, so the gameplay position, world sprite size and foot pivot do not change. All other poses still use the unchanged atlas and rear/Flex textures.

The new browser QA checks that cleaned bands are fully transparent and the interior remains drawn, and the six contact sheets now show the *actual runtime-corrected* images (marked `CLEAN` where applicable). This does **not** create a new illustrated pose, generate artwork, edit a source master or change any combat rules.

## Visual and automated QA

- `tests/hero-animation.test.ts` asserts that **all 96 logical walk poses** (3 heroes × 8 directions × 4 phases) keep the same frame, sheet, scale and mirror as auto-aim moves from right to left. Idle aim still turns independently. Existing tests verify frame bounds, death, Flex and pause stability.
- `tests/browser/character-direction-review.spec.ts` saves six PNG contact sheets, two per hero: **32 approved runtime direction/phase images** and **15 action-state images**, with sheet, frame and mirror labels. They include the *seven fringe-cleaned runtime extracts*, verified to have transparent edge bands and opaque interior art. These are **renders of already existing textures**, not newly painted sprites.
- Screenshot outputs are written to `test-results/v1-approved-*.png` and published in GitHub Actions' `browser-test-results` artifact alongside PR #90's baselines. A screenshot proof is not a substitute for a video of running animation.
- Compare `test-results/before-<hero>-gameplay-1280x720.png` from PR #90 and its original CI artifact against the PR preview and the new sprite sheets.
- Required checks: TypeScript, Vitest, Vite build, Playwright Chromium, security audit and exact-commit Vercel deployment.

## Artwork that still needs production authorization

**This is an integration/QA pass, not completion of the GDD A.5 visual drawing quota.** The existing atlas metadata does not establish separately drawn idle/attack/hurt/Flex action poses in every direction. These remain open and need independent owner approval **before** generating or replacing any images, per `docs/ASSET_POLICY.md`:

| Missing / requires visual confirmation | Source to adapt | Requested output when approved | Owner acceptance |
| --- | --- | --- | --- |
| Cool Kid back diagonals and directional idle/attack | Approved Cool Kid master and existing front/rear sheets | True 8-direction run/idle/attack illustrations without reversed signature cap/pompom; 128×128 transparent runtime frames unless readability requires larger | No sliding, 4 clearly different run phases/direction, 2 idle, 3 attacks, stable pivot |
| Alpha rear-direction idle/attack and west silhouette | Approved Alpha Chad master and 12 rear frames | Back/side attacks coordinated with shield and slam pose, ink contours and shoulders matching Option A | Attacks read from behind; no front-to-back sprite popping |
| Sigma rear-direction attack/hurt and readability | Approved Sigma master and 48-frame atlas | Proper north and diagonal aim-driven attack poses, hood/emblem consistency; preserve No Cap weapon cue | Retains hood, compact silhouette, independently readable aim |
| Three heroes: directional damage, defeat transitions | Approved original master/approved runtime atlas | Four combined hurt/defeat frames and matching pivots where genuine missing drawings are confirmed | No mismatch of impact direction/opacity or hitbox |
| Flex in/active/out refinement | Existing Sigma, Alpha and Cool Kid Flex frames | Supplement missing illustrated transitions only after visual proof of gaps | Start/active/end timing matches existing simulation events |

The table is a **request backlog** rather than permission to generate artwork. Store any newly authorized high-resolution transparent masters with exact provenance and build derived atlas/frame metadata in a separate approved graphics PR; do not overwrite the existing approved masters.

## Real-device and release caveats

The solo demo still needs Sigma/Cool Kid complete-run balance acceptance, post-berserk victory, mobile fullscreen/joystick device validation, crowded-wave readability and actual reference FPS measurement. This V1 pass does not change or certify those criteria.

## V1 exit checklist

- [ ] All tests and preview green on final commit.
- [ ] The six direction/action contact sheets are present, inspected and linked to their exact CI run.
- [ ] All seven fringe-cleaned frames show no stray pixel fragments in real before/after contact sheets.
- [ ] The visual integration regression is absent while moving west/north and attacking in another direction.
- [ ] Explicit acknowledgement that GDD A.5's new painted frame quota remains open until separate asset-production approval.
- [ ] Owner explicitly approves **this PR** before merge.
