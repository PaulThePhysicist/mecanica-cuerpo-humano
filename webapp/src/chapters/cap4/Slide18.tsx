import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide18({ engine }: { engine: Engine }) {
  const flags = engine.flagsRef.current;

  return (
    <div className="slide active" data-slide="18" data-module="8">
      <div className="module-header">
        <span className="mnum">4.8</span>
        <span className="mtitle">Lesiones deportivas comunes</span>
        <span className="msub">54 % de las lesiones son en las piernas</span>
        <span className="mslide-count">18 / 21</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">📊</span> ¿Dónde ocurren?
            </div>
            <div className="card-body">
              <p>
                En 15 deportes universitarios, las lesiones en juegos y entrenamientos se reparten:{' '}
                <span className="tag">piernas ≈ 54 %</span> · <span className="tag">brazos ≈ 18 %</span> ·{' '}
                <span className="tag">tronco y espalda ≈ 13 %</span> · <span className="tag">cabeza y cuello ≈ 10 %</span>.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">📈</span> Tasa por 1.000 exposiciones
            </div>
            <div className="card-body">
              <p>
                LCA ≈ <span className="tag">0,15</span> · conmociones ≈ <span className="tag">0,35</span> · esguince de
                tobillo ≈ <span className="tag">0,8</span>. En juegos, hombres: fútbol americano <span className="tag">~36</span>
                , lucha <span className="tag">~26</span>, béisbol <span className="tag">~6</span>; mujeres: fútbol{' '}
                <span className="tag">~16</span>, sóftbol <span className="tag">~4</span>.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🦴</span> Por qué (física, no mala suerte)
            </div>
            <div className="card-body">
              <p>
                El <strong>LCA</strong> se lesiona por torsión de rodilla (cortadura sin margen); el <strong>Aquiles</strong>{' '}
                (σ = 53 % del UTS) con sprints; las <strong>fracturas por estrés</strong> por fatiga (microgrietas
                acumuladas). Las lesiones son superar el UTS o acumular microdaños — prevenibles con fuerza (sube UTS) y
                técnica.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-18">
              La física da la escala: no hay "lesión por mala suerte". El tobillo (0,8) se lesiona 5× más que el LCA (0,15)
              porque trabaja al límite en cada cambio de dirección. Pulsa ▶ para ver las barras crecer.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-injury" className="sim" />
            <div className="prof-controls">
              <span className="badge">% de lesiones</span>
              <button
                type="button"
                id="inj_play"
                onClick={() => {
                  const next = !flags.injPlaying;
                  engine.setFlag('injPlaying', next);
                  if (next) engine.setFlag('injT', 0);
                  const b = document.getElementById('inj_play');
                  if (b) b.textContent = next ? '⏸' : '▶';
                }}
              >
                {flags.injPlaying ? '⏸' : '▶'}
              </button>
              <span className="readout" id="inj_out">
                piernas 54 %
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
