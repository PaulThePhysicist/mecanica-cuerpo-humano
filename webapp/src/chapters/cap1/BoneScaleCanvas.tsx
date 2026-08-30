import React, { useRef, useEffect } from 'react';

interface BoneScaleCanvasProps {
  selectedAnimal?: string | null;
  isAllometric: boolean;
  onSelectAnimal?: (id: string) => void;
}

interface BoneSpec {
  id: string;
  name: string;
  emoji: string;
  massKg: number;
  lengthMm: number;
  wlRatio: number;
  color: string;
}

const BONE_SPECS: Record<string, BoneSpec> = {
  rat: { id: 'rat', name: 'Rata', emoji: '🐀', massKg: 0.25, lengthMm: 35, wlRatio: 1.0, color: '#2e8b57' },
  horse: { id: 'horse', name: 'Caballo', emoji: '🐎', massKg: 500, lengthMm: 450, wlRatio: 1.7, color: '#a35c00' },
  elephant: { id: 'elephant', name: 'Elefante', emoji: '🐘', massKg: 5000, lengthMm: 1100, wlRatio: 4.0, color: '#6d5fbf' },
};

export default function BoneScaleCanvas({
  selectedAnimal = 'elephant',
  isAllometric = true,
  onSelectAnimal,
}: BoneScaleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const animTimeRef = useRef<number>(0);

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
      const scale = Math.max(1, Math.min(1.55, W / 420));
      const scaled = (size: number) => size * scale;

      if (canvas.width !== W * dpr || canvas.height !== H * dpr) {
        canvas.width = W * dpr;
        canvas.height = H * dpr;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, W, H);

      // ─── 1. Fondo de estudio anatómico con viñeta cálida ───
      const bgGrad = ctx.createRadialGradient(W * 0.5, H * 0.45, 30, W * 0.5, H * 0.5, Math.max(W, H) * 0.75);
      bgGrad.addColorStop(0, '#f8f3e8');
      bgGrad.addColorStop(0.55, '#f1eadc');
      bgGrad.addColorStop(1, '#eee4d2');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // Reservamos una franja inferior para las métricas y los controles del visor.
      // En la vista estrecha esto evita que las etiquetas queden bajo el panel HUD.
      const compact = W < 390;
      const floorY = H * (compact ? 0.69 : 0.75);
      ctx.strokeStyle = 'rgba(207, 195, 169, 0.7)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(W * 0.05, floorY);
      ctx.lineTo(W * 0.95, floorY);
      ctx.stroke();

      // Sombra global del piso
      const shadowGrad = ctx.createLinearGradient(0, floorY, 0, floorY + 18);
      shadowGrad.addColorStop(0, 'rgba(35, 44, 54, 0.08)');
      shadowGrad.addColorStop(1, 'rgba(35, 44, 54, 0)');
      ctx.fillStyle = shadowGrad;
      ctx.fillRect(W * 0.05, floorY, W * 0.9, 18);

      // ─── 2. Render de los 3 Fémures Biomecánicos ───
      const keys = ['rat', 'horse', 'elephant'];
      const colW = W / 3;

      keys.forEach((k, i) => {
        const spec = BONE_SPECS[k];
        const isSel = selectedAnimal === k;
        const cx = colW * (i + 0.5);

        // Longitudes normalizadas para visualización comparativa
        const boneH = H * (compact ? (0.22 + i * 0.12) : (0.25 + i * 0.14));
        const topY = floorY - boneH;

        // Grosor diafisario base
        const baseW = Math.max(5, Math.min(10, W * 0.028));
        const wIso = baseW * (1 + i * 0.45); // Escala lineal: el ancho crece como L
        const wAllo = baseW * spec.wlRatio; // Escala estructural: w/L aumenta con la masa
        const curW = isAllometric ? wAllo : wIso;

        // Cálculo de Esfuerzo de Compresión σ = F / Area = mg / (π r²)
        // Para rata: ~32 MPa
        // Para caballo: alométrico ~34 MPa / isométrico ~85 MPa
        // Para elefante: alométrico ~36 MPa / isométrico ~215 MPa (> 150 MPa rotura!)
        let stressMPa = 32;
        if (!isAllometric) {
          if (k === 'horse') stressMPa = 88;
          if (k === 'elephant') stressMPa = 215;
        } else {
          stressMPa = 32 + i * 2;
        }

        const isFractured = stressMPa >= 150;

        // ─── Sombra de contacto individual en el suelo ───
        ctx.save();
        ctx.fillStyle = isSel ? 'rgba(13, 110, 100, 0.35)' : 'rgba(35, 44, 54, 0.22)';
        ctx.beginPath();
        ctx.ellipse(cx, floorY + 2, curW * 2.2, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // ─── Halo de selección ───
        if (isSel) {
          ctx.save();
          const halo = ctx.createRadialGradient(cx, topY + boneH / 2, 10, cx, topY + boneH / 2, boneH * 0.65);
          halo.addColorStop(0, isFractured ? 'rgba(176, 35, 24, 0.15)' : 'rgba(13, 110, 100, 0.12)');
          halo.addColorStop(1, 'rgba(13, 110, 100, 0)');
          ctx.fillStyle = halo;
          ctx.fillRect(cx - colW * 0.45, topY - 20, colW * 0.9, boneH + 40);
          ctx.restore();
        }

        // ─── Fantasma isométrico de referencia si estamos en modo alométrico ───
        if (isAllometric && k !== 'rat') {
          ctx.save();
          ctx.strokeStyle = 'rgba(67, 80, 92, 0.55)';
          ctx.lineWidth = 1.2;
          ctx.setLineDash([4, 4]);
          drawDetailedFemur(ctx, cx, topY, floorY, wIso, '#43505c', false, false);
          ctx.stroke();
          ctx.restore();
        }

        // ─── Dibujo del Fémur Principal con Textura y Mapa de Esfuerzo ───
        ctx.save();
        const stressColor = stressMPa < 50 ? '#2e8b57' : (stressMPa < 120 ? '#d97706' : '#b02318');
        drawDetailedFemur(ctx, cx, topY, floorY, curW, stressColor, true, isFractured);
        ctx.restore();

        // ─── Líneas de Fractura Animadas si se sobrepasa el límite elástico ───
        if (isFractured) {
          const midY = topY + boneH * 0.55;
          const crackPhase = Math.sin(t * 8) * 1.5;

          ctx.save();
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(cx - curW * 0.8, midY - 6);
          ctx.lineTo(cx - curW * 0.2 + crackPhase, midY + 2);
          ctx.lineTo(cx + curW * 0.3 - crackPhase, midY - 2);
          ctx.lineTo(cx + curW * 0.85, midY + 8);
          ctx.stroke();

          ctx.strokeStyle = '#b02318';
          ctx.lineWidth = 1.6;
          ctx.stroke();
          ctx.restore();

          // Badge de Advertencia de Fractura
          ctx.save();
          const pulse = 0.5 + 0.5 * Math.sin(t * 6);
          ctx.fillStyle = `rgba(176, 35, 24, ${0.85 + pulse * 0.15})`;
          ctx.fillRect(cx - 52, midY - 14, 104, 18);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1;
          ctx.strokeRect(cx - 52, midY - 14, 104, 18);

          ctx.fillStyle = '#ffffff';
          ctx.font = (compact ? 'bold 11px' : 'bold 12px') + ' Karla, system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`⚠️ FRACTURA: ${stressMPa} MPa`, cx, midY - 2);
          ctx.restore();
        }

        // ─── Vector de Carga Compresiva (Flecha de Peso F = m·g) ───
        ctx.save();
        const arrowH = Math.min(32, 14 + i * 8);
        const arrowY = topY - arrowH - 8;
        ctx.strokeStyle = isFractured ? '#b02318' : 'var(--teal-deep, #0d6e64)';
        ctx.lineWidth = isSel ? 2.5 : 1.8;
        ctx.beginPath();
        ctx.moveTo(cx, arrowY);
        ctx.lineTo(cx, topY - 6);
        ctx.lineTo(cx - 4, topY - 12);
        ctx.moveTo(cx, topY - 6);
        ctx.lineTo(cx + 4, topY - 12);
        ctx.stroke();

        ctx.fillStyle = isFractured ? '#b02318' : '#0d6e64';
        ctx.font = (compact ? 'bold 12px' : 'bold 12.5px') + ' JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(spec.massKg >= 1000 ? `${(spec.massKg / 1000).toFixed(0)} ton` : `${spec.massKg} kg`, cx, arrowY - 3);
        ctx.restore();

        // ─── Tarjeta Inferior de la Especie ───
        ctx.save();
        ctx.font = `${isSel ? 'bold ' : ''}${scaled(isSel ? 14 : 13)}px Karla, system-ui, sans-serif`;
        ctx.fillStyle = isSel ? spec.color : '#232c36';
        ctx.textAlign = 'center';
        ctx.fillText(`${spec.emoji} ${spec.name}`, cx, floorY + 22);

        ctx.font = `bold ${scaled(11)}px JetBrains Mono, monospace`;
        ctx.fillStyle = isFractured ? '#b02318' : (stressMPa < 50 ? '#0d6e64' : '#a35c00');
        ctx.fillText(`σ ${stressMPa} MPa · ${isFractured ? 'CRÍTICO' : 'OK'}`, cx, floorY + 35);

        ctx.font = `${scaled(10)}px Karla, system-ui, sans-serif`;
        ctx.fillStyle = '#17212b';
        ctx.fillText(`Relación w/L ≈ ${spec.wlRatio.toFixed(1).replace('.', ',')}`, cx, floorY + 47);
        ctx.restore();
      });

      // ─── 3. Cabecera e Instrucciones Superiores ───
      ctx.fillStyle = '#232c36';
      ctx.font = `bold ${scaled(14)}px Karla, system-ui, sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText(
        isAllometric
          ? 'ESCALA ALOMÉTRICA (w ∝ L³ᐟ²)'
          : '⚠️ ESCALA ISOMÉTRICA: FRACTURA DEL ELEFANTE',
        W * 0.05,
        22
      );

      ctx.fillStyle = '#17212b';
      ctx.font = `${scaled(11.5)}px Karla, system-ui, sans-serif`;
      ctx.fillText(
        'Peso ∝ L³  ·  resistencia ∝ w²  ·  w/L ∝ mᵦ¹ᐟ⁶',
        W * 0.05,
        36
      );

      // Leyenda compacta: hace explícita la lectura de los dos modelos superpuestos.
      const legendY = compact ? 58 : 62;
      ctx.font = `${scaled(11)}px Karla, system-ui, sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillStyle = '#17212b';
      ctx.fillText('Lectura:', W * 0.05, legendY);
      ctx.fillStyle = '#17212b';
      ctx.setLineDash([4, 3]);
      ctx.beginPath(); ctx.moveTo(W * 0.18, legendY - 3); ctx.lineTo(W * 0.23, legendY - 3); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillText('isométrico', W * 0.245, legendY);
      ctx.fillStyle = '#0d6e64';
      ctx.fillRect(W * 0.48, legendY - 7, 10, 7);
      ctx.fillStyle = '#17212b';
      ctx.fillText('alométrico', W * 0.52, legendY);

      ctx.restore();
      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [selectedAnimal, isAllometric]);

  // Función artesanal para dibujar la anatomía detallada del fémur
  function drawDetailedFemur(
    ctx: CanvasRenderingContext2D,
    cx: number,
    topY: number,
    bottomY: number,
    w: number,
    stressColor: string,
    fill: boolean,
    isFractured: boolean
  ) {
    const headR = w * 1.05;
    const condyleR = w * 0.95;
    const neckLen = w * 0.8;

    ctx.beginPath();
    // Cabeza femoral (articulación coxofemoral superior)
    ctx.moveTo(cx - w * 0.6, topY + w * 0.3);
    ctx.quadraticCurveTo(cx - w * 1.4, topY - headR * 0.4, cx - w * 0.3, topY - headR * 0.6);
    ctx.quadraticCurveTo(cx + headR * 0.4, topY - headR * 0.7, cx + w * 0.8, topY);
    // Trocánter mayor y línea intertrocantérea
    ctx.quadraticCurveTo(cx + w * 1.5, topY + w * 0.6, cx + w * 0.7, topY + w * 1.2);
    // Diáfisis lateral
    ctx.quadraticCurveTo(cx + w * 0.5, (topY + bottomY) / 2, cx + w * 0.85, bottomY - condyleR);
    // Cóndilo lateral y tróclea inferior
    ctx.quadraticCurveTo(cx + condyleR * 1.4, bottomY + 2, cx + condyleR * 0.3, bottomY + 3);
    ctx.quadraticCurveTo(cx, bottomY - condyleR * 0.3, cx - condyleR * 0.3, bottomY + 3);
    // Cóndilo medial
    ctx.quadraticCurveTo(cx - condyleR * 1.4, bottomY + 2, cx - w * 0.85, bottomY - condyleR);
    // Diáfisis medial
    ctx.quadraticCurveTo(cx - w * 0.5, (topY + bottomY) / 2, cx - w * 0.7, topY + w * 1.2);
    ctx.closePath();

    if (fill) {
      // Degradado óseo realista con mapa de esfuerzo
      const boneGrad = ctx.createLinearGradient(cx - w, topY, cx + w, bottomY);
      boneGrad.addColorStop(0, isFractured ? '#ffcccc' : '#e6d4ae');
      boneGrad.addColorStop(0.35, isFractured ? '#fca5a5' : '#d4bd8d');
      boneGrad.addColorStop(0.7, isFractured ? '#ef4444' : '#b99a68');
      boneGrad.addColorStop(1, isFractured ? '#b91c1c' : '#8f6f43');

      ctx.fillStyle = boneGrad;
      ctx.shadowColor = 'rgba(35, 44, 54, 0.18)';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Canal medular interno (corte anatómico sutil)
      ctx.save();
      ctx.strokeStyle = isFractured ? 'rgba(185, 28, 28, 0.5)' : 'rgba(163, 140, 100, 0.35)';
      ctx.lineWidth = Math.max(1.5, w * 0.3);
      ctx.beginPath();
      ctx.moveTo(cx, topY + w * 1.5);
      ctx.lineTo(cx, bottomY - w * 1.2);
      ctx.stroke();
      ctx.restore();

      // Borde anatómico cortical
      ctx.strokeStyle = isFractured ? '#991b1b' : '#604728';
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }
  }

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const colW = rect.width / 3;
    const idx = Math.floor(x / colW);
    const keys = ['rat', 'horse', 'elephant'];
    if (keys[idx] && onSelectAnimal) {
      onSelectAnimal(keys[idx]);
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <canvas
        ref={canvasRef}
        onClick={handleClick}
        style={{ width: '100%', height: '100%', display: 'block', cursor: 'pointer' }}
      />
    </div>
  );
}
