import React, { useContext, useEffect, useRef } from 'react';
import { EngineContext } from './useEngine';

/**
 * Canvas registrado por `id` (p.ej. "sim-distribution", "sim-wave", etc.).
 * El engine (useEngine) lo dibuja vía requestDraw() y rAF.
 * Aplica DPR y se reescala con ResizeObserver (igual que el motor de cátedra).
 *
 * Auto-pintado: cuando el canvas obtiene tamaño (el slide pasa de
 * display:none a visible, o cambia el tamaño de ventana), dispara
 * engine.requestDraw() para garantizar que se dibuje inmediatamente.
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
      // El canvas ya tiene tamaño (o acaba de obtenerlo): fuerza un redibujo.
      engine?.requestDraw();
    });
    ro.observe(cv);
    if (host) ro.observe(host);
    // Pintado inicial garantizado al montar.
    engine?.requestDraw();
    return () => ro.disconnect();
  }, [engine, id]);

  return <canvas id={id} ref={ref} className={className || 'sim'} aria-hidden="true" />;
}
