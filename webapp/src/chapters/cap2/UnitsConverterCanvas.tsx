import React, { useRef, useEffect } from 'react';

interface UnitsConverterCanvasProps {
  quantityType: 'force' | 'torque' | 'pressure';
  inputValue: number; // Valor numérico base en SI (N, N·m, o Pa)
  onSelectBenchmark?: (value: number) => void;
}

interface BioReference {
  name: string;
  siValue: number;
  unitSi: string;
  altValue: string;
  note: string;
  zone: 'normal' | 'caution' | 'danger';
}

const REFERENCES: Record<string, BioReference[]> = {
  force: [
    { name: 'Mordida con incisivos', siValue: 200, unitSi: 'N', altValue: '20,4 kgf · 45 lbf', note: 'Corte fino con palanca de 3ª clase', zone: 'normal' },
    { name: 'Tensión bíceps sosteniendo 5 kg', siValue: 450, unitSi: 'N', altValue: '45,9 kgf · 101 lbf', note: 'Desventaja de palanca (35/4 cm)', zone: 'normal' },
    { name: 'Carga acetabular al caminar', siValue: 1800, unitSi: 'N', altValue: '183,5 kgf · 405 lbf', note: '~2,7× peso corporal en cadera', zone: 'caution' },
    { name: 'Tensión tendón de Aquiles (salto)', siValue: 4500, unitSi: 'N', altValue: '458,7 kgf · 1011 lbf', note: 'Cerca del límite de rotura tendinosa', zone: 'danger' },
  ],
  torque: [
    { name: 'Torque flexión de codo (sostén)', siValue: 25, unitSi: 'N·m', altValue: '2,55 kgf·m · 18,4 lbf·ft', note: 'Brazo a 90° con 7 kg en mano', zone: 'normal' },
    { name: 'Torque abductor de cadera', siValue: 110, unitSi: 'N·m', altValue: '11,2 kgf·m · 81,1 lbf·ft', note: 'Glúteo medio en apoyo monopodal', zone: 'caution' },
    { name: 'Torque lumbar L5-S1 (Inclinado)', siValue: 220, unitSi: 'N·m', altValue: '22,4 kgf·m · 162,3 lbf·ft', note: 'Tronco a 60° con 15 kg en manos', zone: 'danger' },
  ],
  pressure: [
    { name: 'Presión arterial sistólica', siValue: 16000, unitSi: 'Pa (16 kPa)', altValue: '120 mmHg · 0,16 bar · 2,3 psi', note: 'Presión hidrostática de eyección', zone: 'normal' },
    { name: 'Presión discal L5-S1 de pie', siValue: 500000, unitSi: 'Pa (0,50 MPa)', altValue: '5,0 bar · 3750 mmHg · 72,5 psi', note: 'Compresión fisiológica homogénea', zone: 'normal' },
    { name: 'Presión discal sentado encorvado', siValue: 1100000, unitSi: 'Pa (1,10 MPa)', altValue: '11,0 bar · 8250 mmHg · 159,5 psi', note: 'Sobrecarga postural por pérdida de lordosis', zone: 'caution' },
    { name: 'Presión discal levantando peso', siValue: 2800000, unitSi: 'Pa (2,80 MPa)', altValue: '28,0 bar · 21000 mmHg · 406 psi', note: 'Zona crítica de rotura de anillo fibroso', zone: 'danger' },
  ],
};

export default function UnitsConverterCanvas({
  quantityType = 'force',
  inputValue = 450,
  onSelectBenchmark,
}: UnitsConverterCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const animTimeRef = useRef<number>(0);
  const hoveredBenchRef = useRef<number | null>(null);

  const curRefs = REFERENCES[quantityType] || REFERENCES.force;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let lastTime = performance.now();

    const getBenchBounds = (W: number, H: number) => {
      const refX = W * 0.58;
      const refY = H * 0.52;
      const refW = W * 0.38;
      const refH = H * 0.40;
      return { refX, refY, refW, refH };
    };

    const handlePointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;
      const { refX, refY, refW, refH } = getBenchBounds(rect.width, rect.height);

      if (clientX >= refX && clientX <= refX + refW && clientY >= refY && clientY <= refY + refH) {
        const itemH = (refH - 24) / curRefs.length;
        const idx = Math.floor((clientY - (refY + 20)) / itemH);
        if (idx >= 0 && idx < curRefs.length) {
          hoveredBenchRef.current = idx;
          canvas.style.cursor = 'pointer';
          return;
        }
      }
      hoveredBenchRef.current = null;
      canvas.style.cursor = 'default';
    };

    const handlePointerDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;
      const { refX, refY, refW, refH } = getBenchBounds(rect.width, rect.height);

      if (clientX >= refX && clientX <= refX + refW && clientY >= refY && clientY <= refY + refH) {
        const itemH = (refH - 24) / curRefs.length;
        const clickedIdx = Math.floor((clientY - (refY + 20)) / itemH);
        if (clickedIdx >= 0 && clickedIdx < curRefs.length && onSelectBenchmark) {
          onSelectBenchmark(curRefs[clickedIdx].siValue);
        }
      }
    };

    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerdown', handlePointerDown);

    const render = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      animTimeRef.current += dt;

      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const W = rect.width;
      const H = rect.height;

      if (canvas.width !== W * dpr || canvas.height !== H * dpr) {
        canvas.width = W * dpr;
        canvas.height = H * dpr;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

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

      // ─── 2. Conversiones Numéricas Sincronizadas ───
      let unitsTable: { unit: string; valStr: string; factor: string; ratio: number }[] = [];
      let maxRange = 1;
      let curValNorm = 0;

      if (quantityType === 'force') {
        maxRange = 5000;
        curValNorm = Math.min(1, inputValue / maxRange);
        const nVal = inputValue;
        const kgfVal = nVal / 9.80665;
        const lbfVal = nVal * 0.224809;
        const dynVal = nVal * 1e5;

        unitsTable = [
          { unit: 'Newtons (N)', valStr: `${nVal.toFixed(1)} N`, factor: 'SI Base: 1 N = 1 kg·m/s²', ratio: curValNorm },
          { unit: 'Kilogramos-fuerza (kgf / kp)', valStr: `${kgfVal.toFixed(2)} kgf`, factor: '1 kgf = 9,80665 N (Gravedad estándar)', ratio: curValNorm },
          { unit: 'Libras-fuerza (lbf)', valStr: `${lbfVal.toFixed(2)} lbf`, factor: '1 lbf = 4,44822 N (Sistema anglosajón)', ratio: curValNorm },
          { unit: 'Dinas (dyn)', valStr: `${dynVal.toExponential(2)} dyn`, factor: '1 dyn = 10⁻⁵ N (Sistema CGS)', ratio: curValNorm },
        ];
      } else if (quantityType === 'torque') {
        maxRange = 250;
        curValNorm = Math.min(1, inputValue / maxRange);
        const nmVal = inputValue;
        const kgfmVal = nmVal / 9.80665;
        const lbfftVal = nmVal * 0.737562;

        unitsTable = [
          { unit: 'Newton·metro (N·m)', valStr: `${nmVal.toFixed(1)} N·m`, factor: 'SI Base: 1 N·m = 1 J/rad', ratio: curValNorm },
          { unit: 'Kilogramo-fuerza·metro (kgf·m)', valStr: `${kgfmVal.toFixed(2)} kgf·m`, factor: '1 kgf·m = 9,80665 N·m', ratio: curValNorm },
          { unit: 'Libra·pie (lbf·ft)', valStr: `${lbfftVal.toFixed(2)} lbf·ft`, factor: '1 lbf·ft = 1,35582 N·m', ratio: curValNorm },
        ];
      } else {
        maxRange = 3500000;
        curValNorm = Math.min(1, inputValue / maxRange);
        const paVal = inputValue;
        const kpaVal = paVal / 1e3;
        const mpaVal = paVal / 1e6;
        const barVal = paVal / 1e5;
        const mmhgVal = paVal / 133.322;
        const psiVal = paVal * 0.000145038;

        unitsTable = [
          { unit: 'Pascales (Pa)', valStr: `${paVal >= 10000 ? paVal.toExponential(2) : paVal.toFixed(0)} Pa`, factor: 'SI Base: 1 Pa = 1 N/m²', ratio: curValNorm },
          { unit: 'Kilopascales (kPa)', valStr: `${kpaVal.toFixed(1)} kPa`, factor: '1 kPa = 10³ Pa (Presión fisiológica)', ratio: curValNorm },
          { unit: 'Megapascales (MPa)', valStr: `${mpaVal.toFixed(3)} MPa`, factor: '1 MPa = 10⁶ Pa (Esfuerzo mecánico tisular)', ratio: curValNorm },
          { unit: 'Bares (bar)', valStr: `${barVal.toFixed(2)} bar`, factor: '1 bar = 100 kPa ≈ 1 atm física', ratio: curValNorm },
          { unit: 'Milímetros de Mercurio (mmHg)', valStr: `${mmhgVal.toFixed(1)} mmHg`, factor: '1 mmHg = 133,322 Pa (Presión arterial)', ratio: curValNorm },
          { unit: 'Libras/pulgada² (psi)', valStr: `${psiVal.toFixed(1)} psi`, factor: '1 psi = 6.894,76 Pa (Sistema técnico)', ratio: curValNorm },
        ];
      }

      // ─── 3. Tarjetas de Unidades y Barras Proporcionales (Lado Izquierdo) ───
      const tableX = W * 0.045;
      const tableY = H * 0.18;
      const tableW = W * 0.50;
      const totalTableH = H * 0.74;
      const itemH = Math.min(42, (totalTableH - (unitsTable.length - 1) * 6) / unitsTable.length);

      unitsTable.forEach((item, idx) => {
        const iy = tableY + idx * (itemH + 6);
        const isPrimary = idx === 0;

        ctx.save();
        ctx.fillStyle = isPrimary ? 'rgba(13, 110, 100, 0.09)' : 'rgba(255, 255, 255, 0.94)';
        ctx.shadowColor = 'rgba(35, 44, 54, 0.07)';
        ctx.shadowBlur = 6;
        ctx.roundRect(tableX, iy, tableW, itemH, 6);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.strokeStyle = isPrimary ? '#0d6e64' : 'rgba(207, 195, 169, 0.8)';
        ctx.lineWidth = isPrimary ? 1.5 : 0.9;
        ctx.stroke();

        // Barra de magnitud inferior
        const barPad = 8;
        const bW = tableW - barPad * 2;
        const bH = 3.2;
        ctx.fillStyle = 'rgba(203, 213, 225, 0.45)';
        ctx.fillRect(tableX + barPad, iy + itemH - 6.0, bW, bH);

        const fillW = Math.max(2, item.ratio * bW);
        ctx.fillStyle = isPrimary ? '#0d6e64' : (item.ratio > 0.75 ? '#b02318' : (item.ratio > 0.4 ? '#d97706' : '#2563eb'));
        ctx.fillRect(tableX + barPad, iy + itemH - 6.0, fillW, bH);

        // Nombre de unidad
        ctx.fillStyle = isPrimary ? '#0d6e64' : '#1e293b';
        ctx.font = 'bold 8px Karla, system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(item.unit, tableX + 10, iy + itemH * 0.42);

        // Factor de conversión
        ctx.fillStyle = '#64748b';
        ctx.font = '6.8px Karla, system-ui, sans-serif';
        ctx.fillText(item.factor, tableX + 10, iy + itemH * 0.72);

        // Valor numérico convertido
        ctx.fillStyle = isPrimary ? '#0d6e64' : '#b02318';
        ctx.font = 'bold 10.5px JetBrains Mono, monospace';
        ctx.textAlign = 'right';
        ctx.fillText(item.valStr, tableX + tableW - 10, iy + itemH * 0.54);
        ctx.restore();
      });

      // ─── 4. Reloj / Tacómetro Biomecánico Analógico (Arriba a la Derecha) ───
      const dialX = W * 0.77;
      const dialY = H * 0.33;
      const dialR = Math.min(W * 0.16, H * 0.135);

      ctx.save();
      // Fondo del dial
      ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
      ctx.shadowColor = 'rgba(35, 44, 54, 0.10)';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(dialX, dialY, dialR + 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.4;
      ctx.stroke();

      // Arcos de colores de seguridad / sobrecarga
      const startAngle = Math.PI * 0.75;
      const endAngle = Math.PI * 2.25;
      const totalAngle = endAngle - startAngle;

      // Sector Verde (Fisiológico 0 - 50%)
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 5.5;
      ctx.beginPath();
      ctx.arc(dialX, dialY, dialR, startAngle, startAngle + totalAngle * 0.50);
      ctx.stroke();

      // Sector Ámbar (Esfuerzo 50 - 80%)
      ctx.strokeStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(dialX, dialY, dialR, startAngle + totalAngle * 0.50, startAngle + totalAngle * 0.80);
      ctx.stroke();

      // Sector Rojo (Fallo tisular 80 - 100%)
      ctx.strokeStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(dialX, dialY, dialR, startAngle + totalAngle * 0.80, endAngle);
      ctx.stroke();

      // Ticks y marcas del cuadrante
      for (let i = 0; i <= 10; i++) {
        const a = startAngle + (i / 10) * totalAngle;
        const isMajor = i % 2 === 0;
        const r1 = dialR - 5;
        const r2 = dialR - (isMajor ? 11 : 8);
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = isMajor ? 1.3 : 0.7;
        ctx.beginPath();
        ctx.moveTo(dialX + Math.cos(a) * r1, dialY + Math.sin(a) * r1);
        ctx.lineTo(dialX + Math.cos(a) * r2, dialY + Math.sin(a) * r2);
        ctx.stroke();
      }

      // Aguja analógica
      const needleAngle = startAngle + curValNorm * totalAngle;
      ctx.save();
      ctx.translate(dialX, dialY);
      ctx.rotate(needleAngle);

      // Sombra aguja
      ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
      ctx.beginPath();
      ctx.moveTo(-2.5, 2.5);
      ctx.lineTo(dialR - 7, 1.5);
      ctx.lineTo(-2.5, -1);
      ctx.fill();

      // Aguja de precisión
      ctx.fillStyle = '#b02318';
      ctx.beginPath();
      ctx.moveTo(-3.5, 0);
      ctx.lineTo(-1.8, 2.5);
      ctx.lineTo(dialR - 5, 0);
      ctx.lineTo(-1.8, -2.5);
      ctx.closePath();
      ctx.fill();

      // Centro pivote
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Rótulo central digital en el dial
      ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
      ctx.strokeStyle = '#0d6e64';
      ctx.lineWidth = 0.9;
      const dW = 76;
      const dH = 16;
      ctx.roundRect(dialX - dW / 2, dialY + dialR * 0.35, dW, dH, 3.5);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#0d6e64';
      ctx.font = 'bold 7px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      const readVal =
        quantityType === 'pressure'
          ? `${(inputValue / 1e6).toFixed(2)} MPa`
          : quantityType === 'torque'
          ? `${inputValue} N·m`
          : `${inputValue} N`;
      ctx.fillText(readVal, dialX, dialY + dialR * 0.35 + 10.8);
      ctx.restore();

      // ─── 5. Escala de Referencias Fisiológicas Reales (Abajo a la Derecha) ───
      const refX = W * 0.58;
      const refY = H * 0.52;
      const refW = W * 0.38;
      const refH = H * 0.40;

      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
      ctx.shadowColor = 'rgba(35, 44, 54, 0.08)';
      ctx.shadowBlur = 7;
      ctx.roundRect(refX, refY, refW, refH, 6);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#0d6e64';
      ctx.lineWidth = 1.3;
      ctx.strokeRect(refX, refY, refW, refH);

      ctx.fillStyle = '#0d6e64';
      ctx.font = 'bold 8px Karla, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('BENCHMARKS FISIOLÓGICOS (Haz clic para cargar)', refX + refW / 2, refY + 13);

      const refItemH = (refH - 20) / curRefs.length;
      curRefs.forEach((r, idx) => {
        const ry = refY + 18 + idx * refItemH;
        const isMatched = Math.abs(inputValue - r.siValue) < r.siValue * 0.05;
        const isHov = hoveredBenchRef.current === idx;

        if (isMatched || isHov) {
          ctx.fillStyle = isMatched ? 'rgba(13, 110, 100, 0.12)' : 'rgba(13, 110, 100, 0.05)';
          ctx.fillRect(refX + 3, ry - 2, refW - 6, refItemH - 2);
          ctx.strokeStyle = '#0d6e64';
          ctx.lineWidth = 0.9;
          ctx.strokeRect(refX + 3, ry - 2, refW - 6, refItemH - 2);
        }

        // Punto de estado de zona
        ctx.fillStyle = r.zone === 'danger' ? '#ef4444' : (r.zone === 'caution' ? '#f59e0b' : '#10b981');
        ctx.beginPath();
        ctx.arc(refX + 10, ry + 7, 3.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 7.2px Karla, system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(r.name, refX + 18, ry + 6.5);

        ctx.fillStyle = '#0d6e64';
        ctx.font = 'bold 7.2px JetBrains Mono, monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`${r.siValue} ${r.unitSi}`, refX + refW - 6, ry + 6.5);

        ctx.fillStyle = '#64748b';
        ctx.font = '6.2px Karla, system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`≈ ${r.altValue} · ${r.note}`, refX + 18, ry + 15);
      });
      ctx.restore();

      // ─── 6. Cabecera Superior del Canvas ───
      ctx.fillStyle = 'var(--ink, #232c36)';
      ctx.font = 'bold 11.5px Karla, system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`CONVERSOR DE UNIDADES BIOMECÁNICAS: ${quantityType.toUpperCase()}`, W * 0.045, 22);

      ctx.fillStyle = 'rgba(107, 120, 133, 0.9)';
      ctx.font = '8px Karla, system-ui, sans-serif';
      ctx.fillText('Equivalencias exactas, tacómetro de carga tisular y benchmarks anatómicos humanos.', W * 0.045, 35);

      ctx.restore();
      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [quantityType, inputValue, onSelectBenchmark]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
    </div>
  );
}
