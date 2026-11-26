// ═══════════════════════════════════════════════════════════════════════════
//  Capítulo 3 · Motor de simulaciones 2D y cálculos físicos (TypeScript)
//  "Movimiento" — Física del Cuerpo Humano (I. P. Herman)
//
//  Cada `draw*` es una función pura de (parámetros, flags) → pintura del
//  lienzo + texto de la lectura. No hay reloj global: las animaciones avanzan
//  sus propias fases en `stepSlide()` y solo mientras `isAnimating()` es
//  verdadero para la diapositiva visible (ver useEngine.ts).
//
//  Todas las cifras citan el `.tex` (Capitulos/Capitulo_3/Capitulo_3.tex):
//  ver la matriz de cobertura en webapp/AUDITORIA_CAP3.md.
// ═══════════════════════════════════════════════════════════════════════════

import * as AB from './ab';

const { PAL } = AB;
const G_EARTH = 9.8;
const MPH = 1 / 0.44704; // m/s → mph (1 mph = 0,44704 m/s)

export interface ModuleDef {
  id: number;
  name: string;
  slides: number[];
  ico: string;
}

export const TOTAL = 19;

export const MODULES: ModuleDef[] = [
  { id: 0, name: 'Inicio', slides: [0], ico: '🏠' },
  { id: 1, name: 'Bipedestación', slides: [1, 2], ico: '🧍' },
  { id: 2, name: 'Marcha', slides: [3, 4, 5], ico: '🚶' },
  { id: 3, name: 'Carrera', slides: [6, 7, 8], ico: '🏃' },
  { id: 4, name: 'Salto', slides: [9, 10], ico: '🦘' },
  { id: 5, name: 'Lanzar', slides: [11, 12, 13], ico: '⚾' },
  { id: 6, name: 'Bateo', slides: [14, 15], ico: '🏌️' },
  { id: 7, name: 'Colisiones', slides: [16, 17], ico: '💥' },
  { id: 8, name: 'Vuelo · Resumen', slides: [18], ico: '🎾' },
];

export interface SimParams {
  stab_H: number;
  stab_theta: number;
  pr_mass: number;
  gait_t: number;
  fr_mu: number;
  pe_H: number;
  pe_planet: 'earth' | 'moon' | 'mars';
  sp_F: number;
  sp_m: number;
  jp_mass: number;
  jp_N: number;
  jp_s: number;
  va_v: number;
  th_case: 'a' | 'b' | 'c' | 'd';
  ph_t: number;
  pw_om: number;
  ba_w: number;
  co_v: number;
  co_dx: number;
  co_m: number;
  bx_v: number;
  fl_v: number;
  fl_theta: number;
}

export const DEFAULT_PARAMS: SimParams = {
  stab_H: 1.8,
  stab_theta: 0,
  pr_mass: 70,
  gait_t: 0,
  fr_mu: 0.17,
  pe_H: 1.8,
  pe_planet: 'earth',
  sp_F: 560,
  sp_m: 70,
  jp_mass: 63.5, // 140 lb (§3.5.1)
  jp_N: 1334, // ⟨N⟩ = 300 lb
  jp_s: 0.43,
  va_v: 9.5,
  th_case: 'c',
  ph_t: 0.64,
  pw_om: 15.7,
  ba_w: 38.5,
  co_v: 4.43,
  co_dx: 0.01,
  co_m: 70,
  bx_v: 30,
  fl_v: 40, // ≈ 90 mph, pelota bateada
  fl_theta: 40,
};

export interface SimFlags {
  /** Altura del CM como fracción de H: 0,50 (Prob. 3.1, masa uniforme) o 0,58 (Fig. 3.8). */
  stabCM: 0.5 | 0.58;
  presionMode: 'stand' | 'walk';
  gaitPlaying: boolean;
  pePlaying: boolean;
  pePhase: number;
  energyMode: 'walk' | 'run';
  pogoPlaying: boolean;
  pogoPhase: number;
  pogoTrack: boolean;
  jumpMode: 'cm' | 'sq';
  throwPlaying: boolean;
  throwPhase: number;
  phPlaying: boolean;
  golfPlaying: boolean;
  golfPhase: number;
  wrist: boolean;
  glove: boolean;
  air: boolean;
  mag: boolean;
}

export const DEFAULT_FLAGS: SimFlags = {
  stabCM: 0.5,
  presionMode: 'stand',
  gaitPlaying: false,
  pePlaying: false,
  pePhase: 0,
  energyMode: 'walk',
  pogoPlaying: false,
  pogoPhase: 0,
  pogoTrack: false,
  jumpMode: 'cm',
  throwPlaying: false,
  throwPhase: 0,
  phPlaying: false,
  golfPlaying: false,
  golfPhase: 0.25,
  wrist: true,
  glove: true,
  air: true,
  mag: false,
};

export type OutFn = (id: string, text: string) => void;

/* ─── Animación bajo demanda ─────────────────────────────────────────────── */

/** ¿La diapositiva `slide` tiene una animación en curso? Solo entonces corre el reloj. */
export function isAnimating(slide: number, f: SimFlags): boolean {
  switch (slide) {
    case 3:
      return f.gaitPlaying;
    case 5:
      return f.pePlaying;
    case 7:
      return f.pogoPlaying;
    case 11:
      return f.throwPlaying;
    case 12:
      return f.phPlaying;
    case 14:
      return f.golfPlaying;
    default:
      return false;
  }
}

/** Duración del lanzamiento del caso `k` (t_final = (π/α)^½, §3.6). */
export const THROW_ALPHA = { a: 81.7, b: 115.5, c: 308, d: 346 } as const;
export const throwTime = (k: keyof typeof THROW_ALPHA) => Math.sqrt(Math.PI / THROW_ALPHA[k]);
/** Cámara lenta del lanzamiento (el real dura 0,1–0,2 s). */
export const THROW_SLOWMO = 12;
export const PHASES_END = 0.8;

/**
 * Avanza `dt` segundos (dt ≥ 0, ya acotado por useHarmonicClock) la animación
 * de la diapositiva. Devuelve `true` si la animación terminó sola (para que el
 * motor actualice los botones ▶/⏸).
 */
export function stepSlide(slide: number, dt: number, p: SimParams, f: SimFlags): boolean {
  const d = Math.max(0, dt);
  switch (slide) {
    case 3:
      p.gait_t = (p.gait_t + d * 22) % 100;
      return false;
    case 5:
      f.pePhase += d;
      return false;
    case 7:
      f.pogoPhase += d * 0.8;
      return false;
    case 11: {
      const tf = throwTime(p.th_case) * THROW_SLOWMO;
      f.throwPhase = Math.min(tf, f.throwPhase + d);
      if (f.throwPhase >= tf) {
        f.throwPlaying = false;
        return true;
      }
      return false;
    }
    case 12:
      p.ph_t = Math.min(PHASES_END, p.ph_t + d * 0.16);
      if (p.ph_t >= PHASES_END) {
        f.phPlaying = false;
        return true;
      }
      return false;
    case 14:
      f.golfPhase += d * 0.35;
      return false;
    default:
      return false;
  }
}

/* ─── Utilidades de lienzo ───────────────────────────────────────────────── */

function getCanvas(id: string): { cv: HTMLCanvasElement; ctx: CanvasRenderingContext2D; w: number; h: number } | null {
  const cv = document.getElementById(id) as HTMLCanvasElement | null;
  if (!cv || cv.clientWidth < 8 || cv.clientHeight < 8) return null;
  const w = cv.clientWidth;
  const h = cv.clientHeight;
  const ctx = cv.getContext('2d');
  if (!ctx) return null;
  const dpr = cv.width / w || 1;
  AB.setup(ctx, w, h, dpr);
  return { cv, ctx, w, h };
}

function ground(ctx: CanvasRenderingContext2D, x0: number, x1: number, y: number, color = PAL.line, lw = 2.5) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.beginPath();
  ctx.moveTo(x0, y);
  ctx.lineTo(x1, y);
  ctx.stroke();
}

function polyline(ctx: CanvasRenderingContext2D, pts: [number, number][]) {
  ctx.beginPath();
  pts.forEach(([x, y], i) => {
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
}

/** Barra horizontal de progreso con borde. */
function bar(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, frac: number, color: string) {
  ctx.fillStyle = AB.alpha(PAL.ink3, 0.16);
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w * Math.max(0, Math.min(1, frac)), h);
  ctx.strokeStyle = PAL.line;
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, w, h);
}

function head(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.fillStyle = PAL.skin;
  ctx.strokeStyle = PAL.skinEdge;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

/* ══════════════════════════════════════════════════════════════════════════
   S1 · Estabilidad (§3.2.1, Prob. 3.1, Fig. 3.8)
   ══════════════════════════════════════════════════════════════════════════ */

export type Projector = (x: number, y: number, z: number) => { x: number; y: number };
let stabProjector: Projector | null = null;
/** La escena 3D registra aquí su proyección mundo→pantalla (o `null` al desmontarse). */
export function setStabProjector(fn: Projector | null): void {
  stabProjector = fn;
}

/** Geometría del modelo de una línea del Prob. 3.1 (en metros). */
export function stabModel(H: number, cmFrac: number) {
  const foot = 0.152 * H;
  const dB = 0.25 * foot; // talón detrás del apoyo
  const dF = 0.75 * foot; // dedos delante
  const hCM = cmFrac * H;
  const aF = (Math.atan(dF / hCM) * 180) / Math.PI;
  const aB = (Math.atan(dB / hCM) * 180) / Math.PI;
  return { foot, dB, dF, hCM, aF, aB };
}

export function drawStab(p: SimParams, f: SimFlags, out?: OutFn): void {
  const c = getCanvas('sim-stab');
  if (!c) return;
  const { ctx, w, h } = c;
  const H = p.stab_H;
  const theta = p.stab_theta;
  const { dB, dF, hCM, aF, aB } = stabModel(H, f.stabCM);
  const th = (theta * Math.PI) / 180;
  const cmX = hCM * Math.sin(th);
  const cmY = hCM * Math.cos(th);
  const stable = cmX >= -dB && cmX <= dF;

  // Proyección: escena 3D (si está lista) o esquema 2D de una línea.
  const proj = stabProjector;
  const yg = h * 0.84;
  const k = Math.min((h * 0.62) / H, (w * 0.5) / H);
  const P = (x: number, y: number) => (proj ? proj(x, y, 0) : { x: w / 2 + x * k, y: yg - y * k });

  if (!proj) {
    ground(ctx, w * 0.04, w * 0.96, yg, PAL.ink, 2.4);
    // Modelo «unidimensional» del Prob. 3.1: una línea rígida de altura H.
    const top = P(H * Math.sin(th), H * Math.cos(th));
    const base = P(0, 0);
    ctx.strokeStyle = AB.alpha(PAL.ink3, 0.55);
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(base.x, base.y);
    ctx.lineTo(top.x, top.y);
    ctx.stroke();
    head(ctx, top.x, top.y - 10, 10);
  }

  // Base de sustentación (pie de 0,152 H, apoyo al 25 % desde el talón).
  const pH = P(-dB, 0);
  const pT = P(dF, 0);
  ctx.strokeStyle = PAL.amber;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(pH.x, pH.y);
  ctx.lineTo(pT.x, pT.y);
  ctx.stroke();
  AB.text(ctx, 'talón', pH.x - 6, pH.y + 16, { size: 12, color: PAL.ink2, align: 'right' });
  AB.text(ctx, 'dedos', pT.x + 6, pT.y + 16, { size: 12, color: PAL.ink2, align: 'left' });

  // Línea de gravedad + CM
  const col = stable ? PAL.teal : PAL.blood;
  const pCM = P(cmX, cmY);
  const pFl = P(cmX, 0);
  ctx.strokeStyle = col;
  ctx.setLineDash([5, 4]);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(pCM.x, pCM.y);
  ctx.lineTo(pFl.x, pFl.y);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.arc(pCM.x, pCM.y, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = PAL.card;
  ctx.lineWidth = 1.8;
  ctx.stroke();
  AB.text(ctx, 'CM', pCM.x + 12, pCM.y - 12, { size: 13, weight: '700', color: col, align: 'left' });

  if (stable) {
    AB.arrow(ctx, pFl.x, pFl.y - 48, pFl.x, pFl.y - 8, { color: PAL.teal, width: 2.4, head: 8 });
  } else {
    // Torque de vuelco alrededor del borde que quedó dentro.
    const front = cmX > dF;
    const piv = front ? pT : pH;
    const dir = front ? 1 : -1;
    const rr = 34;
    ctx.strokeStyle = col;
    ctx.lineWidth = 3;
    const a0 = front ? Math.PI * 1.15 : -Math.PI * 0.15;
    const a1 = front ? Math.PI * 1.85 : -Math.PI * 0.85;
    ctx.beginPath();
    ctx.arc(piv.x, piv.y - rr, rr, a0, a1, !front);
    ctx.stroke();
    const ex = piv.x + rr * Math.cos(a1);
    const ey = piv.y - rr + rr * Math.sin(a1);
    AB.triangle(ctx, ex, ey, 9, { color: col });
    AB.text(ctx, '¡pierde el equilibrio!', pCM.x + dir * 12, pCM.y - 34, {
      size: 13,
      weight: '700',
      color: PAL.blood,
      align: front ? 'left' : 'right',
    });
  }

  // Ángulos límite (arriba a la izquierda, fuera del cuerpo).
  const ly = proj ? 64 : 22;
  AB.text(ctx, `adelante máx. ${AB.fmt(aF, 1)}°`, 12, ly, { size: 12, align: 'left', color: PAL.teal, weight: '700' });
  AB.text(ctx, `atrás máx. ${AB.fmt(aB, 1)}°`, 12, ly + 18, { size: 12, align: 'left', color: PAL.teal, weight: '700' });
  AB.text(ctx, `CM a ${AB.fmt(f.stabCM, 2)} H`, 12, ly + 36, { size: 12, align: 'left', color: PAL.ink2 });

  out?.(
    'stab_out',
    `θ = ${AB.fmt(theta, 1)}° · límites +${AB.fmt(aF, 1)}° / −${AB.fmt(aB, 1)}° · ${stable ? 'estable ✓' : '¡se cae! ✗'}`,
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   S2 · Presión bajo los pies (§3.2.2)
   700 N → 2 N/cm² (350 cm²) · almohadilla y talón 10 N/cm² (≈70 cm²)
   marcha: 1400 N por pie → ≈40 N/cm² · pico ≈60 N/cm² (menor área)
   ══════════════════════════════════════════════════════════════════════════ */

export function pressures(m: number) {
  const W = m * G_EARTH;
  return {
    W,
    avg: W / 350,
    pads: W / 70,
    footForce: 2 * W,
    walk: (2 * W) / 35,
    peak: ((2 * W) / 35) * 1.5,
  };
}

function sole(ctx: CanvasRenderingContext2D, x: number, y: number, len: number, color: string, peakHeel: boolean) {
  ctx.fillStyle = AB.alpha(PAL.teal, 0.06);
  ctx.strokeStyle = PAL.line;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x - len * 0.17, y - len * 0.5);
  ctx.quadraticCurveTo(x, y - len * 0.58, x + len * 0.17, y - len * 0.5);
  ctx.lineTo(x + len * 0.23, y - len * 0.02);
  ctx.quadraticCurveTo(x + len * 0.3, y + len * 0.28, x, y + len * 0.4);
  ctx.quadraticCurveTo(x - len * 0.3, y + len * 0.28, x - len * 0.23, y - len * 0.02);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  const heat = (hx: number, hy: number, hr: number) => {
    const g = ctx.createRadialGradient(hx, hy, 2, hx, hy, hr);
    g.addColorStop(0, color);
    g.addColorStop(1, AB.alpha(PAL.paper, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(hx, hy, hr, 0, Math.PI * 2);
    ctx.fill();
  };
  heat(x, y - len * 0.34, len * (peakHeel ? 0.16 : 0.21)); // almohadilla
  heat(x, y + len * 0.28, len * 0.21); // talón
}

export function drawPresion(p: SimParams, f: SimFlags, out?: OutFn): void {
  const c = getCanvas('sim-presion');
  if (!c) return;
  const { ctx, w, h } = c;
  const P = pressures(p.pr_mass);
  const walk = f.presionMode === 'walk';
  const shown = walk ? P.peak : P.pads;
  const pmax = 70;
  const colorOf = (v: number) => (v < 15 ? PAL.teal : v < 45 ? PAL.amber : PAL.blood);
  const feet = walk ? 1 : 2;
  const flen = Math.min(w * 0.3, h * 0.42);
  const fy = h * 0.46;
  const x0 = w / 2 - (feet === 2 ? flen * 0.62 : 0);
  for (let i = 0; i < feet; i++) sole(ctx, x0 + i * flen * 1.24, fy, flen, colorOf(shown), walk);

  AB.text(ctx, walk ? 'Marcha · un pie soporta ≈ 2 W' : 'De pie · dos pies, W repartido', w / 2, h * 0.07, {
    size: 14,
    weight: '700',
    color: PAL.teal,
  });

  // Escala 0–70 N/cm² con las cuatro anclas del libro.
  const gx = w * 0.1;
  const gw = w * 0.8;
  const gy = h * 0.82;
  const grad = ctx.createLinearGradient(gx, 0, gx + gw, 0);
  grad.addColorStop(0, PAL.teal);
  grad.addColorStop(0.5, PAL.amber);
  grad.addColorStop(1, PAL.blood);
  ctx.fillStyle = grad;
  ctx.fillRect(gx, gy, gw, 9);
  ctx.strokeStyle = PAL.line;
  ctx.lineWidth = 1;
  ctx.strokeRect(gx, gy, gw, 9);
  const X = (v: number) => gx + (gw * v) / pmax;
  const anchors: [number, string][] = [
    [P.avg, 'media'],
    [P.pads, 'talón'],
    [P.walk, 'marcha'],
    [P.peak, 'pico'],
  ];
  anchors.forEach(([v, lab], i) => {
    const x = X(v);
    ctx.strokeStyle = PAL.ink2;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(x, gy - 4);
    ctx.lineTo(x, gy + 13);
    ctx.stroke();
    AB.text(ctx, `${lab} ${AB.fmt(v, 0)}`, x, gy + (i % 2 ? 40 : 24), { size: 12, color: PAL.ink2 });
  });
  AB.text(ctx, 'N/cm²', gx + gw, gy - 12, { size: 12, color: PAL.ink3, align: 'right' });
  AB.triangle(ctx, X(shown), gy - 10, 11, { color: colorOf(shown) });

  out?.(
    'pr_out',
    walk
      ? `F ≈ ${AB.espan(Math.round(P.footForce / 10) * 10)} N/pie → ${AB.fmt(P.walk, 0)} N/cm² · pico ≈ ${AB.fmt(P.peak, 0)} N/cm²`
      : `media ${AB.fmt(P.avg, 1)} N/cm² · almohadilla y talón ≈ ${AB.fmt(P.pads, 0)} N/cm²`,
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   S3 · Ciclo de la marcha (§3.3.1, §3.4.1)
   apoyo 60–65 % (aquí 62 %), doble apoyo = primer y último ≈10 % del apoyo
   ══════════════════════════════════════════════════════════════════════════ */

const STANCE = 62;

export function drawGait(p: SimParams, _f: SimFlags, out?: OutFn): void {
  const c = getCanvas('sim-gait');
  if (!c) return;
  const { ctx, w, h } = c;
  const t = p.gait_t;
  const yg = h * 0.6;
  const cx = w / 2;
  const leg = Math.min(h * 0.36, w * 0.3);
  const stride = leg * 0.9;
  const hipY = yg - leg;
  const lift = leg * 0.22;

  ground(ctx, w * 0.05, w * 0.95, yg);
  const phases = [t % 100, (t + 50) % 100];
  const inStance = phases.map((ph) => ph < STANCE);

  phases.forEach((ph, i) => {
    const hipX = cx;
    const isStance = inStance[i];
    let footX: number, footY: number, kneeX: number, kneeY: number;
    if (isStance) {
      const r = ph / STANCE;
      footX = hipX + stride * 0.3 - r * stride * 0.6;
      footY = yg;
      kneeX = (hipX + footX) / 2 + leg * 0.05;
      kneeY = (hipY + yg) / 2 + 0.04 * leg * Math.sin(Math.PI * r);
    } else {
      const r = (ph - STANCE) / (100 - STANCE);
      footX = hipX - stride * 0.3 + r * stride * 0.6;
      footY = yg - Math.sin(r * Math.PI) * lift - 4;
      kneeX = (hipX + footX) / 2 + leg * 0.16 * Math.sin(r * Math.PI) + leg * 0.04;
      kneeY = (hipY + footY) / 2 - 0.08 * leg * Math.sin(r * Math.PI);
    }
    const col = isStance ? PAL.teal : PAL.amber;
    AB.bone(ctx, hipX, hipY, kneeX, kneeY, { width: 9, edge: PAL.boneDark, fill: isStance ? PAL.boneMid : PAL.paper3, joint: false });
    AB.bone(ctx, kneeX, kneeY, footX, footY, { width: 8, edge: PAL.boneDark, fill: isStance ? PAL.bone : PAL.paper3, joint: false });
    AB.joint(ctx, kneeX, kneeY, 4, { color: col, fill: PAL.card });
    AB.foot(ctx, footX, isStance ? yg - 2 : footY + 6, isStance ? 0 : 0.25, { len: 30, h: 13, fill: isStance ? PAL.skinEdge : PAL.skin });
  });
  AB.joint(ctx, cx, hipY, 5, { color: PAL.ink3, fill: PAL.card });
  const double = inStance[0] && inStance[1];
  AB.text(ctx, double ? 'DOBLE APOYO' : inStance[0] ? 'apoyo: pierna 1' : 'apoyo: pierna 2', cx, hipY - 22, {
    size: 13,
    weight: '700',
    color: double ? PAL.sagittal : PAL.teal,
  });

  // Barras de ciclo 0–100 % por pierna, con apoyo/balanceo y cursor.
  const bx = w * 0.16;
  const bw = w * 0.72;
  const by = yg + 30;
  [0, 1].forEach((i) => {
    const y = by + i * 26;
    const off = i === 0 ? 0 : 50;
    ctx.fillStyle = AB.alpha(PAL.amber, 0.55);
    ctx.fillRect(bx, y, bw, 12);
    ctx.fillStyle = PAL.teal;
    const s0 = (100 - off) % 100; // inicio del apoyo en el eje de tiempo
    const segs = s0 + STANCE <= 100 ? [[s0, s0 + STANCE]] : [[s0, 100], [0, s0 + STANCE - 100]];
    segs.forEach(([a, b]) => ctx.fillRect(bx + (bw * a) / 100, y, (bw * (b - a)) / 100, 12));
    ctx.strokeStyle = PAL.line;
    ctx.lineWidth = 1;
    ctx.strokeRect(bx, y, bw, 12);
    AB.text(ctx, `P${i + 1}`, bx - 8, y + 6, { size: 12, color: PAL.ink2, align: 'right' });
  });
  const tx = bx + (bw * t) / 100;
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(tx, by - 6);
  ctx.lineTo(tx, by + 44);
  ctx.stroke();
  AB.text(ctx, 'apoyo 62 %', bx, by + 62, { size: 12, color: PAL.teal, align: 'left', weight: '700' });
  AB.text(ctx, 'balanceo 38 %', bx + bw, by + 62, { size: 12, color: PAL.amber, align: 'right', weight: '700' });

  out?.('gait_out', `t = ${AB.fmt(t, 0)} % del ciclo · ${double ? 'doble apoyo' : 'apoyo simple'}`);
}

/* ══════════════════════════════════════════════════════════════════════════
   S4 · Fricción (§3.3.3, Tabla 3.5, Fig. 3.17)
   μ_s > 0,15 para caminar; ≈0,17 requerido a 3 mph
   ══════════════════════════════════════════════════════════════════════════ */

export const MU_MIN = 0.15;
export const MU_3MPH = 0.17;

export function drawFriccion(p: SimParams, _f: SimFlags, out?: OutFn): void {
  const c = getCanvas('sim-friccion');
  if (!c) return;
  const { ctx, w, h } = c;
  const mu = p.fr_mu;
  const level = mu >= MU_3MPH ? 2 : mu >= MU_MIN ? 1 : 0;
  const col = level === 2 ? PAL.good : level === 1 ? PAL.amber : PAL.blood;
  const yg = h * 0.5;

  ground(ctx, w * 0.05, w * 0.95, yg);
  const fx = w / 2;
  AB.foot(ctx, fx, yg - 4, 0, { len: 64, h: 22 });
  // El pie empuja el suelo hacia atrás (gris); el suelo empuja al pie hacia adelante (fricción).
  AB.arrow(ctx, fx - 10, yg + 8, fx - 120, yg + 8, { color: PAL.ink3, width: 3 });
  AB.text(ctx, 'pie → suelo', fx - 66, yg + 24, { size: 12, color: PAL.ink3 });
  AB.arrow(ctx, fx + 10, yg - 30, fx + 10 + 40 + 220 * Math.min(mu, 0.4), yg - 30, { color: col, width: 4 });
  AB.text(ctx, 'fricción ≤ μₛ·N (suelo → pie)', fx + 14, yg - 50, {
    size: 12,
    color: col,
    align: 'left',
    weight: '700',
  });
  AB.text(ctx, level === 2 ? '¡camina a 3 mph! ✓' : level === 1 ? 'solo paso lento' : '¡resbala! ✗', w / 2, h * 0.12, {
    size: 18,
    weight: '700',
    color: col,
  });

  // Escala de μ con anclas de la Tabla 3.5 y la Fig. 3.17.
  const gx = w * 0.08;
  const gw = w * 0.84;
  const gy = h * 0.8;
  const X = (m: number) => gx + gw * (m / 0.4);
  ground(ctx, gx, gx + gw, gy, PAL.line, 2);
  ctx.fillStyle = AB.alpha(PAL.teal, 0.14);
  ctx.fillRect(X(MU_MIN), gy - 6, gx + gw - X(MU_MIN), 12);
  const marks: [number, string, number][] = [
    [0.02, 'hielo cin. 0,02', 1],
    [0.1, 'hielo 0,1', 0],
    [MU_MIN, 'mín. 0,15', 1],
    [MU_3MPH, '3 mph 0,17', 0],
  ];
  marks.forEach(([m, lab, row]) => {
    ctx.strokeStyle = PAL.ink3;
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(X(m), gy - 8);
    ctx.lineTo(X(m), gy + 10);
    ctx.stroke();
    ctx.setLineDash([]);
    AB.text(ctx, lab, X(m), gy + (row ? 36 : 20), { size: 12, color: PAL.ink2 });
  });
  const mx = X(Math.min(mu, 0.4));
  AB.triangle(ctx, mx, gy - 14, 11, { color: col });
  AB.text(ctx, `μ = ${AB.fmt(mu, 2)}`, mx, gy - 30, { size: 13, weight: '700', color: col });

  out?.('fr_out', `μ = ${AB.fmt(mu, 2)} · requerido 0,15 (mín.) / 0,17 (3 mph) · ${level === 2 ? '✓' : level === 1 ? '≈' : '✗'}`);
}

/* ══════════════════════════════════════════════════════════════════════════
   S5 · Pierna como péndulo (§3.3.5–§3.3.7)
   ══════════════════════════════════════════════════════════════════════════ */

export const PLANET_G = { earth: G_EARTH, moon: 0.17 * G_EARTH, mars: 0.4 * G_EARTH } as const;

export function pendulum(H: number, g: number) {
  // El libro redondea L = 0,53 H a 0,95 m y usa d/I = 0,421/0,256 (≈ 0,61 L).
  const L = Math.round(0.53 * H * 100) / 100;
  const R = 0.5 * H; // 0,9 m para H = 1,8 m (§3.3.7)
  return {
    L,
    simple: Math.PI * Math.sqrt(L / g),
    rod: Math.PI * Math.sqrt((2 * L) / (3 * g)),
    twoSeg: Math.PI * Math.sqrt(((0.256 / 0.421) * L) / g),
    vmax: Math.sqrt(g * R),
  };
}

export function drawPendulo(p: SimParams, f: SimFlags, out?: OutFn): void {
  const c = getCanvas('sim-pendulo');
  if (!c) return;
  const { ctx, w, h } = c;
  const g = PLANET_G[p.pe_planet];
  const M = pendulum(p.pe_H, g);
  const w0 = Math.PI / M.rod; // ω de la varilla uniforme
  const A = 0.4;
  const ang = A * Math.cos(w0 * f.pePhase);
  const px = w * 0.3;
  const py = h * 0.12;
  const Lpx = Math.min(h * 0.62, w * 0.4);
  const ax = px + Lpx * Math.sin(ang);
  const ay = py + Lpx * Math.cos(ang);

  ctx.strokeStyle = AB.alpha(PAL.ink3, 0.4);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(px, py, Lpx, Math.PI / 2 - A - 0.05, Math.PI / 2 + A + 0.05);
  ctx.stroke();
  AB.dashed(ctx, px, py, px, py + Lpx, { color: PAL.ink3 });
  AB.bone(ctx, px, py, ax, ay, { width: 12, edge: PAL.boneDark, fill: PAL.bone, joint: false });
  AB.joint(ctx, px, py, 6, { color: PAL.teal });
  AB.foot(ctx, ax, ay, 0, { len: 34, h: 13, fill: PAL.skinEdge });
  AB.text(ctx, 'cadera', px, py - 14, { size: 12, color: PAL.ink2 });
  AB.text(ctx, `L = 0,53 H = ${AB.fmt(M.L, 2)} m`, px, py + Lpx + 34, { size: 12, color: PAL.ink2 });

  // Comparación de los tres modelos con el paso real (≈0,60 s, marcha lenta).
  const gx = w * 0.58;
  const gw = w * 0.36;
  const tmax = Math.max(1.2, M.simple * 1.1, 0.7);
  const rows: [string, number, string][] = [
    ['bola-hilo', M.simple, PAL.ink3],
    ['varilla', M.rod, PAL.teal],
    ['2 segmentos', M.twoSeg, PAL.sagittal],
  ];
  AB.text(ctx, 'T½ (s)', gx, h * 0.1, { size: 13, weight: '700', color: PAL.ink, align: 'left' });
  rows.forEach(([lab, v, col], i) => {
    const y = h * 0.18 + i * 46;
    AB.text(ctx, `${lab}: ${AB.fmt(v, 2)} s`, gx, y, { size: 12, color: PAL.ink2, align: 'left' });
    bar(ctx, gx, y + 10, gw, 12, v / tmax, col);
  });
  const xr = gx + (gw * 0.6) / tmax;
  ctx.strokeStyle = PAL.blood;
  ctx.setLineDash([4, 3]);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(xr, h * 0.18 + 4);
  ctx.lineTo(xr, h * 0.18 + 2 * 46 + 26);
  ctx.stroke();
  ctx.setLineDash([]);
  AB.text(ctx, 'real ≈ 0,60 s', xr, h * 0.18 + 2 * 46 + 40, { size: 12, color: PAL.blood, weight: '700' });
  AB.text(ctx, `vₘₐₓ = √(gR) = ${AB.fmt(M.vmax, 1)} m/s`, gx, h * 0.78, { size: 13, weight: '700', color: PAL.amber, align: 'left' });
  AB.text(ctx, `R = ${AB.fmt(0.5 * p.pe_H, 2)} m`, gx, h * 0.78 + 20, { size: 12, color: PAL.ink2, align: 'left' });

  out?.('pe_out', `T½ = ${AB.fmt(M.simple, 2)} / ${AB.fmt(M.rod, 2)} / ${AB.fmt(M.twoSeg, 2)} s · vₘₐₓ = ${AB.fmt(M.vmax, 1)} m/s`);
}

/* ══════════════════════════════════════════════════════════════════════════
   S6 · Energética: caminar (fuera de fase) vs correr (en fase)  §3.3.4, §3.4.3
   ══════════════════════════════════════════════════════════════════════════ */

export function drawEnergy(_p: SimParams, f: SimFlags, out?: OutFn): void {
  const c = getCanvas('sim-energy');
  if (!c) return;
  const { ctx, w, h } = c;
  const run = f.energyMode === 'run';
  const x0 = w * 0.08;
  const x1 = w * 0.96;
  const y0 = h * 0.2;
  const y1 = h * 0.74;
  const toXY = (t: number, v: number): [number, number] => [x0 + t * (x1 - x0), y1 - (v / 2.6) * (y1 - y0)];
  const A = 0.3;
  const cos = (t: number) => Math.cos(2 * Math.PI * t);
  // PE + KE_V frente a KE_H (Fig. 3.20 / 3.32), en unidades relativas.
  const curves: { key: string; fn: (t: number) => number; color: string; label: string; lw: number }[] = [
    { key: 'pe', fn: (t) => 1 + A * cos(t), color: PAL.sagittal, label: 'PE + KEᵥ', lw: 2 },
    { key: 'keh', fn: run ? (t) => 1 + A * cos(t) - 0.02 : (t) => 1 - 0.9 * A * cos(t), color: PAL.teal, label: 'KEₕ', lw: 2 },
    {
      key: 'tot',
      fn: run ? (t) => (2 + 2 * A * cos(t)) * 0.62 + 0.2 : (t) => (2 + 0.1 * A * cos(t)) * 0.62 + 0.2,
      color: PAL.blood,
      label: 'E total (escala ×0,6)',
      lw: 3,
    },
  ];

  ctx.strokeStyle = PAL.line;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
  curves.forEach((cv) => {
    ctx.strokeStyle = cv.color;
    ctx.lineWidth = cv.lw;
    const pts: [number, number][] = [];
    for (let i = 0; i <= 120; i++) pts.push(toXY(i / 120, cv.fn(i / 120)));
    polyline(ctx, pts);
  });
  // Leyenda medida (sin solapes al subir el piso tipográfico).
  ctx.font = AB.font(12);
  let lx = x0;
  curves.forEach((cv) => {
    ctx.fillStyle = cv.color;
    ctx.fillRect(lx, y0 - 22, 14, 4);
    AB.text(ctx, cv.label, lx + 18, y0 - 20, { size: 12, color: PAL.ink2, align: 'left' });
    ctx.font = AB.font(12);
    lx += 18 + ctx.measureText(cv.label).width + 16;
  });
  AB.text(ctx, 'un paso (golpe de talón → siguiente)', (x0 + x1) / 2, y1 + 16, { size: 12, color: PAL.ink3 });
  AB.text(ctx, run ? 'EN FASE → la E total oscila' : 'FUERA DE FASE → E total ≈ constante', w / 2, h * 0.88, {
    size: 14,
    weight: '700',
    color: run ? PAL.amber : PAL.good,
  });

  out?.('en_out', run ? 'En fase · recuperación ≈ 5 % (Fig. 3.26)' : 'Fuera de fase · recuperación ≈ 70 % (Fig. 3.26)');
}

/* ══════════════════════════════════════════════════════════════════════════
   S7 · Pogo stick / pelota que rebota (§3.4.3–§3.4.4, Tabla 3.11)
   100 J de KE por pisada: Aquiles 35 J (93 %), arco 17 J (80 %); pista +12 J
   ══════════════════════════════════════════════════════════════════════════ */

export function pogoBudget(track: boolean) {
  const achilles = 35 * 0.93;
  const arch = 17 * 0.8;
  const trackJ = track ? 12 : 0;
  return { achilles, arch, trackJ, total: achilles + arch + trackJ, muscles: Math.max(0, 100 - achilles - arch - trackJ) };
}

export function drawPogo(_p: SimParams, f: SimFlags, out?: OutFn): void {
  const c = getCanvas('sim-pogo');
  if (!c) return;
  const { ctx, w, h } = c;
  const ph = f.pogoPhase;
  const yg = h * 0.88;
  const px = w * 0.2;
  const contact = Math.max(0, Math.cos(ph * 2 * Math.PI)); // 0 en vuelo, 1 compresión máx.
  const s = contact * h * 0.1;
  const air = (1 - contact) * h * 0.12 * Math.abs(Math.sin(ph * Math.PI));

  ground(ctx, w * 0.04, w * 0.42, yg, f.pogoTrack ? PAL.teal : PAL.line, f.pogoTrack ? 4 : 2.5);
  const footY = yg - air;
  const springTop = footY - h * 0.28 + s;
  ctx.strokeStyle = PAL.amber;
  ctx.lineWidth = 2.5;
  const pts: [number, number][] = [];
  for (let i = 0; i <= 10; i++) pts.push([px + (i % 2 ? 10 : -10), springTop + (footY - 8 - springTop) * (i / 10)]);
  polyline(ctx, pts);
  ctx.fillStyle = PAL.ink3;
  ctx.fillRect(px - 22, footY - 8, 44, 8);
  ctx.strokeStyle = PAL.skinEdge;
  ctx.lineWidth = 11;
  ctx.beginPath();
  ctx.moveTo(px, springTop);
  ctx.lineTo(px, springTop - h * 0.2);
  ctx.stroke();
  head(ctx, px, springTop - h * 0.27, h * 0.05);

  // Reparto KE ↔ EE durante el ciclo (fracciones; TE = KE + PE + EE constante).
  const bx = w * 0.48;
  const bw = w * 0.46;
  AB.text(ctx, 'durante el contacto', bx, h * 0.06, { size: 12, color: PAL.ink3, align: 'left' });
  AB.text(ctx, 'KE + PE', bx, h * 0.13, { size: 12, color: PAL.ink2, align: 'left' });
  bar(ctx, bx, h * 0.15, bw, 12, 1 - contact, PAL.teal);
  AB.text(ctx, 'EE elástica', bx, h * 0.24, { size: 12, color: PAL.ink2, align: 'left' });
  bar(ctx, bx, h * 0.26, bw, 12, contact, PAL.amber);

  // Balance por pisada a 4,5 m/s (maratón): 100 J de KE.
  const B = pogoBudget(f.pogoTrack);
  const rows: [string, number, string][] = [
    ['Aquiles 35 J × 93 %', B.achilles, PAL.good],
    ['arco 17 J × 80 %', B.arch, PAL.good],
    ['pista sintonizada', B.trackJ, PAL.teal],
    ['músculos aportan', B.muscles, PAL.blood],
  ];
  AB.text(ctx, '100 J de KE perdidos por pisada', bx, h * 0.38, { size: 13, weight: '700', color: PAL.ink, align: 'left' });
  rows.forEach(([lab, v, col], i) => {
    const y = h * 0.46 + i * 40;
    AB.text(ctx, `${lab}: ${AB.fmt(v, 1)} J`, bx, y, { size: 12, color: PAL.ink2, align: 'left' });
    bar(ctx, bx, y + 9, bw, 10, v / 100, col);
  });

  out?.('po_out', `recuperable ≈ ${AB.fmt(B.total, 0)} J de 100 J${f.pogoTrack ? ' (+12 J pista)' : ''}`);
}

/* ══════════════════════════════════════════════════════════════════════════
   S8 · Aceleración hasta el sprint (§3.4.3, ec. 3.38–3.47)
   ══════════════════════════════════════════════════════════════════════════ */

export function sprint(F: number, mb: number, L = 1.0) {
  const mLeg = 0.161 * mb;
  const x = (mb - 2 * mLeg) / (mb - mLeg);
  const vFinal = Math.sqrt((2 * F * L) / mLeg);
  const vn = (n: number) => vFinal * Math.sqrt(1 - Math.pow(x, n));
  return { mLeg, x, vFinal, vn };
}

export function drawSprint(p: SimParams, _f: SimFlags, out?: OutFn): void {
  const c = getCanvas('sim-sprint');
  if (!c) return;
  const { ctx, w, h } = c;
  const S = sprint(p.sp_F, p.sp_m);
  const N = 10;
  const x0 = w * 0.12;
  const x1 = w * 0.95;
  const y0 = h * 0.14;
  const y1 = h * 0.78;
  const vTop = 14;
  const Y = (v: number) => y1 - (v / vTop) * (y1 - y0);

  ctx.strokeStyle = PAL.line;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x0, y1);
  ctx.lineTo(x1, y1);
  ctx.stroke();
  [0, 5, 10].forEach((v) => AB.text(ctx, `${v}`, x0 - 8, Y(v), { size: 12, color: PAL.ink3, align: 'right' }));
  AB.text(ctx, 'v (m/s)', x0, y0 - 14, { size: 12, color: PAL.ink3, align: 'left' });

  const bw = ((x1 - x0) / N) * 0.62;
  for (let n = 1; n <= N; n++) {
    const xc = x0 + ((n - 0.5) * (x1 - x0)) / N;
    const v = S.vn(n);
    ctx.fillStyle = AB.alpha(PAL.teal, 0.25 + (0.6 * n) / N);
    ctx.fillRect(xc - bw / 2, Y(v), bw, y1 - Y(v));
    AB.text(ctx, `${n}`, xc, y1 + 14, { size: 12, color: PAL.ink3 });
  }
  AB.text(ctx, 'zancada n', x1, y1 + 32, { size: 12, color: PAL.ink3, align: 'right' });

  const line = (v: number, col: string, lab: string, dy: number) => {
    ctx.strokeStyle = col;
    ctx.setLineDash([5, 4]);
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(x0, Y(v));
    ctx.lineTo(x1, Y(v));
    ctx.stroke();
    ctx.setLineDash([]);
    AB.text(ctx, lab, x1, Y(v) + dy, { size: 12, color: col, align: 'right', weight: '700' });
  };
  const above = S.vFinal > 10.4;
  line(Math.min(S.vFinal, vTop), PAL.blood, `v final = ${AB.fmt(S.vFinal, 1)} m/s`, above ? -10 : 16);
  line(10.4, PAL.amber, 'clase mundial 10,4 m/s', above ? 16 : -10);

  out?.('sp_out', `v final = ${AB.fmt(S.vFinal, 1)} m/s (${AB.fmt(S.vFinal * MPH, 1)} mph) · v₁ = ${AB.fmt(S.vn(1), 1)} m/s`);
}

/* ══════════════════════════════════════════════════════════════════════════
   S9 · Salto vertical (§3.5.1, ec. 3.48–3.60)
   ══════════════════════════════════════════════════════════════════════════ */

export function jump(m: number, N: number, s: number) {
  const W = m * G_EARTH;
  const net = N - W;
  if (net <= 0) return { W, H: 0, vTO: 0, tau: Infinity, ok: false };
  const H = (net * s) / W;
  const tau = Math.sqrt((2 * (W / net) * s) / G_EARTH);
  return { W, H, vTO: (2 * s) / tau, tau, ok: true };
}

export function drawJump(p: SimParams, f: SimFlags, out?: OutFn): void {
  const c = getCanvas('sim-jump');
  if (!c) return;
  const { ctx, w, h } = c;
  const J = jump(p.jp_mass, p.jp_N, p.jp_s);
  const cm = f.jumpMode === 'cm';
  const x0 = w * 0.1;
  const x1 = w * 0.62;
  const y0 = h * 0.14;
  const y1 = h * 0.7;
  const Nmax = Math.max(p.jp_N * 1.5, J.W * 1.6);
  const Y = (v: number) => y1 - (v / Nmax) * (y1 - y0);

  ctx.strokeStyle = PAL.line;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
  AB.dashed(ctx, x0, Y(J.W), x1, Y(J.W), { color: PAL.ink3 });
  AB.text(ctx, `W = ${AB.fmt(J.W, 0)} N`, x0 + 6, Y(J.W) + 12, { size: 12, color: PAL.ink3, align: 'left' });
  AB.dashed(ctx, x0, Y(p.jp_N), x1, Y(p.jp_N), { color: PAL.amber });
  AB.text(ctx, `⟨N⟩ = ${AB.espan(p.jp_N)} N`, x1 - 6, Y(p.jp_N) - 12, { size: 12, color: PAL.amber, align: 'right' });

  // N(t) esquemático: contramovimiento cae bajo W y luego supera ⟨N⟩ (más trabajo).
  ctx.strokeStyle = PAL.teal;
  ctx.lineWidth = 2.6;
  const pts: [number, number][] = [];
  for (let i = 0; i <= 80; i++) {
    const t = i / 80;
    let Nt: number;
    if (cm) {
      if (t < 0.25) Nt = J.W * (1 - 0.6 * Math.sin((t / 0.25) * Math.PI));
      else if (t < 0.92) Nt = J.W + (p.jp_N * 1.32 - J.W) * Math.sin(((t - 0.25) / 0.67) * Math.PI * 0.95);
      else Nt = J.W * 0.4 * (1 - (t - 0.92) / 0.08);
    } else if (t < 0.92) Nt = J.W + (p.jp_N * 1.15 - J.W) * Math.sin((t / 0.92) * Math.PI * 0.95);
    else Nt = J.W * 0.4 * (1 - (t - 0.92) / 0.08);
    pts.push([x0 + t * (x1 - x0), Y(Math.max(0, Nt))]);
  }
  polyline(ctx, pts);
  AB.text(ctx, 'N(t) del suelo', (x0 + x1) / 2, y0 - 14, { size: 12, color: PAL.teal, weight: '700' });
  AB.text(ctx, cm ? 'contramovimiento' : 'desde cuclillas', x1, y1 + 16, { size: 12, color: PAL.ink3, align: 'right' });
  AB.text(ctx, 'despegue →', x1, y1 + 34, { size: 12, color: PAL.ink3, align: 'right' });

  // Altura del salto a escala (1,05 m → 1,05 m + H).
  const gx = w * 0.82;
  const yg = h * 0.86;
  const scale = (h * 0.62) / 2;
  ground(ctx, w * 0.7, w * 0.96, yg);
  const yTO = yg - 1.05 * scale;
  const yTop = yg - (1.05 + J.H) * scale;
  AB.dashed(ctx, gx - 30, yTO, gx + 30, yTO, { color: PAL.ink3 });
  AB.text(ctx, 'CM 1,05 m', gx - 34, yTO, { size: 12, color: PAL.ink3, align: 'right' });
  ctx.fillStyle = PAL.good;
  ctx.beginPath();
  ctx.arc(gx, yTop, 7, 0, Math.PI * 2);
  ctx.fill();
  AB.arrow(ctx, gx + 16, yTO, gx + 16, yTop + 6, { color: PAL.good, width: 2.4 });
  AB.text(ctx, `H = ${AB.fmt(J.H, 2)} m`, gx + 22, (yTO + yTop) / 2, { size: 13, weight: '700', color: PAL.good, align: 'left' });

  out?.(
    'jp_out',
    J.ok
      ? `H = ${AB.fmt(J.H, 2)} m · v despegue = ${AB.fmt(J.vTO, 1)} m/s · τ = ${AB.fmt(J.tau, 2)} s`
      : '⟨N⟩ ≤ W: no hay despegue',
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   S10 · Salto con pértiga (§3.5.2, ec. 3.61–3.62)
   ══════════════════════════════════════════════════════════════════════════ */

export const vaultHeight = (v: number) => 0.9 - 0.1 + (v * v) / (2 * G_EARTH);

export function drawVault(p: SimParams, _f: SimFlags, out?: OutFn): void {
  const c = getCanvas('sim-vault');
  if (!c) return;
  const { ctx, w, h } = c;
  const v = p.va_v;
  const hBar = vaultHeight(v);
  const yg = h * 0.86;
  const top = h * 0.1;
  const scale = (yg - top) / 7;
  const ax = w * 0.12;

  ctx.strokeStyle = PAL.line;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(ax, top);
  ctx.lineTo(ax, yg);
  ctx.stroke();
  for (let m = 0; m <= 7; m++) {
    const y = yg - m * scale;
    ctx.beginPath();
    ctx.moveTo(ax, y);
    ctx.lineTo(ax + 6, y);
    ctx.stroke();
    AB.text(ctx, `${m} m`, ax - 6, y, { size: 12, color: PAL.ink3, align: 'right' });
  }
  ground(ctx, ax, w * 0.96, yg);

  const rec = yg - 6.16 * scale;
  AB.dashed(ctx, ax + 8, rec, w * 0.94, rec, { color: PAL.amber });
  AB.text(ctx, 'récord 6,16 m (2014)', w * 0.94, rec - 12, { size: 12, color: PAL.amber, align: 'right' });

  const by = yg - hBar * scale;
  ctx.strokeStyle = PAL.blood;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(w * 0.56, by);
  ctx.lineTo(w * 0.9, by);
  ctx.stroke();
  AB.text(ctx, `listón ${AB.fmt(hBar, 2)} m`, w * 0.9, by + 16, { size: 13, weight: '700', color: PAL.blood, align: 'right' });

  // Trayectoria del CM: carrera a 0,9 m → franqueo a h_listón + 0,1 m.
  ctx.strokeStyle = PAL.teal;
  ctx.lineWidth = 2.5;
  ctx.setLineDash([6, 4]);
  const pts: [number, number][] = [];
  for (let i = 0; i <= 50; i++) {
    const t = i / 50;
    const x = ax + 20 + t * (w * 0.78);
    const u = Math.max(0, Math.min(1, (t - 0.3) / 0.6));
    const hh = 0.9 + (hBar + 0.1 - 0.9) * Math.sin(u * Math.PI * 0.5);
    pts.push([x, yg - hh * scale]);
  }
  polyline(ctx, pts);
  ctx.setLineDash([]);

  // Energía: KE inicial = PE ganada.
  const bx = ax + 20;
  AB.text(ctx, `½ m v² → m g Δh · Δh = ${AB.fmt((v * v) / (2 * G_EARTH), 2)} m`, bx, yg + 22, { size: 12, color: PAL.ink2, align: 'left' });

  out?.('va_out', `h listón = ${AB.fmt(hBar, 2)} m (CM en carrera 0,9 m · margen 0,1 m)`);
}

/* ══════════════════════════════════════════════════════════════════════════
   S11 · Lanzar: modelo de un segmento (§3.6, ec. 3.67–3.85)
   ══════════════════════════════════════════════════════════════════════════ */

export const THROW_L = 0.36;
export const THROW_I = (1 / 3) * 2 * THROW_L * THROW_L + 0.146 * THROW_L * THROW_L;

export function drawThrow(p: SimParams, f: SimFlags, out?: OutFn): void {
  const c = getCanvas('sim-throw');
  if (!c) return;
  const { ctx, w, h } = c;
  const key = p.th_case;
  const alpha = THROW_ALPHA[key];
  const tf = throwTime(key);
  const vB = THROW_L * Math.sqrt(Math.PI * alpha);
  const t = Math.min(tf, f.throwPhase / THROW_SLOWMO);
  // θ(t) = 3π/4 − α t²/2  (ec. 3.83), de 135° a 45°.
  const theta = (3 * Math.PI) / 4 - (alpha * t * t) / 2;

  const ex = w * 0.62;
  const ey = h * 0.62;
  const Lpx = Math.min(h * 0.42, w * 0.3);
  AB.bone(ctx, ex, ey - Lpx * 0.8, ex, ey, { width: 13, edge: PAL.boneDark, fill: PAL.boneMid, joint: false });
  AB.joint(ctx, ex, ey - Lpx * 0.8, 6, { color: PAL.ink3 });
  AB.text(ctx, 'húmero (fijo)', ex + 14, ey - Lpx * 0.72, { size: 12, color: PAL.ink3, align: 'left' });
  // θ medido desde el húmero (hacia arriba): antebrazo en dirección (sin θ, cos θ) con y hacia arriba.
  const hx = ex + Lpx * Math.sin(theta);
  const hy = ey - Lpx * Math.cos(theta);
  // Bíceps: del extremo proximal del húmero a la inserción (d_M ≈ 4 cm de 36 → 0,11 L).
  AB.muscle(ctx, ex - 8, ey - Lpx * 0.72, ex + 0.12 * Lpx * Math.sin(theta) - 4, ey - 0.12 * Lpx * Math.cos(theta), {
    w0: 7,
    w1: 4,
    bow: -7,
    fill: PAL.muscle,
  });
  AB.bone(ctx, ex, ey, hx, hy, { width: 12, edge: PAL.boneDark, fill: PAL.bone, joint: false });
  AB.joint(ctx, ex, ey, 6.5, { color: PAL.teal });
  AB.text(ctx, 'codo', ex - 12, ey + 14, { size: 12, color: PAL.ink3, align: 'right' });
  ctx.beginPath();
  ctx.arc(hx, hy, 8, 0, Math.PI * 2);
  ctx.fillStyle = PAL.card;
  ctx.strokeStyle = PAL.blood;
  ctx.lineWidth = 2;
  ctx.fill();
  ctx.stroke();
  // Arco recorrido 135° → 45°.
  ctx.strokeStyle = AB.alpha(PAL.teal, 0.5);
  ctx.setLineDash([3, 4]);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(ex, ey, Lpx, -Math.PI / 2 + Math.PI / 4, -Math.PI / 2 + (3 * Math.PI) / 4);
  ctx.stroke();
  ctx.setLineDash([]);
  AB.text(ctx, `θ = ${AB.fmt((theta * 180) / Math.PI, 0)}°`, ex + Lpx * 0.5, ey + 28, { size: 13, weight: '700', color: PAL.teal });

  // Tabla de los cuatro casos (§3.6): v = L(πα)^½.
  const labels: Record<string, string> = {
    a: 'a · 2 in, ⟨sin θ⟩ 0,707',
    b: 'b · 2 in, ⟨sin θ⟩ 1',
    c: 'c · 3 in, ⟨sin θ⟩ 1',
    d: 'd · 3 in, sin gravedad',
  };
  const bx = w * 0.04;
  const bw = w * 0.4;
  const bh = 22;
  AB.text(ctx, 'caso · v (m/s)', bx, h * 0.07, { size: 12, color: PAL.ink3, align: 'left' });
  (Object.keys(THROW_ALPHA) as (keyof typeof THROW_ALPHA)[]).forEach((k, i) => {
    const y = h * 0.11 + i * (bh + 6);
    const v = THROW_L * Math.sqrt(Math.PI * THROW_ALPHA[k]);
    const on = k === key;
    ctx.fillStyle = on ? AB.alpha(PAL.teal, 0.16) : AB.alpha(PAL.card, 0.7);
    ctx.fillRect(bx, y, bw, bh);
    ctx.strokeStyle = PAL.line;
    ctx.lineWidth = 1;
    ctx.strokeRect(bx, y, bw, bh);
    AB.text(ctx, labels[k], bx + 6, y + bh / 2, { size: 12, color: on ? PAL.tealDeep : PAL.ink2, align: 'left', weight: on ? '700' : '400' });
    AB.text(ctx, AB.fmt(v, v < 10 ? 2 : 1), bx + bw - 6, y + bh / 2, { size: 12, color: on ? PAL.tealDeep : PAL.ink2, align: 'right', weight: '700' });
  });
  AB.text(ctx, `I = ${AB.fmt(THROW_I, 3)} kg·m² · t final = ${AB.fmt(tf, 3)} s`, bx, h * 0.11 + 4 * (bh + 6) + 10, {
    size: 12,
    color: PAL.ink2,
    align: 'left',
  });
  if (f.throwPlaying || f.throwPhase > 0) {
    AB.text(ctx, `t = ${AB.fmt(t * 1000, 0)} ms (cámara lenta ×${THROW_SLOWMO})`, bx, h * 0.11 + 4 * (bh + 6) + 30, {
      size: 12,
      color: PAL.amber,
      align: 'left',
    });
  }

  out?.('th_out', `α = ${AB.fmt(alpha, alpha < 200 ? 1 : 0)} s⁻² · v = ${AB.fmt(vB, 2)} m/s (${AB.fmt(vB * MPH, 1)} mph)`);
}

/* ══════════════════════════════════════════════════════════════════════════
   S12 · Seis fases del pitcheo (§3.6, Fig. 3.49)
   pie al suelo ≈0,50 s · suelta ≈0,64 s · 10 + 45 + 45 ≈ 100 mph
   ══════════════════════════════════════════════════════════════════════════ */

const PITCH_PHASES: [string, number, number][] = [
  ['Preparación', 0, 0.1],
  ['Zancada', 0.1, 0.5],
  ['Armado del brazo', 0.5, 0.56],
  ['Aceleración del brazo', 0.56, 0.64],
  ['Desaceleración del brazo', 0.64, 0.7],
  ['Seguimiento', 0.7, PHASES_END],
];

export function pitchSpeed(t: number) {
  const ramp = (a: number, b: number) => Math.max(0, Math.min(1, (t - a) / (b - a)));
  const legs = 10 * ramp(0.1, 0.5);
  const shoulder = 45 * ramp(0.5, 0.64);
  const elbow = 45 * ramp(0.56, 0.64);
  return { legs, shoulder, elbow, total: legs + shoulder + elbow };
}

export function drawPhases(p: SimParams, _f: SimFlags, out?: OutFn): void {
  const c = getCanvas('sim-phases');
  if (!c) return;
  const { ctx, w, h } = c;
  const t = p.ph_t;
  const x0 = w * 0.06;
  const x1 = w * 0.94;
  const y = h * 0.2;
  const X = (tt: number) => x0 + (x1 - x0) * (tt / PHASES_END);
  let active = PITCH_PHASES[PITCH_PHASES.length - 1][0];
  PITCH_PHASES.forEach(([name, a, b], i) => {
    const on = t >= a && (t < b || (i === PITCH_PHASES.length - 1 && t <= b));
    if (on) active = `${i + 1} · ${name}`;
    ctx.fillStyle = on ? PAL.teal : AB.alpha(PAL.ink3, 0.2);
    ctx.fillRect(X(a), y, X(b) - X(a), 22);
    ctx.strokeStyle = PAL.line;
    ctx.lineWidth = 1;
    ctx.strokeRect(X(a), y, X(b) - X(a), 22);
    if (X(b) - X(a) > 16) AB.text(ctx, `${i + 1}`, (X(a) + X(b)) / 2, y + 11, { size: 12, weight: '700', color: on ? PAL.card : PAL.ink2 });
  });
  AB.text(ctx, active, w / 2, h * 0.08, { size: 15, weight: '700', color: PAL.tealDeep });
  const mark = (tt: number, lab: string, align: CanvasTextAlign) => {
    ctx.strokeStyle = PAL.blood;
    ctx.setLineDash([3, 3]);
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(X(tt), y - 6);
    ctx.lineTo(X(tt), y + 36);
    ctx.stroke();
    ctx.setLineDash([]);
    AB.text(ctx, lab, X(tt), y + 48, { size: 12, color: PAL.blood, align });
  };
  mark(0.5, 'pie al suelo 0,50 s', 'right');
  mark(0.64, 'suelta 0,64 s', 'left');
  AB.triangle(ctx, X(t), y - 10, 11, { color: PAL.amber });
  AB.text(ctx, 't = 0: punto de equilibrio · límites intermedios esquemáticos', x0, y + 70, { size: 12, color: PAL.ink3, align: 'left' });

  const V = pitchSpeed(t);
  const vy = h * 0.56;
  const segs: [string, number, number][] = [
    ['piernas y tronco', V.legs, 10],
    ['hombro', V.shoulder, 45],
    ['codo', V.elbow, 45],
  ];
  segs.forEach(([name, v, max], i) => {
    const yb = vy + i * 30;
    bar(ctx, x0 + w * 0.3, yb, (x1 - x0 - w * 0.3) * (max / 50), 16, v / max, PAL.teal);
    AB.text(ctx, `${name} +${AB.fmt(v, 0)} mph`, x0 + w * 0.3 - 8, yb + 8, { size: 12, color: PAL.ink2, align: 'right' });
  });
  AB.text(ctx, `≈ ${AB.fmt(V.total, 0)} mph`, x0, vy + 3 * 30 + 14, { size: 18, weight: '700', color: PAL.blood, align: 'left' });

  out?.('ph_out', `t = ${AB.fmt(t, 2)} s · v ≈ ${AB.fmt(V.total, 0)} mph`);
}

/* ══════════════════════════════════════════════════════════════════════════
   S13 · Potencia del lanzamiento (§3.6.2, ec. 3.89–3.93)
   ══════════════════════════════════════════════════════════════════════════ */

export const THROW_TAU = 36.45; // N·m (3645 N·cm, caso c)

export function drawPower(p: SimParams, _f: SimFlags, out?: OutFn): void {
  const c = getCanvas('sim-power');
  if (!c) return;
  const { ctx, w, h } = c;
  const Om = p.pw_om;
  const P = THROW_TAU * Om;

  const ex = w * 0.24;
  const ey = h * 0.6;
  const Lpx = Math.min(h * 0.38, w * 0.26);
  const th = Math.PI / 2 - (Om / 31.4) * (Math.PI / 3);
  const hx = ex + Lpx * Math.sin(th);
  const hy = ey - Lpx * Math.cos(th);
  AB.bone(ctx, ex - 6, ey - Lpx * 0.6, ex - 6, ey, { width: 13, edge: PAL.boneDark, fill: PAL.boneMid, joint: false });
  AB.bone(ctx, ex, ey, hx, hy, { width: 12, edge: PAL.boneDark, fill: PAL.bone, joint: false });
  AB.joint(ctx, ex, ey, 6.5, { color: PAL.teal });
  AB.muscle(ctx, ex - 16, ey - Lpx * 0.5, ex + 6, ey + Lpx * 0.22, { w0: 10, w1: 6, bow: 7 });
  AB.text(ctx, `τ = ${AB.fmt(THROW_TAU, 2)} N·m`, ex, ey - Lpx * 0.78, { size: 12, color: PAL.teal });
  AB.text(ctx, `Ω = ${AB.fmt(Om, 1)} rad/s`, ex, ey + Lpx * 0.45, { size: 12, color: PAL.teal });

  const gx = w * 0.56;
  const gw = w * 0.2;
  const gy = h * 0.12;
  const gh = h * 0.68;
  const Pmax = 1300;
  ctx.fillStyle = AB.alpha(PAL.ink3, 0.12);
  ctx.fillRect(gx, gy, gw, gh);
  ctx.strokeStyle = PAL.line;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(gx, gy, gw, gh);
  const fillH = Math.min(1, P / Pmax) * gh;
  ctx.fillStyle = PAL.blood;
  ctx.fillRect(gx, gy + gh - fillH, gw, fillH);
  const mark = (val: number, lab: string) => {
    const my = gy + gh - (val / Pmax) * gh;
    ctx.strokeStyle = PAL.amber;
    ctx.setLineDash([3, 3]);
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(gx - 4, my);
    ctx.lineTo(gx + gw + 4, my);
    ctx.stroke();
    ctx.setLineDash([]);
    AB.text(ctx, lab, gx + gw + 8, my, { size: 12, color: PAL.amber, align: 'left' });
  };
  mark(570, '570 W prom.');
  mark(1140, '1140 W máx.');
  mark(356, '356 W (2 in)');
  AB.text(ctx, 'P = τΩ', gx + gw / 2, gy - 12, { size: 13, weight: '700', color: PAL.ink2 });

  // El libro redondea a decenas: 36,45 × 15,7 = 572 → «≈ 570 W».
  out?.('pw_out', `P ≈ ${AB.espan(Math.round(P / 10) * 10)} W = ${AB.fmt(P / 746, 2)} hp`);
}

/* ══════════════════════════════════════════════════════════════════════════
   S14 · Golf: péndulo doble (§3.7, Fig. 3.53)
   ══════════════════════════════════════════════════════════════════════════ */

export function drawGolf(_p: SimParams, f: SimFlags, out?: OutFn): void {
  const c = getCanvas('sim-golf');
  if (!c) return;
  const { ctx, w, h } = c;
  const wrist = f.wrist;
  const frac = wrist ? 2 / 3 : 1 / 4;
  const ph = f.golfPhase;
  const shx = w * 0.3;
  const shy = h * 0.32;
  const L1 = Math.min(h * 0.2, w * 0.15);
  const L2 = Math.min(h * 0.3, w * 0.24);
  const s = Math.sin(ph * 2 * Math.PI);
  const th1 = (70 * s * Math.PI) / 180;
  // Muñeca «armada» en los extremos y liberada en el impacto (abajo, s = 0).
  const cock = wrist ? (Math.PI / 2) * Math.pow(Math.abs(s), 1.5) : 0;
  const th2 = th1 + Math.sign(s) * cock;
  const bx = shx + L1 * Math.sin(th1);
  const by = shy + L1 * Math.cos(th1);
  const cx = bx + L2 * Math.sin(th2);
  const cy = by + L2 * Math.cos(th2);

  ctx.strokeStyle = PAL.skinEdge;
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.moveTo(shx, shy);
  ctx.lineTo(shx, shy - h * 0.1);
  ctx.stroke();
  head(ctx, shx, shy - h * 0.15, h * 0.035);
  AB.bone(ctx, shx, shy, bx, by, { width: 9, edge: PAL.boneDark, fill: PAL.boneMid, joint: false });
  ctx.strokeStyle = PAL.club;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(bx, by);
  ctx.lineTo(cx, cy);
  ctx.stroke();
  AB.joint(ctx, shx, shy, 5, { color: PAL.ink3 });
  AB.joint(ctx, bx, by, 5, { color: wrist ? PAL.teal : PAL.ink3 });
  ctx.fillStyle = PAL.ink;
  ctx.beginPath();
  ctx.arc(cx, cy, 7, 0, Math.PI * 2);
  ctx.fill();
  AB.text(ctx, 'A', shx - 12, shy, { size: 13, weight: '700', color: PAL.ink2, align: 'right' });
  AB.text(ctx, 'B', bx + 10, by - 6, { size: 13, weight: '700', color: PAL.teal, align: 'left' });
  AB.text(ctx, 'C', cx + 10, cy, { size: 13, weight: '700', color: PAL.ink, align: 'left' });

  const gx = w * 0.6;
  const gw = w * 0.34;
  AB.text(ctx, 'energía a la cabeza del palo', gx, h * 0.12, { size: 12, color: PAL.ink2, align: 'left' });
  bar(ctx, gx, h * 0.15, gw, 16, frac, wrist ? PAL.teal : PAL.amber);
  AB.text(ctx, wrist ? '⅔ con quiebre de muñeca' : '¼ con muñecas rígidas', gx, h * 0.15 + 32, {
    size: 13,
    weight: '700',
    color: wrist ? PAL.teal : PAL.amber,
    align: 'left',
  });
  AB.text(ctx, 'potencia del swing ≈ 2,5 kW', gx, h * 0.42, { size: 13, weight: '700', color: PAL.ink, align: 'left' });
  const parts: [string, number][] = [
    ['cabeza del palo', 1.3],
    ['mango del palo', 0.5],
    ['manos y brazos', 0.7],
  ];
  parts.forEach(([lab, kw], i) => {
    const y = h * 0.5 + i * 38;
    AB.text(ctx, `${lab} ${AB.fmt(kw, 1)} kW`, gx, y, { size: 12, color: PAL.ink2, align: 'left' });
    bar(ctx, gx, y + 9, gw, 10, kw / 1.3, PAL.sagittal);
  });

  out?.('gf_out', wrist ? '⅔ de la energía a la cabeza (quiebre)' : '¼ de la energía a la cabeza (rígidas)');
}

/* ══════════════════════════════════════════════════════════════════════════
   S15 · Bateo: masa óptima y punto dulce (§3.10.4, ec. 3.126–3.130)
   ══════════════════════════════════════════════════════════════════════════ */

export const BAT = { Wp: 5.125, e: 0.55, vp: -80, A: 63, B: 0.39 };

export function batSpeedOut(Wb: number) {
  const vb = BAT.A - BAT.B * Wb;
  return ((BAT.Wp - BAT.e * Wb) * BAT.vp + (Wb + BAT.e * Wb) * vb) / (BAT.Wp + Wb);
}
/** Ec. 3.129: W_bate,ideal = W_pelota[(1 + (A − v_p)/(B W_p))^½ − 1] = 38,5 oz. */
export const BAT_IDEAL = BAT.Wp * (Math.sqrt(1 + (BAT.A - BAT.vp) / (BAT.B * BAT.Wp)) - 1);

export function drawBat(p: SimParams, _f: SimFlags, out?: OutFn): void {
  const c = getCanvas('sim-bat');
  if (!c) return;
  const { ctx, w, h } = c;
  const W = p.ba_w;
  const vv = batSpeedOut(W);
  const best = batSpeedOut(BAT_IDEAL);

  const px0 = w * 0.12;
  const px1 = w * 0.95;
  const py0 = h * 0.1;
  const py1 = h * 0.5;
  const X = (ww: number) => px0 + (px1 - px0) * ((ww - 15) / 55);
  const Y = (v: number) => py1 - ((v - 40) / 70) * (py1 - py0);
  ctx.strokeStyle = PAL.line;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(px0, py0, px1 - px0, py1 - py0);
  [60, 80, 100].forEach((v) => AB.text(ctx, `${v}`, px0 - 6, Y(v), { size: 12, color: PAL.ink3, align: 'right' }));
  AB.text(ctx, "v' pelota (mph)", px0 + 6, py0 + 12, { size: 12, color: PAL.ink3, align: 'left' });
  ctx.strokeStyle = PAL.teal;
  ctx.lineWidth = 2.5;
  const pts: [number, number][] = [];
  for (let ww = 15; ww <= 70; ww += 0.5) pts.push([X(ww), Y(batSpeedOut(ww))]);
  polyline(ctx, pts);
  ctx.fillStyle = PAL.amber;
  ctx.beginPath();
  ctx.arc(X(BAT_IDEAL), Y(best), 5, 0, Math.PI * 2);
  ctx.fill();
  AB.text(ctx, `óptimo ${AB.fmt(BAT_IDEAL, 1)} oz · ${AB.fmt(best, 1)} mph`, X(BAT_IDEAL), Y(best) - 14, { size: 12, color: PAL.amber, weight: '700' });
  ctx.fillStyle = PAL.blood;
  ctx.beginPath();
  ctx.arc(X(W), Y(vv), 5, 0, Math.PI * 2);
  ctx.fill();
  AB.text(ctx, `${AB.fmt(W, 1)} oz`, X(W), py1 + 14, { size: 12, color: PAL.blood, weight: '700' });
  AB.text(ctx, '15 oz', px0, py1 + 14, { size: 12, color: PAL.ink3, align: 'left' });
  AB.text(ctx, '70 oz', px1, py1 + 14, { size: 12, color: PAL.ink3, align: 'right' });

  // Bate idealizado con el punto dulce a ⅔ desde el mango.
  const yb = h * 0.78;
  const bx = w * 0.12;
  const bl = w * 0.6;
  ctx.strokeStyle = PAL.boneDeep;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(bx - 16, yb);
  ctx.lineTo(bx, yb);
  ctx.stroke();
  ctx.strokeStyle = PAL.boneEdge;
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.moveTo(bx, yb);
  ctx.lineTo(bx + bl, yb);
  ctx.stroke();
  const sx = bx + bl * (2 / 3);
  ctx.fillStyle = PAL.blood;
  ctx.beginPath();
  ctx.arc(sx, yb, 7, 0, Math.PI * 2);
  ctx.fill();
  AB.text(ctx, 'punto dulce (⅔ desde el mango)', sx, yb - 22, { size: 12, weight: '700', color: PAL.blood });
  AB.text(ctx, 'mango', bx - 8, yb + 20, { size: 12, color: PAL.ink3, align: 'left' });
  AB.text(ctx, `v bate = 63 − 0,39 W = ${AB.fmt(BAT.A - BAT.B * W, 1)} mph`, bx, h * 0.93, { size: 12, color: PAL.ink2, align: 'left' });

  out?.('ba_out', `v' = ${AB.fmt(vv, 1)} mph · óptimo ${AB.fmt(BAT_IDEAL, 1)} oz → ${AB.fmt(best, 1)} mph`);
}

/* ══════════════════════════════════════════════════════════════════════════
   S16 · Colisiones (§3.10.1–§3.10.2, ec. 3.105, 3.113–3.116)
   ══════════════════════════════════════════════════════════════════════════ */

export function collision(v: number, dx: number, m: number) {
  const a = (v * v) / (2 * dx);
  const G = a / G_EARTH;
  const t = (2 * dx) / v;
  const F = m * a;
  return { a, G, t, F, GSI: Math.pow(G, 2.5) * t, sigmaMPa: F / 3e-4 / 1e6 };
}

export function drawCollision(p: SimParams, _f: SimFlags, out?: OutFn): void {
  const c = getCanvas('sim-collision');
  if (!c) return;
  const { ctx, w, h } = c;
  const C = collision(p.co_v, p.co_dx, p.co_m);

  const yg = h * 0.66;
  ground(ctx, w * 0.06, w * 0.5, yg, PAL.ink3, 1.5);
  const dxpx = 6 + Math.max(0, Math.min(60, (Math.log10(p.co_dx) + 3) * 22));
  ctx.fillStyle = AB.alpha(PAL.amber, 0.7);
  ctx.fillRect(w * 0.14, yg - dxpx, 70, dxpx);
  AB.text(ctx, `Δx = ${AB.fmt(p.co_dx * 1000, p.co_dx < 0.01 ? 1 : 0)} mm`, w * 0.14 + 76, yg - dxpx / 2, { size: 12, weight: '700', color: PAL.amber, align: 'left' });
  const ox = w * 0.14 + 35;
  const oy = yg - dxpx - 22;
  head(ctx, ox, oy, 18);
  AB.arrow(ctx, ox, oy - 66, ox, oy - 26, { color: PAL.teal, width: 3, head: 9 });
  AB.text(ctx, `v = ${AB.fmt(p.co_v, 2)} m/s · m = ${AB.fmt(p.co_m, 0)} kg`, w * 0.06, h * 0.07, { size: 12, color: PAL.teal, align: 'left', weight: '700' });
  AB.text(ctx, `t col = ${AB.fmt(C.t * 1000, 1)} ms · F = ${AB.espan(Math.round(C.F))} N`, w * 0.06, h * 0.07 + 20, { size: 12, color: PAL.ink2, align: 'left' });
  AB.text(ctx, `GSI ≈ ${AB.espan(Math.round(C.GSI))} (1000 → 50 % fatal)`, w * 0.06, h * 0.07 + 40, { size: 12, color: PAL.ink2, align: 'left' });
  const sigOk = C.sigmaMPa < 170;
  AB.text(ctx, `tibia (A ≈ 3 cm²): σ = ${AB.fmt(C.sigmaMPa, 0)} MPa ${sigOk ? '< ' : '> '}UCS 170`, w * 0.06, yg + 22, {
    size: 12,
    color: sigOk ? PAL.ink2 : PAL.blood,
    align: 'left',
    weight: sigOk ? '400' : '700',
  });

  // Barra de factor G con las anclas del libro.
  const gx = w * 0.66;
  const gy = h * 0.1;
  const gh = h * 0.78;
  const gw = Math.max(w * 0.07, 40);
  const Gmax = 250;
  const z = (gv: number) => gy + gh * (1 - Math.min(gv, Gmax) / Gmax);
  ctx.fillStyle = AB.alpha(PAL.good, 0.16);
  ctx.fillRect(gx, z(60), gw, z(0) - z(60));
  ctx.fillStyle = AB.alpha(PAL.amber, 0.18);
  ctx.fillRect(gx, z(175), gw, z(60) - z(175));
  ctx.fillStyle = AB.alpha(PAL.blood, 0.32);
  ctx.fillRect(gx, z(Gmax), gw, z(175) - z(Gmax));
  ctx.strokeStyle = PAL.line;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(gx, gy, gw, gh);
  const anchors: [number, string][] = [
    [10, 'cabeza 1 m/s'],
    [60, 'placaje sin lesión'],
    [98, 'conmoción'],
    [175, 'no supervivible'],
  ];
  anchors.forEach(([gv, lab]) => {
    ctx.strokeStyle = AB.alpha(PAL.ink3, 0.6);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(gx, z(gv));
    ctx.lineTo(gx + gw + 4, z(gv));
    ctx.stroke();
    AB.text(ctx, `${gv} g ${lab}`, gx + gw + 8, z(gv), { size: 12, color: PAL.ink2, align: 'left' });
  });
  const my = z(C.G);
  ctx.strokeStyle = PAL.blood;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(gx - 6, my);
  ctx.lineTo(gx + gw + 2, my);
  ctx.stroke();
  AB.text(ctx, `${AB.fmt(C.G, 0)} g${C.G > Gmax ? ' ↑' : ''}`, gx - 10, my, { size: 14, weight: '700', color: PAL.blood, align: 'right' });

  out?.('co_out', `G = ${AB.fmt(C.G, 0)} g · F = ${AB.espan(Math.round(C.F))} N · GSI ≈ ${AB.espan(Math.round(C.GSI))}`);
}

/* ══════════════════════════════════════════════════════════════════════════
   S17 · Boxeo (§3.10.3, ec. 3.121–3.125)
   ══════════════════════════════════════════════════════════════════════════ */

export function punch(vMph: number, glove: boolean) {
  const vP = vMph / MPH;
  const vf = (glove ? 0.236 : 0.382) * vP;
  const dx = glove ? 0.01 : 0.001;
  const a = (vf * vf) / (2 * dx);
  const G = a / G_EARTH;
  const t = (2 * dx) / vf;
  return { vf, G, t, GSI: Math.pow(G, 2.5) * t };
}

export function drawBoxing(p: SimParams, f: SimFlags, out?: OutFn): void {
  const c = getCanvas('sim-boxing');
  if (!c) return;
  const { ctx, w, h } = c;
  const glove = f.glove;
  const B = punch(p.bx_v, glove);
  const fy = h * 0.36;
  const fx = w * 0.4;

  ctx.strokeStyle = PAL.skinEdge;
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(w * 0.06, fy);
  ctx.lineTo(fx - 14, fy);
  ctx.stroke();
  if (glove) {
    ctx.fillStyle = PAL.muscle;
    ctx.strokeStyle = PAL.muscleEdge;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(fx, fy, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else {
    head(ctx, fx, fy, 12);
  }
  AB.text(ctx, glove ? 'guante · Δx ≈ 1 cm · inelástica' : 'puño limpio · Δx ≈ 1 mm · elástica', w * 0.06, fy + 38, {
    size: 12,
    color: glove ? PAL.muscleEdge : PAL.blood,
    align: 'left',
    weight: '700',
  });
  AB.text(ctx, `v puño = ${AB.fmt(p.bx_v, 0)} mph`, w * 0.06, fy - 24, { size: 12, color: PAL.teal, align: 'left' });

  const hx = w * 0.72;
  head(ctx, hx, fy, 30);
  AB.arrow(ctx, hx + 38, fy, hx + 38 + Math.min(90, B.vf * 12), fy, { color: PAL.amber, width: 3, head: 9 });
  AB.text(ctx, `cabeza: ${AB.fmt(B.vf, 1)} m/s · ${AB.espan(Math.round(B.G))} g`, hx, fy - 46, { size: 12, weight: '700', color: PAL.amber });

  // Escala logarítmica del GSI (10 a 100 000).
  const gx = w * 0.08;
  const gw = w * 0.84;
  const gy = h * 0.76;
  const pos = (val: number) => gx + (gw * (Math.log10(Math.max(10, val)) - 1)) / 4;
  ctx.fillStyle = AB.alpha(PAL.good, 0.16);
  ctx.fillRect(gx, gy - 7, pos(400) - gx, 14);
  ctx.fillStyle = AB.alpha(PAL.amber, 0.2);
  ctx.fillRect(pos(400), gy - 7, pos(1000) - pos(400), 14);
  ctx.fillStyle = AB.alpha(PAL.blood, 0.35);
  ctx.fillRect(pos(1000), gy - 7, gx + gw - pos(1000), 14);
  ctx.strokeStyle = PAL.line;
  ctx.lineWidth = 1;
  ctx.strokeRect(gx, gy - 7, gw, 14);
  const ticks: [number, string, number][] = [
    [117, '117', 0],
    [400, '400 conmoción leve', 1],
    [1000, '1000: 50 % fatal', 0],
    [25600, '25 600', 1],
  ];
  ticks.forEach(([val, lab, row]) => {
    const x = pos(val);
    ctx.strokeStyle = PAL.ink3;
    ctx.beginPath();
    ctx.moveTo(x, gy - 10);
    ctx.lineTo(x, gy + 10);
    ctx.stroke();
    AB.text(ctx, lab, x, gy + (row ? 40 : 22), { size: 12, color: PAL.ink2 });
  });
  const mx = pos(B.GSI);
  AB.triangle(ctx, mx, gy - 16, 11, { color: PAL.blood });
  AB.text(ctx, `GSI ≈ ${AB.espan(Math.round(B.GSI))}`, mx, gy - 32, { size: 14, weight: '700', color: PAL.blood });

  out?.('bx_out', `v cabeza = ${AB.fmt(B.vf, 1)} m/s · ${AB.espan(Math.round(B.G))} g · GSI ≈ ${AB.espan(Math.round(B.GSI))}`);
}

/* ══════════════════════════════════════════════════════════════════════════
   S18 · Vuelo con arrastre y Magnus (§3.12, ec. 3.134–3.137)
   ══════════════════════════════════════════════════════════════════════════ */

/** Integración de Euler de una pelota de béisbol (m = 0,145 kg, r = 3,7 cm, C_D = 0,45). */
export function flightSim(v0: number, thDeg: number, mag: boolean): { x: number; maxY: number; pts: [number, number][] } {
  const m = 0.145;
  const r = 0.037;
  const A = Math.PI * r * r;
  const rho = 1.2;
  const CD = 0.45;
  const k = (0.5 * CD * A * rho) / m;
  const km = 0.008; // coeficiente de Magnus ilustrativo (no está en el texto)
  const thR = (thDeg * Math.PI) / 180;
  let x = 0;
  let y = 0;
  let vx = v0 * Math.cos(thR);
  let vy = v0 * Math.sin(thR);
  const dt = 0.004;
  const pts: [number, number][] = [];
  let maxY = 0;
  for (let i = 0; i < 4000; i++) {
    const v = Math.hypot(vx, vy);
    let ax = -k * v * vx;
    let ay = -G_EARTH - k * v * vy;
    if (mag && v > 0.01) {
      const l = km * v * v;
      ax += (-l * vy) / v;
      ay += (l * vx) / v;
    }
    vx += ax * dt;
    vy += ay * dt;
    x += vx * dt;
    y += vy * dt;
    if (y > maxY) maxY = y;
    if (i % 8 === 0) pts.push([x, y]);
    if (y < 0 && vy < 0) break;
  }
  return { x, maxY, pts };
}

export function optimalAngle(v0: number): number {
  let best = 0;
  let opt = 45;
  for (let a = 10; a <= 70; a += 1) {
    const r = flightSim(v0, a, false).x;
    if (r > best) {
      best = r;
      opt = a;
    }
  }
  return opt;
}

export function drawFlight(p: SimParams, f: SimFlags, out?: OutFn): void {
  const c = getCanvas('sim-flight');
  if (!c) return;
  const { ctx, w, h } = c;
  const v0 = p.fl_v;
  const th = p.fl_theta;
  const thR = (th * Math.PI) / 180;
  const Rvac = (v0 * v0 * Math.sin(2 * thR)) / G_EARTH;
  const Hvac = (v0 * v0 * Math.sin(thR) ** 2) / (2 * G_EARTH);
  const fl = f.air ? flightSim(v0, th, f.mag) : null;
  const Rmax = Math.max(Rvac, fl ? fl.x : 0, 1);
  const Hmax = Math.max(Hvac, fl ? fl.maxY : 0, 0.5);
  const x0 = w * 0.08;
  const y0 = h * 0.8;
  const sx = (w * 0.84) / Rmax;
  const sy = (h * 0.58) / Hmax;
  const X = (xx: number) => x0 + xx * sx;
  const Y = (yy: number) => y0 - yy * sy;

  ground(ctx, x0, w * 0.96, y0, PAL.ink3, 1.5);
  const T = (2 * v0 * Math.sin(thR)) / G_EARTH;
  ctx.strokeStyle = PAL.tealLight;
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 4]);
  const vac: [number, number][] = [];
  for (let i = 0; i <= 64; i++) {
    const t = (T * i) / 64;
    vac.push([X(v0 * Math.cos(thR) * t), Y(Math.max(0, v0 * Math.sin(thR) * t - 4.9 * t * t))]);
  }
  polyline(ctx, vac);
  ctx.setLineDash([]);
  AB.text(ctx, `vacío ${AB.fmt(Rvac, 0)} m`, X(Rvac), y0 + 18, { size: 12, weight: '700', color: PAL.teal, align: 'right' });

  if (fl) {
    ctx.strokeStyle = PAL.blood;
    ctx.lineWidth = 2.6;
    polyline(
      ctx,
      fl.pts.map(([xx, yy]) => [X(xx), Y(Math.max(0, yy))] as [number, number]),
    );
    AB.text(ctx, `aire ${AB.fmt(fl.x, 0)} m`, X(fl.x), y0 + 36, { size: 12, weight: '700', color: PAL.blood, align: fl.x < Rvac * 0.5 ? 'left' : 'right' });
  }

  const ar = Math.min(w * 0.1, h * 0.14);
  AB.arrow(ctx, x0, y0, x0 + ar * Math.cos(thR), y0 - ar * Math.sin(thR), { color: PAL.teal, width: 3 });
  AB.text(ctx, `${th}°`, x0 + ar * Math.cos(thR) + 10, y0 - ar * Math.sin(thR), { size: 12, color: PAL.teal, align: 'left' });
  const opt = optimalAngle(v0);
  AB.text(ctx, `ángulo óptimo: 45° en vacío · ≈ ${opt}° con aire`, x0, h * 0.07, { size: 13, weight: '700', color: PAL.amber, align: 'left' });
  if (f.mag) AB.text(ctx, 'Magnus (backspin) esquemático', x0, h * 0.07 + 20, { size: 12, color: PAL.ink3, align: 'left' });

  out?.('fl_out', f.air && fl ? `D = ${AB.fmt(fl.x, 0)} m · vacío ${AB.fmt(Rvac, 0)} m · óptimo ≈ ${opt}°` : `D = ${AB.fmt(Rvac, 0)} m (vacío)`);
}

/* ── Orquestador de redibujado ── */
const DRAW: Partial<Record<number, (p: SimParams, f: SimFlags, out?: OutFn) => void>> = {
  1: drawStab,
  2: drawPresion,
  3: drawGait,
  4: drawFriccion,
  5: drawPendulo,
  6: drawEnergy,
  7: drawPogo,
  8: drawSprint,
  9: drawJump,
  10: drawVault,
  11: drawThrow,
  12: drawPhases,
  13: drawPower,
  14: drawGolf,
  15: drawBat,
  16: drawCollision,
  17: drawBoxing,
  18: drawFlight,
};

export function redrawSlide(slideIndex: number, params: SimParams, flags: SimFlags, out?: OutFn): void {
  const fn = DRAW[slideIndex];
  if (!fn) return;
  AB.refreshPalette();
  fn(params, flags, out);
}
