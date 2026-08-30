import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide8({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="8" data-module="3">
      <div className="module-header">
        <span className="mnum">3.6</span>
        <span className="mtitle">Aceleración: el sprint</span>
        <span className="msub">Impulso y masa de la pierna</span>
        <span className="mslide-count">8 / 19</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">💨</span> Empujar para acelerar
            </div>
            <div className="card-body">
              <p>
                {"En la salida el corredor empuja contra el suelo con fuerza <span class=\"tag\">F</span> a lo largo de un recorrido <span class=\"tag\">L</span>. La masa que se acelera es la de la <strong>pierna</strong> (no todo el cuerpo), \\(m_{\\text{pierna}} = 0,161\\,m_b\\):"}
              </p>
              <div className="eq-block">
                {"\\[ v_f = \\sqrt{\\frac{2\\,F\\,L}{m_{\\text{pierna}}}} \\]"}
              </div>
              <p>
                {"Con \\(m_b = 70\\ \\text{kg}\\), \\(F = 560\\ \\text{N}\\) y \\(L = 1{,}0\\ \\text{m}\\):"}
              </p>
              <div className="eq-block">
                {"\\[ v_f = \\sqrt{\\frac{2(560)(1{,}0)}{0{,}161(70)}} \\approx 10\\ \\text{m/s} \\]"}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🏅</span> El récord mundial
            </div>
            <div className="card-body">
              <p>
                Usain Bolt corrió 100 m con promedio de ≈ <span className="tag">10,4 m/s</span> (23 mph). El modelo de la
                pierna da el orden de magnitud correcto: la aceleración no la hace el cuerpo entero, sino la pierna
                empujando contra el suelo.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-8">
              Pon F en el slider y pregunta: ¿cuánta fuerza necesitarías para superar a Bolt? La respuesta — &gt; 600 N por
              zancada — muestra por qué el sprint es sobre potencia, no sobre masa.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-sprint" className="sim" />
            <div className="prof-controls">
              <span className="badge">v = √(2FL/m)</span>
              <label>
                F{' '}
                <input
                  type="range"
                  id="sp_F"
                  min="200"
                  max="900"
                  defaultValue={params.sp_F}
                  onChange={(e) => {
                    engine.setParam('sp_F', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />
              </label>
              <label>
                m{' '}
                <input
                  type="range"
                  id="sp_m"
                  min="50"
                  max="100"
                  defaultValue={params.sp_m}
                  onChange={(e) => {
                    engine.setParam('sp_m', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />
              </label>
              <span className="readout" id="sp_out">
                v = 10,0 m/s
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
