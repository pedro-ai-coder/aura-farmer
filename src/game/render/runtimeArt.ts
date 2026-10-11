/** First-pass runtime art integration. These are independently authored, editable SVG stills,
 * NOT exported animation atlases from the approved concept boards. Never override B1/B2/B3
 * animation atlases outside an explicit preview URL.
 */
export const runtimeArtPreview = (): boolean =>
  new URLSearchParams(window.location.search).get('runtimeArt') === '1';
export const RUNTIME_TEXTURES = {
  sigma:'rt-sigma', npc:'rt-npc', hater:'rt-hater', beta:'rt-beta', boss:'rt-boss',
  floor:'rt-field', xp:'rt-xp', friendly:'rt-friendly-shot', hostile:'rt-hostile-shot',
  aura:'rt-aura-fx',
} as const;
export const RUNTIME_FILES = [
  ['rt-sigma','sigma.svg',100,100],['rt-npc','npc.svg',100,100],
  ['rt-hater','hater.svg',100,100],['rt-beta','beta.svg',100,100],
  ['rt-boss','boss.svg',192,192],['rt-field','field.svg',960,600],
  ['rt-xp','xp.svg',32,32],['rt-friendly-shot','friendly-shot.svg',26,26],
  ['rt-hostile-shot','hostile-shot.svg',26,26],['rt-aura-fx','aura-fx.svg',72,72]
] as const;
