import React from 'react';
import Sim from './Sim';
import type { Engine } from './useEngine';

interface SlideProps {
  isActive?: boolean;
  engine?: Engine;
}

export default function Slide7({ engine }: SlideProps) {
  const g = engine?.paramsRef.current.reg_g ?? 1.5;
  const td = engine?.paramsRef.current.reg_td ?? 1.0;

  return (
    <>
      <div className="module-header">
        <span className="mnum">13 · 2</span>
        <span className="mtitle">Mapa de estabilidad en el plano (g, τd)</span>
        <span className="msub">todo lo que queda bajo la curva {"\\(g = \\frac{\\pi}{2\\tau_d}\\)"}</span>
        <span className="mslide-count">7 / 24</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🟢</span> El semiplano estable
            </div>
            <div className="card-body">
              <p>
                El límite {"\\(g\\tau_d=\\pi/2\\)"} es una hipérbola en el plano {"\\((g,\\tau_d)\\)"}. Por debajo (producto menor): el
                sistema es estable. Por encima: inestable.
              </p>
              <div className="eq-block">
                {"\\[ g_\\text{máx} = \\frac{\\pi}{2\\,\\tau_d} \\]"}
              </div>
              <p>
                El problema 13.3 pide justo esto: con {"\\(\\tau_d=1\\ \\text{s}\\)"} → {"\\(g_\\text{máx}=\\pi/2\\approx 1{,}57\\)"}; con{" "}
                {"\\(\\tau_d=1\\ \\text{ms}\\)"} → {"\\(g_\\text{máx}\\approx 1570\\)"}.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🔭</span> Por qué importa
            </div>
            <div className="card-body">
              <p>
                Retardos grandes (nervios lentos, procesamiento largo) obligan a bajar la ganancia. El cuerpo compensa con bucles
                de bucle cerrado de respuesta rápida para mantenerse lejos del borde.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-7">
              Mueve el punto de prueba sobre el plano: se pinta verde si queda bajo la curva límite, rojo si la cruza. Observa
              cómo un {"\\(\\tau_d\\)"} pequeño permite ganancias enormes.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-reg" />
            <div className="prof-controls">
              <span className="badge">región</span>
              <label>
                g{' '}
                <input
                  type="range"
                  id="reg_g"
                  min="0.2"
                  max="6"
                  value={g}
                  step="0.1"
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    engine?.setParam('reg_g', v);
                    const span = document.getElementById('reg_gv');
                    if (span) span.textContent = v.toFixed(1).replace('.', ',');
                    engine?.requestDraw();
                  }}
                />{' '}
                <span id="reg_gv">{g.toFixed(1).replace('.', ',')}</span>
              </label>
              <label>
                τd{' '}
                <input
                  type="range"
                  id="reg_td"
                  min="0.1"
                  max="3"
                  value={td}
                  step="0.1"
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    engine?.setParam('reg_td', v);
                    const span = document.getElementById('reg_tdv');
                    if (span) span.textContent = v.toFixed(1).replace('.', ',');
                    engine?.requestDraw();
                  }}
                />{' '}
                <span id="reg_tdv">{td.toFixed(1).replace('.', ',')}</span>
              </label>
              <span className="readout" id="reg_out">
                {g * td < Math.PI / 2 ? 'estable' : 'inestable'} · g·τd = {(g * td).toFixed(2).replace('.', ',')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
