import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide7({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="7" data-module="3">
      <div className="module-header">
        <span className="mnum">11 · 2</span>
        <span className="mtitle">La lente delgada: ecuación del fabricante</span>
        <span className="msub">{"\\(1/f = (n-1)\\big(1/R_{12} - 1/R_{23}\\big)\\)"}</span>
        <span className="mslide-count">7 / 24</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">💠</span> Dos superficies que se suman
            </div>
            <div className="card-body">
              <p>
                {"Una lente delgada en un medio \\(n_3\\) combina la potencia de sus dos superficies:"}
              </p>
              <div className="eq-block">
                <span className="eqno">(11.15)</span>
                {"\\[ f = \\frac{n_3}{P_{12}+P_{23}} \\]"}
              </div>
              <p>
                {"En aire (\\(n_3 = 1\\)) la focal es la inversa de la potencia total: \\(f = 1/\\sum P\\)."}
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🏭</span> La ecuación del fabricante
            </div>
            <div className="card-body">
              <p>
                {"Para una lente de índice \\(n\\) con radios \\(R_{12}\\) (anterior) y \\(R_{23}\\) (posterior):"}
              </p>
              <div className="eq-block">
                <span className="eqno">(11.18)</span>
                {"\\[ \\frac{1}{f} = (n-1)\\left(\\frac{1}{R_{12}} - \\frac{1}{R_{23}}\\right) \\]"}
              </div>
              <p>
                Sube el índice o la curvatura y la lente <strong>converge más</strong>. El cristalino del ojo cambia de
                radio (acomodación) en vez de índice; una lente de contacto hace lo mismo que los anteojos con{' '}
                {'\\(n \\approx 1{,}44\\)'}–{'\\(1{,}60\\)'}.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-7">
              Aumenta el índice o la curvatura: la focal se acorta y el haz converge antes. La lente delgada del ojo
              estándar (f = 17 mm en aire) se diseña con esta misma fórmula.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-maker" className="sim" />
            <div className="prof-controls">
              <span className="badge">fabricante</span>
              <label>
                n{' '}
                <input
                  type="range"
                  id="fb_n"
                  min="1.4"
                  max="1.7"
                  defaultValue={params.fb_n}
                  step="0.01"
                  onChange={(e) => {
                    engine.setParam('fb_n', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="fb_nv">1,50</span>
              </label>
              <label>
                R{' '}
                <input
                  type="range"
                  id="fb_R"
                  min="20"
                  max="60"
                  defaultValue={params.fb_R}
                  step="1"
                  onChange={(e) => {
                    engine.setParam('fb_R', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="fb_Rv">40 mm</span>
              </label>
              <span className="readout" id="fb_out">
                f = 40 mm · P = 25 D
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
