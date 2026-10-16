"""Export the approved Meto v03 mesh to a small, skinned, self-contained game asset.
Run: python tools/meto-model-hazirla.py MASTER.glb MAKEHUMAN_BASE.obj
No face photographs are projected at runtime. Hair fibres are thinned, cap retained.
"""
import sys,json,struct,hashlib
from pathlib import Path
from io import BytesIO
import numpy as np
from PIL import Image
src=Path(sys.argv[1]);raw=src.read_bytes();nj=struct.unpack_from('<I',raw,12)[0];g=json.loads(raw[20:20+nj]);buf=raw[28+nj:]
out=Path(__file__).resolve().parents[1]/'assets/meto3d';out.mkdir(parents=True,exist_ok=True)
def arr(i):
 a=g['accessors'][i];v=g['bufferViews'][a['bufferView']];n={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4}[a['type']];dt={5121:'u1',5123:'<u2',5125:'<u4',5126:'<f4'}[a['componentType']]
 return np.ndarray((a['count'],n),dtype=dt,buffer=buf,offset=v.get('byteOffset',0)+a.get('byteOffset',0),strides=(v.get('byteStride',np.dtype(dt).itemsize*n),np.dtype(dt).itemsize)).copy()
# Authored model raw units and existing gameplay rig units share Y-up,+Z-front.
UNIT=1.8/463;S=.09709840440633696/UNIT;ground=-8.181
verts=[];joints={};group=''
for ln in Path(sys.argv[2]).read_text().splitlines():
 a=ln.split()
 if not a:continue
 if a[0]=='v':verts.append(list(map(float,a[1:4])))
 elif a[0]=='g':group=a[1]
 elif a[0]=='f' and group.startswith('joint-'):joints.setdefault(group,[]).extend(int(q.split('/')[0])-1 for q in a[1:])
v=np.array(verts);J={k.replace('joint-',''):(v[np.unique(ix)].mean(0)-[0,ground,0])*S+[0,8,0] for k,ix in joints.items()}
# Human left is +X in the source mesh; gameplay left is -X.
def joint(side,name):return J[('r' if side=='l' else 'l')+'-'+name].tolist()
rest={'hip':J['pelvis'].tolist(),'chest':J['spine-2'].tolist(),'neck':J['neck'].tolist()}
for side in ['l','r']:
 for key,nm in [('s','shoulder'),('e','elbow'),('h','hand'),('k','knee'),('f','ankle')]:rest[key+side]=joint(side,nm)
 rest['hip'+side]=[(-1 if side=='l' else 1)*24,rest['hip'][1],rest['hip'][2]]
rest['head']=[0,(7.9-ground)*S+8,.25*S]
bones=[['neck','head'],['hip','neck']]
for side in ['l','r']:bones.extend([['s'+side,'e'+side],['e'+side,'h'+side],['h'+side,'e'+side]])
for side in ['l','r']:bones.extend([['hip'+side,'k'+side],['k'+side,'f'+side],['f'+side,'k'+side]])
# Hand/foot bones use their joint as pivot and reverse parent axis.
def segmentdist(p,a,b):
 d=b-a;t=np.clip(((p-a)*d).sum(1)/(d@d),0,1);return np.linalg.norm(p-a-t[:,None]*d,axis=1)
def weights(p,head=False,name=''):
 ids=np.zeros((len(p),2),np.float32);w=np.zeros((len(p),2),np.float32);w[:,0]=1
 if head:return ids,w
 for i,q in enumerate(p):
  side='l' if q[0]<0 else 'r';arm=2 if side=='l' else 5;leg=8 if side=='l' else 11
  # Separate arms from torso in bind A-pose; garment uses identical weights.
  shoulder=np.array(rest['s'+side]);isarm=abs(q[0])>abs(shoulder[0])-4+max(0,shoulder[1]-q[1])*.50 and q[1]>rest['hip'][1]-10
  if isarm:
   candidates=[arm,arm+1];pivot=np.array(rest['e'+side]);dist=[segmentdist(q[None,:],np.array(rest[a]),np.array(rest[b]))[0] for a,b in [bones[k] for k in candidates]]
   t=np.clip((q[1]-pivot[1]+12)/24,0,1);ids[i]=candidates;w[i]=[t,1-t]
   # Smooth shoulder attachment to torso.
   attach=np.clip((abs(q[0])-(abs(shoulder[0])-4+max(0,shoulder[1]-q[1])*.50))/12,0,1)
   if attach<1:ids[i]=[1,arm];w[i]=[1-attach,attach]
  elif q[1]<rest['hip'][1]-12:
   knee=np.array(rest['k'+side]);t=np.clip((q[1]-knee[1]+12)/24,0,1);ids[i]=[leg,leg+1];w[i]=[t,1-t]
   if 'boot' in name or q[1]<rest['f'+side][1]+5:ids[i]=[leg+2,leg+2];w[i]=[1,0]
  else:ids[i]=[1,0];t=np.clip((q[1]-rest['neck'][1]+15)/30,0,1);w[i]=[1-t,t]
 return ids,w
blob=bytearray();meshes=[];textures={};triangles=0

def append(a):
 while len(blob)%4:blob.append(0)
 off=len(blob);blob.extend(a.tobytes());return off

def visit(i,parent):
 global triangles
 node=g['nodes'][i];T=np.eye(4);T[:3,3]=node.get('translation',[0,0,0]);T[:3,:3]=np.diag(node.get('scale',[1,1,1]));M=parent@T
 if 'mesh' in node:
  name=g['meshes'][node['mesh']].get('name','')
  for prim in g['meshes'][node['mesh']]['primitives']:
   mat=g['materials'][prim['material']];a=prim['attributes'];p=arr(a['POSITION']);n=arr(a['NORMAL']);ix=arr(prim['indices']).reshape(-1,3)
   if mat.get('alphaMode')=='BLEND':continue # Optical surfaces are deliberately omitted at this screen size.
   if 'hair' in name.lower():
    # cap: 5,799 triangles; subsequent complete fibres: 24 triangles each.
    ix=np.concatenate([ix[:5799],ix[5799:].reshape(-1,24,3)[::8].reshape(-1,3)])
   used=np.unique(ix);remap=np.zeros(len(p),np.uint32);remap[used]=np.arange(len(used));ix=remap[ix].astype('<u4');p=p[used]@M[:3,:3].T+M[:3,3];p=p/UNIT+[0,8,0]
   n=n[used]@np.linalg.inv(M[:3,:3]);n/=np.maximum(np.linalg.norm(n,axis=1,keepdims=True),1e-9)
   uv=arr(a['TEXCOORD_0'])[used] if 'TEXCOORD_0' in a else np.zeros((len(p),2))
   color=arr(a['COLOR_0'])[used,:3] if 'COLOR_0' in a else np.ones((len(p),3));pbr=mat.get('pbrMetallicRoughness',{});color*=np.array(pbr.get('baseColorFactor',[1,1,1,1]))[:3]
   ishead=name in ['Meto_hair_separate'] or 'Glasses' in name or node.get('mesh')==0
   ids,w=weights(p,ishead,name);data=np.column_stack([p,n,uv,color,ids,w]).astype('<f4')
   tex=None
   if 'baseColorTexture' in pbr:
    imid=g['textures'][pbr['baseColorTexture']['index']]['source'];tex='texture-'+str(imid)+'.jpg'
    if imid not in textures:
     bv=g['bufferViews'][g['images'][imid]['bufferView']];im=Image.open(BytesIO(buf[bv.get('byteOffset',0):bv.get('byteOffset',0)+bv['byteLength']])).convert('RGB');im.thumbnail((1024,1024));im.save(out/tex,quality=88,optimize=True);textures[imid]=tex
   meshes.append({'name':name,'vertices':len(data),'vertexOffset':append(data),'indices':ix.size,'indexOffset':append(ix),'texture':tex});triangles+=len(ix)
 for child in node.get('children',[]):visit(child,M)
for i in g['scenes'][g.get('scene',0)]['nodes']:visit(i,np.eye(4))
(out/'model.bin').write_bytes(blob)
meta={'version':'20261020a','master_sha256':hashlib.sha256(raw).hexdigest(),'unit_m':UNIT,'height_m':1.71024522529,'stride':60,'bones':bones,'rest':rest,'meshes':meshes,'triangles':triangles,'binaryBytes':len(blob),'hair_fibre_fraction':.125,'source':'Approved Meto v03; MakeHuman CC0 anatomical base; see LICENSE-body.md','omitted':'Facial morph arrays, hidden optical shells and normal maps omitted only from runtime derivative.'}
(out/'model.json').write_text(json.dumps(meta,separators=(',',':')));print(json.dumps({'bytes':len(blob),'triangles':triangles,'rest':rest},indent=2))
