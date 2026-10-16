"""Index reviewed source sheets without modifying their pixels. Requires Pillow."""
from pathlib import Path
from PIL import Image
import json, shutil, sys
root = Path(__file__).resolve().parents[1]
source = Path(sys.argv[1])
# Rows and nonuniform cell boundaries reviewed against the source drawings.
sheets = [
 ('enemies-a-v2','9d49f17a-6f68-4e5b-a60a-0f1f819bb8b3', ['reply-goblin','beta','ratio-ram','doomscroller'], [0,223,443,638,887], [0,218,411,610,800,1026,1305,1509,1774]),
 ('enemies-b-v2','db99083a-3a83-47e9-a50e-74b22c48f0ba', ['hype-bot','fanum-leech','ping-sniper','copium-puffer'], [0,233,443,653,887], [0,230,447,679,900,1120,1344,1538,1774]),
 ('events-v2','3d60bedd-a847-4d4c-9473-b390d6ec1d48', ['comment-mod','reply-guy','mod-supremo','ohio-express','doomscroll-prime'], [0,209,389,591,778,992], [0,200,369,532,714,919,1145,1354,1586]),
 ('haters-v2','60e1ad38-9bd0-4fa1-8afb-1b05ac00e5d8', ['npc','hater','boss','boss-berserk'], [0,241,443,670,887], [0,216,414,632,822,1060,1327,1533,1774]),
]
result={}
for sheet, uid, kinds, ys, xs in sheets:
    target=root/'public/assets/runtime'/f'{sheet}.png'
    if not target.exists(): shutil.copyfile(source/f'exec-{uid}.png',target)
    im=Image.open(target); alpha=im.getchannel('A')
    for row,kind in enumerate(kinds):
        frames=[]
        for col in range(8):
            # Locate the lowest-alpha gutter near the reviewed boundary; includes transparent fringes.
            left,right=xs[col],xs[col+1]; top,bottom=ys[row:row+2]
            box=alpha.crop((left,top,right,bottom)).getbbox()
            if not box: raise ValueError(kind)
            x,y,x2,y2=box; x+=left; x2+=left; y+=top; y2+=top
            # Explicit body/foot pivots. Attack extensions do not move the actor's feet.
            fraction=.5 if col not in (5,) else (.43 if kind not in ('boss','boss-berserk') else .44)
            frames.append([x,y,x2-x,y2-y,round((x2-x)*fraction,2),y2-y])
        result[kind]={'sheet':sheet,'height':max(f[3] for f in frames[:4]),'frames':frames}
(root/'src/browser/enemy-frames.json').write_text(json.dumps(result,indent=2)+'\n')
