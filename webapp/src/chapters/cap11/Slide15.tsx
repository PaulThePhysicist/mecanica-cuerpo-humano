import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide15({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="15" data-module="6">
      <div className="module-header">
        <span className="mnum">11 · 3</span>
        <span className="mtitle">Miopía e hipermetropía</span>
        <span className="msub">{"\\(\\mathrm{FP} = 53\\ \\mathrm{cm} \\to -1{,}93\\ \\mathrm{D}\\quad \\mathrm{NP} = 190\\ \\mathrm{cm} \\to +3{,}67\\ \\mathrm{D}\\)"}</span>
        <span className="mslide-count">15 / 24</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">➖</span> Miopía: el globo «largo»
            </div>
            <div className="card-body">
              <p>
                El foco cae <strong>antes</strong> de la retina (globo largo o córnea muy curva). El punto remoto FP es
                finito; un ejemplo con FP = 53 cm:
              </p>
              <div className="eq-block">
                <span className="eqno">(11.70)</span>
                {"\\[ P = \\frac{n}{\\mathrm{FP}} = -\\frac{1}{0{,}53\\ \\mathrm{m}} \\approx -1{,}93\\ \\mathrm{D}\\quad(\\text{anteojos}) \\]"}
              </div>
              <div className="eq-block">
                <span className="eqno">(11.71)</span>
                {"\\[ P_\\mathrm{contacto} \\approx -1{,}89\\ \\mathrm{D} \\]"}
              </div>
              <p>
                Se corrige con <strong>lentes negativas (divergentes)</strong>.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">➕</span> Hipermetropía: el globo «corto»
            </div>
            <div className="card-body">
              <p>
                El foco cae <strong>detrás</strong> de la retina (globo corto o córnea plana). El punto próximo NP se
                aleja; un ejemplo con NP = 190 cm:
              </p>
              <div className="eq-block">
                <span className="eqno">(11.72)</span>
                {"\\[ P = \\frac{1}{0{,}25} - \\frac{1}{1{,}90} \\approx +3{,}67\\ \\mathrm{D}\\quad(\\text{anteojos}),\\quad +3{,}47\\ \\mathrm{D}\\ (\\text{contacto}) \\]"}
              </div>
              <p>
                Se corrige con <strong>lentes positivas (convergentes)</strong>. El <strong>queratocono</strong> (córnea
                cónica) mezcla miopía, hipermetropía y astigmatismo.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-15">
              Cambia la condición: en la miopía los rayos convergen antes de la retina (imagen borrosa de lejos); la
              lente negativa los «abre». En la hipermetropía ocurre lo contrario; la positiva los «cierra».
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-amp" className="sim" />
            <div className="prof-controls">
              <span className="badge">refracción</span>
              <label>
                Ojo{' '}
                <select
                  id="my_sel"
                  defaultValue={params.my_sel}
                  onChange={(e) => {
                    engine.setParam('my_sel', parseInt(e.target.value, 10));
                    engine.requestDraw();
                  }}
                >
                  <option value="0">Emétrope</option>
                  <option value="1">Míope (FP = 53 cm)</option>
                  <option value="2">Hipermétrope (NP = 190 cm)</option>
                </select>
              </label>
              <span className="readout" id="my_out">
                Emétrope · foco sobre la retina
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
