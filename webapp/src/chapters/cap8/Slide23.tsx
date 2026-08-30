import React from 'react';
import Sim from './Sim';
import type { Engine } from './useEngine';

export default function Slide23({
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
    <span className="mtitle">Válvulas y fracción de eyección</span>
    <span className="msub">Cuando la puerta no abre o no cierra</span>
    <span className="mslide-count">23 / 24</span>
  </div>
  <div className="content-grid">
    <div className="theory">
      <div className="card active">
        <div className="card-hdr"><span className="icon">🚪</span> Estenosis valvular</div>
        <div className="card-body">
          <p>La válvula no abre del todo: <span className="tag">estenosis aórtica</span> → la poscarga efectiva sube y el ventrículo se hipertrofia <strong>concéntricamente</strong> (sobrecarga de presión). <span className="tag">Estenosis mitral</span> → llenado difícil.</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">🔄</span> Regurgitación</div>
        <div className="card-body">
          <p>La válvula no cierra y la sangre <strong>vuelve</strong>: sobrecarga de volumen → cámaras dilatadas (<strong>hipertrofia excéntrica</strong>). El corazón trabaja para nada: el trabajo útil cae y el consumo sube.</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">📐</span> Fracción de eyección</div>
        <div className="card-body">
          <p>Es el resumen de la función sistólica: <span className="tag">EF = V_stroke / V_ED</span>. Normal <span className="tag">55–75 %</span>. Por debajo de 40 % hay disfunción sistólica; con EF normal, sospechar disfunción diastólica. La «IC con EF preservada» es diástole.</p>
        </div>
      </div>
      <div className="apuntes">
        <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
        <div className="a-text" id="info-text-23">El EF es la fracción del llenado que el ventrículo expulsa: una medida simple con toda la física del lazo P-V dentro. En el canvas pulsa ▶ y mira el ventrículo llenarse y vaciarse; mueve el V_ED y el V_ES y la aguja del EF responde. Bajo 40 %, falla sistólica.</div>
      </div>
    </div>
    <div className="sim-col">
      <div className="sim-area">
        <Sim id="sim-ejection" />
        <div className="prof-controls">
          <span className="badge">eyección</span>
          <button id="ef_play" className="btn-sm" onClick={() => engine.toggleEjection()}>▶</button>
          <label>V_ED <input type="range" id="ef_ed" min="100" max="240" step="5" defaultValue={150} onChange={(e) => { engine.setParam('ef_ed', parseFloat(e.target.value)); engine.requestDraw(); }} /> <span id="ef_edv">150 mL</span></label>
          <label>V_ES <input type="range" id="ef_es" min="30" max="130" step="2" defaultValue={60} onChange={(e) => { engine.setParam('ef_es', parseFloat(e.target.value)); engine.requestDraw(); }} /> <span id="ef_esv">60 mL</span></label>
          <span className="readout" id="ef_out">EF = 60 % · normal</span>
        </div>
      </div>
    </div>
  </div>


    </>
  );
}
