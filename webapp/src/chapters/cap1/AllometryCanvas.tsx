import React, { useRef, useEffect, useState } from 'react';

interface AllometryCanvasProps {
  selectedParam: string; // 'BMR', 'area', 'HR', 'brain', 'life', 'muscle'
  customMass?: number;
  onSelectAnimal?: (animal: string, mass: number) => void;
}

interface AlloCurve {
  id: string;
  name: string;
  alpha: number;
  a: number;
  unit: string;
  color: string;
  desc: string;
}

const ALLO_DATA: Record<string, AlloCurve> = {
  BMR: { id: 'BMR', name: 'Tasa Metabólica Basal', alpha: 0.75, a: 4.1, unit: 'W', color: '#0d8577', desc: 'Ley de Kleiber (3/4): redes vasculares fractales de distribución' },
  area: { id: 'area', name: 'Área Superficial', alpha: 0.65, a: 0.11, unit: 'm²', color: '#0d6e64', desc: 'Disipación térmica y balance calórico radiativo' },
  HR: { id: 'HR', name: 'Frecuencia Cardíaca', alpha: -0.25, a: 4.02, unit: 'Hz', color: '#b02318', desc: 'Frecuencia del pulso: el corazón del elefante late ~20× más lento que el ratón' },
  brain: { id: 'brain', name: 'Masa Cerebral', alpha: 0.66, a: 0.085, unit: 'kg', color: '#6d5fbf', desc: 'Alometría encefálica: humanos marcadamente por encima de la curva' },
  life: { id: 'life', name: 'Tiempo de Vida', alpha: 0.20, a: 11.89, unit: 'años', color: '#2e8b57', desc: 'Longevidad: ~10^9 latidos cardíacos totales durante la vida de casi todo mamífero' },
  muscle: { id: 'muscle', name: 'Masa Muscular', alpha: 1.00, a: 0.45, unit: 'kg', color: '#c0681e', desc: 'Escalado isométrico puro: el músculo representa ~40-45% de la masa corporal' },
};

const ANIMALS = [
  { id: 'mouse', name: 'Ratón', emoji: '🐁', mass: 0.025, hr: 600, color: '#2e8b57' },
  { id: 'rabbit', name: 'Conejo', emoji: '🐇', mass: 2.5, hr: 220, color: '#3e9d6b' },
  { id: 'dog', name: 'Perro', emoji: '🐕', mass: 25, hr: 110, color: '#5a9a3a' },
  { id: 'human', name: 'Humano', emoji: '🚶', mass: 70, hr: 68, color: '#0d6e64' },
  { id: 'horse', name: 'Caballo', emoji: '🐎', mass: 550, hr: 38, color: '#a35c00' },
  { id: 'elephant', name: 'Elefante', emoji: '🐘', mass: 5000, hr: 28, color: '#6d5fbf' },
  { id: 'whale', name: 'Ballena Azul', emoji: '🐋', mass: 120000, hr: 8, color: '#3d4f8a' },
];

const SUPERSCRIPT: Record<string, string> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
  '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
  '-': '⁻', '.': '·', ',': '·',
};

function toSuperscript(value: string) {
  return [...value].map((char) => SUPERSCRIPT[char] ?? char).join('');
}

function drawFittedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  baseSize: number,
  minSize: number,
  family: string,
  weight = '',
) {
  let size = baseSize;
  const setFont = () => {
    ctx.font = `${weight ? `${weight} ` : ''}${size}px ${family}`;
  };
  setFont();
  while (size > minSize && ctx.measureText(text).width > maxWidth) {
    size -= 0.5;
    setFont();
  }
  if (ctx.measureText(text).width > maxWidth) {
    let fitted = text;
    while (fitted.length > 1 && ctx.measureText(`${fitted}…`).width > maxWidth) {
      fitted = fitted.slice(0, -1);
    }
    text = `${fitted}…`;
  }
  ctx.fillText(text, x, y);
}

export default function AllometryCanvas({
  selectedParam,
  customMass = 70,
  onSelectAnimal,
}: AllometryCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const [hoveredAnimal, setHoveredAnimal] = useState<string | null>(null);
  const [activeMass, setActiveMass] = useState<number>(customMass);
  const animTimeRef = useRef<number>(0);

  const activeCurve = ALLO_DATA[selectedParam] || ALLO_DATA.BMR;

  useEffect(() => {
    setActiveMass(customMass);
  }, [customMass]);

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
      // En pantalla completa el canvas crece, pero las fuentes no deben
      // quedarse con el tamaño fijo del visor compacto.
      const scale = Math.max(1, Math.min(1.6, W / 420));
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
      const bgGrad = ctx.createRadialGradient(W * 0.48, H * 0.45, 20, W * 0.5, H * 0.5, Math.max(W, H) * 0.75);
      bgGrad.addColorStop(0, '#f8f3e8');
      bgGrad.addColorStop(0.55, '#f1eadc');
      bgGrad.addColorStop(1, '#eee4d2');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // ─── 2. Dimensiones del Gráfico Log-Log ───
      const pad = { top: 48, bottom: 85, left: 62, right: 30 };
      const plotW = W - pad.left - pad.right;
      const plotH = H - pad.top - pad.bottom;

      const logMinM = Math.log10(0.01);    // 10^-2 kg (10 g)
      const logMaxM = Math.log10(150000);  // 1.5 * 10^5 kg (150 ton)

      const xFromMass = (m: number) =>
        pad.left + ((Math.log10(m) - logMinM) / (logMaxM - logMinM)) * plotW;

      const massFromX = (x: number) =>
        Math.pow(10, logMinM + ((x - pad.left) / plotW) * (logMaxM - logMinM));

      // Rango de escala Y basado en la función actual
      const calcYVal = (m: number) => activeCurve.a * Math.pow(m, activeCurve.alpha);
      const minVal = Math.min(calcYVal(0.01), calcYVal(150000));
      const maxVal = Math.max(calcYVal(0.01), calcYVal(150000));
      const logMinY = Math.log10(Math.max(1e-5, minVal * 0.3));
      const logMaxY = Math.log10(maxVal * 3);

      const yFromVal = (v: number) =>
        pad.top + plotH - ((Math.log10(Math.max(1e-5, v)) - logMinY) / (logMaxY - logMinY)) * plotH;

      // ─── 3. Rejilla Logarítmica Suave ───
      ctx.strokeStyle = 'rgba(67, 80, 92, 0.08)';
      ctx.lineWidth = 1;
      for (let dec = -2; dec <= 5; dec++) {
        const mx = xFromMass(Math.pow(10, dec));
        ctx.beginPath();
        ctx.moveTo(mx, pad.top);
        ctx.lineTo(mx, pad.top + plotH);
        ctx.stroke();

        ctx.fillStyle = '#17212b';
        ctx.font = `${scaled(11)}px JetBrains Mono, monospace`;
        ctx.textAlign = 'center';
        const expStr = dec === -2 ? '10⁻²' : dec === -1 ? '10⁻¹' : dec === 0 ? '1 kg' : dec === 1 ? '10¹' : dec === 2 ? '10²' : dec === 3 ? '10³' : dec === 4 ? '10⁴' : '10⁵';
        ctx.fillText(expStr, mx, pad.top + plotH + 15);
      }

      // Rejilla horizontal Y
      for (let dec = Math.floor(logMinY); dec <= Math.ceil(logMaxY); dec++) {
        const val = Math.pow(10, dec);
        const my = yFromVal(val);
        if (my >= pad.top && my <= pad.top + plotH) {
          ctx.beginPath();
          ctx.moveTo(pad.left, my);
          ctx.lineTo(pad.left + plotW, my);
          ctx.stroke();

          ctx.fillStyle = '#17212b';
          ctx.font = `${scaled(10)}px JetBrains Mono, monospace`;
          ctx.textAlign = 'right';
          ctx.fillText(val >= 1000 ? val.toExponential(0) : (val < 0.01 ? val.toExponential(0) : String(val)), pad.left - 6, my + 3);
        }
      }

      // Marco del gráfico
      ctx.strokeStyle = 'rgba(35, 44, 54, 0.35)';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(pad.left, pad.top, plotW, plotH);

      // ─── 4. Línea Isométrica de Referencia (α = 1.00) ───
      ctx.save();
      ctx.strokeStyle = 'rgba(67, 80, 92, 0.48)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      for (let step = 0; step <= 80; step++) {
        const m = Math.pow(10, logMinM + (step / 80) * (logMaxM - logMinM));
        const valIso = activeCurve.a * m; // α = 1
        const x = xFromMass(m);
        const y = yFromVal(valIso);
        if (step === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = '#17212b';
      ctx.font = `italic ${scaled(10)}px Karla, system-ui, sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText('--- Isometría geométrica pura (α = 1,00)', pad.left + 10, pad.top + 18);

      // ─── 5. Curva Alométrica Activa con Brillo y Glow ───
      ctx.save();
      ctx.shadowColor = activeCurve.color;
      ctx.shadowBlur = 8;
      ctx.strokeStyle = activeCurve.color;
      ctx.lineWidth = 3.2;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.beginPath();
      for (let step = 0; step <= 150; step++) {
        const m = Math.pow(10, logMinM + (step / 150) * (logMaxM - logMinM));
        const v = calcYVal(m);
        const x = xFromMass(m);
        const y = yFromVal(v);
        if (step === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();

      // ─── 6. Puntos Vivos de los Animales con Iconos y Latido ───
      ANIMALS.forEach((a) => {
        const v = calcYVal(a.mass);
        const ax = xFromMass(a.mass);
        const ay = yFromVal(v);
        const isHover = hoveredAnimal === a.id;
        const isHuman = a.id === 'human';

        // Pulso animado según su frecuencia cardíaca real
        const pulseRate = a.hr / 60; // Hz
        const pulse = 0.5 + 0.5 * Math.sin(t * pulseRate * Math.PI * 2);

        // Sombra de contacto
        ctx.save();
        ctx.fillStyle = 'rgba(35, 44, 54, 0.2)';
        ctx.beginPath();
        ctx.ellipse(ax, ay + 6, 8, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Anillo de pulso
        ctx.beginPath();
        ctx.arc(ax, ay, (isHover || isHuman ? 9 : 6) + pulse * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = isHuman ? 'rgba(13, 110, 100, 0.2)' : 'rgba(109, 95, 191, 0.15)';
        ctx.fill();

        // Punto central
        ctx.beginPath();
        ctx.arc(ax, ay, isHover ? 6.5 : (isHuman ? 5.5 : 4), 0, Math.PI * 2);
        ctx.fillStyle = isHover ? '#b02318' : (isHuman ? '#0d6e64' : a.color);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.6;
        ctx.stroke();
        ctx.restore();

        // Etiqueta del animal
        ctx.save();
        ctx.font = isHuman ? `bold ${scaled(12)}px Karla, system-ui, sans-serif` : `${scaled(11)}px Karla, system-ui, sans-serif`;
        ctx.fillStyle = isHover ? '#b02318' : (isHuman ? '#0d6e64' : '#232c36');
        ctx.textAlign = a.mass < 1 ? 'left' : (a.mass > 10000 ? 'right' : 'center');
        const offsetY = a.mass < 1 ? -12 : (a.mass > 1000 ? -14 : -12);
        ctx.fillText(`${a.emoji} ${a.name}`, ax, ay + offsetY);

        // Valor calculado para el animal
        if (isHover || isHuman) {
          ctx.font = `bold ${scaled(10.5)}px JetBrains Mono, monospace`;
          ctx.fillStyle = activeCurve.color;
          const valStr = v >= 1000 ? v.toFixed(0) : (v < 0.1 ? v.toFixed(3) : v.toFixed(1));
          ctx.fillText(`${valStr} ${activeCurve.unit}`, ax, ay + (offsetY < 0 ? offsetY - 11 : 16));
        }
        ctx.restore();
      });

      // ─── 7. Marcador Scrubber de Masa Activa (Humano / Custom) ───
      const curV = calcYVal(activeMass);
      const curX = xFromMass(activeMass);
      const curY = yFromVal(curV);

      // Líneas guías punteadas hacia los ejes
      ctx.save();
      ctx.strokeStyle = 'rgba(13, 110, 100, 0.5)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(curX, pad.top + plotH);
      ctx.lineTo(curX, curY);
      ctx.lineTo(pad.left, curY);
      ctx.stroke();
      ctx.restore();

      // Chip numérico en vivo sobre el punto activo
      ctx.save();
      const chipText = `${activeCurve.id}: ${curV.toFixed(2)} ${activeCurve.unit} · ${activeMass >= 1000 ? (activeMass / 1000).toFixed(1) + ' t' : activeMass + ' kg'}`;
      ctx.font = `bold ${scaled(11)}px JetBrains Mono, monospace`;
      const tw = ctx.measureText(chipText).width;
      // Zona inferior central, libre de las etiquetas de animales y del osciloscopio.
      const chipX = Math.min(W - pad.right - 140 - tw - 16, Math.max(pad.left + 10, pad.left + plotW / 2 - tw / 2));
      const chipY = pad.top + plotH - 24;

      ctx.fillStyle = 'rgba(251, 248, 240, 0.98)';
      ctx.shadowColor = 'rgba(35, 44, 54, 0.2)';
      ctx.shadowBlur = 6;
      ctx.fillRect(chipX - 6, chipY - 12, tw + 12, 18);
      ctx.shadowBlur = 0;
      ctx.strokeStyle = activeCurve.color;
      ctx.lineWidth = 1.2;
      ctx.strokeRect(chipX - 6, chipY - 12, tw + 12, 18);

      ctx.fillStyle = activeCurve.color;
      ctx.textAlign = 'left';
      ctx.fillText(chipText, chipX, chipY + 1);
      ctx.restore();

      // ─── 8. Mini-Panel de Osciloscopio Comparativo (Latido Ratón vs Elefante) ───
      const oscW = 140;
      // Reservamos una banda superior para las leyendas; así nunca pisan la onda.
      const oscH = 58;
      const oscX = W - oscW - pad.right;
      const oscY = pad.top + plotH - oscH - 6;
      const miniByParam: { left: string; right: string; leftColor: string; rightColor: string } = {
        BMR: { left: 'Baja', right: 'Alta', leftColor: '#00ffaa', rightColor: '#ffd166' },
        area: { left: 'Pequeña', right: 'Grande', leftColor: '#55d6be', rightColor: '#72a7ff' },
        HR: { left: 'Ratón', right: 'Elefante', leftColor: '#00ffaa', rightColor: '#d480ff' },
        brain: { left: 'Menor', right: 'Mayor', leftColor: '#8cf0ff', rightColor: '#c88cff' },
        life: { left: 'Corta', right: 'Larga', leftColor: '#a7f36b', rightColor: '#ffd166' },
        muscle: { left: 'Menor', right: 'Mayor', leftColor: '#ffb36b', rightColor: '#ff6f61' },
      }[activeCurve.id] || { left: 'Menor', right: 'Mayor', leftColor: '#00ffaa', rightColor: '#d480ff' };

      ctx.save();
      ctx.fillStyle = 'rgba(24, 32, 40, 0.92)';
      ctx.fillRect(oscX, oscY, oscW, oscH);
      ctx.strokeStyle = 'rgba(13, 110, 100, 0.6)';
      ctx.lineWidth = 1;
      ctx.strokeRect(oscX, oscY, oscW, oscH);

      // Rejilla de osciloscopio verde
      ctx.strokeStyle = 'rgba(13, 180, 140, 0.15)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(oscX, oscY + oscH / 2);
      ctx.lineTo(oscX + oscW, oscY + oscH / 2);
      ctx.moveTo(oscX + oscW / 2, oscY);
      ctx.lineTo(oscX + oscW / 2, oscY + oscH);
      ctx.stroke();

      const waveTop = oscY + 25;
      const waveH = oscH - 29;

      const wave = (phase: number, side: 'left' | 'right') => {
        if (activeCurve.id === 'HR') return Math.sin(phase) > 0.8 ? Math.sin(phase * 4) * 14 : Math.sin(phase) * 2;
        if (activeCurve.id === 'brain') return Math.sin(phase * 2.4) * 5 + Math.sin(phase * 7) * 3;
        if (activeCurve.id === 'muscle') return Math.abs(Math.sin(phase)) * 11;
        if (activeCurve.id === 'life') return Math.sin(phase) * 5 + Math.sin(phase * 0.35) * 4;
        return Math.sin(phase * (side === 'left' ? 1.5 : 0.8)) * 5;
      };

      // Animación comparativa específica del parámetro seleccionado.
      ctx.strokeStyle = miniByParam.leftColor;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let ox = 0; ox < oscW / 2 - 4; ox++) {
        const phase = t * 10 + ox * 0.4;
        const oy = waveTop + waveH / 2 - wave(phase, 'left') * 0.55;
        if (ox === 0) ctx.moveTo(oscX + 4 + ox, oy);
        else ctx.lineTo(oscX + 4 + ox, oy);
      }
      ctx.stroke();

      ctx.strokeStyle = miniByParam.rightColor;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      for (let ox = 0; ox < oscW / 2 - 8; ox++) {
        const phase = t * 0.5 + ox * 0.08;
        const oy = waveTop + waveH / 2 - wave(phase, 'right') * 0.55;
        if (ox === 0) ctx.moveTo(oscX + oscW / 2 + 4 + ox, oy);
        else ctx.lineTo(oscX + oscW / 2 + 4 + ox, oy);
      }
      ctx.stroke();

      ctx.fillStyle = miniByParam.leftColor;
      ctx.font = `bold ${scaled(8.5)}px JetBrains Mono, monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(miniByParam.left, oscX + oscW * 0.25, oscY + 10);
      ctx.font = `${scaled(8)}px JetBrains Mono, monospace`;
      ctx.fillText(activeCurve.id === 'HR' ? '600 lpm' : 'escala', oscX + oscW * 0.25, oscY + 20);

      ctx.fillStyle = miniByParam.rightColor;
      ctx.font = `bold ${scaled(8.5)}px JetBrains Mono, monospace`;
      ctx.fillText(miniByParam.right, oscX + oscW * 0.75, oscY + 10);
      ctx.font = `${scaled(8)}px JetBrains Mono, monospace`;
      ctx.fillText(activeCurve.id === 'HR' ? '28 lpm' : 'escala', oscX + oscW * 0.75, oscY + 20);
      ctx.restore();

      // ─── 9. Título e Indicadores Inferiores ───
      // Keep the responsive header inside the canvas; long parameter descriptions
      // otherwise spill over the right edge on compact slide layouts.
      const headerMaxWidth = Math.max(80, W - pad.left - pad.right);
      const exponent = toSuperscript(activeCurve.alpha.toFixed(2));
      ctx.fillStyle = '#f1eadc';
      ctx.fillRect(pad.left - 2, 10, headerMaxWidth + 4, 34);
      ctx.fillStyle = '#232c36';
      drawFittedText(ctx, `LEY DE POTENCIA ALOMÉTRICA: f = ${activeCurve.a} · mᵦ${exponent}`, pad.left, 24, headerMaxWidth, scaled(14), scaled(9), 'Karla, system-ui, sans-serif', 'bold');
      ctx.fillStyle = '#17212b';
      drawFittedText(ctx, `${activeCurve.name} [${activeCurve.unit}] · ${activeCurve.desc}`, pad.left, 38, headerMaxWidth, scaled(10.5), scaled(7), 'Karla, system-ui, sans-serif');

      ctx.fillStyle = '#17212b';
      ctx.font = `${scaled(10)}px Karla, system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('Masa Corporal mᵦ (kg, escala logarítmica de 10 g a 150 toneladas) →', W / 2, H - 10);

      ctx.restore();
      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [selectedParam, activeMass, hoveredAnimal]);

  // Click & hover interactivity on animals
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;

    const padLeft = 62;
    const plotW = rect.width - padLeft - 30;
    const logMinM = Math.log10(0.01);
    const logMaxM = Math.log10(150000);

    if (x >= padLeft && x <= padLeft + plotW) {
      const m = Math.pow(10, logMinM + ((x - padLeft) / plotW) * (logMaxM - logMinM));
      // Buscar si está cerca de algún animal
      const closest = ANIMALS.find((a) => {
        const ax = padLeft + ((Math.log10(a.mass) - logMinM) / (logMaxM - logMinM)) * plotW;
        return Math.abs(ax - x) < 18;
      });
      setHoveredAnimal(closest ? closest.id : null);
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;

    const padLeft = 62;
    const plotW = rect.width - padLeft - 30;
    const logMinM = Math.log10(0.01);
    const logMaxM = Math.log10(150000);

    if (x >= padLeft && x <= padLeft + plotW) {
      const m = Math.pow(10, logMinM + ((x - padLeft) / plotW) * (logMaxM - logMinM));
      const closest = ANIMALS.find((a) => {
        const ax = padLeft + ((Math.log10(a.mass) - logMinM) / (logMaxM - logMinM)) * plotW;
        return Math.abs(ax - x) < 22;
      });
      if (closest) {
        setActiveMass(closest.mass);
        if (onSelectAnimal) onSelectAnimal(closest.name, closest.mass);
      } else {
        setActiveMass(Math.round(m * 10) / 10);
      }
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredAnimal(null)}
        onClick={handleClick}
        style={{ width: '100%', height: '100%', display: 'block', cursor: 'crosshair' }}
      />
    </div>
  );
}
