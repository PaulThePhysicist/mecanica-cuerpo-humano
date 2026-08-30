import React, { useRef, useEffect } from 'react';
import { drawSomatotype } from './sims';

interface SomatotypeCanvasProps {
  selectedType: 'ecto' | 'meso' | 'endo';
}

export default function SomatotypeCanvas({
  selectedType,
}: SomatotypeCanvasProps) {
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

      if (typeof drawSomatotype === 'function') {
        drawSomatotype(selectedType);
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [selectedType]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <canvas
        id="sim-somatotype"
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
    </div>
  );
}
