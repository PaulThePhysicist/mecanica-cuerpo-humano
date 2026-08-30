import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide4({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="4" data-module="2">
      <div className="module-header">
        <span className="mnum">11 · 2</span>
        <span className="mtitle">La lente delgada y las vergencias</span>
        <span className="msub">{"\\(1/d_1 + 1/d_2 = 1/f \\qquad U + P = V\\)"}</span>
        <span className="mslide-count">4 / 24</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🔭</span> Formación de imagen
            </div>
            <div className="card-body">
              <p>
                Para una lente delgada, las distancias de objeto {'\\(d_1\\)'} e imagen {'\\(d_2\\)'} y la focal{' '}
                {'\\(f\\)'} cumplen:
              </p>
              <div className="eq-block">
                <span className="eqno">(11.3)</span>
                {"\\[ \\frac{1}{d_1} + \\frac{1}{d_2} = \\frac{1}{f} \\]"}
              </div>
              <p>La magnificación lateral es el cociente de distancias (y de tamaños):</p>
              <div className="eq-block">
                <span className="eqno">(11.4)</span>
                {"\\[ M = \\frac{d_2}{d_1} = \\frac{y_2}{y_1} \\]"}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">➕</span> Las vergencias: sumar potencias
            </div>
            <div className="card-body">
              <p>
                Se definen las <strong>vergencias</strong> (en dioptrías, 1 D = 1/m): la entrante es negativa
                (divergente), la saliente positiva (convergente), y la lente aporta su potencia:
              </p>
              <div className="eq-block">
                <span className="eqno">(11.5)</span>
                {"\\[ U = -\\frac{n}{d_1},\\qquad V = \\frac{n}{d_2},\\qquad P = \\frac{n}{f},\\qquad U + P = V \\]"}
              </div>
              <p>
                Es la herramienta que usa la optometría: <strong>el ojo es una suma de potencias</strong>.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-4">
              Mueve la distancia del objeto y la focal: la imagen se forma donde la vergencia saliente se anula (V = 0).
              Si d₁ = f, la imagen se va al infinito — la luz sale paralela, como en un ojo mirando al punto remoto.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-lens" className="sim" />
            <div className="prof-controls">
              <span className="badge">lente</span>
              <label>
                Objeto d₁{' '}
                <input
                  type="range"
                  id="le_d"
                  min="30"
                  max="200"
                  defaultValue={params.le_d}
                  step="1"
                  onChange={(e) => {
                    engine.setParam('le_d', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="le_dv">80 cm</span>
              </label>
              <label>
                f{' '}
                <input
                  type="range"
                  id="le_f"
                  min="15"
                  max="60"
                  defaultValue={params.le_f}
                  step="1"
                  onChange={(e) => {
                    engine.setParam('le_f', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="le_fv">30 cm</span>
              </label>
              <span className="readout" id="le_out">
                d₂ = 48 cm · M = 0,6
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
