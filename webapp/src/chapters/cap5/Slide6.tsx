import React, { useState } from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide6({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;
  const flags = engine.flagsRef.current;
  const [isPlaying, setIsPlaying] = useState(flags.acPlaying);

  const togglePlay = () => {
    flags.acPlaying = !flags.acPlaying;
    if (flags.acPlaying) flags.acT = 0;
    setIsPlaying(flags.acPlaying);
    engine.requestDraw();
  };

  return (
    <div className="slide active" data-slide="6" data-module="3">
      <div className="module-header">
        <span className="mnum">5.3</span>
        <span className="mtitle">El modelo mecánico del músculo activo</span>
        <span className="msub">Resortes, amortiguador y generador de tensión</span>
        <span className="mslide-count">6 / 21</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🧩</span> De la viscoelasticidad del Cap. 4
            </div>
            <div className="card-body">
              <p>
                Usamos los mismos modelos <strong>resorte–amortiguador</strong> del Cap. 4, añadiendo un{' '}
                <strong>generador de tensión</strong> {"\\(T_{\\text{G}}(x,t)\\)"} para el estado activo.
              </p>
              <p>
                El modelo completo (Fig. 5.13): {"\\(T_{\\text{G}}\\)"} en paralelo con amortiguador {"\\(c\\)"} y
                resorte {"\\(k_{\\text{parallel}}\\)"}, todo en serie con {"\\(k_{\\text{series}}\\)"}. Es
                matemáticamente equivalente al modelo de la Fig. 5.14b y casi idéntico al de Kelvin, salvo que el
                amortiguador está en paralelo con el generador.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">⚙️</span> El modelo simple · isométrico
            </div>
            <div className="card-body">
              <p>
                Solo el resorte {"\\(k\\)"} en serie con {"\\([T_{\\text{G}} \\parallel c]\\)"} (Fig. 5.15). Sin
                generador se reduce a Maxwell. En condiciones <strong>isométricas</strong> {"\\(x(t)=0\\)"} y{' '}
                {"\\(x_{\\text{T}}\\)"} constante:
              </p>
              <div className="eq-block">
                {"\\[ T=kx_2 \\qquad\\text{(5.2)}\\qquad\\quad T=T_{\\text{G}}+c\\,\\frac{dx_1}{dt} \\qquad\\text{(5.3)} \\]"}
              </div>
              <div className="eq-block">
                {"\\[ \\frac{dT(t)}{dt}+\\frac{T(t)}{\\tau}=\\frac{T_{\\text{G}}(t)}{\\tau}, \\qquad \\tau=\\frac{c}{k} \\qquad\\text{(5.6)} \\]"}
              </div>
              <p>
                {"\\(T(t)\\)"} es impulsada por el generador {"\\(T_{\\text{G}}(t)\\)"} con tiempo de relajación{' '}
                {"\\(\\tau = c/k\\)"}.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">📈</span> Respuesta a un escalón
            </div>
            <div className="card-body">
              <p>
                Si el generador se enciende a {"\\(t=0\\)"} con {"\\(T_{\\text{G}}=T_0\\)"}, la tensión sube
                exponencialmente:
              </p>
              <div className="eq-block">
                {"\\[ T(t)=T_0\\bigl(1-e^{-t/\\tau}\\bigr) \\qquad\\text{(5.8)} \\]"}
              </div>
              <p>
                En {"\\(t=\\tau\\)"} alcanza el <span className="tag">63 %</span> de {"\\(T_0\\)"}. Ese es el «tiempo de
                respuesta» del modelo viscoelástico.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-6">
              El resorte en serie y el amortiguador no modelan necesariamente estructuras reales: son una{' '}
              <strong>descripción matemática equivalente</strong>. Aun así, el elemento elástico en paralelo puede
              deberse al sarcolema y a la titina; las bisagras de la miosina aportan al elástico en serie. Pulsa ▶ y
              observa cómo la tensión «persigue» al generador con retraso τ.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-active" />
            <div className="prof-controls">
              <span className="badge">τ = c/k</span>
              <label>
                τ{' '}
                <input
                  type="range"
                  id="ac_tau"
                  min="10"
                  max="120"
                  step="5"
                  defaultValue={params.ac_tau}
                  onChange={(e) => {
                    engine.setParam('ac_tau', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />{' '}
                ms
              </label>
              <button id="ac_play" type="button" onClick={togglePlay}>
                {isPlaying ? '⏸' : '▶'}
              </button>
              <span className="readout" id="ac_out">
                T/T₀ → 1 · t = τ ⇒ 63 %
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
