import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide6({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="6" data-module="3">
      <div className="module-header">
        <span className="mnum">4.2</span>
        <span className="mtitle">Almacenamiento de energía elástica</span>
        <span className="msub">{"\\(\\text{PE} = \\tfrac{1}{2}Y\\varepsilon^2V\\)"}: la energía es el área bajo la curva</span>
        <span className="mslide-count">6 / 21</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">⚡</span> Energía potencial elástica
            </div>
            <div className="card-body">
              <p>En un resorte (4.11), y escalando a tensión–deformación (4.13–4.14):</p>
              <div className="eq-block">
                {"\\[ \\text{PE}=\\tfrac{1}{2}kx^2 \\qquad \\text{PE}=\\tfrac{1}{2}Y\\varepsilon^2 V=\\tfrac{1}{2}\\sigma\\varepsilon V=\\tfrac{1}{2}\\frac{\\sigma^2}{Y}V \\]"}
              </div>
              <p>
                La energía por unidad de volumen <span className="highlight">es el área bajo la curva σ–ε</span> (4.16).
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🎯</span> Diseño del mejor "resorte" corporal
            </div>
            <div className="card-body">
              <p>
                Para una fuerza aplicada {"\\(F\\)"}, la energía almacenada (4.17) es
              </p>
              <div className="eq-block">
                {"\\[ \\text{PE}=\\frac{F^2}{2Y}\\frac{L_0}{A} \\]"}
              </div>
              <p>
                Queremos tendones <strong>largos</strong>, <strong>delgados</strong> y con <strong>Y pequeño</strong>. Pero{' '}
                {"\\(A\\)"} no puede ser tan chica que {"\\(\\sigma=F/A\\)"} se acerque al UTS, ni {"\\(L_0\\)"} tan larga
                que el estiramiento {"\\(\\varepsilon L_0\\)"} rompa el movimiento.{' '}
                <span className="highlight">Compromiso de diseño</span>.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-6">
              El área sombreada del canvas ES la energía por volumen: material con Y chico y ε grande almacena más. De ahí
              la elección evolutiva: tendones (Y≈0,3 GPa) para almacenar, hueso (Y=17,9 GPa) para rigidez.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-energy" className="sim" />
            <div className="prof-controls">
              <span className="badge">PE/V = ½σε</span>
              <label>
                ε{' '}
                <input
                  type="range"
                  id="en_e"
                  min="0"
                  max="0.002"
                  step="0.00002"
                  defaultValue={params.en_e}
                  onChange={(e) => {
                    engine.setParam('en_e', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />
              </label>
              <span className="readout" id="en_out">
                PE/V = 8,9 kJ/m³
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
