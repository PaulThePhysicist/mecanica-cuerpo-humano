import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide12({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="12" data-module="4">
      <div className="module-header">
        <span className="mnum">7.3</span>
        <span className="mtitle">Resistencia y la analogía de Ohm</span>
        <span className="msub">El sistema circulatorio como circuito</span>
        <span className="mslide-count">12 / 23</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">⚡</span> Resistencia hemodinámica
            </div>
            <div className="card-body">
              <p>La resistencia es la oposición del vaso al flujo (eq. 7.19):</p>
              <div className="eq-block">
                {
                  "\\[ R = \\frac{\\Delta P}{Q} \\qquad \\text{·} \\qquad R_{\\text{Poiseuille}} = \\frac{8 \\eta L}{\\pi R^4} \\]"
                }
              </div>
              <p>
                De Poiseuille se obtiene su expresión en términos de geometría y fluido: larga, viscosa y estrecha =
                resistente.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🔌</span> La analogía eléctrica
            </div>
            <div className="card-body">
              <p>
                La ley de Ohm {"\\(V = I R\\)"} se lee en hemodinámica{' '}
                <span className="tag">{"\\(\\Delta P = Q \\cdot R\\)"}</span>. Presión ↔ voltaje, caudal ↔ corriente,
                resistencia ↔ resistencia.
              </p>
              <p>
                El corazón (bomba) mantiene {"\\(\\Delta P\\)"}; el lecho vascular ajusta {"\\(R\\)"} para repartir el{' '}
                {"\\(Q\\)"} entre órganos.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🔀</span> Serie y paralelo
            </div>
            <div className="card-body">
              <p>
                En <strong>serie</strong> las resistencias se suman; en <strong>paralelo</strong> se reparte el caudal. Los
                capilares en paralelo bajan la resistencia total: por eso la mayor caída de presión ocurre en las{' '}
                <span className="highlight">arteriolas</span>, que regulan el reparto órgano a órgano.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-12">
              La analogía de Ohm unifica el capítulo con lo que ya saben de circuitos. En el canvas conecta dos vasos en
              paralelo y cambia sus radios: el reparto del caudal sigue la ley de R⁻⁴ — el vaso más ancho se lleva la mayor
              parte del flujo.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-resistance" />
            <div className="prof-controls">
              <span className="badge">paralelo</span>
              <label>
                r₁{' '}
                <input
                  type="range"
                  id="rs_r1"
                  min="0.5"
                  max="3"
                  step="0.1"
                  defaultValue={params.rs_r1}
                  onInput={(e) => {
                    engine.setParam('rs_r1', parseFloat((e.target as HTMLInputElement).value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="rs_r1v">2,0</span>
              </label>
              <label>
                r₂{' '}
                <input
                  type="range"
                  id="rs_r2"
                  min="0.5"
                  max="3"
                  step="0.1"
                  defaultValue={params.rs_r2}
                  onInput={(e) => {
                    engine.setParam('rs_r2', parseFloat((e.target as HTMLInputElement).value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="rs_r2v">1,0</span>
              </label>
              <span className="readout" id="rs_out">
                R₁ = 1 · R₂ = 16 · R_eq = 0,94
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
