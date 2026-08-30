import React, { useCallback, useEffect, useRef, useState } from 'react';
import { MODULES, TOTAL, DEFAULT_PARAMS, DEFAULT_FLAGS, redrawSlide } from './sims';
import type { SimParams, SimFlags } from './sims';

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

  const next = useCallback(() => {
    current.current = Math.min(TOTAL - 1, current.current + 1);
    setActiveSlide(current.current);
  }, []);

  const prev = useCallback(() => {
    current.current = Math.max(0, current.current - 1);
    setActiveSlide(current.current);
  }, []);

  const goModule = useCallback((m: number) => {
    const mod = MODULES.find((x) => x.id === m);
    if (mod) {
      current.current = mod.slides[0];
      setActiveSlide(current.current);
    }
  }, []);

  const out: (id: string, text: string) => void = (id, text) => {
    const elem = document.getElementById(id);
    if (elem) elem.textContent = text;
  };

  const requestDraw = useCallback(() => {
    redrawSlide(current.current, tRef.current, paramsRef.current, flagsRef.current, out);
  }, []);

  useEffect(() => {
    let raf = 0;
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;

    const loop = (now: number) => {
      const dt = Math.min(0.06, (now - lastRef.current) / 1000);
      lastRef.current = now;
      if (!reduce) tRef.current += dt;

      // Actualizaciones de tiempo para simulaciones continuas activas
      if (current.current === 4 && flagsRef.current.smPlaying) {
        flagsRef.current.smT = (flagsRef.current.smT || 0) + dt * 250;
      }
      if (current.current === 6 && flagsRef.current.acPlaying) {
        flagsRef.current.acT = (flagsRef.current.acT || 0) + dt * 250;
      }
      if (current.current === 7 && flagsRef.current.ttPlaying) {
        flagsRef.current.ttT = (flagsRef.current.ttT || 0) + dt * 0.5;
      }
      if (current.current === 14 && flagsRef.current.brPlaying) {
        flagsRef.current.brT = (flagsRef.current.brT || 0) + dt * 0.35;
      }
      if (current.current === 15 && flagsRef.current.dyPlaying) {
        flagsRef.current.dyT = (flagsRef.current.dyT || 0) + dt * 0.5;
      }
      if (current.current === 16 && flagsRef.current.stPlaying) {
        flagsRef.current.stT = (flagsRef.current.stT || 0) + dt * 0.5;
      }

      redrawSlide(current.current, tRef.current, paramsRef.current, flagsRef.current, out);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onResize = () => redrawSlide(current.current, tRef.current, paramsRef.current, flagsRef.current, out);
    window.addEventListener('resize', onResize);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return {
    activeSlide,
    go,
    next,
    prev,
    goModule,
    paramsRef,
    flagsRef,
    clockRef: tRef,
    setParam,
    setFlag,
    requestDraw,
    moduleOf,
  };
}
