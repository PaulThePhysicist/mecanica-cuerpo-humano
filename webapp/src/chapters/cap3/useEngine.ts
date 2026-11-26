import React, { useCallback, useEffect, useRef, useState } from 'react';
import { MODULES, TOTAL, DEFAULT_PARAMS, DEFAULT_FLAGS, redrawSlide, isAnimating, stepSlide } from './sims';
import type { SimParams, SimFlags } from './sims';
import { useHarmonicClock } from '../cap1/three/useHarmonicClock';

export const EngineContext = React.createContext<Engine | null>(null);

export interface Engine {
  activeSlide: number;
  go: (n: number) => void;
  next: () => void;
  prev: () => void;
  goModule: (m: number) => void;
  paramsRef: React.MutableRefObject<SimParams>;
  flagsRef: React.MutableRefObject<SimFlags>;
  /** Cambia un parámetro continuo (slider). No re-renderiza React; repinta con `requestDraw`. */
  setParam: <K extends keyof SimParams>(k: K, v: SimParams[K]) => void;
  /** Cambia un flag discreto (modo, ▶/⏸). Re-renderiza para que los botones reflejen el estado. */
  setFlag: <K extends keyof SimFlags>(k: K, v: SimFlags[K]) => void;
  /** Repinta una vez el lienzo de la diapositiva activa. */
  requestDraw: () => void;
  moduleOf: (i: number) => (typeof MODULES)[number];
}

const moduleOf = (i: number) => {
  for (const m of MODULES) if (m.slides.includes(i)) return m;
  return MODULES[0];
};

/** La lectura (`.readout`) la escribe solo el motor — la diapositiva la deja vacía. */
const out = (id: string, text: string) => {
  const el = document.getElementById(id);
  if (el && el.textContent !== text) el.textContent = text;
};

/** Sliders cuyo valor avanza una animación: se sincronizan por id. */
const ANIMATED_SLIDERS: Partial<Record<number, keyof SimParams>> = { 3: 'gait_t', 12: 'ph_t' };

/**
 * Motor del Cap. 3 — repintado BAJO DEMANDA.
 *
 * Antes había un `requestAnimationFrame` perpetuo que llamaba a `redrawSlide()`
 * a 60 fps aunque la diapositiva estuviera quieta (AUDITORIA_CAP3 T-01). Ahora:
 *   · sliders, cambio de tamaño, carga de fuentes y navegación → `requestDraw()`
 *     (un solo repintado);
 *   · solo si la diapositiva visible tiene una animación activa (`isAnimating`)
 *     corre `useHarmonicClock` (un rAF, dt ≥ 0 acotado a 0,1 s), que se detiene
 *     al pausar, al terminar la animación o al cambiar de diapositiva.
 */
export function useEngine(): Engine {
  const [activeSlide, setActiveSlide] = useState(0);
  const [, setVersion] = useState(0);
  const current = useRef(0);
  const paramsRef = useRef<SimParams>({ ...DEFAULT_PARAMS });
  const flagsRef = useRef<SimFlags>({ ...DEFAULT_FLAGS });

  const bump = useCallback(() => setVersion((v) => v + 1), []);

  const requestDraw = useCallback(() => {
    redrawSlide(current.current, paramsRef.current, flagsRef.current, out);
  }, []);

  const setParam = useCallback(<K extends keyof SimParams>(k: K, v: SimParams[K]) => {
    paramsRef.current = { ...paramsRef.current, [k]: v };
  }, []);

  const setFlag = useCallback(
    <K extends keyof SimFlags>(k: K, v: SimFlags[K]) => {
      flagsRef.current = { ...flagsRef.current, [k]: v };
      bump();
    },
    [bump],
  );

  const go = useCallback((n: number) => {
    if (n === undefined || Number.isNaN(n)) return;
    current.current = Math.max(0, Math.min(TOTAL - 1, n));
    setActiveSlide(current.current);
  }, []);
  const next = useCallback(() => go(current.current + 1), [go]);
  const prev = useCallback(() => go(current.current - 1), [go]);
  const goModule = useCallback(
    (m: number) => {
      const mod = MODULES.find((x) => x.id === m);
      if (mod) go(mod.slides[0]);
    },
    [go],
  );

  // Reloj de animación: solo existe mientras hay algo que animar en la diapositiva visible.
  const playing = isAnimating(activeSlide, flagsRef.current);
  useHarmonicClock({ playing }, (_t, dt) => {
    const slide = current.current;
    const finished = stepSlide(slide, dt, paramsRef.current, flagsRef.current);
    const key = ANIMATED_SLIDERS[slide];
    if (key) {
      const el = document.getElementById(key) as HTMLInputElement | null;
      if (el) el.value = String(paramsRef.current[key]);
    }
    requestDraw();
    if (finished) bump();
  });

  // Repintado puntual ante cambios de tamaño de ventana y carga de fuentes.
  useEffect(() => {
    window.addEventListener('resize', requestDraw);
    let alive = true;
    document.fonts?.ready.then(() => alive && requestDraw());
    return () => {
      alive = false;
      window.removeEventListener('resize', requestDraw);
    };
  }, [requestDraw]);

  return {
    activeSlide,
    go,
    next,
    prev,
    goModule,
    paramsRef,
    flagsRef,
    setParam,
    setFlag,
    requestDraw,
    moduleOf,
  };
}
