import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide4({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="4" data-module="2">
      <div className="module-header">
        <span className="mnum">10 · 3</span>
        <span className="mtitle">Resonadores: tubos abiertos y cerrados</span>
        <span className="msub">{"\\(f_n = nv/2L \\;|\\; f_m = (m+\\tfrac{1}{2})v/2L\\)"}</span>
        <span className="mslide-count">4 / 24</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🎵</span> Modos normales en un tubo
            </div>
            <div className="card-body">
              <p>
                Un tubo abierto en ambos extremos (dos vientres) admite todos los armónicos; uno cerrado en un extremo
                (un vientre y un nodo) solo los impares:
              </p>
              <div className="eq-block">
                <span className="eqno">(10.36)</span>
                {"\\[ f_n = \\frac{n\\,v}{2L},\\quad n = 1,2,3,\\dots \\]"}
              </div>
              <div className="eq-block">
                <span className="eqno">(10.38)</span>
                {"\\[ f_m = \\frac{(m+\\tfrac{1}{2})\\,v}{2L},\\quad m = 0,1,2,\\dots \\]"}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🗣️</span> El tracto vocal como tubo resonante
            </div>
            <div className="card-body">
              <p>
                La boca y la faringe son un tubo de {"\\(L \\approx 17\\)"} cm (hombres) abierto en los labios. Sus picos
                de transmisión son los <strong>formantes</strong>: para el tubo abierto, {"\\(f_n = nv/2L\\)"} con{' '}
                {"\\(n=1,2,3\\)"}
              </p>
              <div className="eq-block">
                {"\\[ f_1 = \\frac{v}{2L} \\approx 1\\,000\\ \\mathrm{Hz} \\quad (L \\approx 17\\ \\mathrm{cm}) \\]"}
              </div>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-4">
              Cambia la longitud del tubo y mira cómo baja la fundamental: una boca «más larga» (labios redondeados,
              /u/) produce formantes más graves. El tubo cerrado solo emite armónicos impares: su espectro es «hueco».
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-cavity" className="sim" />
            <div className="prof-controls">
              <span className="badge">tubo</span>
              <label>
                Tubo{' '}
                <select
                  id="cv_typ"
                  defaultValue={params.cv_typ}
                  onChange={(e) => {
                    engine.setParam('cv_typ', parseInt(e.target.value, 10));
                    engine.requestDraw();
                  }}
                >
                  <option value="0">Abierto (dos extremos)</option>
                  <option value="1">Cerrado (un extremo)</option>
                </select>
              </label>
              <label>
                Longitud{' '}
                <input
                  type="range"
                  id="cv_L"
                  min="8"
                  max="34"
                  defaultValue={params.cv_L}
                  step="0.5"
                  onChange={(e) => {
                    engine.setParam('cv_L', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="cv_Lv">17,0 cm</span>
              </label>
              <span className="readout" id="cv_out">
                Abierto, L=17 cm: f₁ = 1009 Hz
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
