"""Проводящая система сердца для heart.glb: ориентиры по клапанам, венам и стенкам модели BodyParts3D.
Выход: cond.json — узлы и пути (точки в координатах модели) с временем прихода импульса (с)."""
import trimesh,numpy as np,json
s=trimesh.load('/home/claude/medodchki-/assets/3d/heart.glb')
M={}
for m in s.dump(concatenate=False): M.setdefault(m.metadata.get('name'),[]).append(m.vertices)
V={k:np.vstack(v) for k,v in M.items()}
c=lambda k:V[k].mean(0); nrm=lambda v:v/np.linalg.norm(v)
W=V['стенки желудочков'];RA=V['стенка правого предсердия'];LA=V['стенка левого предсердия']
near=lambda P,p:P[np.argmin(np.linalg.norm(P-p,axis=1))]
Tsep=c('перегородочная створка трёхстворчатого клапана')
T=np.mean([Tsep,c('задняя створка трёхстворчатого клапана'),c('передняя створка трёхстворчатого клапана')],0)
Mi=np.mean([c('задняя створка митрального клапана'),c('передняя створка митрального клапана')],0)
B=(T+Mi)/2; A=W[np.argmax(np.linalg.norm(W-B,axis=1))]
ax=nrm(A-B); n=Mi-T; n=nrm(n-np.dot(n,ax)*ax)          # n: от правого желудочка к левому, поперёк оси
# синусовый узел: место впадения верхней полой вены в правое предсердие, латерально
svc=V['верхняя полая вена'];low=svc[svc[:,1]<svc[:,1].min()+0.006].mean(0)
SA=near(RA,low+np.array([-0.007,-0.004,0.004]))
# AV-узел: треугольник Коха — между устьем венечного синуса и перегородочной створкой
cs=V['венечный синус'];CSo=cs[cs[:,0]<cs[:,0].min()+0.005].mean(0)
AVp=CSo+0.65*(Tsep+np.array([0,0.008,0])-CSo); AV=near(RA,AVp)
# пучок Гиса: от AV-узла к верхушке мышечной перегородки под аортальным клапаном
ao=np.mean([c('правая задняя заслонка аортального клапана'),c('передняя заслонка аортального клапана'),c('левая задняя заслонка аортального клапана')],0)
H1=AV+0.4*(ao-AV); Hsep=B+0.18*(A-B)+0.0*n
His=[AV, AV+0.5*(H1-AV), H1+0.3*(Hsep-H1), Hsep]
L=np.linalg.norm(A-B)
def along(f,off): return B+f*(A-B)+off*n
LB=[Hsep, along(.30,.006), along(.45,.007)]
LBa=[LB[-1], along(.6,.010), c('переднелатеральная головка папиллярной мышцы ЛЖ')]   # передняя ветвь
LBp=[LB[-1], along(.6,.012)+np.array([0,-0.004,-0.008]), c('латеральная папиллярная мышца ЛЖ')]  # задняя ветвь
RB=[Hsep, along(.35,-.006), along(.62,-.008), c('передняя папиллярная мышца ПЖ')]   # правая ножка → модераторный тяж
# волокна Пуркинье: концы — точки эндокарда (нормаль смотрит в полость) средних и верхушечных отделов обоих желудочков
wm=None
for m in trimesh.load('/home/claude/medodchki-/assets/3d/heart.glb').dump(concatenate=False):
    if m.metadata.get('name')=='стенки желудочков': wm=m if wm is None else trimesh.util.concatenate([wm,m])
WN=wm.vertex_normals;WV=wm.vertices
proj=lambda P:np.dot(P-B,ax)/L
cLV=B+.45*(A-B)+.016*n; cRV=B+.40*(A-B)-.020*n
def endo(cc,side):
    d=cc-WV;dist=np.linalg.norm(d,axis=1);cos=np.einsum('ij,ij->i',WN,d)/dist
    s_=np.dot(WV-B,n)*side
    ok=(np.abs(cos)>.6)&(dist<.032)&(proj(WV)>.28)&(proj(WV)<1.02)&(s_>-.004)
    return WV[ok]
def fps(P,k,seed=0):
    idx=[seed%len(P)];d=np.linalg.norm(P-P[idx[0]],axis=1)
    for _ in range(k-1):
        i=int(np.argmax(d));idx.append(i);d=np.minimum(d,np.linalg.norm(P-P[i],axis=1))
    return P[idx]
EL=fps(endo(cLV,1),44);ER=fps(endo(cRV,-1),26)
print('endo pts',len(endo(cLV,1)),len(endo(cRV,-1)))
ends={'lba':c('переднелатеральная головка папиллярной мышцы ЛЖ'),'lbp':c('латеральная папиллярная мышца ЛЖ'),'rb':c('передняя папиллярная мышца ПЖ')}
src=[]
for p in EL:
    k='lba' if np.linalg.norm(p-ends['lba'])<np.linalg.norm(p-ends['lbp']) else 'lbp';t0=.172 if k=='lba' else .174
    src.append([*map(float,p),float(t0+np.linalg.norm(p-ends[k])/2.5)])
for p in ER: src.append([*map(float,p),float(.172+np.linalg.norm(p-ends['rb'])/2.5)])
def fan(p0,P,k):
    P=P[np.argsort(np.linalg.norm(P-p0,axis=1))][:k]
    return [[p0,p0+0.5*(q-p0)+0.002*nrm(np.cross(q-p0,ax)),q] for q in P]
PK=fan(ends['lba'],EL,7)+fan(ends['lbp'],EL,7)+fan(ends['rb'],ER,7)
# времена (с): синусовый узел 0; предсердия до 0,095 (P ≤ 0,10 с); пучок Гиса с 0,12; перегородка 0,165 (Q)
def timed(path,t0,t1):
    d=np.r_[0,np.cumsum(np.linalg.norm(np.diff(path,axis=0),axis=1))];return [[*map(float,p),float(t0+(t1-t0)*x/d[-1])] for p,x in zip(path,d)]
out={'SA':[*map(float,SA)],'AV':[*map(float,AV)],'apex':[*map(float,A)],'base':[*map(float,B)],
 'paths':{'his':timed(His,.12,.15),'lb':timed(LB,.15,.162),'lba':timed(LBa,.162,.172),'lbp':timed(LBp,.162,.174),'rb':timed(RB,.15,.172)},
 'pk':[timed(p,.172,.182) for p in PK],'pkSrc':src,
 'septL':[*map(float,along(.4,.004))]}
json.dump(out,open('heart_conduction.json','w'))
print('SA',SA,'AV',AV,'Hsep',Hsep,'n',n)
