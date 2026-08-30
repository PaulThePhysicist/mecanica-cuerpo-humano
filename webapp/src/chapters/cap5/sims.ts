// ═══════════════════════════════════════════════════════════════════════════
//  Capítulo 5 · Músculos — Simulaciones y Modelos Mecánicos 2D
//  Física del Cuerpo Humano · Irving P. Herman
// ═══════════════════════════════════════════════════════════════════════════

import * as AB from './ab';

export type OutputFn = (id: string, text: string) => void;

export interface ModuleDef {
  id: number;
  name: string;
  slides: number[];
  ico: string;
}

export const TOTAL = 22;

export const MODULES: ModuleDef[] = [
  { id: 0, name: 'Inicio', slides: [0], ico: '🏠' },
  { id: 1, name: 'Motores', slides: [1, 2], ico: '🦾' },
  { id: 2, name: 'Activación', slides: [3, 4, 5], ico: '⚡' },
  { id: 3, name: 'Modelo activo', slides: [6, 7], ico: '🧩' },
  { id: 4, name: 'Longitud', slides: [8, 9, 10], ico: '🎯' },
  { id: 5, name: 'Hill', slides: [11, 12], ico: '📉' },
  { id: 6, name: 'Nanoscopía', slides: [13, 14, 15], ico: '🔬' },
  { id: 7, name: 'Titina · Coord.', slides: [16, 17, 18], ico: '🪜' },
  { id: 8, name: 'Fuerza · Fatiga', slides: [19, 20, 21], ico: '🥵' },
];

export interface SimParams {
  // S1
  cl_type: 'esqueletico' | 'cardiaco' | 'liso';
  // S2
  ar_ang: number;
  // S3
  tw_mus: number;
  // S4
  sm_f: number;
  // S5
  fb_mus: 'ocular' | 'gastroc' | 'soleo';
  // S6
  ac_tau: number;
  // S7
  tt_t1: number;
  tt_t2: number;
  tt_tau: number;
  // S8
  ps_mat: 'suave' | 'rigido';
  ps_l: number;
  // S9
  tn_tipo: 'paralelo' | 'pinnado';
  // S10
  wr_ang: number;
  // S11
  hl_k: number;
  // S12
  pw_k: number;
  // S13
  td_ratio: number;
  // S17
  ti_l: number;
  // S18
  cd_v: number;
  // S19
  mv_r: number;
  // S20
  tr_age: number;
  // S21
  rh_s: number;
}

export interface SimFlags {
  smPlaying: boolean;
  smT: number;
  acPlaying: boolean;
  acT: number;
  ttPlaying: boolean;
  ttT: number;
  brPlaying: boolean;
  brT: number;
  dyPlaying: boolean;
  dyT: number;
  stPlaying: boolean;
  stT: number;
}

export const DEFAULT_PARAMS: SimParams = {
  cl_type: 'esqueletico',
  ar_ang: 15,
  tw_mus: 74,
  sm_f: 30,
  fb_mus: 'gastroc',
  ac_tau: 40,
  tt_t1: 60,
  tt_t2: 40,
  tt_tau: 40,
  ps_mat: 'suave',
  ps_l: 1.5,
  tn_tipo: 'paralelo',
  wr_ang: 0,
  hl_k: 0.2,
  pw_k: 0.2,
  td_ratio: 3,
  ti_l: 2.2,
  cd_v: 1.2,
  mv_r: 10,
  tr_age: 45,
  rh_s: 50,
};

export const DEFAULT_FLAGS: SimFlags = {
  smPlaying: false,
  smT: 0,
  acPlaying: false,
  acT: 0,
  ttPlaying: false,
  ttT: 0,
  brPlaying: false,
  brT: 0,
  dyPlaying: false,
  dyT: 0,
  stPlaying: false,
  stT: 0,
};

export function actF(L: number): number {
  if (L <= 0.3 || L >= 1.8) return 0;
  if (L < 1.0) return (L - 0.3) / 0.7;
  if (L < 1.3) return 1 - (0.5 * (L - 1.0)) / 0.3;
  if (L < 1.5) return 0.5 - (0.3 * (L - 1.3)) / 0.2;
  return 0.2 - (0.15 * (L - 1.5)) / 0.2;
}

/* ═══════════════════════════════════════════════════════════
   S1 · Células musculares y tipos de fibra
   ═══════════════════════════════════════════════════════════ */
export function drawCells(
  _t: number,
  params: SimParams,
  _flags: SimFlags,
  out?: OutputFn
): void {
  const cv = document.getElementById('sim-cells') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth, h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  const tipo = params.cl_type || 'esqueletico';
  const DATA = {
    esqueletico: { name: 'Esquelético', props: 'estriada · multinucleada · voluntaria · rápida', color: AB.PAL.muscle },
    cardiaco: { name: 'Cardíaco', props: 'estriada · uninucleada · involuntaria · rítmica', color: AB.PAL.blood },
    liso: { name: 'Liso', props: 'no estriada · uninucleada · involuntaria · lenta', color: AB.PAL.amber },
  };
  const D = DATA[tipo] || DATA.esqueletico;

  // Miniaturas de los tres tipos
  const cy = h * 0.34;
  (['esqueletico', 'cardiaco', 'liso'] as const).forEach((t, i) => {
    const cx = w * (0.18 + 0.32 * i);
    const col = DATA[t].color;
    const on = t === tipo;
    ctx.strokeStyle = on ? col : 'rgba(107,120,133,.45)';
    ctx.lineWidth = on ? 2.6 : 1.4;
    if (t === 'liso') {
      ctx.beginPath();
      ctx.moveTo(cx - 32, cy);
      ctx.quadraticCurveTo(cx, cy - 17, cx + 32, cy);
      ctx.quadraticCurveTo(cx, cy + 17, cx - 32, cy);
      ctx.closePath();
      ctx.stroke();
      ctx.fillStyle = on ? col : AB.PAL.ink3;
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, 7);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.ellipse(cx, cy, 32, 10, 0, 0, 7);
      ctx.stroke();
      ctx.strokeStyle = on ? col : 'rgba(107,120,133,.45)';
      for (let s = -2; s <= 2; s++) {
        ctx.beginPath();
        ctx.moveTo(cx + s * 13, cy - 9);
        ctx.lineTo(cx + s * 13, cy + 9);
        ctx.stroke();
      }
      ctx.fillStyle = on ? col : AB.PAL.ink3;
      if (t === 'esqueletico') {
        for (let s = -1; s <= 1; s++) {
          ctx.beginPath();
          ctx.ellipse(cx + s * 19, cy, 3, 2, 0, 0, 7);
          ctx.fill();
        }
      } else {
        ctx.beginPath();
        ctx.ellipse(cx, cy + 3, 3, 2, 0, 0, 7);
        ctx.fill();
      }
    }
    AB.text(ctx, DATA[t].name, cx, cy + 30, { size: 8, color: on ? col : AB.PAL.ink3 });
  });

  AB.text(ctx, D.props, w / 2, h * 0.56, { size: 11, weight: '700', color: D.color });

  // Distribución de tipos de fibra (~50 ST · 25 FT roja · 25 FT blanca)
  const bx = w * 0.1, bw = w * 0.8, by = h * 0.7, bh = h * 0.12;
  const segs: [string, number, string][] = [
    ['Tipo I · ST (roja)', 0.5, AB.PAL.blood],
    ['Tipo IIA · FT roja', 0.25, AB.PAL.muscle],
    ['Tipo IIB · FT blanca', 0.25, '#e6d9cb'],
  ];
  let acc = 0;
  segs.forEach((s) => {
    ctx.fillStyle = s[2];
    ctx.fillRect(bx + bw * acc, by, bw * s[1], bh);
    acc += s[1];
  });
  ctx.strokeStyle = AB.PAL.boneEdge;
  ctx.lineWidth = 1.2;
  ctx.strokeRect(bx, by, bw, bh);
  AB.text(ctx, '~50 % ST · ~25 % FT roja · ~25 % FT blanca (músculo promedio)', w / 2, by + bh + 16, { size: 8, color: AB.PAL.ink2 });
  AB.text(ctx, 'lentas · resistentes →', bx, by - 6, { size: 7, color: AB.PAL.ink3, align: 'left' });
  AB.text(ctx, '→ rápidas · fatigan', bx + bw, by - 6, { size: 7, color: AB.PAL.ink3, align: 'right' });

  if (out) out('cl_out', D.name + ': ' + D.props);
}

/* ═══════════════════════════════════════════════════════════
   S2 · Arquitectura y ángulo de pinnación
   ═══════════════════════════════════════════════════════════ */
export function drawArch(
  _t: number,
  params: SimParams,
  _flags: SimFlags,
  out?: OutputFn
): void {
  const cv = document.getElementById('sim-arch') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth, h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  const th = params.ar_ang ?? 15;
  const rad = (th * Math.PI) / 180;
  const frac = Math.cos(rad);
  const cx = w * 0.28, cy = h * 0.5;

  // Aponeurosis y tendón central
  ctx.strokeStyle = AB.PAL.tendon;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(cx, cy - 74);
  ctx.lineTo(cx, cy + 74);
  ctx.stroke();

  ctx.strokeStyle = AB.PAL.ink3;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(cx - 54, cy - 74);
  ctx.lineTo(cx - 54, cy + 74);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + 54, cy - 74);
  ctx.lineTo(cx + 54, cy + 74);
  ctx.stroke();

  // Fibras pinnadas
  ctx.strokeStyle = AB.PAL.muscle;
  ctx.lineWidth = 2.4;
  const dy = 54 / Math.tan(rad + 1e-6);
  for (let i = 0; i < 5; i++) {
    const y = cy - 62 + (i * 124) / 4;
    ctx.beginPath();
    ctx.moveTo(cx - 54, y + dy / 2);
    ctx.lineTo(cx, y - dy / 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + 54, y - dy / 2);
    ctx.lineTo(cx, y + dy / 2);
    ctx.stroke();
  }
  AB.text(ctx, 'tendón', cx, cy - 86, { size: 9, color: AB.PAL.ink2 });
  AB.text(ctx, 'fibras a θ = ' + AB.espan(th, 0) + '°', cx - 54, cy + 92, { size: 9, color: AB.PAL.muscle, align: 'left' });

  // Descomposición de fuerzas
  const ox = w * 0.66, oy = h * 0.5, L = 66;
  const Fx = Math.sin(rad) * L, Fy = Math.cos(rad) * L;
  AB.arrow(ctx, ox, oy, ox + Fx, oy + Fy, { color: AB.PAL.blood, head: 9 });
  AB.text(ctx, 'F (fibra)', ox + Fx / 2, oy + Fy / 2 - 10, { size: 9, weight: '700', color: AB.PAL.blood });
  AB.arrow(ctx, ox, oy, ox, oy + L, { color: AB.PAL.teal, head: 9 });
  AB.text(ctx, 'F·cosθ', ox - 14, oy + L + 10, { size: 9, weight: '700', color: AB.PAL.teal });
  AB.arrow(ctx, ox, oy, ox + Fx, oy, { color: AB.PAL.amber, head: 9 });
  AB.text(ctx, 'F·sinθ', ox + Fx / 2, oy - 10, { size: 9, color: AB.PAL.amber });
  ctx.strokeStyle = 'rgba(169,42,30,.35)';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 3]);
  ctx.beginPath();
  ctx.moveTo(ox + Fx, oy);
  ctx.lineTo(ox + Fx, oy + Fy);
  ctx.lineTo(ox, oy + Fy);
  ctx.stroke();
  ctx.setLineDash([]);
  AB.text(ctx, 'fuerza útil al tendón = F · cos ' + AB.espan(th, 0) + '° = ' + AB.fmt(frac, 2), ox, h - 20, { size: 10, weight: '700', color: AB.PAL.teal });

  if (out) out('ar_out', 'F transmitida = F · cos ' + AB.espan(th, 0) + '° = ' + AB.fmt(frac, 2) + ' F');
}

/* ═══════════════════════════════════════════════════════════
   S3 · Twitch (sacudida): F(t) = F₀ (t/T) e^(−t/T)
   ═══════════════════════════════════════════════════════════ */
export function drawTwitch(
  _t: number,
  params: SimParams,
  _flags: SimFlags,
  out?: OutputFn
): void {
  const cv = document.getElementById('sim-twitch') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth, h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  const T = Number(params.tw_mus) || 74;
  const tmax = 5 * T;
  const gx = w * 0.12, g2 = w * 0.95, gy = h * 0.14, g0 = h * 0.8;
  const X = (t: number) => gx + ((g2 - gx) * t) / tmax;
  const Y = (f: number) => g0 - (g0 - gy) * f;

  // Ejes
  ctx.strokeStyle = AB.PAL.ink3;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(gx, gy);
  ctx.lineTo(gx, g0);
  ctx.lineTo(g2, g0);
  ctx.stroke();
  AB.text(ctx, 'F/F₀', gx + 4, gy + 2, { size: 8, color: AB.PAL.ink3, align: 'left' });
  AB.text(ctx, 't (ms)', g2 - 24, g0 + 14, { size: 8, color: AB.PAL.ink3 });
  AB.text(ctx, '0', gx - 4, g0 + 14, { size: 7, color: AB.PAL.ink3 });
  AB.text(ctx, AB.espan(Math.round(tmax), 0), g2 - 20, g0 + 14, { size: 7, color: AB.PAL.ink3 });

  // Retraso latente ~15 ms
  const latX = X(15);
  ctx.fillStyle = 'rgba(154,91,0,.10)';
  ctx.fillRect(gx, gy, latX - gx, g0 - gy);
  AB.text(ctx, 'retraso ~15 ms', (gx + latX) / 2, gy + 10, { size: 7, color: AB.PAL.amber });

  // Curva (pico = 1 en t = T ⇒ F = F₀/e)
  ctx.strokeStyle = AB.PAL.teal;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  const N = 200;
  for (let i = 0; i <= N; i++) {
    const t = (tmax * i) / N;
    const f = (t / T) * Math.exp(1 - t / T);
    const x = X(t), y = Y(f);
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.stroke();

  // Pico
  ctx.fillStyle = AB.PAL.blood;
  ctx.beginPath();
  ctx.arc(X(T), Y(1), 4.5, 0, 7);
  ctx.fill();
  AB.dashed(ctx, X(T), Y(1), X(T), g0, { color: AB.PAL.ink3 });
  AB.dashed(ctx, X(0), Y(1), X(T), Y(1), { color: AB.PAL.ink3 });
  AB.text(ctx, 'pico en t = T', X(T) + 6, Y(1) - 8, { size: 8, color: AB.PAL.blood, align: 'left' });
  AB.text(ctx, 'F = F₀/e ≈ 0,37 F₀', X(T) + 6, Y(1) + 10, { size: 8, color: AB.PAL.ink2, align: 'left' });
  AB.text(ctx, 'F(t) = F₀ (t/T) e^(−t/T)', (gx + g2) / 2, gy - 10, { size: 10, weight: '700', color: AB.PAL.teal });
  AB.text(ctx, 'T = ' + AB.espan(T, 1) + ' ms · decay ~50 ms', (gx + g2) / 2, h * 0.92, { size: 9, color: AB.PAL.ink2 });

  if (out) out('tw_out', 'T = ' + AB.espan(T, 1) + ' ms · pico en t = T (F = F₀/e ≈ 0,37 F₀)');
}

/* ═══════════════════════════════════════════════════════════
   S4 · Sumación de twitches y fusión (frecuencia)
   ═══════════════════════════════════════════════════════════ */
export function drawSumm(
  _t: number,
  params: SimParams,
  flags: SimFlags,
  out?: OutputFn
): void {
  const cv = document.getElementById('sim-summ') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth, h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  const f = Number(params.sm_f) || 30;
  const T = 40; // ms
  const dt = 1000 / f;
  const tmax = 600;
  const gx = w * 0.12, g2 = w * 0.95, gy = h * 0.14, g0 = h * 0.8;
  const X = (t: number) => gx + ((g2 - gx) * t) / tmax;
  const Y = (v: number) => g0 - (g0 - gy) * Math.min(v, 1.4);

  // Ejes
  ctx.strokeStyle = AB.PAL.ink3;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(gx, gy);
  ctx.lineTo(gx, g0);
  ctx.lineTo(g2, g0);
  ctx.stroke();
  AB.text(ctx, 'F', gx + 4, gy + 2, { size: 8, color: AB.PAL.ink3, align: 'left' });
  AB.text(ctx, 't (ms)', g2 - 24, g0 + 14, { size: 8, color: AB.PAL.ink3 });

  // Estímulos
  for (let t = 0; t <= tmax; t += dt) {
    ctx.strokeStyle = 'rgba(169,42,30,.5)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(X(t), g0);
    ctx.lineTo(X(t), g0 + 5);
    ctx.stroke();
  }

  // Suma de twitches
  function tw(t: number) {
    return t <= 0 ? 0 : (t / T) * Math.exp(1 - t / T);
  }
  const tcur = flags.smPlaying ? (flags.smT || 0) % (tmax + 300) : tmax;
  const tdraw = flags.smPlaying ? Math.min(tmax, tcur) : tmax;
  ctx.strokeStyle = AB.PAL.teal;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  const N = 280;
  for (let i = 0; i <= N; i++) {
    const t = (tdraw * i) / N;
    let s = 0;
    for (let tk = 0; tk <= t; tk += dt) s += tw(t - tk) * 0.9;
    const x = X(t), y = Y(s);
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.stroke();

  if (flags.smPlaying && tcur < tmax) {
    ctx.strokeStyle = AB.PAL.blood;
    ctx.lineWidth = 1.4;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(X(tcur), gy);
    ctx.lineTo(X(tcur), g0);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  const fused = f >= 50, part = f >= 20 && f < 50;
  const state = fused ? 'tétanos completo (fusión)' : part ? 'tétanos incompleto' : 'twitches individuales';
  AB.text(ctx, state, (gx + g2) / 2, h * 0.9, { size: 10, weight: '700', color: fused ? AB.PAL.blood : part ? AB.PAL.amber : AB.PAL.teal });
  AB.text(ctx, '50–60 estímulos/s → tétanos en mamíferos', (gx + g2) / 2, h * 0.965, { size: 8, color: AB.PAL.ink3 });

  if (out) {
    out('sm_fv', AB.espan(f, 0) + '/s');
    out(
      'sm_out',
      fused
        ? 'fusión total a ' + AB.espan(f, 0) + ' estímulos/s'
        : part
        ? 'parcial: la contracción crece con ' + AB.espan(f, 0) + '/s'
        : 'suma de ' + AB.espan(f, 0) + ' twitches/s'
    );
  }
}

/* ═══════════════════════════════════════════════════════════
   S5 · Tiempos de respuesta por tipo de fibra dominante
   ═══════════════════════════════════════════════════════════ */
export function drawFibers(
  _t: number,
  params: SimParams,
  _flags: SimFlags,
  out?: OutputFn
): void {
  const cv = document.getElementById('sim-fibers') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth, h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  const mus = params.fb_mus || 'gastroc';
  const DATA = {
    ocular: { name: 'Ocular', resp: 25, ft: 0.85, col: AB.PAL.blood, txt: 'FT dominante · respuesta ~1/40 s' },
    gastroc: { name: 'Gastrocnemio', resp: 67, ft: 0.55, col: AB.PAL.amber, txt: 'mixto · respuesta ~1/15 s' },
    soleo: { name: 'Sóleo', resp: 200, ft: 0.2, col: AB.PAL.teal, txt: 'ST dominante · lento y resistente (~1/5 s)' },
  };
  const D = DATA[mus] || DATA.gastroc;

  // Línea de tiempo 0–250 ms
  const gx = w * 0.1, g2 = w * 0.95, gy = h * 0.18;
  ctx.strokeStyle = AB.PAL.ink3;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(gx, gy);
  ctx.lineTo(g2, gy);
  ctx.stroke();
  AB.text(ctx, '0', gx, gy + 12, { size: 7, color: AB.PAL.ink3 });
  AB.text(ctx, '250 ms', g2 - 26, gy + 12, { size: 7, color: AB.PAL.ink3 });
  AB.text(ctx, 'tiempo de respuesta', (gx + g2) / 2, gy - 10, { size: 9, color: AB.PAL.ink2 });

  ([
    ['ocular · ~1/40 s', 25, AB.PAL.blood],
    ['gastroc · ~1/15 s', 67, AB.PAL.amber],
    ['sóleo · ~1/5 s', 200, AB.PAL.teal],
  ] as [string, number, string][]).forEach((m) => {
    const x = gx + ((g2 - gx) * m[1]) / 250;
    ctx.fillStyle = m[2];
    ctx.beginPath();
    ctx.arc(x, gy, 4, 0, 7);
    ctx.fill();
    AB.text(ctx, m[0], x, gy - 8, { size: 7, color: m[2] });
  });

  // Marcador del músculo elegido
  const dx = gx + ((g2 - gx) * D.resp) / 250;
  ctx.fillStyle = D.col;
  ctx.beginPath();
  ctx.moveTo(dx - 6, gy + 4);
  ctx.lineTo(dx + 6, gy + 4);
  ctx.lineTo(dx, gy + 12);
  ctx.closePath();
  ctx.fill();
  AB.text(ctx, D.name + ' → ~1/' + Math.round(1000 / D.resp) + ' s', dx, gy + 28, { size: 9, weight: '700', color: D.col });

  // Composición FT / ST
  const bx = w * 0.1, bw = w * 0.8, by = h * 0.56, bh = h * 0.12;
  const st = 1 - D.ft;
  ctx.fillStyle = D.col;
  ctx.fillRect(bx, by, bw * D.ft, bh);
  ctx.fillStyle = AB.PAL.blood;
  ctx.fillRect(bx + bw * D.ft, by, bw * st, bh);
  ctx.strokeStyle = AB.PAL.boneEdge;
  ctx.lineWidth = 1.2;
  ctx.strokeRect(bx, by, bw, bh);
  AB.text(ctx, 'FT ' + AB.fmt(D.ft * 100, 0) + ' %', bx + (bw * D.ft) / 2, by + bh / 2 + 4, { size: 9, weight: '700', color: '#fbf8f0' });
  AB.text(ctx, 'ST ' + AB.fmt(st * 100, 0) + ' %', bx + bw * D.ft + (bw * st) / 2, by + bh / 2 + 4, { size: 9, weight: '700', color: '#fbf8f0' });
  AB.text(ctx, 'composición de fibras', w / 2, by - 8, { size: 9, color: AB.PAL.ink2 });
  AB.text(ctx, 'ocular ~1/40 s · gastrocnemio ~1/15 s · sóleo ~1/5 s', w / 2, h * 0.9, { size: 9, weight: '700', color: AB.PAL.ink });

  if (out) out('fb_out', D.txt);
}

/* ═══════════════════════════════════════════════════════════
   S6 · Modelo activo: T(t) = T₀ (1 − e^(−t/τ))
   ═══════════════════════════════════════════════════════════ */
export function drawActive(
  _t: number,
  params: SimParams,
  flags: SimFlags,
  out?: OutputFn
): void {
  const cv = document.getElementById('sim-active') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth, h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  const tau = Number(params.ac_tau) || 40;
  const tmax = 5 * tau;
  const gx = w * 0.12, g2 = w * 0.95, gy = h * 0.14, g0 = h * 0.8;
  const X = (t: number) => gx + ((g2 - gx) * t) / tmax;
  const Y = (v: number) => g0 - (g0 - gy) * v;

  ctx.strokeStyle = AB.PAL.ink3;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(gx, gy);
  ctx.lineTo(gx, g0);
  ctx.lineTo(g2, g0);
  ctx.stroke();
  AB.text(ctx, 'T/T₀', gx + 4, gy + 2, { size: 8, color: AB.PAL.ink3, align: 'left' });
  AB.text(ctx, 't (ms)', g2 - 24, g0 + 14, { size: 8, color: AB.PAL.ink3 });

  // Curva
  ctx.strokeStyle = AB.PAL.teal;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  const N = 200;
  for (let i = 0; i <= N; i++) {
    const t = (tmax * i) / N;
    const x = X(t), y = Y(1 - Math.exp(-t / tau));
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.stroke();

  // Punto 63 % en t=τ
  ctx.strokeStyle = AB.PAL.amber;
  ctx.lineWidth = 1.2;
  ctx.setLineDash([4, 3]);
  ctx.beginPath();
  ctx.moveTo(X(tau), gy);
  ctx.lineTo(X(tau), Y(0.63));
  ctx.lineTo(gx, Y(0.63));
  ctx.stroke();
  ctx.setLineDash([]);
  AB.text(ctx, 't = τ ⇒ 63 %', X(tau) + 6, Y(0.63) - 8, { size: 8, color: AB.PAL.amber, align: 'left' });

  // Punto animado
  if (flags.acPlaying) {
    const tc = Math.min(flags.acT || 0, tmax);
    const vv = 1 - Math.exp(-tc / tau);
    ctx.fillStyle = AB.PAL.blood;
    ctx.beginPath();
    ctx.arc(X(tc), Y(vv), 5, 0, 7);
    ctx.fill();
    AB.text(ctx, 'T/T₀ = ' + AB.fmt(vv, 2), X(tc) + 10, Y(vv) + 14, { size: 9, weight: '700', color: AB.PAL.blood, align: 'left' });
  }

  AB.text(ctx, 'T(t) = T₀ (1 − e^(−t/τ))', (gx + g2) / 2, gy - 10, { size: 10, weight: '700', color: AB.PAL.teal });
  AB.text(ctx, 'τ = ' + AB.espan(tau, 0) + ' ms', (gx + g2) / 2, g0 + 14, { size: 9, color: AB.PAL.ink2 });

  if (out) out('ac_out', 'τ = ' + AB.espan(tau, 0) + ' ms · t = τ ⇒ 63 % de T₀');
}

/* ═══════════════════════════════════════════════════════════
   S7 · Tétanos: T/T₀ = [1−e^(−t₁/τ)] / [1−e^(−(t₁+t₂)/τ)]
   ═══════════════════════════════════════════════════════════ */
export function drawTetanus2(
  _t: number,
  params: SimParams,
  flags: SimFlags,
  out?: OutputFn
): void {
  const cv = document.getElementById('sim-tetanus2') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth, h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  const t1 = Number(params.tt_t1) || 60;
  const t2 = Number(params.tt_t2) || 40;
  const tau = Number(params.tt_tau) || 40;
  const nume = 1 - Math.exp(-t1 / tau);
  const deno = 1 - Math.exp(-(t1 + t2) / tau);
  const Tss = deno > 0 ? nume / deno : 1;
  const period = t1 + t2;
  const tmax = Math.max(500, period * 8);
  const gx = w * 0.1, g2 = w * 0.97, gy = h * 0.16, g0 = h * 0.62;
  const X = (t: number) => gx + ((g2 - gx) * t) / tmax;
  const Y = (v: number) => g0 - (g0 - gy) * Math.min(v, 1.4);

  ctx.strokeStyle = AB.PAL.ink3;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(gx, gy);
  ctx.lineTo(gx, g0);
  ctx.lineTo(g2, g0);
  ctx.stroke();
  AB.text(ctx, 'T/T₀', gx + 4, gy + 2, { size: 8, color: AB.PAL.ink3, align: 'left' });
  AB.text(ctx, 't (ms)', g2 - 24, g0 + 14, { size: 8, color: AB.PAL.ink3 });

  // Tren de estímulos
  const py0 = h * 0.8, ph = h * 0.1;
  for (let t = 0; t < tmax; t += period) {
    const x0 = X(t), x1 = X(Math.min(t + t1, tmax));
    ctx.fillStyle = 'rgba(169,42,30,.35)';
    ctx.fillRect(x0, py0, x1 - x0, ph);
  }
  AB.text(ctx, 'estímulos: t₁ on · t₂ off', gx, py0 + ph / 2, { size: 8, color: AB.PAL.blood, align: 'left' });

  // Meseta
  ctx.strokeStyle = AB.PAL.blood;
  ctx.lineWidth = 1.4;
  ctx.setLineDash([5, 4]);
  ctx.beginPath();
  ctx.moveTo(gx, Y(Tss));
  ctx.lineTo(g2, Y(Tss));
  ctx.stroke();
  ctx.setLineDash([]);
  AB.text(ctx, 'T tétanos = ' + AB.fmt(Tss, 2) + ' T₀', g2 - 8, Y(Tss) - 8, { size: 9, weight: '700', color: AB.PAL.blood, align: 'right' });

  // Subida
  ctx.strokeStyle = AB.PAL.teal;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  const N = 240;
  for (let i = 0; i <= N; i++) {
    const t = (tmax * i) / N;
    const x = X(t), y = Y(Tss * (1 - Math.exp(-t / tau)));
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.stroke();

  if (flags.ttPlaying) {
    const tc = Math.min((flags.ttT || 0) * 250, tmax);
    const vv = Tss * (1 - Math.exp(-tc / tau));
    ctx.fillStyle = AB.PAL.teal;
    ctx.beginPath();
    ctx.arc(X(tc), Y(vv), 5, 0, 7);
    ctx.fill();
  }

  AB.text(ctx, 'la tensión sube hacia la meseta del tétanos', (gx + g2) / 2, gy - 10, { size: 10, weight: '700', color: AB.PAL.teal });
  AB.text(ctx, 't₁ = ' + AB.espan(t1, 0) + ' ms · t₂ = ' + AB.espan(t2, 0) + ' ms · τ = ' + AB.espan(tau, 0) + ' ms', (gx + g2) / 2, h * 0.95, { size: 9, color: AB.PAL.ink2 });

  if (out) {
    out('tt_out', t2 === 0 ? 't₂ = 0 ⇒ tétanos completo: T/T₀ = 1' : 'T tétanos / T₀ = ' + AB.fmt(Tss, 2));
  }
}

/* ═══════════════════════════════════════════════════════════
   S8 · Tejido pasivo: σ = μ′(e^(αλ) − 1)
   ═══════════════════════════════════════════════════════════ */
export function drawPassive(
  _t: number,
  params: SimParams,
  _flags: SimFlags,
  out?: OutputFn
): void {
  const cv = document.getElementById('sim-passive') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth, h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  const mat = params.ps_mat || 'suave';
  const lam = Number(params.ps_l) || 1.5;
  const mu = mat === 'suave' ? 2 : 20; // kPa
  const alpha = 4;
  const sig = (L: number, m: number) => m * (Math.exp(alpha * (L - 1)) - 1);
  const gx = w * 0.12, g2 = w * 0.95, gy = h * 0.14, g0 = h * 0.8;
  const yMax = Math.max(80, Math.min(500, sig(2.2, mu) * 1.15));
  const X = (L: number) => gx + ((g2 - gx) * (L - 1)) / 1.2;
  const Y = (s: number) => g0 - ((g0 - gy) * s) / yMax;

  // Ejes
  ctx.strokeStyle = AB.PAL.ink3;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(gx, gy);
  ctx.lineTo(gx, g0);
  ctx.lineTo(g2, g0);
  ctx.stroke();
  AB.text(ctx, 'σ (kPa)', gx + 4, gy + 2, { size: 8, color: AB.PAL.ink3, align: 'left' });
  AB.text(ctx, 'λ = L/L₀', (gx + g2) / 2, g0 + 14, { size: 8, color: AB.PAL.ink3 });
  AB.text(ctx, '1,0', gx - 8, g0 + 14, { size: 7, color: AB.PAL.ink3 });
  AB.text(ctx, '2,2', g2 - 14, g0 + 14, { size: 7, color: AB.PAL.ink3 });

  // Curvas (ambos materiales)
  ([['suave', 2, AB.PAL.teal], ['rigido', 20, AB.PAL.blood]] as [string, number, string][]).forEach((M) => {
    const on = M[0] === mat;
    ctx.strokeStyle = M[2];
    ctx.lineWidth = on ? 2.8 : 1.5;
    ctx.setLineDash(on ? [] : [4, 3]);
    ctx.beginPath();
    const N = 200;
    for (let i = 0; i <= N; i++) {
      const L = 1 + (1.2 * i) / N;
      const x = X(L), y = Y(sig(L, M[1]));
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);
    AB.text(ctx, M[0] === 'suave' ? 'μ′ = 2 kPa' : 'μ′ = 20 kPa', gx + 8, gy + 16 + (M[0] === 'suave' ? 0 : 14), { size: 8, color: M[2], align: 'left' });
  });

  // Punto actual
  const px = X(lam), py = Y(sig(lam, mu));
  ctx.fillStyle = mat === 'suave' ? AB.PAL.teal : AB.PAL.blood;
  ctx.beginPath();
  ctx.arc(px, py, 5, 0, 7);
  ctx.fill();
  AB.dashed(ctx, px, py, px, g0, { color: AB.PAL.ink3 });
  AB.text(ctx, 'λ = ' + AB.espan(lam, 2), px + 8, g0 + 8, { size: 8, color: AB.PAL.ink2, align: 'left' });
  AB.text(ctx, 'σ = μ′ e^(αλ) − μ  (α = 4)', (gx + g2) / 2, gy - 10, { size: 10, weight: '700', color: AB.PAL.teal });
  AB.text(ctx, 'σ(' + AB.espan(lam, 2) + ') = ' + AB.fmt(sig(lam, mu), 0) + ' kPa', (gx + g2) / 2, h * 0.92, { size: 9, weight: '700', color: AB.PAL.ink });

  if (out) out('ps_out', 'σ = ' + AB.fmt(sig(lam, mu), 0) + ' kPa · el pasivo crece exponencialmente con λ');
}

/* ═══════════════════════════════════════════════════════════
   S9 · Tensión-longitud: activa + pasiva
   ═══════════════════════════════════════════════════════════ */
export function drawTension(
  _t: number,
  params: SimParams,
  _flags: SimFlags,
  out?: OutputFn
): void {
  const cv = document.getElementById('sim-tension') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth, h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  const tipo = params.tn_tipo || 'paralelo';
  const pinch = tipo === 'pinnado';
  const scale = pinch ? 1.25 : 1.0, Lw = pinch ? 0.75 : 1.0;
  const gx = w * 0.12, g2 = w * 0.95, gy = h * 0.14, g0 = h * 0.8;
  const Lmin = 0.2, Lmax = 1.9;
  const X = (L: number) => gx + ((g2 - gx) * (L - Lmin)) / (Lmax - Lmin);
  const Y = (F: number) => g0 - ((g0 - gy) * Math.min(F, 1.3)) / 1.3;

  ctx.strokeStyle = AB.PAL.ink3;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(gx, gy);
  ctx.lineTo(gx, g0);
  ctx.lineTo(g2, g0);
  ctx.stroke();
  AB.text(ctx, 'F', gx + 4, gy + 2, { size: 8, color: AB.PAL.ink3, align: 'left' });
  AB.text(ctx, 'L / L₀', (gx + g2) / 2, g0 + 14, { size: 8, color: AB.PAL.ink3 });

  const actL = (L: number) => actF(1 + (L - 1) / Lw) * scale;
  const pasL = (L: number) => (L > 1.0 ? Math.max(0, L - 1.0) * 0.9 : 0);

  function poly(fn: (L: number) => number, col: string, lw: number, dash?: number[]) {
    ctx.strokeStyle = col;
    ctx.lineWidth = lw;
    if (dash) ctx.setLineDash(dash);
    ctx.beginPath();
    for (let i = 0; i <= 200; i++) {
      const L = Lmin + ((Lmax - Lmin) * i) / 200;
      const x = X(L), y = Y(fn(L));
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.stroke();
    if (dash) ctx.setLineDash([]);
  }

  poly(actL, AB.PAL.teal, 2.6);
  poly(pasL, AB.PAL.amber, 2, [5, 3]);
  poly((L: number) => actL(L) + pasL(L), AB.PAL.blood, 2);

  // L₀
  AB.dashed(ctx, X(1), gy, X(1), g0, { color: 'rgba(35,44,54,.3)' });
  AB.text(ctx, 'L₀', X(1) + 4, gy + 12, { size: 8, color: AB.PAL.ink3 });

  // Pico
  ctx.fillStyle = AB.PAL.teal;
  ctx.beginPath();
  ctx.arc(X(1), Y(actL(1)), 4.5, 0, 7);
  ctx.fill();
  AB.text(ctx, 'F_max en L₀', X(1) + 6, Y(actL(1)) - 8, { size: 8, color: AB.PAL.teal, align: 'left' });
  AB.text(ctx, 'activa', gx + 8, gy + 12, { size: 8, color: AB.PAL.teal, align: 'left' });
  AB.text(ctx, 'pasiva', gx + 8, gy + 26, { size: 8, color: AB.PAL.amber, align: 'left' });
  AB.text(ctx, 'activa + pasiva', gx + 8, gy + 40, { size: 8, color: AB.PAL.blood, align: 'left' });
  AB.text(ctx, pinch ? 'pinnado (gastrocnemio): más F · rango corto' : 'paralelo (sartorio): menos F · rango largo', (gx + g2) / 2, h * 0.92, { size: 9, weight: '700', color: AB.PAL.ink });

  if (out) {
    out('tn_out', pinch ? 'pinnado: F_max +25 %, rango de trabajo corto' : 'paralelo: F_max 1,0, rango de trabajo amplio');
  }
}

/* ═══════════════════════════════════════════════════════════
   S10 · Prueba cotidiana: muñeca y el «truco del cuchillo»
   ═══════════════════════════════════════════════════════════ */
export function drawWrist(
  _t: number,
  params: SimParams,
  _flags: SimFlags,
  out?: OutputFn
): void {
  const cv = document.getElementById('sim-wrist') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth, h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  const ang = Number(params.wr_ang) || 0;
  const rad = (ang * Math.PI) / 180;
  const grip = Math.max(8, 100 - 0.95 * ang);
  const wx = w * 0.34, wy = h * 0.5, fw = w * 0.4;

  // Antebrazo
  ctx.strokeStyle = AB.PAL.skin;
  ctx.lineWidth = 26;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(wx - fw, wy);
  ctx.lineTo(wx, wy);
  ctx.stroke();

  ctx.strokeStyle = AB.PAL.skinEdge;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(wx - fw, wy - 13);
  ctx.lineTo(wx, wy - 13);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(wx - fw, wy + 13);
  ctx.lineTo(wx, wy + 13);
  ctx.stroke();

  // Tendones flexores (cara anterior)
  ctx.strokeStyle = AB.PAL.tendon;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(wx - fw + 14, wy + 12);
  ctx.lineTo(wx - 4, wy + 10);
  ctx.stroke();

  // Mano rotando
  ctx.save();
  ctx.translate(wx, wy);
  ctx.rotate(rad);
  const HL = w * 0.2;
  ctx.strokeStyle = AB.PAL.skin;
  ctx.lineWidth = 20;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(HL, 0);
  ctx.stroke();

  ctx.strokeStyle = AB.PAL.skinEdge;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(HL, -10);
  ctx.lineTo(HL + 10, -8);
  ctx.lineTo(HL + 12, 2);
  ctx.lineTo(HL, 4);
  ctx.stroke();

  // Objeto (estilete)
  ctx.strokeStyle = AB.PAL.ink;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(HL + 16, -2);
  ctx.lineTo(HL + 58, -2);
  ctx.stroke();

  // Tendón hacia la palma
  ctx.strokeStyle = AB.PAL.tendon;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-4, 10);
  ctx.quadraticCurveTo(HL * 0.4, 8, HL - 2, 2);
  ctx.stroke();
  ctx.restore();

  // Medidor de agarre
  const gx = w * 0.72, g0 = h * 0.62, gmax = h * 0.3;
  ctx.strokeStyle = AB.PAL.ink3;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(gx, g0);
  ctx.lineTo(gx, g0 - gmax);
  ctx.stroke();

  const gh = (gmax * grip) / 100;
  ctx.strokeStyle = grip > 60 ? AB.PAL.teal : grip > 35 ? AB.PAL.amber : AB.PAL.blood;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(gx, g0);
  ctx.lineTo(gx, g0 - gh);
  ctx.stroke();

  AB.text(ctx, 'agarre', gx, g0 + 18, { size: 9, color: AB.PAL.ink2 });
  AB.text(ctx, AB.fmt(grip, 0) + ' %', gx - 8, g0 - gh - 8, { size: 12, weight: '700', color: AB.PAL.ink, align: 'right' });
  AB.text(ctx, 'flexión ' + AB.espan(ang, 0) + '°', gx, h * 0.22, { size: 10, weight: '700', color: AB.PAL.blood });
  AB.text(ctx, ang < 30 ? 'flexores en longitud óptima → agarre fuerte' : 'flexores acortados → pierden fuerza', w / 2, h * 0.88, { size: 9, color: AB.PAL.ink2 });

  if (out) {
    out('wr_angv', AB.espan(ang, 0) + '°');
    out('wr_out', ang < 30 ? 'agarre: fuerte (flexores en longitud óptima)' : ang < 60 ? 'agarre: debilitándose' : 'agarre: flojo — el «truco del cuchillo»');
  }
}

/* ═══════════════════════════════════════════════════════════
   S11 · Hill: T′(v′) = (1−v′)/(1+v′/k)
   ═══════════════════════════════════════════════════════════ */
export function drawHill(
  _t: number,
  params: SimParams,
  _flags: SimFlags,
  out?: OutputFn
): void {
  const cv = document.getElementById('sim-hill') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth, h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  const k = Number(params.hl_k) || 0.2;
  const gx = w * 0.12, g2 = w * 0.95, gy = h * 0.14, g0 = h * 0.8;
  const X = (v: number) => gx + (g2 - gx) * v;
  const Y = (T: number) => g0 - (g0 - gy) * T;

  ctx.strokeStyle = AB.PAL.ink3;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(gx, gy);
  ctx.lineTo(gx, g0);
  ctx.lineTo(g2, g0);
  ctx.stroke();
  AB.text(ctx, 'T′ = T / T_max', gx + 4, gy + 2, { size: 8, color: AB.PAL.ink3, align: 'left' });
  AB.text(ctx, 'v′ = v / v_max', (gx + g2) / 2, g0 + 14, { size: 8, color: AB.PAL.ink3 });
  AB.text(ctx, '0', gx - 4, g0 + 14, { size: 7, color: AB.PAL.ink3 });
  AB.text(ctx, '1', g2 - 6, g0 + 14, { size: 7, color: AB.PAL.ink3 });

  ctx.strokeStyle = AB.PAL.teal;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  const N = 200;
  for (let i = 0; i <= N; i++) {
    const v = i / N;
    const T = (1 - v) / (1 + v / k);
    const x = X(v), y = Y(T);
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.stroke();

  ctx.fillStyle = AB.PAL.teal;
  ctx.beginPath();
  ctx.arc(X(0), Y(1), 4.5, 0, 7);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(X(1), Y(0), 4.5, 0, 7);
  ctx.fill();
  AB.text(ctx, 'T_max (isométrica)', X(0) + 8, Y(1) - 8, { size: 8, color: AB.PAL.teal, align: 'left' });
  AB.text(ctx, 'v_max = (b/a)·T_max', X(1) - 8, Y(0) + 16, { size: 8, color: AB.PAL.teal, align: 'right' });
  AB.text(ctx, '(T+a)(v+b) = (T_max+a)b', (gx + g2) / 2, gy - 10, { size: 10, weight: '700', color: AB.PAL.teal });
  AB.text(ctx, 'k = a/T_max = b/v_max = ' + AB.espan(k, 2), (gx + g2) / 2, h * 0.92, { size: 9, weight: '700', color: AB.PAL.ink });

  if (out) out('hl_out', 'k = ' + AB.espan(k, 2) + ' · excéntrico ≈ 1,8 T_max');
}

/* ═══════════════════════════════════════════════════════════
   S12 · Potencia: P′(v′) = v′(1−v′)/(1+v′/k)
   ═══════════════════════════════════════════════════════════ */
export function drawPower(
  _t: number,
  params: SimParams,
  _flags: SimFlags,
  out?: OutputFn
): void {
  const cv = document.getElementById('sim-power') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth, h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  const k = Number(params.pw_k) || 0.2;
  const gx = w * 0.12, g2 = w * 0.95, gy = h * 0.14, g0 = h * 0.8;
  const X = (v: number) => gx + (g2 - gx) * v;
  const Y = (p: number) => g0 - (g0 - gy) * p;
  const P = (v: number) => (v * (1 - v)) / (1 + v / k);
  let pm = 0, vp = 0.3;
  for (let i = 1; i < 1000; i++) {
    const v = i / 1000, p = P(v);
    if (p > pm) {
      pm = p;
      vp = v;
    }
  }

  ctx.strokeStyle = AB.PAL.amber;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  const N = 200;
  for (let i = 0; i <= N; i++) {
    const v = i / N;
    const x = X(v), y = Y(P(v) / pm);
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.stroke();

  // Ejes
  ctx.strokeStyle = AB.PAL.ink3;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(gx, gy);
  ctx.lineTo(gx, g0);
  ctx.lineTo(g2, g0);
  ctx.stroke();
  AB.text(ctx, 'P′ (normalizada)', gx + 4, gy + 2, { size: 8, color: AB.PAL.ink3, align: 'left' });
  AB.text(ctx, 'v′', (gx + g2) / 2, g0 + 14, { size: 8, color: AB.PAL.ink3 });

  ctx.fillStyle = AB.PAL.blood;
  ctx.beginPath();
  ctx.arc(X(vp), Y(1), 5, 0, 7);
  ctx.fill();
  AB.dashed(ctx, X(vp), Y(1), X(vp), g0, { color: AB.PAL.ink3 });
  AB.text(ctx, 'pico: v ≈ 0,3 v_max', X(vp) + 8, Y(1) - 10, { size: 9, weight: '700', color: AB.PAL.blood, align: 'left' });
  AB.text(ctx, 'P ≈ 0,1 T_max·v_max', (gx + g2) / 2, h * 0.92, { size: 9, weight: '700', color: AB.PAL.ink });
  AB.text(ctx, 'P(v) = v (bT_max − av)/(v+b)', (gx + g2) / 2, gy - 10, { size: 10, weight: '700', color: AB.PAL.amber });

  if (out) out('pw_out', 'pico ≈ 0,1 T_max·v_max a v ≈ 0,3 v_max (T ≈ 0,3 T_max)');
}

/* ═══════════════════════════════════════════════════════════
   S13 · Sistema músculo-tendón (L_T,s / L₀)
   ═══════════════════════════════════════════════════════════ */
export function drawTendon(
  _t: number,
  params: SimParams,
  _flags: SimFlags,
  out?: OutputFn
): void {
  const cv = document.getElementById('sim-tendon') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth, h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  const r = Number(params.td_ratio) || 3;
  const xMax = Math.max(18, r + 2.5);
  const gx = w * 0.1, g2 = w * 0.96, gy = h * 0.14, g0 = h * 0.8;
  const X = (L: number) => gx + ((g2 - gx) * L) / xMax;
  const Y = (F: number) => g0 - (g0 - gy) * Math.min(F, 1.2);

  ctx.strokeStyle = AB.PAL.ink3;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(gx, gy);
  ctx.lineTo(gx, g0);
  ctx.lineTo(g2, g0);
  ctx.stroke();
  AB.text(ctx, 'F / F_max', gx + 4, gy + 2, { size: 8, color: AB.PAL.ink3, align: 'left' });
  AB.text(ctx, 'L_total / L₀', (gx + g2) / 2, g0 + 14, { size: 8, color: AB.PAL.ink3 });

  // Solución cuasiestática: F(Lf) = k·(Lt − Lf − L_Ts)
  const k = 3 / r;
  function solve(Lt: number) {
    let best = 1e9, bf = 1;
    for (let j = 0; j <= 150; j++) {
      const Lf = 0.2 + (1.6 * j) / 150;
      const F = actF(Lf), T = k * Math.max(0, Lt - Lf - r);
      const d = Math.abs(F - T);
      if (d < best) {
        best = d;
        bf = Lf;
      }
    }
    return actF(bf);
  }

  // Solo músculo (referencia)
  ctx.strokeStyle = 'rgba(35,44,54,.35)';
  ctx.lineWidth = 1.6;
  ctx.setLineDash([4, 3]);
  ctx.beginPath();
  for (let i = 0; i <= 200; i++) {
    const Lf = 0.3 + (1.4 * i) / 200;
    const x = X(Lf), y = Y(actF(Lf));
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.stroke();
  ctx.setLineDash([]);
  AB.text(ctx, 'solo músculo', gx + 8, gy + 12, { size: 8, color: 'rgba(35,44,54,.6)', align: 'left' });

  // Conjunto músculo-tendón
  ctx.strokeStyle = AB.PAL.teal;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  let started = false;
  for (let i = 0; i <= 260; i++) {
    const Lt = (xMax * i) / 260;
    const F = solve(Lt);
    const x = X(Lt), y = Y(F);
    if (F > 0.01) {
      if (!started) {
        ctx.moveTo(x, y);
        started = true;
      } else ctx.lineTo(x, y);
    }
  }
  ctx.stroke();

  // Umbral de fuerza sostenible
  const thr = r + 0.7;
  ctx.strokeStyle = AB.PAL.amber;
  ctx.lineWidth = 1.2;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.moveTo(X(thr), gy);
  ctx.lineTo(X(thr), g0);
  ctx.stroke();
  ctx.setLineDash([]);
  AB.text(ctx, 'L_T,s + 0,7 L₀', X(thr), g0 + 12, { size: 7, color: AB.PAL.amber });
  AB.text(ctx, 'L_T,s / L₀ = ' + AB.espan(r, 1), (gx + g2) / 2, gy - 10, { size: 10, weight: '700', color: AB.PAL.teal });

  if (out) {
    out('td_ratiov', AB.espan(r, 1));
    out(
      'td_out',
      r <= 1
        ? 'tendón rígido (L_T,s/L₀ = ' + AB.espan(r, 1) + '): la curva apenas cambia'
        : r >= 10
        ? 'tendón flexible (L_T,s/L₀ = ' + AB.espan(r, 1) + '): el máximo se desplaza y la subida se alarga'
        : 'L_T,s/L₀ = ' + AB.espan(r, 1) + ': el tendón desplaza la región útil'
    );
  }
}

/* ═══════════════════════════════════════════════════════════
   S14 · Puente cruzado: golpe de fuerza de 11 nm, ~3 pN
   ═══════════════════════════════════════════════════════════ */
export function drawBridge(
  _t: number,
  _params: SimParams,
  flags: SimFlags,
  out?: OutputFn
): void {
  const cv = document.getElementById('sim-bridge') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth, h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  const ay = h * 0.26, mY = h * 0.72;
  const ph = (flags.brT || 0) % 1;

  // Actina (con desplazamiento durante el golpe)
  const baseX = w * 0.12, span = w * 0.76;
  const dx = ph > 0.35 && ph < 0.65 ? ((ph - 0.35) / 0.3) * 11 : 0;
  ctx.strokeStyle = AB.PAL.ink3;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(baseX - dx, ay);
  ctx.lineTo(baseX + span - dx, ay);
  ctx.stroke();
  ctx.fillStyle = 'rgba(107,120,133,.7)';
  for (let x = baseX; x <= baseX + span; x += w * 0.055) {
    ctx.beginPath();
    ctx.arc(x - dx, ay, 3, 0, 7);
    ctx.fill();
  }
  AB.text(ctx, 'actina', baseX, ay - 12, { size: 9, color: AB.PAL.ink3 });

  // Miosina
  ctx.strokeStyle = AB.PAL.teal;
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.moveTo(w * 0.08, mY);
  ctx.lineTo(w * 0.92, mY);
  ctx.stroke();
  AB.text(ctx, 'filamento de miosina', w * 0.08, mY - 16, { size: 9, color: AB.PAL.teal });

  // Cabeza S1 con brazo de palanca
  const px = w * 0.44, L = 30;
  let ang: number, attached: boolean, stroking: boolean;
  if (ph < 0.2) {
    ang = -Math.PI / 2;
    attached = false;
    stroking = false;
  } else if (ph < 0.35) {
    ang = -Math.PI / 2;
    attached = true;
    stroking = false;
  } else if (ph < 0.6) {
    ang = -Math.PI / 2 + ((ph - 0.35) / 0.25) * (Math.PI / 2);
    attached = true;
    stroking = true;
  } else if (ph < 0.8) {
    ang = 0;
    attached = false;
    stroking = false;
  } else {
    ang = -Math.PI / 2;
    attached = false;
    stroking = false;
  }
  const tx = px + Math.cos(ang) * L, ty = mY + Math.sin(ang) * L;
  ctx.strokeStyle = AB.PAL.muscleEdge;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(px, mY);
  ctx.lineTo(tx, ty);
  ctx.stroke();
  ctx.fillStyle = attached ? AB.PAL.muscle : AB.PAL.ink2;
  ctx.beginPath();
  ctx.arc(tx, ty, 7, 0, 7);
  ctx.fill();

  if (stroking) {
    AB.arrow(ctx, w * 0.56, ay - 8, w * 0.56 - 36, ay - 8, { color: AB.PAL.blood });
    AB.text(ctx, '~3 pN', w * 0.56 - 44, ay - 14, { size: 9, weight: '700', color: AB.PAL.blood });
    AB.text(ctx, 'golpe ≈ 11 nm', px + 8, ay + 18, { size: 8, color: AB.PAL.amber, align: 'left' });
  }
  const phaseName = stroking ? 'golpe de fuerza (power stroke)' : attached ? 'unido y tirando' : 'ciclo: ATP → ADP + Pᵢ';
  AB.text(ctx, phaseName, w / 2, h * 0.9, { size: 10, weight: '700', color: stroking ? AB.PAL.blood : AB.PAL.teal });
  AB.text(ctx, 'medido con pinzas ópticas: 3–4 pN', w / 2, h * 0.965, { size: 8, color: AB.PAL.ink3 });

  if (out) {
    out('br_out', stroking ? '~3 pN por puente · golpe 11 nm' : 'ciclo de puente cruzado · 3 pN');
  }
}

/* ═══════════════════════════════════════════════════════════
   S15 · Relación de trabajo (duty ratio) r_duty ≈ 0,02
   ═══════════════════════════════════════════════════════════ */
export function drawDuty(
  _t: number,
  _params: SimParams,
  flags: SimFlags,
  out?: OutputFn
): void {
  const cv = document.getElementById('sim-duty') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth, h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  const r = 0.02, n = 50;

  // Panel 1: 50 cabezas, ~6 unidas
  const y1 = h * 0.2, x0 = w * 0.1, x1 = w * 0.9;
  const st = Math.floor((flags.dyT || 0) * 5) % n;
  for (let i = 0; i < n; i++) {
    const x = x0 + ((x1 - x0) * (i + 0.5)) / n;
    const on = (i - st + n) % n < 6;
    ctx.fillStyle = on ? AB.PAL.teal : 'rgba(107,120,133,.35)';
    ctx.beginPath();
    ctx.arc(x, y1, 4.5, 0, 7);
    ctx.fill();
  }
  AB.text(ctx, 'N_min = 1/r_duty = 50 cabezas · ~6 unidas tirando (verde)', w / 2, y1 + 22, { size: 9, color: AB.PAL.ink2 });
  AB.text(ctx, 'cada cabeza unida tira con ~3 pN', w / 2, y1 + 36, { size: 8, color: AB.PAL.ink3 });

  // Panel 2: Línea de tiempo de un ciclo
  const y2 = h * 0.52, tx0 = w * 0.1, tx1 = w * 0.9;
  ctx.strokeStyle = AB.PAL.ink3;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(tx0, y2);
  ctx.lineTo(tx1, y2);
  ctx.stroke();
  const onW = (tx1 - tx0) * r;
  ctx.fillStyle = AB.PAL.teal;
  ctx.fillRect(tx0, y2 - 7, Math.max(3, onW), 14);
  AB.text(ctx, 'τ_on ≈ 1 ms (2 %)', tx0 + Math.max(4, onW) / 2, y2 + 18, { size: 8, color: AB.PAL.teal });
  AB.text(ctx, 'τ_off (98 %)', (tx0 + onW + tx1) / 2, y2 + 18, { size: 8, color: AB.PAL.ink3 });
  AB.text(ctx, 'un ciclo de puente cruzado', w / 2, y2 - 18, { size: 9, weight: '700', color: AB.PAL.ink2 });

  // Panel 3: Escalera de distancias
  const y3 = h * 0.78;
  ctx.strokeStyle = AB.PAL.amber;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(w * 0.13, y3 + 8);
  ctx.lineTo(w * 0.27, y3 + 8);
  ctx.stroke();
  ctx.strokeStyle = AB.PAL.teal;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(w * 0.46, y3 + 8);
  ctx.lineTo(w * 0.64, y3 + 8);
  ctx.stroke();
  AB.text(ctx, 'δ = 5 nm', w * 0.2, y3, { size: 9, color: AB.PAL.amber });
  AB.text(ctx, 'Δ = δ/r_duty = 250 nm', w * 0.55, y3, { size: 9, color: AB.PAL.teal });
  AB.text(ctx, 'd = 36 nm → n = Δ/d = 3', w * 0.78, y3, { size: 8, color: AB.PAL.ink3 });
  AB.text(ctx, 'v = Δ/τ_cycle = δ/τ_on = 5 μm/s', w / 2, h * 0.92, { size: 9, weight: '700', color: AB.PAL.ink });

  if (out) out('dy_out', 'r_duty = 0,02 · N_min = 50 · Δ = 250 nm · v = 5 μm/s');
}

/* ═══════════════════════════════════════════════════════════
   S16 · Escaleras: 3×10¹⁴ puentes → 175 J → 700 W
   ═══════════════════════════════════════════════════════════ */
export function drawStairs(
  _t: number,
  _params: SimParams,
  flags: SimFlags,
  out?: OutputFn
): void {
  const cv = document.getElementById('sim-stairs') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth, h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  const ph = (flags.stT || 0) % 1;
  const rise = (1 - Math.sin(ph * Math.PI)) * 6;

  // Escalera
  const sx = w * 0.04, sy = h * 0.62, sw = w * 0.1, sh = h * 0.09;
  ctx.strokeStyle = AB.PAL.boneEdge;
  ctx.lineWidth = 1.4;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(sx + i * sw, sy + i * sh);
    ctx.lineTo(sx + (i + 1) * sw, sy + i * sh);
    ctx.lineTo(sx + (i + 1) * sw, sy + (i + 1) * sh);
    ctx.stroke();
  }

  // Figura
  const hx = sx + 2.2 * sw, hy = sy + 2.3 * sh - rise;
  ctx.strokeStyle = AB.PAL.ink;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(hx, hy);
  ctx.lineTo(hx - 3, hy - 32);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(hx - 4, hy - 38, 6, 0, 7);
  ctx.stroke();
  const kx = hx - 10, ky = hy + 24;
  ctx.strokeStyle = AB.PAL.muscleEdge;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(hx, hy);
  ctx.lineTo(kx, ky);
  ctx.stroke();
  const fx = sx + 1.2 * sw, fy = sy + 1.2 * sh;
  ctx.strokeStyle = AB.PAL.ink;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(kx, ky);
  ctx.lineTo(fx, fy);
  ctx.stroke();
  AB.foot(ctx, fx, fy, 0.3, { len: 16, h: 7 });
  AB.arrow(ctx, kx, ky - 6, kx + 12, ky - 20, { color: AB.PAL.muscle });
  AB.text(ctx, '3 cm', kx + 16, ky - 18, { size: 8, color: AB.PAL.muscle });
  AB.text(ctx, '0,25 s por paso', sx, sy + 4 * sh + 16, { size: 8, color: AB.PAL.ink2, align: 'left' });

  // Cadena de cuentas
  const rx = w * 0.54, ry = h * 0.16;
  const items = [
    ['puentes en sección', '3×10¹⁴', AB.PAL.teal],
    ['uniones (3 cm / 5,3 nm)', '1,8×10²¹', AB.PAL.teal],
    ['energía', '175 J', AB.PAL.amber],
    ['potencia = 175 J / 0,25 s', '700 W', AB.PAL.blood],
  ];
  const activeIdx = Math.floor(ph * 4) % 4;
  items.forEach((it, i) => {
    const y = ry + i * 36;
    if (i === activeIdx) {
      ctx.fillStyle = 'rgba(13,110,100,.10)';
      ctx.fillRect(rx - 8, y - 11, w - rx + 8, 26);
    }
    AB.text(ctx, it[0], rx, y, { size: 9, color: AB.PAL.ink2, align: 'left' });
    AB.text(ctx, it[1], rx + 170, y, { size: 12, weight: '700', color: it[2], align: 'left' });
  });

  if (out) out('st_out', '3×10¹⁴ puentes → 1,8×10²¹ uniones → 175 J → 700 W');
}

/* ═══════════════════════════════════════════════════════════
   S17 · Titina: el resorte molecular del sarcómero
   ═══════════════════════════════════════════════════════════ */
export function drawTitina(
  _t: number,
  params: SimParams,
  _flags: SimFlags,
  out?: OutputFn
): void {
  const cv = document.getElementById('sim-titina') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth, h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  const L = Number(params.ti_l) || 2.2;
  const s = (w * 0.86) / 3.6;
  const cx = w * 0.5, cy = h * 0.52;
  const A = 0.5;
  const ZL = cx - (L / 2) * s, ZR = cx + (L / 2) * s, AL = cx - A * s, AR = cx + A * s;
  const yZ = cy - 26, yA = cy + 22;

  // Discos Z y línea M
  ctx.strokeStyle = AB.PAL.boneEdge;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(ZL, yZ - 16);
  ctx.lineTo(ZL, yZ + 16);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(ZR, yZ - 16);
  ctx.lineTo(ZR, yZ + 16);
  ctx.stroke();
  ctx.strokeStyle = AB.PAL.ink3;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx, yA - 16);
  ctx.lineTo(cx, yA + 16);
  ctx.stroke();
  AB.text(ctx, 'disco Z', ZL, yZ - 24, { size: 8, color: AB.PAL.ink2 });
  AB.text(ctx, 'disco Z', ZR, yZ - 24, { size: 8, color: AB.PAL.ink2 });
  AB.text(ctx, 'M', cx + 5, yA - 18, { size: 8, color: AB.PAL.ink3 });

  // Filamentos gruesos y delgados
  ctx.strokeStyle = AB.PAL.teal;
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(AL, yA);
  ctx.lineTo(AR, yA);
  ctx.stroke();
  ctx.strokeStyle = AB.PAL.ink3;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(ZL, yA);
  ctx.lineTo(AR - 6, yA);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(ZR, yA);
  ctx.lineTo(AL + 6, yA);
  ctx.stroke();
  AB.text(ctx, 'banda A · miosina', cx, yA + 14, { size: 8, color: AB.PAL.teal });

  // Estado de la titina
  let state: string, col: string;
  if (L <= 2.0) {
    state = 'en reposo';
    col = AB.PAL.ink3;
  } else if (L <= 2.4) {
    state = 'dominios Ig enderezándose';
    col = AB.PAL.amber;
  } else if (L <= 2.8) {
    state = 'PEVK estirándose';
    col = AB.PAL.teal;
  } else {
    state = 'despliegue de dominios Ig';
    col = AB.PAL.blood;
  }

  function spring(x0: number, x1: number, y: number, color: string) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(x0, y);
    const n = 10, seg = (x1 - x0) / n;
    for (let i = 1; i <= n; i++) {
      const x = x0 + seg * i;
      ctx.lineTo(x, y + (i % 2 ? -6 : 6));
    }
    ctx.lineTo(x1, y);
    ctx.stroke();
  }

  spring(ZL, AL + 4, yZ, col);
  spring(ZR, AR - 4, yZ, col);
  AB.text(ctx, 'titina: Ig · PEVK · Ig', cx, yZ - 40, { size: 9, weight: '700', color: col });
  AB.text(ctx, state, cx, h - 16, { size: 10, weight: '700', color: col });

  if (out) {
    out('ti_lv', AB.espan(L, 1) + ' μm');
    out('ti_out', 'titina: ' + state + (L > 2.8 ? ' · los Ig se despliegan para proteger' : ''));
  }
}

/* ═══════════════════════════════════════════════════════════
   S18 · Coordinación: sóleo, gastrocnemio y tibial anterior
   ═══════════════════════════════════════════════════════════ */
export function drawCoord(
  _t: number,
  params: SimParams,
  _flags: SimFlags,
  out?: OutputFn
): void {
  const cv = document.getElementById('sim-coord') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth, h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  const v = Number(params.cd_v) || 1.2;
  const gx = w * 0.12, g2 = w * 0.95, gy = h * 0.14, g0 = h * 0.78;
  const X = (p: number) => gx + ((g2 - gx) * p) / 100;
  const Y = (F: number) => g0 - ((g0 - gy) * Math.min(F, 100)) / 100;

  ctx.strokeStyle = AB.PAL.ink3;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(gx, gy);
  ctx.lineTo(gx, g0);
  ctx.lineTo(g2, g0);
  ctx.stroke();
  AB.text(ctx, 'F (%)', gx + 4, gy + 2, { size: 8, color: AB.PAL.ink3, align: 'left' });
  AB.text(ctx, '% del ciclo de paso', (gx + g2) / 2, g0 + 14, { size: 8, color: AB.PAL.ink3 });

  ctx.strokeStyle = 'rgba(35,44,54,.18)';
  ctx.setLineDash([4, 3]);
  ctx.beginPath();
  ctx.moveTo(X(60), gy);
  ctx.lineTo(X(60), g0);
  ctx.stroke();
  ctx.setLineDash([]);
  AB.text(ctx, 'apoyo', (gx + X(60)) / 2, gy + 10, { size: 8, color: AB.PAL.ink3 });
  AB.text(ctx, 'balanceo', (X(60) + g2) / 2, gy + 10, { size: 8, color: AB.PAL.ink3 });

  const bump = (p: number, c: number, wdt: number) => {
    const d = (p - c) / wdt;
    return 100 * Math.exp(-d * d);
  };
  const gasC = Math.max(10, 22 - 6 * v), gasW = 14, gasA = Math.min(95, 45 + 28 * v);
  const solC = 38, solW = 16, taC = 82, taW = 9;

  function trace(fn: (p: number) => number, col: string) {
    ctx.strokeStyle = col;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    for (let i = 0; i <= 200; i++) {
      const p = (100 * i) / 200;
      const x = X(p), y = Y(fn(p));
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.stroke();
  }

  trace((p: number) => (bump(p, gasC, gasW) * gasA) / 100, AB.PAL.blood);
  trace((p: number) => bump(p, solC, solW), AB.PAL.teal);
  trace((p: number) => bump(p, taC, taW), AB.PAL.amber);

  AB.text(ctx, 'gastrocnemio (FT)', gx + 8, gy + 26, { size: 8, color: AB.PAL.blood, align: 'left' });
  AB.text(ctx, 'sóleo (ST)', gx + 8, gy + 40, { size: 8, color: AB.PAL.teal, align: 'left' });
  AB.text(ctx, 'tibial anterior', gx + 8, gy + 54, { size: 8, color: AB.PAL.amber, align: 'left' });
  AB.text(ctx, 'v = ' + AB.espan(v, 1) + ' m/s', g2 - 8, gy + 8, { size: 9, weight: '700', color: AB.PAL.ink, align: 'right' });

  if (out) {
    out(
      'cd_out',
      v >= 2
        ? 'trote: el gastrocnemio domina y adelanta al sóleo'
        : v <= 0.5
        ? 'marcha lenta: el sóleo sostiene la estabilidad'
        : 'el gastrocnemio adelanta al sóleo'
    );
  }
}

/* ═══════════════════════════════════════════════════════════
   S19 · Carga rRM: rRM = 1RM (1,0278 − 0,0278 r)
   ═══════════════════════════════════════════════════════════ */
export function drawMvc(
  _t: number,
  params: SimParams,
  _flags: SimFlags,
  out?: OutputFn
): void {
  const cv = document.getElementById('sim-mvc') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth, h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  const r = Math.max(1, Math.round(Number(params.mv_r) || 10));
  const pct = 100 * (1.0278 - 0.0278 * r);
  const gx = w * 0.12, g2 = w * 0.95, gy = h * 0.14, g0 = h * 0.78;
  const X = (rr: number) => gx + ((g2 - gx) * (rr - 1)) / 19;
  const Y = (p: number) => g0 - ((g0 - gy) * p) / 100;

  ctx.strokeStyle = AB.PAL.ink3;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(gx, gy);
  ctx.lineTo(gx, g0);
  ctx.lineTo(g2, g0);
  ctx.stroke();
  AB.text(ctx, '% de 1RM', gx + 4, gy + 2, { size: 8, color: AB.PAL.ink3, align: 'left' });
  AB.text(ctx, 'repeticiones r', (gx + g2) / 2, g0 + 14, { size: 8, color: AB.PAL.ink3 });
  AB.text(ctx, '1', gx - 4, g0 + 14, { size: 7, color: AB.PAL.ink3 });
  AB.text(ctx, '20', g2 - 8, g0 + 14, { size: 7, color: AB.PAL.ink3 });

  ctx.strokeStyle = AB.PAL.teal;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  for (let i = 0; i <= 200; i++) {
    const rr = 1 + (19 * i) / 200;
    const x = X(rr), y = Y(100 * (1.0278 - 0.0278 * rr));
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.stroke();

  ctx.fillStyle = AB.PAL.blood;
  ctx.beginPath();
  ctx.arc(X(r), Y(pct), 5, 0, 7);
  ctx.fill();
  AB.dashed(ctx, X(r), Y(pct), X(r), g0, { color: AB.PAL.ink3 });
  AB.text(ctx, AB.espan(r, 0) + 'RM = ' + AB.fmt(pct, 0) + ' %', X(r) + 8, Y(pct) + 14, { size: 10, weight: '700', color: AB.PAL.blood, align: 'left' });
  AB.text(ctx, '1RM = 100 %', gx + 8, gy + 12, { size: 8, color: AB.PAL.teal, align: 'left' });
  AB.text(ctx, '10 RM ≈ 75 % de 1RM', (gx + g2) / 2, h * 0.92, { size: 9, weight: '700', color: AB.PAL.ink });

  if (out) {
    out('mv_rv', AB.espan(r, 0));
    out('mv_out', AB.espan(r, 0) + 'RM = ' + AB.fmt(pct, 0) + ' % de 1RM');
  }
}

/* ═══════════════════════════════════════════════════════════
   S20 · Entrenamiento y envejecimiento
   ═══════════════════════════════════════════════════════════ */
export function drawTraining(
  _t: number,
  params: SimParams,
  _flags: SimFlags,
  out?: OutputFn
): void {
  const cv = document.getElementById('sim-training') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth, h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  const age = Math.round(Number(params.tr_age) || 45);
  const torque = 224 - 1.79 * age, react = 153 + 0.57 * age;

  // Izquierda: Zonas de RM
  const lx = w * 0.06, lw = w * 0.4;
  const zones: [string, string, string][] = [
    ['fuerza', '≤ 6 RM', AB.PAL.teal],
    ['tamaño', '6–12 RM', AB.PAL.amber],
    ['resistencia', '≥ 20 RM', AB.PAL.blood],
  ];
  zones.forEach((z, i) => {
    const y = h * 0.24 + i * 34;
    ctx.fillStyle = z[2];
    ctx.fillRect(lx, y, lw, 16);
    AB.text(ctx, z[1], lx + lw / 2, y + 8, { size: 9, weight: '700', color: '#fbf8f0' });
    AB.text(ctx, z[0], lx + lw + 10, y + 8, { size: 9, color: AB.PAL.ink, align: 'left' });
  });
  AB.text(ctx, 'zonas de entrenamiento', lx, h * 0.16, { size: 10, weight: '700', color: AB.PAL.ink, align: 'left' });
  AB.text(ctx, 'descansos < 90 s para tamaño', lx, h * 0.24 + 3 * 34, { size: 7, color: AB.PAL.ink3, align: 'left' });

  // Derecha: Envejecimiento
  const rx = w * 0.56, rw = w * 0.4, gx0 = rx + 20;
  const gy0 = h * 0.8, top = h * 0.18;
  const X = (a: number) => gx0 + (rw * (a - 20)) / 69;
  const YT = (tVal: number) => gy0 - ((gy0 - top) * (tVal - (224 - 1.79 * 89))) / (224 - 1.79 * 20 - (224 - 1.79 * 89));
  const YR = (rr: number) => gy0 - ((gy0 - top) * (rr - (153 + 0.57 * 20))) / (153 + 0.57 * 89 - (153 + 0.57 * 20));

  ctx.strokeStyle = AB.PAL.teal;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  for (let i = 0; i <= 80; i++) {
    const a = 20 + (69 * i) / 80;
    const x = X(a), y = YT(224 - 1.79 * a);
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.stroke();

  ctx.strokeStyle = AB.PAL.amber;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  for (let i = 0; i <= 80; i++) {
    const a = 20 + (69 * i) / 80;
    const x = X(a), y = YR(153 + 0.57 * a);
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.stroke();

  ctx.strokeStyle = AB.PAL.ink3;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(gx0 - 10, gy0 + 6);
  ctx.lineTo(gx0 + rw, gy0 + 6);
  ctx.stroke();
  AB.text(ctx, 'edad', gx0 + rw / 2, gy0 + 18, { size: 8, color: AB.PAL.ink3 });
  AB.text(ctx, '20', gx0 - 4, gy0 + 6, { size: 7, color: AB.PAL.ink3 });
  AB.text(ctx, '89', gx0 + rw - 14, gy0 + 6, { size: 7, color: AB.PAL.ink3 });

  ctx.fillStyle = AB.PAL.blood;
  ctx.beginPath();
  ctx.arc(X(age), YT(torque), 4.5, 0, 7);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(X(age), YR(react), 4.5, 0, 7);
  ctx.fill();

  AB.dashed(ctx, X(age), gy0 + 6, X(age), top, { color: 'rgba(35,44,54,.3)' });
  AB.text(ctx, 'torque rodilla (N·m)', gx0 + rw - 4, top + 6, { size: 8, color: AB.PAL.teal, align: 'right' });
  AB.text(ctx, 'reacción (ms)', gx0 + rw - 4, top + 20, { size: 8, color: AB.PAL.amber, align: 'right' });
  AB.text(ctx, 'envejecimiento', rx, h * 0.16, { size: 10, weight: '700', color: AB.PAL.ink, align: 'left' });

  if (out) {
    out('tr_agev', AB.espan(age, 0));
    out('tr_out', 'torque = ' + AB.fmt(torque, 0) + ' N·m · reacción = ' + AB.fmt(react, 0) + ' ms');
  }
}

/* ═══════════════════════════════════════════════════════════
   S21 · Curva de Rohmert: resistencia vs % MVC
   ═══════════════════════════════════════════════════════════ */
export function drawRohmert(
  _t: number,
  params: SimParams,
  _flags: SimFlags,
  out?: OutputFn
): void {
  const cv = document.getElementById('sim-rohmert') as HTMLCanvasElement | null;
  if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth, h = cv.clientHeight;
  const ctx = AB.setup(cv, w, h);
  const P = Math.max(15, Math.round(Number(params.rh_s) || 50));
  const tm = 3.5 * Math.pow(50 / P, 3); // minutos
  const gx = w * 0.13, g2 = w * 0.95, gy = h * 0.14, g0 = h * 0.78;
  const tlo = 0.05, thi = 200;
  const X = (p: number) => gx + ((g2 - gx) * (p - 15)) / 85;
  const Yt = (tVal: number) => g0 - ((g0 - gy) * (Math.log(tVal) - Math.log(tlo))) / (Math.log(thi) - Math.log(tlo));

  ctx.strokeStyle = AB.PAL.ink3;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(gx, gy);
  ctx.lineTo(gx, g0);
  ctx.lineTo(g2, g0);
  ctx.stroke();
  AB.text(ctx, 'resistencia (min, log)', gx + 4, gy + 2, { size: 8, color: AB.PAL.ink3, align: 'left' });
  AB.text(ctx, 'esfuerzo (% MVC)', (gx + g2) / 2, g0 + 14, { size: 8, color: AB.PAL.ink3 });
  AB.text(ctx, '15', gx - 6, g0 + 14, { size: 7, color: AB.PAL.ink3 });
  AB.text(ctx, '100', g2 - 10, g0 + 14, { size: 7, color: AB.PAL.ink3 });

  // Nota baja esfuerzo
  ctx.fillStyle = 'rgba(154,91,0,.10)';
  ctx.fillRect(gx, gy, ((g2 - gx) * 8) / 85, g0 - gy);
  ctx.strokeStyle = AB.PAL.amber;
  ctx.lineWidth = 1.2;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.moveTo(gx + ((g2 - gx) * 8) / 85, gy);
  ctx.lineTo(gx + ((g2 - gx) * 8) / 85, g0);
  ctx.stroke();
  ctx.setLineDash([]);
  AB.text(ctx, 'fatiga posible', gx + ((g2 - gx) * 8) / 85 + 4, gy + 10, { size: 7, color: AB.PAL.amber, align: 'left' });
  AB.text(ctx, 'incluso < 15 %', gx + ((g2 - gx) * 8) / 85 + 4, gy + 20, { size: 7, color: AB.PAL.amber, align: 'left' });

  // Curva
  ctx.strokeStyle = AB.PAL.teal;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  const N = 200;
  for (let i = 0; i <= N; i++) {
    const p = 15 + (85 * i) / N;
    const tVal = 3.5 * Math.pow(50 / p, 3);
    const x = X(p), y = Yt(Math.min(thi, Math.max(tlo, tVal)));
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.stroke();

  // Punto actual
  ctx.fillStyle = AB.PAL.blood;
  ctx.beginPath();
  ctx.arc(X(P), Yt(tm), 5, 0, 7);
  ctx.fill();
  AB.dashed(ctx, X(P), Yt(tm), X(P), g0, { color: AB.PAL.ink3 });
  const min = Math.floor(tm), sec = Math.round((tm - min) * 60);
  AB.text(ctx, min + ' min ' + (sec < 10 ? '0' : '') + sec + ' s', X(P) + 8, Yt(tm) + 14, { size: 10, weight: '700', color: AB.PAL.blood, align: 'left' });
  AB.text(ctx, 'disminución hiperbólica del tiempo de resistencia', (gx + g2) / 2, gy - 10, { size: 10, weight: '700', color: AB.PAL.teal });

  if (out) {
    out('rh_sv', AB.espan(P, 0) + ' %');
    out('rh_out', 'al ' + AB.espan(P, 0) + ' % MVC: resistencia ≈ ' + AB.fmt(tm, 1) + ' min');
  }
}

/* ═══════════════════════════════════════════════════════════
   Redibujado general de diapositiva
   ═══════════════════════════════════════════════════════════ */
export function redrawSlide(
  n: number,
  t: number,
  params: SimParams,
  flags: SimFlags,
  out?: OutputFn
): void {
  const fns: Record<number, () => void> = {
    1: () => drawCells(t, params, flags, out),
    2: () => drawArch(t, params, flags, out),
    3: () => drawTwitch(t, params, flags, out),
    4: () => drawSumm(t, params, flags, out),
    5: () => drawFibers(t, params, flags, out),
    6: () => drawActive(t, params, flags, out),
    7: () => drawTetanus2(t, params, flags, out),
    8: () => drawPassive(t, params, flags, out),
    9: () => drawTension(t, params, flags, out),
    10: () => drawWrist(t, params, flags, out),
    11: () => drawHill(t, params, flags, out),
    12: () => drawPower(t, params, flags, out),
    13: () => drawTendon(t, params, flags, out),
    14: () => drawBridge(t, params, flags, out),
    15: () => drawDuty(t, params, flags, out),
    16: () => drawStairs(t, params, flags, out),
    17: () => drawTitina(t, params, flags, out),
    18: () => drawCoord(t, params, flags, out),
    19: () => drawMvc(t, params, flags, out),
    20: () => drawTraining(t, params, flags, out),
    21: () => drawRohmert(t, params, flags, out),
  };
  if (fns[n]) fns[n]();
}
