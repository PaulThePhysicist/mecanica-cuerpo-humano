import React, { useContext, useEffect, useRef } from 'react';
import { EngineContext } from './useEngine';

/**
 * Canvas registrado por `id` (debe coincidir con los ids del HTML original,
 * p.ej. "sim-bi"). El engine (useEngine) lo dibuja vía getElementById o redrawSlide.
 * Aplica DPR y se reescala con ResizeObserver.
 *
 * Auto-pintado: cuando el canvas obtiene tamaño (el slide pasa de
 * display:none a visible, o cambia el tamaño de ventana), dispara
 * engine.requestDraw() para garantizar que se dibuje de inmediato.
 */
export default function Sim({ id, className }: { id: string; className?: string }) {
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

  return <canvas id={id} ref={ref} className={className || 'sim'} aria-hidden="true" />;
}
