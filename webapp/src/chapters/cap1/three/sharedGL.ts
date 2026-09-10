/**
 * Interruptor de «un solo contexto WebGL por capítulo» para cap1.
 *
 * Cuando está activo, los 7 `<Canvas>` de cap1 (uno por `AnatomyStage`) se
 * colapsan en un único `<Canvas>` anfitrión montado en `Capitulo1`, y cada
 * `AnatomyStage` pinta con un `<View>` de `@react-three/drei` (scissor sobre el
 * lienzo compartido). Así se evita el `THREE.WebGLRenderer: Context Lost.` que
 * aparece al acumularse 3+ contextos con la ventana de diapositivas ±1.
 *
 * Precedencia (se lee una sola vez por sesión y se cachea):
 *   1. localStorage.cap1SharedGL === 'on' | 'off'   (para probar en caliente)
 *   2. import.meta.env.VITE_CAP1_SHARED_GL === 'true' | '1'
 *   3. por defecto: OFF
 *
 * Cambiar el valor requiere recargar la página (el flag se fija al arrancar
 * para que `Capitulo1` y `AnatomyStage` nunca discrepen dentro de un render).
 */
let cached: boolean | null = null;

export function sharedGLEnabled(): boolean {
  if (cached !== null) return cached;

  const fromEnv =
    import.meta.env.VITE_CAP1_SHARED_GL === 'true' ||
    import.meta.env.VITE_CAP1_SHARED_GL === '1';

  let value = fromEnv;
  try {
    const ls = window.localStorage.getItem('cap1SharedGL');
    if (ls === 'on') value = true;
    else if (ls === 'off') value = false;
  } catch {
    /* localStorage no disponible (SSR, modo privado) — nos quedamos con la env */
  }

  cached = value;
  return value;
}
