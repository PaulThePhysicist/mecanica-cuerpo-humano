// ═══════════════════════════════════════════════════════════
// CAPÍTULO 12 · HELPERS ANATÓMICOS Y MATEMÁTICOS 2D
// Propiedades Eléctricas y Magnéticas · Herman (2016)
// ═══════════════════════════════════════════════════════════

export const PAL = {
  paper: '#f5f0e4',
  card: '#fbf8f0',
  ink: '#232c36',
  ink2: '#43505c',
  ink3: '#6b7885',
  line: '#cfc3a9',
  sagittal: '#5d4fa8',
  bone: '#cfc4ae',
  boneEdge: '#b6a67f',
  boneDark: '#9b8a64',
  muscle: '#c14b4b',
  muscleEdge: '#a92a1e',
  tendon: '#e8d8c8',
  skin: '#e9c49f',
  skinEdge: '#d9a77c',
  teal: '#0d6e64',
  tealLight: '#3aa89c',
  amber: '#9a5b00',
  blood: '#a92a1e',
  good: '#2d7d4f',
  warn: '#b86a1e',
};

export const C = {
  paper: '#fbf8f0',
  card: '#ffffff',
  ink: '#232c36',
  ink2: '#43505c',
  muted: '#6b7885',
  line: '#cfc3a9',
  teal: '#0d6e64',
  tealD: '#084c45',
  amber: '#9a5b00',
  blood: '#a92a1e',
  violet: '#5d4fa8',
};

export function setup(cv: HTMLCanvasElement, w: number, h: number): CanvasRenderingContext2D {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  cv.width = Math.max(1, Math.round(w * dpr));
  cv.height = Math.max(1, Math.round(h * dpr));
  cv.style.width = w + 'px';
  cv.style.height = h + 'px';
  const ctx = cv.getContext('2d')!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  return ctx;
}

export function fmt(x: number, d: number = 1): string {
  let s = Number(x).toFixed(d).replace(/\.0+$/, '').replace('.', ',');
  if (s === '' || s === '-') s = '0';
  return s;
}

export function text(
  ctx: CanvasRenderingContext2D,
  s: string,
  x: number,
  y: number,
  o?: { weight?: string; size?: number; color?: string; align?: CanvasTextAlign; base?: CanvasTextBaseline }
): void {
  const opt = o || {};
  ctx.font = (opt.weight ? opt.weight + ' ' : '') + (opt.size ? opt.size + 'px ' : '13px ') + 'Karla, sans-serif';
  ctx.fillStyle = opt.color || PAL.ink;
  ctx.textAlign = opt.align || 'center';
  ctx.textBaseline = opt.base || 'middle';
  ctx.fillText(s, x, y);
}

export function arrow(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  o?: { head?: number; color?: string; width?: number }
): void {
  const opt = o || {};
  const head = opt.head === undefined ? 8 : opt.head;
  const ang = Math.atan2(y1 - y0, x1 - x0);
  ctx.strokeStyle = opt.color || PAL.teal;
  ctx.fillStyle = opt.color || PAL.teal;
  ctx.lineWidth = opt.width || 2.5;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x1 - head * Math.cos(ang - 0.45), y1 - head * Math.sin(ang - 0.45));
  ctx.lineTo(x1 - head * Math.cos(ang + 0.45), y1 - head * Math.sin(ang + 0.45));
  ctx.closePath();
  ctx.fill();
}

export function dashed(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  o?: { color?: string; width?: number }
): void {
  const opt = o || {};
  ctx.strokeStyle = opt.color || PAL.ink3;
  ctx.lineWidth = opt.width || 1.2;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
  ctx.setLineDash([]);
}

export function joint(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  o?: { fill?: string; lw?: number; color?: string }
): void {
  const opt = o || {};
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = opt.fill || '#f5f0e4';
  ctx.fill();
  ctx.lineWidth = opt.lw || 2.2;
  ctx.strokeStyle = opt.color || PAL.teal;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y, Math.max(1.5, r * 0.38), 0, Math.PI * 2);
  ctx.fillStyle = opt.color || PAL.teal;
  ctx.fill();
}

export function bone(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  o?: { width?: number; edge?: string; fill?: string; joint?: boolean; jointEnd?: boolean }
): void {
  const opt = o || {};
  const w = opt.width || 10;
  ctx.strokeStyle = opt.edge || PAL.boneEdge;
  ctx.lineWidth = w;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
  ctx.strokeStyle = opt.fill || PAL.bone;
  ctx.lineWidth = w - 3;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
  if (opt.joint !== false) {
    joint(ctx, x0, y0, w / 2, { color: PAL.teal });
  }
  if (opt.jointEnd) {
    joint(ctx, x1, y1, w / 2, { color: PAL.teal });
  }
}

export function muscle(
  ctx: CanvasRenderingContext2D,
  ax: number,
  ay: number,
  bx: number,
  by: number,
  o?: { w0?: number; w1?: number; bow?: number; fill?: string; lw?: number; edge?: string }
): void {
  const opt = o || {};
  const w0 = opt.w0 || 9,
    w1 = opt.w1 || 4;
  const ang = Math.atan2(by - ay, bx - ax);
  const perp = ang + Math.PI / 2;
  const dx = Math.cos(perp),
    dy = Math.sin(perp);
  const cx = (ax + bx) / 2,
    cy = (ay + by) / 2;
  const bow = opt.bow || 0;
  ctx.beginPath();
  ctx.moveTo(ax + (dx * w0) / 2, ay + (dy * w0) / 2);
  ctx.quadraticCurveTo(cx + dx * (bow + (w0 + w1) / 4), cy + dy * (bow + (w0 + w1) / 4), bx + (dx * w1) / 2, by + (dy * w1) / 2);
  ctx.quadraticCurveTo(cx - (dx * (w0 + w1)) / 4, cy - (dy * (w0 + w1)) / 4, ax - (dx * w0) / 2, ay - (dy * w0) / 2);
  ctx.closePath();
  ctx.fillStyle = opt.fill || PAL.muscle;
  ctx.fill();
  ctx.lineWidth = opt.lw || 1.5;
  ctx.strokeStyle = opt.edge || PAL.muscleEdge;
  ctx.stroke();
}

export function tendon(
  ctx: CanvasRenderingContext2D,
  ax: number,
  ay: number,
  bx: number,
  by: number,
  o?: { width?: number; fill?: string; edge?: string }
): void {
  const opt = o || {};
  const w = opt.width || 3.5;
  const ang = Math.atan2(by - ay, bx - ax);
  const px = Math.cos(ang + Math.PI / 2),
    py = Math.sin(ang + Math.PI / 2);
  ctx.beginPath();
  ctx.moveTo(ax + (px * w) / 2, ay + (py * w) / 2);
  ctx.lineTo(bx + (px * w) / 2, by + (py * w) / 2);
  ctx.lineTo(bx - (px * w) / 2, by - (py * w) / 2);
  ctx.lineTo(ax - (px * w) / 2, ay - (py * w) / 2);
  ctx.closePath();
  ctx.fillStyle = opt.fill || PAL.tendon;
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = opt.edge || '#c8b49a';
  ctx.stroke();
}

export function limbSkin(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  w: number,
  o?: { fill?: string; lw?: number; edge?: string }
): void {
  const opt = o || {};
  const ang = Math.atan2(y1 - y0, x1 - x0);
  const px = Math.cos(ang + Math.PI / 2),
    py = Math.sin(ang + Math.PI / 2);
  ctx.beginPath();
  ctx.moveTo(x0 + (px * w) / 2, y0 + (py * w) / 2);
  ctx.lineTo(x1 + (px * w) / 2, y1 + (py * w) / 2);
  ctx.arc(x1, y1, w / 2, ang - Math.PI / 2, ang + Math.PI / 2);
  ctx.lineTo(x0 - (px * w) / 2, y0 - (py * w) / 2);
  ctx.arc(x0, y0, w / 2, ang + Math.PI / 2, ang + Math.PI * 1.5);
  ctx.closePath();
  ctx.fillStyle = opt.fill || PAL.skin;
  ctx.fill();
  ctx.lineWidth = opt.lw || 1.4;
  ctx.strokeStyle = opt.edge || PAL.skinEdge;
  ctx.stroke();
}

export function hand(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  o?: { fill?: string; edge?: string }
): void {
  const opt = o || {};
  ctx.fillStyle = opt.fill || PAL.skin;
  ctx.strokeStyle = opt.edge || PAL.skinEdge;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.arc(x + i * r * 0.42, y - r * 0.55, r * 0.26, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
}

export function foot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  ang: number,
  o?: { len?: number; h?: number; fill?: string; edge?: string }
): void {
  const opt = o || {};
  const L = opt.len || 54,
    h = opt.h || 20;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);
  ctx.beginPath();
  ctx.moveTo(-L * 0.35, -h * 0.25);
  ctx.quadraticCurveTo(-L * 0.5, h * 0.1, -L * 0.2, h * 0.42);
  ctx.quadraticCurveTo(L * 0.2, h * 0.55, L * 0.62, h * 0.3);
  ctx.quadraticCurveTo(L * 0.75, -h * 0.15, L * 0.55, -h * 0.35);
  ctx.quadraticCurveTo(0, -h * 0.5, -L * 0.35, -h * 0.25);
  ctx.closePath();
  ctx.fillStyle = opt.fill || PAL.skin;
  ctx.fill();
  ctx.lineWidth = 1.4;
  ctx.strokeStyle = opt.edge || PAL.skinEdge;
  ctx.stroke();
  ctx.restore();
}

export function triangle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  o?: { color?: string }
): void {
  const opt = o || {};
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.5);
  ctx.lineTo(x - size * 0.5, y + size * 0.5);
  ctx.lineTo(x + size * 0.5, y + size * 0.5);
  ctx.closePath();
  ctx.fillStyle = opt.color || PAL.amber;
  ctx.fill();
}

export const AB = {
  PAL,
  setup,
  fmt,
  text,
  arrow,
  dashed,
  bone,
  joint,
  muscle,
  tendon,
  limbSkin,
  hand,
  foot,
  triangle,
};

// ── Helpers matemáticos y de renderizado para Capítulo 12 ──

export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export function espan(x: number, d: number = 0): string {
  const parts = Number(x).toFixed(d).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return parts.join(',');
}

export function _bg(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  ctx.fillStyle = C.paper;
  ctx.fillRect(0, 0, w, h);
}

export function _txt(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: string,
  o?: { bold?: boolean; w?: string; size?: number; color?: string; align?: CanvasTextAlign; base?: CanvasTextBaseline }
): void {
  const a = o || {};
  ctx.fillStyle = a.color || C.ink;
  ctx.font = (a.bold ? '700 ' : a.w || '500 ') + (a.size || 12) + 'px Karla, Arial, sans-serif';
  ctx.textAlign = a.align || 'left';
  ctx.textBaseline = a.base || 'middle';
  ctx.fillText(s, x, y);
}

export function _rect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string, rx?: number): void {
  ctx.fillStyle = color;
  ctx.beginPath();
  if (rx && (ctx as any).roundRect) {
    (ctx as any).roundRect(x, y, w, h, rx);
  } else {
    ctx.rect(x, y, w, h);
  }
  ctx.fill();
}

export function _line(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color: string, lw?: number, dash?: number[]): void {
  ctx.strokeStyle = color;
  ctx.lineWidth = lw || 1;
  ctx.setLineDash(dash || []);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.setLineDash([]);
}

export function _poly(ctx: CanvasRenderingContext2D, pts: { x: number; y: number }[], color: string, fill?: string): void {
  if (pts.length === 0) return;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.stroke();
  if (fill) {
    ctx.fillStyle = fill;
    ctx.lineTo(pts[0].x, pts[0].y);
    ctx.fill();
  }
}

export function _axisX(ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, labels: string[]): void {
  const n = labels.length;
  _line(ctx, x0, y0, x1, y0, C.line, 1);
  for (let i = 0; i < n; i++) {
    const x = x0 + ((x1 - x0) * i) / (n - 1);
    _line(ctx, x, y0, x, y0 + 4, C.line, 1);
    _txt(ctx, x, y0 + 12, labels[i], { size: 9, align: 'center', color: C.muted });
  }
}

export function _axisY(ctx: CanvasRenderingContext2D, x0: number, y0: number, y1: number, labels: string[]): void {
  const n = labels.length;
  _line(ctx, x0, y0, x0, y1, C.line, 1);
  for (let i = 0; i < n; i++) {
    const y = y1 - ((y1 - y0) * i) / (n - 1);
    _line(ctx, x0 - 6, y, x0, y, C.line, 1);
    _txt(ctx, x0 - 8, y, labels[i], { size: 9, align: 'right', color: C.muted });
  }
}

export function _axisY12(ctx: CanvasRenderingContext2D, x0: number, yTop: number, yBottom: number, labels: string[]): void {
  _line(ctx, x0, yTop, x0, yBottom, C.line, 1);
  const n = labels.length;
  for (let i = 0; i < n; i++) {
    const y = yBottom - ((yBottom - yTop) * i) / (n - 1);
    _line(ctx, x0 - 6, y, x0, y, C.line, 1);
    _txt(ctx, x0 - 8, y, labels[i], { size: 9, align: 'right', color: C.muted });
  }
}

export function _gauss(x: number, c: number, w: number): number {
  return Math.exp(-Math.pow((x - c) / w, 2));
}

export function _arrow(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color: string, lw?: number): void {
  _line(ctx, x1, y1, x2, y2, color, lw);
  const a = Math.atan2(y2 - y1, x2 - x1),
    L = 7;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - L * Math.cos(a - 0.45), y2 - L * Math.sin(a - 0.45));
  ctx.lineTo(x2 - L * Math.cos(a + 0.45), y2 - L * Math.sin(a + 0.45));
  ctx.closePath();
  ctx.fill();
}

const SUPS = '⁰¹²³⁴⁵⁶⁷⁸⁹';
export function sup(n: number): string {
  let s = String(Math.round(n));
  if (s[0] === '-') {
    s = '⁻' + s.slice(1);
  }
  return s
    .split('')
    .map((c) => (c === '⁻' ? '⁻' : SUPS[+c] || c))
    .join('');
}

export function sci(x: number): string {
  if (x === 0) return '0';
  const e = Math.floor(Math.log10(Math.abs(x)));
  const m = x / Math.pow(10, e);
  const mm = m >= 9.95 ? String(Math.round(m)) : m.toFixed(1).replace('.', ',');
  return mm + '×10' + sup(e);
}

export function fmtA(a: number): string {
  return a < 1e-3
    ? (a * 1e6).toFixed(0).replace('.', ',') + ' µA'
    : a < 1
    ? (a * 1e3).toFixed(0).replace('.', ',') + ' mA'
    : espan(a, 1) + ' A';
}

export function fmtR(r: number): string {
  return r >= 1000 ? (r / 1000).toFixed(0).replace('.', ',') + ' kΩ' : r + ' Ω';
}

export function formatRho(r: number): string {
  return espan(r, r >= 10 ? 0 : r >= 1 ? 1 : 3);
}

export function shortT(v: number): string {
  if (v >= 1e6 || (v > 0 && v < 1e-3)) {
    const e = Math.floor(Math.log10(v));
    const m = v / Math.pow(10, e);
    return (m >= 9.95 ? String(Math.round(m)) : m.toFixed(1).replace('.', ',')) + '×10' + sup(e);
  }
  return v >= 100 ? espan(v, 0) : espan(v, 1);
}

export const CIE_SPECTRAL: [number, number, number][] = [
  [380, 0.174, 0.005],
  [400, 0.173, 0.006],
  [420, 0.171, 0.006],
  [440, 0.164, 0.011],
  [460, 0.144, 0.03],
  [480, 0.091, 0.133],
  [500, 0.008, 0.538],
  [520, 0.074, 0.834],
  [540, 0.229, 0.754],
  [560, 0.374, 0.615],
  [580, 0.513, 0.487],
  [600, 0.628, 0.351],
  [620, 0.691, 0.308],
  [640, 0.708, 0.292],
  [660, 0.73, 0.27],
  [700, 0.735, 0.265],
];

export function cieXY(lam: number): [number, number] {
  lam = clamp(lam, 380, 700);
  for (let i = 0; i < CIE_SPECTRAL.length - 1; i++) {
    const a = CIE_SPECTRAL[i],
      b = CIE_SPECTRAL[i + 1];
    if (lam <= b[0]) {
      const t = (lam - a[0]) / (b[0] - a[0]);
      return [a[1] + t * (b[1] - a[1]), a[2] + t * (b[2] - a[2])];
    }
  }
  const q = CIE_SPECTRAL[CIE_SPECTRAL.length - 1];
  return [q[1], q[2]];
}

export function lamRGB(lam: number): [number, number, number] {
  let r = 0,
    g = 0,
    b = 0;
  if (lam < 440) {
    r = (lam - 380) / 60;
    b = 1;
  } else if (lam < 490) {
    g = (lam - 440) / 50;
    b = 1;
  } else if (lam < 510) {
    g = 1;
    b = 1 - (lam - 490) / 20;
  } else if (lam < 580) {
    g = 1;
    r = (lam - 510) / 70;
  } else if (lam < 645) {
    r = 1;
    g = 1 - (lam - 580) / 65;
  } else {
    r = 1;
  }
  const m = Math.max(r, g, b, 0.001);
  return [Math.round((r / m) * 255), Math.round((g / m) * 255), Math.round((b / m) * 255)];
}
