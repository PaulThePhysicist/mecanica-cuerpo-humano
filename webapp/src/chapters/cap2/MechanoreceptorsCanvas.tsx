import React, { useRef, useEffect } from 'react';

interface MechanoreceptorsCanvasProps {
  selectedReceptor: 'meissner' | 'pacini' | 'merkel' | 'ruffini';
  stimulusFreqHz: number; // Frecuencia del estímulo mecánico (1 a 400 Hz)
  stimulusDepthUm: number; // Profundidad de indentación en micrómetros (5 a 150 µm)
  onSelectReceptor?: (id: 'meissner' | 'pacini' | 'merkel' | 'ruffini') => void;
}

interface ReceptorInfo {
  id: 'meissner' | 'pacini' | 'merkel' | 'ruffini';
  name: string;
  shortName: string;
  type: string; // RA1, RA2, SA1, SA2
  depthUm: number; // Profundidad histológica real en micrómetros
  depthStr: string;
  field: string;
  bestFreq: string;
  function: string;
  color: string;
  glowColor: string;
  yNorm: number; // Posición de profundidad normalizada [0, 1] en el bloque de 2500 µm
  xRel: number; // Desplazamiento horizontal relativo respecto al centro de piel
}

const RECEPTORS: Record<string, ReceptorInfo> = {
  merkel: {
    id: 'merkel',
    name: 'Disco de Merkel',
    shortName: 'MERKEL (SA1)',
    type: 'SA1 (Adaptación Lenta 1)',
    depthUm: 200,
    depthStr: 'Estrato basal epidérmico (~200 µm)',
    field: '0,5–1 mm (Máxima resolución espacial)',
    bestFreq: '0,3 – 5 Hz (Presión estática y bordes)',
    function: 'Discriminación táctil fina de relieve, esquinas, bordes y curvaturas.',
    color: '#b02318',
    glowColor: 'rgba(176, 35, 24, 0.45)',
    yNorm: 0.10, // ~200 µm en escala 2500 µm
    xRel: -36,
  },
  meissner: {
    id: 'meissner',
    name: 'Corpúsculo de Meissner',
    shortName: 'MEISSNER (RA1)',
    type: 'RA1 (Adaptación Rápida 1)',
    depthUm: 500,
    depthStr: 'Dermis papilar superficial (~500 µm)',
    field: '3–5 mm (Puntual / Bordes netos)',
    bestFreq: '10 – 50 Hz (Vibración baja / Aleteo)',
    function: 'Detección de deslizamiento fino y control reflejo de prensión.',
    color: '#0d8577',
    glowColor: 'rgba(13, 133, 119, 0.45)',
    yNorm: 0.22, // ~500 µm en escala 2500 µm
    xRel: -4,
  },
  ruffini: {
    id: 'ruffini',
    name: 'Terminación de Ruffini',
    shortName: 'RUFFINI (SA2)',
    type: 'SA2 (Adaptación Lenta 2)',
    depthUm: 1450,
    depthStr: 'Dermis reticular profunda (~1450 µm)',
    field: 'Grande (Sensible a tracción direccional)',
    bestFreq: 'Estático / Estiramiento continuo',
    function: 'Propiocepción cutánea del estiramiento articular y deslizamiento sostenido.',
    color: '#d97706',
    glowColor: 'rgba(217, 119, 6, 0.45)',
    yNorm: 0.58, // ~1450 µm en escala 2500 µm
    xRel: 34,
  },
  pacini: {
    id: 'pacini',
    name: 'Corpúsculo de Pacini',
    shortName: 'PACINI (RA2)',
    type: 'RA2 (Adaptación Ultra-Rápida 2)',
    depthUm: 2150,
    depthStr: 'Tejido subcutáneo profundo (~2150 µm)',
    field: 'Grande y difuso (Dedo entero / Palma)',
    bestFreq: '200 – 400 Hz (Alta frecuencia)',
    function: 'Detección de vibraciones rápidas y nanotexturas de superficie.',
    color: '#2563eb',
    glowColor: 'rgba(37, 99, 235, 0.45)',
    yNorm: 0.84, // ~2150 µm en escala 2500 µm
    xRel: 6,
  },
};

export default function MechanoreceptorsCanvas({
  selectedReceptor = 'meissner',
  stimulusFreqHz = 35,
  stimulusDepthUm = 50,
  onSelectReceptor,
}: MechanoreceptorsCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const animTimeRef = useRef<number>(0);
  const hoveredRecRef = useRef<string | null>(null);

  const curRec = RECEPTORS[selectedReceptor] || RECEPTORS.meissner;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let lastTime = performance.now();

    const getSkinGeometry = (W: number, H: number) => {
      const skinLeft = W * 0.085;
      const skinRight = W * 0.535;
      const skinW = skinRight - skinLeft;
      const skinTop = H * 0.20;
      const skinBottom = H * 0.90;
      const skinH = skinBottom - skinTop;
      const probeCenterX = skinLeft + skinW * 0.48;

      const coords: Record<string, { x: number; y: number; id: string }> = {};
      Object.values(RECEPTORS).forEach((r) => {
        coords[r.id] = {
          x: probeCenterX + r.xRel,
          y: skinTop + r.yNorm * skinH,
          id: r.id,
        };
      });
      return { coords, skinLeft, skinRight, skinTop, skinBottom, skinW, skinH, probeCenterX };
    };

    const handlePointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;
      const { coords } = getSkinGeometry(rect.width, rect.height);

      let found: string | null = null;
      Object.values(coords).forEach((c) => {
        const dist = Math.hypot(clientX - c.x, clientY - c.y);
        if (dist <= 24) {
          found = c.id;
        }
      });

      hoveredRecRef.current = found;
      canvas.style.cursor = found ? 'pointer' : 'default';
    };

    const handlePointerDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;
      const { coords } = getSkinGeometry(rect.width, rect.height);

      Object.values(coords).forEach((c) => {
        const dist = Math.hypot(clientX - c.x, clientY - c.y);
        if (dist <= 26 && onSelectReceptor) {
          onSelectReceptor(c.id as any);
        }
      });
    };

    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerdown', handlePointerDown);

    const render = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      animTimeRef.current += dt;
      const t = animTimeRef.current;

      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const W = rect.width;
      const H = rect.height;

      // Some inactive slides briefly report a zero-sized canvas while the
      // layout is settling. Skip that frame so the geometry cannot produce
      // invalid Canvas radii during the transition.
      if (!Number.isFinite(W) || !Number.isFinite(H) || W <= 0 || H <= 0) {
        rafRef.current = requestAnimationFrame(render);
        return;
      }

      if (canvas.width !== W * dpr || canvas.height !== H * dpr) {
        canvas.width = W * dpr;
        canvas.height = H * dpr;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, W, H);

      // ─── 1. Fondo de Estudio Cálido con Viñeta Suave ───
      const bgGrad = ctx.createRadialGradient(W * 0.42, H * 0.42, 25, W * 0.5, H * 0.5, Math.max(W, H) * 0.78);
      bgGrad.addColorStop(0, '#ffffff');
      bgGrad.addColorStop(0.5, '#faf6ee');
      bgGrad.addColorStop(1, '#eee4d2');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // ─── 2. Geometría Histológica Calibrada en Micrómetros (2500 µm = 2,5 mm) ───
      const { skinLeft, skinRight, skinTop, skinBottom, skinW, skinH, probeCenterX } = getSkinGeometry(W, H);

      // Dimensiones de capas proporcionales a 2500 µm
      // Epidermis: 0 - 200 µm (8-10% de la altura)
      // Dermis: 200 - 1700 µm (58% de la altura)
      // Hipodermis: 1700 - 2500 µm (32% de la altura)
      const epiderH = skinH * 0.10;
      const dermisH = skinH * 0.58;
      const subcuH = skinH * 0.32;

      // Profundidad de indentación física calibrada en píxeles
      const indentPx = (stimulusDepthUm / 2500) * skinH * 1.0;
      const vibAmpPx = (stimulusDepthUm / 2500) * skinH * 0.28;
      const vibPx = Math.sin(t * stimulusFreqHz * 2 * Math.PI) * vibAmpPx;
      const totalProbeIndentY = indentPx + vibPx;

      // Sombra de contacto 3D en la base del bloque tisular
      ctx.save();
      ctx.fillStyle = 'rgba(50, 38, 22, 0.13)';
      ctx.beginPath();
      ctx.ellipse(skinLeft + skinW * 0.5 + 7, skinBottom + 12, skinW * 0.53, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // ─── Cara Lateral 3D con Perspectiva Isométrica Delgada ───
      const isoX = 13;
      const isoY = 9;
      ctx.save();
      // Hipodermis lateral
      ctx.fillStyle = '#d9b25a';
      ctx.beginPath();
      ctx.moveTo(skinRight, skinTop + epiderH + dermisH);
      ctx.lineTo(skinRight + isoX, skinTop + epiderH + dermisH - isoY);
      ctx.lineTo(skinRight + isoX, skinBottom - isoY);
      ctx.lineTo(skinRight, skinBottom);
      ctx.closePath();
      ctx.fill();

      // Dermis lateral
      ctx.fillStyle = '#d28f65';
      ctx.beginPath();
      ctx.moveTo(skinRight, skinTop + epiderH);
      ctx.lineTo(skinRight + isoX, skinTop + epiderH - isoY);
      ctx.lineTo(skinRight + isoX, skinTop + epiderH + dermisH - isoY);
      ctx.lineTo(skinRight, skinTop + epiderH + dermisH);
      ctx.closePath();
      ctx.fill();

      // Epidermis lateral
      ctx.fillStyle = '#c5956a';
      ctx.beginPath();
      ctx.moveTo(skinRight, skinTop);
      ctx.lineTo(skinRight + isoX, skinTop - isoY);
      ctx.lineTo(skinRight + isoX, skinTop + epiderH - isoY);
      ctx.lineTo(skinRight, skinTop + epiderH);
      ctx.closePath();
      ctx.fill();

      // Cara superior (Superficie cutánea en perspectiva con micro-relieve)
      const topGrad = ctx.createLinearGradient(skinLeft, skinTop, skinRight + isoX, skinTop - isoY);
      topGrad.addColorStop(0, '#faebd7');
      topGrad.addColorStop(0.5, '#f5d5ba');
      topGrad.addColorStop(1, '#e3b895');
      ctx.fillStyle = topGrad;
      ctx.beginPath();
      ctx.moveTo(skinLeft, skinTop);
      ctx.lineTo(skinLeft + isoX, skinTop - isoY);
      ctx.lineTo(skinRight + isoX, skinTop - isoY);
      ctx.lineTo(skinRight, skinTop);
      ctx.closePath();
      ctx.fill();

      // Crestas dermatoglíficas superiores
      ctx.strokeStyle = 'rgba(180, 120, 80, 0.35)';
      ctx.lineWidth = 0.8;
      for (let rx = skinLeft + 8; rx <= skinRight; rx += 11) {
        ctx.beginPath();
        ctx.moveTo(rx, skinTop);
        ctx.lineTo(rx + isoX, skinTop - isoY);
        ctx.stroke();
      }
      ctx.restore();

      // ─── 3. Capas Histológicas Frontales (Corte Histológico Detallado) ───
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(skinLeft, skinTop - 25, skinW, skinH + 35, 4);
      ctx.clip();

      // 3.1 Hipodermis / Tejido Subcutáneo Adiposo
      const hypoGrad = ctx.createLinearGradient(skinLeft, skinTop + epiderH + dermisH, skinLeft, skinBottom);
      hypoGrad.addColorStop(0, '#fae6b2');
      hypoGrad.addColorStop(0.5, '#f7dc99');
      hypoGrad.addColorStop(1, '#efcb82');
      ctx.fillStyle = hypoGrad;
      ctx.fillRect(skinLeft, skinTop + epiderH + dermisH, skinW, subcuH);

      // Adipocitos esféricos con sombreado 3D fino
      ctx.save();
      for (let gy = skinTop + epiderH + dermisH + 8; gy < skinBottom - 6; gy += 13) {
        for (let gx = skinLeft + 8; gx < skinRight - 8; gx += 15) {
          const shift = Math.sin(gx * 7.1 + gy * 3.3) * 2.5;
          const r = Math.max(0.1, 5.0 + Math.cos(gx + gy) * 1.2);
          const ag = ctx.createRadialGradient(gx + shift - 1.5, gy - 1.5, 0.8, gx + shift, gy, r);
          ag.addColorStop(0, '#ffffff');
          ag.addColorStop(0.3, '#fff8db');
          ag.addColorStop(0.7, '#fbe089');
          ag.addColorStop(1, '#dfba5a');
          ctx.fillStyle = ag;
          ctx.beginPath();
          ctx.arc(gx + shift, gy, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = 'rgba(180, 140, 60, 0.35)';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
      // Septos fibrosos interlobulillares
      ctx.strokeStyle = 'rgba(230, 200, 140, 0.55)';
      ctx.lineWidth = 1.0;
      for (let sx = skinLeft + 45; sx < skinRight - 20; sx += 50) {
        ctx.beginPath();
        ctx.moveTo(sx, skinTop + epiderH + dermisH);
        ctx.quadraticCurveTo(sx + 6, skinTop + epiderH + dermisH + subcuH * 0.5, sx - 4, skinBottom);
        ctx.stroke();
      }
      ctx.restore();

      // 3.2 Dermis Reticular y Papilar (Colágeno y microcirculación)
      const dermGrad = ctx.createLinearGradient(skinLeft, skinTop + epiderH, skinLeft, skinTop + epiderH + dermisH);
      dermGrad.addColorStop(0, '#f8d2b8');
      dermGrad.addColorStop(0.4, '#f2bf9e');
      dermGrad.addColorStop(1, '#e8ab85');
      ctx.fillStyle = dermGrad;
      ctx.fillRect(skinLeft, skinTop + epiderH, skinW, dermisH);

      // Fibras de colágeno onduladas (Tipo I y elastina)
      ctx.save();
      ctx.strokeStyle = 'rgba(195, 130, 95, 0.24)';
      ctx.lineWidth = 0.9;
      for (let dy = skinTop + epiderH + 8; dy < skinTop + epiderH + dermisH; dy += 7) {
        ctx.beginPath();
        ctx.moveTo(skinLeft, dy);
        for (let x = skinLeft; x <= skinRight; x += 16) {
          const wave = Math.sin((x + dy) * 0.08) * 3.0;
          ctx.lineTo(x, dy + wave);
        }
        ctx.stroke();
      }
      ctx.restore();

      // Bucles capilares dérmicos (microcirculación de las papilas)
      ctx.save();
      for (let vx = skinLeft + 22; vx < skinRight; vx += 34) {
        const py = skinTop + epiderH;
        ctx.strokeStyle = 'rgba(220, 38, 38, 0.55)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(vx - 2.5, py + 18);
        ctx.lineTo(vx - 2.5, py + 3);
        ctx.arc(vx, py + 3, 2.5, Math.PI, 0);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(37, 99, 235, 0.55)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(vx + 2.5, py + 3);
        ctx.lineTo(vx + 2.5, py + 18);
        ctx.stroke();
      }
      ctx.restore();

      // 3.3 Epidermis y Crestas Papilares Dermoepidérmicas (Rete Ridges)
      const numPapillae = 8;
      const papillaStep = skinW / numPapillae;

      ctx.save();
      ctx.beginPath();
      // Superficie superior con perfil de depresión viscoelástica Gaussiana
      ctx.moveTo(skinLeft, skinTop);
      for (let x = skinLeft; x <= skinRight; x += 2) {
        const distFromProbe = Math.abs(x - probeCenterX);
        const gaussian = Math.exp(-Math.pow(distFromProbe / 26, 2));
        const surfDef = totalProbeIndentY * gaussian;
        const dermatoglyph = Math.sin((x - skinLeft) * 0.4) * 1.0;
        ctx.lineTo(x, skinTop + surfDef + dermatoglyph);
      }
      ctx.lineTo(skinRight, skinTop + epiderH);

      // Crestas papilares onduladas (interdigitación dermoepidérmica)
      for (let i = numPapillae; i >= 0; i--) {
        const px = skinLeft + i * papillaStep;
        const prevPx = skinLeft + (i - 1) * papillaStep;
        ctx.quadraticCurveTo(px - papillaStep * 0.5, skinTop + epiderH + 12, prevPx, skinTop + epiderH);
      }
      ctx.closePath();

      const epiGrad = ctx.createLinearGradient(skinLeft, skinTop, skinLeft, skinTop + epiderH + 12);
      epiGrad.addColorStop(0, '#f9dfc7');
      epiGrad.addColorStop(0.3, '#f5cba8');
      epiGrad.addColorStop(0.8, '#ecb58d');
      epiGrad.addColorStop(1, '#deb58d');
      ctx.fillStyle = epiGrad;
      ctx.fill();

      // Estrato córneo queratinizado superior
      ctx.strokeStyle = '#c98a54';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(skinLeft, skinTop);
      for (let x = skinLeft; x <= skinRight; x += 2) {
        const distFromProbe = Math.abs(x - probeCenterX);
        const gaussian = Math.exp(-Math.pow(distFromProbe / 26, 2));
        const surfDef = totalProbeIndentY * gaussian;
        const dermatoglyph = Math.sin((x - skinLeft) * 0.4) * 1.0;
        ctx.lineTo(x, skinTop + surfDef + dermatoglyph);
      }
      ctx.stroke();
      ctx.restore();

      // Ondas mecánicas de deformación viscoelástica (corte y compresión)
      ctx.save();
      const waveCount = 3;
      for (let w = 1; w <= waveCount; w++) {
        const wavePhase = (t * stimulusFreqHz * 0.28 + w * 0.33) % 1.0;
        const waveRad = Math.max(0.1, 10 + wavePhase * (skinW * 0.42));
        const alpha = Math.max(0, 0.40 * (1 - wavePhase));
        ctx.strokeStyle = `rgba(217, 119, 6, ${alpha.toFixed(3)})`;
        ctx.lineWidth = 1.2;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.arc(probeCenterX, skinTop + totalProbeIndentY, waveRad, 0.15 * Math.PI, 0.85 * Math.PI);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.restore();

      // ─── 4. Fibras Nerviosas Aferentes Aβ y Potenciales de Acción Vivos ───
      const nerveTrunkY = skinBottom - 10;
      ctx.save();
      // Tronco nervioso profundo
      ctx.strokeStyle = '#c59d3a';
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.moveTo(skinLeft + 6, nerveTrunkY);
      ctx.lineTo(skinRight - 6, nerveTrunkY);
      ctx.stroke();

      // Vainas de mielina
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1.6;
      for (let nx = skinLeft + 16; nx < skinRight - 16; nx += 22) {
        ctx.beginPath();
        ctx.moveTo(nx, nerveTrunkY - 1.5);
        ctx.lineTo(nx + 14, nerveTrunkY - 1.5);
        ctx.stroke();
      }

      // Rótulo del tronco nervioso
      ctx.fillStyle = 'rgba(120, 90, 30, 0.95)';
      ctx.font = 'bold 6.5px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('TRONCO NERVIOSO AFERENTE (Fibras Aβ mielinizadas)', skinLeft + skinW * 0.5, nerveTrunkY + 8);

      // Axones individuales
      Object.values(RECEPTORS).forEach((rec) => {
        const isSel = rec.id === selectedReceptor;
        const isHov = rec.id === hoveredRecRef.current;
        const rx = probeCenterX + rec.xRel;
        const ry = skinTop + rec.yNorm * skinH;

        ctx.beginPath();
        ctx.moveTo(rx, ry + 8);
        ctx.bezierCurveTo(
          rx + (rec.xRel > 0 ? 10 : -10),
          (ry + nerveTrunkY) * 0.5,
          probeCenterX + rec.xRel * 0.4,
          nerveTrunkY - 10,
          probeCenterX + rec.xRel * 0.45,
          nerveTrunkY
        );
        ctx.strokeStyle = isSel ? '#eab308' : (isHov ? '#d97706' : 'rgba(197, 160, 80, 0.4)');
        ctx.lineWidth = isSel ? 2.0 : 1.0;
        ctx.stroke();

        // Pulsos de potenciales de acción animados (fotones de despolarización eléctrica)
        if (isSel) {
          const numPulses = 3;
          for (let p = 0; p < numPulses; p++) {
            const progress = (t * 2.2 + p / numPulses) % 1.0;
            const px = rx + (probeCenterX + rec.xRel * 0.45 - rx) * progress;
            const py = (ry + 8) + (nerveTrunkY - (ry + 8)) * progress;

            ctx.beginPath();
            ctx.arc(px, py, 3.2, 0, Math.PI * 2);
            ctx.fillStyle = '#38bdf8';
            ctx.shadowColor = '#0284c7';
            ctx.shadowBlur = 6;
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      });
      ctx.restore();

      // ─── 5. Anatomía Histológica de los 4 Mecanorreceptores ───
      Object.values(RECEPTORS).forEach((rec) => {
        const isSel = rec.id === selectedReceptor;
        const isHov = rec.id === hoveredRecRef.current;
        const rx = probeCenterX + rec.xRel;
        const ry = skinTop + rec.yNorm * skinH;

        ctx.save();
        if (rec.id === 'meissner') {
          // Meissner: Corpúsculo encapsulado en papila dérmica con láminas transversales apiladas
          if (isSel || isHov) {
            ctx.shadowColor = rec.glowColor;
            ctx.shadowBlur = isSel ? 14 : 7;
          }
          ctx.beginPath();
          ctx.ellipse(rx, ry, 7.5, 13, 0, 0, Math.PI * 2);
          ctx.fillStyle = isSel ? '#0d8577' : (isHov ? '#14b8a6' : '#d2c2a4');
          ctx.fill();
          ctx.strokeStyle = isSel ? '#042f2c' : '#7c6a4e';
          ctx.lineWidth = isSel ? 1.6 : 1.0;
          ctx.stroke();

          // Láminas de Schwann y axón helicoidal
          ctx.strokeStyle = isSel ? '#a7f3d0' : '#f5ecd8';
          ctx.lineWidth = 1.0;
          for (let ly = ry - 9; ly <= ry + 9; ly += 3.0) {
            ctx.beginPath();
            ctx.moveTo(rx - 4.5, ly);
            ctx.lineTo(rx + 4.5, ly);
            ctx.stroke();
          }
        } else if (rec.id === 'pacini') {
          // Pacini: Corpúsculo gigante con laminillas concéntricas de cebolla
          if (isSel || isHov) {
            ctx.shadowColor = rec.glowColor;
            ctx.shadowBlur = isSel ? 16 : 8;
          }
          const numLamellae = 5;
          for (let l = numLamellae; l >= 1; l--) {
            const rxW = 3.5 + l * 3.4;
            const ryH = 2.2 + l * 1.9;
            ctx.beginPath();
            ctx.ellipse(rx, ry, rxW, ryH, 0, 0, Math.PI * 2);
            if (l === numLamellae) {
              ctx.fillStyle = isSel ? 'rgba(37, 99, 235, 0.18)' : 'rgba(210, 194, 164, 0.15)';
              ctx.fill();
            }
            ctx.strokeStyle = isSel
              ? (l === 1 ? '#1d4ed8' : 'rgba(37, 99, 235, 0.5)')
              : (isHov ? '#3b82f6' : 'rgba(140, 122, 92, 0.4)');
            ctx.lineWidth = l === 1 ? 1.8 : 0.9;
            ctx.stroke();
          }
          // Terminal axónico central
          ctx.beginPath();
          ctx.ellipse(rx, ry, 5, 1.8, 0, 0, Math.PI * 2);
          ctx.fillStyle = isSel ? '#60a5fa' : '#b3a080';
          ctx.fill();
        } else if (rec.id === 'merkel') {
          // Merkel: Cúpula táctil de discos epiteliales basales
          if (isSel || isHov) {
            ctx.shadowColor = rec.glowColor;
            ctx.shadowBlur = isSel ? 12 : 6;
          }
          const discs = [-5, -1.7, 1.7, 5];
          discs.forEach((dx) => {
            ctx.beginPath();
            ctx.arc(rx + dx, ry, 3.2, 0, Math.PI * 2);
            ctx.fillStyle = isSel ? '#b02318' : (isHov ? '#dc2626' : '#d2c2a4');
            ctx.fill();
            ctx.strokeStyle = isSel ? '#5c0b05' : '#7c6a4e';
            ctx.lineWidth = 1.0;
            ctx.stroke();
          });
        } else {
          // Ruffini: Terminación fusiforme alargada entrelazada con colágeno
          if (isSel || isHov) {
            ctx.shadowColor = rec.glowColor;
            ctx.shadowBlur = isSel ? 14 : 7;
          }
          ctx.beginPath();
          ctx.ellipse(rx, ry, 15, 5.5, 0, 0, Math.PI * 2);
          ctx.fillStyle = isSel ? 'rgba(217, 119, 6, 0.22)' : 'rgba(210, 194, 164, 0.18)';
          ctx.fill();
          ctx.strokeStyle = isSel ? '#d97706' : (isHov ? '#f59e0b' : '#7c6a4e');
          ctx.lineWidth = isSel ? 1.6 : 1.0;
          ctx.stroke();

          // Fibrillas ramificadas internas
          ctx.strokeStyle = isSel ? '#fbbf24' : '#8c7a5c';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(rx - 11, ry);
          ctx.lineTo(rx + 11, ry);
          ctx.moveTo(rx - 6, ry - 2.5);
          ctx.lineTo(rx + 6, ry + 2.5);
          ctx.moveTo(rx - 6, ry + 2.5);
          ctx.lineTo(rx + 6, ry - 2.5);
          ctx.stroke();
        }

        // Halo de selección circular con insignia flotante esbelta
        if (isSel || isHov) {
          ctx.shadowBlur = 0;
          ctx.beginPath();
          ctx.arc(rx, ry, 20, 0, Math.PI * 2);
          ctx.strokeStyle = rec.color;
          ctx.lineWidth = isSel ? 1.5 : 1.0;
          ctx.setLineDash([2.5, 2.5]);
          ctx.stroke();
          ctx.setLineDash([]);

          // Insignia flotante compacta
          ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
          ctx.strokeStyle = rec.color;
          ctx.lineWidth = 1;
          const badgeW = 74;
          const badgeH = 15;
          const badgeX = Math.max(skinLeft + 4, Math.min(skinRight - badgeW - 4, rx - badgeW / 2));
          const badgeY = ry - 26;
          ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 3.5);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = rec.color;
          ctx.font = 'bold 7px JetBrains Mono, monospace';
          ctx.textAlign = 'center';
          ctx.fillText(rec.shortName, badgeX + badgeW / 2, badgeY + 10.5);
        }
        ctx.restore();
      });

      // Marco del corte histológico
      ctx.strokeStyle = '#b8a682';
      ctx.lineWidth = 1.4;
      ctx.strokeRect(skinLeft, skinTop, skinW, skinH);

      ctx.restore(); // Termina clip de la piel

      // ─── 6. Escala Micrométrica Histológica Calibrada (Margen Izquierdo) ───
      ctx.save();
      const rulerX = skinLeft - 6;
      ctx.strokeStyle = '#8c7a5c';
      ctx.lineWidth = 1.0;

      // Línea vertical de la regla
      ctx.beginPath();
      ctx.moveTo(rulerX, skinTop);
      ctx.lineTo(rulerX, skinBottom);
      ctx.stroke();

      // Marcas y cotas en micrómetros reales
      const rulerTicks = [
        { um: 0, label: '0 µm (Superficie)', y: skinTop },
        { um: 200, label: '200 µm (Merkel)', y: skinTop + epiderH },
        { um: 500, label: '500 µm (Meissner)', y: skinTop + skinH * 0.20 },
        { um: 1450, label: '1,45 mm (Ruffini)', y: skinTop + skinH * 0.58 },
        { um: 2150, label: '2,15 mm (Pacini)', y: skinTop + skinH * 0.86 },
        { um: 2500, label: '2,5 mm (Hipodermis)', y: skinBottom },
      ];

      rulerTicks.forEach((tick) => {
        ctx.beginPath();
        ctx.moveTo(rulerX - 3, tick.y);
        ctx.lineTo(rulerX, tick.y);
        ctx.stroke();

        ctx.fillStyle = '#64748b';
        ctx.font = 'bold 6px JetBrains Mono, monospace';
        ctx.textAlign = 'right';
        ctx.fillText(tick.label, rulerX - 5, tick.y + 2);
      });

      // Barra de escala de referencia [ 500 µm ]
      const scaleBarUm = 500;
      const scaleBarPx = (scaleBarUm / 2500) * skinH;
      const sbX = skinLeft + 8;
      const sbY = skinBottom - 14;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
      ctx.roundRect(sbX - 3, sbY - 10, scaleBarPx + 6, 16, 2.5);
      ctx.fill();
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(sbX, sbY);
      ctx.lineTo(sbX + scaleBarPx, sbY);
      ctx.moveTo(sbX, sbY - 3);
      ctx.lineTo(sbX, sbY + 3);
      ctx.moveTo(sbX + scaleBarPx, sbY - 3);
      ctx.lineTo(sbX + scaleBarPx, sbY + 3);
      ctx.stroke();

      ctx.fillStyle = '#334155';
      ctx.font = 'bold 6.5px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('500 µm', sbX + scaleBarPx / 2, sbY - 3);
      ctx.restore();

      // ─── 7. Sonda Indentadora Mecánica de Titanio con Vector de Fuerza ───
      const probeY = skinTop + totalProbeIndentY;
      ctx.save();
      // Sombra de contacto del cabezal
      ctx.fillStyle = 'rgba(35, 44, 54, 0.22)';
      ctx.beginPath();
      ctx.ellipse(probeCenterX, probeY + 1, 6, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Vástago de titanio esbelto
      const shaftW = 5.5;
      const shaftH = 38;
      const shaftGrad = ctx.createLinearGradient(probeCenterX - shaftW / 2, 0, probeCenterX + shaftW / 2, 0);
      shaftGrad.addColorStop(0, '#475569');
      shaftGrad.addColorStop(0.3, '#f8fafc');
      shaftGrad.addColorStop(0.7, '#94a3b8');
      shaftGrad.addColorStop(1, '#334155');
      ctx.fillStyle = shaftGrad;
      ctx.fillRect(probeCenterX - shaftW / 2, probeY - shaftH - 3, shaftW, shaftH);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 0.9;
      ctx.strokeRect(probeCenterX - shaftW / 2, probeY - shaftH - 3, shaftW, shaftH);

      // Micrómetro / Anillo de ajuste con marcas grabadas
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(probeCenterX - shaftW / 2 - 1, probeY - shaftH * 0.65, shaftW + 2, 6);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 0.5;
      for (let s = probeCenterX - shaftW / 2; s <= probeCenterX + shaftW / 2; s += 1.5) {
        ctx.beginPath();
        ctx.moveTo(s, probeY - shaftH * 0.65);
        ctx.lineTo(s, probeY - shaftH * 0.65 + 6);
        ctx.stroke();
      }

      // Punta esférica de rubí pulido
      const tipGrad = ctx.createRadialGradient(probeCenterX - 1, probeY - 2.5, 0.5, probeCenterX, probeY - 1.5, 3);
      tipGrad.addColorStop(0, '#f87171');
      tipGrad.addColorStop(0.6, '#b91c1c');
      tipGrad.addColorStop(1, '#7f1d1d');
      ctx.fillStyle = tipGrad;
      ctx.beginPath();
      ctx.arc(probeCenterX, probeY - 1.5, 2.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#450a0a';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Vector de Fuerza de Indentación Find (Flecha vertical carmín esbelta)
      const arrowLen = Math.min(22, 10 + (stimulusDepthUm / 150) * 12);
      ctx.strokeStyle = '#b02318';
      ctx.fillStyle = '#b02318';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(probeCenterX, probeY - shaftH - 8);
      ctx.lineTo(probeCenterX, probeY - shaftH - 8 - arrowLen);
      ctx.stroke();
      // Punta de flecha hacia abajo
      ctx.beginPath();
      ctx.moveTo(probeCenterX, probeY - shaftH - 6);
      ctx.lineTo(probeCenterX - 3, probeY - shaftH - 11);
      ctx.lineTo(probeCenterX + 3, probeY - shaftH - 11);
      ctx.closePath();
      ctx.fill();

      // Insignia con lectura exacta de indentación y fuerza estimada
      const estimatedForceMn = Math.round((stimulusDepthUm / 50) * 40); // Estimación viscoelástica (mN)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.strokeStyle = '#b02318';
      ctx.lineWidth = 0.9;
      const pW = 88;
      const pH = 15;
      const pX = probeCenterX - pW / 2;
      const pY = probeY - shaftH - arrowLen - 20;
      ctx.roundRect(pX, pY, pW, pH, 3.5);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#b02318';
      ctx.font = 'bold 7px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`δ = ${stimulusDepthUm} µm · F ≈ ${estimatedForceMn} mN`, pX + pW / 2, pY + 10.5);

      ctx.restore();

      // ─── 8. Osciloscopio Biológico Dual-Trace (Derecha) ───
      const oscX = W * 0.565;
      const oscY = H * 0.17;
      const oscW = W * 0.405;
      const oscH = H * 0.74;

      ctx.save();
      // Chasis del osciloscopio
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.8;
      ctx.roundRect(oscX, oscY, oscW, oscH, 7);
      ctx.fill();
      ctx.stroke();

      // Pantalla CRT interior
      const screenMargin = 7;
      const scrX = oscX + screenMargin;
      const scrY = oscY + screenMargin;
      const scrW = oscW - screenMargin * 2;
      const scrH = oscH - screenMargin * 2;

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(scrX, scrY, scrW, scrH, 4);
      ctx.clip();

      const crtGrad = ctx.createRadialGradient(scrX + scrW * 0.5, scrY + scrH * 0.5, 10, scrX + scrW * 0.5, scrY + scrH * 0.5, scrW * 0.7);
      crtGrad.addColorStop(0, '#061a1a');
      crtGrad.addColorStop(1, '#020b0d');
      ctx.fillStyle = crtGrad;
      ctx.fillRect(scrX, scrY, scrW, scrH);

      // Cuadrícula verde de fósforo (8x6 divisiones)
      ctx.strokeStyle = 'rgba(20, 184, 166, 0.16)';
      ctx.lineWidth = 0.8;
      const gridCols = 8;
      const gridRows = 6;
      for (let c = 1; c < gridCols; c++) {
        const gx = scrX + (c * scrW) / gridCols;
        ctx.beginPath();
        ctx.moveTo(gx, scrY);
        ctx.lineTo(gx, scrY + scrH);
        ctx.stroke();
      }
      for (let r = 1; r < gridRows; r++) {
        const gy = scrY + (r * scrH) / gridRows;
        ctx.beginPath();
        ctx.moveTo(scrX, gy);
        ctx.lineTo(scrX + scrW, gy);
        ctx.stroke();
      }

      // Ejes centrales con marcas milimétricas
      ctx.strokeStyle = 'rgba(20, 184, 166, 0.32)';
      ctx.lineWidth = 1.0;
      const midY1 = scrY + scrH * 0.28; // Eje estímulo mecánico
      const midY2 = scrY + scrH * 0.72; // Eje potenciales de acción
      ctx.beginPath();
      ctx.moveTo(scrX, midY1);
      ctx.lineTo(scrX + scrW, midY1);
      ctx.moveTo(scrX, midY2);
      ctx.lineTo(scrX + scrW, midY2);
      ctx.stroke();

      // ─── Traza 1 (Canal A / Amarillo): Onda Mecánica de Indentación ───
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.6;
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 5;
      ctx.beginPath();
      for (let x = 0; x <= scrW; x += 2) {
        const phase = (t * stimulusFreqHz * 0.12 + (x / scrW) * (stimulusFreqHz * 0.08)) * Math.PI * 2;
        const ampPx = Math.min(16, (stimulusDepthUm / 150) * 14);
        const y = midY1 - Math.sin(phase) * ampPx;
        if (x === 0) ctx.moveTo(scrX + x, y);
        else ctx.lineTo(scrX + x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // ─── Traza 2 (Canal B / Verde Neón): Tren de Potenciales de Acción Vivos ───
      let firingRateHz = 0;
      if (selectedReceptor === 'pacini') {
        firingRateHz = stimulusFreqHz >= 80 ? Math.min(320, Math.round(stimulusFreqHz * (stimulusDepthUm > 20 ? 0.95 : 0.4))) : 0;
      } else if (selectedReceptor === 'meissner') {
        firingRateHz = stimulusFreqHz <= 90 ? Math.min(120, Math.round(stimulusFreqHz * 1.5)) : 15;
      } else if (selectedReceptor === 'merkel') {
        firingRateHz = Math.round(15 + (stimulusDepthUm / 150) * 45);
      } else {
        firingRateHz = Math.round(10 + (stimulusDepthUm / 150) * 30);
      }

      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 1.8;
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.moveTo(scrX, midY2);

      const periodPx = firingRateHz > 0 ? Math.max(12, (scrW / (firingRateHz * 0.15))) : 9999;
      for (let x = 0; x <= scrW; x += 2) {
        const localX = (x + t * 90) % periodPx;
        let spikeMv = 0;
        if (firingRateHz > 0 && localX < 11) {
          if (localX < 3.5) {
            spikeMv = (localX / 3.5) * 30; // Despolarización rápida (-70 a +30 mV)
          } else if (localX < 7.5) {
            spikeMv = 30 - ((localX - 3.5) / 4) * 36; // Repolarización (+30 a -80 mV)
          } else {
            spikeMv = -6 + ((localX - 7.5) / 3.5) * 6; // Hiperpolarización refractaria
          }
        }
        ctx.lineTo(scrX + x, midY2 - spikeMv);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Línea de barrido vertical fluorescente
      const sweepX = scrX + (t * 110) % scrW;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(sweepX, scrY);
      ctx.lineTo(sweepX, scrY + scrH);
      ctx.stroke();

      // Indicadores en pantalla CRT
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 7px JetBrains Mono, monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`CH1 ESTÍMULO: ${stimulusDepthUm} µm @ ${stimulusFreqHz} Hz`, scrX + 6, scrY + 11);

      ctx.fillStyle = '#34d399';
      ctx.fillText(`CH2 AFERENTE: ${firingRateHz} espigas/s`, scrX + 6, scrY + scrH * 0.52);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '6.5px JetBrains Mono, monospace';
      ctx.fillText(`Vm: -70 mV → +30 mV`, scrX + 6, scrY + scrH * 0.62);
      ctx.fillText(`Modo: ${curRec.type.split(' ')[0]}`, scrX + 6, scrY + scrH * 0.94);

      ctx.restore(); // Clip osciloscopio
      ctx.restore();

      // ─── 9. Cabecera Superior del Canvas ───
      ctx.fillStyle = 'var(--ink, #232c36)';
      ctx.font = 'bold 11.5px Karla, system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${curRec.name.toUpperCase()}  ·  ${curRec.type}`, W * 0.085, 22);

      ctx.fillStyle = 'rgba(107, 120, 133, 0.9)';
      ctx.font = '8px Karla, system-ui, sans-serif';
      ctx.fillText(`${curRec.function} — ${curRec.depthStr}`, W * 0.085, 35);

      ctx.restore();
      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [selectedReceptor, stimulusFreqHz, stimulusDepthUm, onSelectReceptor]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
    </div>
  );
}
