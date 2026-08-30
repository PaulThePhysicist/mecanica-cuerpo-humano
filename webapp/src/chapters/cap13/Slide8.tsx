import React from 'react';
import Sim from './Sim';
import type { Engine } from './useEngine';

interface SlideProps {
  isActive?: boolean;
  engine?: Engine;
}

export default function Slide8({ engine }: SlideProps) {
  const f = engine?.paramsRef.current.bq_f ?? 1;
  const l = engine?.paramsRef.current.bq_l ?? 25;
  const c = engine?.paramsRef.current.bq_c ?? 0;

  return (
    <>
      <div className="module-header">
        <span className="mnum">13 · 3</span>
        <span className="mtitle">Balance de calor del cuerpo</span>
        <span className="msub">{"\\((dQ/dt)_\\text{neto} = 3\\ \\text{términos}\\)"}</span>
        <span className="mslide-count">8 / 24</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🔥</span> Conservación de la energía
            </div>
            <div className="card-body">
              <p>El calentamiento neto es la suma de tres modos (13.10):</p>
              <div className="eq-block">
                <span className="eqno">(13.10)</span>
                {"\\[ \\left(\\frac{dQ}{dt}\\right)_\\text{neto} = \\left(\\frac{dQ}{dt}\\right)_\\text{metabolismo} + \\left(\\frac{dQ}{dt}\\right)_\\text{pérdida pasiva} + \\left(\\frac{dQ}{dt}\\right)_\\text{controlado por el cuerpo} \\]"}
              </div>
              <p>
                El lado izquierdo es {"\\(C\\,dT/dt\\)"}, con capacidad calorífica {"\\(C=60\\ \\text{kcal/}^\\circ\\mathrm{C}\\)"} para 70 kg (
                {"\\(c=0{,}83\\)"}):
              </p>
              <div className="eq-block">
                <span className="eqno">(13.11)</span>
                {"\\[ C\\,\\frac{dT}{dt} = 60\\,\\frac{\\text{kcal}}{^\\circ\\mathrm{C}}\\,\\frac{dT}{dt} \\]"}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🏃</span> Metabolismo: el factor de actividad
            </div>
            <div className="card-body">
              <p>
                {"\\(\\left(\\frac{dQ}{dt}\\right)_\\text{metabolismo}=f\\cdot\\text{BMR}\\)"}, con {"\\(\\text{BMR}=70\\ \\text{kcal/h}\\)"}{' '}
                y {"\\(f\\)"} entre 1 y ~20:
              </p>
              <div className="eq-block">
                <span className="eqno">(13.14)</span>
                {"\\[ \\frac{dT}{dt} = f\\,\\frac{70}{60} = 1{,}2\\,f\\ ^\\circ\\mathrm{C/h} \\]"}
              </div>
              <p>Con {"\\(f=20\\)"} (ejercicio pesado): {"\\(24\\ ^\\circ\\mathrm{C/h}\\)"} — sin disipar no se sobrevive.</p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-8">
              Activa los tres términos en la barra derecha: el metabolismo (siempre positivo), la pérdida pasiva (negativa) y el
              control corporal (negativo al sudar, positivo al tiritar). El cuerpo ajusta el tercero para que la suma sea ~0.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-bq" />
            <div className="prof-controls">
              <span className="badge">dQ/dt</span>
              <label>
                f{' '}
                <input
                  type="range"
                  id="bq_f"
                  min="1"
                  max="20"
                  value={f}
                  step="1"
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    engine?.setParam('bq_f', v);
                    const span = document.getElementById('bq_fv');
                    if (span) span.textContent = String(v);
                    engine?.requestDraw();
                  }}
                />{' '}
                <span id="bq_fv">{f}</span>
              </label>
              <label>
                Pérdida{' '}
                <input
                  type="range"
                  id="bq_l"
                  min="0"
                  max="150"
                  value={l}
                  step="5"
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    engine?.setParam('bq_l', v);
                    const span = document.getElementById('bq_lv');
                    if (span) span.textContent = String(v);
                    engine?.requestDraw();
                  }}
                />{' '}
                <span id="bq_lv">{l}</span>
              </label>
              <label>
                Control{' '}
                <input
                  type="range"
                  id="bq_c"
                  min="-800"
                  max="800"
                  value={c}
                  step="10"
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    engine?.setParam('bq_c', v);
                    const span = document.getElementById('bq_cv');
                    if (span) span.textContent = String(v);
                    engine?.requestDraw();
                  }}
                />{' '}
                <span id="bq_cv">{c}</span>
              </label>
              <span className="readout" id="bq_out">
                neto = {(f * 70 - l + c).toFixed(0)} kcal/h
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
