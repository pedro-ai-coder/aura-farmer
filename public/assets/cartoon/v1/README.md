# Cartoon public-art pack v3

Runtime art lives in this folder. All SVGs are individually editable, have no embedded fonts or external network references, and are rasterized by Phaser on startup.

- [Eight hero idle/portrait SVGs](characters)
- [Forty animated-state hero SVGs](characters/poses)
- [Four enemy idle SVGs](enemies)
- [Twelve enemy combat-state SVGs](enemies/poses)
- [Three selectable arena preview illustrations](arenas)
- [Live runtime manifest](asset-manifest.json)
- [Complete technical implementation](../../../../docs/art/CARTOON_V3_PRODUCTION.md)

**The three 1800×1320 playable maps are authored in** `src/game/core/worldMaps.ts` (solids and camera geometry), and `src/game/render/ruinAlleyArt.ts` / `worldVariantsArt.ts` (graphics). A preview SVG is not a tiled collision-map data file. Explicit tilemap and texture atlas exports remain planned.

The first public-facing pass removes the old placeholder portraits in runtime. It is **not** a claim that full hand-animated release atlases, every weapon FX or performance signoff are completed.
