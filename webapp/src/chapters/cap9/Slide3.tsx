import React from 'react';
import Sim from './Sim';
import type { Engine } from './useEngine';
import type { SimParams } from './sims';

export default function Slide3({
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
    <span className="mtitle">Los alvéolos y el intercambio</span>
    <span className="msub">3×10⁸ alvéolos · área 80 m² · factor ≈ 1.000 sobre la superficie del pulmón</span>
    <span className="mslide-count">3 / 24</span>
  </div>
  <div className="content-grid">
    <div className="theory">
      <div className="card active">
        <div className="card-hdr"><span className="icon">🫧</span> Los alvéolos</div>
        <div className="card-body">
          <p>Hay <span className="tag">≈ 3×10⁸ alvéolos</span>, cada uno de ~0,2–0,3 mm de diámetro, con paredes de ~0,4 μm. Están bañados por los capilares pulmonares (que a su vez se ramifican en 17 órdenes, Tabla 9.2): el O₂ se difunde al glóbulo rojo y el CO₂ sale hacia el aire alveolar.</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">📐</span> 80 m² de área</div>
        <div className="card-body">
          <p>El área superficial alveolar total es <span className="tag">≈ 80 m²</span> (rango 50–100), contra solo ~0,1 m² de superficie externa de los pulmones: la subdivisión en alvéolos multiplica el área de contacto por casi <span className="tag">1.000</span>, y con ella la captación de O₂.</p>
          <table className="data-mini">
            <tr><th>Tabla 9.2 · orden</th><th>n vasos</th><th>L (mm)</th><th>d (mm)</th></tr>
            <tr><td>1</td><td>1</td><td>90,5</td><td>30,0</td></tr>
            <tr><td>5</td><td>66</td><td>17,9</td><td>3,65</td></tr>
            <tr><td>10</td><td>17.560</td><td>2,10</td><td>0,351</td></tr>
            <tr><td>13</td><td>471.300</td><td>0,65</td><td>0,086</td></tr>
            <tr><td>17</td><td>3×10⁸</td><td>0,13</td><td>0,013</td></tr>
          </table>
          <p className="table-caption">Estructura de ramificación de la red arterial pulmonar.</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">🔄</span> El viaje del O₂ y del CO₂</div>
        <div className="card-body">
          <p>Presiones parciales (mmHg): en los alvéolos O₂ ≈ 105 (la atmósfera da 159 = 21 % de 760; el <strong>volumen muerto</strong> la baja); en el capilar pulmonar el O₂ sube de 40 a ≈ 100; en los tejidos es 40. El CO₂ alveolar ≈ 40; en el capilar baja de 46 a ≈ 40; en los tejidos es 46. La presión venosa sistémica de O₂ es ≈ 40 — y vuelve a 100 en los pulmones.</p>
        </div>
      </div>
      <div className="apuntes">
        <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
        <div className="a-text" id="info-text-3">El O₂ viaja por gradiente de presión parcial: 159 (aire) → 105 (alvéolo) → 40→100 (capilar) → 40 (tejido). El CO₂ va en reversa: 46 (tejido) → 40 (alvéolo). Elige el lugar del circuito en el canvas y mira las dos presiones; la clave de la adaptación a la altura (slide 21) es que la venosa no cambia.</div>
      </div>
    </div>
    <div className="sim-col">
      <div className="sim-area">
        <Sim id="sim-gas" />
        <div className="prof-controls">
          <span className="badge">intercambio</span>
          <label>lugar <select id="gs_sel" onChange={(e) => { engine.setParam("gs_sel" as keyof SimParams, (e.target as HTMLSelectElement).value as any); engine.requestDraw(); }}>
            <option value="aire" selected>Aire</option>
            <option value="alveolo">Alvéolos</option>
            <option value="capilar">Capilar pulmonar</option>
            <option value="arteria">Arteria sistémica</option>
            <option value="tejido">Tejidos</option>
            <option value="vena">Vena sistémica</option>
          </select></label>
          <span className="readout" id="gs_out">Aire · O₂ 159 mmHg · CO₂ 0,3</span>
        </div>
      </div>
    </div>
  </div>

{/* ═══════════ M2 · LOS ALVÉOLOS ═══════════ */}
    </>
  );
}
