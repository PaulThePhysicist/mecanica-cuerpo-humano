import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide20({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;
  const flags = engine.flagsRef.current;

  return (
    <div className="slide active" data-slide="20" data-module="8">
      <div className="module-header">
        <span className="mnum">4.10</span>
        <span className="mtitle">Propiedades mecánicas de los alimentos</span>
        <span className="msub">{"Duros (ER)^½ · tenaces (R/E)^½"}</span>
        <span className="mslide-count">20 / 21</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🍎</span> Alimentos duros: limitados por fuerza
            </div>
            <div className="card-body">
              <p>
                Manzanas y galletas: {"\\(Y\\)"} grande, curva <strong>cóncava hacia abajo</strong> (en forma de r). Se
                agrietan por <strong>esfuerzo</strong> alto; el parámetro es {"\\((ER)^\\frac12\\)"}. Los{' '}
                <strong>incisivos</strong> crean ese esfuerzo y abren la grieta sin moverla.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🥩</span> Alimentos tenaces: limitados por desplazamiento
            </div>
            <div className="card-body">
              <p>
                Carne y espinacas: alta tenacidad {"\\(R\\)"} (colágeno o celulosa), curva en <strong>forma de J</strong>{' '}
                cóncava hacia arriba, parámetro {"\\((R/E)^\\frac12\\)"}. El <strong>molar</strong> debe seguir
                desplazando la grieta con movimiento lateral.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🍳</span> Cocinar es ingeniería de materiales
            </div>
            <div className="card-body">
              <p>
                Hervir una patata baja su tenacidad de <span className="tag">225 → 38 J/m²</span> (10 min); asar la carne{' '}
                <strong>sube {"\\(Y\\)"}</strong> y la grieta se propaga mejor. La zanahoria cruda "cruje" por{' '}
                <strong>mini estallidos sónicos</strong>: grietas que superan la velocidad del sonido porque la energía
                liberada supera la tenacidad.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-20">
              Cierre del capítulo: dientes = herramientas adaptadas al material. Incisivos → esfuerzo (duros); molares →
              desplazamiento (tenaces). Misma física que los cascos: convertir la energía en grietas controladas.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-food" className="sim" />
            <div className="prof-controls">
              <span className="badge">σ–ε del alimento</span>
              <label>
                alimento{' '}
                <select
                  id="fo_mode"
                  defaultValue={flags.fo_mode}
                  onChange={(e) => {
                    engine.setFlag('fo_mode', e.target.value as any);
                    engine.requestDraw();
                  }}
                >
                  <option value="dura">Duro (r)</option>
                  <option value="tenaz">Tenaz (J)</option>
                </select>
              </label>
              <label>
                mordida{' '}
                <input
                  type="range"
                  id="fo_e"
                  min="5"
                  max="95"
                  step="1"
                  defaultValue={params.fo_e}
                  onChange={(e) => {
                    engine.setParam('fo_e', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />
              </label>
              <span className="readout" id="fo_out">
                limitado por fuerza (ER)^½
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
