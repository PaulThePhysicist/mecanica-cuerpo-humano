import React, { useCallback, useEffect, useRef, useState } from 'react';
import { MODULES, TOTAL, redrawSlide } from './sims';

// Contexto para que <Sim> se autopinte al aparecer/cambiar de tamaño sin
// depender del loop rAF global (corrige el bug de canvas en blanco hasta
// pulsar un botón, igual que en cap2).
export const EngineContext = React.createContext<any>(null);

export interface Engine {
  activeSlide: number;
  go: (n: number) => void;
  next: () => void;
  prev: () => void;
  goModule: (m: number) => void;
  requestDraw: () => void;
  moduleOf: (i: number) => typeof MODULES[number];
}

const moduleOf = (i: number) => {
  for (const m of MODULES) if (m.slides.includes(i)) return m;
  return MODULES[0];
};

export function useEngine(): Engine {
  const [activeSlide, setActiveSlide] = useState(0);
  const current = useRef(0);

  // ── Repintado por "ráfaga de asentamiento" ──────────────────────────────
  // Antes había un rAF global que llamaba a redrawSlide() 60 veces por segundo
  // para siempre: en los slides 4–15 eso repinta el canvas 2D entero cada
  // frame aunque la diapositiva esté quieta (CPU al ~10 % en reposo).
  //
  // Ya no hace falta: las animaciones ("Animar") tienen su propio rAF
  // autolimitado en sims.ts, los canvas React (slides 8–11) tienen el suyo, y
  // los sliders/tablas llaman a su draw directamente. El loop global solo
  // servía para (a) la primera pintura y (b) reasentar tras un cambio de
  // layout. Para eso basta con repintar unos ~30 frames tras cada wake y
  // luego parar.
  const settleFrames = useRef(0);
  const rafRef = useRef(0);

  const tick = useCallback(() => {
    if (settleFrames.current > 0) {
      settleFrames.current -= 1;
      redrawSlide(current.current);
      rafRef.current = requestAnimationFrame(tick);
    } else {
      rafRef.current = 0;
    }
  }, []);

  const wake = useCallback(() => {
    settleFrames.current = 30;
    if (!rafRef.current) rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const go = useCallback((n: number) => {
    if (n === undefined || isNaN(n)) return;
    n = Math.max(0, Math.min(TOTAL - 1, n));
    current.current = n;
    setActiveSlide(n);
    wake();
  }, [wake]);

  const next = useCallback(() => { current.current = Math.min(TOTAL - 1, current.current + 1); setActiveSlide(current.current); wake(); }, [wake]);
  const prev = useCallback(() => { current.current = Math.max(0, current.current - 1); setActiveSlide(current.current); wake(); }, [wake]);
  const goModule = useCallback((m: number) => {
    const mod = MODULES.find(x => x.id === m);
    if (mod) { current.current = mod.slides[0]; setActiveSlide(current.current); wake(); }
  }, [wake]);

  const requestDraw = useCallback(() => {
    redrawSlide(current.current);
    wake();
  }, [wake]);

  // Primera pintura + reasentado al redimensionar la ventana. En reposo no
  // hay ningún rAF vivo.
  useEffect(() => {
    wake();
    const onResize = () => { redrawSlide(current.current); wake(); };
    window.addEventListener('resize', onResize);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      window.removeEventListener('resize', onResize);
    };
  }, [wake]);

  return { activeSlide, go, next, prev, goModule, requestDraw, moduleOf: (i: number) => moduleOf(i) };
}
