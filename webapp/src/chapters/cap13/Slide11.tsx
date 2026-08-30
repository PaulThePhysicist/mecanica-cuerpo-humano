import React from 'react';
import Sim from './Sim';
import type { Engine } from './useEngine';

interface SlideProps {
  isActive?: boolean;
  engine?: Engine;
}

export default function Slide11({ engine }: SlideProps) {
  const t = engine?.paramsRef.current.sw_t ?? 38.0;
  const k = engine?.paramsRef.current.sw_k ?? 750;
  const loss = t > 36.85 ? k * (t - 36.85) : 0;

  return (
    <>
      <div className="module-header">
        <span className="mnum">13 · 4</span>
        <span className="mtitle">Pérdida por sudoración vs temperatura</span>
        <span className="msub">{"\\(-K_\\text{sudor}(T-36{,}85)\\)"}</span>
        <span className="mslide-count">11 / 24</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">📈</span> Una recta que salva la vida
            </div>
            <div className="card-body">
              <p>
                La Fig. 13.5 muestra la tasa de pérdida por sudoración en función de {"\\(T_\\text{cuerpo}\\)"} central. Es cero cuando
                el núcleo está frío y crece linealmente para {"\\(T>36{,}85\\ ^\\circ\\mathrm{C}\\)"}:
              </p>
              <div className="eq-block">
                <span className="eqno">(13.31)</span>
                {"\\[ \\left(\\frac{dQ}{dt}\\right)_\\text{sudor} = -K_\\text{sudor}(T_\\text{cuerpo}-36{,}85\\ ^\\circ\\mathrm{C}) \\]"}
              </div>
              <p>
                Con {"\\(K_\\text{sudor}\\sim 750\\ \\text{kcal/(h·°C)}\\)"} y piel 33–38 °C. El cuerpo puede perder 1 L/h de sudor
                (hasta 540 kcal/h).
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🎛️</span> Equilibrio con el metabolismo
            </div>
            <div className="card-body">
              <p>
                En estado estacionario, la pérdida por sudor debe cancelar el exceso metabólico sobre el ambiente. La pendiente{' '}
                {"\\(K_\\text{sudor}\\)"} decide qué tan bien el cuerpo sostiene {"\\(37\\ ^\\circ\\mathrm{C}\\)"} bajo ejercicio intenso.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-11">
              Mueve la temperatura central: a la izquierda de 36,85 °C no hay sudor (recta en cero); a la derecha, la pérdida
              sube linealmente. Esa pendiente es la ganancia de control térmico del cuerpo.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-sw" />
            <div className="prof-controls">
              <span className="badge">K_sudor</span>
              <label>
                T cuerpo{' '}
                <input
                  type="range"
                  id="sw_t"
                  min="34"
                  max="42"
                  value={t}
                  step="0.1"
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    engine?.setParam('sw_t', v);
                    const span = document.getElementById('sw_tv');
                    if (span) span.textContent = v.toFixed(1).replace('.', ',');
                    engine?.requestDraw();
                  }}
                />{' '}
                <span id="sw_tv">{t.toFixed(1).replace('.', ',')}</span>
              </label>
              <label>
                K{' '}
                <input
                  type="range"
                  id="sw_k"
                  min="100"
                  max="1500"
                  value={k}
                  step="10"
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    engine?.setParam('sw_k', v);
                    const span = document.getElementById('sw_kv');
                    if (span) span.textContent = String(v);
                    engine?.requestDraw();
                  }}
                />{' '}
                <span id="sw_kv">{k}</span>
              </label>
              <span className="readout" id="sw_out">
                pérdida ≈ {loss.toFixed(0)} kcal/h
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
