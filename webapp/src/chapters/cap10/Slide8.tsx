import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide8({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;
  const flags = engine.flagsRef.current;

  return (
    <div className="slide active" data-slide="8" data-module="3">
      <div className="module-header">
        <span className="mnum">10 · 4</span>
        <span className="mtitle">Teoría fuente-filtro y formantes</span>
        <span className="msub">{"\\(I_{out}(f) = T(f)\\, I_{in}(f)\\)"}</span>
        <span className="mslide-count">8 / 24</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🎛️</span> El tracto vocal como filtro
            </div>
            <div className="card-body">
              <p>
                El espectro de la voz = el <strong>espectro de la fuente</strong> (pulsos glotales) multiplicado por la{' '}
                <strong>función de transferencia</strong> {"\\(T(f)\\)"} del tracto, que tiene picos en los formantes:
              </p>
              <div className="eq-block">
                <span className="eqno">(10.44)</span>
                {"\\[ I_\\mathrm{out}(f) = T(f)\\; I_\\mathrm{in}(f) \\]"}
              </div>
              <div className="eq-block">
                <span className="eqno">(10.45)</span>
                {"\\[ \\log I_\\mathrm{out} = \\log T + \\log I_\\mathrm{in} \\]"}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🎼</span> Tres formantes describen las vocales
            </div>
            <div className="card-body">
              <p>
                El tracto vocal es un tubo casi uniforme: sus resonancias son armónicos de ~500 Hz. Sus picos se
                desplazan con la boca y la lengua:
              </p>
              <div className="eq-block">
                <span className="eqno">(10.46)</span>
                {"\\[ F_1 \\approx 500,\\; F_2 \\approx 1\\,700,\\; F_3 \\approx 2\\,500\\ \\mathrm{Hz} \\]"}
              </div>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-8">
              ▶ anima el espectro: los armónicos de la fuente (líneas) atraviesan el filtro (curva) y quedan «pintados»
              con los picos de los formantes. Cambia de vocal y mira cómo se mueven F₁ y F₂.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-sourcefilter" className="sim" />
            <div className="prof-controls">
              <span className="badge">fuente-filtro</span>
              <button id="sf_play" type="button" onClick={() => engine.toggleSourceFilter()}>
                {flags.sfPlaying ? '⏸' : '▶'}
              </button>
              <label>
                Vocal{' '}
                <select
                  id="sf_vowel"
                  defaultValue={params.sf_vowel}
                  onChange={(e) => {
                    engine.setParam('sf_vowel', parseInt(e.target.value, 10));
                    engine.requestDraw();
                  }}
                >
                  <option value="0">/a/</option>
                  <option value="1">/e/</option>
                  <option value="2">/i/</option>
                  <option value="3">/o/</option>
                  <option value="4">/u/</option>
                </select>
              </label>
              <span className="readout" id="sf_out">
                /a/ → F₁≈800 Hz · F₂≈1200 Hz
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
