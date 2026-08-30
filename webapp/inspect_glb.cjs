// Parser GLB minimal (mismo que antes) para verificar el nuevo maniquí.
const fs = require('fs');
const path = require('path');
const file = 'public/assets/cap1/human_body.glb';
const buf = fs.readFileSync(path.resolve(__dirname, file));
const magic = buf.readUInt32LE(0);
if (magic !== 0x46546C67) { console.error('No GLB'); process.exit(1); }
const version = buf.readUInt32LE(4);
let offset = 12, json = null, binChunks = [];
while (offset < buf.length) {
  const clen = buf.readUInt32LE(offset);
  const ctype = buf.readUInt32LE(offset + 4);
  const cdata = buf.subarray(offset + 8, offset + 8 + clen);
  if (ctype === 0x4E4F534A) json = JSON.parse(cdata.toString('utf8'));
  else if (ctype === 0x004E4942) binChunks.push(cdata);
  offset += 8 + clen;
}
const bin = Buffer.concat(binChunks);
function readAccessor(idx) {
  const a = json.accessors[idx]; const bv = json.bufferViews[a.bufferView];
  const compSize = { 5126: 4 }[a.componentType];
  const numComp = { VEC3: 3 }[a.type];
  const byteOffset = (bv.byteOffset || 0) + (a.byteOffset || 0);
  const out = [];
  for (let i = 0; i < a.count; i++) {
    const base = byteOffset + i * numComp * compSize;
    const v = [];
    for (let c = 0; c < numComp; c++) v.push(bin.readFloatLE(base + c * compSize));
    out.push(v);
  }
  return out;
}
const allVerts = [];
for (const m of json.meshes || []) for (const prim of m.primitives) {
  if (prim.attributes && prim.attributes.POSITION !== undefined) {
    for (const p of readAccessor(prim.attributes.POSITION)) allVerts.push(p);
  }
}
console.log('meshes:', json.meshes.length, 'verts:', allVerts.length);
function bbox(vs){const b={min:[1e9,1e9,1e9],max:[-1e9,-1e9,-1e9]};for(const v of vs)for(let i=0;i<3;i++){b.min[i]=Math.min(b.min[i],v[i]);b.max[i]=Math.max(b.max[i],v[i]);}return b;}
const B = bbox(allVerts);
console.log('GLOBAL min', B.min.map(x=>x.toFixed(2)), 'max', B.max.map(x=>x.toFixed(2)));
const yMin=B.min[1], yMax=B.max[1];
const NB=12;
for(let band=0; band<NB; band++){
  const y0=yMin+(yMax-yMin)*band/NB, y1=yMin+(yMax-yMin)*(band+1)/NB;
  const vs=allVerts.filter(v=>v[1]>=y0&&v[1]<y1);
  if(!vs.length) continue;
  const bb=bbox(vs);
  const sides=vs.filter(v=>Math.abs(v[0])>0.20).length;
  const front=vs.filter(v=>v[2]<-0.05).length;
  console.log(`Y[${y0.toFixed(2)},${y1.toFixed(2)}] n=${vs.length} X[${bb.min[0].toFixed(2)},${bb.max[0].toFixed(2)}] Z[${bb.min[2].toFixed(2)},${bb.max[2].toFixed(2)}] lados(|x|>0.2)=${sides} frente(Z<0)=${front}`);
}
