const fs = require('fs');
const path = require('path');

['human_body.glb', 'human_muscles_arm.glb'].forEach(fname => {
  const p = path.join(__dirname, '../public/assets/cap1/', fname);
  const buf = fs.readFileSync(p);
  const chunk0Length = buf.readUInt32LE(12);
  const jsonStr = buf.toString('utf8', 20, 20 + chunk0Length);
  const gltf = JSON.parse(jsonStr);
  console.log(`=== ${fname} ===`);
  console.log('Meshes count:', gltf.meshes ? gltf.meshes.length : 0);
  console.log('Nodes count:', gltf.nodes ? gltf.nodes.length : 0);
  if (gltf.nodes) {
    const sample = gltf.nodes.slice(0, 10).map(n => ({ name: n.name, mesh: n.mesh }));
    console.log('Sample nodes:', sample);
  }
});
