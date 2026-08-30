// @ts-nocheck
// ═══════════════════════════════════════════════════════════════════════════
//  Capítulo 8 · Simulaciones Cardiovasculares (TypeScript puro, sin DOM)
//  Port fiel de las 23 simulaciones de capitulo8.html a React SPA.
//  Física del Cuerpo Humano — Irving P. Herman.
// ═══════════════════════════════════════════════════════════════════════════

import * as AB from './ab';
const { PAL, fmt, espan, text, arrow, dashed, bone, joint, muscle, tendon, limbSkin, hand, foot, triangle } = AB;

export interface SimParams {
  ds_sel: string;
  pm_sys: number;
  pm_dia: number;
  gv_h: number;
  pf_q: number;
  vl_q: number;
  re_u: number;
  rv_r: number;
  pl_r: number;
  pl_p: number;
  st_ha: number;
  st_hv: number;
  st_o: number;
  fk_q: number;
  fk_d: number;
  pv_ed: number;
  pv_pa: number;
  pv_ct: number;
  ob_a: number;
  an_t: number;
  an_a: number;
  an_u: number;
  rp_y: number;
  rp_r: number;
  rp_g: number;
  es_s: number;
  fs_pv: number;
  fs_f: number;
  cc_rs: number;
  cc_cv: number;
  fd_rp: number;
  pu_vs: number;
  pu_c: number;
  wk_c: number;
  wk_r: number;
  wk_f: number;
  ej_i: number;
  df_ct: number;
  df_st: number;
  ef_ed: number;
  ef_es: number;
}

export interface SimFlags {
  pvPlaying: boolean;
  pvT: number;
  rpPlaying: boolean;
  rpT: number;
  wkPlaying: boolean;
  wkT: number;
  efPlaying: boolean;
  efT: number;
  reT: number;
}

export const DEFAULT_PARAMS: SimParams = {
  ds_sel: 'all',
  pm_sys: 120,
  pm_dia: 80,
  gv_h: 0,
  pf_q: 80,
  vl_q: 90,
  re_u: 0.3,
  rv_r: 1,
  pl_r: 1.2,
  pl_p: 100,
  st_ha: 36,
  st_hv: 15,
  st_o: 25,
  fk_q: 5,
  fk_d: 50,
  pv_ed: 140,
  pv_pa: 100,
  pv_ct: 1,
  ob_a: 0.33,
  an_t: 45,
  an_a: 0.5,
  an_u: 50,
  rp_y: 1,
  rp_r: 1,
  rp_g: 0.25,
  es_s: 50,
  fs_pv: 5,
  fs_f: 70,
  cc_rs: 17.5,
  cc_cv: 1.75,
  fd_rp: 18,
  pu_vs: 70,
  pu_c: 0.00175,
  wk_c: 0.002,
  wk_r: 17.5,
  wk_f: 70,
  ej_i: 0,
  df_ct: 1,
  df_st: 1,
  ef_ed: 150,
  ef_es: 60,
};

export const DEFAULT_FLAGS: SimFlags = {
  pvPlaying: false,
  pvT: 0,
  rpPlaying: false,
  rpT: 0,
  wkPlaying: false,
  wkT: 0,
  efPlaying: false,
  efT: 0,
  reT: 0,
};

export const TOTAL = 24;

export const MODULES = [
  { id: 0, name: 'Inicio',                  slides: [0],                  ico: '🏠' },
  { id: 1, name: 'La bomba',                slides: [1, 2],               ico: '🫀' },
  { id: 2, name: 'Gravedad',                slides: [3, 4],               ico: '🌍' },
  { id: 3, name: 'Hemodinámica',            slides: [5, 6, 7],            ico: '🌊' },
  { id: 4, name: 'Pared y capilar',         slides: [8, 9],               ico: '🎈' },
  { id: 5, name: 'Trabajo del corazón',     slides: [10, 11],             ico: '⚡' },
  { id: 6, name: 'Vasos enfermos',          slides: [12, 13, 14, 15],     ico: '🚑' },
  { id: 7, name: 'Modelos',                 slides: [16, 17, 18],         ico: '🧮' },
  { id: 8, name: 'Pulso y Windkessel',      slides: [19, 20],             ico: '📈' },
  { id: 9, name: 'Ejercicio y disfunción',  slides: [21, 22, 23],         ico: '🏃' },
];

export type OutFn = (id: string, text: string) => void;
export type Draw = (dc: AB.DrawCtx, p: SimParams, f: SimFlags, out: OutFn) => void;


// ═══════════════════════════════════════════════════════════════════════════
//  S1 · Reparto de la sangre en el cuerpo
// ═══════════════════════════════════════════════════════════════════════════
export const drawDistribution: Draw = (dc, p, f, out) => {
  const { ctx, w, h } = dc;
const sel=p.ds_sel;
  const rows=[
    ['Venas sistémicas',50,AB.PAL.teal],
    ['Pulmones',18,AB.PAL.amber],
    ['Corazón',12,AB.PAL.blood],
    ['Arterias',8,AB.PAL.blood],
    ['Capilares',5,AB.PAL.tealLight],
    ['Aorta + arteriolas',4,AB.PAL.sagittal],
    ['Otras',3,AB.PAL.ink3],
  ];
  const isSel=r=>sel==='all'||sel===r[0].toLowerCase().split(' ')[0]||(sel==='aorta'&&r[0].includes('Aorta'))||(sel==='arterias'&&r[0]==='Arterias')||(sel==='arteriolas'&&r[0].includes('arteriolas'));
  // dona
  const cx=w*0.33, cy=h*0.42, R=Math.min(86, h*0.40);
  const total=rows.reduce((s,r)=>s+r[1],0);
  let a0=-Math.PI/2;
  rows.forEach((r,i)=>{
    const frac=r[1]/total;
    const a1=a0+frac*Math.PI*2;
    const on=isSel(r);
    ctx.beginPath(); ctx.arc(cx,cy,R*0.52,a0,a1); ctx.arc(cx,cy,R,a1,a0,true); ctx.closePath();
    ctx.fillStyle=r[2]+(on?'':'33'); ctx.fill();
    ctx.strokeStyle=AB.PAL.paper; ctx.lineWidth=2; ctx.stroke();
    const am=(a0+a1)/2;
    const tx=cx+Math.cos(am)*R*0.78, ty=cy+Math.sin(am)*R*0.78;
    if (on && frac>0.05){
      AB.text(ctx,espan(r[1],0)+' %', tx, ty, {size:9,weight:'700',color:r[2]});
    }
    a0=a1;
  });
  ctx.beginPath(); ctx.arc(cx,cy,R*0.32,0,Math.PI*2); ctx.fillStyle=AB.PAL.paper; ctx.fill();
  AB.text(ctx,'Q_t ≈ 5 L/min', cx, cy-6, {size:9,weight:'700',color:AB.PAL.ink});
  AB.text(ctx,'sangre total', cx, cy+8, {size:7,color:AB.PAL.ink3});
  // leyenda
  let ly=h*0.06;
  rows.forEach((r,i)=>{
    const on=isSel(r);
    const x=w*0.56;
    ctx.fillStyle=r[2]+(on?'':'44'); ctx.fillRect(x,ly,10,10);
    AB.text(ctx,r[0], x+16, ly+5, {size:8,align:'left',color:on?AB.PAL.ink:AB.PAL.ink3,weight:on?'700':'400'});
    AB.text(ctx,espan(r[1],0)+' %', x+w*0.32, ly+5, {size:8,align:'right',color:on?r[2]:AB.PAL.ink3,weight:'700'});
    ly+=h*0.115;
  });
  AB.text(ctx,'La sangre vive en las venas: 50 % · no en el corazón', w/2, h*0.92, {size:8,color:AB.PAL.ink3});
  out('ds_out', sel==='all'?'Q ≈ 5 L/min · 50 % en venas':(rows.find(r=>isSel(r))||[sel,'?',''])[1]+' % del volumen');
}

// ═══════════════════════════════════════════════════════════════════════════
//  S2 · Onda de presión: sistólica, diastólica, media
// ═══════════════════════════════════════════════════════════════════════════
export const drawWave: Draw = (dc, p, f, out) => {
  const { ctx, w, h } = dc;
const SYS=Math.max(100,Math.min(180,p.pm_sys||120));
  const DIA=Math.max(50,Math.min(110,p.pm_dia||80));
  out('pm_sysv', espan(SYS,0));
  out('pm_diav', espan(DIA,0));
  const MEAN=(SYS+2*DIA)/3, PUL=SYS-DIA;
  const lx=w*0.10, lw=w*0.80, gy=h*0.12, gH=h*0.58;
  const P0=40, P1=200;
  const Y=p=>gy+gH*(1-(p-P0)/(P1-P0));
  function waveP(t){
    if (t<0.12) return DIA+(SYS-DIA)*(t/0.12);
    if (t<0.34) return SYS-(SYS-DIA)*0.04*((t-0.12)/0.22);
    if (t<0.40) return SYS*0.88+(SYS-DIA)*0.04*((0.40-t)/0.06)*0;
    if (t<0.48) return SYS*0.88+8*((t-0.40)/0.08);
    if (t<0.52) return SYS*0.96-14*((t-0.48)/0.04);
    const td=(t-0.52)/0.48;
    return DIA+(SYS*0.90-DIA)*Math.exp(-2.1*td);
  }
  // ejes
  ctx.strokeStyle=AB.PAL.line; ctx.lineWidth=1.2;
  ctx.beginPath(); ctx.moveTo(lx,gy); ctx.lineTo(lx,gy+gH); ctx.lineTo(lx+lw,gy+gH); ctx.stroke();
  [DIA,MEAN,SYS].forEach(v=>{
    const y=Y(v);
    AB.dashed(ctx,lx,y,lx+lw,y,{color:v===MEAN?AB.PAL.amber:AB.PAL.line});
    AB.text(ctx,espan(v,0)+' mmHg', lx-6, y, {size:8,align:'right',weight:v===MEAN?'700':'400',color:v===MEAN?AB.PAL.amber:AB.PAL.ink3});
  });
  // onda
  ctx.strokeStyle=AB.PAL.blood; ctx.lineWidth=2.6;
  ctx.beginPath();
  for(let i=0;i<=160;i++){
    const x=lx+i/160*lw, y=Y(waveP(i/160));
    i?ctx.lineTo(x,y):ctx.moveTo(x,y);
  }
  ctx.stroke();
  // sombreado área media
  ctx.fillStyle='rgba(154,91,0,.14)';
  ctx.beginPath();
  for(let i=0;i<=160;i++){
    const x=lx+i/160*lw, y=Y(waveP(i/160));
    i?ctx.lineTo(x,y):ctx.moveTo(x,y);
  }
  ctx.lineTo(lx+lw,Y(MEAN)); ctx.lineTo(lx,Y(MEAN)); ctx.closePath(); ctx.fill();
  // etiquetas de fase
  AB.text(ctx,'sístole', lx+lw*0.24, gy-12, {size:8,color:AB.PAL.blood});
  AB.text(ctx,'diástole', lx+lw*0.72, gy-12, {size:8,color:AB.PAL.teal});
  AB.text(ctx,'incisura', lx+lw*0.51, Y(SYS*0.94)-12, {size:7,color:AB.PAL.ink3});
  AB.text(ctx,'P_media = (P_sist + 2·P_dias)/3', w/2, h*0.90, {size:8,color:AB.PAL.ink3});
  out('pm_out', 'P_media ≈ '+espan(MEAN,0)+' mmHg · P_pulso '+espan(PUL,0));
}

// ═══════════════════════════════════════════════════════════════════════════
//  S3 · Columna hidrostática: ΔP = ρ·g·h
// ═══════════════════════════════════════════════════════════════════════════
export const drawGravity: Draw = (dc, p, f, out) => {
  const { ctx, w, h } = dc;
const hh=Math.max(-1.4,Math.min(0.5,p.gv_h||0));
  out('gv_hv', espan(hh,2)+' m');
  const RHO=1060, G=9.8;
  const dP_hidro=hh<0?-RHO*G*(-hh):RHO*G*hh;      // Pa
  const dP_mm=dP_hidro/133.322;
  const P_art=100+dP_mm;
  // figura vertical (silueta cabeza-corazón-pies)
  const scx=w*0.30, scy=h*0.46, su=h/3.1;
  ctx.strokeStyle=AB.PAL.ink3; ctx.lineWidth=1.6;
  // columna de referencia
  ctx.setLineDash([4,4]);
  ctx.beginPath(); ctx.moveTo(w*0.62, scy-su*0.62); ctx.lineTo(w*0.62, scy+su*1.15); ctx.stroke();
  ctx.setLineDash([]);
  AB.text(ctx,'0,5 m', w*0.66, scy-su*0.62, {size:7,color:AB.PAL.ink3,align:'left'});
  AB.text(ctx,'−1,4 m', w*0.66, scy+su*1.15, {size:7,color:AB.PAL.ink3,align:'left'});
  AB.text(ctx,'(corazón)', w*0.66, scy, {size:7,color:AB.PAL.ink3,align:'left'});
  // corazón (círculo rojo) en scy
  ctx.beginPath(); ctx.arc(scx,scy,9,0,Math.PI*2); ctx.fillStyle=AB.PAL.blood; ctx.fill();
  ctx.strokeStyle=AB.PAL.blood; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(scx+9,scy); ctx.lineTo(scx+30,scy); ctx.stroke();
  AB.text(ctx,'corazón · P ≈ 100 mmHg', scx+34, scy, {size:8,align:'left',color:AB.PAL.blood,weight:'700'});
  // cabeza
  ctx.fillStyle=AB.PAL.skin; ctx.strokeStyle=AB.PAL.skinEdge; ctx.lineWidth=1.4;
  ctx.beginPath(); ctx.arc(scx,scy-su*0.72,14,0,Math.PI*2); ctx.fill(); ctx.stroke();
  AB.text(ctx,'cerebro', scx+18, scy-su*0.72, {size:8,align:'left',color:AB.PAL.ink3});
  AB.text(ctx,'P = '+espan(100-0.4*79,0)+' mmHg', scx, scy-su*0.72-18, {size:8,color:AB.PAL.teal,weight:'700'});
  // pies
  ctx.fillStyle=AB.PAL.skin; ctx.strokeStyle=AB.PAL.skinEdge;
  ctx.beginPath(); ctx.ellipse(scx,scy+su*1.15,16,7,0,0,Math.PI*2); ctx.fill(); ctx.stroke();
  AB.text(ctx,'pies', scx+18, scy+su*1.15, {size:8,align:'left',color:AB.PAL.ink3});
  AB.text(ctx,'P = '+espan(100+1.3*79,0)+' mmHg', scx, scy+su*1.15+18, {size:8,color:AB.PAL.teal,weight:'700'});
  // marcador del nivel actual
  const my=scy - (hh*su/1.0)*1.15*1.3;  // hh +0.5 arriba, −1.4 abajo
  const markerY = scy - hh*su*0.55;
  ctx.beginPath(); ctx.arc(scx, markerY, 5, 0, Math.PI*2);
  ctx.fillStyle=AB.PAL.amber; ctx.strokeStyle=AB.PAL.amber; ctx.lineWidth=2;
  ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(scx+5, markerY); ctx.lineTo(w*0.62, markerY); ctx.strokeStyle=AB.PAL.amber; ctx.stroke();
  AB.text(ctx,'nivel actual', w*0.64, markerY-4, {size:7,color:AB.PAL.amber,align:'left'});
  AB.text(ctx,'ΔP = ρ·g·h = 79 mmHg por metro', w/2, h*0.90, {size:8,color:AB.PAL.ink3});
  out('gv_out', 'P_art ≈ '+espan(P_art,0)+' mmHg · ΔP_hidro = '+espan(dP_mm,0));
}

// ═══════════════════════════════════════════════════════════════════════════
//  S4 · Perfil de presión: dónde se pierde la presión
// ═══════════════════════════════════════════════════════════════════════════
export const drawProfile: Draw = (dc, p, f, out) => {
  const { ctx, w, h } = dc;
const Q=Math.max(40,Math.min(120,p.pf_q||80));
  out('pf_qv', espan(Q,0)+' cm³/s');
  const k=Q/80;
  const segs=[
    ['Aorta',0.025],
    ['Arterias grandes',1.4],
    ['Arteriolas',91],
    ['Capilares',8.2],
    ['Venas',5],
  ];
  // escalera acumulada (empezando en 100)
  const lx=w*0.14, lw=w*0.74, gy=h*0.10, gH=h*0.56;
  const Y=p=>gy+gH*(1-p/100);
  ctx.strokeStyle=AB.PAL.line; ctx.lineWidth=1.2;
  ctx.beginPath(); ctx.moveTo(lx,gy); ctx.lineTo(lx,gy+gH); ctx.lineTo(lx+lw,gy+gH); ctx.stroke();
  [0,50,100].forEach(v=>{
    const y=Y(v);
    AB.dashed(ctx,lx,y,lx+lw,y,{color:AB.PAL.line});
    AB.text(ctx,espan(v,0), lx-6, y, {size:8,color:AB.PAL.ink3,align:'right'});
  });
  let P=100;
  const bw=lw/segs.length;
  ctx.fillStyle=AB.PAL.blood;
  ctx.beginPath(); ctx.moveTo(lx, Y(100));
  let x=lx;
  segs.forEach((s,i)=>{
    const dP=s[1]*k;
    P-=dP;
    const x0=x;
    x+=bw;
    ctx.lineTo(x0, Y(P)); ctx.lineTo(x, Y(P));
    const c=i===2?AB.PAL.blood:(i===0||i===1?AB.PAL.blood:AB.PAL.tealLight);
    ctx.strokeStyle=c; ctx.lineWidth=2.4;
    ctx.stroke();
    ctx.fillStyle=c; ctx.beginPath(); ctx.moveTo(x0,Y(P)); ctx.lineTo(x0,Y(P+dP));
    ctx.lineTo(x,Y(P+dP)); ctx.lineTo(x,Y(P)); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x0,Y(P)); ctx.lineTo(x,Y(P));
    ctx.strokeStyle=c; ctx.lineWidth=1; ctx.stroke();
    AB.text(ctx,s[0], x0+bw/2, gy+gH+12, {size:7,color:i===2?AB.PAL.blood:AB.PAL.ink3,weight:i===2?'700':'400'});
    if (s[1]*k>6) AB.text(ctx,espan(s[1]*k,1)+' mmHg', x0+bw/2, Y(P+dP)+10, {size:8,color:c,weight:'700'});
    ctx.strokeStyle=AB.PAL.line; ctx.lineWidth=1.2;
  });
  AB.text(ctx,'P_entra ≈ 100 mmHg', lx, Y(100)-10, {size:8,color:AB.PAL.ink,weight:'700'});
  AB.text(ctx,'las arteriolas se llevan la caída (R ∝ 1/r⁴)', w/2, h*0.90, {size:8,color:AB.PAL.ink3});
  out('pf_out', 'arteriolas: ΔP = '+espan(91*k,0)+' mmHg');
}

// ═══════════════════════════════════════════════════════════════════════════
//  S5 · Continuidad: u = Q/A por cada nivel
// ═══════════════════════════════════════════════════════════════════════════
export const drawVelocity: Draw = (dc, p, f, out) => {
  const { ctx, w, h } = dc;
const Q=Math.max(30,Math.min(150,p.vl_q||90));
  out('vl_qv', espan(Q,0)+' cm³/s');
  const A=[3,4000,18];
  const u=Q/A.map(a=>Q/a);  // cm/s
  const labels=['aorta','capilares','vena cava'];
  const cols=[AB.PAL.blood,AB.PAL.teal,AB.PAL.amber];
  // tres tubos horizontales con partículas a velocidad ∝ u
  const y0=h*0.14, tubeH=h*0.16;
  for (let i=0;i<3;i++){
    const y=y0+i*(tubeH+h*0.06);
    const L=w*0.84;
    // tubo
    ctx.strokeStyle=cols[i]; ctx.lineWidth=1.8;
    ctx.beginPath(); ctx.moveTo(w*0.10,y); ctx.lineTo(w*0.94,y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(w*0.10,y+tubeH); ctx.lineTo(w*0.94,y+tubeH); ctx.stroke();
    // partículas: espaciado inverso a velocidad
    const speed=u[i]/30; // relativa a aorta a Q=90 → 1
    const n=Math.max(4,Math.min(22,Math.round(18/speed)));
    ctx.fillStyle=cols[i];
    for(let j=0;j<n;j++){
      const px=w*0.12+j*(L-0.04*w)/n;
      const bob=Math.sin(j*1.7)*3;
      ctx.beginPath(); ctx.arc(px,y+tubeH/2+bob,3.2,0,Math.PI*2); ctx.fill();
    }
    AB.text(ctx,labels[i], w*0.10-8, y+tubeH/2, {size:8,align:'right',color:cols[i],weight:'700'});
    AB.text(ctx,'A = '+espan(A[i],0)+' cm² · u = '+espan(u[i],3)+' cm/s', w*0.52, y+tubeH/2, {size:8,align:'center',color:AB.PAL.ink});
  }
  AB.text(ctx,'Q = A·u constante: a mayor área total, menor velocidad', w/2, h*0.92, {size:8,color:AB.PAL.ink3});
  out('vl_out', 'aorta '+espan(u[0],0)+' · capilares '+espan(u[1],3)+' · vena cava '+espan(u[2],1)+' cm/s');
}

// ═══════════════════════════════════════════════════════════════════════════
//  S6 · Reynolds: laminar ↔ turbulento
// ═══════════════════════════════════════════════════════════════════════════
export const drawReynolds: Draw = (dc, p, f, out) => {
  const { ctx, w, h } = dc;
const u=Math.max(0,Math.min(1,p.re_u||0.3));
  out('re_uv', espan(u*100,0)+' cm/s');
  const RHO=1060, d=0.025, ETA=0.004;
  const Re=RHO*u*d/ETA;
  const turb=Math.max(0,Math.min(1,(Re-1400)/1400)); // 0 laminar → 1 turbulento
  const t=f.reT||0;
  const y0=h*0.10, tubeH=h*0.30;
  // tubo
  ctx.strokeStyle=AB.PAL.ink3; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(w*0.08,y0); ctx.lineTo(w*0.92,y0); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(w*0.08,y0+tubeH); ctx.lineTo(w*0.92,y0+tubeH); ctx.stroke();
  AB.text(ctx,'flujo', w*0.08, y0-10, {size:8,color:AB.PAL.ink3});
  // 5 líneas de corriente
  const nL=5;
  for(let k=0;k<nL;k++){
    const fy=y0+tubeH*(k+0.5)/nL;
    ctx.strokeStyle=AB.PAL.teal+(turb>0.35?'':'44');
    ctx.lineWidth=1.2;
    ctx.beginPath();
    for(let i=0;i<=48;i++){
      const x=w*0.08+i/48*(w*0.84);
      const y=fy+ (turb>0 ? Math.sin(x*0.05*Re/2000 + t*6 + k*1.3)*(turb*8) : 0);
      i?ctx.lineTo(x,y):ctx.moveTo(x,y);
    }
    ctx.stroke();
  }
  // partículas arrastradas
  const nP=12;
  ctx.fillStyle=turb>0.35?AB.PAL.amber:AB.PAL.teal;
  for(let i=0;i<nP;i++){
    const ph=(i/nP + t*0.35*(0.3+u))*1;
    const px=w*0.08+((ph%1)+1)%1*(w*0.84);
    const py=y0+tubeH*(0.3+0.4*Math.sin(ph*Math.PI*2));
    ctx.beginPath(); ctx.arc(px,py,3,0,Math.PI*2); ctx.fill();
  }
  // indicador Re
  const gx=w*0.14, gw=w*0.72, gy=h*0.62, gh=h*0.20;
  ctx.strokeStyle=AB.PAL.line; ctx.lineWidth=1.2;
  ctx.beginPath(); ctx.moveTo(gx,gy); ctx.lineTo(gx+gw,gy); ctx.stroke();
  [0,2000,4000,6000].forEach(v=>{
    const x=gx+gw*v/6000;
    ctx.beginPath(); ctx.moveTo(x,gy-4); ctx.lineTo(x,gy+4); ctx.stroke();
    AB.text(ctx,espan(v,0), x, gy+14, {size:7,color:AB.PAL.ink3});
  });
  const mx=gx+gw*Math.min(1,Re/6000);
  ctx.beginPath(); ctx.moveTo(mx,gy-12); ctx.lineTo(mx,gy); ctx.lineTo(mx-5,gy+8); ctx.lineTo(mx+5,gy+8); ctx.closePath();
  ctx.fillStyle=AB.PAL.amber; ctx.fill();
  AB.text(ctx,'R_e ≈ '+espan(Re,0), mx, gy-18, {size:9,weight:'700',color:AB.PAL.amber});
  AB.text(ctx,'R_e < 2000 laminar · R_e > 2000 turbulento (soplos)', w/2, h*0.90, {size:8,color:AB.PAL.ink3});
  out('re_out', 'R_e ≈ '+espan(Re,0)+(Re>2000?' · turbulento — soplo':Re>1400?' · transición':' · laminar'));
}

// ═══════════════════════════════════════════════════════════════════════════
//  S7 · Resistencia vascular R ∝ 1/r⁴
// ═══════════════════════════════════════════════════════════════════════════
export const drawResVasc: Draw = (dc, p, f, out) => {
  const { ctx, w, h } = dc;
const r=Math.max(0.3,Math.min(3,p.rv_r||1));
  out('rv_rv', espan(r,2));
  const lx=w*0.12, lw=w*0.76, gy=h*0.16, gH=h*0.52;
  const X=x=>lx+lw*(x-0.3)/2.7;
  // R = 1/r⁴, log y para ver el rango
  const YR=R=>gy+gH*(1-Math.log10(Math.max(R,1))/4);
  ctx.strokeStyle=AB.PAL.line; ctx.lineWidth=1.2;
  ctx.beginPath(); ctx.moveTo(lx,gy); ctx.lineTo(lx,gy+gH); ctx.lineTo(lx+lw,gy+gH); ctx.stroke();
  [1,10,100,1000,10000].forEach(v=>{
    const y=YR(v);
    AB.dashed(ctx,lx,y,lx+lw,y,{color:AB.PAL.line});
    AB.text(ctx,'10⁴'===v?'10⁴':'10'+espan(Math.log10(v),0), lx-6, y, {size:7,color:AB.PAL.ink3,align:'right'});
  });
  // curva 1/r⁴
  ctx.strokeStyle=AB.PAL.teal; ctx.lineWidth=2.4;
  ctx.beginPath();
  for(let i=0;i<=80;i++){
    const xr=0.3+i/80*2.7;
    const x=X(xr), y=YR(1/Math.pow(xr,4));
    i?ctx.lineTo(x,y):ctx.moveTo(x,y);
  }
  ctx.stroke();
  AB.text(ctx,'R(r) = R₀·(r₀/r)⁴', lx+lw, gy-8, {size:8,color:AB.PAL.teal,align:'right',weight:'700'});
  // marcador
  const Rrel=1/Math.pow(r,4);
  const mx=X(r), my=YR(Rrel);
  ctx.beginPath(); ctx.arc(mx,my,5,0,Math.PI*2); ctx.fillStyle=AB.PAL.amber; ctx.fill();
  ctx.strokeStyle=AB.PAL.amber; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(mx,my); ctx.lineTo(mx,gy+gH); ctx.stroke();
  AB.text(ctx,'r = '+espan(r,2), mx, gy+gH+16, {size:9,weight:'700',color:AB.PAL.amber});
  AB.text(ctx,'R = '+espan(Rrel,0)+'×R₀', mx+14, my-10, {size:9,weight:'700',color:AB.PAL.amber,align:'left'});
  AB.text(ctx,'r ↓ a la mitad → R ×16 → Q /16', w/2, h*0.88, {size:8,color:AB.PAL.ink3});
  out('rv_out', 'R_rel = '+espan(Rrel,2)+' (r = '+espan(r,2)+')');
}

// ═══════════════════════════════════════════════════════════════════════════
//  S8 · Ley de Laplace: T = ΔP·R
// ═══════════════════════════════════════════════════════════════════════════
export const drawWall: Draw = (dc, p, f, out) => {
  const { ctx, w, h } = dc;
const R=Math.max(0.1,Math.min(2.5,p.pl_r||1.2));
  const P=Math.max(10,Math.min(120,p.pl_p||100));
  out('pl_rv', espan(R,2)+' cm');
  out('pl_pv', espan(P,0)+' mmHg');
  const T=P*1333.22*R;              // dina/cm
  const th=Math.max(3,Math.min(16,R*9));  // grosor visual
  const cx=w*0.30, cy=h*0.46;
  const sr=Math.min(95,Math.max(26,R*48));
  // pared
  ctx.beginPath(); ctx.arc(cx,cy,sr,0,Math.PI*2); ctx.fillStyle=AB.PAL.card; ctx.fill();
  ctx.beginPath(); ctx.arc(cx,cy,sr,0,Math.PI*2); ctx.strokeStyle=AB.PAL.blood; ctx.lineWidth=th; ctx.stroke();
  // flechas de tensión tangencial
  for(let i=0;i<8;i++){
    const a=i/8*Math.PI*2;
    const px=cx+Math.cos(a)*sr, py=cy+Math.sin(a)*sr;
    const tang=a+Math.PI/2;
    AB.arrow(ctx, px-Math.cos(tang)*16, py-Math.sin(tang)*16, px+Math.cos(tang)*16, py+Math.sin(tang)*16, {color:AB.PAL.blood,width:2});
  }
  // presión interna
  AB.arrow(ctx, cx-10, cy-14, cx+10, cy-14, {color:AB.PAL.teal,width:2.2});
  AB.text(ctx,'ΔP = '+espan(P,0)+' mmHg', cx, cy-26, {size:9,weight:'700',color:AB.PAL.teal});
  AB.text(ctx,'T = ΔP·R', cx, cy+10, {size:8,color:AB.PAL.ink});
  AB.text(ctx,'T = '+espan(T,0)+' dina/cm', cx, cy+26, {size:9,weight:'700',color:AB.PAL.blood});
  // escala de la aorta
  const ax=w*0.66, ay=h*0.18, aW=w*0.26, aH=h*0.42;
  ctx.strokeStyle=AB.PAL.line; ctx.lineWidth=1.2;
  ctx.beginPath(); ctx.moveTo(ax,ay); ctx.lineTo(ax,ay+aH); ctx.lineTo(ax+aW,ay+aH); ctx.stroke();
  [0,60000,160000].forEach(v=>{
    const y=ay+aH*(1-v/160000);
    AB.dashed(ctx,ax,y,ax+aW,y,{color:AB.PAL.line});
    AB.text(ctx,espan(v,0), ax+aW+4, y, {size:7,color:AB.PAL.ink3,align:'left'});
  });
  AB.text(ctx,'T (dina/cm)', ax+aW/2, ay-8, {size:8,color:AB.PAL.ink3});
  const my=ay+aH*(1-Math.min(T,160000)/160000);
  ctx.beginPath(); ctx.arc(ax+aW+8,my,4,0,Math.PI*2); ctx.fillStyle=AB.PAL.amber; ctx.fill();
  AB.text(ctx,'aquí', ax+aW+15, my, {size:7,color:AB.PAL.amber,align:'left'});
  // vasos de referencia
  AB.text(ctx,'capilar: T = 16 · aorta: T = 160 000 dina/cm', w/2, h*0.90, {size:8,color:AB.PAL.ink3});
  out('pl_out', 'T = '+espan(T,0)+' dina/cm'+(R>1.5?' (arteria grande → aorta)':R<0.6?' (arteriola / capilar)':''));
}

// ═══════════════════════════════════════════════════════════════════════════
//  S9 · Intercambio capilar: fuerzas de Starling
// ═══════════════════════════════════════════════════════════════════════════
export const drawStarling: Draw = (dc, p, f, out) => {
  const { ctx, w, h } = dc;
const HA=Math.max(20,Math.min(50,p.st_ha||36));
  const HV=Math.max(5,Math.min(25,p.st_hv||15));
  const ONC=Math.max(15,Math.min(35,p.st_o||25));
  out('st_hav', espan(HA,0));
  out('st_hvv', espan(HV,0));
  out('st_ov', espan(ONC,0));
  const y0=h*0.12, tubeH=h*0.18;
  // capilar
  ctx.strokeStyle=AB.PAL.blood; ctx.lineWidth=2.4;
  ctx.beginPath(); ctx.moveTo(w*0.12,y0); ctx.lineTo(w*0.88,y0); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(w*0.12,y0+tubeH); ctx.lineTo(w*0.88,y0+tubeH); ctx.stroke();
  AB.text(ctx,'arteriolar', w*0.12, y0-8, {size:8,color:AB.PAL.ink3});
  AB.text(ctx,'venular', w*0.88, y0-8, {size:8,color:AB.PAL.ink3,align:'right'});
  // presión hidrostática (lineal de HA a HV) en mmHg
  const Y=p=>y0+tubeH/2+(25-p)*1.3;
  ctx.strokeStyle=AB.PAL.teal; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(w*0.12,Y(HA)); ctx.lineTo(w*0.88,Y(HV)); ctx.stroke();
  AB.text(ctx,'P_hidro: '+espan(HA,0)+' → '+espan(HV,0)+' mmHg', w*0.5, Y(HA)-14, {size:8,color:AB.PAL.teal,weight:'700'});
  // oncótica (plana)
  AB.dashed(ctx,w*0.12,Y(ONC),w*0.88,Y(ONC),{color:AB.PAL.amber,width:1.8});
  AB.text(ctx,'Π_oncótica = '+espan(ONC,0)+' mmHg', w*0.5, Y(ONC)+16, {size:8,color:AB.PAL.amber,weight:'700'});
  // flechas netas en cada extremo
  function net(x,Ph){
    const n=Ph-ONC;
    if (Math.abs(n)<0.5) return;
    const dir=n>0?-1:1;   // >0 filtra (sale), <0 reabsorbe (entra)
    AB.arrow(ctx, x, y0+tubeH/2-dir*4, x, y0+tubeH/2+dir*26, {color:n>0?AB.PAL.blood:AB.PAL.teal,width:2.4});
    AB.text(ctx,(n>0?'filtra +':'reabsorbe ')+espan(Math.abs(n),0)+' mmHg', x, y0+tubeH/2+dir*38, {size:8,weight:'700',color:n>0?AB.PAL.blood:AB.PAL.teal});
  }
  net(w*0.12, HA);
  net(w*0.88, HV);
  AB.text(ctx,'extremo arteriolar: filtra · venular: reabsorbe · linfáticos recogen el resto', w/2, h*0.90, {size:8,color:AB.PAL.ink3});
  out('st_out', 'neto: +'+espan(HA-ONC,0)+' (filtra) · '+(HV-ONC<0?'−'+espan(Math.abs(HV-ONC),0)+' (reabsorbe)':'+'+espan(HV-ONC,0)+' (filtra)'));
}

// ═══════════════════════════════════════════════════════════════════════════
//  S10 · Fick: VO₂ = Q·(p_a − p_v)
// ═══════════════════════════════════════════════════════════════════════════
export const drawFick: Draw = (dc, p, f, out) => {
  const { ctx, w, h } = dc;
const Q=Math.max(3,Math.min(25,p.fk_q||5));
  const D=Math.max(20,Math.min(160,p.fk_d||50));
  out('fk_qv', espan(Q,1)+' L/min');
  out('fk_dv', espan(D,0)+' mL/L');
  const VO2=Q*D;
  const pa=200, pv=pa-D;
  const lx=w*0.12, lw=w*0.60, y0=h*0.20, barh=h*0.20, gap=h*0.24;
  const X=c=>lx+lw*(c-pv)/(pa-pv||1);
  // barras de contenido O2
  function bar(x,y,v,col,lab){
    const bw2=26;
    ctx.fillStyle=col; ctx.fillRect(x-bw2/2,y,bw2,barh);
    AB.text(ctx,lab, x, y+barh+16, {size:8,color:col,weight:'700'});
    AB.text(ctx,espan(v,0)+' mL/L', x, y+barh+28, {size:8,color:AB.PAL.ink3});
  }
  bar(X(pv), y0, pv, AB.PAL.teal, 'venosa');
  bar(X(pa), y0, pa, AB.PAL.blood, 'arterial');
  // eje
  ctx.strokeStyle=AB.PAL.line; ctx.lineWidth=1.2;
  ctx.beginPath(); ctx.moveTo(lx,y0); ctx.lineTo(lx,y0+barh); ctx.lineTo(X(pa)+26,y0+barh); ctx.stroke();
  AB.text(ctx,'contenido de O₂ (mL/L)', lx, y0-10, {size:8,color:AB.PAL.ink3});
  // diferencia resaltada
  const dx1=X(pv), dx2=X(pa);
  ctx.fillStyle='rgba(154,91,0,.15)';
  ctx.fillRect(dx1, y0+barh, dx2-dx1, 5);
  AB.arrow(ctx, dx1, y0+barh+10, dx2, y0+barh+10, {color:AB.PAL.amber,width:2.4});
  AB.text(ctx,'p_a − p_v = '+espan(D,0)+' mL O₂/L', (dx1+dx2)/2, y0+barh+24, {size:8,color:AB.PAL.amber,weight:'700'});
  // rectángulo VO2: Q × Δa-v
  const vx=w*0.16, vy=h*0.62, vw=w*0.20, vh=h*0.18;
  const qw=vw*(Q-3)/(25-3);
  ctx.fillStyle='rgba(13,110,100,.16)'; ctx.fillRect(vx,vy,qw,vh);
  ctx.strokeStyle=AB.PAL.teal; ctx.lineWidth=1.4;
  ctx.strokeRect(vx,vy,qw,vh);
  AB.text(ctx,'VO₂ = Q × (p_a−p_v)', vx+vw/2, vy-10, {size:8,color:AB.PAL.teal,weight:'700'});
  AB.text(ctx,espan(VO2,0)+' mL O₂/min', vx+vw/2, vy+vh/2, {size:10,weight:'700',color:AB.PAL.teal});
  AB.text(ctx,'Q = '+espan(Q,1)+' L/min', vx+vw/2, vy+vh+14, {size:8,color:AB.PAL.ink3});
  AB.text(ctx,'reposo: ~250 mL/min · ejercicio: hasta 4 L/min', w/2, h*0.92, {size:8,color:AB.PAL.ink3});
  out('fk_out', 'V̇O₂ = '+espan(VO2,0)+' mL/min');
}

// ═══════════════════════════════════════════════════════════════════════════
//  S11 · Lazo P–V y trabajo del corazón
// ═══════════════════════════════════════════════════════════════════════════
export const drawPVLoop: Draw = (dc, p, f, out) => {
  const { ctx, w, h } = dc;
const VED=Math.max(100,Math.min(220,p.pv_ed||140));
  const PSA=Math.max(80,Math.min(140,p.pv_pa||100));
  const CT=Math.max(0.5,Math.min(1.5,p.pv_ct||1));
  out('pv_edv', espan(VED,0)+' mL');
  out('pv_pav', espan(PSA,0)+' mmHg');
  out('pv_ctv', espan(CT,1));
  const Vd=40, E=5;
  const VES=Math.max(Vd+10, Vd+PSA/(E*CT));
  const P_edp=V=>0.001*Math.pow(V-Vd,2);
  // coordenadas
  const lx=w*0.12, lw=w*0.58, gy=h*0.10, gH=h*0.60;
  const V0=50, V1=240, P1=150;
  const X=v=>lx+lw*(v-V0)/(V1-V0);
  const Y=p=>gy+gH*(1-p/P1);
  // ejes
  ctx.strokeStyle=AB.PAL.line; ctx.lineWidth=1.2;
  ctx.beginPath(); ctx.moveTo(lx,gy); ctx.lineTo(lx,gy+gH); ctx.lineTo(lx+lw,gy+gH); ctx.stroke();
  [0,50,100,150].forEach(v=>{
    AB.dashed(ctx,lx,Y(v),lx+lw,Y(v),{color:AB.PAL.line});
    AB.text(ctx,espan(v,0), lx-6, Y(v), {size:7,color:AB.PAL.ink3,align:'right'});
  });
  [50,100,150,200,240].forEach(v=>{
    const x=X(v);
    AB.dashed(ctx,x,gy,x,gy+gH,{color:AB.PAL.line});
    AB.text(ctx,espan(v,0), x, gy+gH+12, {size:7,color:AB.PAL.ink3});
  });
  AB.text(ctx,'V (mL)', lx+lw, gy+gH+12, {size:8,color:AB.PAL.ink3,align:'right'});
  AB.text(ctx,'P (mmHg)', lx-10, gy-10, {size:8,color:AB.PAL.ink3});
  // EDPVR
  ctx.strokeStyle=AB.PAL.teal; ctx.lineWidth=1.8;
  ctx.beginPath();
  for(let i=0;i<=40;i++){
    const v=Vd+ (V1-Vd)*i/40;
    const x=X(v), y=Y(P_edp(v));
    i?ctx.lineTo(x,y):ctx.moveTo(x,y);
  }
  ctx.stroke();
  // ESPVR (recta)
  ctx.strokeStyle=AB.PAL.amber; ctx.lineWidth=1.8;
  ctx.beginPath(); ctx.moveTo(X(Vd),Y(0)); ctx.lineTo(X(V1),Y(E*CT*(V1-Vd))); ctx.stroke();
  AB.text(ctx,'ESPVR', X(V1)+2, Y(E*CT*(V1-Vd))-4, {size:7,color:AB.PAL.amber,align:'left'});
  AB.text(ctx,'EDPVR', X(Vd)+6, Y(P_edp(Vd+6)), {size:7,color:AB.PAL.teal,align:'left'});
  // esquinas del lazo
  const A=[VES,P_edp(VES)], B=[VED,P_edp(VED)], C=[VED,PSA], D=[VES,PSA];
  // área de trabajo (sombreado)
  ctx.fillStyle='rgba(169,42,30,.16)';
  ctx.beginPath(); ctx.moveTo(X(A[0]),Y(A[1])); ctx.lineTo(X(B[0]),Y(B[1])); ctx.lineTo(X(C[0]),Y(C[1]));
  ctx.lineTo(X(D[0]),Y(D[1])); ctx.closePath(); ctx.fill();
  // contorno del lazo
  ctx.strokeStyle=AB.PAL.blood; ctx.lineWidth=2.4;
  ctx.beginPath();
  ctx.moveTo(X(A[0]),Y(A[1])); ctx.lineTo(X(B[0]),Y(B[1])); ctx.lineTo(X(C[0]),Y(C[1]));
  ctx.quadraticCurveTo(X((VED+VES)/2), Y(PSA*1.06), X(D[0]),Y(D[1]));
  ctx.lineTo(X(A[0]),Y(A[1])); ctx.closePath(); ctx.stroke();
  // V_ED y V_ES
  AB.dashed(ctx,X(VED),gy,X(VED),Y(PSA),{color:AB.PAL.blood});
  AB.dashed(ctx,X(VES),gy,X(VES),Y(PSA),{color:AB.PAL.blood});
  AB.text(ctx,'V_ED', X(VED), Y(PSA)+16, {size:7,color:AB.PAL.blood,weight:'700'});
  AB.text(ctx,'V_ES', X(VES), Y(PSA)+16, {size:7,color:AB.PAL.blood,weight:'700'});
  // punto animado
  const ph=(f.pvT||0)%1;
  let px,py;
  const edges=[
    [A,B,0,0.25],[B,C,0.25,0.5],[C,D,0.5,0.78],[D,A,0.78,1]
  ];
  const ed=edges.find(e=>ph>=e[2]&&ph<e[3])||edges[3];
  const fr=(ph-ed[2])/(ed[3]-ed[2]);
  const P1v=ed[0], P2v=ed[1];
  if (ed[0]===C&&ed[1]===D){  // eyección curva
    px=X(P1v[0]+(P2v[0]-P1v[0])*fr); py=Y(PSA*(1.06-0.06*Math.sin(fr*Math.PI)));
  } else {
    px=X(P1v[0]+(P2v[0]-P1v[0])*fr); py=Y(P1v[1]+(P2v[1]-P1v[1])*fr);
  }
  if (f.pvPlaying){
    ctx.beginPath(); ctx.arc(px,py,5.5,0,Math.PI*2); ctx.fillStyle=AB.PAL.amber; ctx.fill();
    ctx.strokeStyle=AB.PAL.paper; ctx.lineWidth=1.5; ctx.stroke();
  }
  // trabajo
  const Vst=VED-VES;
  const areaML=PSA*Vst;                    // mmHg·mL aprox
  const J=areaML*1.33322e-4;
  const rect=[w*0.78,h*0.12,w*0.20,h*0.72];
  ctx.strokeStyle=AB.PAL.line; ctx.lineWidth=1.2;
  ctx.strokeRect(rect[0],rect[1],rect[2],rect[3]);
  AB.text(ctx,'trabajo por latido', rect[0]+rect[2]/2, rect[1]+16, {size:8,color:AB.PAL.ink,weight:'700'});
  AB.text(ctx,'W = ∫P dV', rect[0]+rect[2]/2, rect[1]+40, {size:8,color:AB.PAL.ink3});
  AB.text(ctx,espan(J,2)+' J', rect[0]+rect[2]/2, rect[1]+64, {size:13,weight:'700',color:AB.PAL.blood});
  AB.text(ctx,'V_stroke', rect[0]+rect[2]/2, rect[1]+90, {size:8,color:AB.PAL.ink3});
  AB.text(ctx,espan(Vst,0)+' mL', rect[0]+rect[2]/2, rect[1]+108, {size:10,weight:'700',color:AB.PAL.teal});
  AB.text(ctx,'W ≈ P_av·V_stroke', w/2, h*0.90, {size:8,color:AB.PAL.ink3});
  out('pv_out', 'W ≈ '+espan(J,1)+' J/latido · V_stroke ≈ '+espan(Vst,0)+' mL');
}

// ═══════════════════════════════════════════════════════════════════════════
//  S12 · Obstrucción: continuidad y Bernoulli
// ═══════════════════════════════════════════════════════════════════════════
export const drawObstruction: Draw = (dc, p, f, out) => {
  const { ctx, w, h } = dc;
const Ar=Math.max(0.1,Math.min(1,p.ob_a||0.33));
  out('ob_av', espan(Ar,2));
  const u1=30;  // cm/s aguas arriba
  const u2=u1/Ar;
  const RHO=1060;
  const dP=(0.5*RHO*(Math.pow(u2/100,2)-Math.pow(u1/100,2)))/133.322; // mmHg
  const y0=h*0.12, tubeH=h*0.20;
  const cx=w*0.5, neckW=w*0.18;
  function tubePath(){
    ctx.beginPath();
    ctx.moveTo(w*0.10,y0); ctx.lineTo(cx-neckW/2,y0);
    ctx.quadraticCurveTo(cx, y0+tubeH*0.18, cx+neckW/2,y0);
    ctx.lineTo(w*0.90,y0);
    ctx.lineTo(w*0.90,y0+tubeH);
    ctx.lineTo(cx+neckW/2,y0+tubeH);
    ctx.quadraticCurveTo(cx, y0+tubeH*0.82, cx-neckW/2,y0+tubeH);
    ctx.lineTo(w*0.10,y0+tubeH);
    ctx.closePath();
  }
  ctx.fillStyle='rgba(169,42,30,.06)';
  tubePath(); ctx.fill();
  ctx.strokeStyle=AB.PAL.blood; ctx.lineWidth=2.4;
  tubePath(); ctx.stroke();
  AB.text(ctx,'A₁', w*0.14, y0-8, {size:8,color:AB.PAL.ink3});
  AB.text(ctx,'A₂ = '+espan(Ar,2)+'·A₁', w*0.5, y0-10, {size:8,color:AB.PAL.blood,weight:'700'});
  // partículas: espaciado ∝ velocidad
  const t=(f.reT||0)*0.8;
  for(let i=0;i<14;i++){
    const ph=((i/14)+ (t*0.06)*(u2/30))%1;
    let x=w*0.10+ph*(w*0.80);
    let inNeck=Math.abs(x-cx)<neckW/2;
    const y=y0+tubeH/2+(Math.sin(i*2.1)*4);
    ctx.fillStyle=inNeck?AB.PAL.amber:AB.PAL.blood;
    ctx.beginPath(); ctx.arc(x,y,3,0,Math.PI*2); ctx.fill();
  }
  // perfil de presión inferior
  const py0=h*0.60, pH=h*0.20;
  ctx.strokeStyle=AB.PAL.line; ctx.lineWidth=1.2;
  ctx.beginPath(); ctx.moveTo(w*0.12,py0); ctx.lineTo(w*0.12,py0+pH); ctx.lineTo(w*0.88,py0+pH); ctx.stroke();
  const Px=p=>{
    const P0=100;
    // Bernoulli: presión cae en el cuello
    return P0 + dP*Math.exp(-Math.pow((p-cx)/(neckW*0.55),2))*0;
  };
  // traza con dip suave
  ctx.strokeStyle=AB.PAL.teal; ctx.lineWidth=2;
  ctx.beginPath();
  for(let i=0;i<=60;i++){
    const x=w*0.12+i/60*(w*0.76);
    const dip=dP*Math.exp(-Math.pow((x-cx)/(neckW*0.6),2));
    const y=py0+pH*(1-(100+dip)/100);
    i?ctx.lineTo(x,y):ctx.moveTo(x,y);
  }
  ctx.stroke();
  AB.text(ctx,'P', w*0.12-10, py0+pH/2, {size:8,color:AB.PAL.teal});
  AB.text(ctx,'dip de presión pos-estenosis (Bernoulli)', w/2, py0+pH+14, {size:8,color:AB.PAL.ink3});
  AB.text(ctx,'continuidad: u₂/u₁ = A₁/A₂', w/2, h*0.92, {size:8,color:AB.PAL.ink3});
  out('ob_out', 'u₂/u₁ = '+espan(u2/u1,1)+' · P₂−P₁ = '+espan(dP,1)+' mmHg');
}

// ═══════════════════════════════════════════════════════════════════════════
//  S13 · Bifurcación: fuerza sobre la pared (aneurismas)
// ═══════════════════════════════════════════════════════════════════════════
export const drawAneurysm: Draw = (dc, p, f, out) => {
  const { ctx, w, h } = dc;
const TH=Math.max(0,Math.min(80,p.an_t||45))*Math.PI/180;
  const AR=Math.max(0.3,Math.min(1,p.an_a||0.5));
  const U1=Math.max(20,Math.min(100,p.an_u||50))/100;  // m/s
  out('an_tv', espan(TH*180/Math.PI,0)+'°');
  out('an_av', espan(AR,2));
  out('an_uv', espan(U1*100,0)+' cm/s');
  const RHO=1060, r1=0.005, A1=Math.PI*r1*r1;
  // fuerza (módulo): F = ρ·A1·u1²·(1−cosθ)
  const Fp=RHO*A1*U1*U1*(1-Math.cos(TH));
  const Pp=U1>0?(RHO*U1*U1*(1-Math.cos(TH)))/133.322:0;  // mmHg
  const cx=w*0.30, cy=h*0.44;
  const L=w*0.42;
  // vaso padre (horizontal)
  ctx.strokeStyle=AB.PAL.blood; ctx.lineWidth=9; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(w*0.06,cy); ctx.lineTo(cx,cy); ctx.stroke();
  // flecha de entrada
  AB.arrow(ctx, w*0.08, cy, w*0.16, cy, {color:AB.PAL.blood,width:2.4});
  AB.text(ctx,'u₁ = '+espan(U1*100,0)+' cm/s', w*0.13, cy-14, {size:8,color:AB.PAL.blood,weight:'700'});
  // bifurcación a dos ramas
  const ang=TH;
  ctx.strokeStyle=AB.PAL.teal; ctx.lineWidth=8;
  ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx+L*Math.cos(ang), cy-L*Math.sin(ang)); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx+L*Math.cos(ang), cy+L*Math.sin(ang)); ctx.stroke();
  // flechas de salida
  AB.arrow(ctx, cx+L*Math.cos(ang)*0.4, cy-L*Math.sin(ang)*0.4, cx+L*Math.cos(ang)*0.7, cy-L*Math.sin(ang)*0.7, {color:AB.PAL.teal,width:2.2});
  AB.arrow(ctx, cx+L*Math.cos(ang)*0.4, cy+L*Math.sin(ang)*0.4, cx+L*Math.cos(ang)*0.7, cy+L*Math.sin(ang)*0.7, {color:AB.PAL.teal,width:2.2});
  AB.text(ctx,'θ = '+espan(TH*180/Math.PI,0)+'°', cx+L*Math.cos(ang)*0.75, cy-L*Math.sin(ang)*0.75-8, {size:8,color:AB.PAL.teal});
  // saco aneurismático (esfera) en el apex
  ctx.beginPath(); ctx.arc(cx,cy,16,0,Math.PI*2);
  ctx.fillStyle='rgba(169,42,30,.10)'; ctx.fill();
  ctx.strokeStyle=AB.PAL.blood; ctx.lineWidth=2; ctx.stroke();
  AB.text(ctx,'aneurisma', cx+20, cy-20, {size:7,color:AB.PAL.blood,align:'left'});
  // fuerza sobre la pared (flecha hacia la pared en el apex)
  const mag=Math.min(64, 6+Fp/1e-3*3);
  AB.arrow(ctx, cx-14, cy, cx-14-mag*Math.cos(TH*0.5), cy-mag*Math.sin(TH*0.5), {color:AB.PAL.amber,width:3});
  AB.text(ctx,'F_pared', cx-14-mag*0.6, cy-mag*0.6-8, {size:8,color:AB.PAL.amber,weight:'700'});
  AB.text(ctx,'F = ρ·Q·(u₂·cosθ − u₁)', w/2, h*0.78, {size:8,color:AB.PAL.ink3});
  AB.text(ctx,'la pared lateral paga la desviación del flujo', w/2, h*0.88, {size:8,color:AB.PAL.ink3});
  out('an_out', 'F_pared ≈ '+espan(Fp*1000,0)+' mN · P_pared ≈ '+espan(Pp,1)+' mmHg');
}

// ═══════════════════════════════════════════════════════════════════════════
//  S14 · Aneurisma pulsátil: resonancia
// ═══════════════════════════════════════════════════════════════════════════
export const drawPulsatile: Draw = (dc, p, f, out) => {
  const { ctx, w, h } = dc;
const Y=Math.max(0.3,Math.min(3,p.rp_y||1));
  const R=Math.max(0.5,Math.min(1.5,p.rp_r||1));
  const G=Math.max(0.05,Math.min(1.5,p.rp_g||0.25));
  out('rp_yv', espan(Y,1));
  out('rp_rv', espan(R,2));
  out('rp_gv', espan(G,2));
  const wp=1;                     // frecuencia del pulso (normalizada)
  const w0=Math.sqrt(Y/R);        // ω₀² = Y/(R·ρw), ρw = 1
  const denom=Math.pow(w0*w0-wp*wp,2)+Math.pow(G*wp,2);
  const Aamp=1/Math.sqrt(denom);  // amplificación adimensional
  const P0=0.08;                  // amplitud del pulso (ρw=1)
  const Adisp=P0*Aamp;
  // curva de resonancia
  const lx=w*0.10, lw=w*0.56, gy=h*0.14, gH=h*0.56;
  const X=w0v=>lx+lw*(w0v-0.3)/2.7;
  const YA=A=>gy+gH*(1-Math.log10(Math.max(A,0.3)+1)/2);
  ctx.strokeStyle=AB.PAL.line; ctx.lineWidth=1.2;
  ctx.beginPath(); ctx.moveTo(lx,gy); ctx.lineTo(lx,gy+gH); ctx.lineTo(lx+lw,gy+gH); ctx.stroke();
  [0.3,1,2,3].forEach(v=>{
    const x=X(v);
    AB.dashed(ctx,x,gy,x,gy+gH,{color:AB.PAL.line});
    AB.text(ctx,espan(v,1), x, gy+gH+12, {size:7,color:AB.PAL.ink3});
  });
  ctx.strokeStyle=AB.PAL.teal; ctx.lineWidth=2.2;
  ctx.beginPath();
  for(let i=0;i<=60;i++){
    const wv=0.3+i/60*2.7;
    const A=1/Math.sqrt(Math.pow(wv*wv-1,2)+Math.pow(G,2));
    const x=X(wv), y=YA(A);
    i?ctx.lineTo(x,y):ctx.moveTo(x,y);
  }
  ctx.stroke();
  AB.text(ctx,'A(ω₀)', lx+lw+6, gy-4, {size:7,color:AB.PAL.teal,align:'left'});
  AB.text(ctx,'resonancia', X(1), gy-12, {size:7,color:AB.PAL.amber,weight:'700'});
  // marcador actual
  const mx=X(w0), my=YA(Aamp);
  ctx.beginPath(); ctx.arc(mx,my,5,0,Math.PI*2); ctx.fillStyle=AB.PAL.amber; ctx.fill();
  AB.text(ctx,'ω₀ = '+espan(w0,2), mx, my-14, {size:8,weight:'700',color:AB.PAL.amber});
  // esfera que pulsa (derecha)
  const sx=w*0.82, sy=h*0.42, s0=Math.min(52,R*38);
  const t=(f.rpT||0)*1.5;
  const osc=f.rpPlaying?Math.cos(wp*t):1;
  const s=s0*Math.max(0.5,1+Adisp*osc);
  ctx.strokeStyle=AB.PAL.blood; ctx.lineWidth=2.6;
  ctx.beginPath(); ctx.arc(sx,sy,s,0,Math.PI*2); ctx.stroke();
  ctx.fillStyle='rgba(169,42,30,'+Math.min(0.18,0.06+Adisp*0.1)+')';
  ctx.beginPath(); ctx.arc(sx,sy,s,0,Math.PI*2); ctx.fill();
  // flecha de crecimiento
  if (f.rpPlaying){
    AB.arrow(ctx, sx, sy, sx, sy-s*0.85, {color:AB.PAL.amber,width:2.4});
  }
  AB.text(ctx,'esfera elástica', sx, sy+s+16, {size:8,color:AB.PAL.ink3});
  AB.text(ctx,'r_p(t) = A·cos(ω_p·t)', sx, sy+s+30, {size:7,color:AB.PAL.ink3});
  AB.text(ctx,'ρw·d²r/dt² = P_av + P_p·cos(ω_p t) − Y·r/R', w/2, h*0.88, {size:8,color:AB.PAL.ink3});
  const reso=Math.abs(w0-wp)<0.25*G;
  out('rp_out', 'ω₀/ω_p ≈ '+espan(w0/wp,2)+' · A ≈ '+espan(Aamp,1)+(reso?' · ¡RESONANCIA!':' · lejos de resonancia'));
}

// ═══════════════════════════════════════════════════════════════════════════
//  S15 · Estenosis: grados y estenosis crítica
// ═══════════════════════════════════════════════════════════════════════════
export const drawStenosis: Draw = (dc, p, f, out) => {
  const { ctx, w, h } = dc;
const S=Math.max(0,Math.min(100,p.es_s||50));
  out('es_sv', espan(S,0)+' %');
  const Q=S>75?Math.pow((100-S)/25,1.5):1;
  const grade=S<=39?'leve':S<=59?'moderada':S<=79?'grave':S<=99?'crítica':'ocluida';
  // vaso con estrechamiento
  const y0=h*0.10, tubeH=h*0.16;
  const cx=w*0.5;
  const neckW=w*0.14*(1-S/100*0.7)+w*0.03;
  ctx.fillStyle='rgba(169,42,30,.06)';
  ctx.beginPath();
  ctx.moveTo(w*0.10,y0); ctx.lineTo(cx-neckW/2,y0); ctx.lineTo(cx+neckW/2,y0); ctx.lineTo(w*0.90,y0);
  ctx.lineTo(w*0.90,y0+tubeH); ctx.lineTo(cx+neckW/2,y0+tubeH); ctx.lineTo(cx-neckW/2,y0+tubeH); ctx.lineTo(w*0.10,y0+tubeH);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle=AB.PAL.blood; ctx.lineWidth=2.2;
  ctx.stroke();
  AB.text(ctx,espan(S,0)+' % estrechamiento', cx, y0-10, {size:9,weight:'700',color:AB.PAL.blood});
  // curva Q vs %
  const lx=w*0.14, lw=w*0.72, gy=h*0.48, gH=h*0.34;
  const X=s=>lx+lw*s/100;
  const YQ=q=>gy+gH*(1-q);
  ctx.strokeStyle=AB.PAL.line; ctx.lineWidth=1.2;
  ctx.beginPath(); ctx.moveTo(lx,gy); ctx.lineTo(lx,gy+gH); ctx.lineTo(lx+lw,gy+gH); ctx.stroke();
  [0,25,50,75,100].forEach(v=>{
    const x=X(v);
    AB.dashed(ctx,x,gy,x,gy+gH,{color:AB.PAL.line});
    AB.text(ctx,espan(v,0), x, gy+gH+12, {size:7,color:AB.PAL.ink3});
  });
  [0,0.5,1].forEach(q=>{
    AB.dashed(ctx,lx,YQ(q),lx+lw,YQ(q),{color:AB.PAL.line});
    AB.text(ctx,espan(q,1), lx-6, YQ(q), {size:7,color:AB.PAL.ink3,align:'right'});
  });
  AB.text(ctx,'Q/Q₀', lx-8, gy-10, {size:8,color:AB.PAL.ink3});
  AB.text(ctx,'% estrechamiento', lx+lw/2, gy+gH+24, {size:8,color:AB.PAL.ink3});
  ctx.strokeStyle=AB.PAL.teal; ctx.lineWidth=2.4;
  ctx.beginPath();
  for(let i=0;i<=80;i++){
    const s=i/80*100;
    const q=s>75?Math.pow((100-s)/25,1.5):1;
    const x=X(s), y=YQ(q);
    i?ctx.lineTo(x,y):ctx.moveTo(x,y);
  }
  ctx.stroke();
  // estenosis crítica
  AB.dashed(ctx,X(75),gy,X(75),YQ(0),{color:AB.PAL.amber,width:1.4});
  AB.text(ctx,'crítica ~75 %', X(75), gy+14, {size:7,color:AB.PAL.amber,weight:'700'});
  // marcador
  const mx=X(S), my=YQ(Q);
  ctx.beginPath(); ctx.arc(mx,my,5,0,Math.PI*2); ctx.fillStyle=AB.PAL.amber; ctx.fill();
  ctx.strokeStyle=AB.PAL.amber; ctx.lineWidth=1.6;
  ctx.beginPath(); ctx.moveTo(mx,my); ctx.lineTo(mx,gy+gH); ctx.stroke();
  AB.text(ctx,espan(Q,2), mx+8, my-8, {size:8,weight:'700',color:AB.PAL.amber,align:'left'});
  AB.text(ctx,'el flujo se mantiene hasta ~75 % y luego se desploma', w/2, h*0.90, {size:8,color:AB.PAL.ink3});
  out('es_out', grade+' · Q/Q₀ ≈ '+espan(Q,2));
}

// ═══════════════════════════════════════════════════════════════════════════
//  S16 · Frank-Starling: V_stroke = f(precarga)
// ═══════════════════════════════════════════════════════════════════════════
export const drawFrank: Draw = (dc, p, f, out) => {
  const { ctx, w, h } = dc;
const PV=Math.max(0,Math.min(15,p.fs_pv||5));
  const F=Math.max(40,Math.min(160,p.fs_f||70));
  out('fs_pvv', espan(PV,1)+' mmHg');
  out('fs_fv', espan(F,0)+' /min');
  const KL=1.12, Qmax=14;
  const QL=Math.min(KL*PV, Qmax);
  const Vst=QL*1000/F;
  const lx=w*0.14, lw=w*0.72, gy=h*0.16, gH=h*0.54;
  const X=p=>lx+lw*p/15;
  const YQ=q=>gy+gH*(1-q/Qmax);
  ctx.strokeStyle=AB.PAL.line; ctx.lineWidth=1.2;
  ctx.beginPath(); ctx.moveTo(lx,gy); ctx.lineTo(lx,gy+gH); ctx.lineTo(lx+lw,gy+gH); ctx.stroke();
  [0,5,10,15].forEach(v=>{
    const x=X(v);
    AB.dashed(ctx,x,gy,x,gy+gH,{color:AB.PAL.line});
    AB.text(ctx,espan(v,0), x, gy+gH+12, {size:7,color:AB.PAL.ink3});
  });
  [0,7,14].forEach(q=>{
    AB.dashed(ctx,lx,YQ(q),lx+lw,YQ(q),{color:AB.PAL.line});
    AB.text(ctx,espan(q,0), lx-6, YQ(q), {size:7,color:AB.PAL.ink3,align:'right'});
  });
  AB.text(ctx,'Q_L (L/min)', lx-10, gy-10, {size:8,color:AB.PAL.ink3});
  AB.text(ctx,'P_pv (mmHg)', lx+lw/2, gy+gH+24, {size:8,color:AB.PAL.ink3});
  ctx.strokeStyle=AB.PAL.blood; ctx.lineWidth=2.4;
  ctx.beginPath();
  for(let i=0;i<=40;i++){
    const p=i/40*15;
    const q=Math.min(KL*p, Qmax);
    const x=X(p), y=YQ(q);
    i?ctx.lineTo(x,y):ctx.moveTo(x,y);
  }
  ctx.stroke();
  AB.text(ctx,'Q_L = K_L·P_pv', lx+lw, gy-8, {size:8,color:AB.PAL.blood,align:'right',weight:'700'});
  // marcador
  const mx=X(PV), my=YQ(QL);
  ctx.beginPath(); ctx.arc(mx,my,5,0,Math.PI*2); ctx.fillStyle=AB.PAL.amber; ctx.fill();
  AB.dashed(ctx,mx,gy,mx,my,{color:AB.PAL.amber,width:1.4});
  AB.text(ctx,'Q = '+espan(QL,1)+' L/min', mx+10, my-10, {size:9,weight:'700',color:AB.PAL.amber,align:'left'});
  AB.text(ctx,'V_stroke = Q/F', mx+10, my+10, {size:8,color:AB.PAL.ink3,align:'left'});
  AB.text(ctx,'Frank-Starling: el corazón bombea lo que recibe', w/2, h*0.90, {size:8,color:AB.PAL.ink3});
  out('fs_out', 'V_stroke ≈ '+espan(Vst,0)+' mL · Q ≈ '+espan(QL,1)+' L/min');
}

// ═══════════════════════════════════════════════════════════════════════════
//  S17 · Modelo de la circulación (8 subunidades)
// ═══════════════════════════════════════════════════════════════════════════
export const drawCircuit: Draw = (dc, p, f, out) => {
  const { ctx, w, h } = dc;
const RS=Math.max(10,Math.min(30,p.cc_rs||17.5));
  const CSV=Math.max(0.8,Math.min(2.5,p.cc_cv||1.75));
  out('cc_rsv', espan(RS,1));
  out('cc_cvv', espan(CSV,2));
  // parámetros del modelo (Tabla 8.8)
  const KL=1.12, KR=2.8, RP=1.79;
  const CSA=0.01, CPA=0.00667, CPV=0.08, V0=5.0;
  // solución: Q = V0/T (eq 8.80)
  const iKR=1/KR, iKL=1/KL;
  const T=CSA*(iKR+RS)+CSV*iKR+CPA*(iKL+RP)+CPV*iKL;
  const Q=V0/T;
  const Psv=Q*iKR, Ppv=Q*iKL, Psa=Psv+RS*Q, Ppa=Ppv+RP*Q;
  // layout: dos circuitos (pulmonar izq, sistémico der) + corazones
  const lx=w*0.06, lw=w*0.88, top=h*0.10, bot=h*0.66, mid=h*0.38;
  // corazones (VI y VD)
  const hxR=w*0.86, hxL=w*0.14;
  function heart(x,y,lab){
    ctx.strokeStyle=AB.PAL.blood; ctx.lineWidth=2.2;
    ctx.beginPath();
    ctx.moveTo(x,y-14); ctx.bezierCurveTo(x+16,y-20,x+22,y-2,x,y+14);
    ctx.bezierCurveTo(x-22,y-2,x-16,y-20,x,y-14); ctx.closePath(); ctx.stroke();
    ctx.fillStyle='rgba(169,42,30,.12)'; ctx.fill();
    AB.text(ctx,lab, x, y+30, {size:8,color:AB.PAL.blood,weight:'700'});
  }
  // caja sistémica (R_s) y pulmonar (R_p)
  function resistor(x0,y0,x1,y1,lab){
    const ang=Math.atan2(y1-y0,x1-x0);
    const steps=8, seg=(x1-x0)/steps;
    ctx.strokeStyle=AB.PAL.teal; ctx.lineWidth=2.2;
    ctx.beginPath(); ctx.moveTo(x0,y0);
    for(let i=1;i<steps;i++){
      const x=x0+seg*i;
      const y=y0+(i%2? -7:7);
      ctx.lineTo(x,y);
    }
    ctx.lineTo(x1,y1); ctx.stroke();
    AB.text(ctx,lab, (x0+x1)/2, y0+(y1>y0?12:-12), {size:7.5,color:AB.PAL.teal,weight:'700'});
  }
  // capacitor (dos líneas paralelas)
  function cap(x,y,lab){
    ctx.strokeStyle=AB.PAL.amber; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(x-9,y-9); ctx.lineTo(x-9,y+9); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x+9,y-9); ctx.lineTo(x+9,y+9); ctx.stroke();
    AB.text(ctx,lab, x, y+24, {size:7.5,color:AB.PAL.amber,weight:'700'});
  }
  // conductos
  ctx.strokeStyle=AB.PAL.line; ctx.lineWidth=1.6;
  // circuito sistémico (derecha): P_sa → R_s → P_sv → VD → P_sa
  ctx.beginPath(); ctx.moveTo(w*0.26,top); ctx.lineTo(w*0.86,top); ctx.stroke();   // aorta
  resistor(w*0.86,top, w*0.86,bot, 'R_s');                                        // bajada
  ctx.beginPath(); ctx.moveTo(w*0.86,bot); ctx.lineTo(w*0.26,bot); ctx.stroke();  // vena cava
  // circuito pulmonar (izquierda)
  ctx.beginPath(); ctx.moveTo(w*0.14,top); ctx.lineTo(w*0.20,top); ctx.stroke();
  resistor(w*0.14,bot, w*0.14,top, 'R_p');                                        // subida
  ctx.beginPath(); ctx.moveTo(w*0.20,top); ctx.lineTo(w*0.26,top); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(w*0.20,bot); ctx.lineTo(w*0.26,bot); ctx.stroke();
  // corazones conectados
  heart(w*0.20, mid, 'VI');
  heart(w*0.80, mid, 'VD');
  // compliancias
  cap(w*0.20, top-0, 'C_pa');
  cap(w*0.80, top, 'C_sa');
  cap(w*0.20, bot, 'C_pv');
  cap(w*0.80, bot, 'C_sv = '+espan(CSV,2));
  // presiones en los nodos
  AB.text(ctx,'P_sa = '+espan(Psa,0)+' mmHg', w*0.53, top-10, {size:9,weight:'700',color:AB.PAL.blood});
  AB.text(ctx,'P_sv = '+espan(Psv,1)+' mmHg', w*0.53, bot+16, {size:9,weight:'700',color:AB.PAL.teal});
  AB.text(ctx,'P_pa = '+espan(Ppa,0)+' mmHg', w*0.17, top-10, {size:9,weight:'700',color:AB.PAL.blood});
  AB.text(ctx,'P_pv = '+espan(Ppv,1)+' mmHg', w*0.17, bot+16, {size:9,weight:'700',color:AB.PAL.teal});
  // flujo Q (flechas)
  AB.arrow(ctx, w*0.30, top, w*0.44, top, {color:AB.PAL.teal,width:2});
  AB.text(ctx,'Q = '+espan(Q,1)+' L/min', w*0.37, top+14, {size:8,color:AB.PAL.teal,weight:'700'});
  AB.text(ctx,'8 subunidades: 2 corazones · 4 vasos grandes · 2 lechos de R', w/2, h*0.92, {size:8,color:AB.PAL.ink3});
  out('cc_out', 'Q = '+espan(Q,1)+' L/min · P_sa = '+espan(Psa,0)+' mmHg');
}

// ═══════════════════════════════════════════════════════════════════════════
//  S18 · Circulación fetal y cambio al nacer
// ═══════════════════════════════════════════════════════════════════════════
function solve4(A,b){
  for(let i=0;i<4;i++){
    let p=i;
    for(let r=i+1;r<4;r++) if(Math.abs(A[r][i])>Math.abs(A[p][i])) p=r;
    if(Math.abs(A[p][i])<1e-12) return null;
    [A[i],A[p]]=[A[p],A[i]]; [b[i],b[p]]=[b[p],b[i]];
    for(let r=i+1;r<4;r++){
      const f=A[r][i]/A[i][i];
      for(let c=i;c<4;c++) A[r][c]-=f*A[i][c];
      b[r]-=f*b[i];
    }
  }
  const x=[0,0,0,0];
  for(let i=3;i>=0;i--){
    let s=b[i];
    for(let c=i+1;c<4;c++) s-=A[i][c]*x[c];
    x[i]=s/A[i][i];
  }
  return x;
}
export const drawFetal: Draw = (dc, p, f, out) => {
  const { ctx, w, h } = dc;
const RP=Math.max(0.5,Math.min(25,p.fd_rp||18));
  out('fd_rpv', espan(RP,0)+(RP>17.5?' (fetal)':' (neonato)'));
  // constantes: corazones simétricos K, R_s fijo
  const K=2.8, RS=17.5;
  const CSA=0.01, CPA=0.00667, CSV=1.75, CPV=0.08, V0=5.0;
  const G_d=2, G_f=2;   // conducto y foramen abiertos (conductancias)
  function solve(Gd,Gf){
    // ecuaciones: balance P_sa, P_pa, P_pv + volumen
    const A=[
      [-(Gd+1/RS), 1/RS, Gd, K],
      [Gd, K, -(1/RP+Gd), 1/RP],
      [0, Gf, 1/RP, -(1/RP+Gf+K)],
      [CSA, CSV, CPA, CPV]
    ];
    const b=[0,0,0,V0];
    const x=solve4(A,b);
    if(!x) return null;
    return {Psa:x[0], Psv:x[1], Ppa:x[2], Ppv:x[3], Qd:Gd*(x[2]-x[0]), Qf:Gf*(x[1]-x[3])};
  }
  let s, fetal;
  if (RP>RS){
    s=solve(G_d,G_f); fetal=true;
  } else {
    s=solve(G_d,0); fetal=false;   // foramen cerrado, conducto abierto
  }
  if(!s){ s={Psa:100,Psv:5,Ppa:15,Ppv:5,Qd:0,Qf:0}; }
  const ductusOpen=fetal?true:true;
  const ductRev=!fetal&&s.Qd<0;
  const foramenOpen=fetal;
  const Qp=(s.Ppa-s.Ppv)/RP, Qs=(s.Psa-s.Psv)/RS;
  // layout de circuito fetal
  const lx=w*0.10, rx=w*0.90, top=h*0.10, bot=h*0.60, mid=h*0.35;
  ctx.strokeStyle=AB.PAL.line; ctx.lineWidth=1.6;
  // bucle pulmonar (izq)
  ctx.beginPath(); ctx.moveTo(lx,mid); ctx.lineTo(lx,bot); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(lx,bot); ctx.lineTo(w*0.42,bot); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(w*0.42,bot); ctx.lineTo(w*0.42,top); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(w*0.42,top); ctx.lineTo(lx,top); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(lx,top); ctx.lineTo(lx,mid); ctx.stroke();
  // bucle sistémico (der)
  ctx.beginPath(); ctx.moveTo(rx,mid); ctx.lineTo(rx,bot); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(rx,bot); ctx.lineTo(w*0.58,bot); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(w*0.58,bot); ctx.lineTo(w*0.58,top); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(w*0.58,top); ctx.lineTo(rx,top); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(rx,top); ctx.lineTo(rx,mid); ctx.stroke();
  // corazones
  function heart(x,y,lab){
    ctx.strokeStyle=AB.PAL.blood; ctx.lineWidth=2;
    ctx.beginPath();
    ctx.moveTo(x,y-12); ctx.bezierCurveTo(x+14,y-17,x+19,y-2,x,y+12);
    ctx.bezierCurveTo(x-19,y-2,x-14,y-17,x,y-12); ctx.closePath(); ctx.stroke();
    ctx.fillStyle='rgba(169,42,30,.12)'; ctx.fill();
    AB.text(ctx,lab, x, y+26, {size:7.5,color:AB.PAL.blood,weight:'700'});
  }
  heart(w*0.20, mid, 'VD → pulmón');
  heart(w*0.80, mid, 'VI → cuerpo');
  // resistencias
  function resistor(x0,y0,x1,y1,lab){
    const steps=8;
    ctx.strokeStyle=AB.PAL.teal; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(x0,y0);
    for(let i=1;i<steps;i++){
      const x=x0+(x1-x0)*i/steps, y=y0+((i%2)?-6:6);
      ctx.lineTo(x,y);
    }
    ctx.lineTo(x1,y1); ctx.stroke();
    AB.text(ctx,lab, (x0+x1)/2+10, (y0+y1)/2, {size:7.5,color:AB.PAL.teal,weight:'700'});
  }
  resistor(w*0.42,bot, w*0.42,top, 'R_p');
  resistor(w*0.58,bot, w*0.58,top, 'R_s');
  // ductus: conecta P_pa (top izq) con P_sa (top der)
  const dArrow=ductRev?(w*0.42+6):(w*0.58-6);
  ctx.strokeStyle=ductRev?AB.PAL.amber:AB.PAL.teal; ctx.lineWidth=3;
  ctx.beginPath(); ctx.moveTo(w*0.44,top-14); ctx.lineTo(w*0.56,top-14); ctx.stroke();
  AB.arrow(ctx, ductRev?w*0.52: w*0.46, top-14, ductRev?w*0.56:w*0.44, top-14, {color:ductRev?AB.PAL.amber:AB.PAL.teal,width:2.4});
  AB.text(ctx,'ductus arterioso'+(ductRev?' (invertido)':''), w*0.5, top-26, {size:7.5,weight:'700',color:ductRev?AB.PAL.amber:AB.PAL.teal});
  // foramen: conecta P_sv (bot der) con P_pv (bot izq)
  if (foramenOpen){
    ctx.strokeStyle=AB.PAL.teal; ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(w*0.44,bot+14); ctx.lineTo(w*0.56,bot+14); ctx.stroke();
    AB.arrow(ctx, w*0.54, bot+14, w*0.46, bot+14, {color:AB.PAL.teal,width:2.4});
    AB.text(ctx,'foramen oval (abierto)', w*0.5, bot+28, {size:7.5,weight:'700',color:AB.PAL.teal});
  } else {
    AB.dashed(ctx,w*0.44,bot+14,w*0.56,bot+14,{color:AB.PAL.ink3,width:1.6});
    AB.text(ctx,'foramen (cerrado)', w*0.5, bot+28, {size:7.5,color:AB.PAL.ink3});
  }
  // presiones
  AB.text(ctx,'P_pa = '+espan(s.Ppa,0)+' mmHg', w*0.24, top-6, {size:8,weight:'700',color:AB.PAL.blood});
  AB.text(ctx,'P_sa = '+espan(s.Psa,0)+' mmHg', w*0.76, top-6, {size:8,weight:'700',color:AB.PAL.blood});
  AB.text(ctx,'P_pv = '+espan(s.Ppv,1)+' mmHg', w*0.24, bot+40, {size:8,weight:'700',color:AB.PAL.teal});
  AB.text(ctx,'P_sv = '+espan(s.Psv,1)+' mmHg', w*0.76, bot+40, {size:8,weight:'700',color:AB.PAL.teal});
  // flujos
  AB.text(ctx,'Q_p = '+espan(Qp,1), w*0.46, top+12, {size:7.5,color:AB.PAL.ink3});
  AB.text(ctx,'Q_s = '+espan(Qs,1), w*0.54, top+12, {size:7.5,color:AB.PAL.ink3});
  AB.text(ctx, fetal?'feto: R_p > R_s → la sangre bypasea el pulmón':'al nacer: R_p < R_s → el circuito cambia', w/2, h*0.90, {size:8,color:AB.PAL.ink3});
  const state=fetal?'feto: ductus → · foramen →':'neonato: ductus '+ (ductRev?'← invertido':'→')+' · foramen cerrado';
  out('fd_out', state);
}

// ═══════════════════════════════════════════════════════════════════════════
//  S19 · Onda de pulso: P_pulso = V_stroke/C_sa
// ═══════════════════════════════════════════════════════════════════════════
export const drawPulse: Draw = (dc, p, f, out) => {
  const { ctx, w, h } = dc;
const VS=Math.max(50,Math.min(100,p.pu_vs||70));
  const C=Math.max(0.001,Math.min(0.003,p.pu_c||0.00175));
  out('pu_vsv', espan(VS,0)+' mL');
  out('pu_cv', espan(C,5));
  const Pp=(VS/1000)/C;
  const DIA=80, SYS=DIA+Pp;
  const RS=17.5, TAU=RS*C;   // min
  const lx=w*0.10, lw=w*0.80, gy=h*0.12, gH=h*0.58;
  const P0=60, P1=200;
  const Y=p=>gy+gH*(1-(p-P0)/(P1-P0));
  function waveP(t){
    if (t<0.12) return DIA+(SYS-DIA)*(t/0.12);
    if (t<0.36) return SYS-(SYS-DIA)*0.03*((t-0.12)/0.24);
    if (t<0.44) return SYS*0.88;
    if (t<0.50) return SYS*0.96-12*((t-0.44)/0.06);
    const td=(t-0.50)/0.50;
    return DIA+(SYS*0.92-DIA)*Math.exp(-td/TAU*0.45);
  }
  ctx.strokeStyle=AB.PAL.line; ctx.lineWidth=1.2;
  ctx.beginPath(); ctx.moveTo(lx,gy); ctx.lineTo(lx,gy+gH); ctx.lineTo(lx+lw,gy+gH); ctx.stroke();
  [DIA,SYS].forEach(v=>{
    const y=Y(v);
    AB.dashed(ctx,lx,y,lx+lw,y,{color:AB.PAL.line});
    AB.text(ctx,espan(v,0)+' mmHg', lx-6, y, {size:8,color:AB.PAL.ink3,align:'right'});
  });
  ctx.strokeStyle=AB.PAL.blood; ctx.lineWidth=2.6;
  ctx.beginPath();
  for(let i=0;i<=160;i++){
    const x=lx+i/160*lw, y=Y(waveP(i/160));
    i?ctx.lineTo(x,y):ctx.moveTo(x,y);
  }
  ctx.stroke();
  AB.text(ctx,'P_pulso = '+espan(Pp,0)+' mmHg', w/2, gy-12, {size:9,weight:'700',color:AB.PAL.blood});
  AB.text(ctx,'P_pulso = V_stroke/C_sa', lx+lw, gy+gH, {size:8,color:AB.PAL.teal,align:'right'});
  AB.text(ctx,'decaimiento diastólico: τ = R_s·C_sa', w/2, h*0.90, {size:8,color:AB.PAL.ink3});
  out('pu_out', 'P_pulso = '+espan(Pp,0)+' mmHg · τ = '+espan(TAU,3)+' min');
}

// ═══════════════════════════════════════════════════════════════════════════
//  S20 · Windkessel: capacitor arterial + resistor
// ═══════════════════════════════════════════════════════════════════════════
export const drawWindkessel: Draw = (dc, p, f, out) => {
  const { ctx, w, h } = dc;
const C=Math.max(0.001,Math.min(0.003,p.wk_c||0.002));
  const R=Math.max(10,Math.min(25,p.wk_r||17.5));
  const F=Math.max(40,Math.min(160,p.wk_f||70));
  out('wk_cv', espan(C,4));
  out('wk_rv', espan(R,1));
  out('wk_fv', espan(F,0)+' /min');
  const TAU=R*C;  // min
  const T=60/F;   // s por ciclo
  const VS=0.08;  // L
  const Pmin=80, Pmax=Pmin+VS/C;
  const t=(f.wkT||0);
  const ph=(t*1000% (T*1000))/ (T*1000);   // fracción de ciclo 0..1
  const f_s=0.35;
  // presión según fase
  let P;
  if (ph<f_s) P=Pmin+(Pmax-Pmin)*(ph/f_s);
  else { const td=(ph-f_s)*T/60; P=Pmax*Math.exp(-td/TAU); }
  // capacitor (depósito) — infla/deflata
  const sx=w*0.30, sy=h*0.40, s0=Math.min(44, h*0.20);
  const pfrac=(P-Pmin)/(Pmax-Pmin);
  const sr=s0*(0.72+0.42*pfrac);
  ctx.fillStyle='rgba(13,110,100,.10)'; ctx.strokeStyle=AB.PAL.teal; ctx.lineWidth=2.4;
  ctx.beginPath(); ctx.arc(sx,sy,sr,0,Math.PI*2); ctx.fill(); ctx.stroke();
  AB.text(ctx,'arterias (C)', sx, sy, {size:9,weight:'700',color:AB.PAL.teal});
  AB.text(ctx,espan(P,0)+' mmHg', sx, sy+22, {size:9,weight:'700',color:AB.PAL.blood});
  // resistor (tubo con zigzag)
  const rx0=sx+sr+8, ry=sy;
  ctx.strokeStyle=AB.PAL.blood; ctx.lineWidth=5;
  ctx.beginPath(); ctx.moveTo(sx+sr,ry); ctx.lineTo(rx0+6,ry); ctx.stroke();
  for(let i=0;i<4;i++){
    const x=rx0+8+i*10;
    ctx.strokeStyle=AB.PAL.amber; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(x,ry-7); ctx.lineTo(x+5,ry+7); ctx.lineTo(x+10,ry-7); ctx.stroke();
  }
  AB.text(ctx,'R_p (periferia)', rx0+30, ry-16, {size:8,color:AB.PAL.amber,weight:'700'});
  AB.arrow(ctx, rx0+30, ry, rx0+44, ry, {color:AB.PAL.blood,width:2.2});
  // traza de presión
  const gx=w*0.14, gw=w*0.72, gy=h*0.66, gh=h*0.20;
  ctx.strokeStyle=AB.PAL.line; ctx.lineWidth=1.2;
  ctx.beginPath(); ctx.moveTo(gx,gy); ctx.lineTo(gx,gy+gh); ctx.lineTo(gx+gw,gy+gh); ctx.stroke();
  ctx.strokeStyle=AB.PAL.blood; ctx.lineWidth=2;
  ctx.beginPath();
  for(let i=0;i<=120;i++){
    const t2=i/120;
    const p2=t2<f_s?Pmin+(Pmax-Pmin)*(t2/f_s):Pmax*Math.exp(-((t2-f_s)*T/60)/TAU);
    const x=gx+i/120*gw, y=gy+gh*(1-(p2-Pmin)/(Pmax-Pmin));
    i?ctx.lineTo(x,y):ctx.moveTo(x,y);
  }
  ctx.stroke();
  // marcador de fase
  const mx=gx+ph*gw, my=gy+gh*(1-(P-Pmin)/(Pmax-Pmin));
  ctx.beginPath(); ctx.arc(mx,my,4.5,0,Math.PI*2); ctx.fillStyle=AB.PAL.amber; ctx.fill();
  AB.text(ctx, ph<f_s?'sístole: el depósito se llena (Q_in = C·dP/dt + P/R)':'diástole: P(t) = P₀·e^(−t/τ)', w/2, h*0.92, {size:8,color:ph<f_s?AB.PAL.teal:AB.PAL.amber});
  out('wk_out', 'τ = '+espan(TAU,3)+' min · diástole: P(t) = P₀·e^(−t/τ)');
}

// ═══════════════════════════════════════════════════════════════════════════
//  S21 · Ejercicio: reparto del flujo (Tabla 8.6)
// ═══════════════════════════════════════════════════════════════════════════
export const drawExercise: Draw = (dc, p, flags, out) => {
  const { ctx, w, h } = dc;
  const L = Math.max(0, Math.min(3, p.ej_i || 0));
  out('ej_iv', ['reposo', 'ligero', 'intenso', 'máximo'][Math.min(3, Math.round(L))]);
  // anclas por intensidad (mL/min) — Tabla 8.6
  const anchors: any[] = [
    { cerebro: 750, corazon: 250, musculo: 1200, piel: 500, rinon: 1100, abdomen: 1400, total: 5800 },
    { cerebro: 750, corazon: 400, musculo: 4500, piel: 1200, rinon: 1200, abdomen: 1400, total: 9500 },
    { cerebro: 750, corazon: 600, musculo: 12000, piel: 1500, rinon: 1000, abdomen: 1500, total: 17500 },
    { cerebro: 750, corazon: 1000, musculo: 22000, piel: 600, rinon: 250, abdomen: 600, total: 25000 }
  ];
  const i0 = Math.min(3, Math.floor(L)), fracInterp = L - i0;
  const A = anchors[i0], B = anchors[Math.min(3, i0 + 1)];
  const orgs = ['cerebro', 'corazon', 'musculo', 'piel', 'rinon', 'abdomen'];
  const cols: any = { cerebro: AB.PAL.sagittal, corazon: AB.PAL.blood, musculo: AB.PAL.blood, corazon2: AB.PAL.blood, piel: AB.PAL.amber, rinon: AB.PAL.teal, abdomen: AB.PAL.tealLight };
  const vals: any = {};
  let total = 0;
  orgs.forEach(o => { const v = A[o] + (B[o] - A[o]) * fracInterp; vals[o] = v; total += v; });
  const otros = Math.max(0, A.total + (B.total - A.total) * fracInterp - total);
  total+=otros;
  // barra apilada
  const lx=w*0.12, lw=w*0.76, y0=h*0.16, barh=h*0.16;
  const order=['musculo','cerebro','corazon','rinon','abdomen','piel','otros'];
  let x=lx;
  order.forEach((o,i)=>{
    const v=(o==='otros')?otros:vals[o];
    const frac=v/total;
    const bw=frac*lw;
    if (bw<1) return;
    const col=o==='otros'?AB.PAL.ink3:(cols[o]||AB.PAL.teal);
    ctx.fillStyle=col;
    ctx.fillRect(x,y0,bw,barh);
    if (frac>0.05){
      AB.text(ctx,espan(v/1000,1)+' L', x+bw/2, y0+barh+14, {size:8,color:col,weight:'700'});
      if (i===0) AB.text(ctx,espan(frac*100,0)+' %', x+bw/2, y0+barh+28, {size:7.5,color:col});
    }
    x+=bw;
  });
  ctx.strokeStyle=AB.PAL.line; ctx.lineWidth=1.2;
  ctx.strokeRect(lx,y0,lw,barh);
  AB.text(ctx,'Q = '+espan(total/1000,1)+' L/min', w/2, y0-12, {size:11,weight:'700',color:AB.PAL.teal});
  // cerebro constante (línea horizontal)
  const cb=vals.cerebro;
  const yCB=y0+barh+8;
  AB.dashed(ctx,lx,yCB,lx+lw,yCB,{color:AB.PAL.sagittal,width:1.4});
  AB.text(ctx,'cerebro: '+espan(cb,0)+' mL/min (constante)', w*0.14, yCB+16, {size:7.5,align:'left',color:AB.PAL.sagittal,weight:'700'});
  AB.text(ctx,'el músculo se lleva el aumento · el cerebro no cambia', w/2, h*0.88, {size:8,color:AB.PAL.ink3});
  out('ej_out', 'Q = '+espan(total/1000,1)+' L/min · músculo '+espan(vals.musculo/total*100,0)+' %');
}

// ═══════════════════════════════════════════════════════════════════════════
//  S22 · Disfunción: ESPVR y EDPVR
// ═══════════════════════════════════════════════════════════════════════════
export const drawDysfunction: Draw = (dc, p, f, out) => {
  const { ctx, w, h } = dc;
const CT=Math.max(0.5,Math.min(1.5,p.df_ct||1));
  const ST=Math.max(0.5,Math.min(2,p.df_st||1));
  out('df_ctv', espan(CT,1));
  out('df_stv', espan(ST,1));
  const Vd=40, E=5, VED=150, PSA=100;
  const VES=Math.max(Vd+8, Vd+PSA/(E*CT));
  const EF=(VED-VES)/VED*100;
  const P_edp=V=>ST*0.001*Math.pow(V-Vd,2);
  const lx=w*0.12, lw=w*0.62, gy=h*0.10, gH=h*0.62;
  const V0=50, V1=240, P1=160;
  const X=v=>lx+lw*(v-V0)/(V1-V0);
  const Y=p=>gy+gH*(1-p/P1);
  ctx.strokeStyle=AB.PAL.line; ctx.lineWidth=1.2;
  ctx.beginPath(); ctx.moveTo(lx,gy); ctx.lineTo(lx,gy+gH); ctx.lineTo(lx+lw,gy+gH); ctx.stroke();
  [0,50,100,150].forEach(v=>{
    AB.dashed(ctx,lx,Y(v),lx+lw,Y(v),{color:AB.PAL.line});
    AB.text(ctx,espan(v,0), lx-6, Y(v), {size:7,color:AB.PAL.ink3,align:'right'});
  });
  [50,100,150,200,240].forEach(v=>{
    const x=X(v);
    AB.dashed(ctx,x,gy,x,gy+gH,{color:AB.PAL.line});
    AB.text(ctx,espan(v,0), x, gy+gH+12, {size:7,color:AB.PAL.ink3});
  });
  AB.text(ctx,'V (mL)', lx+lw, gy+gH+12, {size:8,color:AB.PAL.ink3,align:'right'});
  AB.text(ctx,'P (mmHg)', lx-10, gy-10, {size:8,color:AB.PAL.ink3});
  // ESPVR (pendiente ∝ contractilidad)
  ctx.strokeStyle=AB.PAL.amber; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(X(Vd),Y(0)); ctx.lineTo(X(V1),Y(E*CT*(V1-Vd))); ctx.stroke();
  AB.text(ctx,'ESPVR', X(V1)+2, Y(E*CT*(V1-Vd))-4, {size:7,color:AB.PAL.amber,align:'left'});
  // EDPVR (pendiente ∝ rigidez)
  ctx.strokeStyle=AB.PAL.teal; ctx.lineWidth=1.8;
  ctx.beginPath();
  for(let i=0;i<=40;i++){
    const v=Vd+(V1-Vd)*i/40;
    const x=X(v), y=Y(P_edp(v));
    i?ctx.lineTo(x,y):ctx.moveTo(x,y);
  }
  ctx.stroke();
  AB.text(ctx,'EDPVR', X(Vd)+6, Y(P_edp(Vd+6)), {size:7,color:AB.PAL.teal,align:'left'});
  // lazo
  const A=[VES,P_edp(VES)], B=[VED,P_edp(VED)], C=[VED,PSA], D=[VES,PSA];
  ctx.fillStyle='rgba(169,42,30,.14)';
  ctx.beginPath(); ctx.moveTo(X(A[0]),Y(A[1])); ctx.lineTo(X(B[0]),Y(B[1])); ctx.lineTo(X(C[0]),Y(C[1]));
  ctx.lineTo(X(D[0]),Y(D[1])); ctx.closePath(); ctx.fill();
  ctx.strokeStyle=AB.PAL.blood; ctx.lineWidth=2.2;
  ctx.beginPath();
  ctx.moveTo(X(A[0]),Y(A[1])); ctx.lineTo(X(B[0]),Y(B[1])); ctx.lineTo(X(C[0]),Y(C[1]));
  ctx.quadraticCurveTo(X((VED+VES)/2), Y(PSA*1.05), X(D[0]),Y(D[1]));
  ctx.lineTo(X(A[0]),Y(A[1])); ctx.closePath(); ctx.stroke();
  // panel EF
  const px0=w*0.82, py0=h*0.14, pw=w*0.15, ph2=h*0.66;
  ctx.strokeStyle=AB.PAL.line; ctx.lineWidth=1.2;
  ctx.strokeRect(px0,py0,pw,ph2);
  AB.text(ctx,'fracción de eyección', px0+pw/2, py0+16, {size:8,color:AB.PAL.ink,weight:'700'});
  AB.text(ctx,'EF = V_s/V_ED', px0+pw/2, py0+34, {size:7.5,color:AB.PAL.ink3});
  AB.text(ctx,espan(EF,0)+' %', px0+pw/2, py0+58, {size:16,weight:'700',color:AB.PAL.blood});
  AB.text(ctx,'normal 55–75 %', px0+pw/2, py0+80, {size:7,color:AB.PAL.ink3});
  AB.text(ctx,'disfunción', px0+pw/2, py0+96, {size:7,color:AB.PAL.ink3});
  AB.text(ctx,'sistólica < 40 %', px0+pw/2, py0+110, {size:7,color:AB.PAL.ink3});
  AB.text(ctx,'diastólica: EF preservado', px0+pw/2, py0+124, {size:7,color:AB.PAL.ink3});
  AB.text(ctx,'la pendiente ESPVR es la contractilidad · la EDPVR, la rigidez', w/2, h*0.90, {size:8,color:AB.PAL.ink3});
  out('df_out', 'EF ≈ '+espan(EF,0)+' % · '+(EF<40?'disfunción sistólica':EF<50?'fronterizo':'normal'));
}

// ═══════════════════════════════════════════════════════════════════════════
//  S23 · Fracción de eyección: válvulas
// ═══════════════════════════════════════════════════════════════════════════
export const drawEjection: Draw = (dc, p, f, out) => {
  const { ctx, w, h } = dc;
const VED=Math.max(100,Math.min(240,p.ef_ed||150));
  const VES=Math.max(30,Math.min(130,p.ef_es||60));
  out('ef_edv', espan(VED,0)+' mL');
  out('ef_esv', espan(VES,0)+' mL');
  const EF=(VED-VES)/VED*100;
  const t=(f.efT||0);
  const ph=(t*0.8)%1;
  // volumen instantáneo: llenado rápido, eyección más lenta
  let V;
  if (ph<0.4) V=VES+(VED-VES)*(ph/0.4);
  else V=VED-(VED-VES)*((ph-0.4)/0.6);
  const playing=f.efPlaying;
  // ventrículo
  const cx=w*0.30, cy=h*0.44;
  const s=V/ (playing?VED:VED);
  const rx=Math.max(26, Math.min(88, 22+V*0.28));
  const ry=Math.max(20, rx*0.78);
  ctx.fillStyle='rgba(169,42,30,'+(playing?0.14:0.10)+')';
  ctx.strokeStyle=AB.PAL.blood; ctx.lineWidth=2.4;
  ctx.beginPath(); ctx.ellipse(cx,cy,rx,ry,0,0,Math.PI*2); ctx.fill(); ctx.stroke();
  // válvula aórtica (flecha)
  const open=playing? ph>=0.40 && ph<1 : true;
  if (playing){
    AB.arrow(ctx, cx, cy-ry-6, cx, cy-ry-26, {color:open?AB.PAL.teal:AB.PAL.ink3,width:2.4});
    AB.text(ctx,open?'eyectando':'llenando', cx, cy-ry-34, {size:8,weight:'700',color:open?AB.PAL.teal:AB.PAL.ink3});
  }
  // volumen
  AB.text(ctx,'V = '+espan(playing?V:VED,0)+' mL', cx, cy+ry+18, {size:10,weight:'700',color:AB.PAL.blood});
  AB.text(ctx,'V_ED '+espan(VED,0)+' mL → V_ES '+espan(VES,0)+' mL', cx, cy+ry+32, {size:7.5,color:AB.PAL.ink3});
  // medidor circular EF
  const gx=w*0.72, gy=h*0.42, GR=Math.min(64,h*0.30);
  ctx.strokeStyle=AB.PAL.line; ctx.lineWidth=8;
  ctx.beginPath(); ctx.arc(gx,gy,GR,-Math.PI,0); ctx.stroke();
  ctx.strokeStyle=EF>=55?AB.PAL.teal:EF>=40?AB.PAL.amber:AB.PAL.blood;
  ctx.lineWidth=8;
  ctx.beginPath(); ctx.arc(gx,gy,GR,-Math.PI,-Math.PI+Math.PI*Math.max(0.05,Math.min(1,EF/100))); ctx.stroke();
  AB.text(ctx,'EF', gx, gy-6, {size:10,color:AB.PAL.ink3});
  AB.text(ctx,espan(EF,0)+' %', gx, gy+16, {size:18,weight:'700',color:AB.PAL.teal});
  AB.text(ctx,EF>=55?'normal':EF>=40?'fronterizo':'disfunción sistólica', gx, gy+36, {size:8,weight:'700',color:EF>=55?AB.PAL.teal:EF>=40?AB.PAL.amber:AB.PAL.blood});
  AB.text(ctx,'EF = V_stroke / V_ED', w/2, h*0.90, {size:8,color:AB.PAL.ink3});
  out('ef_out', 'EF = '+espan(EF,0)+' % · '+(EF>=55?'normal':EF>=40?'fronterizo':'disfunción sistólica'));
}

document.addEventListener('DOMContentLoaded', ()=>{
  dots();
  buildModuleTabs();
  if (window.renderMathInElement) renderMathInElement(document.body, {
    delimiters:[
      {left:'\\(',right:'\\)',display:false},
      {left:'\\[',right:'\\]',display:true}
    ],
    throwOnError:false
  });
  requestAnimationFrame(()=>redrawSlide(0));
});


// ═══════════════════════════════════════════════════════════════════════════
//  Despacho de redibujo por slide
// ═══════════════════════════════════════════════════════════════════════════
const CANVASMAP: Record<number, string[]> = {
  1: ['sim-distribution'],
  2: ['sim-wave'],
  3: ['sim-gravity'],
  4: ['sim-profile'],
  5: ['sim-velocity'],
  6: ['sim-reynolds'],
  7: ['sim-resvasc'],
  8: ['sim-wall'],
  9: ['sim-starling'],
  10: ['sim-fick'],
  11: ['sim-pvloop'],
  12: ['sim-obstruction'],
  13: ['sim-aneurysm'],
  14: ['sim-pulsatile'],
  15: ['sim-stenosis'],
  16: ['sim-frank'],
  17: ['sim-circuit'],
  18: ['sim-fetal'],
  19: ['sim-pulse'],
  20: ['sim-windkessel'],
  21: ['sim-exercise'],
  22: ['sim-dysfunction'],
  23: ['sim-ejection'],
};

function drawById(id: string, dc: AB.DrawCtx, p: SimParams, f: SimFlags, out: OutFn) {
  switch (id) {
    case 'sim-distribution': drawDistribution(dc, p, f, out); break;
    case 'sim-wave': drawWave(dc, p, f, out); break;
    case 'sim-gravity': drawGravity(dc, p, f, out); break;
    case 'sim-profile': drawProfile(dc, p, f, out); break;
    case 'sim-velocity': drawVelocity(dc, p, f, out); break;
    case 'sim-reynolds': drawReynolds(dc, p, f, out); break;
    case 'sim-resvasc': drawResVasc(dc, p, f, out); break;
    case 'sim-wall': drawWall(dc, p, f, out); break;
    case 'sim-starling': drawStarling(dc, p, f, out); break;
    case 'sim-fick': drawFick(dc, p, f, out); break;
    case 'sim-pvloop': drawPVLoop(dc, p, f, out); break;
    case 'sim-obstruction': drawObstruction(dc, p, f, out); break;
    case 'sim-aneurysm': drawAneurysm(dc, p, f, out); break;
    case 'sim-pulsatile': drawPulsatile(dc, p, f, out); break;
    case 'sim-stenosis': drawStenosis(dc, p, f, out); break;
    case 'sim-frank': drawFrank(dc, p, f, out); break;
    case 'sim-circuit': drawCircuit(dc, p, f, out); break;
    case 'sim-fetal': drawFetal(dc, p, f, out); break;
    case 'sim-pulse': drawPulse(dc, p, f, out); break;
    case 'sim-windkessel': drawWindkessel(dc, p, f, out); break;
    case 'sim-exercise': drawExercise(dc, p, f, out); break;
    case 'sim-dysfunction': drawDysfunction(dc, p, f, out); break;
    case 'sim-ejection': drawEjection(dc, p, f, out); break;
  }
}

export function canvasesForSlide(n: number): string[] {
  return CANVASMAP[n] || [];
}

export function redrawSlide(n: number, t: number, p: SimParams, f: SimFlags, out: OutFn): void {
  const ids = CANVASMAP[n];
  if (!ids) return;
  for (const id of ids) {
    const cv = document.getElementById(id) as HTMLCanvasElement | null;
    if (!cv || !cv.clientWidth) continue;
    const ctx = cv.getContext('2d');
    if (!ctx) continue;
    const w = cv.clientWidth, h = cv.clientHeight;
    AB.setup(cv, w, h);
    const dc: AB.DrawCtx = { ctx, w, h, t };
    drawById(id, dc, p, f, out);
  }
}
