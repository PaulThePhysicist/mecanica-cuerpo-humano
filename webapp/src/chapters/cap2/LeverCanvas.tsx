import React, { useRef, useEffect, useState } from 'react';
import { readCap2Tokens, tokenRgba } from './designTokens';

interface LeverCanvasProps {
  leverClass: 1 | 2 | 3; // Clase 1, 2 o 3
  loadKg: number;        // Carga W en kg (1 a 50)
  onSelectClass?: (c: 1 | 2 | 3) => void;
}

interface LeverInfo {
  name: string;
  anatExample: string;
  order: string;
  vmDesc: string;
  color: string;
  bp: number; // Brazo de potencia (cm)
  br: number; // Brazo de resistencia (cm)
}

const LEVER_DATA: Record<number, LeverInfo> = {
  1: {
    name: 'Palanca de 1ª Clase (Interapoyo)',
    anatExample: 'Articulación Atlanto-occipital (C1 / Nuca)',
    order: 'Potencia (F) — Fulcro (Δ) — Resistencia (W)',
    vmDesc: 'VM variable: depende de la posición relativa del fulcro respecto a la carga.',
    color: '#0d6e64',
    bp: 5,
    br: 12,
  },
  2: {
    name: 'Palanca de 2ª Clase (Interresistencia)',
    anatExample: 'Apoyo plantar sobre metatarsos (Gemelos y Tendón de Aquiles)',
    order: 'Fulcro (Δ) — Resistencia (W) — Potencia (F)',
    vmDesc: 'Ventaja mecánica permanente (VM > 1): siempre multiplica la fuerza muscular.',
    color: '#2e8b57',
    bp: 18,
    br: 10,
  },
  3: {
    name: 'Palanca de 3ª Clase (Interpotencia)',
    anatExample: 'Flexión de codo (Bíceps braquial y antebrazo)',
    order: 'Fulcro (Δ) — Potencia (F) — Resistencia (W)',
    vmDesc: 'Desventaja de fuerza (VM < 1), pero gran amplificación de velocidad y rango distal.',
    color: '#b02318',
    bp: 4,
    br: 35,
  },
};

export default function LeverCanvas({
  leverClass = 3,
  loadKg = 10,
  onSelectClass,
}: LeverCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const animTimeRef = useRef<number>(0);
  const [viewMode, setViewMode] = useState<'both' | 'anatomy' | 'beam'>('both');
  const [showVmPanel, setShowVmPanel] = useState(true);

  const curData = LEVER_DATA[leverClass] || LEVER_DATA[3];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let lastTime = performance.now();

    const render = (now: number) => {
      const dt = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;
      animTimeRef.current += dt;
      const t = animTimeRef.current;

      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const W = rect.width;
      const H = rect.height;
      const uiScale = Math.max(1.15, Math.min(1.45, W / 420));

      if (W < 10 || H < 10) {
        rafRef.current = requestAnimationFrame(render);
        return;
      }

      if (canvas.width !== Math.round(W * dpr) || canvas.height !== Math.round(H * dpr)) {
        canvas.width = Math.round(W * dpr);
        canvas.height = Math.round(H * dpr);
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // S4-01: tokens de :root leídos una vez por pasada de dibujo. El color de
      // la clase 1 (LEVER_DATA) coincidía por casualidad con --teal; se lee de
      // ahí en vez de repetir el literal. Las clases 2 y 3 usan colores propios
      // sin token equivalente (paleta deliberada), se dejan como están.
      const T = readCap2Tokens();
      const curColor = leverClass === 1 ? T.teal : curData.color;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, W, H);

      // ─── 1. Fondo de estudio anatómico con viñeta cálida ───
      const bgGrad = ctx.createRadialGradient(W * 0.42, H * 0.48, 25, W * 0.5, H * 0.5, Math.max(W, H) * 0.85);
      bgGrad.addColorStop(0, '#ffffff');
      bgGrad.addColorStop(0.55, '#faf6ee');
      bgGrad.addColorStop(1, '#eee4d2');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // Rejilla sutil
      ctx.strokeStyle = tokenRgba(T.ink2, 0.085);
      ctx.lineWidth = 1;
      const gStep = 24;
      for (let x = gStep; x < W; x += gStep) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = gStep; y < H; y += gStep) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      // ─── 2. Cálculos Mecánicos de Palanca ───
      const bp = curData.bp;
      const br = curData.br;
      const vm = bp / br; // Ventaja Mecánica
      const wNewtons = loadKg * 9.81;
      const fMuscNewtons = wNewtons / vm; // F = W * (br / bp)

      // ─── 3. ILUSTRACIÓN ANATÓMICA AUTÉNTICA SEGÚN LA CLASE ───
      const anatCenterX = W * 0.38;
      const anatCenterY = H * 0.30;

      ctx.save();
      if (leverClass === 1) {
        // ── CLASE 1: Articulación Atlanto-occipital (Cráneo / C1) ──
        // Base / Columna cervical C1-C2 (Fulcro)
        const spineX = anatCenterX;
        const spineY = anatCenterY + 42;

        // Fulcro C1
        ctx.fillStyle = '#b5a585';
        ctx.strokeStyle = '#6d5e46';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(spineX - 18, spineY + 24);
        ctx.lineTo(spineX + 18, spineY + 24);
        ctx.lineTo(spineX, spineY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = T.ink2;
        ctx.beginPath();
        ctx.arc(spineX, spineY, 5, 0, Math.PI * 2);
        ctx.fill();

        // Cráneo anatómico en perfil
        const skullGrad = ctx.createLinearGradient(anatCenterX - 60, anatCenterY - 50, anatCenterX + 60, anatCenterY + 40);
        skullGrad.addColorStop(0, '#faf6ec');
        skullGrad.addColorStop(0.5, '#ede2ca');
        skullGrad.addColorStop(1, '#c5b593');
        ctx.fillStyle = skullGrad;
        ctx.strokeStyle = '#7c6a4e';
        ctx.lineWidth = 1.6;

        ctx.beginPath();
        // Bóveda craneal
        ctx.arc(anatCenterX, anatCenterY - 10, 42, Math.PI * 0.8, Math.PI * 2.1);
        // Frente y rostro
        ctx.quadraticCurveTo(anatCenterX + 48, anatCenterY + 10, anatCenterX + 42, anatCenterY + 24);
        // Mandíbula
        ctx.lineTo(anatCenterX + 28, anatCenterY + 36);
        ctx.lineTo(anatCenterX + 12, anatCenterY + 36);
        // Cóndilo occipital sobre el atlas
        ctx.lineTo(spineX + 6, spineY - 2);
        ctx.lineTo(spineX - 6, spineY - 2);
        // Occipucio posterior
        ctx.quadraticCurveTo(anatCenterX - 46, anatCenterY + 20, anatCenterX - 42, anatCenterY - 10);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Órbita ocular y arco cigomático
        ctx.strokeStyle = 'rgba(124, 106, 78, 0.4)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(anatCenterX + 24, anatCenterY - 10, 8, 10, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Centro de gravedad del cráneo (Anterior al fulcro C1, br = 12 cm)
        const cgX = spineX + 38;
        const cgY = anatCenterY - 4;
        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.arc(cgX, cgY, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Vector peso de la cabeza W (hacia abajo)
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(cgX, cgY);
        ctx.lineTo(cgX, cgY + 22);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cgX, cgY + 22);
        ctx.lineTo(cgX - 3.5, cgY + 17);
        ctx.lineTo(cgX + 3.5, cgY + 17);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#d97706';
        ctx.font = `bold ${7 * uiScale}px JetBrains Mono, monospace`;
        ctx.textAlign = 'left';
        ctx.fillText(`W = ${wNewtons.toFixed(0)} N`, cgX + 5, cgY + 20);

        // Músculos de la nuca (Esplenio de la cabeza, trapecio) - Potencia Fm
        const muscX = spineX - 32;
        const muscY = anatCenterY + 12;

        const mGrad = ctx.createLinearGradient(muscX, muscY, muscX + 10, spineY + 35);
        mGrad.addColorStop(0, T.blood);
        mGrad.addColorStop(0.5, '#c14b4b');
        mGrad.addColorStop(1, T.bloodDeep);
        ctx.fillStyle = mGrad;
        ctx.strokeStyle = '#73140e';
        ctx.lineWidth = 1.3;

        ctx.beginPath();
        ctx.moveTo(muscX, muscY);
        ctx.quadraticCurveTo(muscX - 12, spineY + 15, spineX - 10, spineY + 35);
        ctx.lineTo(spineX - 4, spineY + 35);
        ctx.quadraticCurveTo(muscX - 2, spineY + 15, muscX + 8, muscY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Vector Fm del músculo nucal (tira hacia abajo para sostener la cabeza)
        ctx.strokeStyle = '#0d6e64';
        ctx.fillStyle = '#0d6e64';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(muscX + 4, muscY);
        ctx.lineTo(muscX + 4, muscY + 25);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(muscX + 4, muscY + 25);
        ctx.lineTo(muscX + 0.5, muscY + 20);
        ctx.lineTo(muscX + 7.5, muscY + 20);
        ctx.closePath();
        ctx.fill();

        ctx.font = `bold ${7 * uiScale}px JetBrains Mono, monospace`;
        ctx.textAlign = 'right';
        ctx.fillText(`F_nuca = ${fMuscNewtons.toFixed(0)} N`, muscX - 3, muscY + 16);

      } else if (leverClass === 2) {
        // ── CLASE 2: Tobillo y Pie en Flexión Plantar (Metatarsos / Gemelos) ──
        const footOriginX = anatCenterX - 75;
        const footOriginY = anatCenterY + 45;

        // Fulcro: Metatarsos / Dedos del pie apoyados en el suelo
        const fulcFootX = footOriginX + 135;
        const fulcFootY = footOriginY;

        // Suelo de apoyo
        ctx.strokeStyle = tokenRgba(T.ink2, 0.4);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(footOriginX - 20, fulcFootY + 8);
        ctx.lineTo(fulcFootX + 35, fulcFootY + 8);
        ctx.stroke();

        // Huesos del pie (Calcáneo, Tarso, Metatarsos)
        const footGrad = ctx.createLinearGradient(footOriginX, footOriginY - 20, fulcFootX, footOriginY);
        footGrad.addColorStop(0, '#f5ecd8');
        footGrad.addColorStop(0.5, '#ede2ca');
        footGrad.addColorStop(1, '#c5b593');
        ctx.fillStyle = footGrad;
        ctx.strokeStyle = '#7c6a4e';
        ctx.lineWidth = 1.6;

        ctx.beginPath();
        // Calcáneo (talón levantado)
        ctx.moveTo(footOriginX, footOriginY - 26);
        ctx.quadraticCurveTo(footOriginX + 25, footOriginY - 32, footOriginX + 55, footOriginY - 20);
        // Articulación del tobillo (Astrágalo)
        ctx.lineTo(footOriginX + 68, footOriginY - 16);
        // Empeine y metatarso descendiendo al fulcro
        ctx.quadraticCurveTo(footOriginX + 105, footOriginY - 8, fulcFootX, footOriginY);
        // Dedos
        ctx.lineTo(fulcFootX + 22, footOriginY + 6);
        ctx.lineTo(fulcFootX - 10, footOriginY + 6);
        // Bóveda plantar
        ctx.quadraticCurveTo(footOriginX + 65, footOriginY - 2, footOriginX, footOriginY - 14);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Fulcro en el metatarso
        ctx.fillStyle = T.ink2;
        ctx.beginPath();
        ctx.arc(fulcFootX, footOriginY + 4, 4.5, 0, Math.PI * 2);
        ctx.fill();

        // Tibia (transmite el peso corporal W hacia abajo en el astrágalo)
        const tibiaX = footOriginX + 68;
        const tibiaY = footOriginY - 18;

        const tibGrad = ctx.createLinearGradient(tibiaX - 10, tibiaY - 55, tibiaX + 10, tibiaY);
        tibGrad.addColorStop(0, '#f5ecd8');
        tibGrad.addColorStop(1, '#c5b593');
        ctx.fillStyle = tibGrad;
        ctx.strokeStyle = '#7c6a4e';
        ctx.lineWidth = 1.4;

        ctx.beginPath();
        ctx.roundRect(tibiaX - 9, tibiaY - 55, 18, 55, 4);
        ctx.fill();
        ctx.stroke();

        // Vector Carga W (Peso corporal sobre el tobillo)
        ctx.strokeStyle = '#d97706';
        ctx.fillStyle = '#d97706';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(tibiaX, tibiaY - 35);
        ctx.lineTo(tibiaX, tibiaY - 8);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(tibiaX, tibiaY - 8);
        ctx.lineTo(tibiaX - 3.5, tibiaY - 13);
        ctx.lineTo(tibiaX + 3.5, tibiaY - 13);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#d97706';
        ctx.font = `bold ${7 * uiScale}px JetBrains Mono, monospace`;
        ctx.textAlign = 'left';
        ctx.fillText(`W = ${wNewtons.toFixed(0)} N`, tibiaX + 6, tibiaY - 18);

        // Músculo Gemelo/Sóleo y Tendón de Aquiles (Potencia Fm tirando hacia arriba)
        const achillesX = footOriginX + 4;
        const achillesY = footOriginY - 26;

        // Músculo gemelo
        const calfGrad = ctx.createLinearGradient(achillesX - 10, achillesY - 60, achillesX + 10, achillesY - 25);
        calfGrad.addColorStop(0, T.blood);
        calfGrad.addColorStop(0.6, '#c14b4b');
        calfGrad.addColorStop(1, T.bloodDeep);
        ctx.fillStyle = calfGrad;
        ctx.strokeStyle = '#73140e';
        ctx.lineWidth = 1.3;

        ctx.beginPath();
        ctx.roundRect(achillesX - 11, achillesY - 60, 22, 35, 6);
        ctx.fill();
        ctx.stroke();

        // Tendón de Aquiles nacarado
        ctx.strokeStyle = '#f5f0e6';
        ctx.lineWidth = 4.0;
        ctx.beginPath();
        ctx.moveTo(achillesX, achillesY - 25);
        ctx.lineTo(achillesX, achillesY);
        ctx.stroke();

        // Vector Fm del Tendón de Aquiles
        ctx.strokeStyle = '#2e8b57';
        ctx.fillStyle = '#2e8b57';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(achillesX, achillesY);
        ctx.lineTo(achillesX, achillesY - 28);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(achillesX, achillesY - 28);
        ctx.lineTo(achillesX - 3.5, achillesY - 23);
        ctx.lineTo(achillesX + 3.5, achillesY - 23);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#2e8b57';
        ctx.font = `bold ${7 * uiScale}px JetBrains Mono, monospace`;
        ctx.textAlign = 'right';
        ctx.fillText(`F_aq = ${fMuscNewtons.toFixed(0)} N`, achillesX - 6, achillesY - 14);

      } else {
        // ── CLASE 3: Flexión de Codo (Bíceps) ──
        const elbowJointX = anatCenterX - 65;
        const elbowJointY = anatCenterY + 36;
        const handTipX = elbowJointX + 130;
        const handTipY = elbowJointY;

        // Húmero superior
        const humGrad = ctx.createLinearGradient(elbowJointX - 12, elbowJointY - 65, elbowJointX + 12, elbowJointY);
        humGrad.addColorStop(0, '#f5ecd8');
        humGrad.addColorStop(1, '#c5b593');
        ctx.fillStyle = humGrad;
        ctx.strokeStyle = '#7c6a4e';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(elbowJointX - 10, elbowJointY - 65, 20, 65, 5);
        ctx.fill();
        ctx.stroke();

        // Cartílago del codo
        ctx.fillStyle = 'rgba(104, 197, 184, 0.85)';
        ctx.beginPath();
        ctx.arc(elbowJointX, elbowJointY, 7, 0, Math.PI * 2);
        ctx.fill();

        // Antebrazo (Cúbito y Radio)
        const armGrad = ctx.createLinearGradient(elbowJointX, elbowJointY - 6, handTipX, elbowJointY + 6);
        armGrad.addColorStop(0, '#ede2ca');
        armGrad.addColorStop(1, '#c5b593');
        ctx.fillStyle = armGrad;
        ctx.strokeStyle = '#7c6a4e';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.roundRect(elbowJointX - 6, elbowJointY - 6, 136, 12, 5);
        ctx.fill();
        ctx.stroke();

        // Mano
        ctx.beginPath();
        ctx.arc(handTipX, handTipY, 9, 0, Math.PI * 2);
        ctx.fillStyle = '#e9c49f';
        ctx.fill();

        // Bíceps braquial
        const bOriginX = elbowJointX + 2;
        const bOriginY = elbowJointY - 58;
        const bInsertX = elbowJointX + 22; // Inserción a 4 cm
        const bInsertY = elbowJointY - 6;

        const bicGrad = ctx.createLinearGradient(bOriginX, bOriginY, bInsertX, bInsertY);
        bicGrad.addColorStop(0, T.blood);
        bicGrad.addColorStop(0.5, '#c14b4b');
        bicGrad.addColorStop(1, T.bloodDeep);
        ctx.fillStyle = bicGrad;
        ctx.strokeStyle = '#73140e';
        ctx.lineWidth = 1.3;

        ctx.beginPath();
        ctx.moveTo(bOriginX, bOriginY);
        ctx.quadraticCurveTo(elbowJointX + 20, (bOriginY + bInsertY) / 2, bInsertX, bInsertY);
        ctx.quadraticCurveTo(elbowJointX - 4, (bOriginY + bInsertY) / 2, bOriginX, bOriginY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Tendón nacarado
        ctx.strokeStyle = '#f5f0e6';
        ctx.lineWidth = 3.2;
        ctx.beginPath();
        ctx.moveTo(bInsertX, bInsertY - 4);
        ctx.lineTo(bInsertX, bInsertY);
        ctx.stroke();

        // Vector Fm del bíceps (hacia arriba)
        ctx.strokeStyle = '#b02318';
        ctx.fillStyle = '#b02318';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(bInsertX, bInsertY);
        ctx.lineTo(bInsertX, bInsertY - 26);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(bInsertX, bInsertY - 26);
        ctx.lineTo(bInsertX - 3.5, bInsertY - 21);
        ctx.lineTo(bInsertX + 3.5, bInsertY - 21);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#b02318';
        ctx.font = `bold ${7 * uiScale}px JetBrains Mono, monospace`;
        ctx.textAlign = 'left';
        ctx.fillText(`F_bic = ${fMuscNewtons.toFixed(0)} N`, bInsertX + 5, bInsertY - 14);

        // Vector Carga W en la mano (hacia abajo)
        ctx.strokeStyle = '#d97706';
        ctx.fillStyle = '#d97706';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(handTipX, handTipY);
        ctx.lineTo(handTipX, handTipY + 22);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(handTipX, handTipY + 22);
        ctx.lineTo(handTipX - 3.5, handTipY + 17);
        ctx.lineTo(handTipX + 3.5, handTipY + 17);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#d97706';
        ctx.font = `bold ${7 * uiScale}px JetBrains Mono, monospace`;
        ctx.textAlign = 'center';
        ctx.fillText(`W = ${wNewtons.toFixed(0)} N`, handTipX, handTipY + 32);
      }
      ctx.restore();

      // ─── 4. DIAGRAMA MECÁNICO DE VIGA RIGIDA / BALANCÍN (Abajo) ───
      const barY = H * 0.69;
      const barLeft = W * 0.05;
      const barRight = W * 0.70;
      const barLen = barRight - barLeft;

      let fulcrumX = barLeft;
      let muscleX = barLeft;
      let loadX = barLeft;

      if (leverClass === 1) {
        // 1ª clase: F - Δ - W (Fulcro intermedio)
        fulcrumX = barLeft + barLen * 0.38;
        muscleX = barLeft + barLen * 0.10;
        loadX = barLeft + barLen * 0.90;
      } else if (leverClass === 2) {
        // 2ª clase: Δ - W - F (Carga intermedia)
        fulcrumX = barLeft + barLen * 0.10;
        loadX = barLeft + barLen * 0.46;
        muscleX = barLeft + barLen * 0.90;
      } else {
        // 3ª clase: Δ - F - W (Músculo intermedio)
        fulcrumX = barLeft + barLen * 0.10;
        muscleX = barLeft + barLen * 0.28;
        loadX = barLeft + barLen * 0.90;
      }

      // Sombra de contacto
      ctx.save();
      ctx.fillStyle = tokenRgba(T.ink, 0.14);
      ctx.beginPath();
      ctx.ellipse(fulcrumX, barY + 22, 28, 7, 0, 0, Math.PI * 2);
      ctx.ellipse(loadX, barY + 16, 20, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Viga rígida ósea
      ctx.save();
      const beamGrad = ctx.createLinearGradient(barLeft, barY - 7, barLeft, barY + 7);
      beamGrad.addColorStop(0, '#f5ecd8');
      beamGrad.addColorStop(0.5, '#ede2ca');
      beamGrad.addColorStop(1, '#c5b593');
      ctx.fillStyle = beamGrad;
      ctx.strokeStyle = '#7c6a4e';
      ctx.lineWidth = 1.6;

      ctx.beginPath();
      ctx.roundRect(barLeft, barY - 7, barLen, 14, 6);
      ctx.fill();
      ctx.stroke();

      // Tapas epifisarias en los extremos
      ctx.fillStyle = 'rgba(104, 197, 184, 0.8)';
      ctx.beginPath();
      ctx.arc(barLeft + 4, barY, 6, Math.PI * 0.5, Math.PI * 1.5);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(barRight - 4, barY, 6, -Math.PI * 0.5, Math.PI * 0.5);
      ctx.fill();
      ctx.restore();

      // Fulcro Articular Triangulado (Δ)
      ctx.save();
      const fulcGrad = ctx.createLinearGradient(fulcrumX - 16, barY + 7, fulcrumX + 16, barY + 28);
      fulcGrad.addColorStop(0, '#4a5568');
      fulcGrad.addColorStop(1, '#2d3748');
      ctx.fillStyle = fulcGrad;
      ctx.strokeStyle = '#1a202c';
      ctx.lineWidth = 1.6;

      ctx.beginPath();
      ctx.moveTo(fulcrumX, barY + 7);
      ctx.lineTo(fulcrumX - 18, barY + 28);
      ctx.lineTo(fulcrumX + 18, barY + 28);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Cojinete del fulcro
      ctx.beginPath();
      ctx.arc(fulcrumX, barY + 7, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#f5ecd8';
      ctx.fill();
      ctx.strokeStyle = '#2d3748';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = T.ink;
      ctx.font = `bold ${8.5 * uiScale}px Karla, system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('Fulcro (Δ)', fulcrumX, barY + 39);
      ctx.restore();

      // Vector de Carga / Resistencia (W)
      const loadArrowLen = Math.min(26, 12 + loadKg * 0.32);
      ctx.save();
      ctx.strokeStyle = '#d97706';
      ctx.fillStyle = '#d97706';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(loadX, barY + 7);
      ctx.lineTo(loadX, barY + 7 + loadArrowLen);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(loadX, barY + 7 + loadArrowLen);
      ctx.lineTo(loadX - 3.5, barY + loadArrowLen + 2);
      ctx.lineTo(loadX + 3.5, barY + loadArrowLen + 2);
      ctx.closePath();
      ctx.fill();

      // Pesa métrica colgante estilizada compacta
      const weightW = 46 * uiScale;
      const weightH = 22 * uiScale;
      const weightY = barY + loadArrowLen + 8;

      const wGrad = ctx.createLinearGradient(loadX - weightW / 2, weightY, loadX + weightW / 2, weightY + weightH);
      wGrad.addColorStop(0, '#fef3c7');
      wGrad.addColorStop(1, '#fde68a');
      ctx.fillStyle = wGrad;
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(loadX - weightW / 2, weightY, weightW, weightH, 3);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#92400e';
      ctx.font = `bold ${7.5 * uiScale}px JetBrains Mono, monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(`${loadKg} kg`, loadX, weightY + 8);
      ctx.font = `${6.5 * uiScale}px JetBrains Mono, monospace`;
      ctx.fillText(`W = ${wNewtons.toFixed(0)} N`, loadX, weightY + 16);
      ctx.restore();

      // Vector de Potencia Muscular (F)
      const isPullUp = leverClass === 2 || leverClass === 3;
      const fArrowLen = Math.min(34, Math.max(16, (fMuscNewtons / Math.max(1, wNewtons)) * 12));
      const muscEndY = isPullUp ? barY - 7 - fArrowLen : barY + 7 + fArrowLen;

      ctx.save();
      // Tendón nacarado
      ctx.strokeStyle = '#f5f0e6';
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(muscleX, barY + (isPullUp ? -7 : 7));
      ctx.lineTo(muscleX, barY + (isPullUp ? -10 : 10));
      ctx.stroke();

      // Vector de tracción muscular
      ctx.strokeStyle = curColor;
      ctx.fillStyle = curColor;
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(muscleX, barY + (isPullUp ? -7 : 7));
      ctx.lineTo(muscleX, muscEndY);
      ctx.stroke();

      // Punta de flecha
      const dir = isPullUp ? 1 : -1;
      ctx.beginPath();
      ctx.moveTo(muscleX, muscEndY);
      ctx.lineTo(muscleX - 4.5, muscEndY + dir * 5.5);
      ctx.lineTo(muscleX + 4.5, muscEndY + dir * 5.5);
      ctx.closePath();
      ctx.fill();

      // Badge flotante esmerilado de Fm compacto
      const badgeW = 86 * uiScale;
      const badgeH = 21 * uiScale;
      const badgeY = isPullUp ? muscEndY - 22 : muscEndY + 6;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.shadowColor = tokenRgba(T.ink, 0.10);
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.roundRect(muscleX - badgeW / 2, badgeY, badgeW, badgeH, 3);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = curColor;
      ctx.lineWidth = 1.1;
      ctx.stroke();

      ctx.fillStyle = curColor;
      ctx.font = `bold ${7.5 * uiScale}px JetBrains Mono, monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(`F_m = ${fMuscNewtons.toFixed(0)} N`, muscleX, badgeY + 8);
      ctx.font = `${6.5 * uiScale}px Karla, system-ui, sans-serif`;
      ctx.fillStyle = tokenRgba(T.ink3, 0.95);
      ctx.fillText(`(${(fMuscNewtons / 9.81).toFixed(1)} kgf)`, muscleX, badgeY + 15);
      ctx.restore();

      // Cotas de Brazos de Palanca (bp y br)
      ctx.save();
      // Cota bp
      ctx.strokeStyle = curColor;
      ctx.lineWidth = 1.0;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(fulcrumX, barY - 14);
      ctx.lineTo(muscleX, barY - 14);
      ctx.moveTo(fulcrumX, barY - 10);
      ctx.lineTo(fulcrumX, barY - 18);
      ctx.moveTo(muscleX, barY - 10);
      ctx.lineTo(muscleX, barY - 18);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = curColor;
      ctx.font = `bold ${7 * uiScale}px JetBrains Mono, monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(`bp = ${bp} cm`, (fulcrumX + muscleX) / 2, barY - 19);

      // Cota br
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1.0;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(fulcrumX, barY - 27);
      ctx.lineTo(loadX, barY - 27);
      ctx.moveTo(fulcrumX, barY - 23);
      ctx.lineTo(fulcrumX, barY - 31);
      ctx.moveTo(loadX, barY - 23);
      ctx.lineTo(loadX, barY - 31);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#d97706';
      ctx.fillText(`br = ${br} cm`, (fulcrumX + loadX) / 2, barY - 32);
      ctx.restore();

      // ─── 5. Panel Medidor de Ventaja Mecánica (Derecha) ───
      if (showVmPanel) {
      const cardX = W * 0.72;
      // Reserva la franja de controles superiores y evita invadir la anatomía.
      const cardY = Math.max(H * 0.18, 78);
      const cardW = Math.min(W * 0.25, 168);
      const cardH = 152;

      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.shadowColor = tokenRgba(T.ink, 0.10);
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardW, cardH, 6);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = curColor;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = curColor;
      ctx.font = `bold ${8.5 * uiScale}px Karla, system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('VENTAJA MECÁNICA', cardX + cardW / 2, cardY + 15);
      ctx.font = `bold ${7.5 * uiScale}px Karla, system-ui, sans-serif`;
      ctx.fillText('(VM)', cardX + cardW / 2, cardY + 27);

      ctx.font = `bold ${18 * uiScale}px JetBrains Mono, monospace`;
      ctx.fillText(`VM = ${vm.toFixed(2).replace('.', ',')}`, cardX + cardW / 2, cardY + 50);

      // Barra medidora de ventaja
      const barBoxW = cardW - 20;
      const barBoxH = 7;
      const barBoxX = cardX + 10;
      const barBoxY = cardY + 59;

      ctx.fillStyle = tokenRgba(T.ink3, 0.15);
      ctx.fillRect(barBoxX, barBoxY, barBoxW, barBoxH);

      const fillRatio = Math.min(1, Math.max(0.06, vm / 2.0));
      ctx.fillStyle = vm >= 1.0 ? '#2e8b57' : '#b02318';
      ctx.fillRect(barBoxX, barBoxY, barBoxW * fillRatio, barBoxH);
      ctx.strokeStyle = tokenRgba(T.ink2, 0.35);
      ctx.strokeRect(barBoxX, barBoxY, barBoxW, barBoxH);

      ctx.font = `bold ${7.5 * uiScale}px Karla, system-ui, sans-serif`;
      ctx.fillStyle = vm >= 1.0 ? '#2e8b57' : '#b02318';
      ctx.fillText(
        vm >= 1.0 ? '✓ Multiplica fuerza · VM > 1' : '⚠ Menor fuerza · VM < 1',
        cardX + cardW / 2,
        cardY + 80
      );

      ctx.font = `${7 * uiScale}px Karla, system-ui, sans-serif`;
      ctx.fillStyle = T.ink2;
      ctx.fillText(`Fm/W = ${(1 / vm).toFixed(1)} ×`, cardX + cardW / 2, cardY + 95);
      ctx.fillText(`bp ${bp} cm · br ${br} cm`, cardX + cardW / 2, cardY + 108);
      ctx.fillText(vm < 1.0 ? '⚡ Más velocidad distal' : '💪 Ahorro de fuerza', cardX + cardW / 2, cardY + 121);
      ctx.fillText(`Fm ${fMuscNewtons.toFixed(0)} N · ${(fMuscNewtons / 9.81).toFixed(1)} kgf`, cardX + cardW / 2, cardY + 136);
      ctx.restore();
      }

      // ─── 6. Cabecera Superior ───
      ctx.fillStyle = T.ink;
      ctx.font = `bold ${12.5 * uiScale}px Karla, system-ui, sans-serif`;
      ctx.textAlign = 'left';
      const shortClassName = leverClass === 1 ? 'INTERAPOYO' : (leverClass === 2 ? 'INTERRESIST.' : 'INTERPOTENCIA');
      ctx.fillText(`PALANCA ${leverClass}ª · ${shortClassName}`, W * 0.04, 56);

      ctx.fillStyle = tokenRgba(T.ink3, 0.9);
      ctx.font = `${8.5 * uiScale}px Karla, system-ui, sans-serif`;
      const shortAnatomy = leverClass === 1 ? 'Cuello / C1' : (leverClass === 2 ? 'Tobillo / metatarsos' : 'Codo / bíceps');
      ctx.fillText(`Anatomía: ${shortAnatomy} · Fm y W`, W * 0.04, 71);

      ctx.restore();
      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [leverClass, loadKg, curData, viewMode, showVmPanel]);

  return (
    <div className="cap2-raster-canvas" style={{ width: '100%', height: '100%', position: 'relative' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />

      <button
        type="button"
        className="lever-vm-toggle"
        onClick={() => setShowVmPanel((visible) => !visible)}
        aria-expanded={showVmPanel}
        title={showVmPanel ? 'Colapsar ventaja mecánica' : 'Mostrar ventaja mecánica'}
      >
        {showVmPanel ? '− VM' : '+ VM'}
      </button>
    </div>
  );
}
