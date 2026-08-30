import React, { useRef, useEffect } from 'react';
import { drawMobility } from './sims';

interface MobilityCanvasProps {
  selectedJoint: string; // 'hombro-flex', 'codo', etc.
}

export default function MobilityCanvas({
  selectedJoint,
}: MobilityCanvasProps) {
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

      if (typeof drawMobility === 'function') {
        drawMobility(selectedJoint);
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [selectedJoint]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <canvas
        id="sim-mobility"
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
    </div>
  );
}
