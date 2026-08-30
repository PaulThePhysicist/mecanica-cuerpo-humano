import React from 'react';
import Sim from './Sim';
import type { Engine } from './useEngine';

interface SlideProps {
  isActive?: boolean;
  engine?: Engine;
}

export default function Slide21({ engine }: SlideProps) {
  const r = engine?.paramsRef.current.pb_r ?? 2.0;
  const b = engine?.paramsRef.current.pb_b ?? 0.5;
  const interval = (b / r) * 60;

  return (
    <>
      <div className="module-header">
        <span className="mnum">13 · 8</span>
        <span className="mtitle">Problemas 13.2 y 13.3</span>
        <span className="msub">banda muerta ±0,5 °C · {"\\(g\\cdot\\tau_d=\\pi/2\\)"}</span>
        <span className="mslide-count">21 / 24</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🔁</span> 13.2: ¿Cada cuánto se activa el control?
            </div>
            <div className="card-body">
              <p>
                Consigna {"\\(37{,}0\\ ^\\circ\\mathrm{C}\\)"}. El sistema con banda muerta (deadband) se activa cuando la
                temperatura se desvía en {"\\(\\pm 0{,}5\\ ^\\circ\\mathrm{C}\\)"} y la restablece en ~2 min. Si sin control la
                tasa de deriva por metabolismo es {"\\(+2\\ ^\\circ\\mathrm{C/h}\\)"}, ¿cuál es el intervalo de activación?
              </p>
              <p>
                El tiempo hasta alcanzar el límite es {"\\(0{,}5\\ ^\\circ\\mathrm{C} / 2\\ ^\\circ\\mathrm{C/h} = 0{,}25\\ \\text{h} = 15\\ \\text{min}\\)"}.
                Por ende, el termostato corporal se dispara exactamente cada <strong>15 minutos</strong>.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">📐</span> 13.3: Ganancia máxima admisible
            </div>
            <div className="card-body">
              <p>
                Cálculo de la ganancia límite para asegurar estabilidad ante retardos fisiológicos:
              </p>
              <div className="eq-block">
                {"\\[ g_\\text{máx} = \\frac{\\pi}{2\\,\\tau_d} \\]"}
              </div>
              <p>
                • Con retardo largo {"\\(\\tau_d = 1\\ \\text{s}\\)"} (conducción hormonal/lenta) → {"\\(g_\\text{máx}\\approx 1{,}57\\)"}.<br />
                • Con retardo corto {"\\(\\tau_d = 1\\ \\text{ms}\\)"} (arco reflejo monosináptico) → {"\\(g_\\text{máx}\\approx 1570\\)"}.<br />
                Un retardo menor permite una ganancia correctiva tres órdenes de magnitud superior sin oscilar.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-21">
              Mueve la tasa de deriva y la banda muerta: el tiempo entre activaciones cambia. La banda muerta evita fatiga y gasto
              energético continuo frente a fluctuaciones microscópicas.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-pb" />
            <div className="prof-controls">
              <span className="badge">13.2</span>
              <label>
                Deriva (°C/h){' '}
                <input
                  type="range"
                  id="pb_r"
                  min="0.5"
                  max="6"
                  value={r}
                  step="0.5"
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    engine?.setParam('pb_r', v);
                    const span = document.getElementById('pb_rv');
                    if (span) span.textContent = v.toFixed(1).replace('.', ',');
                    engine?.requestDraw();
                  }}
                />{' '}
                <span id="pb_rv">{r.toFixed(1).replace('.', ',')}</span>
              </label>
              <label>
                Banda (°C){' '}
                <input
                  type="range"
                  id="pb_b"
                  min="0.1"
                  max="1"
                  value={b}
                  step="0.1"
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    engine?.setParam('pb_b', v);
                    const span = document.getElementById('pb_bv');
                    if (span) span.textContent = v.toFixed(1).replace('.', ',');
                    engine?.requestDraw();
                  }}
                />{' '}
                <span id="pb_bv">{b.toFixed(1).replace('.', ',')}</span>
              </label>
              <span className="readout" id="pb_out">
                se activa cada {interval.toFixed(0)} min
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
