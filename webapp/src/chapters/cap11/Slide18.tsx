import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide18({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;
  const flags = engine.flagsRef.current;

  const toggleFlicker = () => {
    const nextState = !flags.ciPlaying;
    engine.setFlag('ciPlaying', nextState);
    engine.setFlag('ciT', 0);
    const b = document.getElementById('ci_play');
    if (b) b.textContent = nextState ? '⏸' : '▶';
    engine.requestDraw();
  };

  return (
    <div className="slide active" data-slide="18" data-module="7">
      <div className="module-header">
        <span className="mnum">11 · 5</span>
        <span className="mtitle">El color: conos, metameria y CIE</span>
        <span className="msub">{"\\(\\mathrm{RGB:}\\ 645/526/444\\ \\mathrm{nm}\\quad \\mathrm{CFF} \\le 60\\ \\mathrm{Hz}\\)"}</span>
        <span className="mslide-count">18 / 24</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🎨</span> Tres conos y la metameria
            </div>
            <div className="card-body">
              <p>
                El color nace de la <strong>proporción de activación de los tres conos</strong> (S · 445 nm, M · 535 nm,
                L · 570 nm). Dos luces de espectro distinto que activen los conos igual se ven iguales:{' '}
                <strong>coincidencias metaméricas</strong>. Las pantallas explotan esto con{' '}
                <span className="tag">primarios RGB: 645 / 526 / 444 nm</span>.
              </p>
              <div className="eq-block">
                {"\\[ \\text{color} = \\int_\\lambda L(\\lambda)\\,c(\\lambda)\\,d\\lambda,\\quad c \\in \\{S,M,L\\} \\]"}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">📈</span> El sistema CIE 1931
            </div>
            <div className="card-body">
              <p>
                {"La CIE normaliza el color con tres funciones \\(X, Y, Z\\). La "}<strong>cromaticidad</strong>{' '}
                {"\\((x, y)\\)"} se proyecta en el diagrama en herradura (con {'\\(z = 1-x-y\\)'}); el blanco está en
                el centro. La <strong>frecuencia crítica de fusión</strong> (CFF) —cuando el parpadeo se funde— supera{' '}
                <span className="tag">60 Hz</span> en la fóvea; baja a ~20 Hz en la periferia y ~10 Hz con luz tenue.
              </p>
              <div className="eq-block">
                {"\\[ x = \\frac{X}{X+Y+Z},\\qquad y = \\frac{Y}{X+Y+Z},\\qquad z = 1-x-y \\]"}
              </div>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-18">
              Desliza la longitud de onda: el punto viaja por el borde espectral del diagrama CIE. ▶ activa el parpadeo:
              sube la frecuencia y el punto se funde en un color constante (CFF).
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-cie" className="sim" />
            <div className="prof-controls">
              <span className="badge">CIE</span>
              <button id="ci_play" type="button" onClick={toggleFlicker}>
                {flags.ciPlaying ? '⏸' : '▶'}
              </button>
              <label>
                λ{' '}
                <input
                  type="range"
                  id="ci_lam"
                  min="380"
                  max="700"
                  defaultValue={params.ci_lam}
                  step="1"
                  onChange={(e) => {
                    engine.setParam('ci_lam', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="ci_lamv">555 nm</span>
              </label>
              <span className="readout" id="ci_out">
                555 nm · x ≈ 0,33 · y ≈ 0,66
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
