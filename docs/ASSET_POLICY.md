# Asset policy and reuse

No images may be generated automatically during functional PRs. Obtain explicit owner approval before generating any new image. Graphics-only iterations must use a separate PR.

## Selection order
1. Reuse an approved asset under `public/assets/cartoon/option-a-v1` if suitable.
2. Reuse an existing runtime asset under `public/assets/runtime`.
3. Use a clearly marked temporary placeholder without changing gameplay behavior.
4. Log missing artwork in the next dedicated graphics iteration, including intended size, pose, usage, and provenance.

Run `npm run assets:inventory` to produce a JSON inventory of image files in `public/assets` (paths, bytes, extension, SHA-256). Identical hashes identify byte-identical duplicates, not necessarily redundant assets. Never delete files automatically. The inventory is generated locally under `reports/` and is not committed.

Do not replace approved art or modify asset licensing assumptions without review. Keep all original masters intact. No paid image service or external API without explicit approval.
