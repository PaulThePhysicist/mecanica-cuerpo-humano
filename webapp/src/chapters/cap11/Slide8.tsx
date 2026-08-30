import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide8({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="8" data-module="3">
      <div className="module-header">
        <span className="mnum">11 · 2</span>
        <span className="mtitle">Efectividad y sistemas compuestos</span>
        <span className="msub">{"\\(P' = P/(1 + DP/n)\\)"}</span>
        <span className="mslide-count">8 / 24</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">📏</span> La efectividad depende de dónde está la lente
            </div>
            <div className="card-body">
              <p>
                {"Una lente de potencia \\(P\\) a distancia \\(D\\) del plano que debe corregir cambia su efectividad:"}
              </p>
              <div className="eq-block">
                <span className="eqno">(11.20)</span>
                {"\\[ P' = \\frac{P}{1 + DP/n} \\]"}
              </div>
              <p>
                Por eso un <strong>anteojo a 1,5 cm</strong> de la córnea no equivale a un <strong>contacto</strong>: la
                misma receta da potencias distintas según la distancia al ojo.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🧮</span> Combinar potencias
            </div>
            <div className="card-body">
              <p>
                {"Un sistema de superficies/lentes en serie suma potencias (con la focal en el medio \\(n_j\\)):"}
              </p>
              <div className="eq-block">
                <span className="eqno">(11.21)</span>
                {"\\[ f = \\frac{n_j}{\\sum_i P_i} \\]"}
              </div>
              <p>
                {"Y para dos lentes delgadas separadas una distancia \\(t\\) en un medio \\(n_2\\):"}
              </p>
              <div className="eq-block">
                <span className="eqno">(11.30)</span>
                {"\\[ P_\\mathrm{eff} = P_a + P_b - \\frac{t}{n_2}P_aP_b \\]"}
              </div>
              <p>El ojo esquemático es exactamente eso: cuatro superficies separadas que suman su efecto.</p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-8">
              Separa las dos lentes: el término −(t/n)P_aP_b resta poder al sistema. Es la clave de por qué la
              corrección con gafas (lente lejos de la córnea) y con contacto (lente pegada) difieren unos décimos de
              dioptría.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-effect" className="sim" />
            <div className="prof-controls">
              <span className="badge">sistema</span>
              <label>
                Separación t{' '}
                <input
                  type="range"
                  id="ef_t"
                  min="0"
                  max="60"
                  defaultValue={params.ef_t}
                  step="1"
                  onChange={(e) => {
                    engine.setParam('ef_t', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="ef_tv">15 mm</span>
              </label>
              <label>
                P_b{' '}
                <input
                  type="range"
                  id="ef_P"
                  min="-10"
                  max="10"
                  defaultValue={params.ef_P}
                  step="0.5"
                  onChange={(e) => {
                    engine.setParam('ef_P', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="ef_Pv">+5,0 D</span>
              </label>
              <span className="readout" id="ef_out">
                P_eff = 20,2 D (P_a = 15 D)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
