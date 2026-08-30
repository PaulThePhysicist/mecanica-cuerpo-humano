// ═══════════════════════════════════════════════════════════════════════════
//  Capítulo 3 · Helpers anatómicos 2D (TypeScript puro, sin DOM)
//  Heredados del motor de capitulo3.html · portados a React.
// ═══════════════════════════════════════════════════════════════════════════

export interface DrawCtx {
  ctx: CanvasRenderingContext2D;
  w: number;
  h: number;
  t: number;
}

export const PAL = {
  paper: '#f5f0e4',
  card: '#fbf8f0',
  ink: '#232c36',
  ink2: '#43505c',
  ink3: '#6b7885',
  line: '#cfc3a9',
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
  sagittal: '#5d4fa8',
};

export function setup(ctx: CanvasRenderingContext2D, w: number, h: number, dpr: number = 1): void {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
}

export function fmt(x: number, d: number = 1): string {
  let s = Number(x).toFixed(d).replace(/\.?0+$/, '').replace('.', ',');
  if (s === '' || s === '-') s = '0';
  return s;
}

export function espan(x: number, d: number = 0): string {
  let s = Number(x).toFixed(d), neg = s.startsWith('-');
  if (neg) s = s.slice(1);
  const parts = s.split('.'), ip = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  let out = ip;
  if (parts.length > 1 && parts[1] !== '') out += ',' + parts[1];
  return (neg ? '-' : '') + out;
}

export function damp(v: number, t: number, r: number, dt: number): number {
  return v + (t - v) * (1 - Math.exp(-r * dt));
}

export function text(
  ctx: CanvasRenderingContext2D,
  s: string,
  x: number,
  y: number,
  o?: { weight?: string; size?: number; color?: string; align?: CanvasTextAlign; base?: CanvasTextBaseline }
): void {
  o = o || {};
  ctx.font = (o.weight ? o.weight + ' ' : '') + (o.size ? o.size + 'px ' : '13px ') + 'Karla, sans-serif';
  ctx.fillStyle = o.color || PAL.ink;
  ctx.textAlign = o.align || 'center';
  ctx.textBaseline = o.base || 'middle';
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
  o = o || {};
  const head = o.head === undefined ? 8 : o.head;
  const ang = Math.atan2(y1 - y0, x1 - x0);
  ctx.strokeStyle = o.color || PAL.teal;
  ctx.fillStyle = o.color || PAL.teal;
  ctx.lineWidth = o.width || 2.5;
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
  o = o || {};
  ctx.strokeStyle = o.color || PAL.ink3;
  ctx.lineWidth = o.width || 1.2;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
  ctx.setLineDash([]);
}

export function bone(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  o?: { width?: number; edge?: string; fill?: string; joint?: boolean; jointEnd?: boolean }
): void {
  o = o || {};
  const w = o.width || 10;
  ctx.strokeStyle = o.edge || PAL.boneEdge;
  ctx.lineWidth = w;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
  ctx.strokeStyle = o.fill || PAL.bone;
  ctx.lineWidth = w - 3;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
  if (o.joint !== false) joint(ctx, x0, y0, w / 2, { r: Math.max(2, w / 2 - 3) });
  if (o.jointEnd) joint(ctx, x1, y1, w / 2, { r: Math.max(2, w / 2 - 3) });
}

export function joint(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  o?: { fill?: string; color?: string; lw?: number; r?: number }
): void {
  o = o || {};
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = o.fill || '#f5f0e4';
  ctx.fill();
  ctx.lineWidth = o.lw || 2.2;
  ctx.strokeStyle = o.color || PAL.teal;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y, Math.max(1.5, o.r || r * 0.38), 0, Math.PI * 2);
  ctx.fillStyle = o.color || PAL.teal;
  ctx.fill();
}

export function muscle(
  ctx: CanvasRenderingContext2D,
  ax: number,
  ay: number,
  bx: number,
  by: number,
  o?: { w0?: number; w1?: number; bow?: number; fill?: string; edge?: string; lw?: number }
): void {
  o = o || {};
  const w0 = o.w0 || 9, w1 = o.w1 || 4;
  const ang = Math.atan2(by - ay, bx - ax);
  const perp = ang + Math.PI / 2;
  const dx = Math.cos(perp), dy = Math.sin(perp);
  const cx = (ax + bx) / 2, cy = (ay + by) / 2;
  const bow = o.bow || 0;
  ctx.beginPath();
  ctx.moveTo(ax + dx * w0 / 2, ay + dy * w0 / 2);
  ctx.quadraticCurveTo(cx + dx * (bow + (w0 + w1) / 4), cy + dy * (bow + (w0 + w1) / 4), bx + dx * w1 / 2, by + dy * w1 / 2);
  ctx.quadraticCurveTo(cx - dx * (w0 + w1) / 4, cy - dy * (w0 + w1) / 4, ax - dx * w0 / 2, ay - dy * w0 / 2);
  ctx.closePath();
  ctx.fillStyle = o.fill || PAL.muscle;
  ctx.fill();
  ctx.lineWidth = o.lw || 1.5;
  ctx.strokeStyle = o.edge || PAL.muscleEdge;
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
  o = o || {};
  const w = o.width || 3.5;
  const ang = Math.atan2(by - ay, bx - ax);
  const px = Math.cos(ang + Math.PI / 2), py = Math.sin(ang + Math.PI / 2);
  ctx.beginPath();
  ctx.moveTo(ax + px * w / 2, ay + py * w / 2);
  ctx.lineTo(bx + px * w / 2, by + py * w / 2);
  ctx.lineTo(bx - px * w / 2, by - py * w / 2);
  ctx.lineTo(ax - px * w / 2, ay - py * w / 2);
  ctx.closePath();
  ctx.fillStyle = o.fill || PAL.tendon;
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = o.edge || '#c8b49a';
  ctx.stroke();
}

export function limbSkin(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  w: number,
  o?: { fill?: string; edge?: string; lw?: number }
): void {
  o = o || {};
  const ang = Math.atan2(y1 - y0, x1 - x0);
  const px = Math.cos(ang + Math.PI / 2), py = Math.sin(ang + Math.PI / 2);
  ctx.beginPath();
  ctx.moveTo(x0 + px * w / 2, y0 + py * w / 2);
  ctx.lineTo(x1 + px * w / 2, y1 + py * w / 2);
  ctx.arc(x1, y1, w / 2, ang - Math.PI / 2, ang + Math.PI / 2);
  ctx.lineTo(x0 - px * w / 2, y0 - py * w / 2);
  ctx.arc(x0, y0, w / 2, ang + Math.PI / 2, ang + Math.PI * 1.5);
  ctx.closePath();
  ctx.fillStyle = o.fill || PAL.skin;
  ctx.fill();
  ctx.lineWidth = o.lw || 1.4;
  ctx.strokeStyle = o.edge || PAL.skinEdge;
  ctx.stroke();
}

export function hand(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, o?: { fill?: string; edge?: string }): void {
  o = o || {};
  ctx.fillStyle = o.fill || PAL.skin;
  ctx.strokeStyle = o.edge || PAL.skinEdge;
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

export function foot(ctx: CanvasRenderingContext2D, x: number, y: number, ang: number, o?: { len?: number; h?: number; fill?: string; edge?: string }): void {
  o = o || {};
  const L = o.len || 54, h = o.h || 20;
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
  ctx.fillStyle = o.fill || PAL.skin;
  ctx.fill();
  ctx.lineWidth = 1.4;
  ctx.strokeStyle = o.edge || PAL.skinEdge;
  ctx.stroke();
  ctx.restore();
}

export function triangle(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, o?: { color?: string }): void {
  o = o || {};
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.5);
  ctx.lineTo(x - size * 0.5, y + size * 0.5);
  ctx.lineTo(x + size * 0.5, y + size * 0.5);
  ctx.closePath();
  ctx.fillStyle = o.color || PAL.amber;
  ctx.fill();
}
