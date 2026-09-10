import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { Canvas } from '@react-three/fiber';
import { STUDIO_BG } from './materials';

/**
 * «GL compartido» para el capítulo 1 sin drei `<View>`.
 *
 * Un ÚNICO `<Canvas>` (un contexto WebGL) vive durante todo el capítulo,
 * renderizado en un `slot` DOM estable vía `createPortal`. Ese `slot` se MUEVE
 * con `appendChild` al `.three-container` de la diapositiva activa (mover un nodo
 * no destruye su contexto WebGL). Cada `AnatomyStage` montado REGISTRA su escena;
 * el provider elige como activa la del contenedor que está realmente visible
 * (las diapositivas ±1 vecinas están `display:none`) y el host la renderiza en el
 * Canvas persistente.
 *
 * Ventaja sobre `<View>`: el intercambio de escena es un re-render normal de
 * React dentro de un Canvas que nunca se desmonta — sin tunnel-rat, sin parpadeo.
 */

interface StageRegistration {
  /** Contenedor `.three-container` del stage. */
  el: HTMLElement;
  /** Sub-árbol r3f de la escena (cámara, luces, modelo, OrbitControls…). */
  node: React.ReactNode;
  /** Deselección al hacer clic en vacío (equivalente a `onPointerMissed`). */
  onPointerMissed?: () => void;
}

interface SharedStageApi {
  register: (id: string, reg: StageRegistration) => void;
  unregister: (id: string) => void;
}

const SharedStageContext = createContext<SharedStageApi | null>(null);

export function useSharedStage(): SharedStageApi {
  const api = useContext(SharedStageContext);
  if (!api) throw new Error('useSharedStage fuera de <SharedStageProvider>');
  return api;
}

/** ¿El contenedor está realmente pintándose (no `display:none`)? */
function isDisplayed(el: HTMLElement | null | undefined): boolean {
  if (!el || el.offsetParent === null) return false;
  const r = el.getBoundingClientRect();
  return r.width > 1 && r.height > 1;
}

export function SharedStageProvider({ children }: { children: React.ReactNode }) {
  const regsRef = useRef<Map<string, StageRegistration>>(new Map());
  const [activeId, setActiveId] = useState<string | null>(null);
  // `register`/`unregister` repintan SÓLO el host a través de este ref, sin
  // re-renderizar este provider ni los stages que cuelgan de `children`. Antes
  // llamaban a un `bump()` de estado del provider → el `useEffect` sin deps de
  // `SharedGLStage` que registra volvía a correr → `register` otra vez →
  // "Maximum update depth exceeded" al entrar en cualquier slide 3D.
  const hostBumpRef = useRef<() => void>(() => {});

  // Activa = el (único) stage cuyo contenedor está visible en la diapositiva
  // activa. `setActiveId` sólo re-renderiza al CAMBIAR de slide (guardia).
  const recompute = useCallback(() => {
    let next: string | null = null;
    for (const [id, reg] of regsRef.current) {
      if (isDisplayed(reg.el)) {
        next = id;
        break;
      }
    }
    setActiveId((prev) => (prev === next ? prev : next));
  }, []);

  const register = useCallback(
    (id: string, reg: StageRegistration) => {
      regsRef.current.set(id, reg);
      recompute();           // re-render sólo al navegar de slide (setActiveId con guardia)
      hostBumpRef.current(); // repinta el host con el nodo nuevo; no toca provider ni stages
    },
    [recompute],
  );

  const unregister = useCallback(
    (id: string) => {
      if (regsRef.current.delete(id)) {
        recompute();
        hostBumpRef.current();
      }
    },
    [recompute],
  );

  const api = useMemo<SharedStageApi>(() => ({ register, unregister }), [register, unregister]);

  // Red de seguridad: si nadie quedó activo pero hay stages (p.ej. el contenedor
  // aún estaba `display:none` al registrarse), reintenta en el frame siguiente.
  useEffect(() => {
    if (activeId != null || regsRef.current.size === 0) return;
    const raf = requestAnimationFrame(() => recompute());
    return () => cancelAnimationFrame(raf);
  });

  return (
    <SharedStageContext.Provider value={api}>
      {children}
      <SharedStageHost regsRef={regsRef} activeId={activeId} bumpRef={hostBumpRef} />
    </SharedStageContext.Provider>
  );
}

function SharedStageHost({
  regsRef,
  activeId,
  bumpRef,
}: {
  regsRef: React.MutableRefObject<Map<string, StageRegistration>>;
  activeId: string | null;
  bumpRef: React.MutableRefObject<() => void>;
}) {
  // `register`/`unregister` disparan este `bump` (vía `bumpRef`) para repintar
  // SÓLO el host cuando cambia el nodo del stage activo — sin re-renderizar el
  // provider ni los stages, que es lo que realimentaba el bucle infinito.
  const [, bump] = useReducer((x: number) => x + 1, 0);
  useEffect(() => {
    bumpRef.current = bump;
    return () => {
      bumpRef.current = () => {};
    };
  }, [bumpRef]);

  // `slot`: div estable que hospeda el <Canvas>. Se mueve por el DOM sin
  // desmontarse (el contexto WebGL sobrevive al reparent).
  const slotRef = useRef<HTMLDivElement | null>(null);
  if (slotRef.current == null && typeof document !== 'undefined') {
    const s = document.createElement('div');
    s.dataset.cap1SharedGl = '';
    s.style.cssText = 'position:absolute;inset:0;display:block;background:' + STUDIO_BG;
    slotRef.current = s;
  }
  const holderRef = useRef<HTMLDivElement>(null);

  const active = activeId ? regsRef.current.get(activeId) ?? null : null;

  const onPointerMissedRef = useRef<(() => void) | undefined>(undefined);
  onPointerMissedRef.current = active?.onPointerMissed;

  // Aparca el slot en el holder al montar (el <Canvas> siempre conectado al
  // documento → su contexto no se pierde).
  useEffect(() => {
    const slot = slotRef.current;
    const holder = holderRef.current;
    if (slot && holder && slot.parentElement == null) holder.appendChild(slot);
  }, []);

  // Mueve el slot al `.three-container` activo (o de vuelta al holder). Depende
  // sólo del contenedor: `active` cambia de identidad en cada repintado del host
  // (nodo animado), pero el slot sólo se reubica al cambiar de slide.
  useEffect(() => {
    const slot = slotRef.current;
    if (!slot) return;
    const dest = active?.el ?? holderRef.current;
    if (dest && slot.parentElement !== dest) {
      // insertBefore(firstChild) → el <Canvas> queda DEBAJO de los controles DOM
      // (SceneControlPad, HUD) que son hermanos posteriores, como el <Canvas>
      // clásico.
      dest.insertBefore(slot, dest.firstChild);
    }
  }, [active?.el]);

  return (
    <>
      <div
        ref={holderRef}
        aria-hidden
        style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden', pointerEvents: 'none' }}
      />
      {slotRef.current &&
        createPortal(
          <Canvas
            camera={{ position: [0, 0, 8], fov: 42 }}
            dpr={[1, 2]}
            gl={{ antialias: true, powerPreference: 'high-performance', failIfMajorPerformanceCaveat: false, alpha: true }}
            style={{ width: '100%', height: '100%', display: 'block' }}
            onPointerMissed={() => onPointerMissedRef.current?.()}
          >
            {active?.node ?? null}
          </Canvas>,
          slotRef.current,
        )}
    </>
  );
}
