import React from 'react';
import Sim from './Sim';
import type { Engine } from './useEngine';

export default function Slide8({
  isActive,
  engine,
  go,
  goModule,
  next,
  prev,
  onBack,
}: {
  isActive: boolean;
  engine: Engine;
  go: (n: number) => void;
  goModule: (m: number) => void;
  next: () => void;
  prev: () => void;
  onBack?: () => void;
}) {
  return (
    <>
<div className="module-header">
    <span className="mnum">8.2</span>
    <span className="mtitle">Tensión en la pared: la ley de Laplace</span>
    <span className="msub">La pared paga la presión por el radio</span>
    <span className="mslide-count">8 / 24</span>
  </div>
  <div className="content-grid">
    <div className="theory">
      <div className="card active">
        <div className="card-hdr"><span className="icon">🎈</span> Ley de Laplace para cilindros</div>
        <div className="card-body">
          <p>La presión interna {"\\( \\Delta P \\)"} debe ser sostenida por la <strong>tensión de pared</strong> {"\\( T \\)"} (fuerza por unidad de longitud de tubo, eq. 8.25):</p>
          <div className="eq-block">{"\\[  \\Delta P = \\frac{T}{R} \\qquad \\Rightarrow \\qquad T = \\Delta P \\cdot R  \\]"}</div>
          <p>El esfuerzo circunferencial {"\\( \\sigma = T/w \\)"} se compara con el UTS del vaso.</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">📋</span> Tabla 8.5 · T calculada</div>
        <div className="card-body">
          <table className="data-mini">
            <tbody>
              <tr><th>Vaso</th><th>ΔP</th><th>T (dina/cm)</th><th>T/w (kPa)</th></tr>
              <tr><td>Aorta</td><td>100</td><td>160 000</td><td>53</td></tr>
              <tr><td>Arteria grande</td><td>97</td><td>52 000</td><td>52</td></tr>
              <tr><td>Arteriola</td><td>60</td><td>1 200</td><td>60</td></tr>
              <tr><td>Capilar</td><td>30</td><td>16</td><td>16</td></tr>
              <tr><td>Vena cava</td><td>10</td><td>20 000</td><td>13</td></tr>
            </tbody>
          </table>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">⚠️</span> El radio es el peligro</div>
        <div className="card-body">
          <p>Para la misma presión, <strong>a mayor radio, mayor tensión</strong>: un capilar soporta {"\\( T = 16 \\)"} dina/cm y la aorta {"\\( 160\\,000 \\)"}. Si un vaso se dilata (aneurisma), la tensión sube con el radio y la pared se estira más — un círculo vicioso (módulo 6).</p>
        </div>
      </div>
      <div className="apuntes">
        <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
        <div className="a-text" id="info-text-8">Laplace es la física del globo que se hincha y de la válvula que se abre. La tensión no es presión: un capilar y la aorta están a presiones parecidas, pero la tensión difiere por un factor 10⁴ por culpa del radio. En el canvas crece el radio y la pared se espesa — la flecha de tensión lo muestra.</div>
      </div>
    </div>
    <div className="sim-col">
      <div className="sim-area">
        <Sim id="sim-wall" />
        <div className="prof-controls">
          <span className="badge">Laplace</span>
          <label>R <input type="range" id="pl_r" min="0.1" max="2.5" step="0.05" defaultValue={1.2} onChange={(e) => { engine.setParam('pl_r', parseFloat(e.target.value)); engine.requestDraw(); }} /> <span id="pl_rv">1,2 cm</span></label>
          <label>ΔP <input type="range" id="pl_p" min="10" max="120" step="5" defaultValue={100} onChange={(e) => { engine.setParam('pl_p', parseFloat(e.target.value)); engine.requestDraw(); }} /> <span id="pl_pv">100 mmHg</span></label>
          <span className="readout" id="pl_out">T = 160 000 dina/cm (aorta)</span>
        </div>
      </div>
    </div>
  </div>
    </>
  );
}
