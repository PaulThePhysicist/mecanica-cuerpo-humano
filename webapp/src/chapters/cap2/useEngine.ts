import React, { useCallback, useEffect, useRef, useState } from 'react';
import { MODULES, TOTAL, DEFAULT_PARAMS, DEFAULT_FLAGS, redrawSlide } from './sims';
import type { SimParams, SimFlags } from './sims';

// Contexto para que <Sim> pueda autopintarse al aparecer/cambiar de tamaño,
// sin depender del loop rAF global (que en algunos navegadores puede no
// dispararse en el frame oportuno tras activar un slide).
export const EngineContext = React.createContext<Engine | null>(null);

export interface Engine {
  activeSlide: number;
  go: (n: number) => void;
  next: () => void;
  prev: () => void;
  goModule: (m: number) => void;
  paramsRef: React.MutableRefObject<SimParams>;
  flagsRef: React.MutableRefObject<SimFlags>;
  clockRef: React.MutableRefObject<number>;
  setParam: <K extends keyof SimParams>(k: K, v: SimParams[K]) => void;
  setFlag: <K extends keyof SimFlags>(k: K, v: SimFlags[K]) => void;
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
  const tRef = useRef(0);
  const lastRef = useRef(performance.now());
  const paramsRef = useRef<SimParams>({ ...DEFAULT_PARAMS });
  const flagsRef = useRef<SimFlags>({ ...DEFAULT_FLAGS });

  const setParam = useCallback(<K extends keyof SimParams>(k: K, v: SimParams[K]) => {
    paramsRef.current = { ...paramsRef.current, [k]: v };
  }, []);

  const setFlag = useCallback(<K extends keyof SimFlags>(k: K, v: SimFlags[K]) => {
    flagsRef.current = { ...flagsRef.current, [k]: v };
  }, []);

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

  // Redibuja el slide activo una vez (síncrono, sin depender del loop rAF).
  // Lo usan <Sim> (al aparecer/cambiar tamaño) y Capitulo2 (al cambiar de slide)
  // para garantizar que el canvas se pinte aunque el loop global no dispare.
  const out: (id: string, text: string) => void = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };
  const requestDraw = useCallback(() => {
    redrawSlide(current.current, tRef.current, paramsRef.current, flagsRef.current, out);
  }, []);

  // Render loop global: cada frame redibuja el slide activo con el reloj t
  // (window.c2t) para la vida ambiental. redrawSlide ya itera los canvas del
  // slide y además recalcula el convertidor (slide 17). Idéntico al motor legacy.
  useEffect(() => {
    let raf = 0;
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    const out: (id: string, text: string) => void = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - lastRef.current) / 1000);
      lastRef.current = now;
      if (!reduce) tRef.current += dt;
      // Redibujar el slide activo (maneja canvas + slide 17 convertidor).
      // Segundo intento tras asentar layout para evitar canvas en blanco.
      redrawSlide(current.current, tRef.current, paramsRef.current, flagsRef.current, out);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    // Re-dibujar al cambiar tamaño y al cargar fuentes (KaTeX + Karla).
    const onResize = () => redrawSlide(current.current, tRef.current, paramsRef.current, flagsRef.current, out);
    window.addEventListener('resize', onResize);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return { activeSlide, go, next, prev, goModule, paramsRef, flagsRef, clockRef: tRef, setParam, setFlag, requestDraw, moduleOf: (i: number) => moduleOf(i) };
}
