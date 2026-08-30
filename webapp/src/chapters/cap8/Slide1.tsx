import React from 'react';
import Sim from './Sim';
import type { Engine } from './useEngine';

export default function Slide1({
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
    <span className="mnum">8.1</span>
    <span className="mtitle">El circuito cardiovascular y el gasto cardíaco</span>
    <span className="msub">Una doble bomba · un solo circuito de retorno</span>
    <span className="mslide-count">1 / 24</span>
  </div>
  <div className="content-grid">
    <div className="theory">
      <div className="card active">
        <div className="card-hdr"><span className="icon">🫀</span> La bomba doble</div>
        <div className="card-body">
          <p>El corazón es <strong>dos bombas en serie</strong>: el derecho (VD) manda la sangre a los pulmones y el izquierdo (VI) al resto del cuerpo. El volumen sistólico {"\\( V_{\\text{stroke}} \\approx 70 \\)"}–{"\\( 80\\ \\text{cm}^3 \\)"} y la frecuencia {"\\( F \\approx 60 \\)"}–{"\\( 70\\ \\text{/min} \\)"} fijan el gasto cardíaco (eq. 8.29):</p>
          <div className="eq-block">{"\\[  Q_{\\text{t}} = F\\, V_{\\text{stroke}} \\approx 4{,}8\\ \\text{L/min}  \\]"}</div>
          <p>Todo el volumen de sangre (<span className="tag">≈ 5 L</span>) pasa por el cuerpo <strong>cada minuto</strong>.</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">📦</span> Dónde está la sangre · Tabla 8.1</div>
        <div className="card-body">
          <table className="data-mini">
            <tbody>
              <tr><th>Compartimento</th><th>Presión</th><th>Volumen</th></tr>
              <tr><td>Arterias sistémicas</td><td>100 mmHg</td><td>1,0 L</td></tr>
              <tr><td>Venas sistémicas</td><td>2/3 mmHg</td><td>3,5 L</td></tr>
              <tr><td>Arterias pulmonares</td><td>15 mmHg</td><td>0,1 L</td></tr>
              <tr><td>Venas pulmonares</td><td>5 mmHg</td><td>0,4 L</td></tr>
            </tbody>
          </table>
          <p>El circuito pulmonar trabaja a <span className="tag">~1/6 de la presión</span> del sistémico.</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">📊</span> El reparto del volumen</div>
        <div className="card-body">
          <p>La sangre se reparte: <span className="tag">50% venas sistémicas</span>, <span className="tag">18% pulmones</span>, <span className="tag">12% corazón</span>, <span className="tag">8% arterias</span>, <span className="tag">5% capilares</span>, y el resto (aorta, arteriolas) menos del 4%. Las venas son el gran depósito: <strong>vasos de compliancia</strong>, no de resistencia.</p>
        </div>
      </div>
      <div className="apuntes">
        <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
        <div className="a-text" id="info-text-1">Todo el capítulo cuelga de una sola cifra: Q ≈ 5 L/min = F × V_stroke. La doble bomba está en serie: lo que sale del VI vuelve por el VD. En el canvas mira dónde vive la sangre: más de la mitad en las venas — el «reservorio» — no en el corazón.</div>
      </div>
    </div>
    <div className="sim-col">
      <div className="sim-area">
        <Sim id="sim-distribution" />
        <div className="prof-controls">
          <span className="badge">reparto</span>
          <label>foco <select id="ds_sel" defaultValue="all" onChange={(e) => { engine.setParam('ds_sel', e.target.value); engine.requestDraw(); }}>
  <option value="all">Todos</option>
  <option value="corazon">Corazón</option>
  <option value="aorta">Aorta</option>
  <option value="arterias">Arterias</option>
  <option value="arteriolas">Arteriolas</option>
  <option value="capilares">Capilares</option>
  <option value="venas">Venas sistémicas</option>
  <option value="pulmones">Pulmones</option>
  </select></label>
          <span className="readout" id="ds_out">Q ≈ 5 L/min · 50 % en venas</span>
        </div>
      </div>
    </div>
  </div>
    </>
  );
}
