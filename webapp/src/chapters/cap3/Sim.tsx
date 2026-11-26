import { useContext, useEffect, useRef, useState } from 'react';
import { EngineContext } from './useEngine';
import CanvasReserveState from './CanvasReserveState';

/**
 * Lienzo 2D de una diapositiva. Dimensiona su buffer al contenedor (DPR ≤ 2) y
 * pide UN repintado al montarse y en cada cambio de tamaño; no tiene bucle
 * propio. Si el navegador no entrega contexto 2D, muestra `CanvasReserveState`.
 */
export default function Sim({ id, className, label = 'Simulación 2D' }: { id: string; className?: string; label?: string }) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const engine = useContext(EngineContext);
  const requestDraw = engine?.requestDraw;
  const [reserve, setReserve] = useState(false);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    if (!cv.getContext('2d')) {
      setReserve(true);
      return;
    }
    const host = cv.parentElement;
    const apply = () => {
      const w = Math.max(1, host?.clientWidth || cv.clientWidth || 300);
      const h = Math.max(1, host?.clientHeight || cv.clientHeight || 200);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const bw = Math.round(w * dpr);
      const bh = Math.round(h * dpr);
      if (cv.width !== bw) cv.width = bw;
      if (cv.height !== bh) cv.height = bh;
    };
    apply();
    const ro = new ResizeObserver(() => {
      apply();
      requestDraw?.();
    });
    if (host) ro.observe(host);
    requestDraw?.();
    return () => ro.disconnect();
  }, [requestDraw, id]);

  return (
    <div className="sim-stage">
      <canvas id={id} ref={ref} className={className || 'sim'} role="img" aria-label={label} />
      {reserve && <CanvasReserveState label={label} />}
    </div>
  );
}
