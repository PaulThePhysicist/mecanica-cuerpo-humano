import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide8({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="8" data-module="3">
      <div className="module-header">
        <span className="mnum">7.3</span>
        <span className="mtitle">Continuidad y Bernoulli</span>
        <span className="msub">Lo que entra, sale · lo que gana en velocidad, paga en presión</span>
        <span className="mslide-count">8 / 23</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🔗</span> Ecuación de continuidad
            </div>
            <div className="card-body">
              <p>El flujo másico se conserva a lo largo de un tubo:</p>
              <div className="eq-block">
                {"\\[ \\rho_1 A_1 u_1 = \\rho_2 A_2 u_2 \\qquad \\text{(eq. 7.12)} \\]"}
              </div>
              <p>Para un fluido incompresible ({"\\(\\rho\\)"} constante), el caudal volumétrico se conserva:</p>
              <div className="eq-block">
                {"\\[ A_1 u_1 = A_2 u_2 = Q \\qquad \\text{(eq. 7.13)} \\]"}
              </div>
              <p>
                La sangre que entra en un estrechamiento <strong>debe</strong> acelerar. La suma de las áreas de los
                capilares es enorme: por eso la sangre se frena allí.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">⚡</span> Ecuación de Bernoulli
            </div>
            <div className="card-body">
              <p>En un flujo no viscoso y estacionario, la «presión dinámica» se conserva (eq. 7.14):</p>
              <div className="eq-block">
                {"\\[ P + \\frac{1}{2}\\rho u^2 + \\rho g h = \\text{constante} \\]"}
              </div>
              <p>
                Donde la velocidad sube, la <strong>presión baja</strong>: es el intercambio entre presión y velocidad que
                veremos en el Venturi y en las estenosis.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">💧</span> Torricelli
            </div>
            <div className="card-body">
              <p>Un orificio a profundidad {"\\(h\\)"} descarga a la velocidad de caída libre:</p>
              <div className="eq-block">
                {"\\[ u = \\sqrt{2gh} \\qquad \\text{(Torricelli)} \\]"}
              </div>
              <p>La sangre que sale de un vaso roto, o el agua de un tanque, sigue esta velocidad.</p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-8">
              Continuidad y Bernoulli son las dos caras del mismo flujo: la primera dice cuánta velocidad, la segunda qué
              presión le toca. En el canvas el tubo se estrecha: mira las partículas acelerarse y la línea de presión caer
              justo en la garganta del Venturi.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-venturi" />
            <div className="prof-controls">
              <span className="badge">Venturi</span>
              <label>
                u₁{' '}
                <input
                  type="range"
                  id="ve_u"
                  min="5"
                  max="80"
                  step="1"
                  defaultValue={params.ve_u}
                  onInput={(e) => {
                    engine.setParam('ve_u', parseFloat((e.target as HTMLInputElement).value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="ve_uv">30 cm/s</span>
              </label>
              <label>
                estrechamiento{' '}
                <input
                  type="range"
                  id="ve_a"
                  min="0.2"
                  max="1"
                  step="0.05"
                  defaultValue={params.ve_a}
                  onInput={(e) => {
                    engine.setParam('ve_a', parseFloat((e.target as HTMLInputElement).value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="ve_av">50 %</span>
              </label>
              <span className="readout" id="ve_out">
                u₂ = 60 cm/s
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
