import React, { useRef, useEffect } from 'react';
import { CFX, CFXBody } from './sims';

interface BMICalculatorCanvasProps {
  mass: number;     // en kg (40 a 160)
  height: number;   // en metros (1.40 a 2.10)
  gender?: 'H' | 'M';
}

export default function BMICalculatorCanvas({
  mass,
  height,
  gender = 'H',
}: BMICalculatorCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const animTimeRef = useRef<number>(0);
  const curStateRef = useRef<{ mass: number; height: number; bmi: number; A: number }>({
    mass,
    height,
    bmi: mass / (height * height),
    A: 0.202 * Math.pow(mass, 0.425) * Math.pow(height, 0.725),
  });

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

      // La diapositiva puede estar oculta (display:none) o en plena transición:
      // getBoundingClientRect devuelve 0×0 y toda la geometría derivada
      // (radios de los diales, discos) degenera y ctx.arc() lanza IndexSizeError.
      // Saltar el frame y reintentar cuando haya layout.
      if (W < 8 || H < 8) {
        rafRef.current = requestAnimationFrame(render);
        return;
      }

      const scale = Math.max(1, Math.min(1.55, W / 420));
      const scaled = (size: number) => size * scale;

      if (canvas.width !== W * dpr || canvas.height !== H * dpr) {
        canvas.width = W * dpr;
        canvas.height = H * dpr;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        rafRef.current = requestAnimationFrame(render);
        return;
      }

      // Suavizado exponencial hacia los valores target
      const targetBMI = mass / (height * height);
      const targetA = 0.202 * Math.pow(mass, 0.425) * Math.pow(height, 0.725);
      const easeSpeed = 8.0;
      const cur = curStateRef.current;
      cur.mass += (mass - cur.mass) * Math.min(1, dt * easeSpeed);
      cur.height += (height - cur.height) * Math.min(1, dt * easeSpeed);
      cur.bmi += (targetBMI - cur.bmi) * Math.min(1, dt * easeSpeed);
      cur.A += (targetA - cur.A) * Math.min(1, dt * easeSpeed);

      const bmi = cur.bmi;
      const A = cur.A;
      const S = cur.height / Math.pow(cur.mass, 1 / 3);
      const rho = 0.69 + 0.9 * S;
      const fatPct = gender === 'H' ? 1.28 * bmi - 10.1 : 1.48 * bmi - 7.0;
      const fatKg = (fatPct / 100) * cur.mass;
      const leanKg = cur.mass - fatKg;

      let cat = 'Normal';
      let catColor = '#0d6e64';
      if (bmi < 18.5) {
        cat = 'Bajo peso';
        catColor = '#b86a1e';
      } else if (bmi < 25) {
        cat = 'Normal';
        catColor = '#0d6e64';
      } else if (bmi < 30) {
        cat = 'Sobrepeso';
        catColor = '#9a5b00';
      } else {
        cat = 'Obesidad';
        catColor = '#a92a1e';
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, W, H);

      // ─── 1. Fondo de estudio anatómico con viñeta cálida ───
      const bgGrad = ctx.createRadialGradient(W * 0.4, H * 0.45, 20, W * 0.5, H * 0.5, Math.max(W, H) * 0.75);
      bgGrad.addColorStop(0, '#f8f3e8');
      bgGrad.addColorStop(0.55, '#f1eadc');
      bgGrad.addColorStop(1, '#eee4d2');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // ─── 2. Figura Anatómica Adaptativa (Izquierda) ───
      const floorY = H * 0.88;
      const figCenterX = W * 0.28;
      const figH = H * 0.74 * (cur.height / 1.72);
      const figTopY = floorY - figH;

      // Sombra de contacto
      const bmiFactor = Math.max(0.6, Math.min(2.0, bmi / 22));
      ctx.save();
      ctx.fillStyle = 'rgba(35, 44, 54, 0.25)';
      ctx.beginPath();
      ctx.ellipse(figCenterX, floorY + 2, 38 * bmiFactor, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Render de la figura anatómica
      const build = Math.max(0, Math.min(1, (bmi - 16) / 16));
      const fatParam = Math.max(0.08, Math.min(0.95, (bmi - 14) / 24));
      const cfxBodyAny = (CFXBody || (window as any).CFXBody) as any;
      const p = cfxBodyAny && typeof cfxBodyAny.buildParams === 'function' ? cfxBodyAny.buildParams(build, 0.5, fatParam) : null;
      const cfxAny = (CFX || (window as any).CFX) as any;

      if (cfxAny && typeof cfxAny.figure === 'function' && p) {
        const tint = bmi >= 30 ? '#caa05a' : (bmi >= 25 ? '#d2b483' : (bmi < 18.5 ? '#e8cfa6' : '#dcb277'));
        cfxAny.figure(ctx, figCenterX, figTopY, figH, p, { tint, modeling: true });
      }

      // Cota vertical de Estatura
      if (cfxAny && typeof cfxAny.dimV === 'function') {
        cfxAny.dimV(
          ctx,
          figCenterX - 55 * bmiFactor,
          figTopY,
          floorY,
          `${(cur.height * 100).toFixed(0)} cm`,
          '#43505c',
          { side: 'left', W }
        );
      }

      // Lectura de masa bajo los pies
      ctx.fillStyle = '#232c36';
      ctx.font = `bold ${scaled(11)}px JetBrains Mono, monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(`${cur.mass.toFixed(1)} kg`, figCenterX, floorY + 16);

      // ─── 3. Cuadro de Instrumentos Biofísicos (Derecha) ───
      const panelX = W * 0.54;
      const panelW = W * 0.43;

      // ── 3.1 Dial Radial de IMC con Sectores OMS ──
      const gaugeCenterX = panelX + panelW * 0.46;
      const gaugeCenterY = H * 0.24;
      const gaugeR = Math.min(panelW * 0.38, H * 0.16);

      const startAngle = Math.PI * 0.8;
      const endAngle = Math.PI * 2.2;
      const totalAngle = endAngle - startAngle;

      // Sectores OMS
      const sectors = [
        { min: 14, max: 18.5, color: '#b86a1e', name: 'Bajo' },
        { min: 18.5, max: 25.0, color: '#0d6e64', name: 'Normal' },
        { min: 25.0, max: 30.0, color: '#d97706', name: 'Sobrepeso' },
        { min: 30.0, max: 42.0, color: '#b02318', name: 'Obesidad' },
      ];

      sectors.forEach((sec) => {
        const a0 = startAngle + ((sec.min - 14) / 28) * totalAngle;
        const a1 = startAngle + ((sec.max - 14) / 28) * totalAngle;
        ctx.beginPath();
        ctx.arc(gaugeCenterX, gaugeCenterY, gaugeR, a0, a1);
        ctx.strokeStyle = sec.color;
        ctx.lineWidth = 9;
        ctx.stroke();
      });

      // Aguja del Dial
      const bmiAngle = startAngle + (Math.max(0, Math.min(28, bmi - 14)) / 28) * totalAngle;
      ctx.save();
      ctx.strokeStyle = catColor;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(gaugeCenterX, gaugeCenterY);
      ctx.lineTo(gaugeCenterX + Math.cos(bmiAngle) * (gaugeR - 2), gaugeCenterY + Math.sin(bmiAngle) * (gaugeR - 2));
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(gaugeCenterX, gaugeCenterY, 5, 0, Math.PI * 2);
      ctx.fillStyle = catColor;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      // Lectura central de IMC
      ctx.fillStyle = catColor;
      ctx.font = `bold ${scaled(15)}px JetBrains Mono, monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(bmi.toFixed(1), gaugeCenterX, gaugeCenterY + 20);

      ctx.font = `bold ${scaled(9)}px Karla, system-ui, sans-serif`;
      ctx.fillText(`IMC · ${cat.toUpperCase()}`, gaugeCenterX, gaugeCenterY + 33);

      // ── 3.2 Disco Térmico Du Bois (Área Superficial) ──
      const discCenterX = panelX + panelW * 0.22;
      const discCenterY = H * 0.56;
      const maxDiscR = panelW * 0.20;
      const curDiscR = maxDiscR * Math.sqrt(Math.max(0.2, Math.min(1.0, A / 2.6)));

      // Ondas térmicas radiativas
      const wavePhase = (t * 2) % 1;
      ctx.save();
      ctx.beginPath();
      ctx.arc(discCenterX, discCenterY, curDiscR + wavePhase * 12, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(13, 110, 100, ${0.4 * (1 - wavePhase)})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Disco base
      ctx.beginPath();
      ctx.arc(discCenterX, discCenterY, curDiscR, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(13, 110, 100, 0.18)';
      ctx.fill();
      ctx.strokeStyle = '#0d6e64';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      ctx.fillStyle = '#0d6e64';
      ctx.font = `bold ${scaled(11)}px JetBrains Mono, monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(`${A.toFixed(2)} m²`, discCenterX, discCenterY + 4);

      ctx.font = `${scaled(8)}px Karla, system-ui, sans-serif`;
      ctx.fillStyle = '#17212b';
      ctx.fillText('Área Du Bois (Eq. 1.2)', discCenterX, discCenterY + curDiscR + 13);
      ctx.restore();

      // ── 3.3 Medidor Hidrostático de Densidad y Flotabilidad (ρ) ──
      const tubeX = panelX + panelW * 0.72;
      const tubeY = H * 0.45;
      const tubeW = 26;
      const tubeH = H * 0.22;

      ctx.save();
      // Tubo de ensayo
      ctx.fillStyle = 'rgba(230, 240, 250, 0.7)';
      ctx.fillRect(tubeX, tubeY, tubeW, tubeH);
      ctx.strokeStyle = 'rgba(67, 80, 92, 0.4)';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(tubeX, tubeY, tubeW, tubeH);

      // Nivel de agua dulce (1.0 kg/L)
      const waterY = tubeY + tubeH * 0.5;
      ctx.fillStyle = 'rgba(56, 161, 243, 0.25)';
      ctx.fillRect(tubeX, waterY, tubeW, tubeY + tubeH - waterY);

      // Marcador de flotación del cuerpo
      const bodyFloatY = tubeY + tubeH * Math.max(0.1, Math.min(0.9, (rho - 0.95) / 0.15));
      ctx.fillStyle = rho < 1.0 ? '#2e8b57' : '#b02318';
      ctx.beginPath();
      ctx.arc(tubeX + tubeW / 2, bodyFloatY, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.fillStyle = '#232c36';
      ctx.font = `bold ${scaled(9)}px JetBrains Mono, monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(`ρ = ${rho.toFixed(3)} kg/L`, tubeX + tubeW / 2, tubeY + tubeH + 14);

      ctx.font = `${scaled(7.5)}px Karla, system-ui, sans-serif`;
      ctx.fillStyle = rho < 1.0 ? '#2e8b57' : '#b02318';
      ctx.fillText(rho < 1.0 ? '🏊 Flota en agua' : '⚓ Se hunde en agua', tubeX + tubeW / 2, tubeY + tubeH + 26);
      ctx.restore();

      // ── 3.4 Barra Segmentada de Composición Corporal (Masa Magra vs Grasa) ──
      const barX = panelX;
      const barY = H * 0.75;
      const barW = panelW * 0.92;
      const barH = 16;

      const leanW = Math.max(10, Math.min(barW - 10, (leanKg / cur.mass) * barW));
      const fatW = barW - leanW;

      ctx.save();
      // Masa Magra (Músculo/Hueso)
      ctx.fillStyle = '#0d6e64';
      ctx.fillRect(barX, barY, leanW, barH);

      // Masa Grasa
      ctx.fillStyle = '#d97706';
      ctx.fillRect(barX + leanW, barY, fatW, barH);

      ctx.strokeStyle = 'rgba(35, 44, 54, 0.4)';
      ctx.lineWidth = 1;
      ctx.strokeRect(barX, barY, barW, barH);

      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${scaled(8)}px Karla, system-ui, sans-serif`;
      ctx.textAlign = 'center';
      if (leanW > 40) ctx.fillText(`Magra: ${leanKg.toFixed(1)} kg`, barX + leanW / 2, barY + 11);
      if (fatW > 35) ctx.fillText(`Grasa: ${fatKg.toFixed(1)} kg`, barX + leanW + fatW / 2, barY + 11);

      ctx.fillStyle = '#17212b';
      ctx.font = `${scaled(8)}px Karla, system-ui, sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText(`Composición: Magra ${(100 - fatPct).toFixed(1)}%  ·  Grasa ${fatPct.toFixed(1)}% (${gender === 'H' ? 'Varón' : 'Mujer'})`, barX, barY + barH + 12);
      ctx.restore();

      ctx.restore();
      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [mass, height, gender]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
    </div>
  );
}
