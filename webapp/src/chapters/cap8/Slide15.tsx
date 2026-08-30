import React from 'react';
import Sim from './Sim';
import type { Engine } from './useEngine';

export default function Slide15({
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
    <span className="mnum">8.3</span>
    <span className="mtitle">Estenosis: grados e ictus</span>
    <span className="msub">El flujo aguanta hasta ~75 % y luego se desploma</span>
    <span className="mslide-count">15 / 24</span>
  </div>
  <div className="content-grid">
    <div className="theory">
      <div className="card active">
        <div className="card-hdr"><span className="icon">🚦</span> Grados de estenosis</div>
        <div className="card-body">
          <p>La severidad es la reducción del área: <span className="tag">1–39 % leve</span> · <span className="tag">40–59 % moderada</span> · <span className="tag">60–79 % grave</span> · <span className="tag">80–99 % crítica</span> · <span className="tag">100 % ocluida</span>.</p>
          <div className="eq-block">{"\\[  \\% = \\left(1 - \\frac{A_{\\text{estenosis}}}{A_{\\text{normal}}}\\right)\\times 100  \\]"}</div>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">📉</span> La estenosis «crítica»</div>
        <div className="card-body">
          <p>El flujo no cae apenas hasta ~75 % de reducción (la resistencia {"\\( 1/r^4 \\)"} es insensible al inicio); pasada la <span className="tag">estenosis crítica</span>, el caudal se desploma. Por eso las lesiones del 70 % de una carótida ya se operan.</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">🧠</span> Ictus</div>
        <div className="card-body">
          <p><span className="tag">~80 % de los ictus son isquémicos</span> (obstrucción: placa, trombo) y <span className="tag">~20 % hemorrágicos</span> (rotura de aneurisma). La estenosis carotídea y la fibrilación auricular son las grandes causas de embolia cerebral.</p>
        </div>
      </div>
      <div className="apuntes">
        <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
        <div className="a-text" id="info-text-15">Contraintuitivo: una estenosis del 50 % casi no molesta. La curva Q vs % es plana hasta la «estenosis crítica» (~75–80 %) y luego cae en picada. En el canvas estrecha el vaso y mira el flujo no inmutarse… hasta que se desploma. Ese umbral decide la cirugía.</div>
      </div>
    </div>
    <div className="sim-col">
      <div className="sim-area">
        <Sim id="sim-stenosis" />
        <div className="prof-controls">
          <span className="badge">estenosis</span>
          <label>% estrechamiento <input type="range" id="es_s" min="0" max="100" step="1" defaultValue={50} onChange={(e) => { engine.setParam('es_s', parseFloat(e.target.value)); engine.requestDraw(); }} /> <span id="es_sv">50 %</span></label>
          <span className="readout" id="es_out">moderada · Q/Q₀ ≈ 0,96</span>
        </div>
      </div>
    </div>
  </div>


    </>
  );
}
