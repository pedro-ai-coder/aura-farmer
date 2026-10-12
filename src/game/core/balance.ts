import type {CharacterId} from '../data/characters';
import type {FlexVariant} from './flex';

/** Rules for the balancing slice. All multipliers are intentional and bounded.
 * Waves still have legacy pacing until the miniboss/arena overhaul.
 */
export const BALANCE={
  waveHealthStep:.24,
  waveDamageStep:.11,
  waveSpeedStep:.035,
  bossWaveHealthStep:.30,
  betweenWaveHealFraction:.10,
  alphaBulwarkReduction:.72,
  alphaChargeReduction:.45,
  alphaBulwarkPulseMs:750,
  alphaBulwarkRadius:140,
  bossFlexDamageCap:.22,
} as const;
export type FlexStyle='alpha-rampage'|'alpha-bulwark'|'alpha-charge'|'sigma-overclock'|'rizz-takeover';

export function flexStyleFor(hero:CharacterId,affinity:FlexVariant):FlexStyle{
  if(affinity==='sigma')return 'sigma-overclock';
  if(affinity==='rizz')return 'rizz-takeover';
  if(hero==='cool-kid')return 'alpha-rampage';
  if(hero==='alpha')return 'alpha-bulwark';
  return 'alpha-charge';
}
export function flexDescription(style:FlexStyle):string{
  switch(style){
    case 'alpha-rampage':return '5s invulnerable • steer and trample';
    case 'alpha-bulwark':return '5s 72% damage reduction • shockwave shield';
    case 'alpha-charge':return '5s 45% damage reduction • knockback charge';
    case 'sigma-overclock':return '5s precision • piercing critical fire';
    case 'rizz-takeover':return '5s control • slow and pulse';
  }
}
export function waveHealthMultiplier(wave:number,isBoss=false):number{
  const step=isBoss?BALANCE.bossWaveHealthStep:BALANCE.waveHealthStep;
  return 1+Math.max(0,Math.min(4,wave-1))*step;
}
export function waveDamageMultiplier(wave:number):number{
  return 1+Math.max(0,Math.min(4,wave-1))*BALANCE.waveDamageStep;
}
export function waveSpeedMultiplier(wave:number):number{
  return 1+Math.max(0,Math.min(4,wave-1))*BALANCE.waveSpeedStep;
}
