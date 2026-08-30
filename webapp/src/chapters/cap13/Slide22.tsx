import React from 'react';
import Sim from './Sim';
import type { Engine } from './useEngine';

interface SlideProps {
  isActive?: boolean;
  engine?: Engine;
}

export default function Slide22({ engine }: SlideProps) {
  const sel = engine?.paramsRef.current.pr_sel ?? 0;
  const isPlaying = engine?.flagsRef.current.prPlaying ?? false;

  const togglePlay = () => {
    if (!engine) return;
    const next = !engine.flagsRef.current.prPlaying;
    engine.setFlag('prPlaying', next);
    if (next) engine.setFlag('prT', 0);
    engine.requestDraw();
  };

  return (
    <>
      <div className="module-header">
        <span className="mnum">13 · 8</span>
        <span className="mtitle">Problemas 13.4 y 13.6</span>
        <span className="msub">enfriamiento/recalentamiento · anestesia</span>
        <span className="mslide-count">22 / 24</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">❄️</span> 13.4: Enfriamiento y recalentamiento
            </div>
            <div className="card-body">
              <p>
                <strong>(a) Enfriamiento cadavérico / sin metabolismo:</strong> Un cuerpo de 70 kg sin generación térmica cae
                hacia la temperatura ambiente ({"\\(T_\\text{hab} = 21\\ ^\\circ\\mathrm{C}\\)"}) siguiendo la ley de enfriamiento de
                Newton con {"\\(\\tau_r = 2{,}4\\ \\text{h}\\)"}.
              </p>
              <p>
                <strong>(b) Recalentamiento a tasa BMR:</strong> Al restaurar el metabolismo basal (70 kcal/h), el núcleo
                remonta exponencialmente a 37 °C.<br />
                <strong>(c) Tasa metabólica cumbre:</strong> El tiritar intenso o ejercicio eleva la producción de calor hasta 6×,
                acelerando el recalentamiento.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">💉</span> 13.6: Efecto de la anestesia general
            </div>
            <div className="card-body">
              <p>
                La anestesia general bloquea los escalofríos, inhibe la vasoconstricción cutánea y reduce la tasa metabólica un
                20–30%. Al anular estos tres efectores homeostáticos, el paciente pierde toda defensa contra el ambiente quirúrgico
                frío, cayendo en <strong>hipotermia intraoperatoria</strong> a menos que se apliquen mantas térmicas activas.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr">
              <span>✍️</span> Apunte de cátedra
            </div>
            <div className="a-text" id="info-text-22">
              ▶ anima el enfriamiento (a) y el recalentamiento (b/c): sin generación térmica el cuerpo cae a la temperatura ambiente
              con {"\\(\\tau_r = 2{,}4\\ \\text{h}\\)"}; al encender el metabolismo, remonta a 37 °C.
            </div>
          </div>
        </div>
        <div className="sim-col">
          <div className="sim-area">
            <Sim id="sim-pr" />
            <div className="prof-controls">
              <span className="badge">13.4</span>
              <button id="pr_play" onClick={togglePlay} type="button">
                {isPlaying ? '⏸' : '▶'}
              </button>
              <label>
                Escenario{' '}
                <select
                  id="pr_sel"
                  value={sel}
                  onChange={(e) => {
                    engine?.setParam('pr_sel', Number(e.target.value));
                    engine?.requestDraw();
                  }}
                >
                  <option value="0">Enfriamiento (sin mét.)</option>
                  <option value="1">Recalentamiento (BMR)</option>
                  <option value="2">Recalentamiento (cumbre)</option>
                </select>
              </label>
              <span className="readout" id="pr_out">
                {sel === 0 ? 'T baja a 21 °C · τr 2,4 h' : 'T sube a 37 °C'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
