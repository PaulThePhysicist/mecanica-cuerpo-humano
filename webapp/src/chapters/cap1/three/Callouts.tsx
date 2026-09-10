import React, {
  createContext,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Sistema de «leader lines»: los letreros de una escena `AnatomyStage` NO se
 * dibujan sobre el modelo. Se apilan en un riel vertical a un lado del lienzo y
 * cada uno se conecta con su punto anatómico 3D por una línea fina y curva.
 *
 * Uso:
 *   const callouts = useCalloutStore();
 *   <CalloutProvider store={callouts}>
 *     <AnatomyStage overlay={<CalloutRail store={callouts} side="right" />}>
 *       ...escena...
 *       <Callout position={[x,y,z]} label="+z" sub="↑ Superior / Craneal" color="#0d6e64" />
 *       <CalloutSource />
 *     </AnatomyStage>
 *   </CalloutProvider>
 *
 * `Callout` va DONDE está el punto a señalar (como un `<Html>`), pero solo
 * registra un marcador invisible. `CalloutSource` (dentro del Canvas) proyecta
 * cada marcador a píxeles cada frame. `CalloutRail` (DOM, fuera del Canvas)
 * coloca los letreros en el riel y traza las líneas — todo por mutación directa
 * del DOM, sin re-render por frame.
 */

type Emphasis = 'strong' | 'normal' | 'muted';

interface CalloutItem {
  ref: React.RefObject<THREE.Object3D | null>;
  label: string;
  sub: string;
  color: string;
  dim: boolean;
  emphasis: Emphasis;
}
interface Projected {
  x: number;
  y: number;
  hidden: boolean;
}
export interface CalloutStore {
  items: Map<string, CalloutItem>;
  projected: Map<string, Projected>;
  size: { w: number; h: number };
  listeners: Set<() => void>;
  register: (id: string, item: CalloutItem) => void;
  unregister: (id: string) => void;
  subscribe: (fn: () => void) => () => void;
}

function createStore(): CalloutStore {
  const s: CalloutStore = {
    items: new Map(),
    projected: new Map(),
    size: { w: 1, h: 1 },
    listeners: new Set(),
    register(id, item) {
      s.items.set(id, item);
      s.listeners.forEach((f) => f());
    },
    unregister(id) {
      s.items.delete(id);
      s.projected.delete(id);
      s.listeners.forEach((f) => f());
    },
    subscribe(fn) {
      s.listeners.add(fn);
      return () => {
        s.listeners.delete(fn);
      };
    },
  };
  return s;
}

/** Crea (una vez) el store que comparten `CalloutProvider`, `CalloutSource` y `CalloutRail`. */
export function useCalloutStore(): CalloutStore {
  return useMemo(() => createStore(), []);
}

const CalloutContext = createContext<CalloutStore | null>(null);

/**
 * Interruptor único de los letreros de una escena. El lienzo debe verse limpio y
 * los letreros aparecer solo al pulsar su botón; en vez de encadenar un prop
 * `showLabels` por todo el árbol de cada canvas (los hay de 900 líneas), el
 * apagado vive aquí: con `visible={false}` ni `Callout`, ni `CalloutSource`, ni
 * `CalloutRail` llegan a montarse, así que tampoco corre la proyección por frame.
 *
 * Por defecto `true`, para no alterar las escenas que aún no tienen el botón.
 */
const LabelsVisibleContext = createContext(true);

/** ¿Están encendidos los letreros de esta escena? Útil para los `<Html>` sueltos
 *  que cada canvas ancla por su cuenta (rótulos de fulcro, ejes, notas). */
export function useLabelsVisible(): boolean {
  return useContext(LabelsVisibleContext);
}

export function CalloutProvider({
  store,
  visible = true,
  children,
}: {
  store: CalloutStore;
  visible?: boolean;
  children: React.ReactNode;
}) {
  return (
    <CalloutContext.Provider value={store}>
      <LabelsVisibleContext.Provider value={visible}>{children}</LabelsVisibleContext.Provider>
    </CalloutContext.Provider>
  );
}

/** Marcador invisible en el punto a señalar; registra su letrero en el riel. */
export function Callout({
  position,
  label,
  sub = '',
  color,
  dim = false,
  emphasis = 'normal',
}: {
  position: [number, number, number];
  label: string;
  sub?: string;
  color: string;
  /** Atenúa el letrero cuando otro es el foco (ejes no activos en A1). */
  dim?: boolean;
  /** `strong` = fuerza principal / reacción articular · `muted` = componente. */
  emphasis?: Emphasis;
}) {
  const store = useContext(CalloutContext);
  const visible = useLabelsVisible();
  const ref = useRef<THREE.Group>(null);
  const id = useId();
  useEffect(() => {
    if (!store || !visible) return;
    store.register(id, { ref, label, sub, color, dim, emphasis });
    return () => store.unregister(id);
  }, [store, visible, id, label, sub, color, dim, emphasis]);

  if (!visible) return null;

  // Sin `CalloutProvider` (escenas aún no migradas al riel): se comporta como el
  // `<Html>` clásico, un recuadro fijo en el punto. Así no se pierde el letrero.
  if (!store) {
    return (
      <Html position={position} center zIndexRange={[100, 0]} style={{ pointerEvents: 'none' }}>
        <div
          style={{
            background: 'rgba(255,253,248,0.97)',
            color: '#22303c',
            border: `1px solid ${color}`,
            padding: '3px 8px',
            borderRadius: 5,
            fontFamily: 'var(--sans, system-ui, sans-serif)',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            textAlign: 'center',
            opacity: dim ? 0.5 : 1,
          }}
        >
          <div style={{ fontSize: '0.72rem' }}>{label}</div>
          {sub && <div style={{ fontSize: '0.56rem', color }}>{sub}</div>}
        </div>
      </Html>
    );
  }

  return <group ref={ref} position={position} />;
}

/** Dentro del Canvas: proyecta cada marcador a coordenadas de píxel cada frame.
 *  Con los letreros apagados no se monta, así que el `useFrame` ni se registra. */
export function CalloutSource() {
  return useLabelsVisible() ? <CalloutProjector /> : null;
}

function CalloutProjector() {
  const store = useContext(CalloutContext);
  const v = useRef(new THREE.Vector3()).current;
  useFrame(({ camera, size }) => {
    if (!store) return;
    store.size = { w: size.width, h: size.height };
    for (const [id, it] of store.items) {
      const o = it.ref.current;
      if (!o) {
        store.projected.set(id, { x: 0, y: 0, hidden: true });
        continue;
      }
      o.getWorldPosition(v);
      v.project(camera);
      store.projected.set(id, {
        x: (v.x * 0.5 + 0.5) * size.width,
        y: (-v.y * 0.5 + 0.5) * size.height,
        hidden: v.z <= -1 || v.z >= 1,
      });
    }
  });
  return null;
}

const RAIL_W = 156;
const M = 8;
const GAP = 6;

/** Fuera del Canvas: coloca los letreros en el riel y traza las líneas guía.
 *  Con los letreros apagados no se monta: ni riel, ni bucle de layout por frame. */
export function CalloutRail(props: {
  store: CalloutStore;
  side?: 'left' | 'right';
  /** Frase didáctica al pie del riel (equivale a `DclReadout.note`). */
  note?: string;
  /** Píxeles a dejar libres al pie del riel (p. ej. una tarjeta anclada a esa esquina). */
  reserveBottom?: number;
}) {
  return useLabelsVisible() ? <CalloutRailInner {...props} /> : null;
}

function CalloutRailInner({
  store,
  side = 'right',
  note,
  reserveBottom = 0,
}: {
  store: CalloutStore;
  side?: 'left' | 'right';
  note?: string;
  reserveBottom?: number;
}) {
  const [items, setItems] = useState<
    { id: string; label: string; sub: string; color: string; dim: boolean; emphasis: Emphasis }[]
  >([]);
  const labelEls = useRef<Map<string, HTMLDivElement>>(new Map());
  const pathEls = useRef<Map<string, SVGPathElement>>(new Map());
  const dotEls = useRef<Map<string, SVGCircleElement>>(new Map());
  const noteRef = useRef<HTMLDivElement>(null);

  // Re-sincroniza la lista de nodos DOM cuando cambia el conjunto de letreros.
  useEffect(() => {
    const sync = () =>
      setItems(
        [...store.items].map(([id, it]) => ({
          id,
          label: it.label,
          sub: it.sub,
          color: it.color,
          dim: it.dim,
          emphasis: it.emphasis,
        })),
      );
    sync();
    return store.subscribe(sync);
  }, [store]);

  // Layout por frame: apila los letreros sin solaparse y redibuja las líneas.
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const { w, h } = store.size;
      const railInnerX = side === 'right' ? w - RAIL_W - M : M + RAIL_W;

      type Row = { id: string; ax: number; ay: number; el: HTMLDivElement; rh: number };
      const rows: Row[] = [];
      for (const it of items) {
        const el = labelEls.current.get(it.id);
        if (!el) continue;
        const p = store.projected.get(it.id);
        const path = pathEls.current.get(it.id);
        const dot = dotEls.current.get(it.id);
        const on =
          p && !p.hidden && p.x > -60 && p.x < w + 60 && p.y > -60 && p.y < h + 60;
        if (!on) {
          el.style.opacity = '0';
          if (path) path.style.opacity = '0';
          if (dot) dot.style.opacity = '0';
          continue;
        }
        rows.push({ id: it.id, ax: p!.x, ay: p!.y, el, rh: el.offsetHeight || 22 });
      }

      rows.sort((a, b) => a.ay - b.ay);
      // Reserva para el pie de riel: su alto real (puede ser de varias líneas),
      // no un valor fijo, para que ningún letrero quede tapado por la nota.
      const noteH = note ? (noteRef.current?.offsetHeight ?? 46) + GAP : 0;
      const bottom = Math.max(M, h - M - noteH - reserveBottom);

      // Pasada 1 (descendente): cada letrero junto a su ancla, sin pisar al
      // anterior ni salirse por abajo.
      const ys: number[] = [];
      let cursor = M;
      for (const r of rows) {
        let y = Math.max(r.ay - r.rh / 2, cursor);
        if (y + r.rh > bottom) y = Math.max(M, bottom - r.rh);
        cursor = y + r.rh + GAP;
        ys.push(y);
      }
      // Pasada 2 (ascendente): si el recorte por abajo hizo que un letrero pisara
      // al de encima, empuja hacia arriba los anteriores para deshacer el solape.
      for (let i = rows.length - 2; i >= 0; i--) {
        const maxY = ys[i + 1] - GAP - rows[i].rh;
        if (ys[i] > maxY) ys[i] = Math.max(M, maxY);
      }

      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        const y = ys[i];

        const it = items.find((x) => x.id === r.id)!;
        r.el.style.opacity = it.dim ? '0.42' : '1';
        r.el.style.transform = `translateY(${Math.round(y)}px)`;

        const ly = y + r.rh / 2;
        const path = pathEls.current.get(r.id);
        const dot = dotEls.current.get(r.id);
        if (path) {
          const c1 = r.ax + (railInnerX - r.ax) * 0.55;
          path.setAttribute(
            'd',
            `M ${r.ax.toFixed(1)} ${r.ay.toFixed(1)} C ${c1.toFixed(1)} ${r.ay.toFixed(1)} ${c1.toFixed(1)} ${ly.toFixed(1)} ${railInnerX.toFixed(1)} ${ly.toFixed(1)}`,
          );
          path.style.opacity = it.dim ? '0.16' : '0.6';
        }
        if (dot) {
          dot.setAttribute('cx', r.ax.toFixed(1));
          dot.setAttribute('cy', r.ay.toFixed(1));
          dot.style.opacity = it.dim ? '0.28' : '0.95';
        }
      }
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [items, store, side, note, reserveBottom]);

  const setLabelRef = (id: string) => (el: HTMLDivElement | null) => {
    if (el) labelEls.current.set(id, el);
    else labelEls.current.delete(id);
  };
  const setPathRef = (id: string) => (el: SVGPathElement | null) => {
    if (el) pathEls.current.set(id, el);
    else pathEls.current.delete(id);
  };
  const setDotRef = (id: string) => (el: SVGCircleElement | null) => {
    if (el) dotEls.current.set(id, el);
    else dotEls.current.delete(id);
  };

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      <svg
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}
      >
        {items.map((it) => (
          <g key={it.id}>
            <path
              ref={setPathRef(it.id)}
              fill="none"
              stroke={it.color}
              strokeWidth={1}
              style={{ opacity: 0, transition: 'opacity .18s ease' }}
            />
            <circle
              ref={setDotRef(it.id)}
              r={2.5}
              fill={it.color}
              style={{ opacity: 0, transition: 'opacity .18s ease' }}
            />
          </g>
        ))}
      </svg>
      <div
        style={
          {
            position: 'absolute',
            top: 0,
            bottom: 0,
            [side]: M,
            width: RAIL_W,
          } as React.CSSProperties
        }
      >
        {items.map((it) => {
          const oneLine = it.sub ? true : it.label.length <= 18;
          const strong = it.emphasis === 'strong';
          const muted = it.emphasis === 'muted';
          return (
            <div
              key={it.id}
              ref={setLabelRef(it.id)}
              style={
                {
                  position: 'absolute',
                  top: 0,
                  [side]: 0,
                  width: RAIL_W,
                  display: 'flex',
                  justifyContent: side === 'right' ? 'flex-end' : 'flex-start',
                  opacity: 0,
                  transition: 'opacity .18s ease',
                  willChange: 'transform',
                } as React.CSSProperties
              }
            >
              <div
                style={
                  {
                    background: muted ? 'rgba(255,254,249,0.9)' : '#fffef9',
                    border: '1px solid rgba(35,44,54,0.12)',
                    [side === 'right' ? 'borderRight' : 'borderLeft']: `${strong ? 4 : 3}px solid ${it.color}`,
                    borderRadius: 5,
                    padding: muted ? '2px 7px' : '3px 8px',
                    boxShadow: strong
                      ? '0 3px 12px rgba(35,44,54,0.22)'
                      : '0 2px 10px rgba(35,44,54,0.16)',
                    fontFamily: 'var(--sans, system-ui, sans-serif)',
                    textAlign: side === 'right' ? 'right' : 'left',
                    maxWidth: RAIL_W - 6,
                  } as React.CSSProperties
                }
              >
                <div
                  style={{
                    fontWeight: strong ? 800 : 700,
                    fontSize: muted ? '0.66rem' : strong ? '0.8rem' : '0.74rem',
                    color: '#1c2733',
                    lineHeight: 1.2,
                    whiteSpace: oneLine ? 'nowrap' : 'normal',
                  }}
                >
                  {it.label}
                </div>
                {it.sub && (
                  <div
                    style={{
                      fontSize: '0.6rem',
                      color: it.color,
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      marginTop: 1,
                    }}
                  >
                    {it.sub}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {note && (
        <div
          ref={noteRef}
          style={
            {
              position: 'absolute',
              bottom: M,
              [side]: M,
              width: RAIL_W,
              padding: '4px 7px',
              background: 'rgba(255,254,249,0.92)',
              border: '1px solid rgba(35,44,54,0.10)',
              borderRadius: 5,
              fontFamily: 'var(--sans, system-ui, sans-serif)',
              fontSize: '0.56rem',
              lineHeight: 1.32,
              color: '#5b6672',
              textAlign: side === 'right' ? 'right' : 'left',
            } as React.CSSProperties
          }
        >
          {note}
        </div>
      )}
    </div>
  );
}
