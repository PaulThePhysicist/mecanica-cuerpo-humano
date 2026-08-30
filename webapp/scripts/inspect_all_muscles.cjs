const fs = require('fs');
const path = require('path');

['human_muscles_hip_leg.glb', 'human_muscles_trunk.glb'].forEach(fname => {
  const p = path.join(__dirname, '../public/assets/cap1/', fname);
  const buf = fs.readFileSync(p);
  const chunk0Length = buf.readUInt32LE(12);
  const jsonStr = buf.toString('utf8', 20, 20 + chunk0Length);
  const gltf = JSON.parse(jsonStr);
  console.log(`\n=== ${fname} (${(buf.length / (1024*1024)).toFixed(2)} MB, ${gltf.nodes.length} nodes) ===`);
  gltf.nodes.forEach((n, i) => console.log(`  [${i+1}] ${n.name}`));
});
