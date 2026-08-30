import React, { useCallback, useEffect, useRef, useState } from 'react';
import { MODULES, TOTAL, DEFAULT_PARAMS, DEFAULT_FLAGS, redrawSlide } from './sims';
import type { SimParams, SimFlags } from './sims';

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

export const EngineContext = React.createContext<Engine | null>(null);

const moduleOf = (i: number) => {
  for (const m of MODULES) {
    if (m.slides.includes(i)) return m;
  }
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

  const out = (id: string, text: string) => {
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

      // Actualizaciones de tiempo para simulaciones animadas del capítulo 7
      if (current.current === 6 && flagsRef.current.spPlaying) {
        flagsRef.current.spT = (flagsRef.current.spT || 0) + dt * 0.8;
      }
      if (current.current === 7 && flagsRef.current.ryPlaying) {
        flagsRef.current.ryT = (flagsRef.current.ryT || 0) + dt * 1.0;
      }
      if (current.current === 8) {
        flagsRef.current.veT = (flagsRef.current.veT || 0) + dt * 1.0;
      }
      if (current.current === 9) {
        flagsRef.current.stT = (flagsRef.current.stT || 0) + dt * 0.8;
      }
      if (current.current === 14 && flagsRef.current.inPlaying) {
        flagsRef.current.inT = (flagsRef.current.inT || 0) + dt * 1.0;
      }
      if (current.current === 17 && flagsRef.current.dfPlaying) {
        flagsRef.current.dfT = (flagsRef.current.dfT || 0) + dt * 0.4;
      }
      if (current.current === 19 && flagsRef.current.flPlaying) {
        flagsRef.current.flT = (flagsRef.current.flT || 0) + dt * 0.06;
      }
      if (current.current === 21 && flagsRef.current.swPlaying) {
        flagsRef.current.swT = (flagsRef.current.swT || 0) + dt * 0.6;
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
