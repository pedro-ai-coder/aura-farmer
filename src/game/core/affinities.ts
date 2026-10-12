import type {Vec2} from './math';
export type Affinity='alpha'|'sigma'|'rizz';
export const AFFINITIES=['alpha','sigma','rizz'] as const;
export interface EssenceDrop extends Vec2 { affinity:Affinity }
export type AffinityCounts=Record<Affinity,number>;
export function newAffinityCounts():AffinityCounts {return {alpha:0,sigma:0,rizz:0};}
export function dominantAffinity(counts:Readonly<AffinityCounts>,fallback:Affinity):Affinity{
 let winner=fallback,best=0;
 // Preserve base identity on all ties, then deterministic alphabetical list.
 for(const id of [fallback,...AFFINITIES.filter(a=>a!==fallback)]){
   if(counts[id]>best){winner=id;best=counts[id];}
 }
 return winner;
}
export function collectAffinity(counts:AffinityCounts,affinity:Affinity):void{
 counts[affinity]=Math.min(999,counts[affinity]+1);
}
