# Gate B2 — Hero roster visual preview

Branch `feature/gate-b-complete-hero-roster`, stacked on Gate B1 (#31).

## Playable preview: ?gateB=2
- Ohio Kid: asymmetrical cyan running jacket, angled visor, athletic lean, responsive run/sprint study.
- Fanum Lord: chunky XP collector with mint/indigo outfit and side satchel; animated collection keyed to real collected XP.
- Six Seven Kid: angular cap, gold 67 jersey, volley gesture keyed to real six-seven proc thresholds.
- Each: 48x48 code-authored native-pixel study with idle4, move6, hurt2, FLEX charge4, success3, death6, special move frames. Same source used for portraits and game.
- Prior Gate B Alpha/Rizzler and Gate A Sigma, NPC, Hater, clean arena are all active in ?gateB=2.
- No botany, no AI-style fantasy backgrounds and no code changes to the game simulation.

## Preview safety
- Existing character unlock requirements remain unchanged on shipped routes.
- ?gateB=2 temporarily makes the complete roster selectable to review the art; preview selections and run results are not saved to the normal local profile. No backend writes.
- ?gateB=1 continues as the old Alpha/Rizzler preview, ?gateA=1 as the original Gate A, default route untouched.
- Master status: TypeScript-authored editable pixel **studies**, not externally painted finalized animation atlas assets.

## QA
- Verify correct portraits, six active heroes, distinct special poses, fullscreen texture restoration, portrait/landscape menu and a five-wave run.
- Gate B2 is independent, reviewable and should not merge to main before approval of Gate B1 and Gate B2.