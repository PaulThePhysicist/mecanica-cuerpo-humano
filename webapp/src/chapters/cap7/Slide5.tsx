import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide5({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="5" data-module="2">
      <div className="module-header">
        <span className="mnum">7.2</span>
        <span className="mtitle">La ley de Laplace: el cilindro</span>
        <span className="msub">La tensión de la pared sostiene la presión interna</span>
        <span className="mslide-count">5 / 23</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🛢️</span> El tubo cilíndrico
            </div>
            <div className="card-body">
              <p>
                La pared de un vaso cilíndrico de radio {"\\(R\\)"} sostiene la diferencia de presión {"\\(\\Delta P\\)"}{' '}
                con una tensión {"\\(T\\)"} (fuerza por unidad de longitud):
              </p>
              <div className="eq-block">
                {
                  "\\[ \\Delta P = \\frac{T}{R} \\qquad \\text{es decir} \\qquad T = \\Delta P \\cdot R \\qquad \\text{(eq. 7.3–7.7)} \\]"
                }
              </div>
              <p>
                Es la <strong>ley de Laplace</strong>: a igual tensión, un tubo más ancho necesita menos presión interna, y
                a la inversa.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🫗</span> Consecuencia: el radio gobierna la tensión
            </div>
            <div className="card-body">
              <p>
                Para una presión dada, la tensión de pared crece con el radio. Por eso la <strong>aorta</strong> (gran radio)
                tiene paredes gruesas y elásticas, y las <strong>arteriolas</strong> (radio pequeño) resisten con tensión
                baja.
              </p>
              <p>
                La palpación de un pulso (Fig. 7.25): el dedo siente la <span className="highlight">tensión de la pared</span>,
                no solo la presión interna.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">⚠️</span> Aneurisma
            </div>
            <div className="card-body">
              <p>
                Si un punto del vaso se debilita y el radio local {"\\(R\\)"} crece, la tensión{' '}
                {"\\(T = \\Delta P \\cdot R\\)"} <strong>crece con él</strong>: un bucle de retroalimentación que dilata más
                el aneurisma hasta el riesgo de ruptura.
              </p>
              <div className="eq-block">
                {"\\[ R \\uparrow \\ \\Rightarrow\\ T \\uparrow \\ \\Rightarrow\\ R \\uparrow\\cdots \\]"}
              </div>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-5">
              La ley de Laplace es la idea más rentable del capítulo: explica vasos, alvéolos, vejiga, estómago y aneurismas.
              En el canvas mueve el radio con la presión fija: la tensión (grosor rojo de la pared) crece en línea recta con
              R. Ese es el peligro del aneurisma.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-laplace-cyl" />
            <div className="prof-controls">
              <span className="badge">cilindro</span>
              <label>
                R{' '}
                <input
                  type="range"
                  id="lc_r"
                  min="1"
                  max="10"
                  step="0.5"
                  defaultValue={params.lc_r}
                  onInput={(e) => {
                    engine.setParam('lc_r', parseFloat((e.target as HTMLInputElement).value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="lc_rv">3,0</span>
              </label>
              <label>
                ΔP{' '}
                <input
                  type="range"
                  id="lc_p"
                  min="10"
                  max="120"
                  step="5"
                  defaultValue={params.lc_p}
                  onInput={(e) => {
                    engine.setParam('lc_p', parseFloat((e.target as HTMLInputElement).value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="lc_pv">60</span>
              </label>
              <span className="readout" id="lc_out">
                T = 180
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
