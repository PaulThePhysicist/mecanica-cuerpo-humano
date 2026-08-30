import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide10({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="10" data-module="4">
      <div className="module-header">
        <span className="mnum">3.7</span>
        <span className="mtitle">Pértiga, altura y longitud</span>
        <span className="msub">Convertir velocidad horizontal en altura</span>
        <span className="mslide-count">10 / 19</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🎽</span> El salto con pértiga
            </div>
            <div className="card-body">
              <p>{"La velocidad horizontal \\(v_{Hi}\\) se convierte en energía cinética y luego en altura sobre la barra:"}</p>
              <div className="eq-block">
                {"\\[ h_{\\text{barra}} = h_{CM} - h_{\\min} + \\frac{v_{Hi}^2}{2g} \\]"}
              </div>
              <p>
                {"Con \\(v_{Hi} = 9{,}5\\ \\text{m/s}\\) el modelo da \\(h_{\\text{barra}} \\approx 5{,}4\\ \\text{m}\\) — muy cerca del récord mundial (6,16 m). La pértiga almacena energía elástica y la devuelve en el vuelo."}
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🏃</span> Altura vs longitud
            </div>
            <div className="card-body">
              <table className="data-mini">
                <thead>
                  <tr>
                    <th>Salto</th>
                    <th>Ángulo</th>
                    <th>Rapidez</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <b>Alto</b> (Fosbury)
                    </td>
                    <td>45–50°</td>
                    <td>≈ 7 m/s</td>
                  </tr>
                  <tr>
                    <td>
                      <b>Largo</b>
                    </td>
                    <td>60–70°</td>
                    <td>≈ 11 m/s</td>
                  </tr>
                </tbody>
              </table>
              <p>
                En el salto de altura importa convertir <em>algo</em> de velocidad en altura; en el salto de longitud
                importa <strong>maximizar la rapidez</strong> y despegar en un ángulo menor para cubrir distancia.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-10">
              La pértiga es el ejemplo favorito de conservación de la energía: KE → elástica → PE. El canvas muestra cómo
              crece h con v_Hi y por qué el récord supera el modelo simple (la pértiga aporta más).
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-vault" className="sim" />
            <div className="prof-controls">
              <span className="badge">h = v²/2g</span>
              <label>
                v{' '}
                <input
                  type="range"
                  id="va_v"
                  min="5"
                  max="11"
                  step="0.1"
                  defaultValue={params.va_v}
                  onChange={(e) => {
                    engine.setParam('va_v', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />
              </label>
              <span className="readout" id="va_out">
                h = 5,4 m
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
