// ===================== MÓDULOS DEL CAPÍTULO 10 =====================
const MODULES = [
  {id:0, name:'Inicio',           slides:[0],       ico:'🏠'},
  {id:1, name:'Ondas sonoras',    slides:[1,2,3],   ico:'🌊'},
  {id:2, name:'Resonadores',      slides:[4,5],     ico:'🎵'},
  {id:3, name:'El habla',         slides:[6,7,8],   ico:'🗣️'},
  {id:4, name:'Modelo de dos tubos', slides:[9,10,11], ico:'🧩'},
  {id:5, name:'Audición · sensibilidad', slides:[12,13,14], ico:'👂'},
  {id:6, name:'Audición · pérdida', slides:[15,16], ico:'🩺'},
  {id:7, name:'Audición · percepción', slides:[17,18,19], ico:'🧠'},
  {id:8, name:'Vibraciones del cuerpo', slides:[20,21], ico:'❤️'},
  {id:9, name:'Diagnóstico',      slides:[22,23],   ico:'🩻'}
];

// ===================== GLOBALS DE ANIMACIÓN =====================
window.__glPlaying = false; window.__glT = 0;
window.__sfPlaying = false; window.__sfT = 0;
window.__coPlaying = false; window.__coT = 0;
window.__hsPlaying = false; window.__hsT = 0;
window.__doPlaying = false; window.__doT = 0;

// ===================== HELPERS DE CANVAS =====================
const C = { paper:'#f8f4e9', ink:'#2d3a3a', teal:'#0e6e66', tealD:'#0a544e',
            blood:'#b3352a', amber:'#d97706', muted:'#8a8f8c', line:'#c9c2b2' };
const clamp = (x,a,b)=>Math.max(a,Math.min(b,x));
function _bg(ctx,w,h){ ctx.fillStyle=C.paper; ctx.fillRect(0,0,w,h); }
function _txt(ctx,x,y,s,o){
  const a=o||{};
  ctx.fillStyle=a.color||C.ink;
  ctx.font=(a.bold?'700 ':(a.w||'500 '))+(a.size||12)+'px Karla, Arial, sans-serif';
  ctx.textAlign=a.align||'left'; ctx.textBaseline=a.base||'middle';
  ctx.fillText(s,x,y);
}
function _rect(ctx,x,y,w,h,color,rx){
  ctx.fillStyle=color; ctx.beginPath();
  if(rx&&ctx.roundRect){ ctx.roundRect(x,y,w,h,rx); } else { ctx.rect(x,y,w,h); }
  ctx.fill();
}
function _line(ctx,x1,y1,x2,y2,color,lw,dash){
  ctx.strokeStyle=color; ctx.lineWidth=lw||1; ctx.setLineDash(dash||[]);
  ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke(); ctx.setLineDash([]);
}
function _poly(ctx,pts,color,fill){
  ctx.strokeStyle=color; ctx.lineWidth=1.5; ctx.beginPath();
  ctx.moveTo(pts[0].x,pts[0].y);
  for(let i=1;i<pts.length;i++) ctx.lineTo(pts[i].x,pts[i].y);
  ctx.stroke();
  if(fill){ ctx.fillStyle=fill; ctx.lineTo(pts[0].x,pts[0].y); ctx.fill(); }
}
function _axisX(ctx,x0,y0,x1,labels){
  const n=labels.length; _line(ctx,x0,y0,x1,y0,C.line,1);
  for(let i=0;i<n;i++){ const x=x0+(x1-x0)*i/(n-1); _line(ctx,x,y0,x,y0+4,C.line,1);
    _txt(ctx,x,y0+12,labels[i],{size:9,align:'center',color:C.muted}); }
}
function _axisY(ctx,x0,y0,y1,labels){
  const n=labels.length; _line(ctx,x0,y0,x0,y1,C.line,1);
  for(let i=0;i<n;i++){ const y=y1-(y1-y0)*i/(n-1); _line(ctx,x0-4,y,x0,y,C.line,1);
    _txt(ctx,x0-6,y,labels[i],{size:9,align:'right',color:C.muted}); }
}
function _gauss(x,c,w){ return Math.exp(-Math.pow((x-c)/w,2)); }

// ===================== SLIDE 1 · ONDAS =====================
function drawWave(){
  const cv=el('sim-wave'); if(!cv||!cv.clientWidth) return;
  const w=cv.clientWidth,h=cv.clientHeight; const ctx=AB.setup(cv,w,h);
  _bg(ctx,w,h);
  const med=+num('wv_med')||0; const vv=[343,1540,3500][med]; const f=+num('wv_f')||600;
  const lam=vv/f*100; const nm=['aire','tejido blando','hueso'][med];
  const y=h*0.58; const cycles=3; const scale=(w-40)/cycles; const amp=Math.min(62,(w-40)/cycles*0.34);
  _txt(ctx,12,16,'v = '+vv+' m/s · f = '+f+' Hz · λ = '+espan(lam,0)+' cm',{size:12,bold:true,color:C.teal});
  _line(ctx,10,y,w-10,y,C.line,1);
  ctx.strokeStyle=C.teal; ctx.lineWidth=2.5; ctx.beginPath();
  for(let x=0;x<=w;x+=2){ ctx.lineTo(x, y-Math.sin(x/scale*2*Math.PI)*amp); }
  ctx.stroke();
  ctx.strokeStyle=C.blood; ctx.lineWidth=1.5; ctx.setLineDash([4,3]);
  ctx.beginPath(); ctx.moveTo(30,y-amp-8); ctx.lineTo(30+scale,y-amp-8); ctx.stroke(); ctx.setLineDash([]);
  _txt(ctx,30+scale/2,y-amp-16,'λ = '+(lam/100).toFixed(2)+' m',{size:11,align:'center',color:C.blood});
  _txt(ctx,12,h-14,'El sonido es una onda de presión: la misma f se estira (más v) o se comprime (menos v).',{size:11,color:C.muted});
  el('wv_fv').textContent=espan(f,0)+' Hz';
  el('wv_out').textContent='λ ('+nm+', '+f+' Hz) = '+espan(lam,0)+' cm';
}
// ===================== SLIDE 2 · DB =====================
function drawDB(){
  const cv=el('sim-db'); if(!cv||!cv.clientWidth) return;
  const w=cv.clientWidth,h=cv.clientHeight; const ctx=AB.setup(cv,w,h);
  _bg(ctx,w,h);
  const SRC=[[0,'Umbral de audición'],[20,'Susurro'],[60,'Habla normal'],[80,'Tráfico'],
             [110,'Concierto / moto'],[130,'Umbral de dolor'],[160,'Turborreactor'],[190,'Ruptura del tímpano']];
  const sel=+num('db_sel')||0; const db=SRC[sel][0], name=SRC[sel][1];
  const x0=52,y0=h-34,x1=w-14; const top=16; const span=200;
  _axisX(ctx,x0,y0,x1,['0','20','40','60','80','100','120','140','160','180','200 dB']);
  for(let i=0;i<SRC.length;i++){
    const x=x0+(x1-x0)*SRC[i][0]/span;
    _line(ctx,x,y0-3,x,y0+3,C.line,1);
    _txt(ctx,x,y0-7,String(SRC[i][0]),{size:8,align:'center',color:C.muted});
  }
  const bw=(x1-x0)/span*30;
  _rect(ctx,x0+(x1-x0)*db/span-bw,y0-(h-top-24),bw*2,h-top-24, sel===0?C.teal:C.amber);
  ctx.fillStyle=C.ink;
  _txt(ctx,x0,y0-6,name+' · '+db+' dB',{size:13,bold:true,color:C.ink});
  const expo=(db-120)/10;
  const Istr='10^'+expo+' W/m²';
  _txt(ctx,x0,y0+18,'I = '+Istr+(db>=120?' · riesgo de dolor':' · audible'),{size:10,color:C.muted});
  el('db_out').textContent=name+' · '+db+' dB → I = 10^'+expo+' W/m²';
}
// ===================== SLIDE 3 · IMPEDANCIA =====================
function drawImpedance(){
  const cv=el('sim-impedance'); if(!cv||!cv.clientWidth) return;
  const w=cv.clientWidth,h=cv.clientHeight; const ctx=AB.setup(cv,w,h);
  _bg(ctx,w,h);
  const M={'0':['Agua',1.48e6,'Tejido blando',1.63e6],'1':['Grasa',1.33e6,'Músculo',1.64e6],
           '2':['Hueso',7.80e6,'Músculo',1.64e6],'3':['Tejido blando',1.63e6,'Hueso',7.80e6],
           '4':['Tejido blando',1.63e6,'Pulmón',1.80e5],'5':['Aire',413,'Músculo',1.64e6],
           '6':['Aire',413,'Agua',1.48e6]};
  const k=String(+num('im_sel')||0), p=M[k];
  const z1=p[1],z2=p[3]; const R=Math.pow((z2-z1)/(z1+z2),2);
  const T=1-R; const cx=w*0.52;
  _rect(ctx,14,70,cx-24,h-100,C.teal); _rect(ctx,cx+10,70,w-cx-24,h-100,C.blood);
  _txt(ctx,cx/2-6,86,p[0],{size:13,bold:true,align:'center',color:'#fff'});
  _txt(ctx,(w+cx)/2,86,p[2],{size:13,bold:true,align:'center',color:'#fff'});
  _txt(ctx,cx/2-6,h-34,'Z₁ = '+espan(z1,0)+' rayl',{size:10,align:'center',color:C.teal});
  _txt(ctx,(w+cx)/2,h-34,'Z₂ = '+espan(z2,0)+' rayl',{size:10,align:'center',color:C.blood});
  const iy=h/2+20;
  ctx.strokeStyle=C.ink; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(14,iy); ctx.lineTo(cx-6,iy); ctx.stroke();
  ctx.fillStyle=C.ink; ctx.beginPath(); ctx.moveTo(cx-6,iy-5); ctx.lineTo(cx-6,iy+5); ctx.lineTo(cx+2,iy); ctx.fill();
  const tr=h*0.22*(0.3+T*0.7);
  ctx.strokeStyle=C.tealD; ctx.lineWidth=Math.max(2,tr/3);
  ctx.beginPath(); ctx.moveTo(cx+6,iy); ctx.lineTo(w-14,iy); ctx.stroke();
  const rf=h*0.16*R;
  ctx.strokeStyle=C.blood; ctx.lineWidth=Math.max(1.5,rf/3);
  ctx.beginPath(); ctx.moveTo(cx-6,iy); ctx.lineTo(20,iy-28); ctx.stroke();
  _txt(ctx,28,iy-38,'reflejada  '+espan(R*100,2)+' %',{size:11,color:C.blood});
  _txt(ctx,(w+cx)/2,iy-16,'transmitida  '+espan(T*100,2)+' %',{size:11,color:C.tealD});
  _txt(ctx,12,h-14,'R = ((Z₂−Z₁)/(Z₁+Z₂))²  ·  la impedancia manda en la interfaz.',{size:11,color:C.muted});
  el('im_out').textContent=p[0]+'→'+p[2]+': R = '+espan(R*100,2)+' %';
}
// ===================== SLIDE 4 · RESONADOR =====================
function drawCavity(){
  const cv=el('sim-cavity'); if(!cv||!cv.clientWidth) return;
  const w=cv.clientWidth,h=cv.clientHeight; const ctx=AB.setup(cv,w,h);
  _bg(ctx,w,h);
  const closed=+num('cv_typ')===1; const L=+num('cv_L')||17;
  const v=343; const f1=closed?v/(4*L*0.01):v/(2*L*0.01);
  const panels=[[1,['n=1']],[2,['n=2']],[3,['n=3']]];
  const y0=30, pw=w/3, ph=90, x0=10;
  _txt(ctx,12,14,(closed?'Tubo cerrado (un extremo)':'Tubo abierto (dos extremos)')+' · L = '+espan(L,1)+' cm · f₁ = '+espan(Math.round(f1))+' Hz',{size:12,bold:true,color:C.teal});
  for(let i=0;i<3;i++){
    const n=panels[i][0]; const bx=x0+i*pw, by=y0+16;
    _line(ctx,bx,by,bx,by+ph,C.ink,2); _line(ctx,bx+pw-20,by,bx+pw-20,by+ph,C.ink,2);
    if(!closed){ _line(ctx,bx+pw-20,by,bx,by,C.ink,1); _line(ctx,bx+pw-20,by+ph,bx,by+ph,C.ink,1); }
    else { _line(ctx,bx+pw-20,by,bx+pw-20,by+ph,C.ink,2); _line(ctx,bx,by,bx+pw-20,by,C.ink,1); _line(ctx,bx,by+ph,bx+pw-20,by+ph,C.ink,1); }
    const f=closed?v/(4*L*0.01)*(2*n-1):v/(2*L*0.01)*n;
    const cy=by+ph/2; const A=ph/2-8; const xl=bx+4, xr=bx+pw-24;
    ctx.strokeStyle=C.blood; ctx.lineWidth=2; ctx.beginPath();
    for(let xx=xl;xx<=xr;xx+=2){
      const u=(xx-xl)/(xr-xl)*Math.PI*(closed?(2*n-1):n);
      ctx.lineTo(xx,cy-Math.sin(u)*A);
    }
    ctx.stroke();
    _txt(ctx,(bx+bx+pw-20)/2,by+ph+14,'f = '+espan(Math.round(f))+' Hz',{size:10,align:'center',color:C.blood});
  }
  _txt(ctx,12,h-14,closed?'fₘ = (m+½)v/2L: solo armónicos impares.':'fₙ = n·v/2L: todos los armónicos.',{size:11,color:C.muted});
  el('cv_Lv').textContent=espan(L,1)+' cm';
  el('cv_out').textContent=(closed?'Cerrado, L=':'Abierto, L=')+espan(L,1)+' cm: f₁ = '+espan(Math.round(f1))+' Hz';
}
// ===================== SLIDE 5 · CANAL AUDITIVO =====================
function drawEarCanal(){
  const cv=el('sim-earcanal'); if(!cv||!cv.clientWidth) return;
  const w=cv.clientWidth,h=cv.clientHeight; const ctx=AB.setup(cv,w,h);
  _bg(ctx,w,h);
  const Lmm=+num('ea_L')||25; const f1=343/(4*Lmm*0.001);
  const x0=50,y0=h-30,x1=w-16; const top=18;
  _axisX(ctx,x0,y0,x1,['100','500','1k','2k','3,43k','6k','10k']);
  _axisY(ctx,x0,y0,y0-(h-top-26),['0','+5','+10','+15','+20 dB']);
  const fx=(f)=>x0+(x1-x0)*Math.log10(f/100)/3; // log 100..100000
  const fy=(g)=>y0-(h-top-26)*g/22;
  ctx.fillStyle='rgba(14,110,102,0.08)';
  ctx.beginPath(); ctx.moveTo(fx(2000),y0); ctx.lineTo(fx(2000),top); ctx.lineTo(fx(4000),top); ctx.lineTo(fx(4000),y0); ctx.fill();
  _txt(ctx,(fx(2000)+fx(4000))/2,top-6,'banda crítica 2–4 kHz',{size:10,align:'center',color:C.teal});
  ctx.strokeStyle=C.amber; ctx.lineWidth=2.2; ctx.beginPath();
  for(let f=100;f<=100000;f*=1.02){
    const g=4*_gauss(Math.log(f),Math.log(f1),0.35)+2*_gauss(Math.log(f),Math.log(f1*3),0.5);
    ctx.lineTo(fx(f),fy(g));
  }
  ctx.stroke();
  _line(ctx,fx(f1),y0,fx(f1),fy(4),C.blood,1.2,[3,3]);
  _txt(ctx,fx(f1),fy(4)+12,'f₁='+espan(Math.round(f1))+' Hz',{size:10,align:'center',color:C.blood});
  _txt(ctx,12,h-14,'El canal (2,5–3,5 cm) es un resonador de cuarto de onda que amplifica ~2,5–4 kHz.',{size:11,color:C.muted});
  el('ea_Lv').textContent=espan(Lmm,1)+' mm';
  el('ea_out').textContent='f₁ = '+espan(Math.round(f1))+' Hz · ganancia ≈ +'+(f1>3000?'7':'6')+' dB';
}
// ===================== SLIDE 6 · FONEMAS =====================
function drawVocab(){
  const cv=el('sim-vocab'); if(!cv||!cv.clientWidth) return;
  const w=cv.clientWidth,h=cv.clientHeight; const ctx=AB.setup(cv,w,h);
  _bg(ctx,w,h);
  const P={'0':['/i/','anterior, cerrada',0.22,0.30,300,2300],'1':['/e/','anterior, media',0.20,0.42,450,2050],
           '2':['/a/','central, abierta',0.30,0.62,800,1200],'3':['/o/','posterior, media',0.55,0.44,500,800],
           '4':['/u/','posterior, cerrada',0.62,0.32,350,800],'5':['/s/','alveolar, sorda',0.30,0.38,0,0],
           '6':['/m/','bilabial, nasal',0.12,0.45,0,0]};
  const k=String(+num('vt_fon')||0), q=P[k];
  const x0=40,y0=h-24,x1=w-16,top=16;
  _axisY(ctx,x0,y0,y0-(h-top-40),['0','1000','2000','3000 Hz']);
  _line(ctx,x0,y0,x1,y0,C.line,1);
  for(let f=0;f<=3000;f+=250){ const x=x0+(x1-x0)*f/3000; _line(ctx,x,y0,x,y0+3,C.line,1); }
  if(q[4]){
    const fx=(f)=>x0+(x1-x0)*f/3000;
    ctx.strokeStyle=C.teal; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(fx(q[4]),y0); ctx.lineTo(fx(q[4]),top); ctx.stroke();
    ctx.strokeStyle=C.amber; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(fx(q[5]),y0); ctx.lineTo(fx(q[5]),top); ctx.stroke();
    _txt(ctx,fx(q[4])-6,top-4,'F₁',{size:11,align:'right',color:C.teal});
    _txt(ctx,fx(q[5])+6,top-4,'F₂',{size:11,align:'left',color:C.amber});
    _txt(ctx,x0+6,top+12,'F₁ = '+q[4]+' Hz · F₂ = '+q[5]+' Hz',{size:11,color:C.ink});
  }
  // tracto vocal esquemático: laringe (izq) → labios (der)
  const ty=h*0.5;
  _txt(ctx,16,ty-26,'laringe',{size:9,align:'center',color:C.muted});
  _txt(ctx,w-16,ty-26,'labios',{size:9,align:'center',color:C.muted});
  ctx.strokeStyle=C.ink; ctx.lineWidth=3;
  ctx.beginPath(); ctx.moveTo(30,ty+14); ctx.quadraticCurveTo(120,ty-24,250,ty-8);
  ctx.quadraticCurveTo(350,ty+8,430,ty-18); ctx.quadraticCurveTo(500,ty-34,540,ty-20); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(30,ty-14); ctx.quadraticCurveTo(120,ty+24,250,ty+8);
  ctx.quadraticCurveTo(350,ty-8,430,ty+18); ctx.quadraticCurveTo(500,ty+34,540,ty+20); ctx.stroke();
  const tx=x0+(x1-x0)*q[1]*0.4+40, tyy=ty+q[2]*10;
  ctx.fillStyle='rgba(179,53,42,0.55)';
  ctx.beginPath(); ctx.ellipse(tx,tyy,26,16,0.4,0,Math.PI*2); ctx.fill();
  _txt(ctx,14,h-12,'Constricción de la lengua en el punto de articulación (mancha roja).',{size:10,color:C.muted});
  el('vt_out').textContent=q[0]+' → '+q[1]+(q[4]?' · F₁ '+q[4]+' Hz, F₂ '+q[5]+' Hz':'');
}
// ===================== SLIDE 7 · GLOTIS (ANIMADA) =====================
function drawGlottis(){
  const cv=el('sim-glottis'); if(!cv||!cv.clientWidth) return;
  const w=cv.clientWidth,h=cv.clientHeight; const ctx=AB.setup(cv,w,h);
  _bg(ctx,w,h);
  const f0=+num('gl_f')||128; const T=1/f0; const t=window.__glT||0; const ph=(t%T)/T;
  const open=ph<0.55?Math.sin(Math.PI*ph/0.55):0;
  const gap=3+open*30; const cx=w*0.3, cy=70;
  // cuerdas vocales
  ctx.fillStyle=C.teal;
  ctx.beginPath(); ctx.moveTo(cx-70,cy); ctx.quadraticCurveTo(cx-40,cy-34,cx-gap/2,cy-20);
  ctx.quadraticCurveTo(cx-gap/2,cy+20,cx-70,cy); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(cx+70,cy); ctx.quadraticCurveTo(cx+40,cy-34,cx+gap/2,cy-20);
  ctx.quadraticCurveTo(cx+gap/2,cy+20,cx+70,cy); ctx.closePath(); ctx.fill();
  // flujo de aire / Bernoulli
  if(open>0.05){
    const n=5;
    for(let i=1;i<=n;i++){
      const yy=cy-16+32*i/(n+1);
      ctx.strokeStyle='rgba(217,119,6,0.85)'; ctx.lineWidth=1.5;
      ctx.beginPath();
      for(let x=cx-gap/2+2;x<=cx+gap/2-2;x+=3){
        ctx.lineTo(x,yy+Math.sin(x*0.9)*2.5);
      }
      ctx.stroke();
    }
    _txt(ctx,cx,cy+38,'P baja (Bernoulli)',{size:10,align:'center',color:C.amber,bold:true});
  } else {
    _txt(ctx,cx,cy+38,'cuerdas cerradas',{size:10,align:'center',color:C.blood,bold:true});
  }
  _txt(ctx,cx-70,cy-42,'cartílago aritenoides',{size:9,color:C.muted});
  // pulso glotal
  const px0=w*0.52,py0=h-16,pw=w-20-px0,phg=86;
  _line(ctx,px0,py0,px0+pw,py0,C.line,1);
  _txt(ctx,px0,py0-phg-6,'pulso glotal (2 ciclos)',{size:10,color:C.teal,bold:true});
  ctx.strokeStyle=C.blood; ctx.lineWidth=2; ctx.beginPath();
  for(let xx=0;xx<=pw;xx+=2){
    const tt=(xx/pw)*2*T, pp=(tt%T)/T;
    const o=pp<0.55?Math.sin(Math.PI*pp/0.55):0;
    ctx.lineTo(px0+xx,py0-o*phg);
  }
  ctx.stroke();
  _line(ctx,px0+pw*(ph/T)/2,py0-phg-4,px0+pw*(ph/T)/2,py0,C.blood,1,[3,3]);
  _txt(ctx,px0+pw*(ph/T)/2,py0-phg-12,'t',{size:9,color:C.blood});
  _txt(ctx,12,h-10,'cada cierre = un «golpe» del pulso glotal · f₀ = '+espan(f0,0)+' Hz',{size:10,color:C.muted});
  el('gl_fv').textContent=espan(f0,0)+' Hz';
  el('gl_out').textContent='Ciclo glotal · f₀ = '+espan(f0,0)+' Hz · '+(window.__glPlaying?'animando':'en pausa');
}
function toggleGlottis(){
  window.__glPlaying=!window.__glPlaying; window.__glT=0;
  const b=el('gl_play'); if(b) b.textContent=window.__glPlaying?'⏸':'▶';
  drawGlottis();
}
// ===================== SLIDE 8 · FUENTE-FILTRO (ANIMADA) =====================
function drawSourceFilter(){
  const cv=el('sim-sourcefilter'); if(!cv||!cv.clientWidth) return;
  const w=cv.clientWidth,h=cv.clientHeight; const ctx=AB.setup(cv,w,h);
  _bg(ctx,w,h);
  const V={'0':['/a/',[800,1200,2500]],'1':['/e/',[450,2050,2600]],'2':['/i/',[300,2300,3000]],
           '3':['/o/',[500,800,2500]],'4':['/u/',[350,800,2500]]};
  const k=String(+num('sf_vowel')||0), vw=V[k]; const f0=128, n=12; const t=window.__sfT||0;
  const x0=46,x1=w-12;
  const fx=(f)=>x0+(x1-x0)*Math.log10(f/50)/2; // 50..5000
  const panels=[['Fuente (glotis)',24],['Filtro T(f) — '+vw[0],118],['Salida = fuente × filtro',212]];
  for(const p of panels){
    _txt(ctx,x0,p[1],p[0],{size:11,bold:true,color:C.teal});
    _line(ctx,x0,p[1]+16,x1,p[1]+16,C.line,1);
  }
  // fuente
  for(let i=1;i<=n;i++){
    const f=i*f0, hh=52/i*(1+0.06*Math.sin(t*6+i));
    _rect(ctx,fx(f)-3,24+16-hh,6,hh,C.teal);
  }
  // filtro
  const f1=vw[1];
  ctx.strokeStyle=C.amber; ctx.lineWidth=2; ctx.beginPath();
  for(let f=50;f<=5000;f*=1.02){
    let Tf=0.4;
    for(let j=0;j<3;j++) Tf+=4.6*_gauss(Math.log(f),Math.log(f1[j]),0.55);
    const y=118+16-45*Math.min(1,Tf/4.6);
    ctx.lineTo(fx(f),y);
  }
  ctx.stroke();
  for(let j=0;j<3;j++){ _line(ctx,fx(f1[j]),118+16,fx(f1[j]),118+16-45,C.blood,1,[3,3]); }
  // salida
  for(let i=1;i<=n;i++){
    const f=i*f0; let Tf=0.4;
    for(let j=0;j<3;j++) Tf+=4.6*_gauss(Math.log(f),Math.log(f1[j]),0.55);
    const hh=(52/i)*(1+0.06*Math.sin(t*6+i))*Math.min(1,Tf/4.6);
    _rect(ctx,fx(f)-3,212+16-hh,6,hh,C.blood);
  }
  _txt(ctx,x0,h-12,'F₁='+f1[0]+' · F₂='+f1[1]+' · F₃='+f1[2]+' Hz',{size:10,color:C.muted});
  el('sf_out').textContent=vw[0]+' → F₁≈'+f1[0]+' Hz · F₂≈'+f1[1]+' Hz';
}
function toggleSourceFilter(){
  window.__sfPlaying=!window.__sfPlaying; window.__sfT=0;
  const b=el('sf_play'); if(b) b.textContent=window.__sfPlaying?'⏸':'▶';
  drawSourceFilter();
}
// ===================== SLIDE 9 · DOS TUBOS =====================
function drawTwoTube(){
  const cv=el('sim-twotube'); if(!cv||!cv.clientWidth) return;
  const w=cv.clientWidth,h=cv.clientHeight; const ctx=AB.setup(cv,w,h);
  _bg(ctx,w,h);
  const RAT=[1,0.5,0.25,0.1,0.03]; const sel=+num('tt_sel')||0; const a2=RAT[sel];
  const PrPi=(1-a2)/(1+a2);
  const cx=w*0.5, h1=120, cy=h*0.5+8;
  _rect(ctx,16,cy-h1/2,cx-26,h1,C.teal);
  _rect(ctx,cx+10,cy-a2*h1/2,cx-26,a2*h1,C.blood);
  _txt(ctx,cx/2-6,cy-h1/2-8,'A₁',{size:13,bold:true,align:'center',color:C.teal});
  _txt(ctx,(w+cx)/2,cy-a2*h1/2-8,'A₂ = '+espan(a2,2)+'·A₁',{size:13,bold:true,align:'center',color:C.blood});
  const iy=cy+h1/2+26;
  ctx.strokeStyle=C.ink; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(16,iy); ctx.lineTo(cx-8,iy); ctx.stroke();
  ctx.fillStyle=C.ink; ctx.beginPath(); ctx.moveTo(cx-8,iy-5); ctx.lineTo(cx-8,iy+5); ctx.lineTo(cx+2,iy); ctx.fill();
  _txt(ctx,cx/2,iy+14,'incidente',{size:10,align:'center',color:C.muted});
  const tx=Math.max(2,h1*0.18*(1-PrPi)*2.2);
  ctx.strokeStyle=C.tealD; ctx.lineWidth=Math.min(10,Math.max(1.5,tx));
  ctx.beginPath(); ctx.moveTo(cx+6,iy); ctx.lineTo(w-16,iy); ctx.stroke();
  const rx=h1*0.18*PrPi*2.2;
  ctx.strokeStyle=C.blood; ctx.lineWidth=Math.min(10,Math.max(1.2,rx));
  ctx.beginPath(); ctx.moveTo(cx-8,iy); ctx.lineTo(26,iy-24); ctx.stroke();
  const Tp=2/(1+a2);
  _txt(ctx,30,iy-34,'P_r/P_i = '+espan(PrPi,2)+'  ('+espan(PrPi*100,1)+' %)',{size:11,color:C.blood});
  _txt(ctx,(w+cx)/2,iy+14,'P_t/P_i = '+espan(Tp,2)+'  transmitida',{size:10,color:C.tealD});
  _txt(ctx,12,h-12,'P_r/P_i = (A₁−A₂)/(A₁+A₂): la estrechez refleja la onda.',{size:10,color:C.muted});
  el('tt_out').textContent='P_r/P_i = '+espan(PrPi*100,1)+' %'+(a2===1?' · sin reflexión':'');
}
// ===================== SLIDE 10 · FOURIER =====================
function drawTimbre(){
  const cv=el('sim-timbre'); if(!cv||!cv.clientWidth) return;
  const w=cv.clientWidth,h=cv.clientHeight; const ctx=AB.setup(cv,w,h);
  _bg(ctx,w,h);
  const shape=+num('tm_sel')||0; const nmax=+num('tm_n')||6;
  const names=['Diente de sierra (voz)','Cuadrada (clarinete)','Triangular (flauta)'];
  const f0=128;
  const am=(n)=>{ if(shape===0) return 1/n; if(shape===1) return n%2?1/n:0; return n%2?1/(n*n):0; };
  const x0=44,x1=w-10; const yT=30,hT=70, yS=130, hS=150;
  _txt(ctx,x0,14,names[shape]+' · f₀ = '+f0+' Hz',{size:12,bold:true,color:C.teal});
  _line(ctx,x0,yT,x1,yT,C.line,1); _txt(ctx,x0,yT-6,'armónicos',{size:10,color:C.muted});
  for(let i=1;i<=nmax;i++){
    const x=x0+(x1-x0)*(i-1)/(nmax-1), a=am(i), hh=hT*a;
    _rect(ctx,x-3,yT-hh,6,hh,C.muted);
  }
  _line(ctx,x0,yS,x1,yS,C.line,1); _txt(ctx,x0,yS-6,'suma (1 ciclo)',{size:10,color:C.muted});
  _line(ctx,x0,yS+hS,x1,yS+hS,C.line,1);
  ctx.strokeStyle=C.blood; ctx.lineWidth=2.5; ctx.beginPath();
  const N=80;
  for(let i=0;i<=N;i++){
    const xx=x0+(x1-x0)*i/N;
    let s=0; for(let n=1;n<=nmax;n++){ s+=am(n)*Math.sin(2*Math.PI*n*(i/N)); }
    ctx.lineTo(xx,yS+hS/2-s*hS*0.42);
  }
  ctx.stroke();
  _txt(ctx,12,h-12,'aₙ ∝ 1/n (sierra) · 1/n impares (cuadrada) · 1/n² impares (triangular).',{size:10,color:C.muted});
  el('tm_nv').textContent=String(nmax);
  el('tm_out').textContent=names[shape]+' · '+nmax+' armónicos · f₀ = '+f0+' Hz';
}
// ===================== SLIDE 11 · ENERGÉTICA =====================
function drawEnergy(){
  const cv=el('sim-energy'); if(!cv||!cv.clientWidth) return;
  const w=cv.clientWidth,h=cv.clientHeight; const ctx=AB.setup(cv,w,h);
  _bg(ctx,w,h);
  const S=[['Habla normal',0.01,0.001],['Susurro',0.01,1e-6],['Grito',0.06,0.005],['Canto lírico',0.04,0.02]];
  const k=+num('en_sel')||0, q=S[k];
  const x0=60,y0=h-34,x1=w-14, top=18;
  _axisX(ctx,x0,y0,x1,['10⁻⁶','10⁻⁵','10⁻⁴','10⁻³','10⁻²','10⁻¹','10⁰','10² W']);
  const fx=(p)=>x0+(x1-x0)*(Math.log10(p)+6)/8;
  _line(ctx,fx(100),top,fx(100),y0,C.line,1,[3,3]);
  _txt(ctx,fx(100),top-4,'metabolismo en reposo ≈ 100 W',{size:9,align:'center',color:C.muted});
  const bars=[['aerodinámica',q[1],C.teal],['sonido',q[2],C.amber]];
  for(const b of bars){
    const x=fx(b[1]);
    _rect(ctx,x-6,top+30,12,y0-top-30,b[2]);
    _txt(ctx,x,top+22,b[0],{size:10,align:'center',color:b[2],bold:true});
  }
  _txt(ctx,x0+6,top+46,'P son ≈ '+espan(q[2]*1000,3)+' mW · eficiencia ≈ '+espan((q[2]/q[1])*100,1)+' %',{size:11,bold:true,color:C.ink});
  _txt(ctx,12,h-12,'La voz es un subproducto barato: ~10⁻³ W acústicos sobre ~10⁻² W aerodinámicos.',{size:10,color:C.muted});
  el('en_out').textContent=q[0]+': '+espan(q[1]*1000,1)+' mW aerod. → '+espan(q[2]*1000,3)+' mW sonido';
}
// ===================== SLIDE 12 · CAMPO AUDITIVO =====================
function drawAudField(){
  const cv=el('sim-audfield'); if(!cv||!cv.clientWidth) return;
  const w=cv.clientWidth,h=cv.clientHeight; const ctx=AB.setup(cv,w,h);
  _bg(ctx,w,h);
  const x0=52,y0=h-30,x1=w-14, top=16;
  _axisX(ctx,x0,y0,x1,['20','100','500','1k','2k','4k','10k','20k Hz']);
  _axisY(ctx,x0,y0,y0-(h-top-28),['0','40','80','120 dB']);
  const fx=(f)=>x0+(x1-x0)*(Math.log10(f/20)/3);
  const fy=(db)=>y0-(h-top-28)*db/130;
  const TH=[[20,80],[40,55],[100,35],[300,18],[1000,0],[3000,-3],[5000,0],[10000,12],[15000,28],[20000,40]];
  const PAIN=[[20,150],[60,132],[200,125],[1000,120],[10000,120],[20000,120]];
  ctx.fillStyle='rgba(14,110,102,0.10)';
  ctx.beginPath();
  for(let i=0;i<TH.length;i++){ const p=TH[i]; if(i===0)ctx.moveTo(fx(p[0]),fy(p[1])); else ctx.lineTo(fx(p[0]),fy(p[1])); }
  for(let i=PAIN.length-1;i>=0;i--){ const p=PAIN[i]; ctx.lineTo(fx(p[0]),fy(p[1])); }
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle=C.teal; ctx.lineWidth=2; ctx.beginPath();
  for(let i=0;i<TH.length;i++){ const p=TH[i]; if(i===0)ctx.moveTo(fx(p[0]),fy(p[1])); else ctx.lineTo(fx(p[0]),fy(p[1])); }
  ctx.stroke();
  ctx.strokeStyle=C.blood; ctx.lineWidth=1.6; ctx.beginPath();
  for(let i=0;i<PAIN.length;i++){ const p=PAIN[i]; if(i===0)ctx.moveTo(fx(p[0]),fy(p[1])); else ctx.lineTo(fx(p[0]),fy(p[1])); }
  ctx.stroke();
  _txt(ctx,x0+8,top+8,'campo auditivo',{size:11,color:C.teal,bold:true});
  const f=+num('af_f')||1000; const thr=40-43*_gauss(Math.log(f),Math.log(3000),0.7);
  ctx.fillStyle=C.amber; ctx.beginPath(); ctx.arc(fx(f),fy(thr),5,0,Math.PI*2); ctx.fill();
  _line(ctx,fx(f),fy(thr),fx(f),y0,C.amber,1,[3,3]);
  _txt(ctx,fx(f),fy(thr)-8,espan(f,0)+' Hz · umbral '+espan(thr,0)+' dB',{size:10,align:'center',color:C.amber});
  _txt(ctx,12,h-12,'El oído es más sensible a 2–4 kHz: el fondo del campo auditivo es una U.',{size:10,color:C.muted});
  el('af_fv').textContent=espan(f,0)+' Hz';
  el('af_out').textContent=espan(f,0)+' Hz · umbral '+espan(thr,0)+' dB · '+(thr<120?'audible':'dolor');
}
// ===================== SLIDE 13 · OÍDO MEDIO =====================
function drawMiddleEar(){
  const cv=el('sim-middleear'); if(!cv||!cv.clientWidth) return;
  const w=cv.clientWidth,h=cv.clientHeight; const ctx=AB.setup(cv,w,h);
  _bg(ctx,w,h);
  const ae=+num('me_ae')||17, lv=+num('me_l')||1.3; const tot=ae*lv;
  const db=20*Math.log10(tot);
  const h1=120, cy=h*0.52; const h2=Math.max(10,h1/ae);
  const xT=50, xW=w-70;
  _rect(ctx,xT-12,cy-h1/2,12,h1,C.teal);
  _rect(ctx,xW,cy-h2/2,12,h2,C.blood);
  _txt(ctx,xT-6,cy-h1/2-8,'tímpano A₁',{size:11,align:'center',color:C.teal});
  _txt(ctx,xW+6,cy-h2/2-8,'estribo A₂',{size:11,align:'center',color:C.blood});
  // cadena de huesecillos
  ctx.strokeStyle=C.ink; ctx.lineWidth=3;
  ctx.beginPath(); ctx.moveTo(xT+4,cy); ctx.lineTo(xT+44,cy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(xT+44,cy-8); ctx.lineTo(xT+44,cy+8); ctx.lineTo(xW-16,cy+16); ctx.stroke();
  ctx.fillStyle=C.ink; ctx.beginPath(); ctx.arc(xT+44,cy,3.5,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(xW,cy+16,3.5,0,Math.PI*2); ctx.fill();
  _line(ctx,xW-16,cy+16,xW,cy+16,C.ink,3);
  _txt(ctx,(xT+44+xW-16)/2,cy-12,'palanca ×'+espan(lv,2),{size:10,align:'center',color:C.ink});
  _txt(ctx,(xT+xW)/2,cy+40,'fuerza ×'+espan(ae,1)+' (área) ×'+espan(lv,2)+' = ×'+espan(tot,1),{size:12,bold:true,align:'center',color:C.teal});
  _line(ctx,xT-24,cy-h1/2-30,xW+24,cy-h1/2-30,C.blood,1.4,[4,3]);
  _txt(ctx,(xT+xW)/2,cy-h1/2-36,'27 dB (blanco del adaptador)',{size:10,align:'center',color:C.blood});
  _txt(ctx,12,h-12,'Con valores reales (17× y 1,3×) se compensa la reflexión del 99,9 % en la ventana oval.',{size:10,color:C.muted});
  el('me_aev').textContent=espan(ae,1)+'×';
  el('me_lv').textContent=espan(lv,2)+'×';
  el('me_out').textContent='Total '+espan(tot,1)+'× → '+espan(db,1)+' dB';
}
// ===================== SLIDE 14 · CÓCLEA (ANIMADA) =====================
function drawCochlea(){
  const cv=el('sim-cochlea'); if(!cv||!cv.clientWidth) return;
  const w=cv.clientWidth,h=cv.clientHeight; const ctx=AB.setup(cv,w,h);
  _bg(ctx,w,h);
  const f=+num('co_f')||1000;
  const place=clamp(1.02-0.20*Math.log10(f/20),0.08,0.90);
  const x0=40,y0=h-26,x1=w-16; const L=x1-x0;
  const bT=46, aT=8; // altura en base y ápex
  const t=window.__coT||0;
  const crest=place+0.03*Math.sin(t*4);
  // membrana basilar (trapecio)
  ctx.fillStyle='rgba(14,110,102,0.12)';
  ctx.beginPath(); ctx.moveTo(x0,y0-bT); ctx.lineTo(x1,y0-aT); ctx.lineTo(x1,y0); ctx.lineTo(x0,y0); ctx.closePath(); ctx.fill();
  _poly(ctx,[{x:x0,y:y0-bT},{x:x1,y:y0-aT},{x:x1,y:y0},{x:x0,y:y0}],C.teal);
  // onda viajera
  ctx.strokeStyle=C.blood; ctx.lineWidth=2.2; ctx.beginPath();
  for(let i=0;i<=100;i++){
    const xx=x0+L*i/100;
    const hh=(bT-aT)*(1-i/100)+aT;
    const env=_gauss(i/100,crest,0.10);
    ctx.lineTo(xx,y0-hh*(0.2+env*0.9));
  }
  ctx.stroke();
  _line(ctx,x0+L*place,y0,x0+L*place,y0-bT+8,C.amber,1.6,[4,3]);
  _txt(ctx,x0+L*place,y0-bT+14,'máx ≈ '+espan(Math.round(f))+' Hz',{size:10,align:'center',color:C.amber});
  _txt(ctx,x0+4,y0+16,'ventana oval (agudo)',{size:9,color:C.muted});
  _txt(ctx,x1-4,y0+16,'ápex (grave)',{size:9,align:'right',color:C.muted});
  _txt(ctx,12,14,'tonotopía: cada lugar de la basilar responde a una frecuencia · f = '+espan(Math.round(f))+' Hz → x ≈ '+espan(Math.round(place*100))+' %',{size:11,bold:true,color:C.teal});
  _txt(ctx,12,h-10,'las células ciliadas externas amplifican la onda: el «amplificador coclear».',{size:10,color:C.muted});
  el('co_fv').textContent=espan(Math.round(f),0)+' Hz';
  el('co_out').textContent=Math.round(f)+' Hz → máx. en x ≈ '+espan(Math.round(place*100),0)+' % de la basilar';
}
function toggleCochlea(){
  window.__coPlaying=!window.__coPlaying; window.__coT=0;
  const b=el('co_play'); if(b) b.textContent=window.__coPlaying?'⏸':'▶';
  drawCochlea();
}
// ===================== SLIDE 15 · AUDIOGRAMA =====================
function drawAudiogram(){
  const cv=el('sim-audiogram'); if(!cv||!cv.clientWidth) return;
  const w=cv.clientWidth,h=cv.clientHeight; const ctx=AB.setup(cv,w,h);
  _bg(ctx,w,h);
  const FR=[250,500,1000,2000,4000,8000];
  const fx=(f)=>x0+(x1-x0)*Math.log2(f/125)/6;
  const x0=52,y0=h-30,x1=w-14,top=18;
  _axisX(ctx,x0,y0,x1,['125','250','500','1k','2k','4k','8k Hz']);
  _axisY(ctx,x0,y0,y0-(h-top-30),['0','20','40','60','80','100 dB']);
  // bandas de severidad
  const bands=[[0,15,'rgba(14,110,102,0.08)'],[16,25,'rgba(14,110,102,0.12)'],[26,40,'rgba(217,119,6,0.12)'],
               [41,55,'rgba(217,119,6,0.18)'],[56,70,'rgba(179,53,42,0.14)'],[71,90,'rgba(179,53,42,0.22)'],[91,120,'rgba(90,30,24,0.22)']];
  const fy=(db)=>y0-(h-top-30)*db/110;
  for(const b of bands){ _rect(ctx,x0,fy(b[0]),x1-x0,fy(b[1])-fy(b[0]),b[2]); }
  const CASES=[['Normal (0–15)','rgba(14,110,102,0.9)',[0,0,0,0,5,10]],
               ['Ligera (16–25)','rgba(14,110,102,0.9)',[20,20,20,22,25,28]],
               ['Leve (26–40)','rgba(217,119,6,0.95)',[33,33,33,35,40,45]],
               ['Moderada (41–55)','rgba(217,119,6,0.95)',[48,48,50,52,55,58]],
               ['Conductiva plana','rgba(122,144,148,0.95)',[42,42,42,42,42,42]],
               ['Neurosensorial (ruido)','rgba(179,53,42,0.95)',[0,5,10,25,62,45]],
               ['Profunda (>90)','rgba(90,30,24,0.95)',[92,94,96,98,100,102]]];
  const k=+num('au_sel')||0, cs=CASES[k];
  ctx.strokeStyle=cs[1]; ctx.lineWidth=2.4; ctx.beginPath();
  for(let i=0;i<FR.length;i++){ const xx=fx(FR[i]); if(i===0)ctx.moveTo(xx,fy(cs[2][i])); else ctx.lineTo(xx,fy(cs[2][i])); }
  ctx.stroke();
  for(let i=0;i<FR.length;i++){ ctx.fillStyle=cs[1]; ctx.beginPath(); ctx.arc(fx(FR[i]),fy(cs[2][i]),3,0,Math.PI*2); ctx.fill(); }
  _txt(ctx,x0+6,top+6,cs[0],{size:12,bold:true,color:cs[1]});
  _txt(ctx,12,h-12,'dB HL = pérdida frente al umbral normal · conductiva plana · neurosensorial cae en agudos.',{size:10,color:C.muted});
  el('au_out').textContent=cs[0];
}
// ===================== SLIDE 16 · DAÑO POR EDAD =====================
function drawDamage(){
  const cv=el('sim-damage'); if(!cv||!cv.clientWidth) return;
  const w=cv.clientWidth,h=cv.clientHeight; const ctx=AB.setup(cv,w,h);
  _bg(ctx,w,h);
  const age=+num('pr_age')||30;
  const FR=[250,500,1000,2000,4000,8000];
  const K=[0.35,0.45,0.6,0.75,0.95,1.1];
  const fx=(f)=>x0+(x1-x0)*Math.log2(f/125)/6;
  const x0=52,y0=h-30,x1=w-14,top=18;
  _axisX(ctx,x0,y0,x1,['125','250','500','1k','2k','4k','8k','16k Hz']);
  _axisY(ctx,x0,y0,y0-(h-top-30),['0','20','40','60','80','100 dB']);
  const fy=(db)=>y0-(h-top-30)*db/110;
  ctx.strokeStyle=C.amber; ctx.lineWidth=2.4; ctx.beginPath();
  const losses=FR.map((f,i)=>clamp((age-20)*K[i]*0.9,0,110));
  for(let i=0;i<FR.length;i++){ const xx=fx(FR[i]); if(i===0)ctx.moveTo(xx,fy(losses[i])); else ctx.lineTo(xx,fy(losses[i])); }
  ctx.stroke();
  for(let i=0;i<FR.length;i++){ ctx.fillStyle=C.amber; ctx.beginPath(); ctx.arc(fx(FR[i]),fy(losses[i]),3,0,Math.PI*2); ctx.fill(); }
  const f16=(age-20)*1.3;
  const x16=x1+2;
  ctx.strokeStyle=C.blood; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(x16,fy(0)); ctx.lineTo(x16,fy(f16)); ctx.stroke();
  _txt(ctx,x16,top+8,'16 kHz',{size:9,align:'center',color:C.blood});
  _txt(ctx,x0+6,top+10,age+' años · presbiacusia: la caída empieza en agudos',{size:12,bold:true,color:C.amber});
  const audible=f16<80;
  _txt(ctx,x0+6,top+24,(audible?'16 kHz: todavía audible ('+espan(f16,0)+' dB HL)':'16 kHz: fuera del campo auditivo ('+espan(f16,0)+' dB HL)'),{size:10,color:C.muted});
  _txt(ctx,12,h-12,'El daño por ruido deja su «notch» en 3–6 kHz; la edad cobra peaje en los agudos.',{size:10,color:C.muted});
  el('pr_agev').textContent=age+' años';
  el('pr_out').textContent=age+' años · 16 kHz: '+(audible?'aún audible ('+espan(f16,0)+' dB HL)':'silenciado');
}
// ===================== SLIDE 17 · FONES Y SONIOS =====================
function drawPhonSone(){
  const cv=el('sim-phonsone'); if(!cv||!cv.clientWidth) return;
  const w=cv.clientWidth,h=cv.clientHeight; const ctx=AB.setup(cv,w,h);
  _bg(ctx,w,h);
  const ph=+num('ps_ph')||40;
  const x0=52,y0=h-30,x1=w-14,top=16;
  _axisX(ctx,x0,y0,x1,['0','20','40','60','80','100','120 ph']);
  _axisY(ctx,x0,y0,y0-(h-top-28),['0','4','16','64 sone']);
  const fx=(p)=>x0+(x1-x0)*p/120;
  const fy=(s)=>y0-(h-top-28)*Math.log2(1+s)/7;
  ctx.strokeStyle=C.teal; ctx.lineWidth=2.2; ctx.beginPath();
  for(let p=0;p<=120;p+=2){ ctx.lineTo(fx(p),fy(Math.pow(10,0.03*p-1.2))); }
  ctx.stroke();
  for(const s of [1,2,4,8,16]){ _line(ctx,fx(40+10*Math.log2(s)),y0-3,fx(40+10*Math.log2(s)),fy(s),C.line,1,[3,3]); _txt(ctx,fx(40+10*Math.log2(s)),fy(s)-6,espan(s,0)+' sone',{size:9,align:'center',color:C.muted}); }
  const sone=Math.pow(10,0.03*ph-1.2);
  ctx.fillStyle=C.blood; ctx.beginPath(); ctx.arc(fx(ph),fy(sone),5,0,Math.PI*2); ctx.fill();
  _line(ctx,fx(ph),fy(sone),fx(ph),y0,C.blood,1,[3,3]);
  _txt(ctx,fx(ph),fy(sone)+12,espan(ph,0)+' ph → '+espan(sone,2)+' sone',{size:11,align:'center',color:C.blood,bold:true});
  _txt(ctx,12,h-12,'S = (I/10⁻⁸)^0,3: +10 ph duplica la sonoridad · 40 ph ≡ 1 sone.',{size:10,color:C.muted});
  el('ps_phv').textContent=espan(ph,0)+' ph';
  el('ps_out').textContent=espan(ph,0)+' ph → '+espan(sone,2)+' sone';
}
// ===================== SLIDE 18 · MEL Y FUNDAMENTAL AUSENTE =====================
function drawPitch(){
  const cv=el('sim-pitch'); if(!cv||!cv.clientWidth) return;
  const w=cv.clientWidth,h=cv.clientHeight; const ctx=AB.setup(cv,w,h);
  _bg(ctx,w,h);
  const k=+num('pt_sel')||0;
  const NAMES=['Voz completa (f₀ presente)','Sin fundamental (teléfono)','Clarinete (solo impares)'][k];
  const x0=50,y0=h-30,x1=w-16,top=16;
  const fx=(f)=>x0+(x1-x0)*Math.log10(f/20)/3;
  const fy=(m)=>y0-(h-top-40)*m/4500;
  _axisX(ctx,x0,y0,x1,['20','100','500','1k','5k','20k Hz']);
  _axisY(ctx,x0,y0,y0-(h-top-40),['0','1000','2000','3000','4000 mel']);
  ctx.strokeStyle=C.teal; ctx.lineWidth=2; ctx.beginPath();
  for(let f=20;f<=20000;f*=1.03){ ctx.lineTo(fx(f),fy(1000*Math.log2(1+f/1000))); }
  ctx.stroke();
  _txt(ctx,x0+8,top+6,'escala de mels (percepción del tono)',{size:11,color:C.teal,bold:true});
  const f0=128;
  const boxy=top+56, boxh=40;
  _txt(ctx,x0,boxy-6,NAMES+' · percibes f₀ = 128 Hz',{size:11,bold:true,color:C.blood});
  _line(ctx,x0,boxy+boxh+4,x1,boxy+boxh+4,C.line,1);
  _txt(ctx,x0,boxy+boxh+10,'espectro (armónicos de f₀)',{size:9,color:C.muted});
  for(let n=1;n<=8;n++){
    const x=fx(n*f0);
    const present = k===0 ? true : (k===1 ? n>1 : n%2===1);
    const a=1/n;
    if(present){ _rect(ctx,x-3,boxy+boxh-a*boxh,6,a*boxh,C.teal); }
    else { _line(ctx,x,boxy+boxh,x,boxy+boxh-a*boxh,C.muted,1,[2,2]); }
  }
  _txt(ctx,12,h-12,'La fundamental «ausente» la reconstruye el cerebro a partir del espaciado de los armónicos.',{size:10,color:C.muted});
  el('pt_out').textContent=NAMES+' · percibes f₀ = 128 Hz';
}
// ===================== SLIDE 19 · ENMASCARAMIENTO Y LOCALIZACIÓN =====================
function drawMasking(){
  const cv=el('sim-masking'); if(!cv||!cv.clientWidth) return;
  const w=cv.clientWidth,h=cv.clientHeight; const ctx=AB.setup(cv,w,h);
  _bg(ctx,w,h);
  const probe=+num('ms_f')||2000; const th=+num('ms_th')||0;
  const x0=52,y0=h-32,x1=w-16,top=16;
  _axisX(ctx,x0,y0,x1,['100','500','1k','2k','4k','8k Hz']);
  _axisY(ctx,x0,y0,y0-(h-top-26),['0','40','80 dB']);
  const fx=(f)=>x0+(x1-x0)*(Math.log10(f/100)/1.9);
  const fy=(db)=>y0-(h-top-26)*db/90;
  ctx.strokeStyle=C.amber; ctx.lineWidth=2; ctx.beginPath();
  for(let f=100;f<=8000;f*=1.02){ ctx.lineTo(fx(f),fy(70*Math.exp(-Math.pow(Math.log2(f/1000)/1.2,2)))); }
  ctx.stroke();
  _txt(ctx,x0+8,top+8,'enmascarador (1 kHz · 70 dB)',{size:10,color:C.amber,bold:true});
  const mask=70*Math.exp(-Math.pow(Math.log2(probe/1000)/1.2,2));
  const masked=mask>40;
  ctx.fillStyle=masked?C.blood:C.teal;
  ctx.beginPath(); ctx.arc(fx(probe),fy(40),5,0,Math.PI*2); ctx.fill();
  _line(ctx,fx(probe),fy(40),fx(probe),y0,C.muted,1,[3,3]);
  _txt(ctx,fx(probe),fy(40)-8,espan(probe,0)+' Hz · '+(masked?'ENMASCARADA':'audible'),{size:10,align:'center',color:masked?C.blood:C.teal,bold:true});
  // localización: cabeza + ITD
  const hx=w-52, hy=top+8, R=17;
  ctx.strokeStyle=C.ink; ctx.lineWidth=1.5; ctx.beginPath(); ctx.arc(hx,hy,R,0,Math.PI*2); ctx.stroke();
  ctx.fillStyle=C.muted; ctx.beginPath(); ctx.arc(hx-R-8,hy,3,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(hx+R+8,hy,3,0,Math.PI*2); ctx.fill();
  const ang=th*Math.PI/180; const d=0.21; const ITD=d*Math.sin(ang)/343*1e6;
  ctx.strokeStyle=C.blood; ctx.lineWidth=1.2;
  ctx.beginPath(); ctx.moveTo(hx,hy); ctx.lineTo(hx+Math.sin(ang)*50,hy-Math.cos(ang)*50); ctx.stroke();
  _txt(ctx,hx,hy+26,'θ = '+th+'° · ITD ≈ '+espan(Math.max(0,ITD),0)+' µs',{size:10,align:'center',color:C.blood});
  _txt(ctx,12,h-12,'Banda crítica + sombra acústica de la cabeza: los graves enmascaran a los agudos.',{size:10,color:C.muted});
  el('ms_fv').textContent=espan(probe,0)+' Hz';
  el('ms_tv').textContent=th+'°';
  el('ms_out').textContent='ITD ≈ '+espan(Math.max(0,ITD),0)+' µs'+(th===0?' (centro)':'')+' · sonda '+(masked?'enmascarada':'audible');
}
// ===================== SLIDE 20 · FUENTES CORPORALES =====================
function drawBodySources(){
  const cv=el('sim-bodysources'); if(!cv||!cv.clientWidth) return;
  const w=cv.clientWidth,h=cv.clientHeight; const ctx=AB.setup(cv,w,h);
  _bg(ctx,w,h);
  const S=[['Respiración',10],['Corazón',20],['Caminar',25],['Correr',35],['Voz',65],['Grito',75]];
  const k=+num('bo_sel')||0;
  const x0=60,y0=h-32,x1=w-14,top=20;
  _axisX(ctx,x0,y0,x1,['0','10','20','30','40','50','60','70','80 dB']);
  const fx=(db)=>x0+(x1-x0)*db/80;
  const bh=44, bw=9;
  for(let i=0;i<S.length;i++){
    const x=fx(S[i][1]);
    const col=i===k?C.amber:(S[i][1]>=60?C.blood:C.teal);
    _rect(ctx,x-bw/2,top+22,bw,bh,col);
    _txt(ctx,x,top+16,S[i][0],{size:9,align:'center',color:col,bold:i===k});
    _txt(ctx,x,top+22+bh+10,S[i][1]+' dB',{size:9,align:'center',color:C.muted});
  }
  _txt(ctx,x0+6,top+78,'correr: ΔP ≈ 2,0 atm @ 4 Hz   ·   gritar: 0,05 atm @ 1 kHz',{size:11,bold:true,color:C.ink});
  _txt(ctx,12,h-12,'El cuerpo vibra y suena en cada actividad: la auscultación escucha esas ondas.',{size:10,color:C.muted});
  el('bo_out').textContent=S[k][0]+' · ≈ '+S[k][1]+' dB @ 1 m';
}
// ===================== SLIDE 21 · RUIDOS CARDÍACOS (ANIMADA) =====================
function drawHeartSounds(){
  const cv=el('sim-heartsounds'); if(!cv||!cv.clientWidth) return;
  const w=cv.clientWidth,h=cv.clientHeight; const ctx=AB.setup(cv,w,h);
  _bg(ctx,w,h);
  const k=+num('hs_sel')||0;
  const T=0.9; const t=(window.__hsT||0)%T;
  const x0=46,y0=h-30,x1=w-14,top=18;
  _line(ctx,x0,y0,x1,y0,C.line,1);
  const amp=h*0.42;
  const env=(tt)=>{
    let e=0;
    if(k!==2) e+=1.0*_gauss(tt,0.06,0.028)+0.7*_gauss(tt,0.42,0.022);
    else e+=0.5*_gauss(tt,0.06,0.06)+0.4*_gauss(tt,0.42,0.05);
    if(k===1) e+=0.35*_gauss(tt,0.17,0.05);
    if(k===2){ for(let i=1;i<6;i++) e+=0.5*Math.max(0,1-Math.abs(tt-0.24)/0.16)*Math.sin(tt*80); }
    return e;
  };
  const fx=(tt)=>x0+(x1-x0)*tt/T;
  ctx.strokeStyle=C.teal; ctx.lineWidth=1.4; ctx.beginPath();
  for(let tt=0;tt<=T;tt+=0.002){
    const e=env(tt);
    ctx.lineTo(fx(tt),y0-e*amp*(1+0.06*Math.sin(tt*40)));
  }
  ctx.stroke();
  _line(ctx,fx(t),y0-amp,fx(t),y0+amp,C.blood,1.4,[3,3]);
  _txt(ctx,fx(t),top-4,espan(Math.round(t*100)/100,2)+' s',{size:10,align:'center',color:C.blood});
  _txt(ctx,fx(0.06),y0-amp-8,'S₁ (lub)',{size:10,align:'center',color:C.blood,bold:true});
  _txt(ctx,fx(0.42),y0-amp-8,'S₂ (dub)',{size:10,align:'center',color:C.blood,bold:true});
  if(k===1) _txt(ctx,fx(0.17),y0-amp-8,'S₃',{size:10,align:'center',color:C.teal});
  if(k===2) _txt(ctx,fx(0.24),y0-amp-8,'soplo sistólico',{size:10,align:'center',color:C.amber,bold:true});
  const states=['Normal · S₁ (válvulas AV) + S₂ (semilunares)','Con S₃ (llenado ventricular, fisiológico en jóvenes)','Soplo sistólico (flujo turbulento)'];
  _txt(ctx,12,h-12,states[k],{size:10,color:C.muted});
  el('hs_out').textContent=states[k]+(window.__hsPlaying?' · reproduciendo':'');
}
function toggleHeartSounds(){
  window.__hsPlaying=!window.__hsPlaying; window.__hsT=0;
  const b=el('hs_play'); if(b) b.textContent=window.__hsPlaying?'⏸':'▶';
  drawHeartSounds();
}
// ===================== SLIDE 22 · DOPPLER (ANIMADA) =====================
function drawDoppler(){
  const cv=el('sim-doppler'); if(!cv||!cv.clientWidth) return;
  const w=cv.clientWidth,h=cv.clientHeight; const ctx=AB.setup(cv,w,h);
  _bg(ctx,w,h);
  const u=+num('do_u')||80, th=+num('do_th')||45; const t=window.__doT||0;
  const vs=1540, f=8e6;
  const dth=th*Math.PI/180;
  const df=2*f*u*0.01*Math.cos(dth)/vs;
  const y1=170,y2=214;
  _line(ctx,16,y1,w-16,y1,C.blood,3);
  _line(ctx,16,y2,w-16,y2,C.blood,3);
  _txt(ctx,20,(y1+y2)/2,'flujo →  '+u+' cm/s',{size:10,color:C.blood});
  for(let i=0;i<7;i++){
    const xx=( (i*95+(t*140))%(w-40) )+20;
    ctx.fillStyle=C.blood;
    ctx.beginPath(); ctx.arc(xx,(y1+y2)/2+Math.sin(i*2+t*3)*3,5,0,Math.PI*2); ctx.fill();
  }
  // transductor
  const tx=Math.max(30,Math.min(w-30,90)); const ty=30;
  _rect(ctx,tx-16,ty-10,32,20,'#2d3a3a',4);
  const len=Math.hypot(w*0.42,y1-ty-2);
  const bx=tx, by=ty+10;
  const ex=bx+Math.sin(dth)*len, ey=by+Math.cos(dth)*len;
  ctx.strokeStyle=C.amber; ctx.lineWidth=1.6; ctx.setLineDash([5,3]);
  ctx.beginPath(); ctx.moveTo(bx,by); ctx.lineTo(bx+Math.sin(dth)*len,by+Math.cos(dth)*len); ctx.stroke(); ctx.setLineDash([]);
  _txt(ctx,bx-14,ty-4,'transductor · 8 MHz',{size:9,color:C.muted});
  _txt(ctx,bx+Math.sin(dth)*len/2+6,by+Math.cos(dth)*len/2,'θ='+th+'°',{size:10,color:C.amber});
  _txt(ctx,12,24,'v = δf·v_s/(2f·cosθ) = '+u+' cm/s',{size:12,bold:true,color:C.teal});
  _txt(ctx,12,h-10,'δf = '+espan(df,0)+' Hz · eco f′ ≈ '+espan(Math.round(f+df)/1000,1)+' kHz',{size:10,color:C.muted});
  el('do_uv').textContent=u+' cm/s';
  el('do_tv').textContent=th+'°';
  el('do_out').textContent='δf = '+espan(df,0)+' Hz @ 8 MHz · θ = '+th+'°'+(th>=85?' · a 90° el Doppler se anula':'');
}
function toggleDoppler(){
  window.__doPlaying=!window.__doPlaying; window.__doT=0;
  const b=el('do_play'); if(b) b.textContent=window.__doPlaying?'⏸':'▶';
  drawDoppler();
}
// ===================== SLIDE 23 · MAPA =====================
function drawMap(){
  const cv=el('sim-map'); if(!cv||!cv.clientWidth) return;
  const w=cv.clientWidth,h=cv.clientHeight; const ctx=AB.setup(cv,w,h);
  _bg(ctx,w,h);
  const N=['1 · Fuente','2 · Filtro','3 · Transmisión','4 · Análisis','5 · Percepción','6 · Diagnóstico'];
  const SUB=['glotis → pulso','tracto → formantes','oído medio → 27 dB','cóclea → tonotopía','fones · mels','Doppler · fonocardio'];
  const k=+num('mp_sel')||0;
  const bw=150,bh=54;
  const pos=[[20,50],[w/2-bw/2,50],[w-20-bw,50],[20,150],[w/2-bw/2,150],[w-20-bw,150]];
  for(let i=0;i<6;i++){
    const x=pos[i][0],y=pos[i][1];
    const col=i===k?C.amber:C.teal;
    _rect(ctx,x,y,bw,bh,col,8);
    _txt(ctx,x+bw/2,y+20,N[i],{size:13,bold:true,align:'center',color:'#fff'});
    _txt(ctx,x+bw/2,y+40,SUB[i],{size:9,align:'center',color:'#f8f4e9'});
    if(i<3 && i!==2){ const nx=pos[i+1][0], ny=pos[i+1][1];
      ctx.strokeStyle=C.muted; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.moveTo(x+bw, y+bh/2); ctx.lineTo(nx, ny+bh/2); ctx.stroke();
      ctx.fillStyle=C.muted; ctx.beginPath(); ctx.moveTo(nx,ny+bh/2-4); ctx.lineTo(nx,ny+bh/2+4); ctx.lineTo(nx+8,ny+bh/2); ctx.fill();
    }
  }
  _txt(ctx,w/2,132,'onda → resonancia → filtro → tonotopía → sonoridad → clínica',{size:10,align:'center',color:C.muted});
  _txt(ctx,12,h-10,'Misma cadena que usaremos para resolver problemas del capítulo.',{size:10,color:C.muted});
  el('mp_out').textContent='Etapa '+(k+1)+' · '+N[k];
}
// ===================== REDRAW =====================
const fns = {
  1:()=>window.drawWave&&drawWave(), 2:()=>window.drawDB&&drawDB(), 3:()=>window.drawImpedance&&drawImpedance(),
  4:()=>window.drawCavity&&drawCavity(), 5:()=>window.drawEarCanal&&drawEarCanal(), 6:()=>window.drawVocab&&drawVocab(),
  7:()=>window.drawGlottis&&drawGlottis(), 8:()=>window.drawSourceFilter&&drawSourceFilter(), 9:()=>window.drawTwoTube&&drawTwoTube(),
  10:()=>window.drawTimbre&&drawTimbre(), 11:()=>window.drawEnergy&&drawEnergy(), 12:()=>window.drawAudField&&drawAudField(),
  13:()=>window.drawMiddleEar&&drawMiddleEar(), 14:()=>window.drawCochlea&&drawCochlea(), 15:()=>window.drawAudiogram&&drawAudiogram(),
  16:()=>window.drawDamage&&drawDamage(), 17:()=>window.drawPhonSone&&drawPhonSone(), 18:()=>window.drawPitch&&drawPitch(),
  19:()=>window.drawMasking&&drawMasking(), 20:()=>window.drawBodySources&&drawBodySources(), 21:()=>window.drawHeartSounds&&drawHeartSounds(),
  22:()=>window.drawDoppler&&drawDoppler(), 23:()=>window.drawMap&&drawMap()
};
function redrawSlide(n){ (fns[n]||function(){})(); }
window.redrawSlide = redrawSlide;
// ===================== ANIM LOOP =====================
let __lastTs = 0;
function animLoop(ts){
  const dt = Math.min(0.06, ((ts - __lastTs)||0)/1000);
  __lastTs = ts;
  if(current===7 && window.__glPlaying){ window.__glT += dt; drawGlottis(); }
  if(current===8 && window.__sfPlaying){ window.__sfT += dt; drawSourceFilter(); }
  if(current===14 && window.__coPlaying){ window.__coT += dt; drawCochlea(); }
  if(current===21 && window.__hsPlaying){ window.__hsT += dt; drawHeartSounds(); }
  if(current===22 && window.__doPlaying){ window.__doT += dt; drawDoppler(); }
  requestAnimationFrame(animLoop);
}
// ===================== CONTROL LIVE (sliders/selects) =====================
document.addEventListener('input', function(e){
  const t=e.target;
  if(t && t.id && /^(wv|db|im|cv|ea|vt|gl|sf|tt|tm|en|af|me|co|au|pr|ps|pt|ms|bo|hs|do|mp)_/.test(t.id)) redrawSlide(current);
});
document.addEventListener('change', function(e){
  const t=e.target;
  if(t && t.id && /^(wv|db|im|cv|ea|vt|gl|sf|tt|tm|en|af|me|co|au|pr|ps|pt|ms|bo|hs|do|mp)_/.test(t.id)) redrawSlide(current);
});
