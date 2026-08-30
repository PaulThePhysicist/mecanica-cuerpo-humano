import React from 'react';
import Sim from './Sim';
import type { Engine } from './useEngine';

export default function Slide3({
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
    <span className="mtitle">La gravedad y la columna de sangre</span>
    <span className="msub">Cada metro de sangre pesa ≈ 79 mmHg</span>
    <span className="mslide-count">3 / 24</span>
  </div>
  <div className="content-grid">
    <div className="theory">
      <div className="card active">
        <div className="card-hdr"><span className="icon">⚖️</span> La presión hidrostática</div>
        <div className="card-body">
          <p>La sangre de densidad {"\\( \\rho \\approx 1060\\ \\text{kg/m}^3 \\)"} pesa: {"\\(  \\Delta P = \\rho g h \\)"}. Un metro de columna equivale a <span className="tag">≈ 79 mmHg</span>. El cerebro, a 40 cm sobre el corazón:</p>
          <div className="eq-block">{"\\[  \\Delta P = (1060)(9{,}8)(0{,}4) \\approx 31\\ \\text{mmHg}  \\]"}</div>
          <p>por eso la presión medida a la altura del brazo es la de referencia.</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">🧠</span> El cerebro, más alto</div>
        <div className="card-body">
          <p>De pie, el cerebro recibe ~30 mmHg <strong>menos</strong> que el corazón. Al levantarse rápido, la sangre se va a las piernas y la presión cerebral cae: <span className="tag">síncope / hipotensión ortostática</span>. El reflejo barorreceptor compensa con vasoconstricción en segundos.</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">🦶</span> Y los pies, más abajo</div>
        <div className="card-body">
          <p>En los pies la presión arterial se <strong>suma</strong> a la hidrostática (~+100 mmHg a 1,3 m bajo el corazón): por eso las <span className="tag">várices</span> y el edema al estar mucho tiempo de pie. Las venas de las piernas tienen válvulas que suben la sangre a contra-gravedad.</p>
        </div>
      </div>
      <div className="apuntes">
        <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
        <div className="a-text" id="info-text-3">Regla de oro: cada metro de sangre = ~79 mmHg. El corazón de una jirafa debe vencer una columna de más de 2 m; el nuestro, solo el desnivel de la vida diaria. En el canvas arrastra la altura relativa al corazón y mira cómo la presión arterial «se mueve» con el cuerpo.</div>
      </div>
    </div>
    <div className="sim-col">
      <div className="sim-area">
        <Sim id="sim-gravity" />
        <div className="prof-controls">
          <span className="badge">hidrostática</span>
          <label>altura <input type="range" id="gv_h" min="-1.4" max="0.5" step="0.05" defaultValue={0} onChange={(e) => { engine.setParam('gv_h', parseFloat(e.target.value)); engine.requestDraw(); }} /> <span id="gv_hv">0 m (corazón)</span></label>
          <span className="readout" id="gv_out">P_art ≈ 100 mmHg · ΔP_hidro = 0</span>
        </div>
      </div>
    </div>
  </div>
    </>
  );
}
