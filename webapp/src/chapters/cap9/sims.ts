// @ts-nocheck
// ═══════════════════════════════════════════════════════════════════════════
//  Capítulo 9 · Simulaciones interactivas (Física del Cuerpo Humano)
// ═══════════════════════════════════════════════════════════════════════════

import { ab, PAL, setup, fmt, text, arrow, dashed, bone, joint, muscle, tendon, limbSkin, hand, foot, triangle, el, num, espan } from './ab';

export const TOTAL = 24;

export const MODULES = [
  { id: 0, name: 'Inicio',                   slides: [0],                   ico: '🏠' },
  { id: 1, name: 'Estructura',               slides: [1, 2, 3],             ico: '🌳' },
  { id: 2, name: 'Los alvéolos',             slides: [4, 5, 6],             ico: '🫧' },
  { id: 3, name: 'Física de la respiración', slides: [7, 8],                ico: '🫁' },
  { id: 4, name: 'Volúmenes pulmonares',     slides: [9, 10, 11],           ico: '📏' },
  { id: 5, name: 'Flujo de aire',            slides: [12, 13, 14],          ico: '🌬️' },
  { id: 6, name: 'El ciclo respiratorio',    slides: [15, 16],              ico: '🔁' },
  { id: 7, name: 'Pulmón enfermo',           slides: [17, 18],              ico: '🚑' },
  { id: 8, name: 'Altitud',                  slides: [19, 20, 21],          ico: '🏔️' },
  { id: 9, name: 'Trabajo de la respiración', slides: [22, 23],              ico: '⚡' },
];

export interface SimParams {
  cm_sel?: string;
  tr_z?: number;
  gs_sel?: string;
  lp_r?: number;
  lp_g?: string;
  bb_r2?: number;
  sf_r0?: number;
  sf_sel?: string;
  pl_pp?: number;
  br_rate?: number;
  sp_mode?: string;
  pc_t?: number;
  mx_alpha?: number;
  mx_beta?: number;
  ar_sel?: string;
  sn_pmax?: number;
  sn_vin?: number;
  me_r?: number;
  me_c?: number;
  cy_speed?: number;
  lv_sel?: string;
  ob_t?: number;
  ob_sel?: string;
  fc_t?: number;
  fc_sel?: string;
  hy_frac?: number;
  al_h?: number;
  tb_sel?: string;
  wr_vt?: number;
  wr_c?: number;
  wr_f?: number;
  ef_ep?: number;
}

export const DEFAULT_PARAMS: SimParams = {
  cm_sel: 'insp',
  tr_z: 8,
  gs_sel: 'dry',
  lp_r: 50,
  lp_g: '72',
  bb_r2: 55,
  sf_r0: 50,
  sf_sel: 'surf',
  pl_pp: -5,
  br_rate: 12,
  sp_mode: 'normal',
  pc_t: 20,
  mx_alpha: 33,
  mx_beta: 25,
  ar_sel: '0',
  sn_pmax: 1.1,
  sn_vin: 500,
  me_r: 2,
  me_c: 200,
  cy_speed: 100,
  lv_sel: 'rest',
  ob_t: 10,
  ob_sel: 'normal',
  fc_t: 10,
  fc_sel: 'normal',
  hy_frac: 21,
  al_h: 8250,
  tb_sel: 'sea',
  wr_vt: 500,
  wr_c: 100,
  wr_f: 20,
  ef_ep: 5,
};

export interface SimFlags {
  bbPlaying: boolean;
  bbT: number;
  bbDt?: number;
  bbR1?: number;
  bbR2?: number;
  brPlaying: boolean;
  brT: number;
  spPlaying: boolean;
  spT: number;
  spHist: { t: number; v: number }[];
  cyPlaying: boolean;
  cyT: number;
  cyHist: any[];
  lvPlaying: boolean;
  lvT: number;
}

export const DEFAULT_FLAGS: SimFlags = {
  bbPlaying: false,
  bbT: 0,
  bbR1: undefined,
  bbR2: undefined,
  brPlaying: false,
  brT: 0,
  spPlaying: false,
  spT: 0,
  spHist: [],
  cyPlaying: false,
  cyT: 0,
  cyHist: [],
  lvPlaying: false,
  lvT: 0,
};

// Global window declarations for dynamic access
declare global {
  interface Window {
    __bbPlaying?: boolean;
    __bbT?: number;
    __bbDt?: number;
    __bbR1?: number;
    __bbR2?: number;
    __brPlaying?: boolean;
    __brT?: number;
    __spPlaying?: boolean;
    __spT?: number;
    __spHist?: any[];
    __cyPlaying?: boolean;
    __cyT?: number;
    __cyHist?: any[];
    __lvPlaying?: boolean;
    __lvT?: number;
    drawComposition?: () => void;
    drawTree?: () => void;
    drawGas?: () => void;
    drawLaplace?: () => void;
    drawBubbles?: () => void;
    drawSurfactant?: () => void;
    drawPleura?: () => void;
    drawBreath?: () => void;
    drawSpiro?: () => void;
    drawPVCurve?: () => void;
    drawMix?: () => void;
    drawAirRes?: () => void;
    drawSine?: () => void;
    drawMech?: () => void;
    drawCycle?: () => void;
    drawPVLoop?: () => void;
    drawInspVol?: () => void;
    drawFVC?: () => void;
    drawHypoxia?: () => void;
    drawAltitude?: () => void;
    drawTable94?: () => void;
    drawWork?: () => void;
    drawEff?: () => void;
  }
}

/* ═══════════════════════════════════════════════════════════
   SIMULACIONES DEL CAPÍTULO 9 — Los pulmones y la respiración
   23 sims canvas · una por slide de contenido
   ═══════════════════════════════════════════════════════════ */

/* ── Estado global de las simulaciones animadas ── */
window.__bbPlaying=false; window.__bbT=0; window.__bbR1=undefined; window.__bbR2=undefined; // burbujas
window.__brPlaying=false; window.__brT=0;  // ciclo respiración
window.__spPlaying=false; window.__spT=0; window.__spHist=[];   // espirómetro
window.__cyPlaying=false; window.__cyT=0; window.__cyHist=[];   // ciclo (4 trazas)
window.__lvPlaying=false; window.__lvT=0;  // lazo P–V

/* ═══════════════════════════════════════════════════════════
   S1 · Composición del aire: inspirado / espirado / viciado
   ═══════════════════════════════════════════════════════════ */
export function drawComposition(){
  const cv=el('sim-composition'); if(!cv||!cv.clientWidth) return;
  const w=cv.clientWidth,h=cv.clientHeight;
  const ctx=setup(cv,w,h);
  const sel=el('cm_sel')?el('cm_sel').value:'insp';
  const MIX={
    insp:{name:'Inspirado',  n2:78.084,o2:20.947,co2:0.04},
    exp:{name:'Espirado',    n2:79.9,  o2:16.0,  co2:4.0},
    viciado:{name:'Viciado (alvéolos)', n2:80.0, o2:16.5, co2:3.5},
  };
  const m=MIX[sel];
  const gases=[['N₂',m.n2,PAL.teal],['O₂',m.o2,PAL.blood],['CO₂',m.co2,PAL.amber]];
  // barra apilada principal
  const bx=w*0.08, by=h*0.20, bw=w*0.72, bh=h*0.30;
  let x0=bx;
  gases.forEach(g=>{
    const fw=bw*g[1]/100;
    ctx.fillStyle=g[2];
    ctx.fillRect(x0,by,fw,bh);
    if (fw>18) text(ctx,espan(g[1],g[1]<1?2:1)+' %', x0+fw/2, by+bh/2, {size:10,weight:'700',color:'#fbf8f0'});
    x0+=fw;
  });
  ctx.strokeStyle=PAL.line; ctx.lineWidth=1.2;
  ctx.strokeRect(bx,by,bw,bh);
  text(ctx,m.name+' · '+(100-m.n2-m.o2-m.co2>0?'+ otros':'')+' ≈ 100 %', w/2, by-14, {size:11,weight:'700',color:PAL.ink});
  // comparativa O₂ entre las tres mezclas
  const lx=w*0.08, gw=(w*0.84)/3, gy=h*0.62, gmax=h*0.20;
  const keys=['insp','exp','viciado'];
  text(ctx,'Fracción de O₂ (%)', w/2, gy-10, {size:8,color:PAL.ink3});
  keys.forEach((k,i)=>{
    const o2=MIX[k].o2;
    const cx=lx+gw*i+gw/2;
    const bh2=Math.max(4, o2/21*gmax);
    ctx.fillStyle=k===sel?PAL.blood:'rgba(169,42,30,.35)';
    ctx.fillRect(cx-14, gy-bh2, 28, bh2);
    ctx.strokeStyle=k===sel?PAL.blood:'rgba(169,42,30,.35)';
    ctx.strokeRect(cx-14, gy-bh2, 28, bh2);
    text(ctx,espan(o2,1)+' %', cx, gy-bh2-8, {size:8,weight:k===sel?'700':'400',color:k===sel?PAL.blood:PAL.ink3});
    text(ctx,MIX[k].name, cx, gy+14, {size:7,color:k===sel?PAL.ink:PAL.ink3});
  });
  text(ctx,'El espirado conserva 16 % de O₂: sirve para el boca a boca', w/2, h*0.93, {size:8,color:PAL.ink3});
  const out=el('cm_out');
  if (out) out.textContent=m.name+' · O₂ '+espan(m.o2,1)+' % · CO₂ '+espan(m.co2,1)+' %';
}

/* ═══════════════════════════════════════════════════════════
   S2 · Árbol bronquial: Tabla 9.1 + ley d = 2^(−z/3)·d(0)
   ═══════════════════════════════════════════════════════════ */
export function drawTree(){
  const cv=el('sim-tree'); if(!cv||!cv.clientWidth) return;
  const w=cv.clientWidth,h=cv.clientHeight;
  const ctx=setup(cv,w,h);
  const z=Math.max(0,Math.min(23,Math.round(num('tr_z')||8)));
  const vz=el('tr_zv'); if (vz) vz.textContent=z;
  const TAB=[[0,18.0,2.5,393],[1,12.2,2.3,427],[2,8.3,2.1,462],[4,4.5,2.5,392],[8,1.86,7.0,144],[16,0.60,180,5.40],[20,0.45,1600,0.60],[23,0.41,12000,0.09]];
  function tabAt(zv){
    if (zv<=0) return TAB[0];
    if (zv>=23) return TAB[TAB.length-1];
    let i=0; while(i<TAB.length-1 && TAB[i+1][0]<=zv) i++;
    const a=TAB[i], b=TAB[i+1], t=(zv-a[0])/(b[0]-a[0]);
    const lg=(x,y)=>Math.exp(Math.log(x)+(Math.log(y)-Math.log(x))*t);
    return [zv, lg(a[1],b[1]), lg(a[2],b[2]), lg(a[3],b[3])];
  }
  const r=tabAt(z), d=r[1], A=r[2], v=r[3];
  // árbol binario (profundidad visible acotada)
  const depth=Math.min(z,5);
  const rootX=w*0.16, rootY=h*0.16, tipX=w*0.78, tipY=h*0.84;
  function branch(x,y,dx,dy,lvl){
    const wd=Math.max(1.5, 26*Math.pow(0.62,lvl));
    ctx.strokeStyle=lvl%2?PAL.bone:PAL.boneDark;
    ctx.lineWidth=wd;
    ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+dx,y+dy); ctx.stroke();
    if (lvl<depth){
      const spread=0.30;
      branch(x+dx,y+dy, dx*(0.62-spread), dy+Math.abs(dx)*spread*2.4, lvl+1);
      branch(x+dx,y+dy, dx*(0.62-spread), dy-Math.abs(dx)*spread*2.4, lvl+1);
    }
  }
  branch(rootX,rootY, tipX-rootX, tipY-rootY, 0);
  text(ctx,'tráquea · z 0', rootX-6, rootY-10, {size:7,color:PAL.ink3});
  text(ctx,'alvéolos · z 23', w*0.86, h*0.90, {size:7,color:PAL.ink3});
  text(ctx,'2^'+z+' ≈ '+espan(Math.pow(2,z),0)+' vías', w*0.72, h*0.10, {size:9,weight:'700',color:PAL.teal});
  // panel de las tres curvas (escala log)
  const lx=w*0.06, lw=w*0.62, gy=h*0.55, gH=h*0.32;
  ctx.strokeStyle=PAL.line; ctx.lineWidth=1.2;
  ctx.strokeRect(lx,gy,lw,gH);
  const curves=[['d (mm)',0,'#0d6e64'],['A (cm²)',1,'#a92a1e'],['v (cm/s)',2,'#9a5b00']];
  let lo=Math.log10(0.4), hi=Math.log10(13000);
  curves.forEach(c=>{
    ctx.strokeStyle=c[2]; ctx.lineWidth=1.6; ctx.beginPath();
    for(let zv=0;zv<=23;zv++){
      const rr=tabAt(zv), val=rr[c[1]+1];
      const x=lx+zv/23*lw, y=gy+gH-(Math.log10(val)-lo)/(hi-lo)*gH;
      zv?ctx.lineTo(x,y):ctx.moveTo(x,y);
    }
    ctx.stroke();
    text(ctx,c[0], lx+lw+5, gy+gH*(1-(Math.log10(tabAt(23)[c[1]+1])-lo)/(hi-lo)), {size:7,align:'left',color:c[2]});
  });
  // marcador z actual
  const mx=lx+z/23*lw;
  dashed(ctx,mx,gy,mx,gy+gH,{color:PAL.ink,width:1.4});
  text(ctx,'z = '+z, mx, gy-6, {size:8,weight:'700',color:PAL.ink});
  text(ctx,'escala log', lx+lw/2, gy-14, {size:7,color:PAL.ink3});
  const out=el('tr_out');
  if (out) out.textContent='z = '+z+' · d ≈ '+espan(d,2)+' mm · A ≈ '+espan(A,0)+' cm² · v ≈ '+espan(v,1)+' cm/s · 2^'+z+' vías';
}

/* ═══════════════════════════════════════════════════════════
   S3 · El viaje del O₂ y del CO₂ por el circuito
   ═══════════════════════════════════════════════════════════ */
export function drawGas(){
  const cv=el('sim-gas'); if(!cv||!cv.clientWidth) return;
  const w=cv.clientWidth,h=cv.clientHeight;
  const ctx=setup(cv,w,h);
  const sel=el('gs_sel')?el('gs_sel').value:'aire';
  const ST={
    aire:['Aire',159,0.3],
    alveolo:['Alvéolos',105,40],
    capilar:['Capilar pulmonar',100,40,true],
    arteria:['Arteria sistémica',100,40],
    tejido:['Tejidos',40,46],
    vena:['Vena sistémica',40,46],
  };
  const keys=['aire','alveolo','capilar','arteria','tejido','vena'];
  const cx=w*0.5, cy=h*0.32, step=(w*0.82)/(keys.length);
  // camino: aire → alvéolo → capilar → arteria → tejido → vena
  keys.forEach((k,i)=>{
    const x=w*0.09+step*i;
    const on=k===sel;
    ctx.fillStyle=on?PAL.tealLight:PAL.line;
    ctx.beginPath(); ctx.arc(x,cy,on?17:14,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle=on?PAL.teal:PAL.ink3; ctx.lineWidth=on?2.4:1.2; ctx.stroke();
    if (on) text(ctx,ST[k][0], x, cy, {size:8,weight:'700',color:PAL.ink});
    if (i<keys.length-1){
      arrow(ctx, x+17, cy, x+step-17, cy, {color:on?PAL.blood:PAL.ink3,width:1.6,head:6});
    }
  });
  // barras de presiones del lugar seleccionado
  const st=ST[sel];
  let gy=h*0.55; const gmax=h*0.22, gscale=160;
  const rows=[['O₂',st[1],PAL.blood, st[3]?'40→100':'', 40],['CO₂',st[2],PAL.amber, st[3]?'46→40':'', 0.3]];
  rows.forEach(r=>{
    const lx=w*0.16, bw=Math.max(3, r[1]/gscale*(w*0.62));
    ctx.fillStyle=r[2]; ctx.fillRect(lx,gy,bw,gmax*0.5);
    ctx.strokeStyle=PAL.line; ctx.strokeRect(lx,gy,w*0.62,gmax*0.5);
    text(ctx,r[0], lx-10, gy+gmax*0.25, {size:9,weight:'700',align:'left',color:r[2]});
    text(ctx,(r[3]||'')+' → '+espan(r[1],0)+' mmHg', lx+bw+6, gy+gmax*0.25, {size:8,align:'left',color:PAL.ink});
    // referencia del otro extremo (venoso sistémico para O₂)
    if (r[0]==='O₂'){
      dashed(ctx,lx,gy+gmax*0.75,lx+w*0.62,gy+gmax*0.75,{color:PAL.ink3,width:1});
      text(ctx,'venoso sistémico ≈ 40 mmHg', lx, gy+gmax*0.75+10, {size:7,align:'left',color:PAL.ink3});
    }
    gy+=gmax*0.62;
  });
  text(ctx,'El O₂ fluye 159 → 40 mmHg; el CO₂ 0,3 → 46 mmHg', w/2, h*0.90, {size:8,color:PAL.ink3});
  const out=el('gs_out');
  if (out) out.textContent=st[0]+' · O₂ '+espan(st[1],0)+' mmHg · CO₂ '+espan(st[2],1);
}

/* ═══════════════════════════════════════════════════════════
   S4 · Ley de Laplace en un alvéolo: ΔP = 2γ/R
   ═══════════════════════════════════════════════════════════ */
export function drawLaplace(){
  const cv=el('sim-laplace'); if(!cv||!cv.clientWidth) return;
  const w=cv.clientWidth,h=cv.clientHeight;
  const ctx=setup(cv,w,h);
  const R=Math.max(20,Math.min(300,num('lp_r')||50));       // µm
  const vr=el('lp_rv'); if (vr) vr.textContent=espan(R,0)+' µm';
  const gam=(el('lp_g')?el('lp_g').value:'water')==='water'?7.2e-2:1e-3;
  const Rm=R*1e-6;
  const dP=2*gam/Rm;                          // Pa
  const dPmmHg=dP/133.322;
  const F=dP*0.05;                            // A=500 cm² = 0.05 m²
  // alvéolo
  const cx=w*0.30, cy=h*0.42;
  const rad=Math.max(6,Math.min(120, R/2.6));
  ctx.beginPath(); ctx.arc(cx,cy,rad,0,Math.PI*2);
  ctx.fillStyle=gam>0.01?'rgba(169,42,30,.10)':'rgba(13,110,100,.14)';
  ctx.fill();
  ctx.strokeStyle=gam>0.01?PAL.blood:PAL.teal; ctx.lineWidth=2.4; ctx.stroke();
  text(ctx,'R = '+espan(R,0)+' µm', cx, cy, {size:10,weight:'700',color:PAL.ink});
  text(ctx,gam>0.01?'interfaz agua/aire':'con surfactante', cx, cy+14, {size:7,color:PAL.ink3});
  // flechas de presión hacia afuera
  for(let a=0;a<6;a++){
    const ang=a/6*Math.PI*2;
    const x0=cx+Math.cos(ang)*rad*0.9, y0=cy+Math.sin(ang)*rad*0.9;
    const x1=cx+Math.cos(ang)*(rad*0.9+16), y1=cy+Math.sin(ang)*(rad*0.9+16);
    arrow(ctx,x0,y0,x1,y1,{color:PAL.blood,width:1.8,head:6});
  }
  // manómetro ΔP
  const gx=w*0.62, gy=h*0.20, gw=w*0.30, gmax=h*0.55, Pmax=Math.max(30,dPmmHg*1.1);
  ctx.strokeStyle=PAL.line; ctx.lineWidth=1.2;
  ctx.strokeRect(gx,gy,gw,gmax);
  const bh=Math.max(3, dPmmHg/Pmax*gmax);
  ctx.fillStyle=PAL.amber; ctx.fillRect(gx,gy+gmax-bh,gw,bh);
  text(ctx,'ΔP', gx+gw/2, gy-10, {size:9,weight:'700',color:PAL.amber});
  text(ctx,espan(dPmmHg,1)+' mmHg', gx+gw/2, gy+gmax-bh/2, {size:10,weight:'700',color:'#fbf8f0'});
  text(ctx,espan(Pmax,0)+' mmHg', gx+gw/2, gy+gmax+12, {size:7,color:PAL.ink3});
  // fuerza del diafragma
  const fx=w*0.62, fy=h*0.70, fw=w*0.30, fmax=h*0.16, Fmax=200;
  ctx.strokeStyle=PAL.line; ctx.lineWidth=1.2;
  ctx.strokeRect(fx,fy,fw,fmax);
  ctx.fillStyle=PAL.teal; ctx.fillRect(fx,fy+fmax-Math.max(2,F/Fmax*fmax),fw,Math.max(2,F/Fmax*fmax));
  text(ctx,'F ≈ '+espan(F/9.81,0)+' kg (diafragma)', fx+fw/2, fy+fmax+14, {size:8,color:PAL.teal});
  const out=el('lp_out');
  if (out) out.textContent='ΔP = '+espan(dPmmHg,0)+' mmHg · F ≈ '+espan(F/9.81,0)+' kg';
}

/* ═══════════════════════════════════════════════════════════
   S5 · Dos burbujas conectadas: la grande devora a la pequeña
   ═══════════════════════════════════════════════════════════ */
export function toggleBubbles(){
  window.__bbPlaying=!window.__bbPlaying;
  const b=el('bb_play'); if (b) b.textContent=window.__bbPlaying?'⏸':'▶';
  if (window.__bbPlaying){ window.__bbT=0; window.__bbR1=undefined; window.__bbR2=undefined; }
  drawBubbles();
}
export function drawBubbles(){
  const cv=el('sim-bubbles'); if(!cv||!cv.clientWidth) return;
  const w=cv.clientWidth,h=cv.clientHeight;
  const ctx=setup(cv,w,h);
  const R1=70;
  const ratio=Math.max(0.3,Math.min(0.9,(num('bb_r2')||55)/100));
  const vr=el('bb_r2v'); if (vr) vr.textContent=espan(ratio,2);
  const initR2=R1*ratio;
  let r1, r2;
  if (window.__bbPlaying){
    r1=window.__bbR1!==undefined?window.__bbR1:R1;
    r2=window.__bbR2!==undefined?window.__bbR2:initR2;
    const dt=Math.min(0.06, window.__bbDt||0.016);
    if (r2>1.5){
      const P1=2/r1, P2=2/r2;
      const flow=Math.min(4e5, Math.max(0,(P2-P1))*3e6);
      let V2=(4/3)*Math.PI*Math.pow(r2,3);
      V2=Math.max(1, V2-flow*dt);
      r2=Math.cbrt(V2*3/(4*Math.PI));
      const Vtot=(4/3)*Math.PI*(Math.pow(R1,3)+Math.pow(initR2,3));
      r1=Math.cbrt((Vtot-V2)*3/(4*Math.PI));
    }
    window.__bbR1=r1; window.__bbR2=r2;
  } else { r1=R1; r2=initR2; }
  const cy=h*0.45;
  const x1=w*0.26, x2=w*0.74;
  // tubo conector
  ctx.strokeStyle=PAL.line; ctx.lineWidth=5;
  ctx.beginPath(); ctx.moveTo(x1,cy); ctx.lineTo(x2,cy); ctx.stroke();
  ctx.strokeStyle=PAL.paper; ctx.lineWidth=2.4;
  ctx.beginPath(); ctx.moveTo(x1,cy); ctx.lineTo(x2,cy); ctx.stroke();
  // válvula central
  const vx=(x1+x2)/2;
  if (!window.__bbPlaying){
    ctx.strokeStyle=PAL.ink; ctx.lineWidth=2.6;
    ctx.beginPath(); ctx.moveTo(vx-9,cy-16); ctx.lineTo(vx+9,cy-16); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(vx-9,cy+16); ctx.lineTo(vx+9,cy+16); ctx.stroke();
    text(ctx,'tapón cerrado', vx, cy-26, {size:8,weight:'700',color:PAL.ink});
  } else {
    text(ctx,'abierta →', vx, cy-22, {size:8,weight:'700',color:PAL.blood});
    for (let i=0;i<6;i++){
      const t=i/6;
      const x=Math.max(x1+20, vx-60+ t*46);
      arrow(ctx, x+8, cy, x-8, cy, {color:PAL.blood,width:2,head:6});
    }
  }
  // burbuja 1 (grande, teal) y burbuja 2 (pequeña, sangre)
  ctx.fillStyle=PAL.tealLight+'55';
  ctx.strokeStyle=PAL.teal; ctx.lineWidth=2.4;
  ctx.beginPath(); ctx.arc(x1,cy,Math.min(150,r1),0,Math.PI*2); ctx.fill(); ctx.stroke();
  text(ctx,'#1', x1, cy, {size:9,weight:'700',color:PAL.ink});
  text(ctx,'P₁ = 2γ/R₁', x1, cy+16, {size:7,color:PAL.ink3});
  ctx.fillStyle='rgba(169,42,30,.35)';
  ctx.strokeStyle=PAL.blood; ctx.lineWidth=2.4;
  ctx.beginPath(); ctx.arc(x2,cy,Math.max(2.5,Math.min(110,r2)),0,Math.PI*2); ctx.fill(); ctx.stroke();
  if (r2<=3){
    text(ctx,'colapsada', x2, cy+16, {size:8,weight:'700',color:PAL.blood});
  } else {
    text(ctx,'#2', x2, cy, {size:9,weight:'700',color:PAL.ink});
    text(ctx,'P₂ = 4γ/R₂ > P₁', x2, cy+16, {size:7,color:PAL.ink3});
  }
  const out=el('bb_out');
  if (out) out.textContent=window.__bbPlaying
    ? (r2<=3?'#2 colapsada · P₁ ≈ 2γ/R₁':'fluyendo #2 → #1 · R₂ = '+espan(r2,0)+' px')
    : 'P₂ > P₁ · al abrir, #2 colapsa';
}

/* ═══════════════════════════════════════════════════════════
   S6 · Surfactante: γ(R) y ΔP(R) con equilibrio en √3·R₀
   ═══════════════════════════════════════════════════════════ */
export function drawSurfactant(){
  const cv=el('sim-surfactant'); if(!cv||!cv.clientWidth) return;
  const w=cv.clientWidth,h=cv.clientHeight;
  const ctx=setup(cv,w,h);
  const R0=Math.max(20,Math.min(100,num('sf_r0')||50));
  const vr=el('sf_r0v'); if (vr) vr.textContent=espan(R0,0)+' µm';
  const mode=el('sf_sel')?el('sf_sel').value:'dp';
  const gp=1e-3, gw=7.2e-2;
  const Req=R0*Math.sqrt(3);
  // curvas sobre R ∈ [0, 4R0]
  const Rmax=4*R0;
  const lx=w*0.08, lw=w*0.76, gy=h*0.14, gH=h*0.64;
  ctx.strokeStyle=PAL.line; ctx.lineWidth=1.2;
  ctx.strokeRect(lx,gy,lw,gH);
  let ymax, ymin, lo=0, hi;
  if (mode==='dp'){
    // ΔP en mmHg: 2γ/R con R en m
    const f=R=>2*(R<=R0?gp:gw-(R0*R0/(R*R))*(gw-gp))/(R*1e-6)/133.322;
    hi=2*(gw)/(R0*0.5*1e-6)/133.322;  // valor en R=0.5R0
    hi=Math.min(60, hi);
    const Y=(P: number)=>gy+gH-(P-lo)/(hi-lo)*gH;
    ctx.strokeStyle=PAL.teal; ctx.lineWidth=2.2; ctx.beginPath();
    for(let i=0;i<=180;i++){
      const R=R0*0.1+i/180*(Rmax-R0*0.1);
      const x=lx+(R-0)/Rmax*lw, y=Y(f(R));
      i?ctx.lineTo(x,y):ctx.moveTo(x,y);
    }
    ctx.stroke();
    for(let i=1;i<=4;i++){ const R=R0*0.1+i/180*(Rmax-R0*0.1); if(f(R)>hi) break; }
    text(ctx,'ΔP = 2γ(R)/R (mmHg)', lx+lw/2, gy-10, {size:8,color:PAL.teal});
    // marcadores R0 y Req
    dashed(ctx,lx+R0/Rmax*lw,gy,lx+R0/Rmax*lw,gy+gH,{color:PAL.amber,width:1.4});
    text(ctx,'R₀', lx+R0/Rmax*lw, gy+gH+12, {size:7,color:PAL.amber});
    dashed(ctx,lx+Req/Rmax*lw,gy,lx+Req/Rmax*lw,gy+gH,{color:PAL.blood,width:1.4});
    text(ctx,'R_eq ≈ √3·R₀', lx+Req/Rmax*lw, gy+gH+12, {size:7,color:PAL.blood});
    text(ctx,'R (µm)', lx+lw/2, gy+gH+22, {size:7,color:PAL.ink3});
  } else {
    const f=R=>R<=R0?gp:gw-(R0*R0/(R*R))*(gw-gp);
    hi=gw*1.05;
    const Y=(v: number)=>gy+gH-(v-lo)/(hi-lo)*gH;
    ctx.strokeStyle=PAL.teal; ctx.lineWidth=2.2; ctx.beginPath();
    for(let i=0;i<=180;i++){
      const R=R0*0.1+i/180*(Rmax-R0*0.1);
      const x=lx+(R-0)/Rmax*lw, y=Y(f(R));
      i?ctx.lineTo(x,y):ctx.moveTo(x,y);
    }
    ctx.stroke();
    text(ctx,'γ(R) en N/m', lx+lw/2, gy-10, {size:8,color:PAL.teal});
    dashed(ctx,lx+R0/Rmax*lw,gy,lx+R0/Rmax*lw,gy+gH,{color:PAL.amber,width:1.4});
    text(ctx,'R₀', lx+R0/Rmax*lw, gy+gH+12, {size:7,color:PAL.amber});
    text(ctx,'plana para R < R₀ · sube a γ_agua', lx+lw/2, gy+gH+12, {size:7,color:PAL.ink3});
  }
  // escala vertical
  for(let i=0;i<=4;i++){
    const y=gy+gH*(1-i/4);
    text(ctx,espan(lo+(hi-lo)*i/4, mode==='dp'?0:3), lx-6, y, {size:7,align:'right',color:PAL.ink3});
  }
  const out=el('sf_out');
  if (out) out.textContent='R_eq ≈ '+espan(Req,0)+' µm · d(ΔP)/dR = 0';
}

/* ═══════════════════════════════════════════════════════════
   S7 · Pleura y presión transpulmonar
   ═══════════════════════════════════════════════════════════ */
export function drawPleura(){
  const cv=el('sim-pleura'); if(!cv||!cv.clientWidth) return;
  const w=cv.clientWidth,h=cv.clientHeight;
  const ctx=setup(cv,w,h);
  const Pp=Math.max(-10,Math.min(0,num('pl_pp')||-5));
  const vp=el('pl_ppv'); if (vp) vp.textContent=espan(Pp,0)+' mmHg';
  const Pt=0-Pp;                       // P_alveolar − P_pleura (alveolar ≈ 0)
  const cx=w*0.36, cy=h*0.44;
  const base=Math.min(95, 40+Pt*9);    // radio del pulmón
  const ring=base+16;                  // cavidad torácica
  // cavidad torácica (pared)
  ctx.strokeStyle=PAL.boneEdge; ctx.lineWidth=5;
  ctx.beginPath(); ctx.arc(cx,cy,ring+8,0,Math.PI*2); ctx.stroke();
  ctx.strokeStyle=PAL.line; ctx.lineWidth=1.2;
  ctx.beginPath(); ctx.arc(cx,cy,ring,0,Math.PI*2); ctx.stroke();
  // líquido intrapleural (anillo)
  ctx.fillStyle=PAL.tealLight+'44';
  ctx.beginPath(); ctx.arc(cx,cy,ring,0,Math.PI*2); ctx.fill();
  // pulmón
  ctx.fillStyle=PAL.blood+'22';
  ctx.strokeStyle=PAL.blood; ctx.lineWidth=2.4;
  ctx.beginPath(); ctx.arc(cx,cy,base,0,Math.PI*2); ctx.fill(); ctx.stroke();
  text(ctx,'pulmón', cx, cy, {size:9,weight:'700',color:PAL.ink});
  text(ctx,'V ∝ P_trans', cx, cy+14, {size:7,color:PAL.ink3});
  // flechas del saco
  const a=-Math.PI/3;
  const r0=(base+ring)/2;
  arrow(ctx, cx+Math.cos(a)*ring, cy+Math.sin(a)*ring, cx+Math.cos(a)*base, cy+Math.sin(a)*base, {color:PAL.teal,width:2,head:6});
  arrow(ctx, cx+Math.cos(a)*base, cy+Math.sin(a)*base, cx+Math.cos(a)*ring, cy+Math.sin(a)*ring, {color:PAL.amber,width:2,head:6});
  text(ctx,'atracción visceral↔parietal', cx+Math.cos(a)*r0, cy+Math.sin(a)*r0-8, {size:7,color:PAL.ink3});
  // lectura de presiones
  const gx=w*0.66, gy=h*0.18, gw=w*0.26, gmax=h*0.55, P0=10;
  ctx.strokeStyle=PAL.line; ctx.lineWidth=1.2;
  ctx.strokeRect(gx,gy,gw,gmax);
  const rows=[['P_pleura',Pp,PAL.amber,-10,0],['P_trans',Pt,PAL.teal,0,10]];
  let y=gy+gmax*0.14;
  rows.forEach(r=>{
    const [name,val,col,lo,hi]=r;
    text(ctx,name, gx+gw/2, y-8, {size:8,color:PAL.ink});
    const bh=Math.max(2,(val-lo)/(hi-lo)*gmax*0.22);
    ctx.fillStyle=col; ctx.fillRect(gx,y,Math.min(gw,bh),gmax*0.22);
    ctx.strokeStyle=PAL.line; ctx.strokeRect(gx,y,gw,gmax*0.22);
    text(ctx,espan(val,1)+' mmHg', gx+gw/2, y+gmax*0.11, {size:8,weight:'700',color:'#fbf8f0'});
    y+=gmax*0.30;
  });
  const out=el('pl_out');
  if (out) out.textContent='P_trans = '+espan(Pt,1)+' mmHg · pulmón '+(Pt<2?'colapsado':'expandido');
}

/* ═══════════════════════════════════════════════════════════
   S8 · Ciclo inspiración/espiración: diafragma y presiones
   ═══════════════════════════════════════════════════════════ */
export function toggleBreath(){
  window.__brPlaying=!window.__brPlaying;
  const b=el('br_play'); if (b) b.textContent=window.__brPlaying?'⏸':'▶';
  if (window.__brPlaying) window.__brT=0;
  drawBreath();
}
export function drawBreath(){
  const cv=el('sim-breath'); if(!cv||!cv.clientWidth) return;
  const w=cv.clientWidth,h=cv.clientHeight;
  const ctx=setup(cv,w,h);
  const rate=Math.max(6,Math.min(30,num('br_rate')||12));
  const vr=el('br_ratev'); if (vr) vr.textContent=espan(rate,0)+' /min';
  const T=60/rate;
  const p=(window.__brT%T)/T;                    // fase 0..1
  const insp=p<0.5;
  const u=insp?p/0.5:(1-p)/0.5;                  // 0→1 en cada mitad
  const s=Math.sin(Math.PI*u);                   // 0→1→0
  const V=2.2+0.5*s;                             // L (FRC 2.2 + Vt 0.5)
  const Ppl=insp?(-4-2*s):(-4-2*s);              // −4 → −6 (sube el gradiente al inspirar)
  const Pa=insp?(-1*s):0;                        // −1 al inspirar, 0 al espirar
  const dx=h*0.52-8*s;                           // descenso del diafragma
  // caja torácica
  const tx=w*0.14, ty=h*0.10, tw=w*0.40, th=h*0.66;
  ctx.strokeStyle=PAL.boneEdge; ctx.lineWidth=4;
  ctx.strokeRect(tx,ty,tw,th);
  // pulmones
  const lw2=tw*0.26, lh2=(th*0.72)*(0.9+0.12*s);
  ctx.fillStyle=PAL.blood+'33';
  ctx.strokeStyle=PAL.blood; ctx.lineWidth=2;
  ctx.beginPath(); ctx.ellipse(tx+tw*0.30, ty+th*0.38, lw2, lh2, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(tx+tw*0.70, ty+th*0.38, lw2, lh2, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  // tráquea
  ctx.strokeStyle=PAL.ink3; ctx.lineWidth=3;
  ctx.beginPath(); ctx.moveTo(tx+tw/2, ty-6); ctx.lineTo(tx+tw/2, ty+th*0.18); ctx.stroke();
  // diafragma (arco)
  ctx.strokeStyle=PAL.teal; ctx.lineWidth=3;
  ctx.beginPath(); ctx.moveTo(tx, ty+th+8); ctx.quadraticCurveTo(tx+tw/2, ty+th+8+dx, tx+tw, ty+th+8); ctx.stroke();
  text(ctx, insp?'inspiración':'espiración', tx+tw/2, ty-14, {size:10,weight:'700',color:insp?PAL.teal:PAL.amber});
  text(ctx,'diafragma '+(insp?'desciende':'asciende'), tx+tw/2, ty+th+26, {size:7,color:PAL.teal});
  // panel de presiones
  const gx=w*0.60, gy=h*0.12, gw=w*0.32, gmax=h*0.62;
  ctx.strokeStyle=PAL.line; ctx.lineWidth=1.2;
  ctx.strokeRect(gx,gy,gw,gmax);
  const rows=[['P_alveolar (mmHg)',Pa,-1,1,PAL.blood],['P_pleura (mmHg)',Ppl,-8,0,PAL.amber],['V (L)',V,0,3,PAL.teal]];
  let y=gy+gmax*0.10;
  rows.forEach(r=>{
    const [name,val,lo,hi,col]=r;
    text(ctx,name, gx+gw/2, y-8, {size:7,color:PAL.ink});
    const bx=gx+gw*0.12, bw=gw*0.76;
    ctx.fillStyle=PAL.line; ctx.fillRect(bx,y,bw,gmax*0.18);
    ctx.fillStyle=col;
    const frac=Math.max(0,Math.min(1,(val-lo)/(hi-lo)));
    ctx.fillRect(bx,y,bw*frac,gmax*0.18);
    text(ctx,espan(val,1), gx+gw/2, y+gmax*0.09, {size:8,weight:'700',color:PAL.ink});
    text(ctx,espan(lo,0)+'|'+espan(hi,0), gx+gw*0.05, y+gmax*0.09, {size:6,align:'left',color:PAL.ink3});
    y+=gmax*0.26;
  });
  const out=el('br_out');
  if (out) out.textContent='P_alveolar '+espan(Pa,1)+' · P_pleura '+espan(Ppl,1)+' · V = '+espan(V,1)+' L · '+(insp?'inspiración':'espiración');
}

/* ═══════════════════════════════════════════════════════════
   S9 · Espirómetro: volúmenes pulmonares y espiriograma
   ═══════════════════════════════════════════════════════════ */
export function toggleSpiro(){
  window.__spPlaying=!window.__spPlaying;
  const b=el('sp_play'); if (b) b.textContent=window.__spPlaying?'⏸':'▶';
  if (window.__spPlaying) window.__spT=0;
  window.__spHist=[];
  drawSpiro();
}
export function drawSpiro(){
  const cv=el('sim-spiro'); if(!cv||!cv.clientWidth) return;
  const w=cv.clientWidth,h=cv.clientHeight;
  const ctx=setup(cv,w,h);
  const mode=el('sp_mode')?el('sp_mode').value:'normal';
  const T=4;
  const p=(window.__spT%T)/T;
  let V;
  if (mode==='normal') V=2.2+1.0*Math.sin(Math.PI*p)*Math.sin(Math.PI*p);      // 2,2 ↔ 3,2
  else V=1.6+3.9*Math.sin(Math.PI*p)*Math.sin(Math.PI*p);                      // profunda: 1,6 ↔ 5,5
  if (window.__spPlaying||window.__spHist.length){
    window.__spHist.push(V);
    if (window.__spHist.length>260) window.__spHist.shift();
  } else { window.__spHist=[V]; }
  // bandas de compartimentos
  const lx=w*0.08, lw=w*0.78, gy=h*0.12, gH=h*0.60, Vmin=0, Vmax=6;
  const Y=(v: number)=>gy+gH*(1-(v-Vmin)/(Vmax-Vmin));
  const bands=[['VR 1 L',1,PAL.ink3],['VRE',1,2.2,PAL.ink3],['respiración normal',2.2,3.2,PAL.teal],['VRI',3.2,6,PAL.amber]];
  bands.forEach(bd=>{
    if (bd.length===4){
      ctx.fillStyle=bd[3]+'22';
      ctx.fillRect(lx,Y(bd[2]),lw,Y(bd[1])-Y(bd[2]));
      text(ctx,bd[0], lx+6, (Y(bd[1])+Y(bd[2]))/2, {size:7,align:'left',color:bd[3]});
    } else {
      const [name,val,col]=bd;
      dashed(ctx,lx,Y(val),lx+lw,Y(val),{color:col,width:1});
      text(ctx,name, lx+6, Y(val)-4, {size:7,align:'left',color:col});
    }
  });
  dashed(ctx,lx,Y(5),lx+lw,Y(5),{color:PAL.ink3,width:1});
  text(ctx,'CPT 6 L', lx+6, Y(5)-4, {size:7,align:'left',color:PAL.ink3});
  dashed(ctx,lx,Y(2.2),lx+lw,Y(2.2),{color:PAL.ink3,width:1});
  text(ctx,'CRF 2,2 L', lx+lw-6, Y(2.2)+4, {size:7,align:'right',color:PAL.ink3});
  // traza
  ctx.strokeStyle=PAL.blood; ctx.lineWidth=2.2; ctx.beginPath();
  const hist=window.__spHist;
  for(let i=0;i<hist.length;i++){
    const x=lx+lw-i/(hist.length-1)*lw;
    const y=Y(hist[i]);
    i?ctx.lineTo(x,y):ctx.moveTo(x,y);
  }
  ctx.stroke();
  text(ctx,'volumen pulmonar (L) · V_t = '+(mode==='normal'?'1,0':'3,9')+' L', w/2, h*0.86, {size:8,color:PAL.ink3});
  const out=el('sp_out');
  if (out) out.textContent='V = '+espan(V,1)+' L · '+mode;
}

/* ═══════════════════════════════════════════════════════════
   S10 · Curva P–V del pulmón con histéresis
   ═══════════════════════════════════════════════════════════ */
export function drawPVCurve(){
  const cv=el('sim-pvcurve'); if(!cv||!cv.clientWidth) return;
  const w=cv.clientWidth,h=cv.clientHeight;
  const ctx=setup(cv,w,h);
  const t=Math.max(0,Math.min(100,num('pc_t')||20));
  const vt=el('pc_tv'); if (vt) vt.textContent=espan(t,0)+' %';
  const infl=t<=50;
  const u=infl?t/50:(100-t)/50;
  const P0=2, P1=16;
  const P=infl?P0+(P1-P0)*u:P1-(P1-P0)*u;
  const Vstatic=(P: number)=>5.8*(1-Math.exp(-P/9));
  const hyst=0.30*Math.sin(Math.PI*u);
  const V=(infl?Vstatic(P)-hyst:Vstatic(P)+hyst);
  const C=5.8/9*Math.exp(-P/9);
  // ejes
  const lx=w*0.10, lw=w*0.72, gy=h*0.14, gH=h*0.60, Pmax=20, Vmax=6;
  const X=(p: number)=>lx+p/Pmax*lw, Y=(v: number)=>gy+gH*(1-v/Vmax);
  ctx.strokeStyle=PAL.line; ctx.lineWidth=1.2;
  ctx.beginPath(); ctx.moveTo(lx,gy); ctx.lineTo(lx,gy+gH); ctx.lineTo(lx+lw,gy+gH); ctx.stroke();
  text(ctx,'P_transpulmonar (cmH₂O)', lx+lw/2, gy+gH+20, {size:7,color:PAL.ink3});
  text(ctx,'V (L)', lx-8, gy, {size:7,color:PAL.ink3});
  // curvas de inflado y desinflado
  function plot(off: any, color: any){
    ctx.strokeStyle=color; ctx.lineWidth=1.8; ctx.beginPath();
    for(let i=0;i<=120;i++){
      const pp=P0+(P1-P0)*i/120;
      const vv=Vstatic(pp)+(off?0.30*Math.sin(Math.PI*i/120):-0.30*Math.sin(Math.PI*i/120));
      const x=X(pp), y=Y(vv);
      i?ctx.lineTo(x,y):ctx.moveTo(x,y);
    }
    ctx.stroke();
  }
  plot(true, PAL.amber);
  plot(false, PAL.teal);
  text(ctx,'inflado', X(P1)+6, Y(0.6), {size:7,color:PAL.teal});
  text(ctx,'desinflado', X(P1)+6, Y(0.9), {size:7,color:PAL.amber});
  // punto actual + tangente (compliancia)
  const px=X(P), py=Y(V);
  ctx.beginPath(); ctx.arc(px,py,5,0,Math.PI*2);
  ctx.fillStyle=PAL.blood; ctx.fill(); ctx.strokeStyle='#fbf8f0'; ctx.lineWidth=1.5; ctx.stroke();
  const ang=Math.atan2(-C*(Vmax/gH)*80, (1/(Pmax/lw))*C*6);
  const L=40;
  ctx.strokeStyle=PAL.blood; ctx.lineWidth=1.6;
  ctx.beginPath(); ctx.moveTo(px-Math.cos(ang)*L, py+Math.sin(ang)*L); ctx.lineTo(px+Math.cos(ang)*L, py-Math.sin(ang)*L); ctx.stroke();
  text(ctx,'pendiente = C ≈ '+espan(C,2)+' L/cmH₂O', px+10, py-12, {size:7,color:PAL.blood});
  const out=el('pc_out');
  if (out) out.textContent=(infl?'inflando · ':'desinflando · ')+'C ≈ '+espan(C,2)+' L/cmH₂O';
}

/* ═══════════════════════════════════════════════════════════
   S11 · Mezcla: aire inspirado + viciado → balance (ec. 9.9–9.10)
   ═══════════════════════════════════════════════════════════ */
export function drawMix(){
  const cv=el('sim-mix'); if(!cv||!cv.clientWidth) return;
  const w=cv.clientWidth,h=cv.clientHeight;
  const ctx=setup(cv,w,h);
  const A=(num('mx_alpha')||33)/100, B=(num('mx_beta')||25)/100;
  const va=el('mx_alphav'); if (va) va.textContent=espan(A,2);
  const vb=el('mx_betav'); if (vb) vb.textContent=espan(B,2);
  let x=(16-20*A+20*A*B)/(1-A);
  let y=(4-20*A*B)/(1-A);
  x=Math.max(0,x); y=Math.max(0,y);
  // dos barras apiladas: inspirado y viciado
  const bar=(label: any, bx: any, by: any, bw: any, bh: any, o2: any, co2: any, n2: any, col?: any)=>{
    ctx.fillStyle=PAL.teal; ctx.fillRect(bx,by,bw*n2/100,bh);
    ctx.fillStyle=PAL.blood; ctx.fillRect(bx+bw*n2/100,by,bw*o2/100,bh);
    ctx.fillStyle=PAL.amber; ctx.fillRect(bx+bw*(n2+o2)/100,by,bw*co2/100,bh);
    ctx.strokeStyle=PAL.line; ctx.lineWidth=1.2; ctx.strokeRect(bx,by,bw,bh);
    text(ctx,label, bx+bw/2, by-10, {size:8,weight:'700',color:PAL.ink});
    if (o2>5) text(ctx,espan(o2,1)+' % O₂', bx+bw*n2/100+bw*o2/200, by+bh/2, {size:8,weight:'700',color:'#fbf8f0'});
  };
  const bx=w*0.12, bw=w*0.76, by=h*0.30, bh=h*0.16;
  bar('Inspirado (80/20/0)', bx, by, bw, bh, 20.9, 0.04, 79.0);
  bar('Viciado (80/x/y)', bx, by+bh+0.14*h, bw, bh, x, y, 80);
  // caja de mezcla entre ambos
  const mx=w*0.5, my=by+bh+0.14*h;
  ctx.strokeStyle=PAL.teal; ctx.lineWidth=1.4;
  ctx.beginPath(); ctx.moveTo(w*0.05,my+bh/2); ctx.lineTo(bx-10,my+bh/2); ctx.moveTo(bx+bw+10,my+bh/2); ctx.lineTo(w*0.95,my+bh/2); ctx.stroke();
  text(ctx,'mezcla con el residual (α = '+espan(A,2)+', β = '+espan(B,2)+')', w/2, my+bh+18, {size:8,color:PAL.teal});
  // ecuaciones resueltas
  text(ctx,'(1−α)x = 16 − 20α(1−β)  ·  (1−α)y = 4 − 20αβ', w/2, h*0.80, {size:8,color:PAL.ink3});
  const out=el('mx_out');
  if (out) out.textContent='viciado: O₂ '+espan(x,1)+' % · CO₂ '+espan(y,1)+' %';
}

/* ═══════════════════════════════════════════════════════════
   S12 · Resistencia de las vías aéreas por generación (Weibel)
   ═══════════════════════════════════════════════════════════ */
export function drawAirRes(){
  const cv=el('sim-airres'); if(!cv||!cv.clientWidth) return;
  const w=cv.clientWidth,h=cv.clientHeight;
  const ctx=setup(cv,w,h);
  const mode=el('ar_sel')?el('ar_sel').value:'r';
  const D=[1.80,1.22,0.83,0.56,0.45,0.35,0.28,0.23,0.186,0.154,0.130,0.109,0.095,0.082,0.074,0.066,0.060,0.054,0.050,0.047,0.045,0.043,0.041,0.041]; // cm
  const L=[12.0,4.8,1.9,0.76,1.27,1.07,0.90,0.76,0.64,0.54,0.46,0.39,0.33,0.27,0.23,0.20,0.165,0.141,0.117,0.099,0.083,0.070,0.059,0.050]; // cm
  const eta=2e-5;
  const Rgen: number[] = [];
  for(let z=0;z<24;z++){
    const d=D[z]*1e-2, l=L[z]*1e-2;
    const Rs=8*eta*l/(Math.PI*Math.pow(d/2,4));
    Rgen.push(Rs/Math.pow(2,z));
  }
  const total=Rgen.reduce((s,r)=>s+r,0);
  let zmax=0; Rgen.forEach((r,i)=>{ if(r>Rgen[zmax]) zmax=i; });
  const lx=w*0.06, lw=w*0.62, gy=h*0.12, gH=h*0.62;
  ctx.strokeStyle=PAL.line; ctx.lineWidth=1.2;
  ctx.strokeRect(lx,gy,lw,gH);
  const M=Math.max(...Rgen);
  const val=(r: number)=>mode==='r'?r:1/(r||1e-9);
  const Vmax=Math.max(...Rgen.map(val));
  Rgen.forEach((r,i)=>{
    const v=val(r);
    const bw=(lw-10)/24, x=lx+4+i*bw;
    const bh=Math.max(1.5, v/Vmax*(gH-14));
    ctx.fillStyle=i===zmax?PAL.blood:(mode==='r'?PAL.teal:PAL.amber);
    ctx.fillRect(x,gy+gH-8-bh,bw-1.5,bh);
    if (i%2===0) text(ctx,String(i), x+bw/2, gy+gH+6, {size:5.5,color:PAL.ink3});
  });
  text(ctx,'z máxima: '+zmax+' (bronquios intermedios)', w/2, h*0.86, {size:8,weight:'700',color:PAL.blood});
  text(ctx,'generación z', lx+lw/2, gy+gH+14, {size:7,color:PAL.ink3});
  text(ctx,mode==='r'?'R_z (rel.)':'conductancia 1/R (rel.)', lx+lw/2, gy-8, {size:7,color:PAL.ink3});
  const out=el('ar_out');
  if (out) out.textContent='máx en z ≈ '+zmax+' · Σ R('+espan(total*1.0197e-5,2)+' cmH₂O/(L/s)) · libro R_vías ≈ 2';
}

/* ═══════════════════════════════════════════════════════════
   S13 · Medio ciclo senoidal: ΔP, Q, R_flow y Re
   ═══════════════════════════════════════════════════════════ */
export function drawSine(){
  const cv=el('sim-sine'); if(!cv||!cv.clientWidth) return;
  const w=cv.clientWidth,h=cv.clientHeight;
  const ctx=setup(cv,w,h);
  const dPm=Math.max(0.5,Math.min(2.5,num('sn_pmax')||1.1));
  const vin=Math.max(300,Math.min(800,num('sn_vin')||500));
  const vp=el('sn_pmaxv'); if (vp) vp.textContent=espan(dPm,1)+' mmHg';
  const vv=el('sn_vinv'); if (vv) vv.textContent=espan(vin/1000,1)+' L';
  const f=15/60;                       // 15/min
  const Thalf=1/(2*f);                 // 2 s
  const dPa=2/Math.PI*dPm;
  const Qa=vin/1000/Thalf;
  const Qm=Math.PI/2*Qa;
  const Rf=dPa*133.322/(Qa*1e-3);
  const u=Qm*1000/2.545;               // cm/s en tráquea
  const Re=10.44*u;
  const lx=w*0.08, lw=w*0.78, gy=h*0.14, gH=h*0.56;
  const X=(t: number)=>lx+t/Thalf*lw, Y=(v,vmax)=>gy+gH/2-gH/2*(v/vmax);
  ctx.strokeStyle=PAL.line; ctx.lineWidth=1.2;
  ctx.strokeRect(lx,gy,lw,gH);
  dashed(ctx,lx,gy+gH/2,lx+lw,gy+gH/2,{color:PAL.ink3,width:1});
  text(ctx,'0', lx-6, gy+gH/2, {size:7,color:PAL.ink3});
  // ΔP(t) y Q(t) superpuestos (misma forma)
  ctx.strokeStyle=PAL.teal; ctx.lineWidth=2.2; ctx.beginPath();
  for(let i=0;i<=100;i++){
    const t=Thalf*i/100;
    const x=X(t), y=Y(dPm*Math.sin(Math.PI*i/100), dPm);
    i?ctx.lineTo(x,y):ctx.moveTo(x,y);
  }
  ctx.stroke();
  ctx.strokeStyle=PAL.blood; ctx.lineWidth=1.6; ctx.beginPath();
  for(let i=0;i<=100;i++){
    const t=Thalf*i/100;
    const x=X(t), y=Y(Qm*Math.sin(Math.PI*i/100), Qm);
    i?ctx.lineTo(x,y):ctx.moveTo(x,y);
  }
  ctx.stroke();
  text(ctx,'ΔP(t) (mmHg)', lx+lw*0.5, gy+8, {size:7,color:PAL.teal});
  text(ctx,'Q(t) (L/s)', lx+lw*0.72, gy+8, {size:7,color:PAL.blood});
  // ΔP_av
  const yav=Y(dPa, dPm);
  dashed(ctx,lx,yav,lx+lw,yav,{color:PAL.amber,width:1.4});
  text(ctx,'ΔP_av = 2/π·ΔP_max', lx+6, yav-5, {size:7,align:'left',color:PAL.amber});
  text(ctx,'T_media = 1/(2f) = 2 s', lx+lw/2, gy+gH+16, {size:7,color:PAL.ink3});
  const out=el('sn_out');
  if (out) out.textContent='ΔP_av '+espan(dPa,1)+' mmHg · Q_av '+espan(Qa,2)+' L/s · Q_max '+espan(Qm,2)+' · R '+espan(Rf/1e5,2)+'×10⁵ · Re ≈ '+espan(Re,0);
}

/* ═══════════════════════════════════════════════════════════
   S14 · Modelo mecánico RC del llenado pulmonar
   ═══════════════════════════════════════════════════════════ */
export function drawMech(){
  const cv=el('sim-mech'); if(!cv||!cv.clientWidth) return;
  const w=cv.clientWidth,h=cv.clientHeight;
  const ctx=setup(cv,w,h);
  const R=Math.max(0.5,Math.min(8,num('me_r')||2));
  const Cl=Math.max(0.05,Math.min(0.4,(num('me_c')||200)/1000));
  const vr=el('me_rv'); if (vr) vr.textContent=espan(R,1)+' cmH₂O/(L·s)';
  const vc=el('me_cv'); if (vc) vc.textContent=espan(Cl,2)+' L/cmH₂O';
  const tau=R*Cl;
  const Vpl=Cl*2.1;
  // circuito esquemático
  const cx=w*0.20, cy=h*0.22;
  ctx.strokeStyle=PAL.ink3; ctx.lineWidth=2.4;
  ctx.beginPath(); ctx.moveTo(w*0.05,cy); ctx.lineTo(w*0.36,cy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(w*0.36,cy); ctx.lineTo(w*0.36,cy+h*0.18); ctx.stroke();
  ctx.strokeStyle=PAL.teal; ctx.lineWidth=3;
  ctx.beginPath(); ctx.arc(cx,cy,16,0,Math.PI*2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx-16,cy); ctx.lineTo(cx-16,cy+h*0.18); ctx.moveTo(cx+16,cy); ctx.lineTo(cx+16,cy+h*0.18); ctx.stroke();
  text(ctx,'C', cx, cy, {size:8,weight:'700',color:PAL.teal});
  ctx.strokeStyle=PAL.blood; ctx.lineWidth=3;
  ctx.beginPath(); ctx.rect(cx-26,cy-14,52,28); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx-26,cy); ctx.lineTo(cx+26,cy); ctx.stroke();
  text(ctx,'R', cx, cy-18, {size:8,weight:'700',color:PAL.blood});
  ctx.strokeStyle=PAL.line; ctx.lineWidth=2.4;
  ctx.beginPath(); ctx.moveTo(cx+26,cy+h*0.18); ctx.lineTo(cx,cy+h*0.18); ctx.lineTo(cx,cy+h*0.26); ctx.moveTo(cx,cy+h*0.26); ctx.lineTo(cx,cy+h*0.40); ctx.stroke();
  text(ctx,'P_músculos', cx, cy+h*0.48, {size:7,color:PAL.ink3});
  // curva exponencial
  const lx=w*0.08, lw=w*0.76, gy=h*0.55, gH=h*0.30;
  ctx.strokeStyle=PAL.line; ctx.lineWidth=1.2;
  ctx.strokeRect(lx,gy,lw,gH);
  ctx.strokeStyle=PAL.teal; ctx.lineWidth=2.2; ctx.beginPath();
  for(let i=0;i<=120;i++){
    const t=i/120*4;
    const x=lx+i/120*lw, y=gy+gH*(1-Vpl*(1-Math.exp(-t/tau))/(Vpl*1.1));
    i?ctx.lineTo(x,y):ctx.moveTo(x,y);
  }
  ctx.stroke();
  dashed(ctx,lx,gy+gH*0.15,lx+lw,gy+gH*0.15,{color:PAL.amber,width:1.2});
  text(ctx,'V_pl ≈ '+espan(Vpl,2)+' L', lx+lw/2, gy+gH*0.12, {size:7,color:PAL.amber});
  const t63=tau;
  const x63=lx+t63/4*lw;
  dashed(ctx,x63,gy,x63,gy+gH,{color:PAL.ink3,width:1.2});
  text(ctx,'τ = '+espan(tau,2)+' s', x63, gy+10, {size:7,color:PAL.ink});
  text(ctx,'V(t) = V_pl(1 − e^(−t/τ)) · tiempo (s)', w/2, h*0.93, {size:8,color:PAL.ink3});
  const out=el('me_out');
  if (out) out.textContent='τ = '+espan(tau,2)+' s · V_pl ≈ '+espan(Vpl,2)+' L';
}

/* ═══════════════════════════════════════════════════════════
   S15 · El ciclo respiratorio: 4 trazas simultáneas
   ═══════════════════════════════════════════════════════════ */
export function toggleCycle(){
  window.__cyPlaying=!window.__cyPlaying;
  const b=el('cy_play'); if (b) b.textContent=window.__cyPlaying?'⏸':'▶';
  if (window.__cyPlaying) window.__cyT=0;
  window.__cyHist=[];
  drawCycle();
}
export function drawCycle(){
  const cv=el('sim-cycle'); if(!cv||!cv.clientWidth) return;
  const w=cv.clientWidth,h=cv.clientHeight;
  const ctx=setup(cv,w,h);
  const spd=(num('cy_speed')||100)/100;
  const vs=el('cy_speedv'); if (vs) vs.textContent='×'+espan(spd,1);
  const T=5/spd;
  const p=(window.__cyT%T)/T;
  const insp=p<0.5;
  const u=insp?p/0.5:(1-p)/0.5;
  const s=Math.sin(Math.PI*u);
  const V=0.5*s;                 // volumen sobre CRF
  const Ppl=-4-2*s;
  const Pa=insp?-0.8*s:0;
  const Q=Math.PI*s;
  // histórico (últimos ~1,2 ciclos)
  if (window.__cyPlaying||window.__cyHist.length){
    window.__cyHist.push({p,V,Ppl,Pa,Q});
    if (window.__cyHist.length>240) window.__cyHist.shift();
  } else { window.__cyHist=[{p,V,Ppl,Pa,Q}]; }
  const panels=[
    ['Volumen (L)', 'V', 0, 0.6, PAL.teal],
    ['P_intrapleural', 'Ppl', -7, -3, PAL.amber],
    ['Flujo (L/s)', 'Q', -3.2, 3.2, PAL.blood],
    ['P_alveolar', 'Pa', -1.2, 0.4, PAL.ink],
  ];
  const ph=h/4, py=0, pw=w*0.86, px=w*0.07, pgw=pw*0.86;
  panels.forEach((pn,i)=>{
    const [name,key,lo,hi,col]=pn;
    const y=ph*i+8, gh=ph-20;
    ctx.strokeStyle=PAL.line; ctx.lineWidth=1;
    ctx.strokeRect(px,y,pgw,gh);
    ctx.fillStyle=PAL.line; ctx.fillRect(px,y,pgw,10);
    text(ctx,name, px+4, y+5, {size:7,align:'left',color:PAL.ink});
    const Y=(v: number)=>y+gh-(v-lo)/(hi-lo)*gh;
    ctx.strokeStyle=col; ctx.lineWidth=1.8; ctx.beginPath();
    const hist=window.__cyHist;
    for(let j=0;j<hist.length;j++){
      const x=px+pgw-j/(hist.length-1)*pgw;
      const yy=Y(hist[j][key]);
      j?ctx.lineTo(x,yy):ctx.moveTo(x,yy);
    }
    ctx.stroke();
    text(ctx,espan(lo,1), px-4, y+gh, {size:6,align:'right',color:PAL.ink3});
    text(ctx,espan(hi,1), px-4, y, {size:6,align:'right',color:PAL.ink3});
  });
  text(ctx,(insp?'inspiración':'espiración')+' · ciclo '+espan(T,1)+' s', w/2, h*0.96, {size:8,weight:'700',color:insp?PAL.teal:PAL.amber});
  const out=el('cy_out');
  if (out) out.textContent=(insp?'inspiración · V en ascenso':'espiración · V en descenso');
}

/* ═══════════════════════════════════════════════════════════
   S16 · Lazos P–V: normal, obstructivo, restrictivo y SDR
   ═══════════════════════════════════════════════════════════ */
export function togglePVLoop(){
  window.__lvPlaying=!window.__lvPlaying;
  const b=el('lv_play'); if (b) b.textContent=window.__lvPlaying?'⏸':'▶';
  if (window.__lvPlaying) window.__lvT=0;
  drawPVLoop();
}
export function drawPVLoop(){
  const cv=el('sim-pvloop'); if(!cv||!cv.clientWidth) return;
  const w=cv.clientWidth,h=cv.clientHeight;
  const ctx=setup(cv,w,h);
  const cond=el('lv_sel')?el('lv_sel').value:'normal';
  const CC={
    normal:{Vmax:6,k:11.5,FRC:2.2,Vt:0.8,h:1.5,label:'C ≈ 0,2 L/cmH₂O'},
    obstr:{Vmax:6.5,k:14,FRC:3.8,Vt:0.6,h:4.2,label:'R alta · lazo ancho'},
    restr:{Vmax:3.5,k:6,FRC:1.5,Vt:0.5,h:1.0,label:'C baja · pendiente fuerte'},
    sdr:{Vmax:5,k:17,FRC:1.8,Vt:0.6,h:2.2,label:'falta surfactante · P alta'},
  };
  const c=CC[cond];
  const Vstat=P=>c.Vmax*(1-Math.exp(-P/c.k));
  const Pstat=V=>-c.k*Math.log(1-V/c.Vmax);
  const T=5;
  const p=(window.__lvT%T)/T;
  const insp=p<0.5;
  const u=insp?p/0.5:(1-p)/0.5;
  const V=c.FRC+c.Vt*(1-Math.cos(Math.PI*u))/2;
  const P=Pstat(V)+(insp?+1:-1)*c.h*Math.sin(Math.PI*u);
  // ejes
  const lx=w*0.10, lw=w*0.72, gy=h*0.14, gH=h*0.62, Pmax=32, Vmax=6.5;
  const X=(P0: number)=>lx+P0/Pmax*lw, Y=(v: number)=>gy+gH*(1-v/Vmax);
  ctx.strokeStyle=PAL.line; ctx.lineWidth=1.2;
  ctx.beginPath(); ctx.moveTo(lx,gy); ctx.lineTo(lx,gy+gH); ctx.lineTo(lx+lw,gy+gH); ctx.stroke();
  text(ctx,'P (cmH₂O)', lx+lw/2, gy+gH+20, {size:7,color:PAL.ink3});
  text(ctx,'V (L)', lx-6, gy, {size:7,color:PAL.ink3});
  // curva estática
  ctx.setLineDash([5,4]);
  ctx.strokeStyle=PAL.ink3; ctx.lineWidth=1.5; ctx.beginPath();
  for(let i=0;i<=120;i++){
    const pp=0.5+i/120*Pmax;
    const x=X(pp), y=Y(Vstat(pp));
    i?ctx.lineTo(x,y):ctx.moveTo(x,y);
  }
  ctx.stroke();
  ctx.setLineDash([]);
  text(ctx,'estática', lx+lw*0.70, Y(4.5), {size:6.5,color:PAL.ink3});
  // lazo dinámico
  ctx.strokeStyle=PAL.blood; ctx.lineWidth=2.2; ctx.beginPath();
  for(let i=0;i<=80;i++){
    const uu=i/80;
    const insp2=uu<=0.5;
    const q=insp2?uu/0.5:(1-uu)/0.5;
    const VV=c.FRC+c.Vt*(1-Math.cos(Math.PI*q))/2;
    const PP=Pstat(VV)+(insp2?+1:-1)*c.h*Math.sin(Math.PI*q);
    const x=X(PP), y=Y(VV);
    i?ctx.lineTo(x,y):ctx.moveTo(x,y);
  }
  ctx.closePath(); ctx.stroke();
  ctx.fillStyle='rgba(169,42,30,.08)'; ctx.fill();
  // marcadores FRC y tope
  dashed(ctx,lx,Y(c.FRC),lx+lw,Y(c.FRC),{color:PAL.amber,width:1.2});
  text(ctx,'CRF '+espan(c.FRC,1)+' L', lx+lw-4, Y(c.FRC)+4, {size:7,align:'right',color:PAL.amber});
  dashed(ctx,lx,Y(c.FRC+c.Vt),lx+lw,Y(c.FRC+c.Vt),{color:PAL.teal,width:1.2});
  text(ctx,'CRF+V_T '+espan(c.FRC+c.Vt,1)+' L', lx+4, Y(c.FRC+c.Vt)-4, {size:7,align:'left',color:PAL.teal});
  // punto actual
  const px=X(P), py=Y(V);
  ctx.beginPath(); ctx.arc(px,py,5,0,Math.PI*2);
  ctx.fillStyle=PAL.blood; ctx.fill(); ctx.strokeStyle='#fbf8f0'; ctx.lineWidth=1.5; ctx.stroke();
  const out=el('lv_out');
  if (out) out.textContent=cond==='normal'?'normal · '+c.label:(cond==='obstr'?c.label:(cond==='restr'?c.label:'SDR · '+c.label));
}

/* ═══════════════════════════════════════════════════════════
   S17 · Volumen inspirado: normal vs. restrictivo vs. obstructivo
   ═══════════════════════════════════════════════════════════ */
export function drawInspVol(){
  const cv=el('sim-inspvol'); if(!cv||!cv.clientWidth) return;
  const w=cv.clientWidth,h=cv.clientHeight;
  const ctx=setup(cv,w,h);
  const cond=el('ob_sel')?el('ob_sel').value:'normal';
  const t=Math.max(0,Math.min(40,num('ob_t')||10))/10;
  const vt=el('ob_tv'); if (vt) vt.textContent=espan(t,1)+' s';
  const MOD={
    normal:{C:0.2,R:2,Vpl:0.42,label:'Normal · C 0,2 · R 2'},
    restr:{C:0.1,R:2,Vpl:0.21,label:'Restrictiva · C 0,1'},
    obstr:{C:0.2,R:6,Vpl:0.42,label:'Obstructiva · R 6'},
  };
  const lx=w*0.08, lw=w*0.78, gy=h*0.12, gH=h*0.60, tmax=4, Vmax=0.55;
  const X=(t0: number)=>lx+t0/tmax*lw, Y=(v: number)=>gy+gH*(1-v/Vmax);
  ctx.strokeStyle=PAL.line; ctx.lineWidth=1.2;
  ctx.strokeRect(lx,gy,lw,gH);
  ctx.strokeStyle=PAL.teal; ctx.lineWidth=2; ctx.beginPath();
  for(let i=0;i<=120;i++){
    const tt=i/120*tmax;
    const x=X(tt), y=Y(MOD.normal.Vpl*(1-Math.exp(-tt/(MOD.normal.R*MOD.normal.C))));
    i?ctx.lineTo(x,y):ctx.moveTo(x,y);
  }
  ctx.stroke();
  ctx.strokeStyle=PAL.amber; ctx.lineWidth=2; ctx.beginPath();
  for(let i=0;i<=120;i++){
    const tt=i/120*tmax;
    const x=X(tt), y=Y(MOD.restr.Vpl*(1-Math.exp(-tt/(MOD.restr.R*MOD.restr.C))));
    i?ctx.lineTo(x,y):ctx.moveTo(x,y);
  }
  ctx.stroke();
  ctx.strokeStyle=PAL.blood; ctx.lineWidth=2; ctx.beginPath();
  for(let i=0;i<=120;i++){
    const tt=i/120*tmax;
    const x=X(tt), y=Y(MOD.obstr.Vpl*(1-Math.exp(-tt/(MOD.obstr.R*MOD.obstr.C))));
    i?ctx.lineTo(x,y):ctx.moveTo(x,y);
  }
  ctx.stroke();
  // leyenda + cursor
  let ly=h*0.14;
  [['Normal',PAL.teal],['Restrictiva',PAL.amber],['Obstructiva',PAL.blood]].forEach(lg=>{
    ctx.fillStyle=lg[1]; ctx.fillRect(lx+lw*0.66,ly,12,8);
    text(ctx,lg[0], lx+lw*0.66+16, ly+4, {size:7,align:'left',color:lg[1],weight:lg[0]===MOD[cond].label.split(' · ')[0]?'700':'400'});
    ly+=14;
  });
  const cx2=X(t);
  ctx.setLineDash([4,3]); ctx.strokeStyle=PAL.ink; ctx.lineWidth=1.3;
  ctx.beginPath(); ctx.moveTo(cx2,gy); ctx.lineTo(cx2,gy+gH); ctx.stroke(); ctx.setLineDash([]);
  text(ctx,'t = '+espan(t,1)+' s', cx2, gy+10, {size:7,color:PAL.ink});
  text(ctx,'V (L)', lx-6, gy, {size:7,color:PAL.ink3});
  text(ctx,'tiempo (s)', lx+lw/2, gy+gH+16, {size:7,color:PAL.ink3});
  const m=MOD[cond];
  const Vt=m.Vpl*(1-Math.exp(-t/(m.R*m.C)));
  const out=el('ob_out');
  if (out) out.textContent='V(t) '+cond+' ≈ '+espan(Vt,2)+' L';
}

/* ═══════════════════════════════════════════════════════════
   S18 · CVF y VEF₁: espirometría forzada
   ═══════════════════════════════════════════════════════════ */
export function drawFVC(){
  const cv=el('sim-fvc'); if(!cv||!cv.clientWidth) return;
  const w=cv.clientWidth,h=cv.clientHeight;
  const ctx=setup(cv,w,h);
  const pat=el('fc_sel')?el('fc_sel').value:'normal';
  const t=Math.max(0,Math.min(60,num('fc_t')||10))/10;
  const vt=el('fc_tv'); if (vt) vt.textContent=espan(t,1)+' s';
  const P={
    normal:{CVF:5.0,VEF1:4.0,tau:0.621,label:'Normal',col:PAL.teal},
    obstr:{CVF:3.1,VEF1:1.302,tau:1.837,label:'Obstructivo',col:PAL.blood},
    restr:{CVF:3.1,VEF1:2.79,tau:0.434,label:'Restrictivo',col:PAL.amber},
  };
  const lx=w*0.08, lw=w*0.78, gy=h*0.12, gH=h*0.62, tmax=6, Vmax=5.5;
  const X=(t0: number)=>lx+t0/tmax*lw, Y=(v: number)=>gy+gH*(1-v/Vmax);
  ctx.strokeStyle=PAL.line; ctx.lineWidth=1.2;
  ctx.strokeRect(lx,gy,lw,gH);
  Object.keys(P).forEach((k,i)=>{
    const p=P[k];
    ctx.strokeStyle=p.col; ctx.lineWidth=2; ctx.beginPath();
    for(let j=0;j<=150;j++){
      const tt=j/150*tmax;
      const x=X(tt), y=Y(p.CVF*(1-Math.exp(-tt/p.tau)));
      j?ctx.lineTo(x,y):ctx.moveTo(x,y);
    }
    ctx.stroke();
  });
  // cursor del 1 s
  const x1=X(1);
  ctx.setLineDash([4,3]); ctx.strokeStyle=PAL.ink; ctx.lineWidth=1.3;
  ctx.beginPath(); ctx.moveTo(x1,gy); ctx.lineTo(x1,gy+gH); ctx.stroke(); ctx.setLineDash([]);
  text(ctx,'1 s', x1, gy+10, {size:7,weight:'700',color:PAL.ink});
  // marcadores VEF₁ por patrón
  Object.keys(P).forEach((k,i)=>{
    const p=P[k];
    const y1=Y(p.VEF1);
    dashed(ctx,x1,y1,lx+lw,y1,{color:p.col,width:1.2});
    text(ctx,espan(p.VEF1,1)+' L', x1+4, y1-3, {size:7,align:'left',color:p.col,weight:k===pat?'700':'400'});
  });
  text(ctx,'VEF₁/CVF', lx+lw-4, gy+14, {size:7,align:'right',color:PAL.ink3});
  const p=P[pat];
  const ratio=p.VEF1/p.CVF*100;
  const out=el('fc_out');
  if (out) out.textContent='VEF₁ = '+espan(p.VEF1,1)+' L · VEF₁/CVF = '+espan(ratio,0)+' % · '+p.label;
}

/* ═══════════════════════════════════════════════════════════
   S19 · Hipoxia: fracción de O₂ y presión parcial
   ═══════════════════════════════════════════════════════════ */
export function drawHypoxia(){
  const cv=el('sim-hypoxia'); if(!cv||!cv.clientWidth) return;
  const w=cv.clientWidth,h=cv.clientHeight;
  const ctx=setup(cv,w,h);
  const frac=Math.max(2,Math.min(21,num('hy_frac')||21));
  const vf=el('hy_fracv'); if (vf) vf.textContent=espan(frac,1)+' %';
  const PO2=frac/100*760, kPa=PO2*0.133322;
  const gy=h*0.14, gH=h*0.62, gx=w*0.14, gw=w*0.34;
  const zones=[['< 6 %',6,PAL.blood],['6–10 %',10,PAL.warn],['10–19,5 %',19.5,'#b8a83a'],['> 19,5 %',21,'#2d7d4f']];
  let zy=gy;
  zones.forEach(z=>{
    const zh=gH*(z[1]-2)/(21-2);
    ctx.fillStyle=z[2]+'88';
    ctx.fillRect(gx,zy,gw,zh);
    text(ctx,z[0], gx+gw/2, zy+zh/2, {size:8,color:PAL.ink,weight:'700'});
    zy+=zh;
  });
  ctx.strokeStyle=PAL.line; ctx.lineWidth=1.2;
  ctx.strokeRect(gx,gy,gw,gH);
  // umbral 57 mmHg (7,5 %)
  const y57=gy+gH*(19.5-7.5)/(19.5-2);
  dashed(ctx,gx,y57,gx+gw,y57,{color:PAL.ink,width:1.6});
  text(ctx,'hipoxia ≈ 57 mmHg', gx+gw+6, y57, {size:7,align:'left',color:PAL.ink});
  // marcador actual
  const ycur=gy+gH*(19.5-frac)/(19.5-2);
  ctx.beginPath(); ctx.moveTo(gx-8,ycur); ctx.lineTo(gx,ycur-6); ctx.lineTo(gx,ycur+6); ctx.closePath(); ctx.fill();
  ctx.fillStyle=PAL.blood; ctx.fill();
  ctx.beginPath(); ctx.arc(gx+gw,ycur,5,0,Math.PI*2); ctx.fillStyle=PAL.blood; ctx.fill();
  text(ctx,espan(frac,1)+' % O₂ · P_O₂ = '+espan(PO2,0)+' mmHg = '+espan(kPa,1)+' kPa', w*0.68, h*0.30, {size:9,weight:'700',color:PAL.ink});
  let zona=frac>=19.5?'seguro (sin efectos)':(frac>=10?'deterioro de la atención y coordinación':(frac>=6?'náuseas, letargo, pérdida de conciencia':'convulsiones → apnea → paro'));
  text(ctx,'Efecto: '+zona, w*0.68, h*0.40, {size:8,color:PAL.ink3});
  text(ctx,'P_O₂ = (fracción/100) × 760 mmHg', w/2, h*0.90, {size:8,color:PAL.ink3});
  const out=el('hy_out');
  if (out) out.textContent='P_O₂ = '+espan(PO2,0)+' mmHg · '+zona;
}

/* ═══════════════════════════════════════════════════════════
   S20 · Altitud: caída exponencial de la presión
   ═══════════════════════════════════════════════════════════ */
export function drawAltitude(){
  const cv=el('sim-altitude'); if(!cv||!cv.clientWidth) return;
  const w=cv.clientWidth,h=cv.clientHeight;
  const ctx=setup(cv,w,h);
  const hh=Math.max(0,Math.min(12000,num('al_h')||8250));
  const vh=el('al_hv'); if (vh) vh.textContent=espan(hh/1000,2)+' km';
  const PO2=161*Math.exp(-hh/7946);
  const Ptot=760*Math.exp(-hh/8767);
  const lx=w*0.08, lw=w*0.70, gy=h*0.14, gH=h*0.58, hmax=12000, Pmax=170;
  const X=(h0: number)=>lx+h0/hmax*lw, Y=(p: number)=>gy+gH*(1-p/Pmax);
  ctx.strokeStyle=PAL.line; ctx.lineWidth=1.2;
  ctx.strokeRect(lx,gy,lw,gH);
  ctx.strokeStyle=PAL.blood; ctx.lineWidth=2.2; ctx.beginPath();
  for(let i=0;i<=120;i++){
    const h0=i/120*hmax;
    const x=X(h0), y=Y(161*Math.exp(-h0/7946));
    i?ctx.lineTo(x,y):ctx.moveTo(x,y);
  }
  ctx.stroke();
  text(ctx,'P_O₂(h) = 161·e^(−h/7.946 km)', lx+lw/2, gy-8, {size:7,color:PAL.blood});
  // línea de hipoxia
  const y57=Y(57);
  dashed(ctx,lx,y57,lx+lw,y57,{color:PAL.amber,width:1.5});
  text(ctx,'hipoxia 57 mmHg', lx+lw+4, y57, {size:7,align:'left',color:PAL.amber});
  // marcadores 8,25 y 8,85 km
  const x825=X(8250), x885=X(8850);
  dashed(ctx,x825,gy,x825,gy+gH,{color:PAL.ink3,width:1});
  text(ctx,'8,25 km', x825, gy+gH+12, {size:7,color:PAL.ink3});
  dashed(ctx,x885,gy,x885,gy+gH,{color:PAL.ink,width:1});
  text(ctx,'Everest 8,85', x885, gy+10, {size:6.5,color:PAL.ink});
  // punto actual
  const px=X(hh), py=Y(PO2);
  ctx.beginPath(); ctx.arc(px,py,5,0,Math.PI*2);
  ctx.fillStyle=PAL.blood; ctx.fill(); ctx.strokeStyle='#fbf8f0'; ctx.lineWidth=1.5; ctx.stroke();
  text(ctx,'h = '+espan(hh/1000,2)+' km', px, py-12, {size:8,weight:'700',color:PAL.blood});
  // panel de lectura
  text(ctx,'P_O₂ = '+espan(PO2,0)+' mmHg', w*0.84, h*0.30, {size:9,weight:'700',color:PAL.blood});
  text(ctx,'P_total = '+espan(Ptot,0)+' mmHg', w*0.84, h*0.38, {size:8,color:PAL.ink3});
  text(ctx,'hipoxia '+(PO2<57?'SÍ · por debajo':'no · por encima'), w*0.84, h*0.46, {size:8,color:PO2<57?PAL.blood:PAL.good});
  text(ctx,'altitud (km)', lx+lw/2, gy+gH+20, {size:7,color:PAL.ink3});
  const out=el('al_out');
  if (out) out.textContent='P_O₂ = '+espan(PO2,0)+' mmHg · '+(PO2<57?'hipoxia':'seguro');
}

/* ═══════════════════════════════════════════════════════════
   S21 · Tabla 9.4: nivel del mar vs. 2.500 m
   ═══════════════════════════════════════════════════════════ */
export function drawTable94(){
  const cv=el('sim-table94'); if(!cv||!cv.clientWidth) return;
  const w=cv.clientWidth,h=cv.clientHeight;
  const ctx=setup(cv,w,h);
  const sel=el('tb_sel')?el('tb_sel').value:'all';
  const rows=[['Presión total',760,560],['O₂ atmosférico',159,117],['O₂ alveolar',105,77],['O₂ arterial',100,72],['O₂ venoso',40,40]];
  const lx=w*0.08, lw=w*0.66, gy=h*0.12, gH=h*0.64, Pmax=800;
  ctx.strokeStyle=PAL.line; ctx.lineWidth=1.2;
  ctx.strokeRect(lx,gy,lw,gH);
  rows.forEach((r,i)=>{
    const on=sel==='all'||sel===String(i);
    const y=gy+i/rows.length*gH, bh=gH/rows.length*0.62;
    const yc=y+(gH/rows.length-bh)/2;
    text(ctx,r[0], lx-6, yc+bh/2, {size:7.5,align:'right',color:on?PAL.ink:PAL.ink3});
    [['nivel del mar',r[1],PAL.teal],['2.500 m',r[2],PAL.amber]].forEach((b,j)=>{
      const bx=lx+lw*0.16+j*lw*0.30;
      ctx.fillStyle=b[2]+(on?'':'44');
      ctx.fillRect(bx,yc,Math.max(3, b[1]/Pmax*lw*0.26),bh);
      ctx.strokeStyle=PAL.line; ctx.lineWidth=1;
      ctx.strokeRect(bx,yc,lw*0.26,bh);
      text(ctx,espan(b[1],0), bx+lw*0.13, yc+bh/2, {size:7.5,weight:'700',color:on?'#fbf8f0':PAL.ink3});
      if (i===0) text(ctx,b[0], bx+lw*0.13, yc-6, {size:6.5,color:PAL.ink3});
    });
    text(ctx,on?'':r[0], lx+lw+4, yc+bh/2, {size:7,align:'left',color:PAL.ink3});
  });
  text(ctx,'mmHg', lx+lw*0.16, gy-8, {size:7,color:PAL.teal});
  text(ctx,'mmHg', lx+lw*0.46, gy-8, {size:7,color:PAL.amber});
  const out=el('tb_out');
  if (out) out.textContent='total 760 → 560 mmHg · venoso se mantiene en 40';
}

/* ═══════════════════════════════════════════════════════════
   S22 · Trabajo de la inspiración: W = V_t²/(2C)
   ═══════════════════════════════════════════════════════════ */
export function drawWork() {
  const cv = el('sim-work'); if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth, h = cv.clientHeight;
  const ctx = setup(cv, w, h);
  if (!ctx) return;
  const Vt = Math.max(300, Math.min(1000, num('wr_vt') || 500));
  const Cl = Math.max(0.05, Math.min(0.3, (num('wr_c') || 100) / 1000));
  const f = Math.max(10, Math.min(40, num('wr_f') || 20));
  const vv = el('wr_vtv'); if (vv) vv.textContent = espan(Vt, 0) + ' cm³';
  const vc = el('wr_cv'); if (vc) vc.textContent = espan(Cl, 2) + ' L/cmH₂O';
  const vf = el('wr_fv'); if (vf) vf.textContent = espan(f, 0) + ' /min';
  const W_erg = Math.pow(Vt, 2) / (2 * Cl);
  const W_J = W_erg / 1e7;
  const dWdt = W_J * f * 1440;
  const kcal = dWdt / 4184;
  
  const lx = w * 0.08, lw = w * 0.56, gy = h * 0.16, gH = h * 0.56;
  const Vmax = (Vt / 1000) * 1.15, Pmax = (Vmax / Cl) * 1.15;
  ctx.strokeStyle = PAL.line; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(lx, gy + gH); ctx.lineTo(lx, gy); ctx.lineTo(lx + lw, gy + gH); ctx.stroke();
  text(ctx, 'P = ΔV/C', lx - 6, gy, { size: 7, color: PAL.ink3 });
  text(ctx, 'V_t', lx + lw, gy + gH + 6, { size: 7, color: PAL.ink3 });
  ctx.fillStyle = 'rgba(13,110,100,.18)';
  ctx.beginPath(); ctx.moveTo(lx, gy + gH); ctx.lineTo(lx + lw, gy + gH); ctx.lineTo(lx + lw, gy + gH - ((Vt / 1000) / Vmax) * gH); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = PAL.teal; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(lx, gy + gH); ctx.lineTo(lx + lw, gy + gH); ctx.lineTo(lx + lw, gy + gH - ((Vt / 1000) / Vmax) * gH); ctx.closePath(); ctx.stroke();
  text(ctx, 'área = V_t²/(2C)', lx + lw / 2, gy + gH - 10, { size: 8, color: PAL.teal });

  const bx = w * 0.72, bw = w * 0.22;
  const items: [string, number, string, string][] = [
    ['W (por respiración)', W_J, 'J', PAL.teal],
    ['Tasa mecánica', dWdt, 'J/día', PAL.amber],
    ['Tasa mecánica', kcal, 'kcal/día', PAL.blood]
  ];
  let y = h * 0.16;
  items.forEach(it => {
    ctx.fillStyle = it[3]; ctx.fillRect(bx, y, bw * 0.7, 12);
    text(ctx, it[0], bx, y + 6, { size: 7, align: 'left', color: PAL.ink });
    text(ctx, espan(it[1], it[2] === 'J' || it[2] === 'J/día' ? 1 : 2) + ' ' + it[2], bx + bw * 0.7 + 6, y + 6, { size: 8, align: 'left', weight: '700', color: it[3] });
    y += 26;
  });
  text(ctx, 'dW/dt = f·V_t²/(2C) · con C = 0,1 L/cmH₂O → 0,86 kcal/día', w / 2, h * 0.92, { size: 8, color: PAL.ink3 });
  const out = el('wr_out');
  if (out) out.textContent = 'dW/dt = ' + espan(kcal, 2) + ' kcal/día';
}

/* ═══════════════════════════════════════════════════════════
   S23 · Eficiencia metabólica y espiración forzada
   ═══════════════════════════════════════════════════════════ */
export function drawEff() {
  const cv = el('sim-eff'); if (!cv || !cv.clientWidth) return;
  const w = cv.clientWidth, h = cv.clientHeight;
  const ctx = setup(cv, w, h);
  if (!ctx) return;
  const ep = Math.max(3, Math.min(10, num('ef_ep') || 5));
  const ve = el('ef_epv'); if (ve) ve.textContent = espan(ep, 0) + ' %';
  const dWdt = 0.86;
  const dEdt = dWdt / (ep / 100);
  const pctBMR = (dEdt / 1800) * 100;

  const lx = w * 0.06, lw = w * 0.40, startGy = h * 0.18, gH = h * 0.50, maxV = Math.max(25, dEdt * 1.2);
  let curGy = startGy;
  ctx.strokeStyle = PAL.line; ctx.lineWidth = 1.2;
  ctx.strokeRect(lx, curGy, lw, gH);

  const bar = (name: string, val: number, col: string) => {
    const y = curGy + gH * 0.30;
    ctx.fillStyle = col; ctx.fillRect(lx, y, Math.max(3, (val / maxV) * lw), gH * 0.28);
    ctx.strokeStyle = PAL.line; ctx.strokeRect(lx, y, lw, gH * 0.28);
    text(ctx, name, lx + 4, y + gH * 0.14, { size: 7.5, align: 'left', color: PAL.ink });
    text(ctx, espan(val, 1) + ' kcal/día', lx + Math.max(3, (val / maxV) * lw) + 6, y + gH * 0.14, { size: 8, align: 'left', weight: '700', color: col });
    curGy += gH * 0.36;
  };
  bar('Trabajo mecánico (ε = 100 %)', dWdt, PAL.teal);
  bar('Costo metabólico', dEdt, PAL.blood);
  ctx.fillStyle = PAL.warn;
  ctx.fillRect(lx, curGy, Math.max(3, ((dEdt - dWdt) / maxV) * lw), gH * 0.28);
  ctx.strokeStyle = PAL.line; ctx.strokeRect(lx, curGy, lw, gH * 0.28);
  text(ctx, 'Calor perdido (1−ε)', lx + 4, curGy + gH * 0.14, { size: 7.5, align: 'left', color: PAL.ink });
  text(ctx, espan(dEdt - dWdt, 1) + ' kcal/día', lx + Math.max(3, ((dEdt - dWdt) / maxV) * lw) + 6, curGy + gH * 0.14, { size: 8, align: 'left', weight: '700', color: PAL.warn });
  text(ctx, 'dE/dt = dW/dt / ε', lx + lw / 2, h * 0.90, { size: 8, color: PAL.ink3 });

  const gx = w * 0.55, gw = w * 0.38, gy2 = h * 0.14, gH2 = h * 0.62, Pmax = 45;
  ctx.strokeStyle = PAL.line; ctx.lineWidth = 1.2;
  ctx.strokeRect(gx, gy2, gw, gH2);
  text(ctx, 'Espiración forzada (cmH₂O)', gx + gw / 2, gy2 - 8, { size: 7.5, color: PAL.ink });
  const marks: [number, string, string][] = [[38, 'alveolar', PAL.blood], [30, 'intrapleural', PAL.teal], [19, 'colapso de la vía', PAL.warn]];
  marks.forEach(m => {
    const y = gy2 + gH2 * (1 - m[0] / Pmax);
    dashed(ctx, gx, y, gx + gw, y, { color: m[2], width: 1.4 });
    text(ctx, m[0] + ' · ' + m[1], gx + gw + 4, y, { size: 7, align: 'left', color: m[2] });
    text(ctx, String(m[0]), gx - 4, y, { size: 7, align: 'right', color: m[2] });
  });
  text(ctx, '0', gx - 4, gy2 + gH2, { size: 7, align: 'right', color: PAL.ink3 });
  const out = el('ef_out');
  if (out) out.textContent = 'dE/dt = ' + espan(dEdt, 0) + ' kcal/día · ~' + espan(pctBMR, 0) + ' % BMR';
}

/* ═══════════════════════════════════════════════════════════
   Mapa de redibujado (una draw por slide de contenido)
   ═══════════════════════════════════════════════════════════ */
export function redrawSlide(n: number) {
  const fns: Record<number, () => void> = {
    1: drawComposition,
    2: drawTree,
    3: drawGas,
    4: drawLaplace,
    5: drawBubbles,
    6: drawSurfactant,
    7: drawPleura,
    8: drawBreath,
    9: drawSpiro,
    10: drawPVCurve,
    11: drawMix,
    12: drawAirRes,
    13: drawSine,
    14: drawMech,
    15: drawCycle,
    16: drawPVLoop,
    17: drawInspVol,
    18: drawFVC,
    19: drawHypoxia,
    20: drawAltitude,
    21: drawTable94,
    22: drawWork,
    23: drawEff,
  };
  if (fns[n]) fns[n]();
}
