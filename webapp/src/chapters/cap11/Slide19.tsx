import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide19({ engine }: { engine: Engine }) {
  const flags = engine.flagsRef.current;

  const toggleAdaptation = () => {
    const nextState = !flags.adPlaying;
    engine.setFlag('adPlaying', nextState);
    engine.setFlag('adT', 0);
    const b = document.getElementById('ad_play');
    if (b) b.textContent = nextState ? '⏸' : '▶';
    engine.requestDraw();
  };

  return (
    <div className="slide active" data-slide="19" data-module="7">
      <div className="module-header">
        <span className="mnum">11 · 5</span>
        <span className="mtitle">Adaptación a la oscuridad</span>
        <span className="msub">{"\\(p(t) = p_i + (p_\\mathrm{max}-p_i)\\,(1-e^{-t/\\tau})\\)"}</span>
        <span className="mslide-count">19 / 24</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🌑</span> La regeneración del fotopigmento
            </div>
            <div className="card-body">
              <p>
                {"La fracción \\(p\\) de pigmento disponible evoluciona con la luz \\(I\\) (blanqueo) y se regenera:"}
              </p>
              <div className="eq-block">
                <span className="eqno">(11.65)</span>
                {"\\[ \\frac{dp}{dt} = -\\frac{I\\,p}{Q} + \\frac{1-p}{\\tau} \\]"}
              </div>
              <p>En estado estacionario y en recuperación (11.66–11.67):</p>
              <div className="eq-block">
                <span className="eqno">(11.67)</span>
                {"\\[ p(t) = p_i + (p_\\mathrm{max} - p_i)\\,\\big(1-e^{-t/\\tau}\\big) \\]"}
              </div>
              <p>
                Constantes de tiempo: <span className="tag">τ ≈ 2 min (conos)</span>{' '}
                <span className="tag">τ ≈ 6 min (bastones)</span>; la adaptación completa tarda ~30 min.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🌃</span> El rango dinámico (Tabla 11.5)
            </div>
            <div className="card-body">
              <table className="data-mini">
                <thead>
                  <tr>
                    <th>Escena</th>
                    <th>Iluminancia</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Sol de mediodía</td>
                    <td>10⁵ lux</td>
                  </tr>
                  <tr>
                    <td>Día nublado</td>
                    <td>10³ lux</td>
                  </tr>
                  <tr>
                    <td>Lectura / tarea fina</td>
                    <td>30–1 000 lux</td>
                  </tr>
                  <tr>
                    <td>Transición foto/escotópica</td>
                    <td>≈ 1 lux</td>
                  </tr>
                  <tr>
                    <td>Luna llena</td>
                    <td>0,2 lux</td>
                  </tr>
                  <tr>
                    <td>Estrellas / noche nublada</td>
                    <td>10⁻³–10⁻⁴ lux</td>
                  </tr>
                  <tr className="table-caption">
                    <td colSpan={2}>
                      El ojo adaptado ve ~10⁻⁹ lux ≈ 30 fotones/s (fotón 600 nm ≈ 3×10⁻¹⁹ J).
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-19">
              ▶ sigue la recuperación del pigmento en el tiempo: la rama rápida (conos, ~2 min) gana ~50×; la lenta
              (bastones, ~20 min) llega a ~1 000×. Por eso al entrar a un cine «no vemos nada» al principio.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-adapt" className="sim" />
            <div className="prof-controls">
              <span className="badge">adaptación</span>
              <button id="ad_play" type="button" onClick={toggleAdaptation}>
                {flags.adPlaying ? '⏸' : '▶'}
              </button>
              <span className="readout" id="ad_out">
                t = 0 min · sensibilidad 1×
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
