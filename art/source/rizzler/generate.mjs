/* Original, code-editable 48×48 Rizzler B3 art. Run: node art/source/rizzler/generate.mjs */
function makeArt(){
 const W=48,H=48,N=28;
 const palette=[
 '#000000','#302747','#291f42','#6a4b83','#aa6655','#e4a47c',
 '#ffd0ab','#773e72','#dd76b0','#ffa9d5','#ffcc51','#fff8e7',
 '#ffffff','#54b7a5','#231832','#45395f','#76629c','#ee568a',
 '#b875ce','#f9e7bc','#b15b94','#744eae','#4c3159','#d4a2b8'];
 const color=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
 const sheet=new Uint8Array(W*N*H);
 function draw(frame,portrait=false){
  const pixels=new Uint8Array(W*H);
  const dot=(x,y,c)=>{x=Math.round(x);y=Math.round(y);if(x>=0&&x<W&&y>=0&&y<H)pixels[y*W+x]=c;};
  const rect=(x,y,w,h,c)=>{for(let yy=Math.round(y);yy<y+h;yy++)for(let xx=Math.round(x);xx<x+w;xx++)dot(xx,yy,c);};
  const ellipse=(cx,cy,rx,ry,c)=>{for(let y=Math.floor(cy-ry);y<=cy+ry;y++)for(let x=Math.floor(cx-rx);x<=cx+rx;x++)if(((x-cx)/rx)**2+((y-cy)/ry)**2<=1)dot(x,y,c);};
  const line=(x,y,X,Y,r,c)=>{const n=Math.max(1,Math.ceil(Math.hypot(X-x,Y-y)*2));for(let i=0;i<=n;i++){const t=i/n;ellipse(x+(X-x)*t,y+(Y-y)*t,r,r,c);}};
  const heart=(cx,cy,s,c)=>{ellipse(cx-s*.48,cy-s*.28,s*.48,s*.47,c);ellipse(cx+s*.48,cy-s*.28,s*.48,s*.47,c);for(let y=0;y<s;y++){const width=Math.max(1,Math.floor((s-y)*.95));rect(cx-width,cy+y,width*2+1,1,c);}};
  if(portrait){
    // Full-frame bust portrait, rather than a cropped animation strip.
    ellipse(24,47,19,15,1);ellipse(24,45,17,13,7);
    rect(13,34,22,10,8);rect(18,35,12,8,9);
    ellipse(9,36,6,7,1);ellipse(39,36,6,7,1);
    ellipse(9,36,4,5,5);ellipse(39,36,4,5,5);
    rect(19,30,10,7,1);rect(20,30,8,6,4);
    rect(12,11,24,23,1);rect(14,13,20,18,5);rect(15,13,18,11,6);
    // Asymmetric violet coiffure and prominent side curl.
    rect(11,8,26,10,1);rect(13,7,23,9,2);
    rect(12,5,17,7,3);rect(18,3,17,9,2);rect(28,5,8,6,21);
    rect(11,13,7,7,2);rect(34,15,5,7,3);
    rect(17,21,6,4,1);rect(26,21,6,4,1);
    rect(18,22,4,2,12);rect(27,22,4,2,12);
    rect(20,20,2,1,11);rect(29,20,2,1,11);
    rect(20,28,10,2,1);rect(22,28,7,1,12);
    rect(15,30,2,2,17);rect(33,30,2,2,17);
    heart(24,40,4,10);rect(23,37,2,1,11);return pixels;
  }
  const idle=frame<4,walk=frame>=4&&frame<10,cast=frame>=10&&frame<13;
  const flex=frame>=13&&frame<17,success=frame>=17&&frame<20;
  const hurt=frame>=20&&frame<22,dead=frame>=22;
  const n=idle?frame:walk?frame-4:cast?frame-10:flex?frame-13:success?frame-17:hurt?frame-20:frame-22;
  const bob=walk?(n%2?1:-1):idle?(n%2):0;
  const lean=cast?Math.min(2,n):hurt?-2:0;
  const fall=dead?Math.min(12,n*3):0;
  const torsoY=21+bob+fall;
  const footY=38+(dead?Math.min(4,n):0);
  if(!dead||n<4){
   rect(16+(walk?n%2*3:0),footY,7,5,1);rect(27-(walk?n%2*3:0),footY,7,5,1);
   rect(17+(walk?n%2*3:0),footY+1,5,3,16);rect(28-(walk?n%2*3:0),footY+1,5,3,16);
   rect(17,32+bob,6,7,1);rect(27,32+bob,6,7,1);
   rect(19,33+bob,3,5,15);rect(28,33+bob,3,5,15);
  } else {rect(11,43,27,3,1);rect(13,43,23,2,16);}
  // Slim longcoat with offset hem to distinguish it from Sigma/Alpha.
  rect(15+lean,torsoY-1,19,17-(dead?n:0),1);
  rect(17+lean,torsoY,16,14-(dead?n:0),7);
  rect(17+lean,torsoY+2,5,12-(dead?n:0),8);
  rect(26+lean,torsoY+2,6,12-(dead?n:0),8);
  rect(18+lean,torsoY+3,4,4,9);rect(28+lean,torsoY+3,3,3,9);
  rect(22+lean,torsoY+1,5,10,2);
  rect(20+lean,torsoY+13,9,3,20);
  heart(25+lean,torsoY+6,3,10);
  // Arms wave during casting, but hitbox and ability timing are unchanged.
  let left=[11,26+bob],right=[38,26+bob];
  if(walk){left=[10+n%2,24+bob+(n%3)];right=[38-n%2,25+bob-(n%3)];}
  if(cast){left=[9,24];right=[39+n*2,19-n*2];}
  if(flex){left=[10-n%2,18+n%2];right=[38+n%2,18+n%2];}
  if(success){left=[9,16];right=[39,16];}
  if(hurt){left=[11,29+n];right=[37,29+n];}
  if(dead){left=[11,32+fall*.3];right=[37,32+fall*.3];}
  line(17+lean,24+bob+fall,left[0],left[1],5.2,1);line(17+lean,24+bob+fall,left[0],left[1],3.8,8);
  line(32+lean,24+bob+fall,right[0],right[1],5.2,1);line(32+lean,24+bob+fall,right[0],right[1],3.8,8);
  ellipse(left[0],left[1],4,4,1);ellipse(left[0],left[1],3,3,6);
  ellipse(right[0],right[1],4,4,1);ellipse(right[0],right[1],3,3,6);
  rect(20+lean,18+bob+fall,9,6,1);rect(21+lean,19+bob+fall,7,5,4);
  const faceY=13+bob+fall;
  if(!dead||n<5){
   rect(16+lean,faceY-8,17,17,1);rect(18+lean,faceY-7,14,15,5);
   rect(19+lean,faceY-5,12,10,6);rect(17+lean,faceY+5,16,2,4);
   // swooping hair and raised side flick
   rect(14+lean,faceY-9,22,7,1);rect(15+lean,faceY-11,20,7,2);
   rect(15+lean,faceY-12,13,5,3);rect(23+lean,faceY-14,13,5,2);
   rect(32+lean,faceY-9,5,6,21);
   rect(16+lean,faceY-5,4,6,2);
   rect(19+lean,faceY,5,3,1);rect(27+lean,faceY,5,3,1);
   rect(20+lean,faceY+1,3,1,12);rect(28+lean,faceY+1,3,1,12);
   rect(19+lean,faceY-2,5,1,3);rect(27+lean,faceY-2,5,1,3);
   rect(22+lean,faceY+6,8,2,1);rect(23+lean,faceY+6,6,1,12);
  }
  if(cast){heart(38+n*2,12-n*2,3+n,17);rect(37+n*2,9-n*2,2,1,11);}
  if(flex||success){rect(7,10+n%2,3,2,10);rect(38,8+n%2,2,3,10);}
  if(success){heart(24,3,3,10);rect(9,15,2,2,17);rect(39,13,2,2,17);}
  if(hurt){rect(9,14+n,3,3,17);rect(37,16+n,3,3,17);}
  if(dead&&n>=4){rect(14,44,4,2,8);rect(30,44,3,2,6);}
  return pixels;
 }
 for(let frame=0;frame<N;frame++){const data=draw(frame);for(let y=0;y<H;y++)sheet.set(data.subarray(y*W,(y+1)*W),y*W*N+frame*W);}
 function png(w,h,indices){
  const u32=n=>[(n>>>24)&255,(n>>>16)&255,(n>>>8)&255,n&255];
  const crc=bytes=>{let c=-1;for(const b of bytes){c^=b;for(let k=0;k<8;k++)c=(c>>>1)^((c&1)?0xedb88320:0);}return(c^-1)>>>0;};
  const adler=bytes=>{let a=1,b=0;for(const x of bytes){a=(a+x)%65521;b=(b+a)%65521;}return((b<<16)|a)>>>0;};
  const chunk=(name,data)=>{const tag=[...name].map(s=>s.charCodeAt(0));return [...u32(data.length),...tag,...data,...u32(crc([...tag,...data]))];};
  const raw=[];for(let y=0;y<h;y++){raw.push(0);for(let x=0;x<w;x++)raw.push(indices[y*w+x]);}
  const compressed=[0x78,0x01];
  for(let p=0;p<raw.length;p+=65535){const len=Math.min(65535,raw.length-p),last=p+len===raw.length;compressed.push(last?1:0,len&255,len>>8,(~len)&255,((~len)>>8)&255);for(let k=p;k<p+len;k++)compressed.push(raw[k]);}
  compressed.push(...u32(adler(raw)));
  return new Uint8Array([137,80,78,71,13,10,26,10,...chunk('IHDR',[...u32(w),...u32(h),8,3,0,0,0]),...chunk('PLTE',palette.flatMap(color)),...chunk('tRNS',[0]),...chunk('IDAT',compressed),...chunk('IEND',[])]);
 }
 return {atlas:png(W*N,H,sheet),portrait:png(W,H,draw(0,true)),palette,frameCount:N};
}
import {mkdirSync,writeFileSync} from 'node:fs';
const {atlas,portrait}=makeArt();
mkdirSync('public/assets/pixel',{recursive:true});
writeFileSync('public/assets/pixel/rizzler-b3.png',atlas);
writeFileSync('public/assets/pixel/rizzler-portrait.png',portrait);
