import React from 'react';
import Sim from './Sim';
import type { Engine } from './useEngine';

export default function Slide19({
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
    <span className="mtitle">La onda de pulso y la incisura</span>
    <span className="msub">El volumen sistólico distiende el reservorio arterial</span>
    <span className="mslide-count">19 / 24</span>
  </div>
  <div className="content-grid">
    <div className="theory">
      <div className="card active">
        <div className="card-hdr"><span className="icon">📈</span> Presión de pulso (eq. 8.107)</div>
        <div className="card-body">
          <p>El sistema arterial es un vaso de compliancia: el volumen sistólico lo distiende una cantidad que depende de la compliancia {"\\( C_{\\text{sa}} \\)"}:</p>
          <div className="eq-block">{"\\[  P_{\\text{pulso}} = \\frac{V_{\\text{stroke}}}{C_{\\text{sa}}}  \\]"}</div>
          <p>Con {"\\( V_{\\text{stroke}} = 70\\ \\text{mL} \\)"} y {"\\( C_{\\text{sa}} = 0{,}00175\\ \\text{L/mmHg} \\)"}: <span className="tag">P_pulso = 40 mmHg</span>.</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">🔽</span> La incisura (muesca dícrota)</div>
        <div className="card-body">
          <p>Al cerrarse la válvula aórtica hay un brevísimo retroflujo: la presión <strong>baja un escalón</strong> y luego sigue decayendo. Ese golpecito es la <span className="tag">incisura</span>, marca del fin de la sístole.</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">📉</span> Decaimiento diastólico</div>
        <div className="card-body">
          <p>Con el flujo de entrada nulo, la presión cae exponencialmente (eq. 8.100–8.101):</p>
          <div className="eq-block">{"\\[  \\tau = R_{\\text{s}} C_{\\text{sa}} \\qquad P(t) = P(0)\\,e^{-t/\\tau}  \\]"}</div>
        </div>
      </div>
      <div className="apuntes">
        <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
        <div className="a-text" id="info-text-19">El pulso es el eco de la eyección en un reservorio elástico. La fórmula P_pulso = V_stroke/C_sa explica todo: aorta rígida (arteriosclerosis) → C baja → pulso ancho. En el canvas sube el volumen sistólico o baja la compliancia y la banda de pulso se ensancha.</div>
      </div>
    </div>
    <div className="sim-col">
      <div className="sim-area">
        <Sim id="sim-pulse" />
        <div className="prof-controls">
          <span className="badge">onda de pulso</span>
          <label>V_stroke <input type="range" id="pu_vs" min="50" max="100" step="2" defaultValue={70} onChange={(e) => { engine.setParam('pu_vs', parseFloat(e.target.value)); engine.requestDraw(); }} /> <span id="pu_vsv">70 mL</span></label>
          <label>C_sa <input type="range" id="pu_c" min="0.001" max="0.003" step="0.00005" defaultValue={0.00175} onChange={(e) => { engine.setParam('pu_c', parseFloat(e.target.value)); engine.requestDraw(); }} /> <span id="pu_cv">0,00175</span></label>
          <span className="readout" id="pu_out">P_pulso = 40 mmHg · τ = 0,031 min</span>
        </div>
      </div>
    </div>
  </div>
    </>
  );
}
