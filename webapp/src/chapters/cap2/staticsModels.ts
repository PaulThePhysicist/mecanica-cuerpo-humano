// ═══════════════════════════════════════════════════════════════════════════
//  Capítulo 2 · Modelos estáticos del libro (fuente única de cifras)
//
//  Cada función reproduce las ecuaciones y los parámetros de
//  `Capitulos/Capitulo_2/Capitulo_2.tex` (Herman, §2.3). Las diapositivas y los
//  lienzos 3D importan de aquí para que el texto, el HUD y la escena den la misma
//  cifra. Cuando un control sale del caso del libro (otra masa, otro ángulo) el
//  modelo es el mismo; solo cambian las entradas.
// ═══════════════════════════════════════════════════════════════════════════

/** g que usa el libro (9,8 m/s²; 90 kg → 880 N). */
export const G = 9.8;

const rad = (deg: number) => (deg * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

// ── §2.3.1 Antebrazo (Casos 1–3, Ecs. 2.13–2.17) ─────────────────────────────
/** Distancias del libro: d_M = 4 cm, d_F = 0,146H/2 = 13 cm, d_W = 0,2H = 36 cm (H = 180 cm). */
export const FOREARM = { dM: 4, dF: 13, dW: 36, WF: 15 };

/** Ec. 2.17: M d_M = W_W d_W + W_F d_F (independiente de θ, Caso 3). */
export function forearmStatics(WW: number, dMcm = FOREARM.dM, WF = FOREARM.WF) {
  const M = (WW * FOREARM.dW + WF * FOREARM.dF) / dMcm;
  // Balance vertical (antebrazo a 90°): R = M − W_W − W_F (el libro no la calcula; se deriva de ΣF_y = 0).
  const R = Math.max(0, M - WW - WF);
  return { M, R, ratioW: FOREARM.dW / dMcm, ratioF: FOREARM.dF / dMcm };
}

// ── §2.3.1 Caso 4 · Tres flexores (Tabla 2.1, Ecs. 2.18–2.24) ────────────────
export const ELBOW_FLEXORS = [
  { key: 'biceps', name: 'Bíceps', d: 4.6, A: 4.6 },
  { key: 'brachialis', name: 'Braquial', d: 3.4, A: 7.0 },
  { key: 'brachioradialis', name: 'Braquiorradial', d: 7.5, A: 1.5 },
] as const;

/** Σ A_i d_i = 56,21 cm³. */
export const SUM_AD = ELBOW_FLEXORS.reduce((s, m) => s + m.A * m.d, 0);

/**
 * Ecs. 2.21–2.24: k = τ / Σ A_i d_i y M_i = k A_i. `tauNcm` es el torque de carga
 * W_W d_W + W_F d_F en N·cm. Con un solo músculo (bíceps, d = 4,6 cm) M = τ / 4,6.
 */
export function flexorStatics(tauNcm: number, onlyBiceps = false) {
  if (onlyBiceps) {
    const Mb = tauNcm / ELBOW_FLEXORS[0].d;
    return { k: Mb / ELBOW_FLEXORS[0].A, biceps: Mb, brachialis: 0, brachioradialis: 0, total: Mb };
  }
  const k = tauNcm / SUM_AD;
  const biceps = k * ELBOW_FLEXORS[0].A;
  const brachialis = k * ELBOW_FLEXORS[1].A;
  const brachioradialis = k * ELBOW_FLEXORS[2].A;
  return { k, biceps, brachialis, brachioradialis, total: biceps + brachialis + brachioradialis };
}

/** Carga en la mano (kg) que reproduce las cifras del libro (262/399/85 N): τ ≈ 3200 N·cm. */
export const FLEXOR_BOOK_LOAD_KG = 8.5;

// ── §2.3.2 Cadera, apoyo monopodal y bastón (Ecs. 2.25–2.33) ─────────────────
/**
 * Geometría de la pierna del libro (Figs. 2.17 y 2.20).
 * Sin bastón: N a 10,8 cm, CM de la pierna a 3,2 cm (a la derecha), abductores a 7,0 cm.
 * Con bastón (N_c = W_b/6 a 30,5 cm): pie desplazado L = 6,1 cm, N a 4,7 cm,
 * CM de la pierna a 0,33 cm a la izquierda, abductores a 6,98 cm.
 * Entre ambas geometrías se interpola linealmente con L (para fuerzas de bastón
 * distintas de W_b/6); para L < 0 (bastón en la mano del mismo lado) se extrapola.
 */
export const HIP = { dN0: 10.8, dLeg0: 3.2, dM0: 7.0, legFrac: 0.16, angleDeg: 70, dCane: 30.5, Lbook: 6.1 };

export function hipStatics(WbN: number, opts: { caneFrac?: number; caneSide?: 'contra' | 'ipsi' | 'none'; abductorFraction?: number } = {}) {
  const side = opts.caneSide ?? 'none';
  const f = side === 'none' ? 0 : Math.min(0.5, Math.max(0, opts.caneFrac ?? 0));
  const Nc = f * WbN;
  const Nf = WbN - Nc;
  // Ec. 2.30: L = (N_c/N_f) · 30,5 cm. Bastón del mismo lado ⇒ el pie se desplaza al otro lado.
  const L = (Nf > 0 ? (Nc / Nf) * HIP.dCane : 0) * (side === 'ipsi' ? -1 : 1);
  const s = L / HIP.Lbook; // 0 sin bastón, 1 en el caso del libro
  const dN = HIP.dN0 - L; // 10,8 → 4,7 cm
  const xLeg = HIP.dLeg0 - (HIP.dLeg0 + 0.33) * s; // 3,2 → −0,33 cm
  const dM = HIP.dM0 - (HIP.dM0 - 6.98) * s; // 7,0 → 6,98 cm
  const Wleg = HIP.legFrac * WbN;
  const sinA = Math.sin(rad(HIP.angleDeg));
  const cosA = Math.cos(rad(HIP.angleDeg));
  // Ecs. 2.27 / 2.33: τ_z = d_N N_f − x_leg W_leg − d_M M sin 70° = 0
  const Mreq = Math.max(0, (dN * Nf - xLeg * Wleg) / (dM * sinA));
  const frac = opts.abductorFraction ?? 1;
  const M = Mreq * frac;
  // Ecs. 2.25–2.26 / 2.31–2.32
  const Rx = M * cosA;
  const Ry = M * sinA + Nf - Wleg;
  const R = Math.hypot(Rx, Ry);
  const phi = deg(Math.atan2(Rx, Ry));
  return { WbN, Nc, Nf, L, dN, xLeg, dM, Wleg, Mreq, M, Rx, Ry, R, phi, equilibrium: frac >= 1 };
}

// ── §2.3.3 Rodilla (Ecs. 2.34–2.36) ─────────────────────────────────────────
/** Parámetros del libro: a = 12 cm, b = 22 cm, c = 50 cm, W₁ = 150 N, W₀ = 100 N, θ = 15°, β = 45°. */
export const KNEE = { a: 12, b: 22, c: 50, W1: 150, W0: 100, thetaDeg: 15, betaDeg: 45 };

export function kneeStatics(betaDeg: number, W0: number = KNEE.W0, aCm: number = KNEE.a) {
  const b = rad(betaDeg);
  const th = rad(KNEE.thetaDeg);
  const M = ((KNEE.b * KNEE.W1 + KNEE.c * W0) * Math.cos(b)) / (aCm * Math.sin(th));
  const Rx = M * Math.cos(th + b);
  const Ry = M * Math.sin(th + b) - W0 - KNEE.W1;
  return { M, Rx, Ry, R: Math.hypot(Rx, Ry) };
}

// ── §2.3.3 Tobillo de puntillas (Ecs. 2.39–2.40) ─────────────────────────────
export function ankleStatics(WbN: number, thetaDeg: number, betaDeg: number) {
  const th = rad(thetaDeg);
  const b = rad(betaDeg);
  const den = Math.cos(th + b);
  // Magnitudes (el libro da M = 1,93 W_b y R = 2,73 W_b para θ = 45°, β = 60°).
  return { M: Math.abs((WbN * Math.cos(b)) / den), R: Math.abs((WbN * Math.cos(th)) / den) };
}

// ── §2.3.4 Espalda (Ecs. 2.41–2.46, Tabla 2.3) ──────────────────────────────
/**
 * Columna como barra rígida a θ de la horizontal. W₁ = 0,4 W_b a L/2, W₂ = 0,2 W_b
 * (+ carga) a L, erector a 2L/3 formando 12° con la columna.
 */
export function backStatics(thetaDeg: number, WbN: number, extraN = 0) {
  const th = rad(thetaDeg);
  const W1 = 0.4 * WbN;
  const W2 = 0.2 * WbN + extraN;
  const M = (Math.cos(th) * (W1 / 2 + W2)) / ((2 / 3) * Math.sin(rad(12)));
  const ang = th - rad(12); // ángulo de M con la horizontal (18° para θ = 30°)
  const Rx = M * Math.cos(ang);
  const Ry = M * Math.sin(ang) + W1 + W2;
  const R = Math.hypot(Rx, Ry);
  // Componentes de R a lo largo de la columna (compresión) y normal a ella (cizalla).
  const comp = Rx * Math.cos(th) + Ry * Math.sin(th);
  const shear = Math.abs(Ry * Math.cos(th) - Rx * Math.sin(th));
  return { W1, W2, M, Rx, Ry, R, phi: deg(Math.atan2(Ry, Rx)), comp, shear };
}

/** Tabla 2.3 del libro (en unidades de W_b). */
export const TABLE_2_3 = [
  { theta: 30, M0: 2.5, M1: 3.74, R0: 2.74, R1: 4.07 },
  { theta: 60, M0: 1.44, M1: 2.16, R0: 1.93, R1: 2.81 },
  { theta: 80, M0: 0.5, M1: 0.75, R0: 1.08, R1: 1.53 },
  { theta: 90, M0: 0, M1: 0, R0: 0.6, R1: 0.8 },
];

// ── §2.3.3 Mandíbula: ventajas mecánicas (ref. [34] del libro) ───────────────
export const JAW_MA = {
  masseter: { incisor: 0.5, molar: 0.76 },
  temporalAnterior: { incisor: 0.24, molar: 0.48 },
  temporalPosterior: { incisor: 0.37, molar: 0.72 },
};
