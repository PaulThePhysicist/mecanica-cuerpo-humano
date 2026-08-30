import React from 'react';
import Sim from './Sim';
import type { Engine } from './useEngine';

interface SlideProps {
  isActive?: boolean;
  engine?: Engine;
}

export default function Slide14({ engine }: SlideProps) {
  const dpb = engine?.paramsRef.current.ga_d ?? 20;
  const g = engine?.paramsRef.current.ga_g ?? 4.0;
  const dpa = -g * dpb;

  return (
    <>
      <div className="module-header">
        <span className="mnum">13 · 5</span>
        <span className="mtitle">La ganancia de la retroalimentación</span>
        <span className="msub">{"\\(\\Delta p_a = -g\\,\\Delta p_b\\)"}</span>
        <span className="mslide-count">14 / 24</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🔻</span> Respuesta proporcional
            </div>
            <div className="card-body">
              <p>
                Un cambio en la presión de los barorreceptores {"\\(\\Delta p_b\\)"} induce una caída refleja de la presión arterial{' '}
                {"\\(\\Delta p_a\\)"}:
              </p>
              <div className="eq-block">
                <span className="eqno">(13.35)</span>
                {"\\[ \\Delta p_a = -g\\,\\Delta p_b \\]"}
              </div>
              <p>Más exacto, incluyendo el sobreimpulso al subir:</p>
              <div className="eq-block">
                <span className="eqno">(13.36)</span>
                {"\\[ \\Delta p_a = -g\\,\\Delta p_b - K_4\\frac{dp_b^+}{dt} \\]"}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🔢</span> Ganancias medidas
            </div>
            <div className="card-body">
              <p>
                La ganancia de bucle abierto {"\\(g_o\\)"} medida experimentalmente va de 2 a 9 (en sistemas aislados). En bucle
                cerrado {"\\(g_c\\)"} puede ser menor; el cuerpo la <strong>reduce durante una hemorragia aguda</strong> para
                garantizar la perfusión a órganos vitales.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-14">
              Sube la ganancia g: una desviación Δpb pequeña produce una corrección Δpa grande (línea negativa). Con g entre 2 y
              9, el cuerpo corrige con eficacia perturbaciones posturales o de esfuerzo.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-ga" />
            <div className="prof-controls">
              <span className="badge">ganancia</span>
              <label>
                Δp_b{' '}
                <input
                  type="range"
                  id="ga_d"
                  min="-40"
                  max="40"
                  value={dpb}
                  step="1"
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    engine?.setParam('ga_d', v);
                    const span = document.getElementById('ga_dv');
                    if (span) span.textContent = (v >= 0 ? '+' : '') + String(v);
                    engine?.requestDraw();
                  }}
                />{' '}
                <span id="ga_dv">{dpb >= 0 ? `+${dpb}` : dpb}</span>
              </label>
              <label>
                g{' '}
                <input
                  type="range"
                  id="ga_g"
                  min="0"
                  max="9"
                  value={g}
                  step="0.5"
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    engine?.setParam('ga_g', v);
                    const span = document.getElementById('ga_gv');
                    if (span) span.textContent = v.toFixed(1).replace('.', ',');
                    engine?.requestDraw();
                  }}
                />{' '}
                <span id="ga_gv">{g.toFixed(1).replace('.', ',')}</span>
              </label>
              <span className="readout" id="ga_out">
                Δp_a = {dpa.toFixed(0)} mmHg
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
