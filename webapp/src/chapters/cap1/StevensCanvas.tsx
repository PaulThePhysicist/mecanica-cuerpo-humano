import React, { useRef, useEffect, useState } from 'react';
import { fmt } from './format';
import { SERIES_COLORS, INK, BLOOD } from './colorTokens';
import { CFX } from './sims';
import { panelOverlap } from './safeArea';

interface StevensCanvasProps {
  n: number;
  selectedSensation?: string;
  showAllCurves?: boolean;
}

interface SensationInfo {
  id: string;
  name: string;
  n: number;
  color: string;
  unit: string;
  desc: string;
}

const SENSATIONS: Record<string, SensationInfo> = {
  brillo: { id: 'brillo', name: 'Brillo visual', n: 0.33, color: SERIES_COLORS[0], unit: 'Luminancia (cd/m²)', desc: 'Compresión óptica retiniana' },
  sonoridad: { id: 'sonoridad', name: 'Sonoridad (monoaural)', n: 0.54, color: SERIES_COLORS[1], unit: 'Nivel sonoro (dB)', desc: 'Compresión logarítmica coclear' },
  olor: { id: 'olor', name: 'Olor (café)', n: 0.55, color: SERIES_COLORS[2], unit: 'Concentración (ppm)', desc: 'Saturación de quimiorreceptores' },
  vibracion: { id: 'vibracion', name: 'Vibración (250 Hz, en el dedo)', n: 0.60, color: SERIES_COLORS[3], unit: 'Amplitud 250 Hz (μm)', desc: 'Corpúsculos de Pacini/Meissner' },
  gusto: { id: 'gusto', name: 'Gusto (sal)', n: 1.30, color: INK, unit: 'Concentración (mol/L)', desc: 'Quimiorreceptores gustativos' },
  temperatura: { id: 'temperatura', name: 'Temperatura (calor, en el brazo)', n: 1.60, color: BLOOD, unit: 'Temperatura sobre la piel (°C)', desc: 'Termorreceptores de calor' },
  presion: { id: 'presion', name: 'Presión en la palma', n: 1.10, color: SERIES_COLORS[4], unit: 'Fuerza aplicada (N)', desc: 'Detección proporcional de agarre' },
  pesadez: { id: 'pesadez', name: 'Pesadez (Levantar pesos)', n: 1.45, color: SERIES_COLORS[5], unit: 'Masa levantada (kg)', desc: 'Fatiga neuromuscular progresiva' },
  descarga: { id: 'descarga', name: 'Descarga eléctrica (60 Hz)', n: 3.50, color: SERIES_COLORS[6], unit: 'Corriente 60 Hz (mA)', desc: 'Alarma nociceptiva superlineal extrema' },
};

const SUPERSCRIPT: Record<string, string> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
  '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
  '-': '⁻', '.': '·', ',': '·',
};

function toSuperscript(value: string) {
  return [...value].map((char) => SUPERSCRIPT[char] ?? char).join('');
}

/** Encoge la fuente hasta que el texto quepa en `maxWidth`; si ni al tamaño
 *  mínimo cabe, trunca con «…». Evita que un nombre largo (p.ej. «Vibración
 *  (250 Hz, en el dedo)») se salga de la tarjeta del widget en lienzos angostos (V2-04). */
function fitText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, baseSize: number, minSize: number, weight: string) {
  let size = baseSize;
  const setFont = () => { ctx.font = `${weight}${size}px Karla, system-ui, sans-serif`; };
  setFont();
  while (size > minSize && ctx.measureText(text).width > maxWidth) {
    size -= 0.5;
    setFont();
  }
  if (ctx.measureText(text).width > maxWidth) {
    let fitted = text;
    while (fitted.length > 1 && ctx.measureText(`${fitted}…`).width > maxWidth) fitted = fitted.slice(0, -1);
    text = `${fitted}…`;
  }
  return text;
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

      // La diapositiva puede no tener layout aún (oculta / en transición de
      // entrada): rect = 0×0. Dibujar entonces genera radios negativos y
      // IndexSizeError, que rompía el rAF para siempre. Reintentar sin dibujar.
      if (W < 8 || H < 8) {
        rafRef.current = requestAnimationFrame(render);
        return;
      }

      if (canvas.width !== W * dpr || canvas.height !== H * dpr) {
        canvas.width = W * dpr;
        canvas.height = H * dpr;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        rafRef.current = requestAnimationFrame(render);
        return;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, W, H);

      // ─── 1. Fondo de estudio (compartido con las demás familias visuales) ───
      CFX.scene(ctx, W, H, { spotX: W * 0.4 });

      // ─── 2. Dimensiones del Gráfico Psicofísico ───
      // V6-02: el eje x y su título se componen por encima del panel abierto.
      const pad = { top: 46, bottom: 42 + panelOverlap(canvas), left: 52, right: 180 };
      const plotW = W - pad.left - pad.right;
      const plotH = H - pad.top - pad.bottom;

      const s0 = 0.5;
      const sMax = 4.5;
      const pMax = Math.pow(sMax - s0, Math.max(1, n));

      const xFromS = (sVal: number) => pad.left + (sVal / sMax) * plotW;
      const yFromP = (pVal: number) => pad.top + plotH - (Math.max(0, pVal) / pMax) * plotH;

      // Rejilla de fondo + marcas del eje X (unidades relativas)
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
        ctx.fillText(`${sStep}`, sx, pad.top + plotH + 14);
      }

      // Marcas del eje Y (percepción P, fracciones de su máximo con el
      // exponente activo — P no tiene unidad física propia en la ley de
      // Stevens, es una magnitud relativa).
      for (let pStep = 0; pStep <= 4; pStep++) {
        const pVal = (pStep / 4) * pMax;
        const py = yFromP(pVal);
        ctx.beginPath();
        ctx.moveTo(pad.left, py);
        ctx.lineTo(pad.left + plotW, py);
        ctx.stroke();

        ctx.fillStyle = '#43505c';
        ctx.font = `${scaled(10)}px JetBrains Mono, monospace`;
        ctx.textAlign = 'right';
        ctx.fillText(fmt(pVal, pMax < 3 ? 2 : 1), pad.left - 7, py + 3);
      }

      // Marco del gráfico
      ctx.strokeStyle = 'rgba(35, 44, 54, 0.35)';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(pad.left, pad.top, plotW, plotH);

      // Títulos de eje (con unidad relativa: P es adimensional en esta ley)
      ctx.fillStyle = '#43505c';
      ctx.font = `${scaled(10)}px Karla, system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('Estímulo S (unidades relativas)', pad.left + plotW / 2, pad.top + plotH + 30);

      ctx.save();
      ctx.translate(14, pad.top + plotH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = 'center';
      ctx.fillText('Percepción P (u. relativas)', 0, 0);
      ctx.restore();

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

      // Para n ≤ 1 (la mayoría de las sensaciones de la tabla) pMax se fija en
      // (sMax−S₀), el mismo valor final de esta recta — su extremo cae justo
      // en pad.top y el rótulo se salía al margen, chocando con el subtítulo
      // de la cabecera. Un suelo en pad.top+12 lo mantiene siempre dentro.
      ctx.fillStyle = '#43505c';
      ctx.font = `${scaled(10)}px Karla, system-ui, sans-serif`;
      ctx.textAlign = 'right';
      ctx.fillText('Lineal (n = 1,0)', pad.left + plotW - 14, Math.max(pad.top + 12, yFromP(sMax - s0) - 6));

      // Leyenda de series: misma franja vacía a la izquierda del umbral S₀
      // (ninguna curva tiene valor ahí, P=0 hasta S₀) y mismo orden que la
      // tabla de la izquierda (Object.values conserva el orden de SENSATIONS).
      // A6-04: ≥ 12 px, color pleno de cada serie y la activa en negrita,
      // sobre un fondo claro para que las curvas de detrás no la ensucien.
      if (showAllCurves) {
        ctx.save();
        const legendSize = Math.max(12, scaled(9));
        const rowH = legendSize + 3;
        const list = Object.values(SENSATIONS);
        ctx.font = `bold ${legendSize}px Karla, system-ui, sans-serif`;
        const textW = Math.max(...list.map((sens) => ctx.measureText(sens.name).width));
        const boxX = pad.left + 2;
        const boxY = pad.top + 22;
        ctx.fillStyle = 'rgba(251, 248, 240, 0.9)';
        ctx.strokeStyle = 'rgba(207, 195, 169, 0.9)';
        ctx.lineWidth = 1;
        ctx.fillRect(boxX, boxY, textW + 28, list.length * rowH + 6);
        ctx.strokeRect(boxX, boxY, textW + 28, list.length * rowH + 6);
        ctx.textAlign = 'left';
        let legendY = boxY + rowH;
        list.forEach((sens) => {
          const isActive = sens.id === selectedSensation;
          ctx.strokeStyle = sens.color;
          ctx.lineWidth = isActive ? 3 : 2;
          ctx.beginPath();
          ctx.moveTo(boxX + 5, legendY - legendSize / 3);
          ctx.lineTo(boxX + 18, legendY - legendSize / 3);
          ctx.stroke();
          ctx.fillStyle = sens.color;
          ctx.font = `${isActive ? 'bold ' : ''}${legendSize}px Karla, system-ui, sans-serif`;
          ctx.fillText(sens.name, boxX + 22, legendY);
          legendY += rowH;
        });
        ctx.restore();
      }

      // ─── 3. Dibujo de Todas las Curvas Sensoriales o de la Activa ───
      // Recortadas al rectángulo del gráfico: con n alto (p.ej. descarga,
      // 3,50) una curva de fondo puede superar el pMax normalizado sobre el
      // exponente activo y salirse por arriba — sin recorte se derramaba
      // sobre la cabecera (V2-04).
      ctx.save();
      ctx.beginPath();
      ctx.rect(pad.left, pad.top, plotW, plotH);
      ctx.clip();
      if (showAllCurves) {
        Object.values(SENSATIONS).forEach((sens) => {
          if (sens.id === selectedSensation) return; // Se dibuja después resaltada
          ctx.save();
          ctx.strokeStyle = sens.color;
          ctx.lineWidth = 1.4;
          ctx.globalAlpha = 0.5;
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
      ctx.restore(); // cierra el recorte al rectángulo del gráfico

      // ─── 4. Puntos de Duplicación del exceso sobre el umbral (S − S₀ y 2·(S − S₀)) ───
      // Medidos desde S₀ para que el cociente percibido sea 2ⁿ exacto, el
      // mismo factor que dan la tabla y el panel (P6-02).
      const sRef = s0 + 1;
      const sDouble = s0 + 2;
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

      // Encima y a la izquierda del punto: debajo pisaba la marca «1» del eje x.
      CFX.chip(ctx, refX - 24, refY - 14, 'S − S₀', { color: CFX.PAL.ink2, size: scaled(10), align: 'center', W });
      CFX.chip(ctx, dblX, dblY - 8, `2·(S − S₀) (×${fmt(ratioPerceived, 2)})`, { color: CFX.PAL.ink2, size: scaled(10), align: 'center', W });
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

      // Cabecera del widget: encoge en vez de salirse de la tarjeta.
      ctx.fillStyle = nColor;
      ctx.textAlign = 'center';
      const headerLabel = fitText(ctx, activeSens.name, widgetW - 10, scaled(12), scaled(8), 'bold ');
      ctx.fillText(headerLabel, widgetX + widgetW / 2, widgetY + 16);

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
      ctx.fillText('Duplicar (S − S₀):', widgetX + widgetW / 2, factorY);

      ctx.fillStyle = nColor;
      ctx.font = `bold ${scaled(13)}px JetBrains Mono, monospace`;
      ctx.fillText(`2${toSuperscript(fmt(n, 2))} = ${fmt(Math.pow(2, n), 2)}×`, widgetX + widgetW / 2, factorY + 16);

      ctx.fillStyle = '#43505c';
      ctx.font = `${scaled(9.5)}px Karla, system-ui, sans-serif`;
      const regTxt = n < 0.95 ? 'Sublineal (Compresión)' : (n > 1.05 ? 'Superlineal (Alarma)' : 'Lineal (Proporcional)');
      ctx.fillText(regTxt, widgetX + widgetW / 2, factorY + 28);
      ctx.restore();

      // ─── 6. Cabecera Superior ───
      ctx.fillStyle = 'var(--ink, #232c36)';
      ctx.font = `bold ${scaled(14)}px Karla, system-ui, sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText(`STEVENS:  P = K · (S − S₀)${toSuperscript(fmt(n, 2))}`, pad.left, 22);

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
