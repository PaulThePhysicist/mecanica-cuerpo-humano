import React from 'react';
import Sim from './Sim';
import type { Engine } from './useEngine';

export default function Slide21({
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
    <span className="mtitle">El ejercicio: el corazón y el reparto del flujo</span>
    <span className="msub">De 5 a 25 L/min — y el cerebro ni se entera</span>
    <span className="mslide-count">21 / 24</span>
  </div>
  <div className="content-grid">
    <div className="theory">
      <div className="card active">
        <div className="card-hdr"><span className="icon">🏃</span> El gasto en ejercicio (Tabla 8.6)</div>
        <div className="card-body">
          <p>El gasto total sube con la intensidad: <span className="tag">5,8 → 9,5 → 17,5 → 25 L/min</span>. El volumen sistólico crece de ~70 a ~120 mL y la frecuencia de ~70 a ~150 /min.</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">🧠</span> El cerebro no se mueve</div>
        <div className="card-body">
          <p>El cerebro mantiene <span className="tag">750 mL/min</span> constante (13 % → 3 % del total). El músculo esquelético pasa de <span className="tag">1,2 → 22 L/min</span> (21 % → 88 %). Corazón, piel y riñones se reparten el resto.</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">📈</span> Frecuencia máxima (eq. 8.31–8.32)</div>
        <div className="card-body">
          <div className="eq-block">{"\\[  F_{\\max} = 220 - Y \\qquad \\text{o} \\qquad 211 - 0{,}64\\,Y  \\]"}</div>
          <p>Atletas: volumen sistólico hasta <span className="tag">220 mL</span> → gastos de hasta <span className="tag">35 L/min</span>. En el embarazo, {"\\( Q \\)"} sube ~30 % (5,0 → 6,7 L/min).</p>
        </div>
      </div>
      <div className="apuntes">
        <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
        <div className="a-text" id="info-text-21">La Tabla 8.6 es la mejor lección de fisiología del capítulo: el gasto crece ×4 mientras el cerebro se queda clavado en 750 mL/min. El músculo lo roba todo. En el canvas barre la intensidad y mira las barras reorganizarse — el cerebro es la línea horizontal.</div>
      </div>
    </div>
    <div className="sim-col">
      <div className="sim-area">
        <Sim id="sim-exercise" />
        <div className="prof-controls">
          <span className="badge">ejercicio</span>
          <label>intensidad <input type="range" id="ej_i" min="0" max="3" step="0.1" defaultValue={0} onChange={(e) => { engine.setParam('ej_i', parseFloat(e.target.value)); engine.requestDraw(); }} /> <span id="ej_iv">reposo</span></label>
          <span className="readout" id="ej_out">Q = 5,8 L/min · músculo 21 %</span>
        </div>
      </div>
    </div>
  </div>
    </>
  );
}
