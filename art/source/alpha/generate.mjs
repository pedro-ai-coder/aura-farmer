/* Original indexed 48px Alpha Chad frame generator. Run: node art/source/alpha/generate.mjs */
function makeArt(){
 const W=48,H=48,N=31;
 const palette=['#000000','#302747','#44345f','#543725','#92613d','#c87951','#ffc58e','#a95d43','#e7832f','#ffb544','#ffcc51','#fff8e7','#44345f','#74507b','#ea568a','#f39a8b','#35b4c9','#674a73','#ffffff','#a880b7','#fff2b1','#21172a','#db7753','#a75839'];
 const color=(h)=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
 const sheet=new Uint8Array(W*N*H);
 function draw(frame,portrait=false) {
   const w=48,h=48,p=new Uint8Array(w*h);
   const plot=(x,y,c)=>{x=Math.round(x);y=Math.round(y);if(x>=0&&x<w&&y>=0&&y<h)p[y*w+x]=c;};
   const rect=(x,y,ww,hh,c)=>{for(let yy=Math.round(y);yy<y+hh;yy++)for(let xx=Math.round(x);xx<x+ww;xx++)plot(xx,yy,c);};
   const ell=(cx,cy,rx,ry,c)=>{for(let yy=Math.floor(cy-ry);yy<=cy+ry;yy++)for(let xx=Math.floor(cx-rx);xx<=cx+rx;xx++)if(((xx-cx)/rx)**2+((yy-cy)/ry)**2<=1)plot(xx,yy,c);};
   const line=(x1,y1,x2,y2,thick,c)=>{
     const dist=Math.max(Math.abs(x2-x1),Math.abs(y2-y1)),n=Math.max(1,Math.ceil(dist*2));
     for(let i=0;i<=n;i++){const t=i/n;ell(x1+(x2-x1)*t,y1+(y2-y1)*t,thick/2,thick/2,c);}
   };
   const outlinedRect=(x,y,ww,hh,c)=>{rect(x-1,y-1,ww+2,hh+2,1);rect(x,y,ww,hh,c)};
   const eyes=(cx,cy)=>{
     rect(cx-8,cy,5,4,1);rect(cx+3,cy,5,4,1);
     rect(cx-7,cy+1,3,2,18);rect(cx+4,cy+1,3,2,18);
     rect(cx-6,cy+1,1,1,21);rect(cx+5,cy+1,1,1,21);
     rect(cx-8,cy-1,6,1,3);rect(cx+2,cy-1,7,1,3);
   };
   if (portrait) {
     ell(24,46,20,17,1);ell(24,43,19,15,8);rect(9,33,30,7,9);rect(20,37,8,6,10);
     ell(10,31,8,10,1);ell(38,31,8,10,1);ell(9,30,6,8,5);ell(39,30,6,8,5);rect(6,27,6,3,6);rect(36,27,6,3,6);
     rect(12,7,24,26,1);rect(13,8,22,23,5);rect(15,9,18,18,6);rect(15,27,18,4,22);
     // strong quiff
     rect(10,6,28,9,1);rect(12,4,23,9,3);rect(16,2,16,8,4);rect(23,1,8,7,3);rect(11,11,7,6,3);
     rect(18,6,11,2,4);rect(32,8,5,4,3);eyes(24,19);
     rect(17,26,14,3,1);rect(19,26,10,1,18);rect(22,29,5,1,7);
     rect(13,20,2,2,15);rect(33,20,2,2,15);
     rect(22,42,4,3,11);rect(23,39,2,7,10);return p;
   }
   const idle=frame<4,walk=frame>=4&&frame<10,punch=frame>=10&&frame<16,flex=frame>=16&&frame<20,success=frame>=20&&frame<23,hurt=frame>=23&&frame<25,dead=frame>=25;
   const n=idle?frame:walk?frame-4:punch?frame-10:flex?frame-16:success?frame-20:hurt?frame-23:frame-25;
   const bob=(walk?(n%2?1:-1):idle?(n===1||n===3?1:0):0);
   const lean=punch?(n>=2&&n<=4?2:0):hurt?-2:0;
   const collapse=dead?Math.min(13,n*3):0;
   const cy=19+bob+collapse;
   const footY=37+(dead?Math.min(5,n):0);
   // exaggerated broad boots and planted stance
   if (!dead||n<4) {
     rect(13+(walk?(n%3-1)*2:0),footY,9,5,1);
     rect(26+(walk?-(n%3-1)*2:0),footY,9,5,1);
     rect(15+(walk?(n%3-1)*2:0),footY+1,6,3,12);
     rect(27+(walk?-(n%3-1)*2:0),footY+1,6,3,12);
     rect(15,footY+1,4,1,11);rect(28,footY+1,4,1,11);
     rect(16,31+bob,6,7,1);rect(27,31+bob,6,7,1);
     rect(17,32+bob,4,5,17);rect(28,32+bob,4,5,17);
     rect(18,33+bob,2,2,19);rect(29,33+bob,2,2,19);
   }else {
     rect(8,42,30,3,1);rect(9,42,28,2,12);
   }
   // huge trapezoid tank torso, dark trim vest + broad arms
   const bx=12+lean,by=19+bob+collapse,bodyHeight=dead?Math.max(6,15-n*2):16;
   rect(bx-1,by-2,26,bodyHeight+3,1);rect(bx+1,by,22,bodyHeight-1,8);
   rect(bx+2,by+2,20,5,9);rect(bx+2,by+7,20,4,8);
   rect(bx+6,by+11,10,2,7);rect(bx+7,by+12,8,2,5);
   rect(bx+1,by,4,5,2);rect(bx+18,by,4,5,2);
   // lightning emblem
   rect(bx+11,by+4,5,2,11);rect(bx+9,by+6,5,3,10);rect(bx+11,by+9,3,2,10);
   rect(bx+8,by+13,12,2,1);rect(bx+9,by+13,10,1,20);
   // bulging arms
   let left=[8,24+bob],right=[39,24+bob];
   if(walk){left=[8+n%2,22+bob+(n%3)];right=[39-n%2,25+bob-(n%3)];}
   if(punch){const reach=[0,2,8,13,10,3][n];right=[39+reach,21+bob-(reach>4?1:0)];left=[8,24+bob];}
   if(flex){left=[7-n%2,16-bob-(n%2)*2];right=[40+n%2,16-bob-(n%2)*2];}
   if(success){left=[6,15+n%2];right=[40,15+n%2];}
   if(hurt){left=[8,27+n];right=[37,27+n];}
   if(dead){left=[8,33+collapse*.35];right=[39,33+collapse*.35];}
   // shoulder and bicep with ink outline and dual highlight
   line(13+lean,23+bob+collapse,left[0],left[1],11,1);
   line(13+lean,23+bob+collapse,left[0],left[1],8,5);
   line(13+lean,20+bob+collapse,left[0]+1,left[1]-2,4,6);
   line(35+lean,23+bob+collapse,right[0],right[1],11,1);
   line(35+lean,23+bob+collapse,right[0],right[1],8,5);
   line(35+lean,20+bob+collapse,right[0]-1,right[1]-2,4,6);
   // wrist wraps and oversized fists
   ell(left[0],left[1]+3,5,5,1);ell(left[0],left[1]+3,4,4,6);
   rect(left[0]-2,left[1]-1,5,2,13);rect(left[0]-1,left[1],3,1,10);
   ell(right[0],right[1]+3,5,5,1);ell(right[0],right[1]+3,4,4,6);
   rect(right[0]-2,right[1]-1,5,2,13);rect(right[0]-1,right[1],3,1,10);
   if(punch&&n>=2&&n<=4){line(39,22,right[0],right[1],6,10);rect(42,14,3,2,20);rect(44,18,2,2,10);rect(41,27,2,2,9);}
   // neck + jaw
   rect(20+lean,17+bob+collapse,9,8,1);rect(21+lean,18+bob+collapse,7,6,7);
   // head
   const hcy=13+bob+collapse;
   if(!dead||n<5){
     rect(16+lean,hcy-8,18,17,1);rect(17+lean,hcy-7,16,15,5);
     rect(18+lean,hcy-5,14,10,6);rect(17+lean,hcy+5,16,2,22);
     rect(14+lean,hcy,3,4,1);rect(15+lean,hcy+1,2,2,5);
     rect(34+lean,hcy,3,4,1);rect(34+lean,hcy+1,2,2,5);
     // angular pompadour
     rect(14+lean,hcy-10,22,7,1);rect(16+lean,hcy-12,19,9,3);
     rect(19+lean,hcy-14,12,5,4);rect(24+lean,hcy-15,6,4,3);
     rect(16+lean,hcy-5,5,4,3);
     rect(19+lean,hcy-10,9,2,4);
     eyes(25+lean,hcy);
     if(hurt){rect(19+lean,hcy+7,13,2,1);rect(22+lean,hcy+7,6,1,11);}
     else{rect(21+lean,hcy+7,9,2,1);rect(21+lean,hcy+7,6,1,11);}
     rect(18+lean,hcy+4,2,2,15);rect(32+lean,hcy+4,2,2,15);
   }
   if(flex||success){const k=flex?n:2;for(const side of [-1,1]){const x=24+side*(21+k%2);rect(x,13-k%2,2,5,10);rect(x+side*2,10-k%2,2,2,20);rect(x-side,26,3,2,9);}if(success){rect(22,2,4,3,10);rect(12,9,2,2,10);rect(37,7,2,2,10);}}
   if(hurt){rect(7,12+n,3,3,14);rect(39,13+n,3,3,14);}
   if(dead&&n>=3){rect(10,43,3,2,22);rect(30,43,3,2,7);}
   return p;
 }
 for(let i=0;i<N;i++){const frame=draw(i);for(let y=0;y<H;y++)sheet.set(frame.subarray(y*W,(y+1)*W),y*(W*N)+i*W);}
 function png(w,h,idx){
   const u32=n=>[(n>>>24)&255,(n>>>16)&255,(n>>>8)&255,n&255];
   const crc=data=>{let c=-1;for(const b of data){c^=b;for(let k=0;k<8;k++)c=(c>>>1)^((c&1)?0xedb88320:0);}return(c^-1)>>>0;};
   const adler=data=>{let a=1,b=0;for(const x of data){a=(a+x)%65521;b=(b+a)%65521;}return((b<<16)|a)>>>0;};
   const chunk=(name,data)=>{const n=[...name].map(x=>x.charCodeAt(0));return [...u32(data.length),...n,...data,...u32(crc([...n,...data]))];};
   const raw=[];for(let y=0;y<h;y++){raw.push(0);for(let x=0;x<w;x++)raw.push(idx[y*w+x]);}
   const z=[0x78,0x01];for(let p=0;p<raw.length;p+=65535){const len=Math.min(65535,raw.length-p),last=p+len>=raw.length;z.push(last?1:0,len&255,len>>8,(~len)&255,((~len)>>8)&255,...raw.slice(p,p+len));}z.push(...u32(adler(raw)));
   const plte=palette.flatMap(color);
   return new Uint8Array([137,80,78,71,13,10,26,10,...chunk('IHDR',[...u32(w),...u32(h),8,3,0,0,0]),...chunk('PLTE',plte),...chunk('tRNS',[0]),...chunk('IDAT',z),...chunk('IEND',[])]);
 }
 return {atlas:png(W*N,H,sheet),portrait:png(W,H,draw(0,true)),palette,frameCount:N};
}
import {writeFileSync,mkdirSync} from 'node:fs';
const {atlas,portrait}=makeArt();
mkdirSync('public/assets/pixel',{recursive:true});
writeFileSync('public/assets/pixel/alpha-b2.png',atlas);
writeFileSync('public/assets/pixel/alpha-portrait.png',portrait);
