import React from 'react';

/**
 * Regla de las tres fuerzas (Herman, §2.3.5, Fig. 2.47).
 *
 * Construcción gráfica: si un cuerpo rígido está en equilibrio bajo SÓLO tres
 * fuerzas no paralelas, sus líneas de acción son concurrentes (se cortan en un
 * punto P). Tomando el eje de momentos en P, dos de las fuerzas dan torque nulo
 * (su r es (anti)paralelo a su F) y, por Στ = 0, la tercera también → su recta
 * pasa por P.
 *
 * Ejemplo del libro: pie + pierna inferior de quien sube una escalera.
 *   N — reacción normal vertical en el antepié (= W_b en subida lenta)
 *   M — fuerza del tendón rotuliano (cuádriceps); dirección conocida
 *   R — reacción de los cóndilos femorales sobre la tibia en Q; su dirección
 *       queda fijada al exigir que su recta pase por P
 *
 * `step` (1-4) revela la construcción por etapas; por defecto se muestra
 * completa. El diagrama es puramente esquemático (no resuelve magnitudes).
 */

type Step = 1 | 2 | 3 | 4;

const C = {
  N: '#2d7d4f', // reacción normal / suelo
  M: '#0d6e64', // músculo · tendón
  R: '#a92a1e', // reacción articular
  P: '#9a5b00', // punto de concurrencia
  bone: '#ddd0b5',
  boneEdge: '#b6a67f',
  joint: '#5d6b76',
};

function Arrow({
  x1,
  y1,
  x2,
  y2,
  color,
  w = 2.4,
  dash,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  w?: number;
  dash?: string;
}) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const headLen = 6.5 + w;
  const headHalf = 2.8 + w;
  const bx = x2 - Math.cos(a) * headLen;
  const by = y2 - Math.sin(a) * headLen;
  const nx = -Math.sin(a) * headHalf;
  const ny = Math.cos(a) * headHalf;
  return (
    <g>
      <line
        x1={x1}
        y1={y1}
        x2={bx}
        y2={by}
        stroke={color}
        strokeWidth={w}
        strokeLinecap="round"
        strokeDasharray={dash}
      />
      <polygon points={`${x2},${y2} ${bx + nx},${by + ny} ${bx - nx},${by - ny}`} fill={color} />
    </g>
  );
}

function Label({
  x,
  y,
  color,
  children,
  size = 11,
}: {
  x: number;
  y: number;
  color: string;
  children: React.ReactNode;
  size?: number;
}) {
  return (
    <text
      x={x}
      y={y}
      fontSize={size}
      fontWeight={700}
      fill={color}
      fontFamily="JetBrains Mono, monospace"
      stroke="#fbf8f0"
      strokeWidth={3}
      paintOrder="stroke"
      strokeLinejoin="round"
    >
      {children}
    </text>
  );
}

// ── Geometría compartida (viewBox 0 0 320 190) ──
const T: [number, number] = [116, 84]; // tuberosidad tibial (inserción de M)
const Q: [number, number] = [84, 52]; // punto de reacción de los cóndilos femorales
const P: [number, number] = [62, 45]; // intersección de las rectas de N y M
const N_TAIL: [number, number] = [62, 164];
const N_HEAD: [number, number] = [62, 110];
const M_DIR: [number, number] = [-0.81, -0.585];
const M_HEAD: [number, number] = [T[0] + M_DIR[0] * 34, T[1] + M_DIR[1] * 34];

export default function ThreeForceDiagram({ step = 4 }: { step?: Step }) {
  const showP = step >= 2;
  const showR = step >= 3;
  const showTriangle = step >= 4;

  return (
    <svg
      viewBox="0 0 256 184"
      role="img"
      aria-label="Regla de las tres fuerzas: las líneas de acción de N, M y R concurren en el punto P"
      style={{ width: '100%', maxWidth: 380, height: 'auto', display: 'block' }}
    >
      <text x={14} y={15} fontSize={8.5} fontWeight={700} fill={C.joint} fontFamily="Karla, sans-serif">
        a · construcción
      </text>
      {showTriangle && (
        <text x={196} y={92} fontSize={8.5} fontWeight={700} fill={C.joint} fontFamily="Karla, sans-serif">
          b · Σ F = 0
        </text>
      )}

      {/* ── (a) pierna inferior aislada sobre el escalón ── */}
      <rect x={20} y={166} width={120} height={8} fill="#e8dfc9" stroke="#cfc3a9" strokeWidth={1} />
      <path
        d="M118 158 L54 163 L54 153 L100 142 L118 149 Z"
        fill="#e9e1cf"
        stroke={C.boneEdge}
        strokeWidth={1.2}
        strokeLinejoin="round"
      />
      <line x1={102} y1={142} x2={92} y2={54} stroke={C.bone} strokeWidth={12} strokeLinecap="round" />
      <line x1={102} y1={142} x2={92} y2={54} stroke={C.boneEdge} strokeWidth={1} strokeLinecap="round" opacity={0.5} />
      <circle cx={106} cy={58} r={5.5} fill="#cfc4ae" stroke={C.boneEdge} strokeWidth={1} />
      <line x1={T[0]} y1={T[1]} x2={107} y2={64} stroke="#c98a54" strokeWidth={3} strokeLinecap="round" />
      <circle cx={T[0]} cy={T[1]} r={2.6} fill={C.boneEdge} />

      {/* prolongaciones punteadas de N y M hasta el punto de concurrencia */}
      {showP && (
        <g opacity={0.65}>
          <line x1={N_HEAD[0]} y1={N_HEAD[1]} x2={62} y2={26} stroke={C.N} strokeWidth={1.2} strokeDasharray="4 3" />
          <line x1={M_HEAD[0]} y1={M_HEAD[1]} x2={52} y2={26} stroke={C.M} strokeWidth={1.2} strokeDasharray="4 3" />
        </g>
      )}

      {/* vectores N y M */}
      <Arrow x1={N_TAIL[0]} y1={N_TAIL[1]} x2={N_HEAD[0]} y2={N_HEAD[1]} color={C.N} />
      <Label x={69} y={140} color={C.N}>
        N
      </Label>
      <Arrow x1={T[0]} y1={T[1]} x2={M_HEAD[0]} y2={M_HEAD[1]} color={C.M} />
      <Label x={95} y={74} color={C.M}>
        M
      </Label>

      {/* punto de concurrencia P */}
      {showP && (
        <>
          <circle cx={P[0]} cy={P[1]} r={3.6} fill={C.P} />
          <Label x={P[0] - 16} y={P[1] + 12} color={C.P} size={12}>
            P
          </Label>
        </>
      )}

      {/* reacción articular R en Q, colineal con la recta QP */}
      {showR && (
        <>
          <circle cx={Q[0]} cy={Q[1]} r={4} fill="#fbf8f0" stroke={C.joint} strokeWidth={1.6} />
          <Label x={Q[0] + 7} y={Q[1] + 1} color={C.joint} size={10}>
            Q
          </Label>
          <line
            x1={Q[0]}
            y1={Q[1]}
            x2={P[0]}
            y2={P[1]}
            stroke={C.R}
            strokeWidth={1.2}
            strokeDasharray="4 3"
            opacity={0.7}
          />
          <Arrow
            x1={Q[0]}
            y1={Q[1]}
            x2={Q[0] + (P[0] - Q[0]) * 1.7}
            y2={Q[1] + (P[1] - Q[1]) * 1.7}
            color={C.R}
          />
          <Label x={38} y={34} color={C.R}>
            R
          </Label>
        </>
      )}

      {/* ── (b) triángulo de fuerzas: cabeza con cola ⟹ ΣF = 0 ── */}
      {showTriangle && (
        <g>
          <polygon points="234,172 234,126 195,97" fill="rgba(13,110,100,0.08)" stroke="none" />
          <Arrow x1={234} y1={172} x2={234} y2={128} color={C.N} w={2.2} />
          <Label x={239} y={153} color={C.N} size={10}>
            N
          </Label>
          <Arrow x1={234} y1={126} x2={196.5} y2={98} color={C.M} w={2.2} />
          <Label x={189} y={115} color={C.M} size={10}>
            M
          </Label>
          <Arrow x1={195} y1={97} x2={232} y2={170} color={C.R} w={2.2} />
          <Label x={220} y={143} color={C.R} size={10}>
            R
          </Label>
        </g>
      )}
    </svg>
  );
}
