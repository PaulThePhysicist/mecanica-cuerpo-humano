import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide9({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="9" data-module="4">
      <div className="module-header">
        <span className="mnum">11 · 3</span>
        <span className="mtitle">El ojo esquemático: potencias por superficie</span>
        <span className="msub">{"\\(P_\\mathrm{ojo} = 64{,}34\\ \\mathrm{D},\\quad f = 20{,}8\\ \\mathrm{mm}\\)"}</span>
        <span className="mslide-count">9 / 24</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">👁️</span> Cuatro superficies, un sistema
            </div>
            <div className="card-body">
              <p>
                El ojo esquemático 1 del libro tiene potencias por interfaz: <span className="tag">P₁₂ = 48,35 D</span>{' '}
                (aire→córnea) <span className="tag">P₂₃ = −6,11 D</span> (córnea→acuoso){' '}
                <span className="tag">P₃₄ = 8,10 D</span> <span className="tag">P₄₅ = 14,00 D</span>. Sumadas:
              </p>
              <div className="eq-block">
                <span className="eqno">(11.53)</span>
                {"\\[ P_\\mathrm{córnea} = 42{,}24\\ \\mathrm{D}\\qquad P_\\mathrm{cristalino} = 22{,}10\\ \\mathrm{D} \\]"}
              </div>
              <div className="eq-block">
                <span className="eqno">(11.56)</span>
                {"\\[ P_\\mathrm{ojo} = 64{,}34\\ \\mathrm{D}\\quad\\Rightarrow\\quad f = 20{,}8\\ \\mathrm{mm} \\]"}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🧮</span> Separación finita y el ojo «exacto»
            </div>
            <div className="card-body">
              <p>
                Con la separación real entre superficies el poder baja: <span className="tag">P_ojo = 59,95 D</span>{' '}
                (11.58–11.63). Un modelo más fino da <span className="tag">43,05 / 19,11 / 58,64 D</span>. La lección
                es estable: <strong>la córnea da ~2/3 del poder y el cristalino ~1/3</strong>.
              </p>
              <div className="eq-block">
                {"\\[ P_\\mathrm{ojo} \\approx P_\\mathrm{córnea} + P_\\mathrm{cristalino} - \\frac{t}{n}P_cP_l \\approx 64\\ \\mathrm{D} \\]"}
              </div>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-9">
              Pulsa cada superficie: la primera (aire→córnea) es la más potente y la que «se pierde» bajo el agua. La
              retina queda justo en el foco posterior del sistema: emétrope.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-schematic" className="sim" />
            <div className="prof-controls">
              <span className="badge">esquemático</span>
              <label>
                Superficie{' '}
                <select
                  id="oe_sel"
                  defaultValue={params.oe_sel}
                  onChange={(e) => {
                    engine.setParam('oe_sel', parseInt(e.target.value, 10));
                    engine.requestDraw();
                  }}
                >
                  <option value="0">P₁₂ = 48,35 D · aire→córnea</option>
                  <option value="1">P₂₃ = −6,11 D · córnea→acuoso</option>
                  <option value="2">P₃₄ = 8,10 D · acuoso→cristalino</option>
                  <option value="3">P₄₅ = 14,00 D · cristalino→vítreo</option>
                </select>
              </label>
              <span className="readout" id="oe_out">
                P₁₂ = 48,35 D · aire → córnea (n: 1 → 1,3771)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
