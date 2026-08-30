import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide5({
  engine,
  go,
  goModule,
  next,
  prev,
  toggleAction,
  toggleEinhoven,
  toggleECG,
  toggleMyo,
  toggleEEG,
}: {
  isActive?: boolean;
  engine: Engine;
  go?: (n: number) => void;
  goModule: (m: number) => void;
  next?: () => void;
  prev?: () => void;
  toggleAction?: () => void;
  toggleEinhoven?: () => void;
  toggleECG?: () => void;
  toggleMyo?: () => void;
  toggleEEG?: () => void;
}) {
  return (
    <>
<div className="module-header">
    <span className="mnum">12 · 2</span>
    <span className="mtitle">La resistividad de los tejidos</span>
    <span className="msub">{"\\(\\rho\\ \\mathrm{en}\\ \\Omega\\cdot\\mathrm{m}\\qquad \\text{escala logarítmica}\\)"}</span>
    <span className="mslide-count">5 / 24</span>
  </div>
  <div className="content-grid">
    <div className="theory">
      <div className="card active">
        <div className="card-hdr"><span className="icon">🧍</span> Del LCR al hueso: 8 órdenes de magnitud</div>
        <div className="card-body">
          <p>Los tejidos son <em>dieléctricos con fugas</em>: conducen algo, pero poco. A baja frecuencia (Tabla 12.4):</p>
          <table className="data-mini">
            <tr><th>Tejido</th><th>ρ (Ω·m)</th></tr>
            <tr><td>Líquido cefalorraquídeo</td><td>0,650</td></tr>
            <tr><td>Plasma</td><td>0,7</td></tr>
            <tr><td>Sangre</td><td>1,6</td></tr>
            <tr><td>Músculo long./transv.</td><td>1,25–3,45 / 6,75–18</td></tr>
            <tr><td>Materia gris / blanca</td><td>2,8 / 6,8</td></tr>
            <tr><td>Grasa</td><td>20</td></tr>
            <tr><td>Hueso</td><td>« 40</td></tr>
            <tr><td>Piel húmeda / seca</td><td>10⁵ / 10⁷</td></tr>
            <tr className="table-caption"><td colSpan={2}>La piel seca es la peor conductora del cuerpo.</td></tr>
          </table>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">🪞</span> Anisotropía y trayectos</div>
        <div className="card-body">
          <p>El músculo conduce <strong>3–7× mejor a lo largo</strong> de las fibras que a través (1,25–3,45 vs 6,75–18 Ω·m); el pulmón inspirado (17) peor que espirado (8). La resistencia de un trayecto: {"\\(R = \\rho L/A\\)"}. Por eso el ECG «ve» el corazón: el torso es un <em>conductor de volumen</em> con sangre buena conductora.</p>
          <div className="eq-block">{"\\[ \\rho = \\frac{1}{\\sigma} \\;\\Longrightarrow\\; R = \\frac{\\rho L}{A} \\]"}</div>
        </div>
      </div>
      <div className="apuntes">
        <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
        <div className="a-text" id="info-text-5">La escala es logarítmica: de 0,65 (LCR) a 10⁷ Ω·m (piel seca) van 7 décadas. La piel húmeda (~1 kΩ) es la frontera que decide si un contacto «agarra» o no.</div>
      </div>
    </div>
    <div className="sim-col">
      <div className="sim-area">
        <Sim id="sim-rt" className="sim" />
        <div className="prof-controls">
          <span className="badge">tejidos</span>
          <label>Tejido <select id="rt_sel" onChange={(e) => engine.setParam('rt_sel' as any, parseInt(e.target.value, 10))}><option value="0">LCR 0,650</option><option value="1">Plasma 0,7</option><option value="2">Sangre 1,6</option><option value="3">Músculo long.</option><option value="4">Materia gris 2,8</option><option value="5">Grasa 20</option><option value="6">Hueso 40</option><option value="7">Piel húmeda 10⁵</option><option value="8">Piel seca 10⁷</option></select></label>
          <span className="readout" id="rt_out">LCR · 0,650 Ω·m</span>
        </div>
      </div>
    </div>
  </div>
    </>
  );
}
