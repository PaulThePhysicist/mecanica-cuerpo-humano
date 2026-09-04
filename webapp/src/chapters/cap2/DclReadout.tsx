import React from 'react';
import { Html } from '@react-three/drei';

/**
 * Presentación unificada de las fuerzas de un DCL en los canvas 3D de cap2.
 *
 * Antes cada flecha llevaba un `<Html>` flotante de 2 líneas ("R = 2113 N /
 * 215 kgf · 3.08× W") anclado a su punta, justo sobre la anatomía y duplicando
 * lo que ya decían las tarjetas de esquina. Ahora:
 *
 *   · `<DclTag>`     — pastilla mínima en el espacio 3D, sólo el SÍMBOLO.
 *   · `<DclReadout>` — panel de esquina (DOM, fuera del <Canvas>) con las
 *                      magnitudes, con el mismo código de color que las flechas.
 */

export function DclTag({
  position,
  color,
  symbol,
}: {
  position: [number, number, number];
  color: string;
  symbol: string;
}) {
  return (
    <Html position={position} center zIndexRange={[60, 0]} style={{ pointerEvents: 'none' }}>
      <span
        style={{
          display: 'inline-block',
          background: 'rgba(255, 253, 248, 0.8)',
          border: `1px solid ${color}`,
          borderRadius: 4,
          padding: '0 4px',
          fontSize: '0.5rem',
          fontWeight: 700,
          lineHeight: 1.55,
          color,
          fontFamily: 'JetBrains Mono, monospace',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
        }}
      >
        {symbol}
      </span>
    </Html>
  );
}

export interface DclRow {
  symbol: string;
  color: string;
  value: string; // p. ej. "2113 N"
  hint?: string; // p. ej. "3.08× W" · "glúteo medio"
  strong?: boolean; // resalta la fila (reacción articular)
  muted?: boolean; // fila secundaria (componentes)
}

export function DclReadout({
  title = 'Lecturas del DCL',
  rows,
  tone = '#cbd5e1',
  note,
}: {
  title?: string;
  rows: DclRow[];
  tone?: string;
  note?: string;
}) {
  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(6px)',
        border: `1.5px solid ${tone}`,
        borderRadius: 9,
        padding: '7px 10px 8px',
        boxShadow: '0 6px 18px rgba(35, 44, 54, 0.13)',
        minWidth: 150,
        pointerEvents: 'none',
        fontFamily: 'JetBrains Mono, monospace',
      }}
    >
      <div
        style={{
          fontSize: '0.53rem',
          fontWeight: 700,
          color: '#64748b',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: 5,
        }}
      >
        {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {rows.map((r, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: r.strong ? '0.66rem' : '0.6rem',
              opacity: r.muted ? 0.7 : 1,
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: r.color,
                flex: '0 0 auto',
              }}
            />
            <span style={{ color: r.color, fontWeight: 700, minWidth: 20 }}>{r.symbol}</span>
            <span style={{ flex: 1 }} />
            <span style={{ color: '#232c36', fontWeight: r.strong ? 800 : 700 }}>{r.value}</span>
            {r.hint && (
              <span
                style={{
                  color: '#8a94a0',
                  fontSize: '0.48rem',
                  fontFamily: 'system-ui, sans-serif',
                  whiteSpace: 'nowrap',
                }}
              >
                {r.hint}
              </span>
            )}
          </div>
        ))}
      </div>
      {note && (
        <div
          style={{
            fontSize: '0.5rem',
            color: '#64748b',
            marginTop: 5,
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          {note}
        </div>
      )}
    </div>
  );
}
