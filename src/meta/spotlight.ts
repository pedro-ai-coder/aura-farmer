import { isGateA } from '../game/render/gateAArena';
type SpotlightVariant = 'wave'|'boss'|'aura';
export function setupSpotlights(): void {
  const root=document.querySelector<HTMLElement>('#af-spotlight');
  const kicker=document.querySelector<HTMLElement>('#af-spotlight-kicker');
  const title=document.querySelector<HTMLElement>('#af-spotlight-title');
  const subtitle=document.querySelector<HTMLElement>('#af-spotlight-subtitle');
  if(!root || !kicker || !title || !subtitle) return;
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const show=(kind:SpotlightVariant,top:string,main:string,bottom:string):void=>{
    if(timeout) clearTimeout(timeout);
    root.dataset.variant=kind;
    kicker.textContent=top; title.textContent=main; subtitle.textContent=bottom;
    root.hidden=false;
    // This is presentation-only and never pauses or changes simulation state.
    timeout=setTimeout(()=>{root.hidden=true;timeout=undefined;},2400);
  };
  window.addEventListener('aura:wave',(event:Event)=>{
    const wave=(event as CustomEvent<number>).detail;
    if(wave===1) show('wave','THE ADVENTURE BEGINS','WAVE 1',isGateA() ? 'Own the arena!' : 'Defend your fields!');
    else if(wave===5) show('boss','DANGER · FINAL WAVE','THE BIG HATER','Prepare for the ultimate harvest!');
    else show('wave','THE HORDE IS GROWING',`WAVE ${wave}`,'Keep your Aura alive!');
  });
  window.addEventListener('aura:burst',()=>show('aura','POWER UNLEASHED','AURA BURST!','Damage increased · +20%'));
}
