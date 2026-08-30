import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide1({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="1" data-module="1">
      <div className="module-header">
        <span className="mnum">6.1</span>
        <span className="mtitle">Conservación de la energía y balance del cuerpo</span>
        <span className="msub">Primera ley: la energía no se crea ni se destruye</span>
        <span className="mslide-count">1 / 23</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">⚖️</span> La primera ley de la termodinámica
            </div>
            <div className="card-body">
              <p>
                El cuerpo obedece la <strong>conservación de la energía</strong>. La variación de energía interna es el calor neto{' '}
                <em>menos</em> el trabajo:
              </p>
              <div className="eq-block">{"\\[ \\Delta U = Q - W \\qquad \\text{(eq. 6.1)} \\]"}</div>
              <p>
                {"Para el cuerpo, la fuente de calor es el "}<strong>metabolismo</strong>{" (\\(Q_{\\text{met}}\\)) y la pérdida hacia el entorno es \\(Q_{\\text{loss}}\\):"}
              </p>
              <div className="eq-block">{"\\[ \\Delta U = Q_{\\text{met}} + Q_{\\text{loss}} - W \\qquad \\text{(eq. 6.2)} \\]"}</div>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🕰️</span> En estado estacionario
            </div>
            <div className="card-body">
              <p>
                {"Si la energía interna no cambia (\\(\\Delta U = 0\\)), todo el metabolismo debe repartirse entre "}
                <strong>trabajo mecánico</strong> y <strong>calor</strong>:
              </p>
              <div className="eq-block">
                {"\\[ \\frac{dU}{dt} = \\frac{dQ_{\\text{met}}}{dt} + \\frac{dQ_{\\text{loss}}}{dt} - \\frac{dW}{dt} = 0 \\qquad \\text{(eq. 6.3)} \\]"}
              </div>
              <p>
                {"La regla de los signos: "}<span className="tag">{"\\(dQ_{\\text{loss}}/dt < 0\\)"}</span>{" porque el cuerpo "}
                <strong>pierde</strong>{" calor; "}<span className="tag">{"\\(dW/dt > 0\\)"}</span>{" cuando el cuerpo "}
                <strong>hace</strong> trabajo sobre el mundo.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">💡</span> Casi todo termina en calor
            </div>
            <div className="card-body">
              <p>
                Del <span className="tag">80 al 100 %</span> del metabolismo se convierte en calor (la eficiencia mecánica suele ser
                menor del 20 %). El calor se disipa por <strong>radiación, convección, conducción y evaporación</strong> (módulo 7).
              </p>
              <p>
                {"La masa corporal almacena energía interna: "}<span className="tag">{"\\(c_{\\text{b}} = 0,83\\text{ kcal/kg-°C}\\)"}</span>
                {". Subir 1 °C a una persona de 100 kg cuesta ≈ "}<span className="highlight">83 kcal — el contenido de una rebanada de pan</span>.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-1">
              El concepto central del capítulo: el metabolismo es la «entrada» energética y casi todo sale como calor. Ajusta en el
              canvas la fracción de energía que se convierte en trabajo mecánico y observa cómo el resto —el grueso— debe perderse
              como calor para que ΔU = 0.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-balance" className="sim" />
            <div className="prof-controls">
              <span className="badge">balance</span>
              <label>
                trabajo{' '}
                <input
                  type="range"
                  id="bl_w"
                  min="0"
                  max="40"
                  step="1"
                  defaultValue={params.bl_w}
                  onChange={(e) => {
                    engine.setParam('bl_w', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="bl_wv">{params.bl_w} %</span>
              </label>
              <span className="readout" id="bl_out">
                W = {params.bl_w} % · calor = {100 - params.bl_w} %
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
