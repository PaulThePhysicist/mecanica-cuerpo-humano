import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface ThreeLoopProps {
  activeNode?: number;
  onSelectNode?: (i: number) => void;
}

export default function ThreeLoop({ activeNode = -1, onSelectNode }: ThreeLoopProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const apiRef = useRef<{
    toggleRotate: () => boolean;
    toggleFlow: () => boolean;
    setNode: (i: number) => void;
    cycleNode: () => number;
  } | null>(null);

  const [rotating, setRotating] = useState(true);
  const [flowing, setFlowing] = useState(false);
  const [currentNode, setCurrentNode] = useState(activeNode);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const NODES = [
      { id: 0, label: '1 Sensor', pos: new THREE.Vector3(1.05, 0.95, 0.25), color: 0x0d6e64 },
      { id: 1, label: '2 Cerebro', pos: new THREE.Vector3(0.15, 1.35, 0.0), color: 0x5d4fa8 },
      { id: 2, label: '3 Efector', pos: new THREE.Vector3(-0.95, 0.7, 0.2), color: 0x9a5b00 },
      { id: 3, label: '4 Respuesta', pos: new THREE.Vector3(-0.85, -0.2, 0.3), color: 0xa92a1e },
      { id: 4, label: '5 Feed-back', pos: new THREE.Vector3(0.95, -0.35, -0.2), color: 0x0d6e64 },
    ];

    const W = () => container.clientWidth || 320;
    const H = () => container.clientHeight || 260;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf2ecdd);

    const camera = new THREE.PerspectiveCamera(34, W() / H(), 0.1, 30);
    camera.position.set(3.4, 1.7, 3.8);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(W(), H());
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.appendChild(renderer.domElement);

    // Orbit controls manual implementation
    const target = new THREE.Vector3(0, 0.25, 0);
    let az = Math.atan2(camera.position.z - target.z, camera.position.x - target.x);
    let pol = Math.acos((camera.position.y - target.y) / camera.position.distanceTo(target));
    let dist = camera.position.distanceTo(target);
    let autoRotate = true;
    const rotSpeed = 0.4;
    let dragging = false;
    let lx = 0;
    let ly = 0;

    const applyCam = () => {
      camera.position.set(
        target.x + dist * Math.sin(pol) * Math.cos(az),
        target.y + dist * Math.cos(pol),
        target.z + dist * Math.sin(pol) * Math.sin(az)
      );
      camera.lookAt(target);
    };
    applyCam();

    const onPointerDown = (e: PointerEvent) => {
      dragging = true;
      lx = e.clientX;
      ly = e.clientY;
      autoRotate = false;
      setRotating(false);
    };
    const onPointerUp = () => {
      dragging = false;
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      az -= (e.clientX - lx) * 0.01;
      pol -= (e.clientY - ly) * 0.01;
      pol = Math.max(0.2, Math.min(Math.PI - 0.2, pol));
      lx = e.clientX;
      ly = e.clientY;
      applyCam();
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      dist *= e.deltaY > 0 ? 1.08 : 0.92;
      dist = Math.max(2.2, Math.min(10, dist));
      applyCam();
    };

    const dom = renderer.domElement;
    dom.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointermove', onPointerMove);
    dom.addEventListener('wheel', onWheel, { passive: false });

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 1.15));
    const ml = new THREE.DirectionalLight(0xfff3e0, 2.6);
    ml.position.set(5, 8, 4);
    scene.add(ml);
    const fl = new THREE.DirectionalLight(0xbfd9e8, 0.9);
    fl.position.set(-3, 1, -5);
    scene.add(fl);
    const rim = new THREE.DirectionalLight(0xffffff, 0.5);
    rim.position.set(0, -2, 6);
    scene.add(rim);

    const grid = new THREE.GridHelper(5, 20, 0xb7a77e, 0xd4c8a6);
    grid.position.y = -1.05;
    (grid.material as THREE.Material).opacity = 0.5;
    (grid.material as THREE.Material).transparent = true;
    scene.add(grid);

    // Procedural human body
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xb9835e, roughness: 0.55, metalness: 0.05 });
    const body = new THREE.Group();
    scene.add(body);

    const part = (geo: THREE.BufferGeometry, x: number, y: number, z: number) => {
      const m = new THREE.Mesh(geo, bodyMaterial);
      m.position.set(x, y, z);
      body.add(m);
      return m;
    };

    part(new THREE.SphereGeometry(0.32, 24, 24), 0, 1.45, 0);
    part(new THREE.CylinderGeometry(0.13, 0.13, 0.45, 16), 0, 1.05, 0);
    part(new THREE.BoxGeometry(0.62, 0.85, 0.32), 0, 0.5, 0);
    part(new THREE.CylinderGeometry(0.1, 0.1, 0.7, 14), 0.36, 0.5, 0).rotation.z = 0.15;
    part(new THREE.CylinderGeometry(0.1, 0.1, 0.7, 14), -0.36, 0.5, 0).rotation.z = -0.15;
    part(new THREE.SphereGeometry(0.12, 16, 16), 0.5, 0.18, 0);
    part(new THREE.SphereGeometry(0.12, 16, 16), -0.5, 0.18, 0);
    part(new THREE.CylinderGeometry(0.15, 0.12, 0.95, 16), 0.16, -0.5, 0);
    part(new THREE.CylinderGeometry(0.15, 0.12, 0.95, 16), -0.16, -0.5, 0);
    part(new THREE.SphereGeometry(0.16, 16, 16), 0.16, -1.0, 0.05);
    part(new THREE.SphereGeometry(0.16, 16, 16), -0.16, -1.0, 0.05);

    // Label Sprite Generator
    function makeLabel(text: string, hex: string) {
      const cv = document.createElement('canvas');
      cv.width = 256;
      cv.height = 64;
      const cx = cv.getContext('2d')!;
      cx.fillStyle = 'rgba(255,253,248,0.95)';
      const x = 4;
      const y = 4;
      const w = 248;
      const h = 56;
      const r = 12;
      cx.beginPath();
      cx.moveTo(x + r, y);
      cx.arcTo(x + w, y, x + w, y + h, r);
      cx.arcTo(x + w, y + h, x, y + h, r);
      cx.arcTo(x, y + h, x, y, r);
      cx.arcTo(x, y, x + w, y, r);
      cx.closePath();
      cx.fill();
      cx.strokeStyle = hex;
      cx.lineWidth = 3;
      cx.stroke();
      cx.fillStyle = '#22303c';
      cx.font = 'bold 26px Karla, sans-serif';
      cx.textAlign = 'center';
      cx.textBaseline = 'middle';
      cx.fillText(text, 128, 34);
      const tex = new THREE.CanvasTexture(cv);
      tex.anisotropy = 4;
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
      sp.scale.set(0.95, 0.24, 1);
      return sp;
    }

    // Nodes & loop
    const nodeGroup = new THREE.Group();
    scene.add(nodeGroup);
    const nodeMeshes: THREE.Mesh[] = [];

    NODES.forEach((n) => {
      const m = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 20, 20),
        new THREE.MeshStandardMaterial({ color: n.color, emissive: n.color, emissiveIntensity: 0.35, roughness: 0.4 })
      );
      m.position.copy(n.pos);
      const lab = makeLabel(n.label, '#' + n.color.toString(16).padStart(6, '0'));
      lab.position.copy(n.pos).add(new THREE.Vector3(0, 0.22, 0));
      nodeGroup.add(m);
      nodeGroup.add(lab);
      nodeMeshes.push(m);
    });

    const loopPts = NODES.map((n) => n.pos).concat([NODES[0].pos]);
    const loopLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(loopPts),
      new THREE.LineBasicMaterial({ color: 0x9a5b00, transparent: true, opacity: 0.55 })
    );
    scene.add(loopLine);

    const flowDot = new THREE.Mesh(new THREE.SphereGeometry(0.055, 16, 16), new THREE.MeshBasicMaterial({ color: 0x0d6e64 }));
    flowDot.visible = false;
    scene.add(flowDot);

    let flowOn = false;
    let flowT = 0;
    let flowDir = 1;
    let activeNodeIndex = activeNode;

    function setActiveNode(i: number) {
      activeNodeIndex = i;
      setCurrentNode(i);
      NODES.forEach((_, k) => {
        const mat = nodeMeshes[k].material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = k === i ? 0.95 : 0.35;
      });
      if (onSelectNode) onSelectNode(i);
    }
    setActiveNode(activeNode);

    function resize() {
      const w = W();
      const h = H();
      if (w < 1 || h < 1) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    let last = performance.now();
    let animId = 0;
    function animate() {
      animId = requestAnimationFrame(animate);
      if (!container || !container.offsetParent) return;
      const now = performance.now();
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      if (autoRotate && !dragging) {
        az += rotSpeed * dt;
        applyCam();
      }

      if (flowOn) {
        flowT += 0.35 * dt * flowDir;
        if (flowT > 1) {
          flowT = 1;
          flowDir = -1;
        }
        if (flowT < 0) {
          flowT = 0;
          flowDir = 1;
        }
        const seg = flowT * 5;
        const i = Math.floor(seg) % 5;
        const f = seg - Math.floor(seg);
        flowDot.position.lerpVectors(NODES[i].pos, NODES[(i + 1) % 5].pos, f);
        flowDot.visible = true;
      } else {
        flowDot.visible = false;
      }

      if (activeNodeIndex >= 0 && nodeMeshes[activeNodeIndex]) {
        const s = 1 + 0.12 * Math.sin(now * 0.005);
        nodeMeshes[activeNodeIndex].scale.setScalar(s);
      }

      renderer.render(scene, camera);
    }
    animate();

    let nodeCounter = activeNode;
    apiRef.current = {
      toggleRotate() {
        autoRotate = !autoRotate;
        setRotating(autoRotate);
        return autoRotate;
      },
      toggleFlow() {
        flowOn = !flowOn;
        setFlowing(flowOn);
        return flowOn;
      },
      setNode(i: number) {
        nodeCounter = i;
        setActiveNode(i);
      },
      cycleNode() {
        nodeCounter = (nodeCounter + 1) % NODES.length;
        setActiveNode(nodeCounter);
        return nodeCounter;
      },
    };

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      dom.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointermove', onPointerMove);
      dom.removeEventListener('wheel', onWheel);
      renderer.dispose();
      if (container.contains(dom)) container.removeChild(dom);
    };
  }, [onSelectNode]);

  useEffect(() => {
    if (apiRef.current && activeNode !== undefined && activeNode !== currentNode) {
      apiRef.current.setNode(activeNode);
    }
  }, [activeNode, currentNode]);

  return (
    <div className="three-stage" id="stage-loop" ref={containerRef}>
      <div className="three-cap">Lazo de control 3D · arrastra para orbitar</div>
      <div className="three-hud">
        <span className="badge">5 eslabones</span>
        <button type="button" onClick={() => apiRef.current?.toggleRotate()}>
          {rotating ? '⏸ rotación' : '▶ rotación'}
        </button>
        <button type="button" onClick={() => apiRef.current?.toggleFlow()}>
          {flowing ? '⏸ flujo' : '▶ flujo'}
        </button>
        <button type="button" onClick={() => apiRef.current?.cycleNode()}>
          {currentNode >= 0 ? `eslabón ${currentNode + 1} ▸` : 'eslabón ▸'}
        </button>
      </div>
    </div>
  );
}
