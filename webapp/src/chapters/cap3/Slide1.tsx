import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';
import StabScene3D from './StabScene3D';

export default function Slide1({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="1" data-module="1">
      <div className="module-header">
        <span className="mnum">3.2</span>
        <span className="mtitle">Bipedestación y estabilidad</span>
        <span className="msub">El centro de masa cae dentro de la base de sustentación</span>
        <span className="mslide-count">1 / 19</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🧍</span> Estabilidad: caer es dejar la base
            </div>
            <div className="card-body">
              <p>
                El cuerpo de pie es estable mientras la <strong>vertical que pasa por el centro de masa</strong> atraviese
                la <strong>base de sustentación</strong> — el polígono que forman los pies. Si esa vertical cae fuera, el
                peso crea un torque que nos voltea.
              </p>
              <p>
                Para el modelo de una sola línea, el pie mide ≈ <span className="tag">0,152 H</span> y el centro de masa
                está ≈ <span className="tag">0,55 H</span> sobre el piso.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">📐</span> El ángulo máximo de inclinación
            </div>
            <div className="card-body">
              <p>La máxima inclinación sin perder el equilibrio sale de un triángulo rectángulo:</p>
              <div className="eq-block">
                {"\\[ \\tan\\theta_{\\max} = \\frac{d_{\\text{pie}}}{h_{\\text{CM}}} \\]"}
              </div>
              <p>
                {"Con \\(d_{\\text{pie}} \\approx 0,152 H\\) y \\(h_{\\text{CM}} \\approx 0,55 H\\):"} <strong>adelante ≈ 11,7°</strong>,
                pero <strong>atrás ≈ 3,9°</strong> (el talón sobresale mucho menos que los dedos).
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🪨</span> No estamos perfectamente quietos
            </div>
            <div className="card-body">
              <p>
                La postura erguida es una <strong>oscilación perpetua</strong>: el centro de masa se mece sobre la base y
                los músculos del tobillo lo corrigen sin que lo notemos. Una base más amplia (pies separados) permite
                inclinarse más antes de caer.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-1">
              El problema 3.1 del libro usa exactamente este modelo de una sola línea: pie de 0,152·H y CM a 0,55·H. Pídeles
              que comparen el ángulo de caída hacia adelante y hacia atrás — el número <em>incómodo</em> es que casi no
              podemos inclinarnos hacia atrás.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area cap3-stability-area" data-stage="anatomy" style={{ position: 'relative' }}>
            <StabScene3D onReady={() => engine.requestDraw()} />
            <Sim id="sim-stab" className="sim" label="Proyección 2D del centro de masa y la base de sustentación" />
            <div className="stage-hud" aria-hidden="true">
              <span className="stage-kicker">ESTABILIDAD</span>
              <span className="stage-value">modelo 3D + proyección 2D</span>
            </div>
            <div className="stage-legend" aria-hidden="true">
              <span><i className="legend-dot legend-dot--cm" /> CM</span>
              <span><i className="legend-dot legend-dot--base" /> base</span>
              <span><i className="legend-dot legend-dot--torque" /> torque</span>
            </div>
            <div className="prof-controls">
              <span className="badge">θ = arctan(d / h)</span>
              <label>
                θ{' '}
                <input
                  type="range"
                  id="stab_theta"
                  min="-20"
                  max="20"
                  defaultValue={params.stab_theta}
                  onChange={(e) => {
                    engine.setParam('stab_theta', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />
              </label>
              <label>
                H{' '}
                <input
                  type="range"
                  id="stab_H"
                  min="1.4"
                  max="2.1"
                  step="0.01"
                  defaultValue={params.stab_H}
                  onChange={(e) => {
                    engine.setParam('stab_H', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />
              </label>
              <span className="readout" id="stab_out">
                0°
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
