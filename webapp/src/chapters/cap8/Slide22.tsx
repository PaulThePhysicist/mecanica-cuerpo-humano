import React from 'react';
import Sim from './Sim';
import type { Engine } from './useEngine';

export default function Slide22({
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
    <span className="mnum">8.4</span>
    <span className="mtitle">Disfunción cardíaca: ESPVR y EDPVR</span>
    <span className="msub">La contractilidad vs. la rigidez del llenado</span>
    <span className="mslide-count">22 / 24</span>
  </div>
  <div className="content-grid">
    <div className="theory">
      <div className="card active">
        <div className="card-hdr"><span className="icon">📉</span> Las dos curvas del ventrículo</div>
        <div className="card-body">
          <p>La relación presión-volumen tiene dos límites: la <span className="tag">ESPVR</span> (fin de sístole, pendiente = contractilidad {"\\( E_{\\max} \\)"}) y la <span className="tag">EDPVR</span> (fin de diástole, pendiente = rigidez). Entre ambas vive el lazo del latido.</p>
          <div className="eq-block">{"\\[  \\text{EF} = \\frac{V_{\\text{stroke}}}{V_{\\text{ED}}} \\qquad \\text{(normal 55–75 %)}  \\]"}</div>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">🫀</span> Disfunción sistólica</div>
        <div className="card-body">
          <p>Menor contractilidad → ESPVR menos empinada (ej. <span className="tag">DCM, miocardiopatía dilatada</span>). El corazón no se vacía: {"\\( V_{\\text{ES}} \\)"} sube, el EF cae y la cámara se dilata.</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">🎈</span> Disfunción diastólica</div>
        <div className="card-body">
          <p>Mayor rigidez → EDPVR más empinada (ej. <span className="tag">HCM, RCM</span>). El llenado es difícil: {"\\( V_{\\text{ED}} \\)"} pequeño, presiones de llenado altas y congestión pulmonar, con EF conservado.</p>
        </div>
      </div>
      <div className="apuntes">
        <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
        <div className="a-text" id="info-text-22">La insuficiencia cardíaca tiene dos físicas: no empuja (ESPVR plana, EF bajo) o no se llena (EDPVR empinada, EF «normal»). En el canvas baja la contractilidad y el lazo se aplana y se va a la derecha (dilatación); sube la rigidez y el lazo se comprime contra altas presiones.</div>
      </div>
    </div>
    <div className="sim-col">
      <div className="sim-area">
        <Sim id="sim-dysfunction" />
        <div className="prof-controls">
          <span className="badge">ESPVR / EDPVR</span>
          <label>contractilidad <input type="range" id="df_ct" min="0.5" max="1.5" step="0.05" defaultValue={1} onChange={(e) => { engine.setParam('df_ct', parseFloat(e.target.value)); engine.requestDraw(); }} /> <span id="df_ctv">1,0</span></label>
          <label>rigidez <input type="range" id="df_st" min="0.5" max="2" step="0.05" defaultValue={1} onChange={(e) => { engine.setParam('df_st', parseFloat(e.target.value)); engine.requestDraw(); }} /> <span id="df_stv">1,0</span></label>
          <span className="readout" id="df_out">EF ≈ 57 % · normal</span>
        </div>
      </div>
    </div>
  </div>
    </>
  );
}
