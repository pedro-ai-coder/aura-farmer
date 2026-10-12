import { clamp } from './math';
export type AuraRank = 'NPC' | 'COOL' | 'ALPHA' | 'SIGMA' | 'GOD AURA';
export function auraRank(value:number):AuraRank {
  if(value>=100)return 'GOD AURA';
  if(value>=75)return 'SIGMA';
  if(value>=50)return 'ALPHA';
  if(value>=25)return 'COOL';
  return 'NPC';
}
export interface AuraChange { before:number; after:number; burst:boolean }
/** One player-controlled FLEX charge. No automatic 100-point burst. */
export class AuraSystem {
  value=0;
  peak=0;
  // Retain legacy read-only metrics for old render/save schema compatibility.
  bursts=0;
  burstUntil=0;
  change(amount:number,_now=0):AuraChange {
    const before=this.value;
    this.value=clamp(before+amount,0,100);
    this.peak=Math.max(this.peak,this.value);
    return {before,after:this.value,burst:false};
  }
  spend():boolean {
    if(this.value<100)return false;
    this.value=0;
    this.bursts++;
    return true;
  }
  get rank():AuraRank {return auraRank(this.peak);}
  get moveMultiplier():number {return this.peak>=25?1.05:1;}
  get damageMultiplier():number {return this.peak>=50?1.1:1;}
  attackMultiplier(_now:number):number {return this.damageMultiplier;}
  get fireRateMultiplier():number {return this.peak>=75?1.1:1;}
}
