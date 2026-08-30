import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide4({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="4" data-module="2">
      <div className="module-header">
        <span className="mnum">3.3</span>
        <span className="mtitle">Fricción: sin ella no caminamos</span>
        <span className="msub">El coeficiente mínimo para caminar</span>
        <span className="mslide-count">4 / 19</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">👟</span> La fuerza horizontal sale de la fricción
            </div>
            <div className="card-body">
              <p>
                Para avanzar, el pie empuja el piso hacia atrás; el piso empuja al cuerpo hacia adelante. Esa fuerza
                horizontal es <strong>fricción estática</strong>, limitada por:
              </p>
              <div className="eq-block">
                {"\\[ F_{\\text{horiz}} \\le \\mu_s W_b \\]"}
              </div>
              <p>
                Caminar a 3 mph requiere un coeficiente <span className="tag">μ<sub>s</sub> ≥ 0,15</span>; en la
                práctica el zapato–piso entrega ≈ <span className="tag">0,17</span>. Sobre hielo (μ ≈ 0,05) resbalamos:
                no hay fricción para empujar.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🧴</span> Las articulaciones sí son resbalosas
            </div>
            <div className="card-body">
              <p>
                El cartílago lubricado por líquido sinovial tiene <span className="tag">μ ≈ 0,005–0,02</span> — entre 10 y
                30 veces menor que el zapato sobre el piso. Por eso las articulaciones no se desgastan al moverte: la
                fricción interna es casi despreciable.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-4">
              Baja μ en el canvas hasta que el pie patine: el umbral 0,15 es el número del libro (tabla 3.5). Pregunta: ¿por
              qué caminamos rápido sobre hielo con pasos cortos y rápidos?
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-friccion" className="sim" />
            <div className="prof-controls">
              <span className="badge">μ zapato–piso</span>
              <label>
                μ{' '}
                <input
                  type="range"
                  id="fr_mu"
                  min="0.02"
                  max="0.4"
                  step="0.01"
                  defaultValue={params.fr_mu}
                  onChange={(e) => {
                    engine.setParam('fr_mu', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />
              </label>
              <span className="readout" id="fr_out">
                μ = 0,17 ✓
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
