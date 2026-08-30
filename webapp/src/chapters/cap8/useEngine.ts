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
  togglePVLoop: () => void;
  togglePulsatile: () => void;
  toggleWindkessel: () => void;
  toggleEjection: () => void;
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

  const togglePVLoop = useCallback(() => {
    const playing = !flagsRef.current.pvPlaying;
    flagsRef.current = { ...flagsRef.current, pvPlaying: playing, pvT: playing ? 0 : flagsRef.current.pvT };
  }, []);

  const togglePulsatile = useCallback(() => {
    const playing = !flagsRef.current.rpPlaying;
    flagsRef.current = { ...flagsRef.current, rpPlaying: playing, rpT: playing ? 0 : flagsRef.current.rpT };
  }, []);

  const toggleWindkessel = useCallback(() => {
    const playing = !flagsRef.current.wkPlaying;
    flagsRef.current = { ...flagsRef.current, wkPlaying: playing, wkT: playing ? 0 : flagsRef.current.wkT };
  }, []);

  const toggleEjection = useCallback(() => {
    const playing = !flagsRef.current.efPlaying;
    flagsRef.current = { ...flagsRef.current, efPlaying: playing, efT: playing ? 0 : flagsRef.current.efT };
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
    const mod = MODULES.find(x => x.id === m);
    if (mod) {
      current.current = mod.slides[0];
      setActiveSlide(current.current);
    }
  }, []);

  const out: (id: string, text: string) => void = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };

  const requestDraw = useCallback(() => {
    redrawSlide(current.current, tRef.current, paramsRef.current, flagsRef.current, out);
  }, []);

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
      if (!reduce) {
        tRef.current += dt;
        flagsRef.current.reT += dt * 1.5;
        if (flagsRef.current.pvPlaying) flagsRef.current.pvT += dt;
        if (flagsRef.current.rpPlaying) flagsRef.current.rpT += dt;
        if (flagsRef.current.wkPlaying) flagsRef.current.wkT += dt;
        if (flagsRef.current.efPlaying) flagsRef.current.efT += dt;
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
    togglePVLoop,
    togglePulsatile,
    toggleWindkessel,
    toggleEjection,
    requestDraw,
    moduleOf: (i: number) => moduleOf(i),
  };
}
