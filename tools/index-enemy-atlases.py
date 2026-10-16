"""Index component masks and pack metadata; source PNG pixels are never modified.
Requires Pillow, NumPy and SciPy. Run from any directory with source PNG directory.
"""
from pathlib import Path
from PIL import Image
import numpy as np
from scipy.ndimage import label, find_objects, distance_transform_edt, binary_dilation
import json, shutil, sys
root = Path(__file__).resolve().parents[1]
source = Path(sys.argv[1])
sheets = [
 ('enemies-a-v2','9d49f17a-6f68-4e5b-a60a-0f1f819bb8b3',['reply-goblin','beta','ratio-ram','doomscroller'],[0,223,443,638,887]),
 ('enemies-b-v2','db99083a-3a83-47e9-a50e-74b22c48f0ba',['hype-bot','fanum-leech','ping-sniper','copium-puffer'],[0,233,443,653,887]),
 ('events-v2','3d60bedd-a847-4d4c-9473-b390d6ec1d48',['comment-mod','reply-guy','mod-supremo','ohio-express','doomscroll-prime'],[0,209,389,591,778,992]),
 ('haters-v2','60e1ad38-9bd0-4fa1-8afb-1b05ac00e5d8',['npc','hater','boss','boss-berserk'],[0,241,443,670,887]),
]
result={}
for sheet,uid,kinds,ys in sheets:
    target=root/'public/assets/runtime'/f'{sheet}.png'
    if not target.exists(): shutil.copyfile(source/f'exec-{uid}.png',target)
    alpha=np.array(Image.open(target).getchannel('A'))
    components,n=label(alpha>32); sizes=np.bincount(components.ravel())
    large=np.flatnonzero(sizes>2500); large=large[large!=0]
    assert len(large)==len(kinds)*8, (sheet,len(large))
    body=np.where(np.isin(components,large),components,0)
    _,nearest=distance_transform_edt(body==0,return_indices=True)
    owner=body[tuple(nearest)]
    rows=[[] for _ in kinds]
    for ident in large:
        by,bx=np.where(body==ident)
        cy=(by.min()+by.max())/2
        row=next(i for i in range(len(kinds)) if ys[i]<=cy<ys[i+1])
        # Keep detached accessory marks with their nearest body, including antialiased edges.
        mask=binary_dilation((owner==ident)&(alpha>8),iterations=1)&(owner==ident)
        yy,xx=np.where(mask); x,y,x2,y2=int(xx.min()),int(yy.min()),int(xx.max()+1),int(yy.max()+1)
        rects=[]; active={}
        for dy,line in enumerate(mask[y:y2,x:x2]):
            edges=np.flatnonzero(np.diff(np.r_[False,line,False].astype(int)))
            spans=[(int(a),int(b-a)) for a,b in zip(edges[::2],edges[1::2])]
            next_active={}
            for dx,w in spans:
                key=(dx,w)
                if key in active:
                    idx=active[key];rects[idx][3]+=1
                else:
                    idx=len(rects);rects.append([dx,dy,w,1])
                next_active[key]=idx
            active=next_active
        rows[row].append({'source':[x,y,x2-x,y2-y],'mask':rects,'bodyCenter':float((bx.min()+bx.max())/2)-x,'feet':int(by.max()+1)-y})
    cellw=max(f['source'][2] for row in rows for f in row)+8
    cellh=max(f['source'][3] for row in rows for f in row)+8
    for row,kind in enumerate(kinds):
        drawings=sorted(rows[row],key=lambda f:f['source'][0]); assert len(drawings)==8
        frames=[]
        for col,f in enumerate(drawings):
            _,_,w,h=f['source'];px=f['bodyCenter']
            if col==5: px=w*(.44 if kind.startswith('boss') else .43)
            frames.append([col*cellw+4,row*cellh+4,w,h,round(px,2),f['feet']])
        result[kind]={'sheet':sheet+'-clean','source':sheet,'width':8*cellw,'textureHeight':len(kinds)*cellh,'height':max(f['source'][3] for f in drawings[:4]),'frames':frames,'sourceFrames':[f['source'] for f in drawings],'masks':[f['mask'] for f in drawings]}
(root/'src/browser/enemy-frames.json').write_text(json.dumps(result,separators=(',',':'))+'\n')
