import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide13({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="13" data-module="6">
      <div className="module-header">
        <span className="mnum">5.7</span>
        <span className="mtitle">El sistema combinado músculo-tendón</span>
        <span className="msub">Lo que importa no es el músculo solo, sino el conjunto</span>
        <span className="mslide-count">13 / 21</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🔗</span> Fuerza sostenida
            </div>
            <div className="card-body">
              <p>
                La fuerza se puede sostener cuando la longitud de la fibra excede ≈ <span className="tag">0,7 L₀</span>,
                lo que ocurre cuando la longitud total del sistema supera <span className="tag">L_T,s + 0,7 L₀</span> (
                {"\\(L_{\\text{T,s}}\\)"} = longitud libre o relajada del tendón). Vale para músculos fusiformes y
                paralelos.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">⚖️</span> La relación L_T,s / L₀
            </div>
            <div className="card-body">
              <p>
                <strong>Grande (~10):</strong> sistema flexible (complaciente), el tendón domina las curvas de
                fuerza-longitud. <strong>Pequeña (~1):</strong> sistema rígido, efecto pequeño.
              </p>
              <div className="row">
                <span className="pill">Sóleo ≈ 11</span>
                <span className="pill">Gastrocnemio ≈ 9</span>
                <span className="pill">Vastos ≈ 3</span>
                <span className="pill">Recto femoral ≈ 5</span>
                <span className="pill">Semitendinoso ≈ 2</span>
                <span className="pill">Cadera uniarticular ≈ 0,2</span>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">📈</span> Efecto en la curva fuerza-longitud
            </div>
            <div className="card-body">
              <p>
                Con un tendón <strong>rígido</strong> ({"\\(L_{\\text{T,s}}/L_0 = 3\\)"}) la curva se estira poco. Con un
                tendón <strong>flexible</strong> ({"\\(= 15\\)"}) la región ascendente se hace mucho más larga y el
                máximo del músculo ocurre cerca de <span className="highlight">1,5 L₀</span>: en el pico de fuerza los
                tendones se estiran una fracción considerable de L₀.
              </p>
              <p>
                La relación también limita la velocidad: valores grandes (sóleo) → manda la dinámica músculo-tendón;
                valores pequeños (cadera) → manda la activación; intermedios (recto femoral) → ambos.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-13">
              Esto es lo que «sienten» los tendones en cirugías de trasplante: medir las propiedades del conjunto, no del
              músculo aislado. Mueve la relación L_T,s/L₀ en el canvas y observa cómo el tendón flexible «aplasta» el
              máximo activo hacia la derecha.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-tendon" />
            <div className="prof-controls">
              <span className="badge">músculo+tendón</span>
              <label>
                L_T,s / L₀{' '}
                <input
                  type="range"
                  id="td_ratio"
                  min="0.5"
                  max="15"
                  step="0.1"
                  defaultValue={params.td_ratio}
                  onChange={(e) => {
                    engine.setParam('td_ratio', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="td_ratiov">{params.td_ratio}</span>
              </label>
              <span className="readout" id="td_out">
                tendón rígido · curva casi intacta
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
