import React from 'react';
import Sim from './Sim';
import type { Engine } from './useEngine';
import type { SimParams } from './sims';

export default function Slide17({
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
    <span className="mnum">9.5.4</span>
    <span className="mtitle">Obstructivo vs. restrictivo</span>
    <span className="msub">R alta (asma, bronquitis, enfisema) · C baja (fibrosis, SDR)</span>
    <span className="mslide-count">17 / 24</span>
  </div>
  <div className="content-grid">
    <div className="theory">
      <div className="card active">
        <div className="card-hdr"><span className="icon">🚑</span> Dos familias de enfermedades</div>
        <div className="card-body">
          <p><strong>Obstructivas</strong>: obstrucción de vías → {"\\( R \\)"} alta y espiración limitada a frecuencias rápidas. Incluyen bronquitis crónica (moco excesivo), enfisema (agrandamiento y destrucción de las paredes alveolares) y asma (estrechamiento generalizado, a veces espontáneo). <strong>Restrictivas</strong>: expansión restringida → {"\\( C \\)"} baja; fibrosis pulmonar y SDR; menor CV pero la R por volumen no sube.</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">📉</span> Volumen inspirado (Fig. 9.20)</div>
        <div className="card-body">
          <p>El volumen inspirado es muy bajo si la compliancia es menor que la normal y/o la resistencia es mayor. En el <strong>enfisema</strong>, los pulmones se vuelven menos elásticos y más compliantes, y la R domina la respiración. En la <strong>fibrosis</strong>, la C cae por el tejido fibroso.</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">🫧</span> Causas de la obstrucción (Fig. 9.19)</div>
        <div className="card-body">
          <p>Secreciones excesivas, engrosamiento de la pared (edema o hipertrofia muscular) y anomalías externas (ganglios, edema, destrucción del tejido alveolar). En el enfisema las vías tienden a colapsar por pérdida de tracción radial (Fig. 9.22).</p>
        </div>
      </div>
      <div className="apuntes">
        <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
        <div className="a-text" id="info-text-17">Regla mnemotécnica: obstructivo = cuesta <em>sacar</em> el aire (R alta); restrictivo = no <em>hay espacio</em> (C baja). En el canvas elige la condición y recorre el tiempo con el slider: el restrictivo llega rápido pero a poco volumen, el obstructivo sube lento.</div>
      </div>
    </div>
    <div className="sim-col">
      <div className="sim-area">
        <Sim id="sim-inspvol" />
        <div className="prof-controls">
          <span className="badge">llenado</span>
          <label>condición <select id="ob_sel" onChange={(e) => { engine.setParam("ob_sel" as keyof SimParams, (e.target as HTMLSelectElement).value as any); engine.requestDraw(); }}>
            <option value="normal" selected>Normal</option>
            <option value="restr">Restrictiva (C baja)</option>
            <option value="obstr">Obstructiva (R alta)</option>
          </select></label>
          <label>t <input type="range" id="ob_t" min="0" max="40" step="1" defaultValue="10" onInput={(e) => { engine.setParam("ob_t" as keyof SimParams, parseFloat((e.target as HTMLInputElement).value)); engine.requestDraw(); }} /> <span id="ob_tv">1,0 s</span></label>
          <span className="readout" id="ob_out">V(t) normal ≈ 0,39 L</span>
        </div>
      </div>
    </div>
  </div>
    </>
  );
}
