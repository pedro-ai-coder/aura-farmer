import Phaser from 'phaser';

/** Original 48px code-authored pixel studies for the two new starter archetypes.
 * FLEX frames use the character's temporary ultimate silhouette, not a permanent
 * transformation unlock or an artist-owned external atlas.
 */
export type StarterId='cool-kid'|'nerd';
export type StarterPose='idle'|'move'|'flex'|'hurt'|'death';
const starters=['cool-kid','nerd'] as const;
const poses=['idle','move','flex','hurt','death'] as const;
const pix=(c:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,color:string)=>{
 c.fillStyle=color;c.fillRect(x,y,w,h);
};
function draw(c:CanvasRenderingContext2D,id:StarterId,pose:StarterPose,frame:number):void{
 const cool=id==='cool-kid',flex=pose==='flex';
 const bob=pose==='move'?[0,1,0,-1][frame]:pose==='idle'?[0,0,1,0][frame]:0;
 const ink='#152037',skin=cool?'#f5bc8d':'#ead3bd',shade=cool?'#dc9264':'#b89483';
 const cloth=cool?(flex?'#eab94a':'#e27155'):(flex?'#55dcee':'#426fa8');
 const light=cool?(flex?'#fff4b7':'#ffb887'):(flex?'#d4fdff':'#90cef5');
 const dark=cool?'#933c4f':'#243962';
 c.save();
 if(pose==='death'){c.translate(24,38);c.rotate(frame*.1);c.translate(-24,-38);c.globalAlpha=.6;}
 // Boots (two asymmetric steps)
 pix(c,11+(frame%2&&pose==='move'?2:0),40,11,6,ink);
 pix(c,27-(frame%2&&pose==='move'?2:0),40,11,6,ink);
 pix(c,13,41,7,3,cool?'#fde3a8':'#8ed9ef');
 pix(c,29,41,7,3,cool?'#fde3a8':'#8ed9ef');
 // Two-layer hoodie/jacket torso
 pix(c,12,25+bob,25,16,ink);pix(c,14,26+bob,21,13,cloth);
 pix(c,17,28+bob,15,3,light);pix(c,22,30+bob,5,9,dark);
 if(cool){pix(c,16,34+bob,6,3,light);pix(c,29,34+bob,5,3,light);}
 else{pix(c,21,29+bob,8,4,'#bdeffc');pix(c,19,35+bob,12,2,light);}
 // Arms: wide shoulders become Giga Chad while FLEXing.
 const off=flex?4:0;
 pix(c,7-off,26+bob,9+off,13,ink);pix(c,33,26+bob,9+off,13,ink);
 pix(c,9-off,29+bob,5+off,9,flex?skin:cloth);
 pix(c,35,29+bob,5+off,9,flex?skin:cloth);
 if(flex){
  pix(c,4,31+bob,7,8,ink);pix(c,39,31+bob,7,8,ink);
  pix(c,5,32+bob,5,5,skin);pix(c,40,32+bob,5,5,skin);
  // Controlled glint and star, not full screen flash
  pix(c,2,15+bob,4,4,light);pix(c,43,14+bob,4,4,light);
 }
 // Head and brow
 pix(c,13,9+bob,23,20,ink);pix(c,15,11+bob,19,16,skin);
 pix(c,17,23+bob,15,3,shade);
 if(cool){
   // Signature offset baseball cap with dark brim
   pix(c,12,8+bob,25,6,ink);pix(c,14,9+bob,20,4,flex?'#ffd26b':'#e75656');
   pix(c,8,13+bob,19,3,ink);pix(c,9,13+bob,15,2,flex?'#ffc557':'#f38f64');
   if(flex){
     pix(c,15,18+bob,20,5,ink);pix(c,17,19+bob,6,2,light);pix(c,27,19+bob,5,2,light);
     pix(c,22,25+bob,9,2,ink); // signature Giga shades
   }else{
     pix(c,18,18+bob,4,3,ink);pix(c,28,18+bob,4,3,ink);
     pix(c,24,24+bob,5,2,dark);
   }
 }else{
   // Nerd: squared glasses and side-part hair
   pix(c,14,9+bob,21,6,ink);pix(c,17,8+bob,15,3,'#423950');
   pix(c,15,17+bob,9,8,ink);pix(c,26,17+bob,9,8,ink);
   pix(c,17,18+bob,6,5,flex?'#a8fbff':'#daefff');
   pix(c,28,18+bob,6,5,flex?'#a8fbff':'#daefff');
   pix(c,24,19+bob,3,2,ink);pix(c,22,26+bob,9,2,dark);
   if(flex){pix(c,3,28,7,3,'#c8fdff');pix(c,38,28,8,3,'#c8fdff');}
 }
 if(pose==='hurt'){pix(c,17,18+bob,16,3,'#ffadad');}
 c.restore();
}
function build(id:StarterId,pose:StarterPose,frame:number):HTMLCanvasElement{
 const canvas=document.createElement('canvas');canvas.width=48;canvas.height=48;
 const c=canvas.getContext('2d')!;c.imageSmoothingEnabled=false;draw(c,id,pose,frame);return canvas;
}
export function starterSpriteKey(id:StarterId,pose:StarterPose,clock:number):string {
 const f=pose==='death'?Math.min(3,Math.floor(clock/160)):Math.floor(clock/(pose==='move'?125:180))%4;
 return 'as-'+id+'-'+pose+'-'+f;
}
export function createStarterArt(scene:Phaser.Scene):void {
 for(const id of starters)for(const pose of poses)for(let frame=0;frame<4;frame++){
   const key='as-'+id+'-'+pose+'-'+frame;
   if(!scene.textures.exists(key)){
     const texture=scene.textures.addCanvas(key,build(id,pose,frame));
     texture?.setFilter(Phaser.Textures.FilterMode.NEAREST);
   }
 }
}
export function starterPortrait(id:StarterId):string {
 const out=document.createElement('canvas');out.width=96;out.height=96;
 const c=out.getContext('2d')!;c.imageSmoothingEnabled=false;
 c.fillStyle=id==='cool-kid'?'#483e5b':'#274563';c.fillRect(0,0,96,96);
 c.fillStyle=id==='cool-kid'?'#f2b05d':'#7addf1';c.fillRect(4,4,88,88);
 c.fillStyle='#142338';c.fillRect(9,9,78,78);
 c.drawImage(build(id,'idle',0),0,0,48,48,0,0,96,96);
 return out.toDataURL('image/png');
}
