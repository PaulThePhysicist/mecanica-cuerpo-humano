import React from 'react';
import { Html } from '@react-three/drei';
import { useLabelsVisible } from '../cap1/three/Callouts';

/**
 * `<DclTag>` — pastilla mínima anclada en el espacio 3D con sólo un SÍMBOLO o un
 * rótulo corto de referencia (`fulcro`, `L5`, `ATM`, `⚠ hernia`, ejes `+Fx/+Fy`,
 * masas segmentarias…). Es la etiqueta de Categoría 2: se queda sobre el modelo.
 *
 * Las magnitudes de las fuerzas de un DCL ya NO van en un panel-tabla de esquina
 * (`DclReadout`, retirado): se apilan en el riel lateral con línea guía — ver
 * `../cap1/three/Callouts.tsx` (`<CalloutRail>`).
 */

export function DclTag({
  position,
  color,
  symbol,
  screenOffset = [0, 0],
}: {
  position: [number, number, number];
  color: string;
  symbol: string;
  /** Desplazamiento en píxeles de pantalla, para separar tags que se solapan. */
  screenOffset?: [number, number];
}) {
  // Categoría 2, pero letrero al fin y al cabo: sigue el mismo interruptor que
  // el riel, para que el lienzo en reposo quede limpio.
  const visible = useLabelsVisible();
  if (!visible) return null;
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
          transform:
            screenOffset[0] || screenOffset[1]
              ? `translate(${screenOffset[0]}px, ${screenOffset[1]}px)`
              : undefined,
        }}
      >
        {symbol}
      </span>
    </Html>
  );
}
