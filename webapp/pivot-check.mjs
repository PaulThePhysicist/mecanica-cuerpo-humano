import fs from 'fs';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
const b = fs.readFileSync('./public/assets/cap1/human_body.glb');
const names = ['humerus_R','radius_R','ulna_R','scaphoid_R','lunate_R','triquetral_R','pisiform_R','trapezium_R','trapezoid_R','capitate_R','hamate_R','metacarpal_1','metacarpal_2','metacarpal_3','metacarpal_4','metacarpal_5'];
await new Promise((resolve, reject) => new GLTFLoader().parse(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'',g => {
  const pivot = new THREE.Vector3(-0.095,0.311,-0.015);
  const group = new THREE.Group(); g.scene.add(group); group.position.copy(pivot);
  for (const n of names) { const o=g.scene.getObjectByName(n); if(o) group.attach(o); }
  for (const angle of [0, -61, 188]) {
    group.rotation.x=THREE.MathUtils.degToRad(angle); g.scene.updateMatrixWorld(true);
    const h=new THREE.Box3().setFromObject(g.scene.getObjectByName('humerus_R'));
    const r=new THREE.Box3().setFromObject(g.scene.getObjectByName('radius_R'));
    const u=new THREE.Box3().setFromObject(g.scene.getObjectByName('ulna_R'));
    const hands=names.filter(n=>n.startsWith('metacarpal_')).map(n=>{const o=g.scene.getObjectByName(n);const x=new THREE.Box3().setFromObject(o);return [n,x.min.toArray(),x.max.toArray()];});
    console.log(angle, JSON.stringify({h:[h.min.toArray(),h.max.toArray()],r:[r.min.toArray(),r.max.toArray()],u:[u.min.toArray(),u.max.toArray()],hands}));
  }
  resolve();
},reject));
