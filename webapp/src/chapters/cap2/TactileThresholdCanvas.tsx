import React, { useRef, useEffect, useState } from 'react';
import { readCap2Tokens, tokenRgba } from './designTokens';
import CanvasReserveState from './CanvasReserveState';

interface TactileThresholdCanvasProps {
  freqHz: number; // Frecuencia del estímulo en Hz (1 a 500 Hz)
  amplitudeUm: number; // Amplitud de vibración en µm (0.05 a 100 µm)
  onStimulusChange?: (freq: number, amp: number) => void;
}

export default function TactileThresholdCanvas({
  freqHz = 250,
  amplitudeUm = 1.0,
  onStimulusChange,
}: TactileThresholdCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const animTimeRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);
  const isHoveringPlotRef = useRef<boolean>(false);
  const [ctxUnavailable, setCtxUnavailable] = useState(false);

  // Modelos analíticos de umbrales psicofísicos (en µm)
  const calcPaciniThreshold = (f: number) => {
    const logF = Math.log10(Math.max(1, f));
    return 0.08 * Math.pow(10, Math.pow(logF - 2.40, 2) * 1.75);
  };

  const calcMeissnerThreshold = (f: number) => {
    const logF = Math.log10(Math.max(1, f));
    return 1.8 * Math.pow(10, Math.pow(logF - 1.55, 2) * 2.0);
  };

  const calcMerkelThreshold = (f: number) => {
    return 6.5 + Math.pow(f / 10, 1.8) * 8.0;
  };

  const calcRuffiniThreshold = (f: number) => {
    return 20.0 + Math.pow(f / 30, 1.4) * 12.0;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let lastTime = performance.now();

    const getPlotBounds = (W: number, H: number) => {
      const plotLeft = W * 0.095;
      const plotRight = W * 0.65;
      const plotTop = H * 0.18;
      const plotBottom = H * 0.86;
      return { plotLeft, plotRight, plotTop, plotBottom, plotW: plotRight - plotLeft, plotH: plotBottom - plotTop };
    };

    const handlePointerDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;
      const { plotLeft, plotRight, plotTop, plotBottom, plotW, plotH } = getPlotBounds(rect.width, rect.height);

      if (clientX >= plotLeft - 10 && clientX <= plotRight + 10 && clientY >= plotTop - 10 && clientY <= plotBottom + 10) {
        isDraggingRef.current = true;
        canvas.setPointerCapture(e.pointerId);
        canvas.style.cursor = 'grabbing';

        const normX = Math.max(0, Math.min(1, (clientX - plotLeft) / plotW));
        const normY = Math.max(0, Math.min(1, (plotBottom - clientY) / plotH));

        const newFreq = Math.round(Math.pow(10, normX * 3));
        const newAmp = Math.pow(10, -2 + normY * 4);

        if (onStimulusChange) {
          onStimulusChange(Math.max(1, Math.min(500, newFreq)), Math.max(0.05, Math.min(100, newAmp)));
        }
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;
      const { plotLeft, plotRight, plotTop, plotBottom, plotW, plotH } = getPlotBounds(rect.width, rect.height);

      const inPlot = clientX >= plotLeft && clientX <= plotRight && clientY >= plotTop && clientY <= plotBottom;
      isHoveringPlotRef.current = inPlot;

      if (!isDraggingRef.current) {
        canvas.style.cursor = inPlot ? 'grab' : 'default';
        return;
      }

      const normX = Math.max(0, Math.min(1, (clientX - plotLeft) / plotW));
      const normY = Math.max(0, Math.min(1, (plotBottom - clientY) / plotH));

      const newFreq = Math.round(Math.pow(10, normX * 3));
      const newAmp = Math.pow(10, -2 + normY * 4);

      if (onStimulusChange) {
        onStimulusChange(Math.max(1, Math.min(500, newFreq)), Math.max(0.05, Math.min(100, newAmp)));
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        try {
          canvas.releasePointerCapture(e.pointerId);
        } catch (_) {}
        canvas.style.cursor = isHoveringPlotRef.current ? 'grab' : 'default';
      }
    };

    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointercancel', handlePointerUp);

    const render = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      animTimeRef.current += dt;
      const t = animTimeRef.current;

      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const W = rect.width;
      const H = rect.height;

      if (canvas.width !== W * dpr || canvas.height !== H * dpr) {
        canvas.width = W * dpr;
        canvas.height = H * dpr;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error('[TactileThresholdCanvas] No se pudo obtener el contexto 2D del lienzo.');
        setCtxUnavailable(true);
        return;
      }

      // S4-01: tokens de :root leídos una vez por pasada de dibujo (no por trazo).
      const T = readCap2Tokens();

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, W, H);

      // ─── 1. Fondo Cálido de Estudio con Viñeta Suave ───
      const bgGrad = ctx.createRadialGradient(W * 0.42, H * 0.42, 25, W * 0.5, H * 0.5, Math.max(W, H) * 0.78);
      bgGrad.addColorStop(0, '#ffffff');
      bgGrad.addColorStop(0.5, '#faf6ee');
      bgGrad.addColorStop(1, '#eee4d2');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // ─── 2. Geometría del Gráfico Log-Log ───
      const { plotLeft, plotRight, plotTop, plotBottom, plotW, plotH } = getPlotBounds(W, H);

      const logFreqMin = 0; // log10(1) = 0
      const logFreqMax = 3; // log10(1000) = 3
      const logAmpMin = -2; // log10(0.01) = -2
      const logAmpMax = 2; // log10(100) = 2

      const freqToX = (f: number) =>
        plotLeft + ((Math.log10(Math.max(1, f)) - logFreqMin) / (logFreqMax - logFreqMin)) * plotW;
      const ampToY = (a: number) =>
        plotBottom - ((Math.log10(Math.max(0.01, a)) - logAmpMin) / (logAmpMax - logAmpMin)) * plotH;

      // Sombra suave del plano cartesiano
      ctx.save();
      ctx.fillStyle = tokenRgba(T.ink, 0.06);
      ctx.fillRect(plotLeft + 3, plotTop + 3, plotW, plotH);

      // Fondo del gráfico
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.fillRect(plotLeft, plotTop, plotW, plotH);

      // ─── Cuadrícula Logarítmica Principal y Secundaria ───
      ctx.lineWidth = 0.5;
      // Sub-décadas en Frecuencia (2..9, 20..90, 200..900)
      [1, 10, 100].forEach((base) => {
        for (let m = 2; m <= 9; m++) {
          const f = base * m;
          const x = freqToX(f);
          ctx.strokeStyle = 'rgba(215, 205, 185, 0.32)';
          ctx.beginPath();
          ctx.moveTo(x, plotTop);
          ctx.lineTo(x, plotBottom);
          ctx.stroke();
        }
      });

      // Sub-décadas en Amplitud (0.02..0.09, 0.2..0.9, 2..9, 20..90)
      [0.01, 0.1, 1, 10].forEach((base) => {
        for (let m = 2; m <= 9; m++) {
          const a = base * m;
          const y = ampToY(a);
          ctx.strokeStyle = 'rgba(215, 205, 185, 0.32)';
          ctx.beginPath();
          ctx.moveTo(plotLeft, y);
          ctx.lineTo(plotRight, y);
          ctx.stroke();
        }
      });

      // Décadas principales (1, 10, 100, 1000 Hz)
      [1, 10, 100, 1000].forEach((f) => {
        const x = freqToX(f);
        ctx.strokeStyle = 'rgba(180, 160, 130, 0.65)';
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(x, plotTop);
        ctx.lineTo(x, plotBottom);
        ctx.stroke();

        ctx.fillStyle = '#64748b';
        ctx.font = 'bold 7px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${f} Hz`, x, plotBottom + 12);
      });

      // Décadas principales (0.01, 0.1, 1, 10, 100 µm)
      [0.01, 0.1, 1, 10, 100].forEach((a) => {
        const y = ampToY(a);
        ctx.strokeStyle = 'rgba(180, 160, 130, 0.65)';
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(plotLeft, y);
        ctx.lineTo(plotRight, y);
        ctx.stroke();

        ctx.fillStyle = '#64748b';
        ctx.font = 'bold 7px JetBrains Mono, monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`${a < 1 ? a.toFixed(2) : a} µm`, plotLeft - 4, y + 2.5);
      });

      // Marco del gráfico
      ctx.strokeStyle = '#8c7a5c';
      ctx.lineWidth = 1.3;
      ctx.strokeRect(plotLeft, plotTop, plotW, plotH);

      // Rótulos de los ejes
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 8px Karla, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('FRECUENCIA DE VIBRACIÓN (Hz) →', plotLeft + plotW * 0.5, plotBottom + 23);

      ctx.save();
      ctx.translate(plotLeft - 26, plotTop + plotH * 0.5);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('UMBRAL DE INDENTACIÓN (µm) →', 0, 0);
      ctx.restore();
      ctx.restore();

      // ─── 3. Cuencas y Curvas de Sintonía Psicofísicas ───
      ctx.save();
      ctx.beginPath();
      ctx.rect(plotLeft, plotTop, plotW, plotH);
      ctx.clip();

      // 3.1 Cuenca sombreada de Pacini (250 Hz / 80 nm). Degradado vertical que
      // se desvanece hacia amplitudes altas: la "cuenca de sensibilidad" se lee
      // como un pozo y no como un triángulo azul plano recortado.
      const pacBasinGrad = ctx.createLinearGradient(0, ampToY(0.02), 0, ampToY(100));
      pacBasinGrad.addColorStop(0, 'rgba(37, 99, 235, 0.13)');
      pacBasinGrad.addColorStop(1, 'rgba(37, 99, 235, 0)');
      ctx.fillStyle = pacBasinGrad;
      ctx.beginPath();
      ctx.moveTo(freqToX(40), ampToY(100));
      for (let f = 40; f <= 800; f += 5) {
        ctx.lineTo(freqToX(f), ampToY(calcPaciniThreshold(f)));
      }
      ctx.lineTo(freqToX(800), ampToY(100));
      ctx.closePath();
      ctx.fill();

      // 3.2 Cuenca sombreada de Meissner (35 Hz / 1.8 µm)
      const meisBasinGrad = ctx.createLinearGradient(0, ampToY(0.5), 0, ampToY(100));
      meisBasinGrad.addColorStop(0, 'rgba(13, 133, 119, 0.12)');
      meisBasinGrad.addColorStop(1, 'rgba(13, 133, 119, 0)');
      ctx.fillStyle = meisBasinGrad;
      ctx.beginPath();
      ctx.moveTo(freqToX(5), ampToY(100));
      for (let f = 5; f <= 160; f += 3) {
        ctx.lineTo(freqToX(f), ampToY(calcMeissnerThreshold(f)));
      }
      ctx.lineTo(freqToX(160), ampToY(100));
      ctx.closePath();
      ctx.fill();

      // ─── Curva Pacini (Azul) ───
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      for (let f = 15; f <= 900; f += 5) {
        const x = freqToX(f);
        const y = ampToY(calcPaciniThreshold(f));
        if (f === 15) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Marca valle de Pacini (250 Hz, 0.08 µm)
      const pacX = freqToX(250);
      const pacY = ampToY(0.08);
      ctx.fillStyle = '#2563eb';
      ctx.beginPath();
      ctx.arc(pacX, pacY, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1e40af';
      ctx.font = 'bold 6.5px Karla, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('PACINI (250 Hz / 0,08 µm)', pacX, pacY + 10);

      // ─── Curva Meissner (Esmeralda) ───
      ctx.strokeStyle = '#0d8577';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      for (let f = 2; f <= 200; f += 2) {
        const x = freqToX(f);
        const y = ampToY(calcMeissnerThreshold(f));
        if (f === 2) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Marca valle de Meissner (35 Hz, 1.8 µm)
      const meisX = freqToX(35);
      const meisY = ampToY(1.8);
      ctx.fillStyle = '#0d8577';
      ctx.beginPath();
      ctx.arc(meisX, meisY, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#065f46';
      ctx.font = 'bold 6.5px Karla, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('MEISSNER (35 Hz / 1,8 µm)', meisX, meisY - 7);

      // ─── Curva Merkel (Carmín) ───
      ctx.strokeStyle = '#b02318';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (let f = 1; f <= 40; f += 1) {
        const x = freqToX(f);
        const y = ampToY(calcMerkelThreshold(f));
        if (f === 1) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      const merkX = freqToX(3);
      const merkY = ampToY(calcMerkelThreshold(3));
      ctx.fillStyle = '#b02318';
      ctx.beginPath();
      ctx.arc(merkX, merkY, 3.0, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = 'bold 6.5px Karla, system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('MERKEL (<5 Hz)', merkX + 5, merkY - 3);

      // ─── Curva Ruffini (Ámbar) ───
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1.7;
      ctx.beginPath();
      for (let f = 1; f <= 60; f += 2) {
        const x = freqToX(f);
        const y = ampToY(calcRuffiniThreshold(f));
        if (f === 1) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      const rufX = freqToX(12);
      const rufY = ampToY(calcRuffiniThreshold(12));
      ctx.fillStyle = '#d97706';
      ctx.font = 'bold 6.5px Karla, system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('RUFFINI (Estático)', rufX + 5, rufY + 9);

      ctx.restore(); // Termina clip del gráfico

      // ─── 4. Punto de Estímulo Interactivo y Proyecciones ───
      const stimX = freqToX(freqHz);
      const stimY = ampToY(amplitudeUm);

      const pacThresh = calcPaciniThreshold(freqHz);
      const meisThresh = calcMeissnerThreshold(freqHz);
      const merkThresh = calcMerkelThreshold(freqHz);
      const rufThresh = calcRuffiniThreshold(freqHz);

      const pacRatio = amplitudeUm / pacThresh;
      const meisRatio = amplitudeUm / meisThresh;
      const merkRatio = amplitudeUm / merkThresh;
      const rufRatio = amplitudeUm / rufThresh;

      let dominantColor = '#64748b';
      let sensationText = 'Estímulo mecánico subumbral (imperceptible).';
      let channelTag = 'SUBUMBRAL';

      if (pacRatio >= 1.0 && pacRatio >= meisRatio && freqHz >= 80) {
        dominantColor = '#2563eb';
        channelTag = 'PACINI (RA2)';
        sensationText = 'Zumbido de alta frecuencia y percepción de nanotextura sedosa.';
      } else if (meisRatio >= 1.0 && freqHz >= 8 && freqHz <= 100) {
        dominantColor = '#0d8577';
        channelTag = 'MEISSNER (RA1)';
        sensationText = 'Aleteo táctil (flutter), detección de deslizamiento y vibración baja.';
      } else if (merkRatio >= 1.0 && freqHz < 15) {
        dominantColor = '#b02318';
        channelTag = 'MERKEL (SA1)';
        sensationText = 'Presión localizada sostenida, bordes y curvatura de relieve.';
      } else if (rufRatio >= 1.0 && freqHz < 30) {
        dominantColor = '#d97706';
        channelTag = 'RUFFINI (SA2)';
        sensationText = 'Tensión cutánea tangencial y estiramiento del tejido dérmico.';
      } else if (Math.max(pacRatio, meisRatio, merkRatio, rufRatio) >= 1.0) {
        dominantColor = '#7c3aed';
        channelTag = 'COESTIMULACIÓN';
        sensationText = 'Activación simultánea de múltiples canales de mecanorreceptores.';
      }

      // Proyecciones punteadas con cotas en los ejes
      ctx.save();
      ctx.strokeStyle = dominantColor;
      ctx.lineWidth = 1.2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(stimX, plotBottom);
      ctx.lineTo(stimX, stimY);
      ctx.lineTo(plotLeft, stimY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Insignia en el eje X (Frecuencia). beginPath() obligatorio: sin él,
      // fill() cerraba la polilínea de proyección punteada en un triángulo
      // azul sólido que cubría medio gráfico.
      ctx.beginPath();
      ctx.fillStyle = dominantColor;
      ctx.roundRect(stimX - 22, plotBottom + 2, 44, 12, 2.5);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 6.5px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${freqHz} Hz`, stimX, plotBottom + 10.5);

      // Insignia en el eje Y (Amplitud)
      const ampBadgeText = amplitudeUm < 0.1 ? `${(amplitudeUm * 1000).toFixed(0)} nm` : `${amplitudeUm < 1 ? amplitudeUm.toFixed(2) : amplitudeUm.toFixed(1)} µm`;
      ctx.beginPath();
      ctx.fillStyle = dominantColor;
      ctx.roundRect(plotLeft - 38, stimY - 6, 36, 12, 2.5);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 6px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(ampBadgeText, plotLeft - 20, stimY + 2.5);

      // Halo pulsante
      const pulseR = 7 + Math.sin(t * 8) * 2.5;
      ctx.beginPath();
      ctx.arc(stimX, stimY, pulseR, 0, Math.PI * 2);
      ctx.fillStyle = dominantColor === '#64748b' ? 'rgba(100, 116, 139, 0.22)' : `${dominantColor}30`;
      ctx.fill();

      // Punto central
      ctx.beginPath();
      ctx.arc(stimX, stimY, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = dominantColor;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.6;
      ctx.stroke();

      // Rótulo flotante encima del punto
      ctx.beginPath();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
      ctx.strokeStyle = dominantColor;
      ctx.lineWidth = 0.9;
      const pW = 84;
      const pH = 15;
      const pX = Math.max(plotLeft + 4, Math.min(plotRight - pW - 4, stimX - pW / 2));
      const pY = stimY - 21;
      ctx.roundRect(pX, pY, pW, pH, 3.5);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = dominantColor;
      ctx.font = 'bold 7px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      const ampLabel = amplitudeUm < 0.1 ? `${(amplitudeUm * 1000).toFixed(0)} nm` : `${amplitudeUm.toFixed(2)} µm`;
      ctx.fillText(`${freqHz} Hz · ${ampLabel}`, pX + pW / 2, pY + 10.5);
      ctx.restore();

      // ─── 5. Panel de Diagnóstico Psicofísico (Derecha) ───
      const cardX = W * 0.68;
      const cardY = H * 0.18;
      const cardW = W * 0.29;
      const cardH = H * 0.70;

      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
      ctx.shadowColor = tokenRgba(T.ink, 0.10);
      ctx.shadowBlur = 8;
      ctx.roundRect(cardX, cardY, cardW, cardH, 6);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = dominantColor;
      ctx.lineWidth = 1.4;
      ctx.strokeRect(cardX, cardY, cardW, cardH);

      // Cabecera de diagnóstico
      ctx.fillStyle = dominantColor;
      ctx.font = 'bold 7.5px Karla, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('DIAGNÓSTICO PSICOFÍSICO', cardX + cardW / 2, cardY + 15);

      // Canal dominante
      ctx.font = 'bold 11px Karla, system-ui, sans-serif';
      ctx.fillText(channelTag, cardX + cardW / 2, cardY + 30);

      // Línea divisoria
      ctx.strokeStyle = tokenRgba(T.line, 0.6);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cardX + 10, cardY + 38);
      ctx.lineTo(cardX + cardW - 10, cardY + 38);
      ctx.stroke();

      // Descripción perceptual
      ctx.fillStyle = '#334155';
      ctx.font = 'bold 7px Karla, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SENSACIÓN PERCIBIDA:', cardX + cardW / 2, cardY + 51);

      ctx.font = '7px Karla, system-ui, sans-serif';
      ctx.fillStyle = '#475569';
      const words = sensationText.split(' ');
      let line = '';
      let ty = cardY + 64;
      words.forEach((w) => {
        const test = line + w + ' ';
        if (ctx.measureText(test).width > cardW - 18) {
          ctx.fillText(line, cardX + cardW / 2, ty);
          line = w + ' ';
          ty += 10;
        } else {
          line = test;
        }
      });
      ctx.fillText(line, cardX + cardW / 2, ty);

      // ─── Barras de Activación de los 4 Canales ───
      const barStartY = cardY + cardH * 0.52;
      ctx.font = 'bold 7px Karla, system-ui, sans-serif';
      ctx.fillStyle = '#1e293b';
      ctx.textAlign = 'left';
      ctx.fillText('EXCITACIÓN POR CANAL:', cardX + 10, barStartY);

      const channels = [
        { name: 'Pacini (RA2)', ratio: pacRatio, color: '#2563eb' },
        { name: 'Meissner (RA1)', ratio: meisRatio, color: '#0d8577' },
        { name: 'Merkel (SA1)', ratio: merkRatio, color: '#b02318' },
        { name: 'Ruffini (SA2)', ratio: rufRatio, color: '#d97706' },
      ];

      const barW = cardW - 20;
      const barH = 6;

      channels.forEach((ch, idx) => {
        const by = barStartY + 12 + idx * 20;
        ctx.fillStyle = '#64748b';
        ctx.font = 'bold 6.5px Karla, system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(ch.name, cardX + 10, by - 2);

        const pct = Math.min(100, Math.round(ch.ratio * 100));
        ctx.textAlign = 'right';
        ctx.fillStyle = ch.ratio >= 1.0 ? ch.color : '#94a3b8';
        ctx.font = 'bold 6.5px JetBrains Mono, monospace';
        ctx.fillText(ch.ratio >= 1.0 ? `${pct}% (ACTIVO)` : 'SUBUMBRAL', cardX + cardW - 10, by - 2);

        // Fondo barra
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(cardX + 10, by, barW, barH);

        // Relleno barra
        const fillW = Math.min(barW, Math.max(0, (Math.min(2.5, ch.ratio) / 2.5) * barW));
        ctx.fillStyle = ch.ratio >= 1.0 ? ch.color : '#cbd5e1';
        ctx.fillRect(cardX + 10, by, fillW, barH);
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(cardX + 10, by, barW, barH);
      });

      ctx.restore();

      // ─── 6. Cabecera Superior del Canvas ───
      ctx.fillStyle = T.ink;
      ctx.font = 'bold 11.5px Karla, system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`CURVAS DE SINTONÍA PSICOFÍSICA: ${freqHz} Hz · ${amplitudeUm < 1 ? amplitudeUm.toFixed(2) : amplitudeUm.toFixed(1)} µm`, W * 0.04, 22);

      ctx.fillStyle = tokenRgba(T.ink3, 0.9);
      ctx.font = '8px Karla, system-ui, sans-serif';
      ctx.fillText('Arrastra el cursor en el plano logarítmico para explorar la selectividad sensorial de la piel.', W * 0.04, 35);

      ctx.restore();
      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [freqHz, amplitudeUm, onStimulusChange]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', cursor: 'grab', touchAction: 'none' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      {ctxUnavailable && <CanvasReserveState label="TactileThresholdCanvas" />}
    </div>
  );
}
