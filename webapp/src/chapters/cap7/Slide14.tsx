import React, { useState } from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide14({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;
  const flags = engine.flagsRef.current;
  const [playing, setPlaying] = useState(flags.inPlaying);

  const toggle = () => {
    const next = !flags.inPlaying;
    flags.inPlaying = next;
    if (next) flags.inT = 0;
    setPlaying(next);
    engine.requestDraw();
  };

  return (
    <div className="slide active" data-slide="14" data-module="5">
      <div className="module-header">
        <span className="mnum">7.3</span>
        <span className="mtitle">Inertancia y tubos curvos</span>
        <span className="msub">La masa del fluido se resiste a cambiar</span>
        <span className="mslide-count">14 / 23</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🏋️</span> Inertancia
            </div>
            <div className="card-body">
              <p>La masa del fluido se opone a los <em>cambios</em> de caudal (eq. 7.21, 7.52–7.53):</p>
              <div className="eq-block">
                {
                  "\\[ \\Delta P = \\frac{\\rho L}{A}\\,\\frac{\\partial Q}{\\partial t} = L_{\\text{flujo}}\\,\\frac{\\partial Q}{\\partial t} \\qquad L_{\\text{flujo}} = \\frac{\\rho L}{A} = \\frac{\\rho L}{\\pi r^2} \\]"
                }
              </div>
              <p>
                Es el análogo hidráulico de la inductancia: importa solo cuando el flujo es{' '}
                <span className="tag">pulsátil</span>.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">〽️</span> Tubos curvos
            </div>
            <div className="card-body">
              <p>
                En una curva de radio de curvatura {"\\(\\mathcal{R}\\)"}, la presión centrífuga empuja el fluido hacia la
                pared exterior (eq. 7.57):
              </p>
              <div className="eq-block">
                {"\\[ P_{\\text{cent}} = \\frac{2\\rho u^2 R}{\\mathcal{R}} \\]"}
              </div>
              <p>
                La manguera «se endereza»; la sangre se concentra en el lado externo del <strong>arco aórtico</strong>. Por
                eso las placas (ateromas) tienden a formarse en las curvaturas.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">⏱️</span> ¿Cuándo importa la inertancia?
            </div>
            <div className="card-body">
              <p>
                En un flujo estacionario, {"\\(\\partial Q/\\partial t = 0\\)"} y la inertancia no hace nada. En la aorta, la
                sangre <strong>acelera y frena con cada latido</strong>: allí la inercia del fluido se siente y se combina
                con resistencia y compliancia.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-14">
              Resistencia, compliancia e inertancia forman la terna RLC del sistema arterial: resistencia frena, compliancia
              almacena, inertancia retrasa. En el canvas, las partículas que atraviesan el arco aórtico se amontonan en la
              pared exterior — la firma de la presión centrífuga.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-inertance" />
            <div className="prof-controls">
              <span className="badge">inertancia</span>
              <label>
                u{' '}
                <input
                  type="range"
                  id="in_u"
                  min="0"
                  max="100"
                  step="1"
                  defaultValue={params.in_u}
                  onInput={(e) => {
                    engine.setParam('in_u', parseFloat((e.target as HTMLInputElement).value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="in_uv">50 cm/s</span>
              </label>
              <button id="in_play" type="button" onClick={toggle}>
                {playing ? '⏸' : '▶'}
              </button>
              <span className="readout" id="in_out">
                ΔP = (ρL/A)·∂Q/∂t
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
