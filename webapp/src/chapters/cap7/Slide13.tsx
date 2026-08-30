import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide13({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="13" data-module="5">
      <div className="module-header">
        <span className="mnum">7.3</span>
        <span className="mtitle">Compliancia y distensibilidad</span>
        <span className="msub">El vaso elástico que almacena volumen</span>
        <span className="mslide-count">13 / 23</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🎈</span> Compliancia
            </div>
            <div className="card-body">
              <p>Cuánto volumen admite un vaso por unidad de presión (eq. 7.20):</p>
              <div className="eq-block">{"\\[ C = \\frac{\\Delta V}{\\Delta P} \\]"}</div>
              <p>
                Para un cilindro elástico de radio {"\\(r_0\\)"}, longitud {"\\(L\\)"}, pared {"\\(w\\)"} y módulo de
                Young {"\\(Y\\)"} (eq. 7.46):
              </p>
              <div className="eq-block">
                {"\\[ C_{\\text{flujo}} = \\frac{2\\pi r_0^3 L}{w\\, Y} \\]"}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">📐</span> Distensibilidad
            </div>
            <div className="card-body">
              <p>El cambio fraccional de área por presión (eq. 7.47–7.48, 7.51):</p>
              <div className="eq-block">
                {"\\[ D = \\frac{\\Delta A/A}{\\Delta P} = \\frac{2r_0}{w\\,Y} \\]"}
              </div>
              <div className="eq-block">
                {"\\[ \\frac{\\Delta V}{V} = 2\\frac{r_0}{w}\\frac{P}{Y} \\qquad \\text{(eq. 7.43)} \\]"}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🫀</span> El efecto Windkessel
            </div>
            <div className="card-body">
              <p>
                Las arterias elásticas se expanden en sístole y <strong>devuelven</strong> el volumen en diástole: el flujo
                llega a los tejidos casi continuo aunque el corazón late. Un sistema rígido perdería ese «reservorio».
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">⏳</span> Envejecer es endurecerse
            </div>
            <div className="card-body">
              <p>
                Con la edad, {"\\(Y\\)"} crece y {"\\(D\\)"} cae: la onda de pulso viaja más rápido y la presión sistólica
                tiende a subir. Medir la <span className="highlight">velocidad de onda de pulso</span> es medir la rigidez
                arterial.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-13">
              Compliancia = elasticidad del vaso como reservorio. En el canvas sube el módulo de Young Y: el vaso se vuelve
              rígido, apenas se expande con la presión y la compliancia se hunde — eso es la arteria del anciano. La
              distensibilidad es la misma historia por unidad de área.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-compliance" />
            <div className="prof-controls">
              <span className="badge">compliancia</span>
              <label>
                Y{' '}
                <input
                  type="range"
                  id="cm_y"
                  min="0.2"
                  max="2"
                  step="0.05"
                  defaultValue={params.cm_y}
                  onInput={(e) => {
                    engine.setParam('cm_y', parseFloat((e.target as HTMLInputElement).value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="cm_yv">0,60</span>
              </label>
              <label>
                ΔP{' '}
                <input
                  type="range"
                  id="cm_p"
                  min="10"
                  max="120"
                  step="5"
                  defaultValue={params.cm_p}
                  onInput={(e) => {
                    engine.setParam('cm_p', parseFloat((e.target as HTMLInputElement).value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="cm_pv">60</span>
              </label>
              <span className="readout" id="cm_out">
                C_flujo ∝ r₀³/wY
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
