import React from 'react';
import Sim from './Sim';
import type { Engine } from './useEngine';

interface SlideProps {
  isActive?: boolean;
  engine?: Engine;
}

export default function Slide3({ engine }: SlideProps) {
  const fbSel = engine?.paramsRef.current.fb_sel ?? 0;
  const fbDp = engine?.paramsRef.current.fb_dp ?? 3;

  return (
    <>
      <div className="module-header">
        <span className="mnum">13 · 1</span>
        <span className="mtitle">Retroalimentación negativa y positiva</span>
        <span className="msub">{"\\(P\\)"} regresa al punto de consigna {"\\(P_0\\)"}</span>
        <span className="mslide-count">3 / 24</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🔄</span> Negativa: corrige (la común)
            </div>
            <div className="card-body">
              <p>
                La retroalimentación <strong>negativa</strong> invierte la dirección del cambio para mantener el parámetro
                cerca del punto de consigna {"\\(P_0\\)"}, dentro de un rango delimitado por valores permitidos (Fig. 13.3a) — como
                un termostato de habitación, con un rango de varios grados. <strong>Muy común</strong> en el cuerpo.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">⏫</span> Positiva: amplifica (rara, peligrosa)
            </div>
            <div className="card-body">
              <p>
                La <strong>positiva</strong> produce un mayor cambio en la misma dirección (Fig. 13.3b). Poco común. Ejemplos:
              </p>
              <p>🌿 <strong>Lactancia</strong> → más leche estimula más succión → más leche.</p>
              <p>
                💔 <strong>Insuficiencia cardíaca congestiva terminal</strong>: el corazón eyecta mal → líquido en venas/pulmones
                → los riñones, al detectar bajo flujo, devuelven sal y agua a la circulación → el volumen sube sin límite → más
                carga → más deterioro → <em>más retención</em>, acelerando la muerte.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-3">
              Cambia el tipo de bucle y la perturbación inicial: la negativa devuelve {"\\(P\\)"} al consigna; la positiva lo aleja y
              diverge. El caso de la insuficiencia cardíaca es el ejemplo canónico de retroalimentación positiva patológica.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-fb" />
            <div className="prof-controls">
              <span className="badge">bucle</span>
              <label>
                Tipo{' '}
                <select
                  id="fb_sel"
                  value={fbSel}
                  onChange={(e) => {
                    engine?.setParam('fb_sel', Number(e.target.value));
                    engine?.requestDraw();
                  }}
                >
                  <option value="0">Negativa</option>
                  <option value="1">Positiva</option>
                </select>
              </label>
              <label>
                ΔP₀{' '}
                <input
                  type="range"
                  id="fb_dp"
                  min="-6"
                  max="6"
                  value={fbDp}
                  step="0.5"
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    engine?.setParam('fb_dp', v);
                    const span = document.getElementById('fb_dpv');
                    if (span) span.textContent = (v >= 0 ? '+' : '') + v.toFixed(1).replace('.', ',');
                    engine?.requestDraw();
                  }}
                />{' '}
                <span id="fb_dpv">{fbDp >= 0 ? `+${fbDp.toFixed(1).replace('.', ',')}` : fbDp.toFixed(1).replace('.', ',')}</span>
              </label>
              <span className="readout" id="fb_out">
                negativa · regresa a P₀
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
