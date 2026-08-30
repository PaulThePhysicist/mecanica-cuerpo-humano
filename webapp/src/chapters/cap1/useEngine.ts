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

  const go = useCallback((n: number) => {
    if (n === undefined || isNaN(n)) return;
    n = Math.max(0, Math.min(TOTAL - 1, n));
    current.current = n;
    setActiveSlide(n);
  }, []);

  const next = useCallback(() => { current.current = Math.min(TOTAL - 1, current.current + 1); setActiveSlide(current.current); }, []);
  const prev = useCallback(() => { current.current = Math.max(0, current.current - 1); setActiveSlide(current.current); }, []);
  const goModule = useCallback((m: number) => {
    const mod = MODULES.find(x => x.id === m);
    if (mod) { current.current = mod.slides[0]; setActiveSlide(current.current); }
  }, []);

  const requestDraw = useCallback(() => {
    redrawSlide(current.current);
  }, []);

  // Loop rAF global: redibuja el slide activo cada frame. El motor 2D de cap1
  // ya tiene sus propias animaciones (startGLRaf etc.) que se auto-ejecutan al
  // pulsar "Animar"; este loop mantiene pintado el slide y refleja sliders sin
  // animación. Igual que el motor legacy (redrawSlide en el rAF de go/resize).
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      redrawSlide(current.current);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    const onResize = () => redrawSlide(current.current);
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return { activeSlide, go, next, prev, goModule, requestDraw, moduleOf: (i: number) => moduleOf(i) };
}
