import React, { useRef, useEffect } from 'react';
import { drawBodyProportions } from './sims';

interface StandardHumanCanvasProps {
  mass: number;     // en kg (40 a 130)
  height: number;   // en cm (140 a 210)
  selectedParam?: string | null;
  onParamSelect?: (param: string) => void;
}

export default function StandardHumanCanvas({
  mass,
  height,
}: StandardHumanCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const animTimeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let last = performance.now();

    const loop = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      animTimeRef.current += dt;
      (window as any).c2t = animTimeRef.current;

      // Sincronizar elementos auxiliares si existen
      const massSlider = document.getElementById('massSlider') as HTMLInputElement;
      if (massSlider) massSlider.value = String(mass);
      const massDisplay = document.getElementById('massDisplay');
      if (massDisplay) massDisplay.textContent = mass + ' kg';

      const heightSlider = document.getElementById('heightSlider') as HTMLInputElement;
      if (heightSlider) heightSlider.value = String(height);
      const heightDisplay = document.getElementById('heightDisplay');
      if (heightDisplay) heightDisplay.textContent = height + ' cm';

      // Ejecutar el motor de renderizado anatómico CFX completo
      if (typeof drawBodyProportions === 'function') {
        drawBodyProportions(mass, height);
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [mass, height]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <canvas
        id="sim-body"
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
    </div>
  );
}
