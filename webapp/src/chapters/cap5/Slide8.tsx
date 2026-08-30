import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide8({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="8" data-module="4">
      <div className="module-header">
        <span className="mnum">5.4</span>
        <span className="mtitle">Músculos pasivos: no Hookeanos</span>
        <span className="msub">La tensión crece exponencialmente con el estiramiento</span>
        <span className="mslide-count">8 / 21</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🧶</span> El músculo en reposo
            </div>
            <div className="card-body">
              <p>
                Un músculo <strong>pasivo</strong> (sin estímulo eléctrico) tiene propiedades mecánicas propias que
                afectan su rendimiento al activarse. Experimentalmente es <strong>no Hookeano</strong>, como en (4.22): para
                deformaciones mayores, la tensión crece de forma exponencial:
              </p>
              <div className="eq-block">
                {"\\[ \\sigma=\\mu'\\,e^{\\,\\alpha L/L_0}-\\mu \\qquad\\text{(5.17)} \\]"}
              </div>
              <p>
                con {"\\(\\lambda = L/L_0 = \\varepsilon + 1\\)"} la deformación <strong>lagrangiana</strong> (
                {"\\(L_0\\)"} = longitud relajada).
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">⚖️</span> De la tensión a la fuerza
            </div>
            <div className="card-body">
              <p>La fuerza a través del músculo pasivo es la tensión por el PCA:</p>
              <div className="eq-block">
                {"\\[ F_{\\text{M}}=\\sigma\\,(\\text{PCA}) \\qquad\\text{(5.18)} \\]"}
              </div>
              <div className="eq-block">
                {"\\[ F_{\\text{M}}=(\\text{PCA})\\,\\mu'\\,e^{\\,\\alpha L/L_0}-(\\text{PCA})\\,\\mu \\qquad\\text{(5.19)} \\]"}
              </div>
              <p>
                Para deformaciones muy grandes hace falta un tratamiento <strong>neo-Hookeano</strong> más general (Cap.
                4, Problemas 4.20–4.22).
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-8">
              Contraste con el Cap. 4: el tejido pasivo del músculo «endurece» exponencialmente al estirarse — es un
              amortiguador de seguridad que evita que la fibra se salga del rango útil. La pendiente local de esta curva
              (módulo) crece con λ: por eso los músculos tensos resisten el estiramiento brusco.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-passive" />
            <div className="prof-controls">
              <span className="badge">σ–λ</span>
              <label>
                material{' '}
                <select
                  id="ps_mat"
                  defaultValue={params.ps_mat}
                  onChange={(e) => {
                    engine.setParam('ps_mat', e.target.value as any);
                    engine.requestDraw();
                  }}
                >
                  <option value="suave">Flexible (μ′ = 2 kPa)</option>
                  <option value="rigido">Rígido (μ′ = 20 kPa)</option>
                </select>
              </label>
              <label>
                λ{' '}
                <input
                  type="range"
                  id="ps_l"
                  min="1"
                  max="2.2"
                  step="0.05"
                  defaultValue={params.ps_l}
                  onChange={(e) => {
                    engine.setParam('ps_l', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />
              </label>
              <span className="readout" id="ps_out">
                σ = 0,02 · F/μ′·PCA = e^…
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
