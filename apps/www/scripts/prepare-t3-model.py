# Repack the licensed T3 without changing position, normal or triangle values.
# Standard Python only. Output paths are explicit, and the original is never replaced.
from pathlib import Path
import struct,json,hashlib,copy,sys
if len(sys.argv) != 4:
 raise SystemExit('Usage: python3 prepare-t3-model.py <original.glb> <output.glb> <report.json>')
source=Path(sys.argv[1]); target=Path(sys.argv[2]); report_path=Path(sys.argv[3])
if source.resolve() == target.resolve():
 raise SystemExit('The original download must be preserved')
raw=source.read_bytes()
assert struct.unpack_from('<II',raw,0) == (0x46546c67,2), 'Expected a binary glTF2 asset'
json_len=struct.unpack_from('<I',raw,12)[0]; source_json=json.loads(raw[20:20+json_len]); binary=raw[28+json_len:]
assert not source_json.get('images') and not source_json.get('skins') and not source_json.get('animations'), 'This lossless adapter is for the static, untextured T3 download'
assert source_json['asset']['extras']['source'] == 'https://sketchfab.com/3d-models/radio-t3-aad3d54384904cfc9b3df8791d254c5c'
result=copy.deepcopy({k:v for k,v in source_json.items() if k not in ['accessors','bufferViews','buffers']})
result['asset']['extras']['modifications']='Unused texture coordinates removed; indices losslessly repacked from 32-bit to 16-bit. All positions, normals, triangles, meshes and scene transforms retained. Monochrome line materials are applied at runtime.'
accessors=[]; views=[]; chunks=[]; position=0; mapping={}; counts=[]
for mesh in result['meshes']:
 for primitive in mesh['primitives']:
  primitive['attributes']={key:value for key,value in primitive['attributes'].items() if key in ['POSITION','NORMAL']}
  for role,old in list(primitive['attributes'].items())+[('indices',primitive['indices'])]:
   if old not in mapping:
    accessor=source_json['accessors'][old]; view=source_json['bufferViews'][accessor['bufferView']]
    components={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4}[accessor['type']]; scalar={5123:2,5125:4,5126:4}[accessor['componentType']]
    element=components*scalar; stride=view.get('byteStride',element); offset=view.get('byteOffset',0)+accessor.get('byteOffset',0)
    data=b''.join(binary[offset+i*stride:offset+i*stride+element] for i in range(accessor['count']))
    updated={k:v for k,v in accessor.items() if k not in ['bufferView','byteOffset']}
    if role=='indices' and accessor['componentType']==5125:
     indices=struct.unpack('<'+'I'*accessor['count'],data); assert max(indices)<65536
     data=struct.pack('<'+'H'*len(indices),*indices); updated['componentType']=5123
    padding=(-position)%4
    if padding: chunks.append(b'\0'*padding);position+=padding
    updated['bufferView']=len(views)
    views.append({'buffer':0,'byteOffset':position,'byteLength':len(data),'target':34963 if role=='indices' else 34962})
    chunks.append(data);position+=len(data);mapping[old]=len(accessors);accessors.append(updated)
   if role=='indices':primitive['indices']=mapping[old]
   else:primitive['attributes'][role]=mapping[old]
  counts.append({'name':mesh['name'],'triangles':accessors[primitive['indices']]['count']//3,'vertices':accessors[primitive['attributes']['POSITION']]['count']})
result['accessors']=accessors;result['bufferViews']=views
body=b''.join(chunks);result['buffers']=[{'byteLength':len(body)}];body+=b'\0'*((-len(body))%4)
encoded=json.dumps(result,separators=(',',':')).encode();encoded+=b' '*((-len(encoded))%4)
output=struct.pack('<III',0x46546c67,2,12+8+len(encoded)+8+len(body))+struct.pack('<II',len(encoded),0x4e4f534a)+encoded+struct.pack('<II',len(body),0x004e4942)+body
target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(output)
report={'source':str(source),'sourceBytes':len(raw),'sourceSha256':hashlib.sha256(raw).hexdigest(),'optimized':str(target),'optimizedBytes':len(output),'optimizedSha256':hashlib.sha256(output).hexdigest(),'reductionPercent':round((1-len(output)/len(raw))*100,2),'triangles':sum(x['triangles'] for x in counts),'vertices':sum(x['vertices'] for x in counts),'meshes':len(counts),'materials':len(result['materials']),'images':len(result.get('images',[])),'parts':counts,'modifications':result['asset']['extras']['modifications'],'sourceMetadata':source_json['asset']['extras']}
report_path.parent.mkdir(parents=True,exist_ok=True)
report_path.write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2))
