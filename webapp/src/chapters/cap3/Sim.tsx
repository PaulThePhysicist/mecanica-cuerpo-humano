import React, { useContext, useEffect, useRef } from 'react';
import { EngineContext } from './useEngine';

export default function Sim({ id, className, label = 'Simulación 2D' }: { id: string; className?: string; label?: string }) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const engine = useContext(EngineContext);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const host = cv.parentElement;
    const apply = () => {
      const w = Math.max(1, host?.clientWidth || cv.clientWidth || 300);
      const h = Math.max(1, host?.clientHeight || cv.clientHeight || 200);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.max(1, Math.round(w * dpr));
      cv.height = Math.max(1, Math.round(h * dpr));
      cv.style.width = '100%';
      cv.style.height = '100%';
    };
    apply();
    const ro = new ResizeObserver(() => {
      apply();
      engine?.requestDraw();
    });
    ro.observe(cv);
    if (host) ro.observe(host);
    engine?.requestDraw();
    return () => ro.disconnect();
  }, [engine, id]);

  return <canvas id={id} ref={ref} className={className || 'sim'} role="img" aria-label={label} />;
}
