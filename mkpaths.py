import json, math
d=json.load(open('bd.geojson'))
W=600
def rings(g):
    return [g['coordinates']] if g['type']=='Polygon' else g['coordinates']
k=math.cos(math.radians(23.7))
allpts=[(x*k,-y) for f in d['features'] for poly in rings(f['geometry']) for r in poly for x,y in r]
minx=min(p[0] for p in allpts);maxx=max(p[0] for p in allpts)
miny=min(p[1] for p in allpts);maxy=max(p[1] for p in allpts)
s=W/(maxx-minx);H=(maxy-miny)*s
def rdp(pts,eps):
    if len(pts)<3: return pts
    (x1,y1),(x2,y2)=pts[0],pts[-1]
    dx,dy=x2-x1,y2-y1;L=math.hypot(dx,dy) or 1e-9
    dm,i=0,0
    for j in range(1,len(pts)-1):
        x,y=pts[j];dd=abs(dy*x-dx*y+x2*y1-y2*x1)/L
        if dd>dm: dm,i=dd,j
    if dm>eps: return rdp(pts[:i+1],eps)[:-1]+rdp(pts[i:],eps)
    return [pts[0],pts[-1]]
out={};cent={}
for f in d['features']:
    parts=[];best=(0,None)
    for poly in rings(f['geometry']):
        for ri,r in enumerate(poly):
            pts=[((x*k-minx)*s,(-y-miny)*s) for x,y in r]
            h=len(pts)//2
            pts=rdp(pts[:h+1],0.7)[:-1]+rdp(pts[h:],0.7)
            if len(pts)<4: continue
            a=sum(pts[i][0]*pts[i-1][1]-pts[i-1][0]*pts[i][1] for i in range(len(pts)))/2
            if abs(a)<3: continue
            if ri==0 and abs(a)>best[0]:
                cx=sum(p[0] for p in pts)/len(pts);cy=sum(p[1] for p in pts)/len(pts);best=(abs(a),(round(cx,1),round(cy,1)))
            parts.append('M'+'L'.join(f'{x:.1f},{y:.1f}' for x,y in pts[:-1] if True)+'Z')
    out[f['properties']['shapeName']]=''.join(parts);cent[f['properties']['shapeName']]=best[1]
json.dump({'w':W,'h':round(H,1),'d':out,'c':cent},open('paths.json','w'),separators=(',',':'))
print(round(H,1), len(json.dumps(out)))
