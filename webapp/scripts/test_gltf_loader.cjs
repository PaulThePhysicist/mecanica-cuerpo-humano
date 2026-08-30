const fs = require('fs');
const path = require('path');
const THREE = require('three');
// Import GLTFLoader
const { GLTFLoader } = require('three/examples/jsm/loaders/GLTFLoader.js');

const p = path.join(__dirname, '../public/assets/cap1/human_muscles_arm.glb');
const buf = fs.readFileSync(p);

// Convert buffer to ArrayBuffer
const arrayBuffer = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);

const loader = new GLTFLoader();
loader.parse(
  arrayBuffer,
  '',
  (gltf) => {
    console.log('GLTFLoader successfully parsed human_muscles_arm.glb!');
    const scene = gltf.scene;
    const meshNames = [];
    scene.traverse((child) => {
      if (child.isMesh) {
        meshNames.push({ name: child.name, isMesh: true, geometryType: child.geometry ? child.geometry.type : 'none', vertCount: child.geometry ? child.geometry.attributes.position.count : 0 });
      }
    });
    console.log(`Found ${meshNames.length} meshes in scene:`);
    console.log(meshNames);
  },
  (err) => {
    console.error('Error parsing GLB:', err);
  }
);
