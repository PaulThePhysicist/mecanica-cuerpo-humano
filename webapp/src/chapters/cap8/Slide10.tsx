import React from 'react';
import Sim from './Sim';
import type { Engine } from './useEngine';

export default function Slide10({
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
    <span className="mtitle">El oxígeno que entrega la sangre: Fick</span>
    <span className="msub">El gasto y la extracción fijan el consumo</span>
    <span className="mslide-count">10 / 24</span>
  </div>
  <div className="content-grid">
    <div className="theory">
      <div className="card active">
        <div className="card-hdr"><span className="icon">🫧</span> Fick para el oxígeno (eq. 8.28)</div>
        <div className="card-body">
          <p>El consumo de O₂ es el gasto por la diferencia arterio-venosa de oxígeno:</p>
          <div className="eq-block">{"\\[  \\frac{\\mathrm{d}V_{\\text{O}_2}}{\\mathrm{d}t} = Q_{\\text{t}}\\,(p_{\\text{a}} - p_{\\text{v}})  \\]"}</div>
          <p>Reposo: <span className="tag">5 L/min × 50 mL O₂/L ≈ 250 mL O₂/min</span>. Es la base del <strong>principio de Fick</strong> para medir el gasto cardíaco.</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">🩸</span> Contenido de O₂</div>
        <div className="card-body">
          <p>Arterial: <span className="tag">≈ 200 mL O₂/L</span> (hemoglobina 15 g/dL). Venosa: ≈ 150 mL/L. La extracción es del <span className="tag">~25 %</span> en reposo y puede triplicarse con el ejercicio.</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">🏃</span> Los dos resortes</div>
        <div className="card-body">
          <p>Para entregar más O₂ el cuerpo sube el <strong>gasto</strong> (hasta ×5) o la <strong>extracción</strong> (hasta ×3). El músculo en ejercicio exige ambos: por eso el gasto puede superar los 20 L/min y la diferencia arterio-venosa crece.</p>
        </div>
      </div>
      <div className="apuntes">
        <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
        <div className="a-text" id="info-text-10">Fick es la ecuación que convierte una cifra de laboratorio (el consumo de O₂) en la pregunta clínica «¿cuánto bombea el corazón?». En el canvas sube el gasto o la extracción y el flujo de O₂ responde: el VO₂ es un rectángulo de Q × (p_a − p_v).</div>
      </div>
    </div>
    <div className="sim-col">
      <div className="sim-area">
        <Sim id="sim-fick" />
        <div className="prof-controls">
          <span className="badge">Fick</span>
          <label>Q <input type="range" id="fk_q" min="3" max="25" step="0.5" defaultValue={5} onChange={(e) => { engine.setParam('fk_q', parseFloat(e.target.value)); engine.requestDraw(); }} /> <span id="fk_qv">5,0 L/min</span></label>
          <label>p_a−p_v <input type="range" id="fk_d" min="20" max="160" step="5" defaultValue={50} onChange={(e) => { engine.setParam('fk_d', parseFloat(e.target.value)); engine.requestDraw(); }} /> <span id="fk_dv">50 mL/L</span></label>
          <span className="readout" id="fk_out">V̇O₂ = 250 mL/min</span>
        </div>
      </div>
    </div>
  </div>
    </>
  );
}
