import React from 'react';
import Sim from './Sim';
import type { Engine } from './useEngine';

export default function Slide16({
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
    <span className="mtitle">El modelo del corazón: elastancia y Frank-Starling</span>
    <span className="msub">El ventrículo como cámara elástica variable</span>
    <span className="mslide-count">16 / 24</span>
  </div>
  <div className="content-grid">
    <div className="theory">
      <div className="card active">
        <div className="card-hdr"><span className="icon">🧮</span> La cámara elástica (eq. 8.57)</div>
        <div className="card-body">
          <p>El volumen del ventrículo es un volumen muerto más la compliancia {"\\( C(t) \\)"} que cambia entre diástole y sístole:</p>
          <div className="eq-block">{"\\[  V(t) = V_{\\text{d}} + C(t)\\, P(t)  \\]"}</div>
          <p>Al final de la diástole: {"\\( V_{\\text{ED}} = V_{\\text{d}} + C_{\\text{diastole}}P_{\\text{pv}} \\)"}. Al final de la sístole: {"\\( V_{\\text{ES}} = V_{\\text{d}} + C_{\\text{sistole}}P_{\\text{sa}} \\)"}. El volumen sistólico (eq. 8.60):</p>
          <div className="eq-block">{"\\[  V_{\\text{stroke}} = V_{\\text{ED}} - V_{\\text{ES}}  \\]"}</div>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">📈</span> Frank-Starling</div>
        <div className="card-body">
          <p>«El corazón bombea lo que recibe»: cuanto mayor la precarga (presión de llenado), mayor el volumen sistólico (Fig. 8.29–8.30). En el modelo:</p>
          <div className="eq-block">{"\\[  Q_{\\text{L}} = K_{\\text{L}}\\, P_{\\text{pv}} \\qquad Q_{\\text{R}} = K_{\\text{R}}\\, P_{\\text{sv}}  \\]"}</div>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">⚖️</span> El equilibrio de los dos corazones</div>
        <div className="card-body">
          <p>En estado estacionario {"\\( Q_{\\text{L}} = Q_{\\text{R}} \\)"}: la ley de Starling acopla ambos lados y evita que un ventrículo se llene más que el otro. Un corazón sano mantiene el balance aunque cambie la poscarga o la precarga.</p>
        </div>
      </div>
      <div className="apuntes">
        <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
        <div className="a-text" id="info-text-16">El corazón no «decide» cuánto bombea: la precarga lo llena y la elastancia lo vacía. Frank-Starling es la ley de acoplamiento que iguala VI y VD. En el canvas sube la presión de llenado P_pv y el volumen sistólico crece — hasta que la curva se aplana: ese techo es real.</div>
      </div>
    </div>
    <div className="sim-col">
      <div className="sim-area">
        <Sim id="sim-frank" />
        <div className="prof-controls">
          <span className="badge">Frank–Starling</span>
          <label>precarga (P_pv) <input type="range" id="fs_pv" min="0" max="15" step="0.5" defaultValue={5} onChange={(e) => { engine.setParam('fs_pv', parseFloat(e.target.value)); engine.requestDraw(); }} /> <span id="fs_pvv">5,0 mmHg</span></label>
          <label>frecuencia <input type="range" id="fs_f" min="40" max="160" step="5" defaultValue={70} onChange={(e) => { engine.setParam('fs_f', parseFloat(e.target.value)); engine.requestDraw(); }} /> <span id="fs_fv">70 /min</span></label>
          <span className="readout" id="fs_out">V_stroke ≈ 80 mL · Q ≈ 5,6 L/min</span>
        </div>
      </div>
    </div>
  </div>
    </>
  );
}
