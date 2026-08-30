import React, { useCallback, useEffect, useRef, useState } from 'react';
import { MODULES, TOTAL, DEFAULT_PARAMS, DEFAULT_FLAGS, redrawSlide } from './sims';
import type { SimParams, SimFlags, ModuleInfo } from './sims';

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
  toggleAction: () => void;
  toggleEinhoven: () => void;
  toggleECG: () => void;
  toggleMyo: () => void;
  toggleEEG: () => void;
  requestDraw: () => void;
  moduleOf: (i: number) => ModuleInfo;
}

const moduleOf = (i: number): ModuleInfo => {
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
    const out = (id: string, text: string) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };
    redrawSlide(current.current, tRef.current, paramsRef.current, flagsRef.current, out);
  }, []);

  const setFlag = useCallback(<K extends keyof SimFlags>(k: K, v: SimFlags[K]) => {
    flagsRef.current = { ...flagsRef.current, [k]: v };
    const out = (id: string, text: string) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };
    redrawSlide(current.current, tRef.current, paramsRef.current, flagsRef.current, out);
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

  const out = useCallback((id: string, text: string) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }, []);

  const requestDraw = useCallback(() => {
    redrawSlide(current.current, tRef.current, paramsRef.current, flagsRef.current, out);
  }, [out]);

  const toggleAction = useCallback(() => {
    const nextState = !flagsRef.current.apPlaying;
    flagsRef.current.apPlaying = nextState;
    flagsRef.current.apT = 0;
    (window as any).__apPlaying = nextState;
    (window as any).__apT = 0;
    const b = document.getElementById('ap_play');
    if (b) b.textContent = nextState ? '⏸' : '▶';
    redrawSlide(current.current, tRef.current, paramsRef.current, flagsRef.current, out);
  }, [out]);

  const toggleEinhoven = useCallback(() => {
    const nextState = !flagsRef.current.ehPlaying;
    flagsRef.current.ehPlaying = nextState;
    flagsRef.current.ehT = 0;
    (window as any).__ehPlaying = nextState;
    (window as any).__ehT = 0;
    const b = document.getElementById('eh_play');
    if (b) b.textContent = nextState ? '⏸' : '▶';
    redrawSlide(current.current, tRef.current, paramsRef.current, flagsRef.current, out);
  }, [out]);

  const toggleECG = useCallback(() => {
    const nextState = !flagsRef.current.ecPlaying;
    flagsRef.current.ecPlaying = nextState;
    flagsRef.current.ecT = 0;
    (window as any).__ecPlaying = nextState;
    (window as any).__ecT = 0;
    const b = document.getElementById('ec_play');
    if (b) b.textContent = nextState ? '⏸' : '▶';
    redrawSlide(current.current, tRef.current, paramsRef.current, flagsRef.current, out);
  }, [out]);

  const toggleMyo = useCallback(() => {
    const nextState = !flagsRef.current.dcPlaying;
    flagsRef.current.dcPlaying = nextState;
    flagsRef.current.dcT = 0;
    (window as any).__dcPlaying = nextState;
    (window as any).__dcT = 0;
    const b = document.getElementById('dc_play');
    if (b) b.textContent = nextState ? '⏸' : '▶';
    redrawSlide(current.current, tRef.current, paramsRef.current, flagsRef.current, out);
  }, [out]);

  const toggleEEG = useCallback(() => {
    const nextState = !flagsRef.current.egPlaying;
    flagsRef.current.egPlaying = nextState;
    flagsRef.current.egT = 0;
    (window as any).__egPlaying = nextState;
    (window as any).__egT = 0;
    const b = document.getElementById('eg_play');
    if (b) b.textContent = nextState ? '⏸' : '▶';
    redrawSlide(current.current, tRef.current, paramsRef.current, flagsRef.current, out);
  }, [out]);

  // Exponer toggle globalmente para retrocompatibilidad con posibles inline onclick
  useEffect(() => {
    (window as any).toggleAction = toggleAction;
    (window as any).toggleEinhoven = toggleEinhoven;
    (window as any).toggleECG = toggleECG;
    (window as any).toggleMyo = toggleMyo;
    (window as any).toggleEEG = toggleEEG;
    (window as any).go = go;
    (window as any).nextSlide = next;
    (window as any).prevSlide = prev;
    (window as any).goModule = goModule;
    (window as any).redrawSlide = (n: number) =>
      redrawSlide(n, tRef.current, paramsRef.current, flagsRef.current, out);
  }, [toggleAction, toggleEinhoven, toggleECG, toggleMyo, toggleEEG, go, next, prev, goModule, out]);

  // Loop rAF
  useEffect(() => {
    let raf = 0;
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;

    const loop = (now: number) => {
      const dt = Math.min(0.06, (now - lastRef.current) / 1000);
      lastRef.current = now;
      if (!reduce) {
        tRef.current += dt;
        if (current.current === 9 && flagsRef.current.apPlaying) {
          flagsRef.current.apT += dt;
          (window as any).__apT = flagsRef.current.apT;
          redrawSlide(current.current, tRef.current, paramsRef.current, flagsRef.current, out);
        }
        if (current.current === 15 && flagsRef.current.ehPlaying) {
          flagsRef.current.ehT += dt;
          (window as any).__ehT = flagsRef.current.ehT;
          redrawSlide(current.current, tRef.current, paramsRef.current, flagsRef.current, out);
        }
        if (current.current === 16 && flagsRef.current.ecPlaying) {
          flagsRef.current.ecT += dt;
          (window as any).__ecT = flagsRef.current.ecT;
          redrawSlide(current.current, tRef.current, paramsRef.current, flagsRef.current, out);
        }
        if (current.current === 17 && flagsRef.current.dcPlaying) {
          flagsRef.current.dcT += dt;
          (window as any).__dcT = flagsRef.current.dcT;
          redrawSlide(current.current, tRef.current, paramsRef.current, flagsRef.current, out);
        }
        if (current.current === 19 && flagsRef.current.egPlaying) {
          flagsRef.current.egT += dt;
          (window as any).__egT = flagsRef.current.egT;
          redrawSlide(current.current, tRef.current, paramsRef.current, flagsRef.current, out);
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onResize = () => redrawSlide(current.current, tRef.current, paramsRef.current, flagsRef.current, out);
    window.addEventListener('resize', onResize);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(onResize);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, [out]);

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
    toggleAction,
    toggleEinhoven,
    toggleECG,
    toggleMyo,
    toggleEEG,
    requestDraw,
    moduleOf,
  };
}
