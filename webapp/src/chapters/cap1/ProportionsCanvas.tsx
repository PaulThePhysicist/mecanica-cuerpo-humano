import React, { useRef, useEffect } from 'react';
import { drawProportions } from './sims';

interface ProportionsCanvasProps {
  height: number;               // en cm (140 a 210)
  highlight?: string | null;     // segmento seleccionado ('cabeza', 'muslo', etc.)
}

export default function ProportionsCanvas({
  height,
  highlight = null,
}: ProportionsCanvasProps) {
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

      const heightSlider = document.getElementById('heightSlider') as HTMLInputElement;
      if (heightSlider) heightSlider.value = String(height);
      const heightDisplay = document.getElementById('heightDisplay');
      if (heightDisplay) heightDisplay.textContent = height + ' cm';

      if (typeof drawProportions === 'function') {
        drawProportions(highlight, height);
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [height, highlight]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <canvas
        id="sim-proportions"
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
    </div>
  );
}
