import React from 'react';
import type { Engine } from './useEngine';
import Sim from './Sim';

export default function Slide18({
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
    <span className="mnum">12 · 6</span>
    <span className="mtitle">Arritmias, infarto y diagnóstico</span>
    <span className="msub">{"\\(\\text{taquicardia} > 100\\ \\mathrm{lpm}\\qquad \\text{bradicardia} &lt; 60\\ \\mathrm{lpm}\\)"}</span>
    <span className="mslide-count">18 / 24</span>
  </div>
  <div className="content-grid">
    <div className="theory">
      <div className="card active">
        <div className="card-hdr"><span className="icon">⏱️</span> Lo que revela el ritmo</div>
        <div className="card-body">
          <p>El ECG informa frecuencia, ritmo (arritmias), eje, hipertrofia, agrandamiento e infarto. <strong>Taquicardia</strong> &gt; 100 lpm (aleteo o fibrilación &gt; 250 puede ser mortal en ventrículos); <strong>bradicardia</strong> &lt; 60 lpm (normal en atletas). La relación 1:1 aurícula–ventrículo puede romperse (Cap. 8).</p>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr"><span className="icon">🩹</span> El infarto de miocardio</div>
        <div className="card-body">
          <p>Horas después del infarto las células muertas no despolarizan: el dipolo apunta <em>lejos</em> de la zona muerta y aparece una <strong>onda Q acentuada</strong> en las derivaciones que miran al sitio. Y las señales ST elevadas suben a las 2 h y vuelven a la normalidad tras la <strong>trombolisis</strong> (Fig. 12.37).</p>
          <div className="eq-block">{"\\[ \\text{onda Q: } \\mathrm{I}, \\mathrm{aVL} \\to \\text{lateral};\\quad \\mathrm{V1}{-}\\mathrm{V4} \\to \\text{anterior};\\quad \\mathrm{II},\\mathrm{III},\\mathrm{aVF} \\to \\text{inferior} \\]"}</div>
          <p><span className="tag">Q patológica</span><span className="tag">ST elevado</span><span className="tag">trombolisis</span></p>
        </div>
      </div>
      <div className="apuntes">
        <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
        <div className="a-text" id="info-text-18">Compara los trazados: normal vs infarto (ST elevado + Q ancha) y la taquicardia. En el infarto la derivación que mira a la zona muerta «pierde» su vector: aparece la Q.</div>
      </div>
    </div>
    <div className="sim-col">
      <div className="sim-area">
        <Sim id="sim-ar" className="sim" />
        <div className="prof-controls">
          <span className="badge">diagnóstico</span>
          <label>Escenario <select id="ar_sel" onChange={(e) => engine.setParam('ar_sel' as any, parseInt(e.target.value, 10))}><option value="0">Normal · 72 lpm</option><option value="1">Taquicardia · 150</option><option value="2">Bradicardia · 45</option><option value="3">Infarto · ST elevado + Q</option></select></label>
          <span className="readout" id="ar_out">Normal · 72 lpm</span>
        </div>
      </div>
    </div>
  </div>
    </>
  );
}
