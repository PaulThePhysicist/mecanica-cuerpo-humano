import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide17({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="17" data-module="7">
      <div className="module-header">
        <span className="mnum">6.6</span>
        <span className="mtitle">Los cuatro modos de pérdida de calor</span>
        <span className="msub">Radiación, convección, conducción y evaporación</span>
        <span className="mslide-count">17 / 23</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">⚠️</span> ¿Por qué importa perder calor?
            </div>
            <div className="card-body">
              <p>Todo el metabolismo acaba en calor. Sin pérdida, la temperatura subiría a:</p>
              <div className="eq-block">
                {"\\[ \\frac{dT}{dt} = \\frac{\\text{BMR}}{m_{\\text{b}} c_{\\text{b}}} = \\frac{70\\ \\text{kcal/h}}{58\\ \\text{kcal/°C}} = 1{,}2\\,^\\circ\\text{C/h} \\qquad \\text{(eqs. 6.35–6.36)} \\]"}
              </div>
              <p>
                {"Capacidad calorífica del cuerpo: "}<span className="tag">{"\\(C = 0,83 \\times 70 = 58\\text{ kcal/°C}\\)"}</span>
                {". ¡+1,2 °C cada hora — necesitamos disipar!"}
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">📋</span> El reparto en reposo
            </div>
            <div className="card-body">
              <p>
                <strong>Radiación</strong> (cuerpo negro): <span className="tag">54–60 %</span> ·{' '}
                <strong>Convección + conducción</strong>: <span className="tag">≈ 25 %</span> ·{' '}
                <strong>Evaporación del sudor</strong>: <span className="tag">≈ 7 %</span> · <strong>Respiración</strong>:{' '}
                <span className="tag">≈ 14 %</span>.
              </p>
              <p>
                Total en reposo: ≈ <span className="tag">1,5 kcal/min</span>.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🏃</span> Durante ejercicio intenso
            </div>
            <div className="card-body">
              <p>
                La pérdida sube a ≈ <span className="tag">15 kcal/min</span>. La radiación se mantiene (0,8 kcal/min, pero solo ≈ 5 %
                del total); la convección pasa a 2,2 (15 %); <strong>el sudor domina: 12 mL/min ≈ 80 %</strong>.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-17">
              Los modos de pérdida son física pura; la biología solo modula sus magnitudes (vasodilatación, sudor, ropa). Mueve el
              deslizador de actividad en el canvas: en reposo domina la radiación; al correr, el sudor se lleva el 80 %.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-loss" className="sim" />
            <div className="prof-controls">
              <span className="badge">modos</span>
              <label>
                actividad{' '}
                <input
                  type="range"
                  id="ls_f"
                  min="0"
                  max="1"
                  step="0.01"
                  defaultValue={params.ls_f}
                  onChange={(e) => {
                    engine.setParam('ls_f', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />{' '}
                <span id="ls_fv">{params.ls_f < 0.2 ? 'reposo' : params.ls_f < 0.6 ? 'moderado' : 'intenso'}</span>
              </label>
              <span className="readout" id="ls_out">
                total ≈ 1,5 kcal/min · radiación domina
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
