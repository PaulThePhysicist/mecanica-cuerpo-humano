import React from 'react';
import Sim from './Sim';
import type { Engine } from './useEngine';

export default function Slide4({
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
    <span className="mtitle">La caída de presión por el árbol vascular</span>
    <span className="msub">Las arteriolas se llevan casi toda la caída</span>
    <span className="mslide-count">4 / 24</span>
  </div>
  <div className="content-grid">
    <div className="theory">
      <div className="card active">
        <div className="card-hdr"><span className="icon">📉</span> Caídas medidas (modelo de vasos en paralelo)</div>
        <div className="card-body">
          <p>Modelando cada nivel como {"\\( n \\)"} vasos paralelos (eq. 8.12–8.13) con {"\\( Q_{\\text{t}} = 80\\ \\text{cm}^3\\text{/s} \\)"}:</p>
          <div className="eq-block">{"\\[  \\Delta P = \\frac{0{,}0062\\ \\text{mmHg}}{n}\\frac{L(\\text{cm})}{r(\\text{cm})^4}  \\]"}</div>
          <p>Aorta: <span className="tag">0,025</span> · grandes: <span className="tag">1,4</span> · <strong>arteriolas: 91</strong> · capilares: <span className="tag">8,2 mmHg</span>. La caída escala <strong>lineal con Q</strong> (Poiseuille).</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">🔌</span> P_sa = TPVR · Q_t (eq. 8.30)</div>
        <div className="card-body">
          <p>Todo el sistema sistémico se comporta como una resistencia total:</p>
          <div className="eq-block">{"\\[  P_{\\text{sa}} = (\\text{TPVR})\\, Q_{\\text{t}}  \\]"}</div>
          <p>La <span className="tag">TPVR ≈ 700–1600 dina·s/cm⁵</span> (sistémica) y 20–130 (pulmonar). El cuerpo regula la presión controlando TPVR y Q.</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">🚰</span> Por qué las arteriolas mandan</div>
        <div className="card-body">
          <p>Hay <span className="tag">5×10⁵ arteriolas</span> de {"\\( r \\sim 30\\ \\mu\\text{m} \\)"} y {"\\( L \\sim 0{,}6\\ \\text{cm} \\)"}: su radio pequeño las hace dominantes ({"\\( R \\propto 1/r^4 \\)"}). Son los <span className="highlight">grifos</span> que reparten el flujo entre órganos.</p>
        </div>
      </div>
      <div className="apuntes">
        <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
        <div className="a-text" id="info-text-4">El corazón no regula el flujo de cada órgano: las arteriolas sí. La aorta y las grandes apenas pierden presión (0,025 y 1,4 mmHg) — son vasos de compliancia; las arteriolas pierden 91 — son vasos de resistencia. En el canvas sube el gasto y toda la escalera se hunde proporcionalmente.</div>
      </div>
    </div>
    <div className="sim-col">
      <div className="sim-area">
        <Sim id="sim-profile" />
        <div className="prof-controls">
          <span className="badge">perfil de ΔP</span>
          <label>Q_t <input type="range" id="pf_q" min="40" max="120" step="5" defaultValue={80} onChange={(e) => { engine.setParam('pf_q', parseFloat(e.target.value)); engine.requestDraw(); }} /> <span id="pf_qv">80 cm³/s</span></label>
          <span className="readout" id="pf_out">arteriolas: ΔP = 91 mmHg</span>
        </div>
      </div>
    </div>
  </div>


    </>
  );
}
