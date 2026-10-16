"""Small-screen LOD, material batching; preserve the reviewed high-resolution master.
python tools/meto-model-hafiflet.py SOURCE_RUNTIME_ASSET_DIR OUTPUT_DIR
"""
import sys,json
from pathlib import Path
import numpy as np
src,out=map(Path,sys.argv[1:3]);out.mkdir(parents=True,exist_ok=True)
m=json.loads((src/'model.json').read_text());b=(src/'model.bin').read_bytes();groups={};before=m['triangles']
head=0
for q in m['meshes']:
 a=np.frombuffer(b,'<f4',count=q['vertices']*15,offset=q['vertexOffset']).reshape(-1,15).copy();f=np.frombuffer(b,'<u4',count=q['indices'],offset=q['indexOffset']).reshape(-1,3).copy();name=q['name']
 if name=='Head':
  head+=1
  if head==4:continue # Teeth are fully enclosed in the retained, closed neutral mouth.
 if name=='Meto_hair_separate':f=np.concatenate([f[:5799],f[5799:].reshape(-1,24,3)[::8].reshape(-1,3)])
 cell=1.5 if name=='Head' and head==1 else (1.0 if name=='Head' else (.8 if name=='Meto_hair_separate' else (2.2 if name.startswith(('Meto_body','Meto_jersey','Meto_shorts','Meto_socks','Meto_jaw')) else .16)))
 used=np.unique(f);a0=a[used];remap=np.zeros(len(a),np.uint32);remap[used]=np.arange(len(used));f=remap[f];a=a0
 key=np.column_stack([np.round(a[:,:3]/cell),np.floor(a[:,6:8]*4),a[:,11:13]])
 _,inv=np.unique(key,axis=0,return_inverse=True);count=np.bincount(inv);v=np.column_stack([np.bincount(inv,weights=a[:,k])/count for k in range(15)]).astype('<f4');v[:,11:13]=np.round(v[:,11:13]);v[:,3:6]/=np.maximum(np.linalg.norm(v[:,3:6],axis=1,keepdims=True),1e-8);v[:,13:15]/=v[:,13:15].sum(1,keepdims=True)
 f=inv[f];f=f[(f[:,0]!=f[:,1])&(f[:,1]!=f[:,2])&(f[:,0]!=f[:,2])];_,i=np.unique(np.sort(f,axis=1),axis=0,return_index=True);f=f[np.sort(i)]
 used=np.unique(f);remap=np.zeros(len(v),np.uint32);remap[used]=np.arange(len(used));f=remap[f];v=v[used]
 if q['texture'] not in groups:groups[q['texture']]=[[],[],0]
 group=groups[q['texture']];group[0].append(v);group[1].append(f+group[2]);group[2]+=len(v)
blob=bytearray();meshes=[]
for tex,(vs,fs,total) in groups.items():
 v=np.concatenate(vs).astype('<f4');f=np.concatenate(fs).astype('<u4');vo=len(blob);blob.extend(v.tobytes());io=len(blob);blob.extend(f.tobytes());meshes.append({'name':'Meto_mobile_'+str(len(meshes)),'vertices':len(v),'vertexOffset':vo,'indices':f.size,'indexOffset':io,'texture':tex})
m.update(meshes=meshes,version='20261020b',triangles=sum(q['indices']//3 for q in meshes),binaryBytes=len(blob),lod_source_triangles=before,lod_notes='Position/UV/skin-boundary aware clustering; enclosed teeth omitted; 1/64 original fibres plus full hair cap; materials batched.')
(out/'model.bin').write_bytes(blob);(out/'model.json').write_text(json.dumps(m,separators=(',',':')));print(json.dumps({'before':before,'after':m['triangles'],'bytes':len(blob),'drawCalls':len(meshes)}))
