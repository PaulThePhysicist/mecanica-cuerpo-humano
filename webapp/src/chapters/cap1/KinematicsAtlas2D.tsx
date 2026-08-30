import React, { useRef, useEffect } from 'react';

interface KinematicsAtlas2DProps {
  mode: 6 | 7; // 6 = Pierna, 7 = Brazo
  angles: {
    joint1: number; // Hombro / Cadera
    joint2: number; // Codo / Rodilla
    pivot: number;  // Pivote radiocubital (solo brazo)
    joint3: number; // Muñeca / Tobillo
  };
  layerMode?: 'atlas' | 'skeleton' | 'muscles';
  selectedJoint?: string | null;
  onSelectJoint?: (jointId: string | null) => void;
}

export default function KinematicsAtlas2D({
  mode,
  angles,
  layerMode = 'atlas',
  selectedJoint = null,
  onSelectJoint = () => {},
}: KinematicsAtlas2DProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    const rect = parent.getBoundingClientRect();
    const dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));
    const W = Math.max(200, Math.round(rect.width));
    const H = Math.max(200, Math.round(rect.height));

    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;

    const context = canvas.getContext('2d');
    if (!context) return;
    const ctx: CanvasRenderingContext2D = context;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    // ── Fondo de estudio con viñeta y cuadrícula técnica suave ──
    const rg = ctx.createRadialGradient(W * 0.5, H * 0.4, 20, W * 0.5, H * 0.5, Math.max(W, H) * 0.7);
    rg.addColorStop(0, '#ffffff');
    rg.addColorStop(0.55, '#faf6ee');
    rg.addColorStop(1, '#eee4d2');
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = 'rgba(40, 50, 60, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 20) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += 20) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    const isLeg = mode === 6;

    // Centro del nudo proximal (Cadera / Hombro)
    const originX = W * 0.44;
    const originY = H * 0.18;

    const L1 = H * 0.32; // Longitud segmento proximal (Fémur / Húmero)
    const L2 = H * 0.28; // Longitud segmento intermedio (Tibia / Antebrazo)
    const L3 = H * 0.13; // Longitud segmento distal (Pie / Mano)

    const a1 = (angles.joint1 * Math.PI) / 180;
    const a2 = (angles.joint2 * Math.PI) / 180;
    const a3 = (angles.joint3 * Math.PI) / 180;

    // Coordenadas cinemáticas de los nudos articulares
    const p0 = { x: originX, y: originY };

    // Segmento 1
    const p1 = {
      x: p0.x + Math.sin(a1) * L1,
      y: p0.y + Math.cos(a1) * L1,
    };

    // Segmento 2 (ángulo acumulado)
    const totalAngle2 = a1 + (isLeg ? -a2 : a2);
    const p2 = {
      x: p1.x + Math.sin(totalAngle2) * L2,
      y: p1.y + Math.cos(totalAngle2) * L2,
    };

    // Segmento 3
    const totalAngle3 = totalAngle2 + a3;

    // ── Helper para dibujar hueso 2D con epífisis y textura ósea ──
    const drawBone2D = (
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      r1: number,
      r2: number,
      label?: string
    ) => {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const len = Math.hypot(dx, dy) || 1;
      const ux = dx / len;
      const uy = dy / len;
      const px = -uy;
      const py = ux;

      ctx.save();
      const grad = ctx.createLinearGradient(x1 + px * r1, y1 + py * r1, x1 - px * r1, y1 - py * r1);
      grad.addColorStop(0, '#fbf8ee');
      grad.addColorStop(0.35, '#ede5d0');
      grad.addColorStop(0.8, '#d4c5a3');
      grad.addColorStop(1, '#ab9b78');

      ctx.fillStyle = grad;
      ctx.strokeStyle = '#43505c';
      ctx.lineWidth = 1.3;

      ctx.beginPath();
      ctx.moveTo(x1 + px * r1 * 1.2, y1 + py * r1 * 1.2);
      ctx.bezierCurveTo(
        x1 + px * r1 * 0.45 + ux * len * 0.25, y1 + py * r1 * 0.45 + uy * len * 0.25,
        x2 + px * r2 * 0.45 - ux * len * 0.25, y2 + py * r2 * 0.45 - uy * len * 0.25,
        x2 + px * r2 * 1.2, y2 + py * r2 * 1.2
      );
      ctx.arc(x2, y2, r2 * 1.2, Math.atan2(py, px), Math.atan2(-py, -px), false);
      ctx.bezierCurveTo(
        x2 - px * r2 * 0.45 - ux * len * 0.25, y2 - py * r2 * 0.45 - uy * len * 0.25,
        x1 - px * r1 * 0.45 + ux * len * 0.25, y1 - py * r1 * 0.45 + uy * len * 0.25,
        x1 - px * r1 * 1.2, y1 - py * r1 * 1.2
      );
      ctx.arc(x1, y1, r1 * 1.2, Math.atan2(-py, -px), Math.atan2(py, px), false);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Relieve central cilíndrico
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x1 + px * r1 * 0.25 + ux * len * 0.08, y1 + py * r1 * 0.25 + uy * len * 0.08);
      ctx.lineTo(x2 + px * r2 * 0.25 - ux * len * 0.08, y2 + py * r2 * 0.25 - uy * len * 0.08);
      ctx.stroke();

      if (label && layerMode !== 'muscles') {
        const midX = (x1 + x2) / 2 + px * 20;
        const midY = (y1 + y2) / 2 + py * 20;
        ctx.fillStyle = '#4a5568';
        ctx.font = 'bold 9px Karla, sans-serif';
        ctx.fillText(label, midX - 10, midY);
      }
      ctx.restore();
    };

    // ── Helper para vientre muscular anatómico fusiforme dinámico ──
    const drawMuscle2D = (
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      offsetSide: number,
      baseWidth: number,
      name: string,
      contraction = 0 // Factor de contracción [0..1]
    ) => {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const len = Math.hypot(dx, dy) || 1;
      const ux = dx / len;
      const uy = dy / len;
      const px = -uy * offsetSide;
      const py = ux * offsetSide;

      const width = baseWidth * (1 + contraction * 0.4);

      ctx.save();
      // Tendón proximal nacarado
      ctx.strokeStyle = 'rgba(245, 240, 230, 0.95)';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x1 + px * 8 + ux * len * 0.16, y1 + py * 8 + uy * len * 0.16);
      ctx.stroke();

      // Vientre muscular carmín estriado
      const grad = ctx.createLinearGradient(x1 + px * width, y1 + py * width, x1, y1);
      grad.addColorStop(0, '#c14b4b');
      grad.addColorStop(0.45, '#a92a1e');
      grad.addColorStop(1, '#8c1f16');

      ctx.fillStyle = grad;
      ctx.strokeStyle = '#641e16';
      ctx.lineWidth = 1.1;

      ctx.beginPath();
      ctx.moveTo(x1 + px * 7 + ux * len * 0.14, y1 + py * 7 + uy * len * 0.14);
      ctx.quadraticCurveTo(
        (x1 + x2) / 2 + px * width * 1.6,
        (y1 + y2) / 2 + py * width * 1.6,
        x2 + px * 7 - ux * len * 0.14,
        y2 + py * 7 - uy * len * 0.14
      );
      ctx.quadraticCurveTo(
        (x1 + x2) / 2 + px * 4,
        (y1 + y2) / 2 + py * 4,
        x1 + px * 7 + ux * len * 0.14,
        y1 + py * 7 + uy * len * 0.14
      );
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Tendón distal
      ctx.strokeStyle = 'rgba(245, 240, 230, 0.95)';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(x2 + px * 7 - ux * len * 0.14, y2 + py * 7 - uy * len * 0.14);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      // Etiqueta muscular
      ctx.fillStyle = '#8c1f16';
      ctx.font = 'bold 8.5px Karla, sans-serif';
      ctx.fillText(name, (x1 + x2) / 2 + px * (width * 1.6 + 6), (y1 + y2) / 2 + py * (width * 1.6 + 6));
      ctx.restore();
    };

    // ── Helper para Goniómetro / Arco Angular ──
    const drawGoniometer = (
      cx: number,
      cy: number,
      angleDeg: number,
      radius: number,
      color = '#0d6e64'
    ) => {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.4;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.arc(cx, cy, radius, Math.PI / 2 - 0.5, Math.PI / 2 + 0.5);
      ctx.stroke();

      ctx.setLineDash([]);
      ctx.fillStyle = color;
      ctx.font = 'bold 9px JetBrains Mono, monospace';
      ctx.fillText(`${Math.round(angleDeg)}°`, cx + radius + 4, cy + 4);
      ctx.restore();
    };

    // ── 1. Dibujar Músculos (si la capa está activa) ──
    if (layerMode === 'atlas' || layerMode === 'muscles') {
      if (isLeg) {
        const quadContract = Math.max(0, (90 - angles.joint2) / 90);
        const hamContract = Math.max(0, angles.joint2 / 90);
        drawMuscle2D(p0.x, p0.y, p1.x, p1.y, 1, 16, 'CUÁDRICEPS', quadContract);
        drawMuscle2D(p0.x, p0.y, p1.x, p1.y, -1, 14, 'ISQUIOTIBIALES', hamContract);
        drawMuscle2D(p1.x, p1.y, p2.x, p2.y, -1, 14, 'GEMELOS', 0.2);
      } else {
        const bicContract = Math.max(0, angles.joint2 / 100);
        const tricContract = Math.max(0, (90 - angles.joint2) / 90);
        drawMuscle2D(p0.x, p0.y, p1.x, p1.y, 1, 15, 'BÍCEPS BRAQUIAL', bicContract);
        drawMuscle2D(p0.x, p0.y, p1.x, p1.y, -1, 14, 'TRÍCEPS BRAQUIAL', tricContract);
      }
    }

    // ── 2. Dibujar Huesos Anatómicos ──
    if (isLeg) {
      // Pelvis base esquemática
      ctx.fillStyle = '#ede5d0';
      ctx.strokeStyle = '#43505c';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.arc(p0.x, p0.y - 12, 18, Math.PI * 0.8, Math.PI * 2.2);
      ctx.stroke();

      // Fémur
      drawBone2D(p0.x, p0.y, p1.x, p1.y, 12, 11, 'FÉMUR');

      // Tibia y Peroné
      drawBone2D(p1.x, p1.y, p2.x, p2.y, 11, 9, 'TIBIA / PERONÉ');

      // Pie (Calcáneo + Empeine + Dedos)
      ctx.save();
      ctx.translate(p2.x, p2.y);
      ctx.rotate(totalAngle3);
      ctx.fillStyle = '#ede5d0';
      ctx.strokeStyle = '#43505c';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(-10, 0);
      ctx.quadraticCurveTo(-14, 18, 0, 18);
      ctx.lineTo(26, 18);
      ctx.quadraticCurveTo(34, 12, 30, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    } else {
      // Escápula esquemática
      ctx.fillStyle = '#ede5d0';
      ctx.strokeStyle = '#43505c';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.arc(p0.x - 8, p0.y - 10, 16, Math.PI * 0.6, Math.PI * 2);
      ctx.stroke();

      // Húmero
      drawBone2D(p0.x, p0.y, p1.x, p1.y, 11, 10, 'HÚMERO');

      // Radio y Cúbito (con torsión de pivote)
      const pivRad = (angles.pivot * Math.PI) / 180;
      const rOffset = Math.cos(pivRad) * 4;
      drawBone2D(p1.x - rOffset, p1.y, p2.x + rOffset, p2.y, 6, 6, 'RADIO');
      drawBone2D(p1.x + rOffset, p1.y, p2.x - rOffset, p2.y, 6, 6, 'CÚBITO');

      // Mano
      ctx.save();
      ctx.translate(p2.x, p2.y);
      ctx.rotate(totalAngle3);
      ctx.fillStyle = '#ede5d0';
      ctx.strokeStyle = '#43505c';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(-7, 0, 14, 26, 4);
      } else {
        ctx.rect(-7, 0, 14, 26);
      }
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // ── 3. Goniómetros de lectura angular ──
    drawGoniometer(p0.x, p0.y, angles.joint1, 26, '#b02318');
    drawGoniometer(p1.x, p1.y, angles.joint2, 24, '#0d6e64');
    drawGoniometer(p2.x, p2.y, angles.joint3, 20, '#5c6bc0');

    // ── 4. Nodos Articulares Interactivos con Círculos de GL ──
    const joints = isLeg
      ? [
          { id: 'shoulder', name: 'Cadera', gl: '3 GL · Esferoidal', x: p0.x, y: p0.y, color: '#b02318' },
          { id: 'elbow', name: 'Rodilla', gl: '1 GL · Bisagra', x: p1.x, y: p1.y, color: '#0d6e64' },
          { id: 'wrist', name: 'Tobillo', gl: '2 GL · Condílea', x: p2.x, y: p2.y, color: '#5c6bc0' },
        ]
      : [
          { id: 'shoulder', name: 'Hombro', gl: '3 GL · Esferoidal', x: p0.x, y: p0.y, color: '#b02318' },
          { id: 'elbow', name: 'Codo', gl: '1 GL · Bisagra', x: p1.x, y: p1.y, color: '#0d6e64' },
          { id: 'pivot', name: 'Pivote', gl: '1 GL · Pronación', x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2, color: '#9c27b0' },
          { id: 'wrist', name: 'Muñeca', gl: '2 GL · Condílea', x: p2.x, y: p2.y, color: '#5c6bc0' },
        ];

    joints.forEach((j) => {
      const isSel = selectedJoint === j.id;

      ctx.save();
      // Halo brillante al seleccionar
      if (isSel) {
        ctx.beginPath();
        ctx.arc(j.x, j.y, 15, 0, Math.PI * 2);
        ctx.fillStyle = `${j.color}28`;
        ctx.fill();
        ctx.strokeStyle = j.color;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Nudo central
      ctx.beginPath();
      ctx.arc(j.x, j.y, isSel ? 8 : 6, 0, Math.PI * 2);
      ctx.fillStyle = isSel ? j.color : '#faf7ee';
      ctx.fill();
      ctx.strokeStyle = j.color;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Etiqueta lateral conectada
      const tagX = j.x + 22;
      const tagY = j.y - 10;
      ctx.fillStyle = isSel ? 'rgba(255, 255, 255, 0.98)' : 'rgba(255, 253, 248, 0.92)';
      ctx.strokeStyle = isSel ? j.color : 'rgba(67, 80, 92, 0.25)';
      ctx.lineWidth = isSel ? 1.4 : 1;

      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(tagX, tagY, 100, 20, 4);
      else ctx.rect(tagX, tagY, 100, 20);
      ctx.fill();
      ctx.stroke();

      // Línea de enlace
      ctx.beginPath();
      ctx.moveTo(j.x + 6, j.y);
      ctx.lineTo(tagX, tagY + 10);
      ctx.strokeStyle = isSel ? j.color : 'rgba(67, 80, 92, 0.35)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = isSel ? j.color : '#22303c';
      ctx.font = 'bold 9.5px Karla, sans-serif';
      ctx.fillText(j.name, tagX + 6, tagY + 13);

      ctx.fillStyle = '#0d6e64';
      ctx.font = 'bold 8px JetBrains Mono, monospace';
      ctx.fillText(j.gl.split('·')[0].trim(), tagX + 62, tagY + 13);
      ctx.restore();
    });
  }, [mode, angles, layerMode, selectedJoint]);

  // Manejador de clics interactivos en el canvas 2D
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const isLeg = mode === 6;
    const originX = rect.width * 0.44;
    const originY = rect.height * 0.18;
    const L1 = rect.height * 0.32;
    const L2 = rect.height * 0.28;

    const a1 = (angles.joint1 * Math.PI) / 180;
    const a2 = (angles.joint2 * Math.PI) / 180;
    const totalAngle2 = a1 + (isLeg ? -a2 : a2);

    const p0 = { x: originX, y: originY, id: 'shoulder' };
    const p1 = { x: p0.x + Math.sin(a1) * L1, y: p0.y + Math.cos(a1) * L1, id: 'elbow' };
    const p2 = { x: p1.x + Math.sin(totalAngle2) * L2, y: p1.y + Math.cos(totalAngle2) * L2, id: 'wrist' };
    const pPiv = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2, id: 'pivot' };

    const joints = isLeg ? [p0, p1, p2] : [p0, p1, pPiv, p2];

    const hit = joints.find((j) => Math.hypot(mx - j.x, my - j.y) < 26);
    if (hit) {
      onSelectJoint(selectedJoint === hit.id ? null : hit.id);
    } else {
      onSelectJoint(null);
    }
  };

  return (
    <canvas
      ref={canvasRef}
      onClick={handleCanvasClick}
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
        cursor: 'crosshair',
      }}
    />
  );
}
