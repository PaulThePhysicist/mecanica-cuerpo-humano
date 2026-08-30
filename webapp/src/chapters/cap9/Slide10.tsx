import React from 'react';
import Sim from './Sim';
import type { Engine } from './useEngine';
import type { SimParams } from './sims';

export default function Slide10({
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
    <span className="mnum">9.4</span>
    <span className="mtitle">Curva P–V del pulmón e histéresis</span>
    <span className="msub">Inflado y desinflado no coinciden: histéresis · C ≈ 0,2 L/cmH₂O</span>
    <span className="mslide-count">10 / 24</span>
  </div>
  <div className="content-grid">
    <div className="theory">
      <div className="card active">
        <div className="card-hdr"><span className="icon">📈</span> Presión–volumen (Fig. 9.12)</div>
        <div className="card-body">
          <p>El volumen depende de la presión transpulmonar. Las curvas de inflado y desinflado <strong>no coinciden</strong>: es la <span className="highlight">histéresis</span> (viscoelasticidad, Cap. 4). La <strong>compliancia</strong> es la pendiente, ~0,2 L/cmH₂O, y <strong>disminuye</strong> a presiones altas (pendiente decreciente).</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">⚙️</span> Compliancia específica</div>
        <div className="card-body">
          <p>Para evaluar rendimiento se normaliza por un volumen característico (CRF, CV, CPT), el peso seco del pulmón o el peso corporal: la <strong>compliancia específica</strong>.</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">🧱</span> Pared torácica + pulmón (Fig. 9.15)</div>
        <div className="card-body">
          <p>La elasticidad del tórax contribuye tanto como la del pulmón. Con los músculos relajados, en cada volumen la presión de relajación del conjunto es la <strong>suma</strong> de la del pulmón y la de la pared. La CRF queda donde las fuerzas se equilibran.</p>
        </div>
      </div>
      <div className="apuntes">
        <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
        <div className="a-text" id="info-text-10">Histéresis = memoria del material: inflar y desinflar no recorren la misma curva, como el caucho del Cap. 4. La pendiente local es la compliancia: cuanto más inflado, menos compliante. Recorre el ciclo con el slider y lee la pendiente en el readout.</div>
      </div>
    </div>
    <div className="sim-col">
      <div className="sim-area">
        <Sim id="sim-pvcurve" />
        <div className="prof-controls">
          <span className="badge">histéresis</span>
          <label>ciclo <input type="range" id="pc_t" min="0" max="100" step="1" defaultValue="20" onInput={(e) => { engine.setParam("pc_t" as keyof SimParams, parseFloat((e.target as HTMLInputElement).value)); engine.requestDraw(); }} /> <span id="pc_tv">20 %</span></label>
          <span className="readout" id="pc_out">inflando · C ≈ 0,20 L/cmH₂O</span>
        </div>
      </div>
    </div>
  </div>
    </>
  );
}
