import React from 'react';
import Sim from './Sim';
import type { Engine } from './useEngine';
import type { SimParams } from './sims';

export default function Slide2({
  isActive,
  engine,
  go,
  goModule,
  next,
  prev,
  toggleBubbles,
  toggleBreath,
  toggleSpiro,
  toggleCycle,
  togglePVLoop,
  onBack,
}: {
  isActive: boolean;
  engine: Engine;
  go: (n: number) => void;
  goModule: (m: number) => void;
  next: () => void;
  prev: () => void;
  toggleBubbles?: () => void;
  toggleBreath?: () => void;
  toggleSpiro?: () => void;
  toggleCycle?: () => void;
  togglePVLoop?: () => void;
  onBack?: () => void;
}) {
  return (
    <>
<div className="module-header">
    <span className="mnum">9.1</span>
    <span className="mtitle">El árbol bronquial: 23 generaciones</span>
    <span className="msub">d(z) = 2^(−z/3)·d(0) · 2²⁴ ≈ 1,6×10⁸ vías aéreas</span>
    <span className="mslide-count">2 / 24</span>
  </div>
  <div className="content-grid">
    <div className="theory">
      <div className="card active">
        <div className="card-hdr"><span className="icon">🌳</span> Bifurcación por 23 niveles</div>
        <div className="card-body">
          <p>El aire pasa por faringe, laringe y tráquea; esta se divide en bronquios derecho e izquierdo y sigue bifurcándose <strong>23 niveles</strong> ({"\\( 2^{24} = 1{,}6\\times 10^8 \\)"} vías) hasta formar los <strong>alvéolos</strong>, las unidades operativas del pulmón.</p>
          <p>El diámetro promedio cae con la generación como {"\\( d(z) = 2^{-z/3}d(0) \\)"} hasta z = 16: el diseño óptimo de un sistema ramificado de tubos en hidrodinámica.</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">📏</span> Tabla 9.1 · cuantificación</div>
        <div className="card-body">
          <table className="data-mini">
            <tr><th>Ramificación</th><th>z</th><th>D (mm)</th><th>A_tot (cm²)</th><th>v (cm/s)</th></tr>
            <tr><td>Tráquea</td><td>0</td><td>18,0</td><td>2,5</td><td>393</td></tr>
            <tr><td>Bronquio principal</td><td>1</td><td>12,2</td><td>2,3</td><td>427</td></tr>
            <tr><td>Bronquio lobar</td><td>2</td><td>8,3</td><td>2,1</td><td>462</td></tr>
            <tr><td>Bronquio segmental</td><td>4</td><td>4,5</td><td>2,5</td><td>392</td></tr>
            <tr><td>Bronquio terminal</td><td>8</td><td>1,86</td><td>7,0</td><td>144</td></tr>
            <tr><td>Bronquiolo terminal</td><td>16</td><td>0,60</td><td>180</td><td>5,40</td></tr>
            <tr><td>Conducto alveolar</td><td>20</td><td>0,45</td><td>1.600</td><td>0,60</td></tr>
            <tr><td>Saco alveolar</td><td>23</td><td>0,41</td><td>12.000</td><td>0,09</td></tr>
          </table>
          <p className="table-caption">Se asume v = 1 L/s · el número de vías de cada generación es 2^z · datos de ambos pulmones.</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">🧭</span> Continuidad del flujo</div>
        <div className="card-body">
          <p>Por continuidad {"\\( Q = u\\,A \\)"}, al crecer el área total de 2,5 a 12.000 cm² la velocidad del aire cae de <span className="tag">393 cm/s</span> a <span className="tag">0,09 cm/s</span>. En los alvéolos el aire casi se detiene: la difusión tiene tiempo de oxigenar la sangre.</p>
        </div>
      </div>
      <div className="apuntes">
        <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
        <div className="a-text" id="info-text-2">La idea: el pulmón es un árbol que se bifurca 23 veces. La ley 2^(−z/3) dice que cada 3 generaciones el diámetro se reduce a la mitad. Al final, el área total es ~5.000 veces la de la tráquea y el aire pasa de 393 a 0,09 cm/s: «se detiene» para dejar trabajar a la difusión. Recorre z con el slider.</div>
      </div>
    </div>
    <div className="sim-col">
      <div className="sim-area">
        <Sim id="sim-tree" />
        <div className="prof-controls">
          <span className="badge">árbol bronquial</span>
          <label>generación z <input type="range" id="tr_z" min="0" max="23" step="1" defaultValue="8" onInput={(e) => { engine.setParam("tr_z" as keyof SimParams, parseFloat((e.target as HTMLInputElement).value)); engine.requestDraw(); }} /> <span id="tr_zv">8</span></label>
          <span className="readout" id="tr_out">z = 8 · d ≈ 1,86 mm</span>
        </div>
      </div>
    </div>
  </div>
    </>
  );
}
