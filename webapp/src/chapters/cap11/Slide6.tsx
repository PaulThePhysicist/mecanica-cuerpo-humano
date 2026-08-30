import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide6({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="6" data-module="3">
      <div className="module-header">
        <span className="mnum">11 · 2</span>
        <span className="mtitle">La interfaz esférica y su potencia</span>
        <span className="msub">{"\\(P_{12} = (n_2 - n_1)/R_{12}\\)"}</span>
        <span className="mslide-count">6 / 24</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">💠</span> Potencia de una superficie
            </div>
            <div className="card-body">
              <p>
                {"Una interfaz esférica de radio \\(R_{12}\\) entre \\(n_1\\) y \\(n_2\\) tiene potencia y focal:"}
              </p>
              <div className="eq-block">
                <span className="eqno">(11.9)</span>
                {"\\[ f_{12} = \\frac{n_2\\,R_{12}}{n_2-n_1} = \\frac{n_2}{P_{12}} \\]"}
              </div>
              <div className="eq-block">
                <span className="eqno">(11.10)</span>
                {"\\[ P_{12} = \\frac{n_2 - n_1}{R_{12}} \\]"}
              </div>
              <p>Y la ecuación de conjugados con vergencias en cada medio:</p>
              <div className="eq-block">
                <span className="eqno">(11.11)</span>
                {"\\[ \\frac{n_1}{d_1} + \\frac{n_2}{d_2} = \\frac{n_2-n_1}{R_{12}} \\]"}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">👁️</span> La córnea es una interfaz esférica
            </div>
            <div className="card-body">
              <p>
                {"Del aire (n = 1) a la córnea (n ≈ 1,3771) con \\(R \\approx 7{,}8\\) mm sale un poder enorme: la "}
                <strong>superficie anterior de la córnea aporta ~48 D</strong> del ojo esquemático. De ahí que perder la
                interfaz aire-córnea (bucear, operarse) borre la imagen.
              </p>
              <div className="eq-block">
                {"\\[ P_{12} = \\frac{1{,}3771-1}{0{,}0078\\ \\mathrm{m}} \\approx 48\\ \\mathrm{D} \\]"}
              </div>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-6">
              Aumenta el radio: la superficie «se aplana» y pierde potencia. Sube n₂: el contraste de índice crece y el
              haz converge más. La misma fórmula gobierna cada superficie del ojo esquemático que veremos.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-interface" className="sim" />
            <div className="prof-controls">
              <span className="badge">interfaz</span>
              <label>
                R{' '}
                <input
                  type="range"
                  id="if_R"
                  min="5"
                  max="20"
                  defaultValue={params.if_R}
                  step="0.1"
                  onChange={(e) => {
                    engine.setParam('if_R', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="if_Rv">7,8 mm</span>
              </label>
              <label>
                n₂{' '}
                <input
                  type="range"
                  id="if_n"
                  min="1.33"
                  max="1.6"
                  defaultValue={params.if_n}
                  step="0.005"
                  onChange={(e) => {
                    engine.setParam('if_n', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="if_nv">1,3771</span>
              </label>
              <span className="readout" id="if_out">
                P₁₂ = 48,3 D · f₁₂ = 20,6 mm
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
