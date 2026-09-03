import React, { useRef, useEffect, useState, useCallback } from 'react';

interface TorqueCanvasProps {
  theta: number;   // Ángulo en grados (0 a 360)
  rCm: number;     // Brazo en cm (20 a 100)
  fN: number;      // Fuerza en N (10 a 100)
  onUpdate?: (theta: number, rCm: number, fN: number) => void;
}

export default function TorqueCanvas({
  theta = 60,
  rCm = 70,
  fN = 60,
  onUpdate,
}: TorqueCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const animTimeRef = useRef<number>(0);
  const [isDraggingForce, setIsDraggingForce] = useState<boolean>(false);
  const [isHoveredForce, setIsHoveredForce] = useState<boolean>(false);

  // Cálculos reactivos de torque y componentes
  const rM = rCm / 100;
  const rad = (theta * Math.PI) / 180;
  const tau = rM * fN * Math.sin(rad); // N·m (+ antihorario CCW, - horario CW)
  const fPerp = fN * Math.sin(rad);
  const fParallel = fN * Math.cos(rad);
  const rPerp = rM * Math.abs(Math.sin(rad)); // Brazo de momento perpendicular

  const isCCW = tau > 0.05;
  const isCW = tau < -0.05;
  const tauColor = isCCW ? '#0d6e64' : (isCW ? '#b02318' : '#6b7885');

  // Interacción táctil y de arrastre del vector de fuerza
  const getPointerCoord = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0, rect: { width: 1, height: 1 } };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      rect,
    };
  };

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const { x, y, rect } = getPointerCoord(e);
    const pivotX = rect.width * 0.09;
    const pivotY = rect.height * 0.54;
    const rPx = (rCm / 100) * (rect.width * 0.40);
    const armEndX = pivotX + rPx;
    const armEndY = pivotY;

    const maxFLen = Math.max(38, rPx * 0.32);
    const fLenPx = 20 + (fN / 100) * (maxFLen - 20);
    const fEndX = armEndX + fLenPx * Math.cos(-rad);
    const fEndY = armEndY + fLenPx * Math.sin(-rad);

    const d = Math.hypot(x - fEndX, y - fEndY);
    if (d < 22) {
      setIsDraggingForce(true);
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch (_) {}
    }
  }, [rCm, fN, rad]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const { x, y, rect } = getPointerCoord(e);
    const pivotX = rect.width * 0.09;
    const pivotY = rect.height * 0.54;
    const rPx = (rCm / 100) * (rect.width * 0.40);
    const armEndX = pivotX + rPx;
    const armEndY = pivotY;

    const maxFLen = Math.max(38, rPx * 0.32);
    const fLenPx = 20 + (fN / 100) * (maxFLen - 20);
    const fEndX = armEndX + fLenPx * Math.cos(-rad);
    const fEndY = armEndY + fLenPx * Math.sin(-rad);

    const d = Math.hypot(x - fEndX, y - fEndY);

    if (!isDraggingForce) {
      setIsHoveredForce(d < 20);
    } else {
      const dx = x - armEndX;
      const dy = -(y - armEndY); // Invertir eje Y para cálculo polar
      let angle = (Math.atan2(dy, dx) * 180) / Math.PI;
      if (angle < 0) angle += 360;

      const pxLen = Math.hypot(dx, dy);
      const newF = Math.min(100, Math.max(10, ((pxLen - 20) / Math.max(1, maxFLen - 20)) * 100));

      if (onUpdate) {
        onUpdate(Math.round(angle), rCm, Math.round(newF));
      }
    }
  }, [isDraggingForce, rCm, fN, rad, onUpdate]);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isDraggingForce) {
      setIsDraggingForce(false);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch (_) {}
    }
  }, [isDraggingForce]);

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
      // Los rótulos del canvas se dibujan en píxeles CSS. En columnas
      // estrechas necesitan crecer para conservar legibilidad sin agrandar
      // las geometrías principales.
      // Mantener un mínimo de legibilidad también en ventanas amplias:
      // el canvas externo suele medir ~560 px y con escala 1 los rótulos
      // seguían siendo demasiado pequeños para lectura cómoda.
      const uiScale = Math.max(1.15, Math.min(1.45, 620 / Math.max(W, 1)));

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

      // Rejilla milimetrada técnica sutil
      ctx.strokeStyle = 'rgba(67, 80, 92, 0.045)';
      ctx.lineWidth = 1;
      const gStep = 34;
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

      // ─── 2. Posiciones Geométricas Principales ───
      // La escena se escala con el ancho útil. El factor anterior dejaba
      // el brazo demasiado pequeño en el navegador externo (~560 px).
      // Columna izquierda: diagrama de la palanca. Columna derecha (~35%): dial.
      const pivotX = W * 0.09;
      const pivotY = H * 0.54;
      const rPx = (rCm / 100) * (W * 0.40); // Longitud del brazo en px

      const armEndX = pivotX + rPx;
      const armEndY = pivotY;

      // Sombra de contacto difusa bajo la articulación y la palanca
      ctx.save();
      ctx.fillStyle = 'rgba(35, 44, 54, 0.14)';
      ctx.beginPath();
      ctx.ellipse(pivotX, pivotY + 22, 32, 8, 0, 0, Math.PI * 2);
      ctx.ellipse(armEndX, armEndY + 14, 22, 6, 0, 0, Math.PI * 2);
      ctx.ellipse((pivotX + armEndX) / 2, pivotY + 16, rPx * 0.5, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // ─── 3. Eje Articular / Fulcro Mecánico Anatómico ───
      ctx.save();
      // Base de soporte fija piramidal
      const baseGrad = ctx.createLinearGradient(pivotX - 24, pivotY, pivotX + 24, pivotY + 26);
      baseGrad.addColorStop(0, '#dfd2bc');
      baseGrad.addColorStop(0.5, '#cfc2a7');
      baseGrad.addColorStop(1, '#b5a585');
      ctx.fillStyle = baseGrad;
      ctx.strokeStyle = '#6d5e46';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(pivotX - 26, pivotY + 24);
      ctx.lineTo(pivotX + 26, pivotY + 24);
      ctx.lineTo(pivotX, pivotY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Placa de anclaje
      ctx.fillStyle = '#8c7a60';
      ctx.fillRect(pivotX - 30, pivotY + 24, 60, 4);

      // Rodamiento anular articular
      ctx.beginPath();
      ctx.arc(pivotX, pivotY, 13, 0, Math.PI * 2);
      ctx.fillStyle = '#f5ecd8';
      ctx.fill();
      ctx.strokeStyle = '#43505c';
      ctx.lineWidth = 2.2;
      ctx.stroke();

      // Cartílago articular anular (Ice-mint)
      ctx.strokeStyle = 'rgba(104, 197, 184, 0.85)';
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.arc(pivotX, pivotY, 9, 0, Math.PI * 2);
      ctx.stroke();

      // Perno joya central con pivote
      ctx.beginPath();
      ctx.arc(pivotX, pivotY, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = '#232c36';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();

      // ─── 4. Barra Ósea / Brazo de Palanca r ───
      ctx.save();
      const boneGrad = ctx.createLinearGradient(pivotX, pivotY - 9, pivotX, pivotY + 9);
      boneGrad.addColorStop(0, '#fbf6ec');
      boneGrad.addColorStop(0.35, '#f5ecd8');
      boneGrad.addColorStop(0.7, '#ede2ca');
      boneGrad.addColorStop(1, '#c5b593');
      ctx.fillStyle = boneGrad;
      ctx.strokeStyle = '#7c6a4e';
      ctx.lineWidth = 1.8;

      ctx.beginPath();
      ctx.roundRect(pivotX, pivotY - 8, rPx, 16, 6);
      ctx.fill();
      ctx.stroke();

      // Contorno perióstico longitudinal
      ctx.strokeStyle = 'rgba(124, 106, 78, 0.35)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pivotX + 8, pivotY - 3);
      ctx.lineTo(armEndX - 8, pivotY - 3);
      ctx.moveTo(pivotX + 8, pivotY + 3);
      ctx.lineTo(armEndX - 8, pivotY + 3);
      ctx.stroke();

      // Anclaje tendinoso distal nacarado en el punto de aplicación
      ctx.beginPath();
      ctx.arc(armEndX, armEndY, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#f5f0e6';
      ctx.fill();
      ctx.strokeStyle = '#7c6a4e';
      ctx.lineWidth = 1.6;
      ctx.stroke();

      // Cota de longitud r (Brazo del punto de aplicación)
      ctx.strokeStyle = 'rgba(107, 120, 133, 0.75)';
      ctx.lineWidth = 1.1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(pivotX, pivotY + 22);
      ctx.lineTo(pivotX, pivotY + 34);
      ctx.moveTo(armEndX, pivotY + 22);
      ctx.lineTo(armEndX, pivotY + 34);
      ctx.moveTo(pivotX, pivotY + 28);
      ctx.lineTo(armEndX, pivotY + 28);
      ctx.stroke();
      ctx.setLineDash([]);

      // Puntas de flecha de la cota r
      ctx.fillStyle = 'rgba(107, 120, 133, 0.9)';
      ctx.beginPath();
      ctx.moveTo(pivotX, pivotY + 28);
      ctx.lineTo(pivotX + 4, pivotY + 25.5);
      ctx.lineTo(pivotX + 4, pivotY + 30.5);
      ctx.closePath();
      ctx.moveTo(armEndX, pivotY + 28);
      ctx.lineTo(armEndX - 4, pivotY + 25.5);
      ctx.lineTo(armEndX - 4, pivotY + 30.5);
      ctx.closePath();
      ctx.fill();

      // Badge con valor r
      ctx.fillStyle = '#232c36';
      ctx.font = `bold ${7.5 * uiScale}px JetBrains Mono, monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(`r = ${rCm} cm (${rM.toFixed(2)} m)`, (pivotX + armEndX) / 2, pivotY + 41);
      ctx.restore();

      // ─── 5. Geometría Vectorial de Fuerza Aplicada F (Calibrada a 1/4 - 1/3 del brazo) ───
      const maxFLen = Math.max(38, rPx * 0.32);
      const fLenPx = 20 + (fN / 100) * (maxFLen - 20);
      const fEndX = armEndX + fLenPx * Math.cos(-rad);
      const fEndY = armEndY + fLenPx * Math.sin(-rad);

      const ufx = Math.cos(-rad);
      const ufy = Math.sin(-rad);

      // ─── 5b. Línea de acción de F (prolongada en ambos sentidos) ───
      // Es la recta sobre la que "resbala" la fuerza; el brazo de momento r⊥ se
      // mide perpendicular a ELLA desde el eje articular.
      ctx.save();
      ctx.strokeStyle = 'rgba(67, 80, 92, 0.45)';
      ctx.lineWidth = 1.1;
      ctx.setLineDash([4, 3]);
      const actExt = Math.max(fLenPx * 1.6, rPx * 0.5);
      ctx.beginPath();
      ctx.moveTo(armEndX - actExt * ufx, armEndY - actExt * ufy);
      ctx.lineTo(armEndX + actExt * ufx, armEndY + actExt * ufy);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // ─── 6. Brazo de momento perpendicular r⊥ = r · sin θ ───
      if (Math.abs(Math.sin(rad)) > 0.06) {
        ctx.save();
        // Pie de la perpendicular bajada desde el eje (pivot) a la línea de acción.
        const proj = (pivotX - armEndX) * ufx + (pivotY - armEndY) * ufy;
        const footX = armEndX + proj * ufx;
        const footY = armEndY + proj * ufy;

        // Segmento r⊥ (eje → pie), naranja, grueso y punteado
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 3]);
        ctx.beginPath();
        ctx.moveTo(pivotX, pivotY);
        ctx.lineTo(footX, footY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Glifo de ángulo recto en el pie (entre r⊥ y la línea de acción)
        const s = 6;
        const px = pivotX - footX, py = pivotY - footY;
        const pl = Math.hypot(px, py) || 1;
        const rx1 = px / pl, ry1 = py / pl;          // hacia el eje
        const dSign = proj >= 0 ? 1 : -1;
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.moveTo(footX + rx1 * s, footY + ry1 * s);
        ctx.lineTo(footX + rx1 * s + ufx * s * dSign, footY + ry1 * s + ufy * s * dSign);
        ctx.lineTo(footX + ufx * s * dSign, footY + ufy * s * dSign);
        ctx.stroke();

        // Punto en el pie
        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.arc(footX, footY, 2.4, 0, Math.PI * 2);
        ctx.fill();

        // Etiqueta r⊥ cerca del pie (sobre la línea de acción), con fondo, para
        // no chocar con la cota "r = .. cm" que va bajo el hueso.
        const lx = pivotX + (footX - pivotX) * 0.66 - ry1 * 14 * dSign;
        const ly = pivotY + (footY - pivotY) * 0.66 + rx1 * 14 * dSign;
        const rlTxt = `r⊥ = ${rPerp.toFixed(2)} m`;
        ctx.font = `bold ${7.5 * uiScale}px JetBrains Mono, monospace`;
        ctx.textAlign = 'center';
        const rlW = ctx.measureText(rlTxt).width + 8;
        ctx.fillStyle = 'rgba(255, 250, 242, 0.92)';
        ctx.beginPath();
        ctx.roundRect(lx - rlW / 2, ly - 7 * uiScale, rlW, 12 * uiScale, 3);
        ctx.fill();
        ctx.fillStyle = '#b8690f';
        ctx.fillText(rlTxt, lx, ly + 3);
        ctx.restore();
      }

      // ─── 7. Desglose de Componentes Ortogonales F_perp y F_parallel ───
      const fParX = armEndX + fLenPx * Math.cos(-rad);
      const fParY = armEndY;

      ctx.save();
      // Caja de descomposición rectangular
      ctx.strokeStyle = 'rgba(107, 120, 133, 0.35)';
      ctx.lineWidth = 1.0;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(armEndX, armEndY);
      ctx.lineTo(fParX, fParY);
      ctx.lineTo(fEndX, fEndY);
      ctx.moveTo(armEndX, armEndY);
      ctx.lineTo(armEndX, fEndY);
      ctx.lineTo(fEndX, fEndY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Vector F_parallel
      ctx.strokeStyle = 'rgba(107, 120, 133, 0.85)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(armEndX, armEndY);
      ctx.lineTo(fParX, fParY);
      ctx.stroke();

      // Flecha F_parallel
      if (Math.abs(fParallel) > 3) {
        const parDir = fParallel >= 0 ? 1 : -1;
        ctx.fillStyle = 'rgba(107, 120, 133, 0.9)';
        ctx.beginPath();
        ctx.moveTo(fParX, fParY);
        ctx.lineTo(fParX - parDir * 4.5, fParY - 3);
        ctx.lineTo(fParX - parDir * 4.5, fParY + 3);
        ctx.closePath();
        ctx.fill();
      }

      // Badge F_parallel
      ctx.fillStyle = '#43505c';
      ctx.font = `bold ${7 * uiScale}px JetBrains Mono, monospace`;
      ctx.textAlign = 'center';
      const parLabel = fParallel >= 0 ? `F∥ = ${fParallel.toFixed(1)} N` : `F∥ = ${Math.abs(fParallel).toFixed(1)} N`;
      ctx.fillText(parLabel, (armEndX + fParX) / 2, armEndY + (fEndY < armEndY ? 11 : -7));

      // 2. Componente perpendicular F_perp (tangencial: genera 100% torque)
      ctx.strokeStyle = tauColor;
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(armEndX, armEndY);
      ctx.lineTo(armEndX, fEndY);
      ctx.stroke();

      // Flecha F_perp
      if (Math.abs(fPerp) > 3) {
        const perpDir = fPerp >= 0 ? -1 : 1; // En pantalla -Y es hacia arriba
        ctx.fillStyle = tauColor;
        ctx.beginPath();
        ctx.moveTo(armEndX, fEndY);
        ctx.lineTo(armEndX - 3, fEndY - perpDir * 4.5);
        ctx.lineTo(armEndX + 3, fEndY - perpDir * 4.5);
        ctx.closePath();
        ctx.fill();
      }

      // Badge F_perp
      ctx.fillStyle = tauColor;
      ctx.font = `bold ${7 * uiScale}px JetBrains Mono, monospace`;
      ctx.textAlign = 'right';
      ctx.fillText(`F⊥ = ${Math.abs(fPerp).toFixed(1)} N`, armEndX - 6, (armEndY + fEndY) / 2);
      ctx.restore();

      // ─── 8. Vector de Fuerza Total F con Mango de Arrastre ───
      ctx.save();
      if (isHoveredForce || isDraggingForce) {
        ctx.shadowColor = tauColor;
        ctx.shadowBlur = 8;
      }
      ctx.strokeStyle = tauColor;
      ctx.lineWidth = isDraggingForce ? 3.2 : (isHoveredForce ? 2.8 : 2.4);
      ctx.beginPath();
      ctx.moveTo(armEndX, armEndY);
      ctx.lineTo(fEndX, fEndY);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Cabeza de flecha elegante
      const fAngle = Math.atan2(fEndY - armEndY, fEndX - armEndX);
      const headSize = Math.min(8, Math.max(5.5, fLenPx * 0.13));
      ctx.fillStyle = tauColor;
      ctx.beginPath();
      ctx.moveTo(fEndX, fEndY);
      ctx.lineTo(fEndX - headSize * Math.cos(fAngle - Math.PI / 6), fEndY - headSize * Math.sin(fAngle - Math.PI / 6));
      ctx.lineTo(fEndX - headSize * 0.6 * Math.cos(fAngle), fEndY - headSize * 0.6 * Math.sin(fAngle));
      ctx.lineTo(fEndX - headSize * Math.cos(fAngle + Math.PI / 6), fEndY - headSize * Math.sin(fAngle + Math.PI / 6));
      ctx.closePath();
      ctx.fill();

      // Mango interactivo esmerilado en la punta
      ctx.beginPath();
      ctx.arc(fEndX, fEndY, isDraggingForce ? 5 : (isHoveredForce ? 4 : 3), 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = tauColor;
      ctx.lineWidth = 1.6;
      ctx.stroke();

      // Badge flotante compacto con F y ángulo theta.
      // Se mantiene dentro del lienzo y a la izquierda de la columna del dial.
      const fLabelDist = 16 * uiScale;
      const badgeW = 68 * uiScale;
      const badgeH = 20 * uiScale;
      const dialColX = W * 0.62; // borde izquierdo de la columna del medidor
      let flx = fEndX + Math.cos(fAngle) * fLabelDist;
      let fly = fEndY + Math.sin(fAngle) * fLabelDist;
      flx = Math.max(badgeW / 2 + 4, Math.min(flx, dialColX - badgeW / 2 - 4));
      fly = Math.max(badgeH / 2 + 4, Math.min(fly, H - badgeH / 2 - 4));
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.shadowColor = 'rgba(35, 44, 54, 0.10)';
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.roundRect(flx - badgeW / 2, fly - badgeH / 2, badgeW, badgeH, 4);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = tauColor;
      ctx.lineWidth = 1.1;
      ctx.stroke();

      ctx.fillStyle = tauColor;
      ctx.font = `bold ${7.5 * uiScale}px JetBrains Mono, monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(`F = ${fN.toFixed(0)} N`, flx, fly);
      ctx.font = `${6.5 * uiScale}px Karla, system-ui, sans-serif`;
      ctx.fillStyle = '#43505c';
      ctx.fillText(`θ = ${theta}°`, flx, fly + 7);
      ctx.restore();

      // ─── 9. Arco Angular θ en la Inserción ───
      ctx.save();
      const arcR = 22;
      ctx.strokeStyle = 'rgba(67, 80, 92, 0.65)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(armEndX, armEndY, arcR, 0, -rad, rad > 0);
      ctx.stroke();

      // Línea de referencia horizontal continua
      ctx.strokeStyle = 'rgba(107, 120, 133, 0.4)';
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(armEndX, armEndY);
      ctx.lineTo(armEndX + 30, armEndY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // ─── 10. Arco de Rotación Dinámico Alrededor del Fulcro (sutil) ───
      if (Math.abs(tau) > 0.05) {
        ctx.save();
        ctx.globalAlpha = 0.4;
        const rotR = 30;
        const spinSpeed = isCCW ? -t * 1.6 : t * 1.6;
        ctx.strokeStyle = tauColor;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(pivotX, pivotY, rotR, spinSpeed, spinSpeed + Math.PI * 0.7);
        ctx.stroke();
        const arrowAngle = spinSpeed + (isCCW ? 0 : Math.PI * 0.7);
        const ax = pivotX + rotR * Math.cos(arrowAngle);
        const ay = pivotY + rotR * Math.sin(arrowAngle);
        ctx.fillStyle = tauColor;
        ctx.beginPath();
        ctx.arc(ax, ay, 2.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // ─── 11. Medidor de torque (columna derecha, estilo diagramas 2D de cap. 1) ───
      const dialR = Math.min(W * 0.145, H * 0.215);
      const dialX = W * 0.80;
      const dialY = Math.max(dialR + 26 * uiScale, H * 0.44);
      const maxTorque = 60;
      const startAngle = Math.PI * 0.8;   // arco abierto por abajo
      const endAngle = Math.PI * 2.2;
      const spanAngle = endAngle - startAngle;
      const zeroAngle = startAngle + spanAngle * 0.5;
      const toAngle = (v: number) =>
        zeroAngle + (Math.max(-maxTorque, Math.min(maxTorque, v)) / maxTorque) * (spanAngle * 0.5);

      ctx.save();
      ctx.lineCap = 'round';

      // Zonas de signo: horario (−) rojo tenue a la izq, antihorario (+) teal tenue a la der
      ctx.beginPath();
      ctx.arc(dialX, dialY, dialR, startAngle, zeroAngle);
      ctx.strokeStyle = 'rgba(176, 35, 24, 0.16)';
      ctx.lineWidth = 9;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(dialX, dialY, dialR, zeroAngle, endAngle);
      ctx.strokeStyle = 'rgba(13, 110, 100, 0.16)';
      ctx.lineWidth = 9;
      ctx.stroke();

      // Sector activo (de cero al valor actual) en color pleno
      const curAngle = toAngle(tau);
      ctx.beginPath();
      ctx.arc(dialX, dialY, dialR, Math.min(zeroAngle, curAngle), Math.max(zeroAngle, curAngle));
      ctx.strokeStyle = tauColor;
      ctx.lineWidth = 9;
      ctx.stroke();

      // Marca de cero (arriba)
      ctx.strokeStyle = 'rgba(67, 80, 92, 0.55)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(dialX + Math.cos(zeroAngle) * (dialR - 8), dialY + Math.sin(zeroAngle) * (dialR - 8));
      ctx.lineTo(dialX + Math.cos(zeroAngle) * (dialR + 6), dialY + Math.sin(zeroAngle) * (dialR + 6));
      ctx.stroke();

      // Etiquetas de sentido en los extremos del arco
      ctx.font = `${6.5 * uiScale}px Karla, system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(176, 35, 24, 0.75)';
      ctx.fillText('↻ −', dialX + Math.cos(startAngle) * (dialR + 12), dialY + Math.sin(startAngle) * (dialR + 12) + 3);
      ctx.fillStyle = 'rgba(13, 110, 100, 0.8)';
      ctx.fillText('↺ +', dialX + Math.cos(endAngle) * (dialR + 12), dialY + Math.sin(endAngle) * (dialR + 12) + 3);

      // Aguja
      ctx.strokeStyle = tauColor;
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(dialX - Math.cos(curAngle) * 8, dialY - Math.sin(curAngle) * 8);
      ctx.lineTo(dialX + Math.cos(curAngle) * (dialR - 4), dialY + Math.sin(curAngle) * (dialR - 4));
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(dialX, dialY, 5, 0, Math.PI * 2);
      ctx.fillStyle = tauColor;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.6;
      ctx.stroke();

      // Lectura grande en el centro
      const signStr = tau > 0.05 ? '+' : (tau < -0.05 ? '−' : '');
      ctx.fillStyle = tauColor;
      ctx.font = `bold ${17 * uiScale}px JetBrains Mono, monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(`${signStr}${Math.abs(tau).toFixed(1)}`, dialX, dialY + dialR * 0.42);
      ctx.font = `bold ${8.5 * uiScale}px Karla, system-ui, sans-serif`;
      ctx.fillStyle = 'rgba(67, 80, 92, 0.8)';
      ctx.fillText('N·m', dialX, dialY + dialR * 0.42 + 13 * uiScale);
      ctx.font = `bold ${7.5 * uiScale}px Karla, system-ui, sans-serif`;
      ctx.fillStyle = tauColor;
      const senseTxt = isCCW ? 'ANTIHORARIO' : (isCW ? 'HORARIO' : 'SIN GIRO');
      ctx.fillText(senseTxt, dialX, dialY + dialR * 0.42 + 24 * uiScale);
      ctx.restore();

      // ─── 12. Pista de interacción (discreta, esquina inferior) ───
      ctx.fillStyle = 'rgba(107, 120, 133, 0.75)';
      ctx.font = `${7 * uiScale}px Karla, system-ui, sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText('Arrastra la punta de F para cambiar θ y magnitud', W * 0.04, H - 10);

      ctx.restore();
      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [theta, rCm, fN, rad, tau, fPerp, fParallel, rPerp, isCCW, isCW, tauColor, isDraggingForce, isHoveredForce]);

  return (
    <div className="cap2-raster-canvas" style={{ width: '100%', height: '100%', position: 'relative', cursor: isDraggingForce ? 'grabbing' : (isHoveredForce ? 'grab' : 'default') }}>
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ width: '100%', height: '100%', display: 'block', touchAction: 'none' }}
      />
    </div>
  );
}
