import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide10({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="10" data-module="5">
      <div className="module-header">
        <span className="mnum">4.4</span>
        <span className="mtitle">Flexión de una viga</span>
        <span className="msub">El segundo momento de inercia manda</span>
        <span className="mslide-count">10 / 21</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">📐</span> La tensión crece con la distancia al eje
            </div>
            <div className="card-body">
              <p>
                Al flexionar, la <strong>fibra neutra</strong> no cambia de largo; las que están a distancia{" "}
                {"\\(y\\)"} se estiran (arriba) o comprimen (abajo):
              </p>
              <div className="eq-block">
                {"\\[ \\sigma(y)=\\frac{Yy}{R}\\qquad M_B=-\\frac{YI_A}{R}\\qquad I_A=\\int y^2\\,dA \\]"}
              </div>
              <p>
                El <strong>segundo momento de inercia</strong> {"\\(I_A\\)"} pesa el material por su distancia al eje al
                cuadrado: el material lejos del eje aporta casi toda la resistencia.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">📏</span> La altura al cubo
            </div>
            <div className="card-body">
              <p>Para un rectángulo de base {"\\(w\\)"} y altura {"\\(h\\)"}:</p>
              <div className="eq-block">
                {"\\[ I_A=\\frac{wh^3}{12} \\]"}
              </div>
              <p>
                Un tablón de 2×6 cm: de <strong>canto</strong> {"\\(I_A=2\\cdot6^3/12=36\\ \\text{cm}^4\\)"};{' '}
                <strong>plano</strong> {"\\(I_A=6\\cdot2^3/12=4\\ \\text{cm}^4\\)"}. <span className="tag">9× más rígido</span>{' '}
                simplemente girándolo. La deflexión del voladizo (4.46):
              </p>
              <div className="eq-block">
                {"\\[ y(L)=-\\frac{FL^3}{3YI_A} \\]"}
              </div>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-10">
              Los huesos largos son vigas: resisten flexión con su "peralte" anatómico. La deflexión cae con L³: un hueso
              el doble de largo es 8× más flexible. Mueve F en el canvas y mira la distribución de tensión en la sección:
              roja arriba (tracción), azul abajo (compresión).
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-beam" className="sim" />
            <div className="prof-controls">
              <span className="badge">y(L) = −FL³/3YI_A</span>
              <label>
                F{' '}
                <input
                  type="range"
                  id="bm_F"
                  min="0"
                  max="5000"
                  step="50"
                  defaultValue={params.bm_F}
                  onChange={(e) => {
                    engine.setParam('bm_F', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />
              </label>
              <span className="readout" id="bm_out">
                δ = 0,8 mm
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
