import { useEffect, useRef } from 'react';

/**
 * Reloj de animación compartido para las escenas. Un solo bucle
 * `requestAnimationFrame`, frame-rate independiente (`dt` acotado a 0.1 s).
 *
 *   useHarmonicClock({ playing: isAnimating, speed: animSpeed }, (t) => {
 *     setProgress((Math.sin(t * 1.8) + 1) / 2);
 *   });
 *
 * `tick` puede cambiar en cada render sin reiniciar el bucle (se lee por ref).
 * El bucle solo se reinicia si cambian `playing` o `speed`. `resetOn` pone el
 * tiempo acumulado a 0 cuando su valor cambia (útil al cambiar de preset).
 */
export function useHarmonicClock(
  { playing, speed = 1 }: { playing: boolean; speed?: number },
  tick: (t: number, dt: number) => void,
  resetOn?: unknown,
) {
  const tickRef = useRef(tick);
  tickRef.current = tick;
  const tRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    tRef.current = 0;
  }, [resetOn]);

  useEffect(() => {
    if (!playing) {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      return;
    }
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000) * speed;
      last = now;
      tRef.current += dt;
      tickRef.current(tRef.current, dt);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [playing, speed]);
}
