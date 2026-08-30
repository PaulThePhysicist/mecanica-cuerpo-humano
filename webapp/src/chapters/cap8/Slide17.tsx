import React from 'react';
import Sim from './Sim';
import type { Engine } from './useEngine';

export default function Slide17({
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
    <span className="mtitle">El modelo de la circulación: 8 subunidades</span>
    <span className="msub">R, C y K acoplados en un circuito cerrado</span>
    <span className="mslide-count">17 / 24</span>
  </div>
  <div className="content-grid">
    <div className="theory">
      <div className="card active">
        <div className="card-hdr"><span className="icon">🔌</span> Las 8 subunidades (Fig. 8.52)</div>
        <div className="card-body">
          <p>Dos corazones (VI, VD), arterias grandes sistémicas y pulmonares, venas grandes sistémicas y pulmonares, y los vasos pequeños. Tres tipos de relación: corazón {"\\( Q=KP \\)"}, vasos grandes {"\\( V=CP \\)"}, vasos pequeños {"\\( P_{a}-P_{v}=RQ \\)"}.</p>
          <div className="eq-block">{"\\[  Q = \\frac{V_0}{T_{\\text{sa}} + T_{\\text{sv}} + T_{\\text{pa}} + T_{\\text{pv}}}  \\]"}</div>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">📋</span> Tabla 8.8 · parámetros en reposo</div>
        <div className="card-body">
          <table className="data-mini">
            <tbody>
              <tr><th>Parámetro</th><th>Sistémico</th><th>Pulmonar</th></tr>
              <tr><td>Resistencia (mmHg·min/L)</td><td>R_s = 17,5</td><td>R_p = 1,79</td></tr>
              <tr><td>C arterial (L/mmHg)</td><td>0,01</td><td>0,00667</td></tr>
              <tr><td>C venosa (L/mmHg)</td><td>1,75</td><td>0,08</td></tr>
              <tr><td>Corazón (L/min·mmHg)</td><td>K_L = 1,12</td><td>K_R = 2,8</td></tr>
            </tbody>
          </table>
          <p>Volumen total {"\\( V_0 = 5{,}0\\ \\text{L} \\)"}.</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">🎈</span> Qué manda</div>
        <div className="card-body">
          <p>Las venas son el gran depósito ({"\\( C_{\\text{sv}} = 1{,}75 \\)"}: 175× las arterias). La solución da <span className="tag">Q ≈ 5,6 L/min</span>, <span className="tag">P_sa ≈ 100</span>, <span className="tag">P_sv ≈ 2</span>, <span className="tag">P_pa ≈ 15</span>, <span className="tag">P_pv ≈ 5 mmHg</span> — los valores de la Tabla 8.1.</p>
        </div>
      </div>
      <div className="apuntes">
        <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
        <div className="a-text" id="info-text-17">El circuito se resuelve con 12 incógnitas y 12 ecuaciones: bombas, compliancias y resistencias. De ahí salen solas las presiones «conocidas» del capítulo. En el canvas sube la resistencia sistémica y la presión arterial sube mientras el gasto cae — esa es la hipertensión en una fórmula.</div>
      </div>
    </div>
    <div className="sim-col">
      <div className="sim-area">
        <Sim id="sim-circuit" />
        <div className="prof-controls">
          <span className="badge">circuito</span>
          <label>R_s <input type="range" id="cc_rs" min="10" max="30" step="0.5" defaultValue={17.5} onChange={(e) => { engine.setParam('cc_rs', parseFloat(e.target.value)); engine.requestDraw(); }} /> <span id="cc_rsv">17,5</span></label>
          <label>C_sv <input type="range" id="cc_cv" min="0.8" max="2.5" step="0.05" defaultValue={1.75} onChange={(e) => { engine.setParam('cc_cv', parseFloat(e.target.value)); engine.requestDraw(); }} /> <span id="cc_cvv">1,75</span></label>
          <span className="readout" id="cc_out">Q = 5,6 L/min · P_sa = 100 mmHg</span>
        </div>
      </div>
    </div>
  </div>
    </>
  );
}
