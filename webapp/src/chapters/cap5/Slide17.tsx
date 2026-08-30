import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide17({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="17" data-module="7">
      <div className="module-header">
        <span className="mnum">5.9</span>
        <span className="mtitle">Titina: el tercer filamento</span>
        <span className="msub">El resorte molecular del sarcómero</span>
        <span className="mslide-count">17 / 21</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🧵</span> Estructura
            </div>
            <div className="card-body">
              <p>
                La titina es una proteína de ≈ <span className="tag">1 μm</span> que se extiende del{' '}
                <strong>disco Z</strong>, atraviesa la banda I como un resorte y se une al{' '}
                <strong>filamento grueso</strong> hasta la banda M. Es el tercer filamento del sarcómero.
              </p>
              <p>
                En la región I (totalmente extensible) tiene un dominio <strong>PEVK</strong> (prolina, glutamato,
                valina, lisina) flanqueado por ≈ <span className="tag">100 dominios Ig</span> plegados (proximal y
                distal).
              </p>
              <p>
                Isoformas: <span className="tag">N2A</span> (esquelético), <span className="tag">N2B y N2BA</span>{' '}
                (cardíaco, más largas y flexibles).
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🔄</span> Comportamiento mecánico
            </div>
            <div className="card-body">
              <p>
                Bajo tensión fisiológica, la titina primero <strong>endereza los enlaces interdominio</strong> (Ig) y, a
                fuerzas mayores, <strong>elonga los segmentos N2A/N2B y PEVK</strong>. Solo muy por encima del rango
                fisiológico se <strong>despliegan los dominios Ig</strong> — posible mecanismo para prevenir el daño
                muscular a fuerzas altas.
              </p>
              <p>
                Despliegue: <span className="tag">3,3×10⁻³/s</span> · repliegue: <span className="tag">0,3/s</span>.
                Isoformas más cortas → músculos más rígidos (más tensión pasiva); más largas → más flexibles. La titina
                puede servir de <strong>regla molecular</strong> de la longitud del sarcómero.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-17">
              La titina es la razón de las rigideces pasivas tan distintas entre músculos. Estira el sarcómero en el
              canvas: primero se enderezan los dominios Ig, luego PEVK; solo en el extremo se despliegan los Ig. Ese
              «despliegue de seguridad» protege al músculo del daño.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-titina" />
            <div className="prof-controls">
              <span className="badge">sarcómero</span>
              <label>
                L. sarcómero{' '}
                <input
                  type="range"
                  id="ti_l"
                  min="1.6"
                  max="3.6"
                  step="0.05"
                  defaultValue={params.ti_l}
                  onChange={(e) => {
                    engine.setParam('ti_l', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="ti_lv">{params.ti_l} μm</span>
              </label>
              <span className="readout" id="ti_out">
                titin: Ig enderezados · PEVK intacto
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
