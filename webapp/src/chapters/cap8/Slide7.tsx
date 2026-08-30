import React from 'react';
import Sim from './Sim';
import type { Engine } from './useEngine';

export default function Slide7({
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
    <span className="mtitle">Resistencia vascular: la cuarta potencia del radio</span>
    <span className="msub">Poiseuille aplicado al lecho completo</span>
    <span className="mslide-count">7 / 24</span>
  </div>
  <div className="content-grid">
    <div className="theory">
      <div className="card active">
        <div className="card-hdr"><span className="icon">📏</span> R ∝ 1/r⁴</div>
        <div className="card-body">
          <p>De Poiseuille (eq. 7.24):</p>
          <div className="eq-block">{"\\[  R = \\frac{8\\,\\eta\\,L}{\\pi\\, r^4}  \\]"}</div>
          <p>Reducir el radio a la mitad <strong>multiplica la resistencia por 16</strong> y hunde el flujo a 1/16. Por eso el cuerpo regula el flujo con <span className="highlight">vasodilatación y vasoconstricción</span>, no cambiando la viscosidad.</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">🔌</span> El sistema como circuito</div>
        <div className="card-body">
          <p>La ley de Ohm se lee {"\\(  \\Delta P = Q\\,R \\)"}. El corazón mantiene la presión; el lecho vascular ajusta {"\\( R \\)"} para repartir {"\\( Q \\)"}. Los órganos están en <strong>paralelo</strong>: la TPVR es menor que la de cada lecho individual.</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">🔄</span> Reparto órgano a órgano</div>
        <div className="card-body">
          <p>El flujo se reparte por la resistencia de cada lecho: <span className="tag">riñones ~1,1 L/min</span>, <span className="tag">cerebro ~0,75</span>, <span className="tag">hígado/abdomen ~1,4</span>, <span className="tag">músculo ~1,2</span> en reposo (Tabla 8.6). Cada órgano ajusta su propio grifo.</p>
        </div>
      </div>
      <div className="apuntes">
        <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
        <div className="a-text" id="info-text-7">La R⁴ es la ecuación más poderosa de la hemodinámica: el 10 % de diámetro de más puede cambiar el flujo un 46 %. En el canvas mueve el radio y observa la curva 1/r⁴ dispararse hacia el radio pequeño — ese es el mundo de las arteriolas, y el porqué de que el 1 % del diámetro controle la presión.</div>
      </div>
    </div>
    <div className="sim-col">
      <div className="sim-area">
        <Sim id="sim-resvasc" />
        <div className="prof-controls">
          <span className="badge">1/r⁴</span>
          <label>r <input type="range" id="rv_r" min="0.3" max="3" step="0.05" defaultValue={1} onChange={(e) => { engine.setParam('rv_r', parseFloat(e.target.value)); engine.requestDraw(); }} /> <span id="rv_rv">1,00</span></label>
          <span className="readout" id="rv_out">R_rel = 1,0 (r = 1,00)</span>
        </div>
      </div>
    </div>
  </div>


    </>
  );
}
