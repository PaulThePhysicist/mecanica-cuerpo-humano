import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide15({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="15" data-module="6">
      <div className="module-header">
        <span className="mnum">3.10</span>
        <span className="mtitle">Bateo: el bate óptimo</span>
        <span className="msub">Masa del bate, punto dulce y rapidez de salida</span>
        <span className="mslide-count">15 / 19</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🏏</span> Colisión bate–pelota
            </div>
            <div className="card-body">
              <p>
                {"Con \\(W_{\\text{pelota}} = 5{,}125\\ \\text{oz}\\) y coeficiente de restitución \\(e = 0{,}55\\), la rapidez de salida sale de conservar momento:"}
              </p>
              <div className="eq-block">
                {"\\[ v'_{\\text{pelota}} = \\frac{(W_p - e\\,W_b)v_p + (W_b + e\\,W_b)v_b}{W_p + W_b} \\]"}
              </div>
              <p>
                Un bate más pesado golpea más fuerte pero <em>se mueve más lento</em>.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">⚖️</span> La masa óptima
            </div>
            <div className="card-body">
              <p>
                {"La rapidez del bate cae con su masa: \\(v_{\\text{bate}} = 63 - 0{,}39\\,W_{\\text{bate}}\\ \\text{mph}\\). El óptimo es ≈ "}<span className="tag">38,5 oz</span>:
              </p>
              <div className="eq-block">
                {"\\[ v'_{\\text{pelota}} \\approx 95\\ \\text{mph} \\]"}
              </div>
              <p>
                El <strong>punto dulce</strong> (centro de percusión) está a ≈ ⅔ de la distancia desde el mango: ahí la
                pelota no hace vibrar el bate y toda la energía va a la bola.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-15">
              Un jonrón necesita ~100 mph de salida a ~35°. El canvas traza v' vs masa del bate: el pico cerca de 38–40 oz es
              el bate "óptimo". Golpear fuera del punto dulce pierde energía en vibración.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-bat" className="sim" />
            <div className="prof-controls">
              <span className="badge">Punto dulce</span>
              <label>
                W{' '}
                <input
                  type="range"
                  id="ba_w"
                  min="20"
                  max="60"
                  step="0.5"
                  defaultValue={params.ba_w}
                  onChange={(e) => {
                    engine.setParam('ba_w', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />
              </label>
              <span className="readout" id="ba_out">
                v' = 95 mph
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
