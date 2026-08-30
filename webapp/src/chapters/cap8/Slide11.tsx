import React from 'react';
import Sim from './Sim';
import type { Engine } from './useEngine';

export default function Slide11({
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
    <span className="mnum">8.2</span>
    <span className="mtitle">El trabajo del corazón: W = ∫ P dV</span>
    <span className="msub">~1 J por latido · ~5 W de metabolismo</span>
    <span className="mslide-count">11 / 24</span>
  </div>
  <div className="content-grid">
    <div className="theory">
      <div className="card active">
        <div className="card-hdr"><span className="icon">💪</span> Trabajo por latido (eq. 8.35)</div>
        <div className="card-body">
          <p>El ventrículo empuja un pistón de presión: el área bajo la curva P-V es el trabajo (Fig. 8.39):</p>
          <div className="eq-block">{"\\[  W = \\int_{V_{\\text{i}}}^{V_{\\text{f}}} P\\,\\mathrm{d}V \\approx P_{\\text{av}}\\, V_{\\text{stroke}}  \\]"}</div>
          <p>Con {"\\( P_{\\text{av}} \\approx 100\\ \\text{mmHg} = 1{,}3\\times10^4\\ \\text{N/m}^2 \\)"} y {"\\( V_{\\text{stroke}} = 80\\ \\text{cm}^3 \\)"}: <span className="tag">W ≈ 1,04 J</span> por ciclo.</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">⚡</span> Potencia y eficiencia</div>
        <div className="card-body">
          <p>A 1 Hz, la potencia mecánica es <span className="tag">1,04 W</span>. Con eficiencia muscular {"\\( \\epsilon \\approx 20\\% \\)"}, el metabolismo del VI pide <span className="tag">≈ 5 W</span>. El VD trabaja a {"\\( 1/5 \\)"} de la presión → +20 %. Total: <span className="tag">≈ 125 kcal/día</span> (experimental: ~117, Tabla 6.17).</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">📊</span> Picos y ejercicio</div>
        <div className="card-body">
          <p>El corazón bombea 1/3 del ciclo: los picos son 3× el promedio (<span className="tag">1,5 W</span> mecánicos, <span className="tag">15 W</span> metabólicos). Con ejercicio extenuante (P ×1,5 y Q ×5) el trabajo puede multiplicarse por <span className="tag">~7,5</span>.</p>
        </div>
      </div>
      <div className="apuntes">
        <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
        <div className="a-text" id="info-text-11">El lazo P-V del canvas es la «huella digital» del ventrículo: su área es el trabajo por latido (≈ 1 J), su ancho el volumen sistólico y su altura la presión. Pulsa ▶ para ver el ciclo recorrer el lazo; cambia la poscarga y mira el área crecer — eso es lo que hipertrofia al corazón.</div>
      </div>
    </div>
    <div className="sim-col">
      <div className="sim-area">
        <Sim id="sim-pvloop" />
        <div className="prof-controls">
          <span className="badge">lazo P–V</span>
          <button id="pv_play" className="btn-sm" onClick={() => engine.togglePVLoop()}>▶</button>
          <label>precarga (V_ED) <input type="range" id="pv_ed" min="100" max="220" step="5" defaultValue={140} onChange={(e) => { engine.setParam('pv_ed', parseFloat(e.target.value)); engine.requestDraw(); }} /> <span id="pv_edv">140 mL</span></label>
          <label>poscarga (P_sa) <input type="range" id="pv_pa" min="80" max="140" step="5" defaultValue={100} onChange={(e) => { engine.setParam('pv_pa', parseFloat(e.target.value)); engine.requestDraw(); }} /> <span id="pv_pav">100 mmHg</span></label>
          <label>contractilidad <input type="range" id="pv_ct" min="0.5" max="1.5" step="0.1" defaultValue={1} onChange={(e) => { engine.setParam('pv_ct', parseFloat(e.target.value)); engine.requestDraw(); }} /> <span id="pv_ctv">1,0</span></label>
          <span className="readout" id="pv_out">W ≈ 1,0 J/latido · V_stroke ≈ 80 mL</span>
        </div>
      </div>
    </div>
  </div>


    </>
  );
}
