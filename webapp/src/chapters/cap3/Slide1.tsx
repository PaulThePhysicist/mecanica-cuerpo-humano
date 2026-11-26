import { useState } from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';
import StabScene3D from './StabScene3D';
import SlideHeader from './SlideHeader';
import { stabModel } from './sims';

export default function Slide1({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;
  const cm = engine.flagsRef.current.stabCM;
  const [theta, setTheta] = useState(params.stab_theta);
  const [H, setH] = useState(params.stab_H);
  const uni = stabModel(1, 0.5);
  const real = stabModel(1, 0.58);
  const fmt = (x: number) => x.toFixed(1).replace('.', ',');

  return (
    <div className="slide active" data-slide="1" data-module="1">
      <SlideHeader index={1} num="3.2.1" title="Bipedestación y estabilidad" sub="La línea de gravedad debe caer dentro de la base de sustentación" />
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🧍</span> Estabilidad general: caer es salir de la base
            </div>
            <div className="card-body">
              <p>
                Un cuerpo rígido de pie es estable mientras la <strong>línea de gravedad</strong> —la vertical que pasa por
                el centro de masa— atraviese la <strong>base de sustentación</strong>, el área que delimitan los pies. Si
                sale de ella, los torques de los pies ya no se cancelan y el cuerpo vuelca.
              </p>
              <p>
                Modelo del Problema 3.1: una persona «unidimensional» de altura {'\\(H\\)'} y masa uniforme (CM a{' '}
                {'\\(0{,}50\\,H\\)'}) apoyada al 25 % desde el talón sobre pies de {'\\(0{,}152\\,H\\)'}: el talón queda{' '}
                {'\\(0{,}038\\,H\\)'} detrás y los dedos {'\\(0{,}114\\,H\\)'} delante.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">📐</span> Ángulo máximo de inclinación
            </div>
            <div className="card-body">
              <div className="eq-block">{'\\[ \\tan\\theta_{\\max} = \\frac{d_{\\text{borde}}}{h_{\\text{CM}}} \\]'}</div>
              <table className="data-mini">
                <thead>
                  <tr>
                    <th>Centro de masa</th>
                    <th>Adelante</th>
                    <th>Atrás</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{'\\(0{,}50\\,H\\)'} · Prob. 3.1</td>
                    <td>{fmt(uni.aF)}°</td>
                    <td>{fmt(uni.aB)}°</td>
                  </tr>
                  <tr>
                    <td>{'\\(0{,}58\\,H\\)'} · real, Fig. 3.8</td>
                    <td>{fmt(real.aF)}°</td>
                    <td>{fmt(real.aB)}°</td>
                  </tr>
                </tbody>
              </table>
              <p>Hacia atrás casi no hay margen: el talón sobresale tres veces menos que los dedos.</p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🛡️</span> Cómo ganamos estabilidad
            </div>
            <div className="card-body">
              <p>
                Bajar el CM, ampliar la base en la dirección de la fuerza (boxeador), llevar la línea de gravedad hacia el
                borde que recibe el empuje (contra el viento), ganar masa, alinear segmentos y aumentar la fricción.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text">
              Embarazo: sin compensación el CM avanzaría ≈ 3,2 cm; la lordosis lumbar pasa de ≈ 32° a ≈ 50° gracias al
              disco extra en cuña (L3–L5). ¿Por qué la «barriga cervecera» acaba en dolor de espalda?
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area cap3-stability-area" data-stage="anatomy">
            <StabScene3D theta={theta} H={H} onView={engine.requestDraw} />
            <Sim id="sim-stab" className="sim" label="Proyección del centro de masa sobre la base de sustentación" />
            <div className="stage-legend" aria-hidden="true">
              <span>
                <i className="legend-dot legend-dot--cm" /> CM
              </span>
              <span>
                <i className="legend-dot legend-dot--base" /> base
              </span>
              <span>
                <i className="legend-dot legend-dot--torque" /> vuelco
              </span>
            </div>
            <div className="prof-controls">
              <span className="badge">{'\\(\\theta_{\\max}=\\arctan(d/h)\\)'}</span>
              <label>
                θ
                <input
                  type="range"
                  min="-20"
                  max="20"
                  step="0.5"
                  defaultValue={params.stab_theta}
                  aria-label="Inclinación θ en grados"
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    setTheta(v);
                    engine.setParam('stab_theta', v);
                    engine.requestDraw();
                  }}
                />
              </label>
              <label>
                H
                <input
                  type="range"
                  min="1.4"
                  max="2.1"
                  step="0.01"
                  defaultValue={params.stab_H}
                  aria-label="Estatura H en metros"
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    setH(v);
                    engine.setParam('stab_H', v);
                    engine.requestDraw();
                  }}
                />
              </label>
              <button
                type="button"
                aria-pressed={cm === 0.58}
                onClick={() => {
                  engine.setFlag('stabCM', cm === 0.5 ? 0.58 : 0.5);
                  engine.requestDraw();
                }}
              >
                CM {cm === 0.5 ? '0,50 H' : '0,58 H'}
              </button>
              <span className="readout" id="stab_out" aria-live="polite" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
