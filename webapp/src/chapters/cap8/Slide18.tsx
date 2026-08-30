import React from 'react';
import Sim from './Sim';
import type { Engine } from './useEngine';

export default function Slide18({
  isActive,
  engine,
  go,
  goModule,
  next,
  prev,
  onBack,
}: {
  isActive: boolean;
  engine: Engine;
  go: (n: number) => void;
  goModule: (m: number) => void;
  next: () => void;
  prev: () => void;
  onBack?: () => void;
}) {
  return (
    <>
<div className="module-header">
    <span className="mnum">8.4</span>
    <span className="mtitle">La circulación fetal y el cambio al nacer</span>
    <span className="msub">Dos derivaciones que el pulmón no usa… y que se cierran</span>
    <span className="mslide-count">18 / 24</span>
  </div>
  <div className="content-grid">
    <div className="theory">
      <div className="card active">
        <div className="card-hdr"><span className="icon">🫄</span> Antes de nacer</div>
        <div className="card-body">
          <p>El pulmón fetal no respira: la sangre lo <strong>bypasea</strong>. El <span className="tag">conducto arterioso</span> (de la arteria pulmonar a la aorta, {"\\( Q_{\\text{d}} \\)"}) y el <span className="tag">foramen oval</span> (de la aurícula derecha a la izquierda, {"\\( Q_{\\text{f}} \\)"}) desvían el flujo. La <span className="tag">placenta</span> es el pulmón.</p>
          <div className="eq-block">{"\\[  Q_{\\text{R}} = Q_{\\text{p}} + Q_{\\text{d}} \\qquad Q_{\\text{s}} = Q_{\\text{R}} + Q_{\\text{f}}  \\]"}</div>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">🎈</span> Al nacer</div>
        <div className="card-body">
          <p>Con la primera bocanada los pulmones se expanden: {"\\( R_{\\text{p}} \\)"} cae por debajo de {"\\( R_{\\text{s}} \\)"}. El <span className="tag">flujo del conducto se invierte</span> (de la aorta a la pulmonar) y luego se cierra en días; el <span className="tag">foramen se cierra</span> al invertirse el gradiente de presión.</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">📉</span> El modelo</div>
        <div className="card-body">
          <p>Con {"\\( R_{\\text{p}} > R_{\\text{s}} \\)"}, {"\\( K_{\\text{R}} = K_{\\text{L}} \\)"}, {"\\( R_{\\text{d}} = 0 \\)"} (conducto abierto) y foramen abierto, la solución da {"\\( Q_{\\text{f}} \\ge 0 \\)"}: el estado fetal es autoconsistente. Al nacer, la solución exige foramen cerrado y conducto invertido (Problemas 8.57–8.59).</p>
        </div>
      </div>
      <div className="apuntes">
        <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
        <div className="a-text" id="info-text-18">El feto es un circuito con dos «atajos» porque el pulmón sobra. La misma matemática que resuelve la circulación del adulto, con {"\\( R_p \\)"} enorme, da foramen y conducto abiertos; cuando {"\\( R_p \\)"} cae al nacer, los atajos se cierran solos. En el canvas baja {"\\( R_p \\)"} y observa las dos derivaciones cambiar de estado.</div>
      </div>
    </div>
    <div className="sim-col">
      <div className="sim-area">
        <Sim id="sim-fetal" />
        <div className="prof-controls">
          <span className="badge">fetal</span>
          <label>R_pulmonar <input type="range" id="fd_rp" min="0.5" max="25" step="0.5" defaultValue={18} onChange={(e) => { engine.setParam('fd_rp', parseFloat(e.target.value)); engine.requestDraw(); }} /> <span id="fd_rpv">18 (fetal)</span></label>
          <span className="readout" id="fd_out">feto: ductus abierto → · foramen abierto</span>
        </div>
      </div>
    </div>
  </div>


    </>
  );
}
