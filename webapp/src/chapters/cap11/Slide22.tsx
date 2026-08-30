import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide22({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="22" data-module="9">
      <div className="module-header">
        <span className="mnum">11 · 6</span>
        <span className="mtitle">Cómo ven otros animales</span>
        <span className="msub">{"\\(\\text{aves buceadoras:} +70\\text{–}80\\ \\mathrm{D}\\ \\cdot\\ \\text{tapetum} \\to \\text{reflejo nocturno}\\)"}</span>
        <span className="mslide-count">22 / 24</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🐱</span> Diurnos vs nocturnos
            </div>
            <div className="card-body">
              <p>
                Los ojos <strong>nocturnos</strong> maximizan luz: más bastones, <strong>tapetum lucidum</strong> (capa
                reflectante que hace «brillar» los ojos en la noche) y <strong>pupilas en hendidura</strong> que se
                cierran más que una circular. Los <strong>diurnos</strong> maximizan agudeza y color: más conos, fóveas
                profundas.
              </p>
              <div className="eq-block">
                {"\\[ \\text{nocturno: luz} \\propto \\text{área pupilar} \\cdot \\text{bastones} \\cdot \\text{tapetum} \\]"}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🐟</span> Aire vs agua
            </div>
            <div className="card-body">
              <p>
                En el agua la córnea pierde su poder (lo vimos en la slide 10): los <strong>peces</strong> compensan con
                un <strong>cristalino esférico</strong> enorme. <em>Anableps</em> ve a la vez dentro y fuera del agua
                (córnea partida). Las <strong>aves buceadoras</strong> acomodan <strong>+70–80 D</strong> comprimiendo el
                cristalino; los ojos <strong>frontales</strong> (depredadores) dan visión binocular; los{' '}
                <strong>laterales</strong> (presas) dan campo casi total.
              </p>
              <div className="eq-block">
                {"\\[ \\text{ave buceadora:}\\ \\Delta P \\approx 70\\text{–}80\\ \\mathrm{D}\\ \\text{para ver bajo el agua} \\]"}
              </div>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-22">
              Cambia el animal: cada estrategia es una solución distinta al mismo problema físico (reunir fotones en un
              detector). El ojo humano es «la media» entre extremos.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-animals" className="sim" />
            <div className="prof-controls">
              <span className="badge">animales</span>
              <label>
                Especie{' '}
                <select
                  id="av_sel"
                  defaultValue={params.av_sel}
                  onChange={(e) => {
                    engine.setParam('av_sel', parseInt(e.target.value, 10));
                    engine.requestDraw();
                  }}
                >
                  <option value="0">Humano (diurno)</option>
                  <option value="1">Gato (nocturno)</option>
                  <option value="2">Pez (agua)</option>
                  <option value="3">Ave buceadora</option>
                  <option value="4">Anableps (aire+agua)</option>
                </select>
              </label>
              <span className="readout" id="av_out">
                Humano · córnea 48 D + cristalino 22 D · visión de color
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
