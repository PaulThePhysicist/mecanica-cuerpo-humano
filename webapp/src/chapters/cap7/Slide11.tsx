import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide11({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="11" data-module="4">
      <div className="module-header">
        <span className="mnum">7.3</span>
        <span className="mtitle">La ley de Poiseuille</span>
        <span className="msub">El caudal depende de la cuarta potencia del radio</span>
        <span className="mslide-count">11 / 23</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🛤️</span> El caudal y la caída de presión
            </div>
            <div className="card-body">
              <p>Para flujo laminar estacionario en un tubo (eq. 7.24–7.26):</p>
              <div className="eq-block">
                {"\\[ Q = \\frac{\\pi R^4 (P_1 - P_2)}{8 \\eta L} \\qquad \\Delta P = \\frac{8 \\eta L Q}{\\pi R^4} \\]"}
              </div>
              <div className="eq-block">
                {"\\[ \\text{Potencia} = \\Delta P \\cdot Q \\]"}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🥟</span> Perfil parabólico de velocidad
            </div>
            <div className="card-body">
              <p>La velocidad varía con el radio (eq. 7.36, 7.39–7.40):</p>
              <div className="eq-block">
                {
                  "\\[ v(r) = \\frac{\\Delta P}{4 \\eta L}\\left(R^2 - r^2\\right) = 2u\\left(1 - \\frac{r^2}{R^2}\\right) \\]"
                }
              </div>
              <div className="eq-block">
                {"\\[ u = \\frac{R^2 \\Delta P}{8 \\eta L} \\qquad \\text{(velocidad media)} \\]"}
              </div>
              <p>Máxima en el eje, cero en la pared: la «bala» parabólica de la sangre.</p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">📉</span> Por qué manda el radio
            </div>
            <div className="card-body">
              <p>
                El radio entra a la <strong>cuarta potencia</strong>: reducir {"\\(R\\)"} a la mitad multiplica la
                resistencia por 16 y hunde el caudal a 1/16. Por eso el cuerpo regula el flujo con{' '}
                <span className="highlight">vasodilatación y vasoconstricción</span>, no cambiando la viscosidad.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-11">
              La R⁴ es la ecuación más poderosa de la hemodinámica: el 1 % de diámetro de más puede cambiar el flujo varios
              por cien. En el canvas sube R y observa el perfil parabólico ensancharse y el caudal dispararse — es la base de
              por qué las arterias pequeñas dominan la resistencia total.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-poiseuille" />
            <div className="prof-controls">
              <span className="badge">Poiseuille</span>
              <label>
                R{' '}
                <input
                  type="range"
                  id="po_r"
                  min="0.5"
                  max="5"
                  step="0.1"
                  defaultValue={params.po_r}
                  onInput={(e) => {
                    engine.setParam('po_r', parseFloat((e.target as HTMLInputElement).value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="po_rv">2,0</span>
              </label>
              <label>
                η{' '}
                <input
                  type="range"
                  id="po_e"
                  min="0.001"
                  max="0.006"
                  step="0.0005"
                  defaultValue={params.po_e}
                  onInput={(e) => {
                    engine.setParam('po_e', parseFloat((e.target as HTMLInputElement).value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="po_ev">0,004</span>
              </label>
              <label>
                ΔP{' '}
                <input
                  type="range"
                  id="po_p"
                  min="10"
                  max="120"
                  step="5"
                  defaultValue={params.po_p}
                  onInput={(e) => {
                    engine.setParam('po_p', parseFloat((e.target as HTMLInputElement).value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="po_pv">60</span>
              </label>
              <span className="readout" id="po_out">
                Q ∝ R⁴
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
