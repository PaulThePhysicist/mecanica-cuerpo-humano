const fs = require('fs');
const path = require('path');

const p = path.join(__dirname, '../public/assets/cap1/human_muscles_arm.glb');
const buf = fs.readFileSync(p);

// Parse GLB Header
const magic = buf.readUInt32LE(0);
const version = buf.readUInt32LE(4);
const length = buf.readUInt32LE(8);

// Chunk 0 (JSON)
const chunk0Length = buf.readUInt32LE(12);
const chunk0Type = buf.readUInt32LE(16);
const jsonStr = buf.toString('utf8', 20, 20 + chunk0Length);
const gltf = JSON.parse(jsonStr);

console.log('GLB Version:', version, 'Total File Size:', (length / (1024 * 1024)).toFixed(2), 'MB');
console.log('Total Nodes:', gltf.nodes ? gltf.nodes.length : 0);
console.log('Total Meshes:', gltf.meshes ? gltf.meshes.length : 0);

if (gltf.nodes) {
  console.log('\nList of Anatomical Muscle Nodes in human_muscles_arm.glb:');
  gltf.nodes.forEach((node, i) => {
    console.log(`  [${i + 1}] ${node.name || 'unnamed'}`);
  });
}
