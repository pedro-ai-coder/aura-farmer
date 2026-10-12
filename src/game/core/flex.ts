export type FlexVariant='alpha'|'sigma'|'rizz';
export type FlexState='farming'|'ready'|'active';
/** Ability availability comes from the Aura gauge; no audience/cast interruption. */
export class FlexSystem {
  state:FlexState='farming';
  startedAt=0;
  activeUntil=0;
  variant:FlexVariant='sigma';
  durationMs=5000;
  isReady():boolean {return this.state==='ready';}
  isActive(now:number):boolean {return this.state==='active'&&now<this.activeUntil;}
  sync(now:number,charge:number):void {
    if(this.state==='active'&&now>=this.activeUntil)this.state='farming';
    if(this.state!=='active')this.state=charge>=100?'ready':'farming';
  }
  activate(now:number,charge:number,variant:FlexVariant):boolean {
    this.sync(now,charge);
    if(this.state!=='ready'||charge<100)return false;
    this.variant=variant;this.startedAt=now;this.durationMs=5000;
    this.activeUntil=now+this.durationMs;this.state='active';
    return true;
  }
  remaining(now:number):number{return this.isActive(now)?Math.max(0,this.activeUntil-now):0;}
  progress(now:number):number{return this.isActive(now)?1-this.remaining(now)/this.durationMs:0;}
}
