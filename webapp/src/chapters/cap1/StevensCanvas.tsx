import React, { useRef, useEffect, useState } from 'react';

interface StevensCanvasProps {
  n: number;
  selectedSensation?: string;
  showAllCurves?: boolean;
}

interface SensationInfo {
  id: string;
  name: string;
  emoji: string;
  n: number;
  color: string;
  unit: string;
  desc: string;
}

const SENSATIONS: Record<string, SensationInfo> = {
  brillo: { id: 'brillo', name: 'Brillo visual', emoji: '💡', n: 0.33, color: '#eab308', unit: 'Lux (cd/m²)', desc: 'Compresión óptica retiniana' },
  sonoridad: { id: 'sonoridad', name: 'Sonoridad (1 kHz)', emoji: '🔊', n: 0.54, color: '#0d8577', unit: 'Presión acústica (dB)', desc: 'Compresión logarítmica coclear' },
  olor: { id: 'olor', name: 'Olor (Heptano)', emoji: '👃', n: 0.55, color: '#10b981', unit: 'Concentración (ppm)', desc: 'Saturación de quimiorreceptores' },
  vibracion: { id: 'vibracion', name: 'Vibración táctil', emoji: '📳', n: 0.60, color: '#6366f1', unit: 'Amplitud 60 Hz (μm)', desc: 'Corpúsculos de Pacini/Meissner' },
  presion: { id: 'presion', name: 'Presión palmar', emoji: '✋', n: 1.10, color: '#0d6e64', unit: 'Fuerza aplicada (N)', desc: 'Detección proporcional de agarre' },
  pesadez: { id: 'pesadez', name: 'Pesadez (Levantar)', emoji: '🏋️', n: 1.45, color: '#d97706', unit: 'Masa levantada (kg)', desc: 'Fatiga neuromuscular progresiva' },
  descarga: { id: 'descarga', name: 'Descarga eléctrica', emoji: '⚡', n: 3.50, color: '#b02318', unit: 'Corriente 60 Hz (mA)', desc: 'Alarma nociceptiva superlineal extrema' },
};

const SUPERSCRIPT: Record<string, string> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
  '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
  '-': '⁻', '.': '·', ',': '·',
};

function toSuperscript(value: string) {
  return [...value].map((char) => SUPERSCRIPT[char] ?? char).join('');
}

export default function StevensCanvas({
  n,
  selectedSensation = 'sonoridad',
  showAllCurves = true,
}: StevensCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const animTimeRef = useRef<number>(0);
  const [stimulusS, setStimulusS] = useState<number>(2.0);

  const activeSens = SENSATIONS[selectedSensation] || SENSATIONS.sonoridad;

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
      const bgGrad = ctx.createRadialGradient(W * 0.45, H * 0.45, 20, W * 0.5, H * 0.5, Math.max(W, H) * 0.75);
      bgGrad.addColorStop(0, '#f8f3e8');
      bgGrad.addColorStop(0.55, '#f1eadc');
      bgGrad.addColorStop(1, '#eee4d2');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // ─── 2. Dimensiones del Gráfico Psicofísico ───
      const pad = { top: 46, bottom: 42, left: 52, right: 180 };
      const plotW = W - pad.left - pad.right;
      const plotH = H - pad.top - pad.bottom;

      const s0 = 0.5;
      const sMax = 4.5;
      const pMax = Math.pow(sMax - s0, Math.max(1, n));

      const xFromS = (sVal: number) => pad.left + (sVal / sMax) * plotW;
      const yFromP = (pVal: number) => pad.top + plotH - (Math.max(0, pVal) / pMax) * plotH;

      // Rejilla de fondo
      ctx.strokeStyle = 'rgba(67, 80, 92, 0.08)';
      ctx.lineWidth = 1;
      for (let sStep = 1; sStep <= 4; sStep++) {
        const sx = xFromS(sStep);
        ctx.beginPath();
        ctx.moveTo(sx, pad.top);
        ctx.lineTo(sx, pad.top + plotH);
        ctx.stroke();

        ctx.fillStyle = '#43505c';
        ctx.font = `${scaled(11)}px JetBrains Mono, monospace`;
        ctx.textAlign = 'center';
        ctx.fillText(`${sStep}S₀`, sx, pad.top + plotH + 14);
      }

      // Marco del gráfico
      ctx.strokeStyle = 'rgba(35, 44, 54, 0.35)';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(pad.left, pad.top, plotW, plotH);

      // Umbral sensorial S0
      const s0x = xFromS(s0);
      ctx.save();
      ctx.strokeStyle = '#b02318';
      ctx.lineWidth = 1.4;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(s0x, pad.top);
      ctx.lineTo(s0x, pad.top + plotH);
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = '#b02318';
      ctx.font = `bold ${scaled(10.5)}px Karla, system-ui, sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText('Umbral S₀ = 0,5', s0x + 4, pad.top + 14);

      // Línea de referencia lineal pura (n = 1.0)
      ctx.save();
      ctx.strokeStyle = 'rgba(67, 80, 92, 0.48)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(s0x, pad.top + plotH);
      ctx.lineTo(xFromS(sMax), yFromP(sMax - s0));
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = '#43505c';
      ctx.font = `italic ${scaled(10)}px Karla, system-ui, sans-serif`;
      ctx.textAlign = 'right';
      ctx.fillText('Lineal (n = 1,0)', pad.left + plotW - 8, yFromP(sMax - s0) - 6);

      // ─── 3. Dibujo de Todas las Curvas Sensoriales o de la Activa ───
      if (showAllCurves) {
        Object.values(SENSATIONS).forEach((sens) => {
          if (sens.id === selectedSensation) return; // Se dibuja después resaltada
          ctx.save();
          ctx.strokeStyle = sens.color;
          ctx.lineWidth = 1.2;
          ctx.globalAlpha = 0.35;
          ctx.beginPath();
          for (let step = 0; step <= 80; step++) {
            const sVal = s0 + (step / 80) * (sMax - s0);
            const pVal = Math.pow(sVal - s0, sens.n);
            const x = xFromS(sVal);
            const y = yFromP(pVal);
            if (step === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
          ctx.restore();
        });
      }

      // Curva principal activa con Glow
      ctx.save();
      const nColor = n < 0.95 ? '#d97706' : (n > 1.05 ? '#b02318' : '#0d6e64');
      ctx.shadowColor = nColor;
      ctx.shadowBlur = 8;
      ctx.strokeStyle = nColor;
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      for (let step = 0; step <= 120; step++) {
        const sVal = s0 + (step / 120) * (sMax - s0);
        const pVal = Math.pow(sVal - s0, n);
        const x = xFromS(sVal);
        const y = yFromP(pVal);
        if (step === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();

      // ─── 4. Puntos de Duplicación del Estímulo (S y 2S) ───
      const sRef = 1.5;
      const sDouble = 3.0; // 2 * sRef
      const pRef = Math.pow(Math.max(0, sRef - s0), n);
      const pDouble = Math.pow(Math.max(0, sDouble - s0), n);
      const ratioPerceived = pRef > 0 ? (pDouble / pRef) : Math.pow(2, n);

      const refX = xFromS(sRef);
      const refY = yFromP(pRef);
      const dblX = xFromS(sDouble);
      const dblY = yFromP(pDouble);

      // Línea conectora entre S y 2S
      ctx.save();
      ctx.strokeStyle = 'rgba(13, 110, 100, 0.45)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(refX, refY);
      ctx.lineTo(dblX, dblY);
      ctx.stroke();

      // Marcadores de punto
      ctx.fillStyle = nColor;
      ctx.beginPath();
      ctx.arc(refX, refY, 4.5, 0, Math.PI * 2);
      ctx.arc(dblX, dblY, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#232c36';
      ctx.font = `bold ${scaled(10.5)}px Karla, system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('Estímulo S', refX, refY + 14);
      ctx.fillText(`Estímulo 2S (×${ratioPerceived.toFixed(2)})`, dblX, dblY - 8);
      ctx.restore();

      // ─── 5. Laboratorio Sensorial Interactivo (Widget Derecho) ───
      const widgetX = W - pad.right + 16;
      const widgetY = pad.top;
      const widgetW = pad.right - 28;
      const widgetH = plotH;

      ctx.save();
      ctx.fillStyle = 'rgba(251, 248, 240, 0.98)';
      ctx.shadowColor = 'rgba(35, 44, 54, 0.12)';
      ctx.shadowBlur = 8;
      ctx.fillRect(widgetX, widgetY, widgetW, widgetH);
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(207, 195, 169, 0.9)';
      ctx.lineWidth = 1;
      ctx.strokeRect(widgetX, widgetY, widgetW, widgetH);

      // Cabecera del widget
      ctx.fillStyle = nColor;
      ctx.font = `bold ${scaled(12)}px Karla, system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(`${activeSens.emoji} ${activeSens.name}`, widgetX + widgetW / 2, widgetY + 16);

      ctx.fillStyle = '#43505c';
      ctx.font = `${scaled(9.5)}px Karla, system-ui, sans-serif`;
      ctx.fillText(activeSens.unit, widgetX + widgetW / 2, widgetY + 28);

      // Simulación física animada según la modalidad sensorial
      const simBoxY = widgetY + 38;
      const simBoxH = 68;
      const simBoxX = widgetX + 8;
      const simBoxW = widgetW - 16;

      ctx.fillStyle = 'rgba(24, 32, 40, 0.92)';
      ctx.fillRect(simBoxX, simBoxY, simBoxW, simBoxH);
      ctx.strokeStyle = 'rgba(13, 110, 100, 0.5)';
      ctx.strokeRect(simBoxX, simBoxY, simBoxW, simBoxH);

      const simCenterX = simBoxX + simBoxW / 2;
      const simCenterY = simBoxY + simBoxH / 2;

      if (selectedSensation === 'brillo') {
        // Bombilla radiante
        const glowR = 12 + 10 * Math.sin(t * 3);
        const glowGrad = ctx.createRadialGradient(simCenterX, simCenterY, 2, simCenterX, simCenterY, glowR);
        glowGrad.addColorStop(0, '#fff59d');
        glowGrad.addColorStop(0.6, 'rgba(253, 224, 71, 0.4)');
        glowGrad.addColorStop(1, 'rgba(253, 224, 71, 0)');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(simCenterX, simCenterY, glowR, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(simCenterX, simCenterY, 8, 0, Math.PI * 2);
        ctx.fill();
      } else if (selectedSensation === 'descarga') {
        // Chispa de arco voltaico eléctrico
        ctx.strokeStyle = '#60a5fa';
        ctx.lineWidth = 2;
        ctx.beginPath();
        let sx = simCenterX - 18;
        let sy = simCenterY;
        ctx.moveTo(sx, sy);
        for (let seg = 0; seg < 5; seg++) {
          sx += 7;
          sy = simCenterY + (Math.random() - 0.5) * 16;
          ctx.lineTo(sx, sy);
        }
        ctx.stroke();

        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(simCenterX + 18, simCenterY, 4, 0, Math.PI * 2);
        ctx.fill();
      } else if (selectedSensation === 'sonoridad') {
        // Ondas sonoras concéntricas
        for (let wave = 1; wave <= 3; wave++) {
          const wr = ((t * 25 + wave * 10) % 28) + 4;
          ctx.strokeStyle = `rgba(13, 180, 140, ${1 - wr / 32})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(simCenterX - 8, simCenterY, wr, -Math.PI * 0.4, Math.PI * 0.4);
          ctx.stroke();
        }
        ctx.fillStyle = '#0d8577';
        ctx.fillRect(simCenterX - 16, simCenterY - 7, 8, 14);
      } else {
        // Indicador de barra de nivel
        const barH2 = 28;
        const fillH = barH2 * (0.5 + 0.3 * Math.sin(t * 2));
        ctx.fillStyle = nColor;
        ctx.fillRect(simCenterX - 10, simCenterY + barH2 / 2 - fillH, 20, fillH);
        ctx.strokeStyle = '#fff';
        ctx.strokeRect(simCenterX - 10, simCenterY - barH2 / 2, 20, barH2);
      }

      // Factor de percepción calculado ante duplicación
      const factorY = simBoxY + simBoxH + 14;
      ctx.fillStyle = '#232c36';
      ctx.font = `bold ${scaled(10.5)}px Karla, system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('Duplicar estímulo (2×S):', widgetX + widgetW / 2, factorY);

      ctx.fillStyle = nColor;
      ctx.font = `bold ${scaled(13)}px JetBrains Mono, monospace`;
      ctx.fillText(`2${toSuperscript(n.toFixed(2))} = ${Math.pow(2, n).toFixed(2)}×`, widgetX + widgetW / 2, factorY + 16);

      ctx.fillStyle = '#43505c';
      ctx.font = `${scaled(9.5)}px Karla, system-ui, sans-serif`;
      const regTxt = n < 0.95 ? 'Sublineal (Compresión)' : (n > 1.05 ? 'Superlineal (Alarma)' : 'Lineal (Proporcional)');
      ctx.fillText(regTxt, widgetX + widgetW / 2, factorY + 28);
      ctx.restore();

      // ─── 6. Cabecera Superior ───
      ctx.fillStyle = 'var(--ink, #232c36)';
      ctx.font = `bold ${scaled(14)}px Karla, system-ui, sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText(`STEVENS:  P = K · (S − S₀)${toSuperscript(n.toFixed(2))}`, pad.left, 22);

      ctx.fillStyle = '#43505c';
      ctx.font = `${scaled(10)}px Karla, system-ui, sans-serif`;
      ctx.fillText(`Sensación vs estímulo · ${activeSens.name}`, pad.left, 36);

      ctx.restore();
      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [n, selectedSensation, showAllCurves]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
    </div>
  );
}
