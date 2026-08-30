import React from 'react';
import Sim from './Sim';
import type { Engine } from './useEngine';
import type { SimParams } from './sims';

export default function Slide19({
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
    <span className="mnum">9.5.5</span>
    <span className="mtitle">La hipoxia y la fracción de O₂</span>
    <span className="msub">Efectos por debajo de 19,5 % · hipoxia &lt; ≈ 57 mmHg</span>
    <span className="mslide-count">19 / 24</span>
  </div>
  <div className="content-grid">
    <div className="theory">
      <div className="card active">
        <div className="card-hdr"><span className="icon">⚠️</span> La escala del O₂</div>
        <div className="card-body">
          <p>A nivel del mar, {"\\( P_{\\text{O}_2} = 161\\ \\text{mmHg} \\)"} (21,2 kPa, ~20,9 % de O₂). Los efectos adversos empiezan cuando la fracción cae por debajo del <span className="tag">19,5 %</span>. A ~10 %: taquipnea y taquicardia, con deterioro de la atención y la coordinación. 6–10 %: náuseas, vómitos, letargo y pérdida de conciencia. Menos de 6 %: convulsiones → apnea → paro cardíaco.</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">🧠</span> El umbral crítico</div>
        <div className="card-body">
          <p>La <strong>hipoxia</strong> (falta de O₂ en los tejidos) ocurre por debajo de una presión parcial crítica de <span className="tag">≈ 57 mmHg</span> (7,5 kPa) con frecuencia respiratoria normal y relajada. Por encima, el metabolismo funciona bien.</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">🚗</span> Puede pasar a nivel del mar</div>
        <div className="card-body">
          <p>Cuando el aire no se renueva (habitaciones selladas, autos, burbujas de botes volcados — Prob. 9.42) o cuando la fracción es normal pero la presión parcial cae por la altura.</p>
        </div>
      </div>
      <div className="apuntes">
        <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
        <div className="a-text" id="info-text-19">El oxígeno se mide como fracción de la atmósfera o como presión parcial: P_O₂ = (fracción) × 760 mmHg. Baja la fracción con el slider y cruza las zonas de colores: el cuerpo aguanta hasta ~57 mmHg; por debajo vienen las convulsiones y el paro.</div>
      </div>
    </div>
    <div className="sim-col">
      <div className="sim-area">
        <Sim id="sim-hypoxia" />
        <div className="prof-controls">
          <span className="badge">hipoxia</span>
          <label>O₂ <input type="range" id="hy_frac" min="2" max="21" step="0.5" defaultValue="21" onInput={(e) => { engine.setParam("hy_frac" as keyof SimParams, parseFloat((e.target as HTMLInputElement).value)); engine.requestDraw(); }} /> <span id="hy_fracv">21 %</span></label>
          <span className="readout" id="hy_out">P_O₂ = 160 mmHg · seguro</span>
        </div>
      </div>
    </div>
  </div>
    </>
  );
}
