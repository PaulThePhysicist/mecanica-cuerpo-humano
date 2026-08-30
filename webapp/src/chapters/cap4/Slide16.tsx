import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide16({ engine }: { engine: Engine }) {
  const params = engine.paramsRef.current;

  return (
    <div className="slide active" data-slide="16" data-module="7">
      <div className="module-header">
        <span className="mnum">4.7</span>
        <span className="mtitle">Flexión, rotura y pandeo</span>
        <span className="msub">El tobillo atrapado y la columna de Euler</span>
        <span className="mslide-count">16 / 21</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">📐</span> Rotura por flexión
            </div>
            <div className="card-body">
              <p>
                En una viga que se flexiona, la tensión máxima está en la superficie (a distancia {"\\(d/2\\)"} del eje):
              </p>
              <div className="eq-block">
                {"\\[ |\\sigma_{\\max}|=\\frac{Yd}{2R}\\qquad M_B\\ge\\frac{2(\\text{UBS})I_A}{d}\\quad(\\text{rotura}) \\]"}
              </div>
              <p>
                La grieta comienza en la cara de <strong>tracción</strong>.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🪤</span> El tobillo atrapado
            </div>
            <div className="card-body">
              <p>
                Si el pie queda fijo, el peso crea un momento que dobla la tibia (radio {"\\(a\\approx1\\ \\text{cm}\\)"}
                ). El hueso rompe cuando la caída es desde una altura
              </p>
              <div className="eq-block">
                {"\\[ D\\ge\\frac{\\pi a^3}{4}\\frac{\\text{UBS}}{W_b-W_{\\text{pierna}}}=\\frac{\\pi(0{,}01)^3}{4}\\frac{247}{640}\\approx0{,}25\\ \\text{m} \\]"}
              </div>
              <p>
                <span className="tag">D &gt; 25 cm</span>: la altura de caída importa más que el peso. Bajar un escalón mal
                puede fracturar la tibia.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🗼</span> Pandeo de Euler
            </div>
            <div className="card-body">
              <p>
                Una columna delgada cargada axialmente <strong>pandea</strong> lateralmente antes de aplastarse:
              </p>
              <div className="eq-block">
                {"\\[ S_c=\\frac{\\pi^2 YI_A}{L^2} \\]"}
              </div>
              <p>
                La carga crítica cae con <span className="tag">1/L²</span>: columnas largas y delgadas (el fémur de un
                corredor) pandean a cargas bajas.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-16">
              Dos fallas distintas: la tibia atrapada se <em>flexiona</em> (grieta en tracción), el fémur axial{' '}
              <em>pandea</em> (inestabilidad lateral). En el canvas, sube la carga o alarga la columna hasta que S_c caiga
              por debajo del peso: ahí se curva.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-buckle" className="sim" />
            <div className="prof-controls">
              <span className="badge">S_c = π²YI_A/L²</span>
              <label>
                L{' '}
                <input
                  type="range"
                  id="bk_L"
                  min="0.25"
                  max="1.2"
                  step="0.01"
                  defaultValue={params.bk_L}
                  onChange={(e) => {
                    engine.setParam('bk_L', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />
              </label>
              <label>
                P{' '}
                <input
                  type="range"
                  id="bk_P"
                  min="0"
                  max="60000"
                  step="500"
                  defaultValue={params.bk_P}
                  onChange={(e) => {
                    engine.setParam('bk_P', parseFloat(e.target.value));
                    engine.requestDraw();
                  }}
                />
              </label>
              <span className="readout" id="bk_out">
                S_c = 28,1 kN
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
