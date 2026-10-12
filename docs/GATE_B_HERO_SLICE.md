# Gate B — Hero identity / first playable slice

Branch: feature/gate-b-hero-identity-slice
Preview: ?gateB=1 (keeps default and ?gateA=1 unchanged)

## Implemented for preview
- Alpha Chad: oversized gloves, square jaw, orange varsity silhouette; idle / move / hurt / FLEX / death / punch frames.
- Rizzler: slimmer silhouette, pink scarf, glasses and purple coat; idle / move / hurt / FLEX / death / Rizz cast.
- Two dedicated menu portraits drawn from the same code-driven 48x48 pixel masters as live textures.
- Uses Gate A slate arena, Sigma, NPC, Hater, XP, bullets and hit FX.
- No changes to damage, HP, game rules, unlock logic or backend; stays opt-in.

## Explicit remaining scope
- Gate B requires all six heroes: Ohio Kid, Fanum Lord and Six-Seven Kid are later reviewable batches.
- These are **author-created TypeScript pixel studies**, not externally hand-painted Aseprite animation masters or user-approved final atlases.
- Follow review protocol: preview → user approval/revisions → merge.

## QA
Run npm ci, npm run typecheck, npm test, npm run build, npm run test:browser.
Check portrait selection and runtime consistency; responsive home; desktop/landscape fullscreen recovery.