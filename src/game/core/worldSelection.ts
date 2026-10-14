import { WORLDS, type WorldId } from './worldMaps';

/** Visual game worlds are selected before a run. Classic visual modes stay classic. */
export function validWorldId(value: string | null | undefined): value is WorldId {
  return WORLDS.some(world=>world.id===value);
}
export function selectedWorldFromQuery(query: string): WorldId {
  const params=new URLSearchParams(query);
  const id=params.get('map');
  return validWorldId(id)?id:'ruin-alley';
}
export function withSelectedWorld(url: string, world: WorldId):string {
  const next=new URL(url,'https://aura-farmer.invalid');
  next.searchParams.set('map',world);
  return next.pathname+next.search+next.hash;
}
