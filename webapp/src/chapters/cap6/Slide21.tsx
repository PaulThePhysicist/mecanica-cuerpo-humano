import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide21({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="21" data-module="8">
      <div className="module-header">
        <span className="mnum">6.7</span>
        <span className="mtitle">La temperatura corporal y su control</span>
        <span className="msub">36,5–37,5 °C, sin importar el entorno</span>
        <span className="mslide-count">21 / 23</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🌡️</span> Valores normales
            </div>
            <div className="card-body">
              <p>
                Núcleo: <span className="tag">36,5–37,5 °C</span>; sube ≈ 0,5 °C durante la vigilia. El recto marca ≈{' '}
                <span className="tag">0,4 °C más</span> que la boca. La anestesia baja ≈ 1 °C. La piel está a ≈ 34 °C (307 K); el
                núcleo a 37 °C (310 K).
              </p>
              <p>
                {"Temperatura promedio: "}<span className="tag">{"\\(T_{\\text{av}} = 0{,}80\\,T_{\\text{core}} + 0{,}20\\,T_{\\text{skin}}\\)"}</span>.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🛡️</span> El cuerpo es muy bueno regulando
            </div>
            <div className="card-body">
              <p>
                Desnudo, mantiene el núcleo entre 36 y 38 °C con ambientes de <span className="tag">21 a 54 °C</span> en aire seco
                (Fig. 6.20). Con ejercicio:
              </p>
              <div className="eq-block">
                {"\\[ T_{\\text{core}}\\ (^\\circ\\text{C}) = 36{,}5 + 3{,}0 \\times \\frac{\\text{consumo de O}_2}{\\text{consumo máx.}} \\qquad \\text{(eq. 6.71)} \\]"}
              </div>
              <p>
                Cada <span className="tag">+1 °C</span> de temperatura corporal aumenta la producción de calor ≈ 13 %.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🚨</span> Los límites
            </div>
            <div className="card-body">
              <p>
                Exposición limitada al aire caliente y al agua fría (Figs. 6.21–6.22): cuanto mayor la desviación de la temperatura,
                menor el tiempo tolerable. La <strong>fibrilación ventricular</strong> aparece cuando el núcleo cae por debajo de ≈{' '}
                <span className="tag">27–28 °C</span> (hipotermia).
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-21">
              {"La curva de producción de calor vs temperatura ambiente (Fig. 6.24) resume el control: abajo de la crítica \\(T_c = 26\\) °C se tiritando; en la termoneutral se minimiza el gasto; arriba de \\(T_h\\) domina la evaporación. El canvas la dibuja."}
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-thermo" className="sim" />
            <div className="prof-controls">
              <span className="badge">termorregulación</span>
              <label>
                T ambiente{' '}
                <input
                  type="range"
                  id="th_t"
                  min="0"
                  max="45"
                  step="1"
                  defaultValue={params.th_t}
                  onChange={(e) => {
                    engine.setParam('th_t', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="th_tv">{params.th_t} °C</span>
              </label>
              <span className="readout" id="th_out">
                termogénesis: tiritando
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
