import React from 'react';
import Sim from './Sim';
import type { Engine } from './useEngine';

export default function Slide9({
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
    <span className="mtitle">El intercambio capilar: fuerzas de Starling</span>
    <span className="msub">Hidrostática filtra · oncótica reabsorbe</span>
    <span className="mslide-count">9 / 24</span>
  </div>
  <div className="content-grid">
    <div className="theory">
      <div className="card active">
        <div className="card-hdr"><span className="icon">🕸️</span> Las cuatro fuerzas</div>
        <div className="card-body">
          <p>En el capilar se equilibran la presión <strong>hidrostática</strong> (empuja fuera) y la <strong>oncótica</strong> (atrae dentro, por las proteínas, eq. 8.27):</p>
          <div className="eq-block">{"\\[  \\Pi = n_{\\text{s}}\\, R\\, T  \\]"}</div>
          <p>Hidrostática capilar: <span className="tag">36 → 15 mmHg</span> (arteriolar → venular). Oncótica del plasma: <span className="tag">25 mmHg</span>.</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">⚖️</span> El balance</div>
        <div className="card-body">
          <p>Extremo arteriolar: <span className="tag">36 − 25 = +11 mmHg</span> (filtra). Venular: <span className="tag">15 − 25 = −10 mmHg</span> (reabsorbe). El ~90 % del filtrado vuelve; el resto drena por los <strong>linfáticos</strong>.</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">💧</span> Edema</div>
        <div className="card-body">
          <p>El edema aparece cuando la filtración gana: <span className="tag">baja albúmina</span> (oncótica ↓), <span className="tag">insuficiencia cardíaca</span> o venas obstruidas (hidrostática venosa ↑). El pulmón también: el edema pulmonar es este balance roto en el capilar alveolar.</p>
        </div>
      </div>
      <div className="apuntes">
        <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
        <div className="a-text" id="info-text-9">El capilar filtra por un lado y reabsorbe por el otro: la física de la hidrostática contra la química de la oncótica. En el canvas sube la presión venular o baja la oncótica y el neto se vuelve a favor de la filtración — ese es el edema. Los linfáticos recogen lo que sobra.</div>
      </div>
    </div>
    <div className="sim-col">
      <div className="sim-area">
        <Sim id="sim-starling" />
        <div className="prof-controls">
          <span className="badge">Starling</span>
          <label>P_hidro arterial <input type="range" id="st_ha" min="20" max="50" step="1" defaultValue={36} onChange={(e) => { engine.setParam('st_ha', parseFloat(e.target.value)); engine.requestDraw(); }} /> <span id="st_hav">36</span></label>
          <label>P_hidro venular <input type="range" id="st_hv" min="5" max="25" step="1" defaultValue={15} onChange={(e) => { engine.setParam('st_hv', parseFloat(e.target.value)); engine.requestDraw(); }} /> <span id="st_hvv">15</span></label>
          <label>P_oncótica <input type="range" id="st_o" min="15" max="35" step="1" defaultValue={25} onChange={(e) => { engine.setParam('st_o', parseFloat(e.target.value)); engine.requestDraw(); }} /> <span id="st_ov">25</span></label>
          <span className="readout" id="st_out">neto: +11 (filtra) · −10 (reabsorbe)</span>
        </div>
      </div>
    </div>
  </div>


    </>
  );
}
