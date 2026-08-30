import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide4({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="4" data-module="2">
      <div className="module-header">
        <span className="mnum">4.2</span>
        <span className="mtitle">El acortamiento de los huesos</span>
        <span className="msub">0,06 mm al pararte sobre un pie</span>
        <span className="mslide-count">4 / 21</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🦴</span> El fémur bajo tu peso
            </div>
            <div className="card-body">
              <p>
                Parado sobre un pie, todo el peso {"\\(W=700\\ \\text{N}\\)"} pasa por el fémur: {"\\(L_0=500\\ \\text{mm}\\)"}
                , {"\\(A=370\\ \\text{mm}^2\\)"}, {"\\(Y=17.900\\ \\text{N/mm}^2\\)"}. Entonces{" "}
                {"\\(\\sigma=700/370 = 2{,}1\\ \\text{MPa}\\)"} y
              </p>
              <div className="eq-block">
                {"\\[ \\Delta L=\\frac{\\sigma}{Y}L_0=\\frac{2{,}1}{17.900}(500)=0{,}06\\ \\text{mm} \\qquad \\varepsilon=0{,}01\\,\\%=100\\ \\mu\\varepsilon \\]"}
              </div>
              <p>
                El hueso se acorta <span className="tag">0,06 mm</span> ≈ el grosor de un cabello. El esqueleto "respira"
                milímetricamente en cada paso.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">💥</span> Hasta el límite de fractura
            </div>
            <div className="card-body">
              <p>
                En el <strong>UCS</strong> (170 MPa) la deformación lineal sería
              </p>
              <div className="eq-block">
                {"\\[ \\frac{170}{17.900}(500\\ \\text{mm})=5\\ \\text{mm} \\quad\\rightarrow\\quad \\varepsilon=0{,}95\\,\\%\\approx 1\\,\\%,\\; 10.000\\ \\mu\\varepsilon \\]"}
              </div>
              <p>
                De 100 a 10.000 microdeformaciones: <strong>dos órdenes de magnitud</strong> de margen antes de romper.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-4">
              Sube la carga en el canvas y mira el punto recorrer la recta: al superar el UCS se tiñe de sangre. La diferencia
              entre "estar parado" y "fracturarse" es un factor ~90 en la fuerza (63.000 N ≈ 90× el peso corporal).
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-femur" className="sim" />
            <div className="prof-controls">
              <span className="badge">ΔL = σL₀/Y</span>
              <label>
                W{' '}
                <input
                  type="range"
                  id="fe_W"
                  min="0"
                  max="63000"
                  step="200"
                  defaultValue={params.fe_W}
                  onChange={(e) => {
                    engine.setParam('fe_W', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />
              </label>
              <span className="readout" id="fe_out">
                ΔL = 0,06 mm
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
