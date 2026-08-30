import React from 'react';
import Sim from './Sim';
import type { Engine } from './useEngine';
import type { SimParams } from './sims';

export default function Slide14({
  isActive,
  engine,
  go,
  goModule,
  next,
  prev,
  toggleBubbles,
  toggleBreath,
  toggleSpiro,
  toggleCycle,
  togglePVLoop,
  onBack,
}: {
  isActive: boolean;
  engine: Engine;
  go: (n: number) => void;
  goModule: (m: number) => void;
  next: () => void;
  prev: () => void;
  toggleBubbles?: () => void;
  toggleBreath?: () => void;
  toggleSpiro?: () => void;
  toggleCycle?: () => void;
  togglePVLoop?: () => void;
  onBack?: () => void;
}) {
  return (
    <>
<div className="module-header">
    <span className="mnum">9.5.2</span>
    <span className="mtitle">Modelo mecánico de la respiración</span>
    <span className="msub">Compliancia en serie con inertancia, en paralelo con la resistencia</span>
    <span className="mslide-count">14 / 24</span>
  </div>
  <div className="content-grid">
    <div className="theory">
      <div className="card active">
        <div className="card-hdr"><span className="icon">🧮</span> El circuito (Fig. 9.16b)</div>
        <div className="card-body">
          <p>Es un vaso de compliancia, {"\\( V(t) = V_d + C_{\\text{flow}}P(t) \\)"} (elasticidad del pulmón), <strong>en serie</strong> con un elemento inercial (masa del aire), y <strong>en paralelo</strong> con un elemento resistivo (vías aéreas). Todo lo impulsa la presión de los <strong>músculos inspiratorios</strong>. La inertancia se desprecia salvo flujos grandes.</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">📈</span> Respuesta del modelo</div>
        <div className="card-body">
          <p>El llenado del «vaso» sube exponencialmente con constante de tiempo {"\\( \\tau = R\\,C \\)"} (≈ 0,4 s para los valores normales). Con {"\\( C \\)"} menor (fibrosis) o {"\\( R \\)"} mayor (asma), el aire entra más lento y el volumen corriente queda menor (Fig. 9.20).</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">🔗</span> Conexión con el trabajo</div>
        <div className="card-body">
          <p>El área bajo la curva P–V (Fig. 9.16a) es el trabajo: las regiones I + II son el trabajo elástico (compliancia) y el área III el extra para vencer la resistencia (causa la histéresis). Lo calcularemos en la slide 22.</p>
        </div>
      </div>
      <div className="apuntes">
        <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
        <div className="a-text" id="info-text-14">Un pulmón no se llena al instante: es un circuito RC. Sube R (resistencia de la vía) o baja C (compliancia) y mira cómo el volumen llega más tarde y más bajo. El readout da la constante de tiempo τ = R·C — el tiempo que tarda en completarse ~63 % del llenado.</div>
      </div>
    </div>
    <div className="sim-col">
      <div className="sim-area">
        <Sim id="sim-mech" />
        <div className="prof-controls">
          <span className="badge">modelo RC</span>
          <label>R <input type="range" id="me_r" min="0.5" max="8" step="0.5" defaultValue="2" onInput={(e) => { engine.setParam("me_r" as keyof SimParams, parseFloat((e.target as HTMLInputElement).value)); engine.requestDraw(); }} /> <span id="me_rv">2 cmH₂O/(L·s)</span></label>
          <label>C <input type="range" id="me_c" min="50" max="400" step="10" defaultValue="200" onInput={(e) => { engine.setParam("me_c" as keyof SimParams, parseFloat((e.target as HTMLInputElement).value)); engine.requestDraw(); }} /> <span id="me_cv">0,20 L/cmH₂O</span></label>
          <span className="readout" id="me_out">τ = 0,40 s · V_pl ≈ 0,6 L</span>
        </div>
      </div>
    </div>
  </div>

{/* ═══════════ M6 · EL CICLO RESPIRATORIO ═══════════ */}
    </>
  );
}
