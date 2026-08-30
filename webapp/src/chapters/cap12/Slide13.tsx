import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide13({
  engine,
  go,
  goModule,
  next,
  prev,
  toggleAction,
  toggleEinhoven,
  toggleECG,
  toggleMyo,
  toggleEEG,
}: {
  isActive?: boolean;
  engine: Engine;
  go?: (n: number) => void;
  goModule: (m: number) => void;
  next?: () => void;
  prev?: () => void;
  toggleAction?: () => void;
  toggleEinhoven?: () => void;
  toggleECG?: () => void;
  toggleMyo?: () => void;
  toggleEEG?: () => void;
}) {
  return (
    <>
<div className="module-header">
    <span className="mnum">12 · 5</span>
    <span className="mtitle">La célula ciliada: un micrófono mecánico</span>
    <span className="msub">{"\\(\\text{hacia el kinocilio} \\Rightarrow \\text{despolarización}\\)"}</span>
    <span className="mslide-count">13 / 24</span>
  </div>
  <div className="content-grid">
    <div className="theory">
      <div className="card active">
        <div className="card-hdr"><span className="icon">🦻</span> El haz que abre canales</div>
        <div className="card-body">
          <p>El «pelo» es un haz de <strong>20–300 microvellosidades</strong> que crecen en una dirección, con un <strong>kinocilio</strong> al final. Hacia el kinocilio: se abren canales permeables a {"\\(\\mathrm{Na}^+\\)"} y la célula <strong>se despolariza</strong>; alejándose: <strong>hiperpolarización</strong>; perpendicular: no pasa nada (Fig. 12.26).</p>
          <div className="eq-block">{"\\[ \\text{desplazamiento} \\rightarrow \\text{apertura de canales de } \\mathrm{Na}^+ \\rightarrow \\Delta V_\\mathrm{membrana} \\]"}</div>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">🎵</span> En el oído interno</div>
        <div className="card-body">
          <p>Las células ciliadas de la <strong>cóclea</strong> convierten el sonido en señal eléctrica (<em>transducción</em>), bañadas por <strong>endolinfa</strong> (rica en K⁺, pobre en Na⁺/Ca²⁺) en la rampa media; la <strong>perilinfa</strong> (rica en Na⁺) rodea rampa vestibular y timpánica. El oído condensa 30 000 células ciliadas en ~20 000 nervios.</p>
          <p><span className="tag">~30 000 células ciliadas</span><span className="tag">~20 000 nervios auditivos</span></p>
        </div>
      </div>
      <div className="apuntes">
        <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
        <div className="a-text" id="info-text-13">Desliza el desplazamiento del haz: positivo (hacia el kinocilio) → despolarización; negativo → hiperpolarización; cero → reposo. La respuesta es sigmoide y asimétrica.</div>
      </div>
    </div>
    <div className="sim-col">
      <div className="sim-area">
        <Sim id="sim-hc" className="sim" />
        <div className="prof-controls">
          <span className="badge">célula ciliada</span>
          <label>Desplazamiento <input type="range" id="hc_d" min="-100" max="100" defaultValue="0" step="1" onChange={(e) => engine.setParam('hc_d' as any, parseFloat(e.target.value))} /> <span id="hc_dv">0</span></label>
          <span className="readout" id="hc_out">reposo · V = −70 mV</span>
        </div>
      </div>
    </div>
  </div>
    </>
  );
}
