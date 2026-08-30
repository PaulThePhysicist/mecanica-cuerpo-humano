import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide16({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;
  const flags = engine.flagsRef.current;

  return (
    <div className="slide active" data-slide="16" data-module="6">
      <div className="module-header">
        <span className="mnum">6.5</span>
        <span className="mtitle">¿Cómo «quemar» la comida? Peso corporal</span>
        <span className="msub">La dona estándar como moneda</span>
        <span className="mslide-count">16 / 23</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🍩</span> Quemar la dona de 280 kcal
            </div>
            <div className="card-body">
              <p>
                Sentado se queman ≈ <span className="tag">103 kcal/h</span>. Jugando al baloncesto, ≈ <span className="tag">688 kcal/h</span>{' '}
                → el exceso es 585 kcal/h:
              </p>
              <div className="eq-block">
                {"\\[ \\frac{280\\ \\text{kcal}}{585\\ \\text{kcal/h}} = 0{,}48\\ \\text{h} = 29\\ \\text{min} \\qquad \\text{(eq. 6.33)} \\]"}
              </div>
              <p>Caminando (228 kcal/h, exceso 125):</p>
              <div className="eq-block">
                {"\\[ \\frac{280}{125} = 2{,}24\\ \\text{h} = 2\\ \\text{h}\\ 14\\ \\text{min} \\qquad \\text{(eq. 6.34)} \\]"}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">⚖️</span> Regla de Wishnofsky
            </div>
            <div className="card-body">
              <p>
                Cambiar la ingesta metabólica en <span className="tag">3500 kcal</span> ≈ ganar o perder <span className="tag">1 libra</span>{' '}
                (≈ ¾ grasa + ¼ músculo). Un déficit de 1000 kcal/día → ≈{' '}
                <span className="tag">110 g de grasa/día ≈ 2 lb/semana</span> — el límite práctico de cualquier dieta.
              </p>
              <p>
                El contenido energético real del cambio de peso varía con sexo y edad (hombres ≈ 2480 kcal/lb; mujeres ≈ 3380).
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🚰</span> El engaño de las dietas rápidas
            </div>
            <div className="card-body">
              <p>
                Los primeros días se quema <strong>glucógeno</strong> y su agua asociada: 1000 kcal ≈ 1 kg de pérdida total (≈ 1 kcal por
                gramo perdido). Al pasar a oxidar grasa, el mismo déficit pierde solo 110 g — de ahí la <strong>meseta</strong> que
                desanima a quienes hacen dieta.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-16">
              El consejo de Micawber: ingreso 2000, gasto 2100 → felicidad; ingreso 2000, gasto 1900 → miseria. El canvas muestra
              cuánto tiempo cuesta cada actividad «pagar» la dona: baloncesto 29 min, caminata 2 h 14 min.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-burn" className="sim" />
            <div className="prof-controls">
              <span className="badge">quemar 280 kcal</span>
              <label>
                actividad{' '}
                <select
                  id="bn_act"
                  defaultValue={params.bn_act}
                  onChange={(e) => {
                    engine.setParam('bn_act', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                >
                  <option value="103">Sentado · 103 kcal/h</option>
                  <option value="228">Caminar 5 km/h · 228</option>
                  <option value="344">Ciclismo 15 km/h · 344</option>
                  <option value="400">Natación moderada · 400</option>
                  <option value="500">Fútbol · 500</option>
                  <option value="688">Baloncesto · 688</option>
                </select>
              </label>
              <button
                type="button"
                id="bn_play"
                onClick={() => {
                  const nextPlaying = !flags.bnPlaying;
                  engine.setFlag('bnPlaying', nextPlaying);
                  if (nextPlaying) flags.bnT = 0;
                  engine.requestDraw();
                }}
              >
                {flags.bnPlaying ? '⏸' : '▶'}
              </button>
              <span className="readout" id="bn_out">
                baloncesto: 29 min
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
