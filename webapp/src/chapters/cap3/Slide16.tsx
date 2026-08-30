import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide16({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  const setColPreset = (type: 'head' | 'jump' | 'car') => {
    const sets = {
      head: { v: 1, dx: 0.005, m: 3 },
      jump: { v: 4.43, dx: 0.01, m: 70 },
      car: { v: 16.7, dx: 0.3, m: 70 },
    };
    const s = sets[type];
    if (!s) return;
    engine.setParam('co_v', s.v);
    engine.setParam('co_dx', s.dx);
    engine.setParam('co_m', s.m);
    engine.requestDraw();
  };

  return (
    <div className="slide active" data-slide="16" data-module="7">
      <div className="module-header">
        <span className="mnum">3.11</span>
        <span className="mtitle">Colisiones: desacelerar es el peligro</span>
        <span className="msub">a = v²/2Δx y el factor G</span>
        <span className="mslide-count">16 / 19</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">💥</span> Frenar en corto espacio
            </div>
            <div className="card-body">
              <p>
                {"En una colisión, el cuerpo pasa de \\(v\\) a 0 en una distancia \\(\\Delta x\\). La desaceleración media:"}
              </p>
              <div className="eq-block">
                {"\\[ a = \\frac{v^2}{2\\,\\Delta x},\\qquad G = \\frac{a}{g} \\]"}
              </div>
              <p>
                Cabeza de 3 kg a 1 m/s que frena en 10 ms (5 mm): ≈ <span className="tag">10 g</span>, fuerza ≈{' '}
                <span className="tag">300 N</span>.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🦴</span> Cuándo se fractura el hueso
            </div>
            <div className="card-body">
              <p>
                {"Saltar de 1 m y caer con la planta del pie: \\(\\Delta x \\approx 1\\ \\text{cm}\\) → ≈ "}<span className="tag">100 g</span>{", fuerza ≈ \\(7 \\times 10^4\\ \\text{N}\\). La tibia soporta ≈ 230 N/mm² — <strong>por encima</strong> de la resistencia última del hueso (170 MPa) → fractura."}
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🧮</span> Supervivencia
            </div>
            <div className="card-body">
              <p>
                {"La <strong>GSI</strong> (índice de severidad de Gadd) integra la aceleración: \\(\\text{GSI} = \\int (a/g)^{2.5}\\,dt\\). Valores ≈ "}<span className="tag">1000</span>{" son ~50 % fatales; la tolerancia humana va de 175 a 200 g."}
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-16">
              La distancia de frenado es la única variable que controlamos: los airbags y cascos <em>aumentan Δx</em> y
              bajan G. En el canvas, duplica Δx y observa cómo cae la desaceleración a la mitad.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-collision" className="sim" />
            <div className="prof-controls">
              <span className="badge">G = v²/2gΔx</span>
              <button onClick={() => setColPreset('head')}>🧠 Cabeza</button>
              <button onClick={() => setColPreset('jump')}>🦘 Salto 1 m</button>
              <button onClick={() => setColPreset('car')}>🚗 Coche</button>
              <label>
                v{' '}
                <input
                  type="range"
                  id="co_v"
                  min="1"
                  max="20"
                  step="0.01"
                  defaultValue={params.co_v}
                  onChange={(e) => {
                    engine.setParam('co_v', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />
              </label>
              <label>
                Δx{' '}
                <input
                  type="range"
                  id="co_dx"
                  min="0.001"
                  max="0.5"
                  step="0.001"
                  defaultValue={params.co_dx}
                  onChange={(e) => {
                    engine.setParam('co_dx', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />
              </label>
              <label>
                m{' '}
                <input
                  type="range"
                  id="co_m"
                  min="1"
                  max="90"
                  step="1"
                  defaultValue={params.co_m}
                  onChange={(e) => {
                    engine.setParam('co_m', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />
              </label>
              <span className="readout" id="co_out">
                G = 98 g
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
