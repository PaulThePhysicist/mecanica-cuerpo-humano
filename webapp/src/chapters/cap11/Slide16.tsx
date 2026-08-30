import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide16({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="16" data-module="6">
      <div className="module-header">
        <span className="mnum">11 · 3</span>
        <span className="mtitle">Astigmatismo y efectividad de recetas</span>
        <span className="msub">{"\\(-5{,}00\\ \\mathrm{D}\\to-4{,}72\\ \\quad +5{,}00\\ \\mathrm{D}\\to+5{,}32\\ \\mathrm{(contacto)}\\)"}</span>
        <span className="mslide-count">16 / 24</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🌀</span> La córnea tórica: dos focos
            </div>
            <div className="card-body">
              <p>
                En el <strong>astigmatismo</strong> la córnea tiene curvatura desigual en sus meridianos (como una
                cuchara): un punto forma <strong>dos líneas focales</strong> en vez de un punto. Se corrige con{' '}
                <strong>lentes esferocilíndricas</strong>. Receta ejemplo:{' '}
                <span className="tag">O.D. −3,00 +2,25 × 175 +1,25</span> (esfera · cilindro · eje · adición bifocal).
              </p>
              <div className="eq-block">
                {"\\[ P_x \\neq P_y \\;\\Rightarrow\\; \\text{imagen: línea focal en vez de punto} \\]"}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">👓</span> La misma receta, distinta efectividad
            </div>
            <div className="card-body">
              <p>
                Los anteojos quedan a ~1,2–1,5 cm de la córnea; el contacto, sobre ella. Aplicando la fórmula de
                efectividad (11.20):
              </p>
              <div className="eq-block">
                <span className="eqno">(11.73)</span>
                {"\\[ -5{,}00\\ \\mathrm{D}\\ (\\text{gafas}) \\to -4{,}72\\ \\mathrm{D}\\ (\\text{contacto}) \\]"}
              </div>
              <div className="eq-block">
                <span className="eqno">(11.74)</span>
                {"\\[ +5{,}00\\ \\mathrm{D}\\ (\\text{gafas}) \\to +5{,}32\\ \\mathrm{D}\\ (\\text{contacto}) \\]"}
              </div>
              <p>
                Contactos blandos: hidrogel, ~14 mm, grosor desde 0,03 mm; rígidos permeables al gas. Cirugía: RK, PRK,
                LASIK (esculpir la córnea).
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-16">
              Mueve la potencia y la distancia vértice: a +5 D, acercar la lente a la córnea (gafa → contacto) sube la
              efectividad a +5,32 D; a −5 D la baja a −4,72 D. Por eso la receta de contacto no es la de las gafas.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-toric" className="sim" />
            <div className="prof-controls">
              <span className="badge">vértice</span>
              <label>
                Distancia{' '}
                <input
                  type="range"
                  id="as_d"
                  min="0"
                  max="20"
                  defaultValue={params.as_d}
                  step="0.5"
                  onChange={(e) => {
                    engine.setParam('as_d', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="as_dv">14 mm</span>
              </label>
              <label>
                P gafa{' '}
                <input
                  type="range"
                  id="as_P"
                  min="-8"
                  max="8"
                  defaultValue={params.as_P}
                  step="0.5"
                  onChange={(e) => {
                    engine.setParam('as_P', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="as_Pv">−5,0 D</span>
              </label>
              <span className="readout" id="as_out">
                −5,00 D @ 14 mm → −4,75 D en contacto
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
