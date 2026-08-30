import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide3({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="3" data-module="1">
      <div className="module-header">
        <span className="mnum">7.1</span>
        <span className="mtitle">El esfigmomanómetro y los sonidos de Korotkoff</span>
        <span className="msub">Medir la presión arterial con una columna y un estetoscopio</span>
        <span className="mslide-count">3 / 23</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">💪</span> El manguito y la columna de mercurio
            </div>
            <div className="card-body">
              <p>
                El <strong>esfigmomanómetro</strong> (Fig. 7.2) infla un manguito en el brazo por encima de la presión
                sistólica, ocluyendo la arteria braquial, y lo desinfla lentamente mientras se observa la columna de{' '}
                <span className="tag">mmHg</span>.
              </p>
              <div className="eq-block">
                {"\\[ P_{\\text{columna}} = \\rho_{\\text{Hg}} g h \\qquad \\text{lee la presión de la sangre} \\]"}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🩺</span> Los sonidos de Korotkoff
            </div>
            <div className="card-body">
              <p>
                Cuando la presión del manguito cae por debajo de la sistólica, la sangre vuelve a pasar en cada latido y se
                oyen <strong>golpes rítmicos</strong> con el estetoscopio. El <span className="tag">primer sonido</span>{' '}
                marca la <strong>sistólica</strong>; el <span className="tag">último sonido</span>, la{' '}
                <strong>diastólica</strong>.
              </p>
              <p>
                La presión arterial varía a lo largo del ciclo: <span className="tag">≈ 120 sistólica / 80 diastólica</span>{' '}
                (Fig. 7.3).
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🎵</span> Física del sonido
            </div>
            <div className="card-body">
              <p>
                El flujo a través de un vaso parcialmente ocluido se vuelve <strong>turbulento</strong> (módulo 3): las
                fluctuaciones de presión vibran las paredes y generan el sonido. No hay sonido cuando el flujo es suave — por
                eso desaparecen al pasar la diastólica.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-3">
              Pregunta clásica de examen: «¿por qué se oye un golpe y no un silbido?». La turbulencia en un vaso parcialmente
              ocluido genera vibraciones de pared: el primer golpe = la sangre «vence» al manguito. Baja la presión del
              manguito en el canvas y escucha el proceso: golpe → flujo suave.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-bp" />
            <div className="prof-controls">
              <span className="badge">esfigmo</span>
              <label>
                manguito{' '}
                <input
                  type="range"
                  id="bp_p"
                  min="0"
                  max="160"
                  step="1"
                  defaultValue={params.bp_p}
                  onInput={(e) => {
                    engine.setParam('bp_p', parseFloat((e.target as HTMLInputElement).value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="bp_pv">160 mmHg</span>
              </label>
              <span className="readout" id="bp_out">
                sistólica 120 · diastólica 80
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
