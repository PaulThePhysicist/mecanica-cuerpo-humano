import React, { useState } from 'react';
import { C } from './palette';
import LeverCanvas from './LeverCanvas';
import LeverAnatomyCanvas from './LeverAnatomyCanvas';
import { TheoryToggle, TheoryCue } from './TheoryToggle';
import BicepsCanvas from './BicepsCanvas';
import HudPanel from './HudPanel';
import KatexHtml from './KatexHtml';
import type { Engine } from './useEngine';
import { G } from './staticsModels';
import { fx } from './ab';

interface LeverDetail {
  id: 1 | 2 | 3;
  name: string;
  order: string;
  anat: string;
  vm: string;
  desc: string;
}

const LEVERS_INFO: Record<number, LeverDetail> = {
  1: {
    id: 1,
    name: '1ª clase',
    order: 'Músculo — Fulcro — Peso',
    anat: 'Balancín · cabeza sobre la columna · tríceps sobre el codo',
    vm: 'VM > 1 o < 1 según los brazos',
    desc: '<b>1ª clase:</b> peso y músculo actúan a lados opuestos del fulcro y en la misma dirección (hacia abajo); el fulcro aporta $W + M$ hacia arriba. Es la menos común en el cuerpo: la cabeza sobre la columna (Fig. 2.6a) y el tríceps tirando del cúbito (Fig. 2.6b), donde $d_M \\ll d_W$ y el tríceps debe hacer mucha más fuerza que la mano. Brazos del visor ilustrativos ($d_M = 5$, $d_W = 12\\text{ cm}$).',
  },
  2: {
    id: 2,
    name: '2ª clase',
    order: 'Fulcro — Peso — Músculo',
    anat: 'Ponerse de puntillas (Aquiles) · empujar hacia abajo con el tríceps',
    vm: 'VM > 1: M < W',
    desc: '<b>2ª clase:</b> músculo y peso del mismo lado del fulcro, con el peso más cerca; $M < W$ y la ventaja mecánica $W/M = d_M/d_W$ es $> 1$. Segunda en frecuencia: ponerse de puntillas, con el fulcro en los dedos y el tendón de Aquiles tirando del talón (Fig. 2.6c). Brazos del visor ilustrativos ($d_M = 18$, $d_W = 10\\text{ cm}$).',
  },
  3: {
    id: 3,
    name: '3ª clase',
    order: 'Fulcro — Músculo — Peso',
    anat: 'Bíceps sobre el radio · sostener un peso con el brazo extendido',
    vm: 'VM < 1: M ≫ W',
    desc: '<b>3ª clase:</b> la más común. El músculo está más cerca del fulcro que el peso: con $d_M = 4\\text{ cm}$ y $d_W = 36\\text{ cm}$, $M = (d_W/d_M)\\,W = 9\\,W$ (desventaja mecánica). La ganancia: el desplazamiento del peso se amplifica por $d_W/d_M$. El bíceps mide unos $25\\text{ cm}$ y se contrae como mucho $\\sim 7\\text{--}8\\text{ cm}$, pero la mano recorre mucho más.',
  },
};

export default function Slide3({
  isActive,
  engine,
}: {
  isActive?: boolean;
  engine?: Engine;
  [key: string]: any;
}) {
  const [leverClass, setLeverClass] = useState<1 | 2 | 3>(3);
  // Los letreros del visor los enciende el texto de abajo, no un botón
  // sobre el lienzo: el mando cuelga del párrafo que los explica.
  const [showLabels, setShowLabels] = useState<boolean>(false);
  const [loadKg, setLoadKg] = useState<number>(10);
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');

  const curDetail = LEVERS_INFO[leverClass] || LEVERS_INFO[3];

  const handleSelect = (c: 1 | 2 | 3) => {
    setLeverClass(c);
  };

  const handleReset = () => {
    setLeverClass(3);
    setLoadKg(10);
  };

  // Brazos d_M y d_W (cm). 3ª clase: valores del libro (4 y 36 cm, Caso 1).
  const bp = leverClass === 1 ? 5 : (leverClass === 2 ? 18 : 4);
  const br = leverClass === 1 ? 12 : (leverClass === 2 ? 10 : 36);
  const vm = bp / br;
  const wN = loadKg * G;
  const fmN = wN / vm;

  return (
    <>
      <div className="module-header">
        <span className="mnum">B1</span>
        <h2 className="mtitle">Las tres clases de palancas</h2>
        <span className="msub">{'1ª, 2ª y 3ª clase · $M\\,d_M = W\\,d_W$ (Ecs. 2.9–2.10) en la anatomía humana'}</span>
        <span className="mslide-count">1 / 4</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">⚖️</span> Principio de la palanca y ventaja mecánica
            </div>
            <div className="card-body">
              <p style={{ fontSize: '.7rem' }}>
                {'Un peso $W$ y una fuerza muscular $M$ actúan sobre un hueso que se apoya en un fulcro (la articulación), a distancias $d_W$ y $d_M$. Para los tres tipos el torque total es cero cuando'}
              </p>
              <div className="eq-block">
                {'\\[ M\\,d_M = W\\,d_W \\qquad\\Rightarrow\\qquad M = \\frac{d_W}{d_M}\\,W, \\qquad \\text{VM} = \\frac{W}{M} = \\frac{d_M}{d_W} \\]'}
              </div>
              <p style={{ fontSize: '.64rem', color: 'var(--ink-3)' }}>
                {'Si el músculo no llega a esa $M$ no hay equilibrio (la bola de plomo pesa demasiado); si la supera, hay movimiento (lanzar una pelota). El eje puede elegirse en cualquier punto: a una distancia $x$ del peso, $Wx + (W+M)(d_W - x) - M(d_W + d_M - x) = 0$ (Ec. 2.12, Fig. 2.5) se reduce de nuevo a $W d_W - M d_M = 0$.'}
              </p>
              <div style={{ marginTop: '0.62rem' }}>
                <TheoryToggle on={showLabels} onClick={() => setShowLabels((v) => !v)}>
                  <b>Rotular fuerzas y brazos</b>
                </TheoryToggle>
              </div>
              <TheoryCue>
                En la vista <b>3D · Anatomía</b>, etiqueta sobre el modelo la fuerza muscular, el peso
                y los brazos <b>d<sub>M</sub></b> y <b>d<sub>W</sub></b> que entran en la fórmula.
              </TheoryCue>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">📋</span> Clasificación anatómica
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {[1, 2, 3].map((c) => {
                  const item = LEVERS_INFO[c as 1 | 2 | 3];
                  const isSel = leverClass === c;
                  return (
                    <button
                      type="button"
                      key={c}
                      onClick={() => handleSelect(c as 1 | 2 | 3)}
                      aria-pressed={isSel}
                      style={{
                        padding: '.35rem .5rem',
                        width: '100%',
                        font: 'inherit',
                        textAlign: 'left',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: isSel ? 'var(--teal-tint)' : 'var(--paper-2)',
                        border: `1px solid ${isSel ? 'var(--teal)' : 'var(--line)'}`,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span>
                        <b style={{ color: isSel ? 'var(--teal-deep)' : 'var(--ink)', fontSize: '.68rem' }}>{item.name}</b>
                        <br />
                        <span style={{ fontSize: '0.62rem', color: 'var(--ink-3)' }}>{item.anat}</span>
                      </span>
                      <span style={{ fontSize: '0.62rem', fontFamily: 'JetBrains Mono, monospace', color: isSel ? 'var(--teal-deep)' : 'var(--ink-2)', fontWeight: 'bold' }}>
                        {item.vm}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
            <div className="a-text" id="info-text-3">
              <KatexHtml html={curDetail.desc} />
            </div>
          </div>
        </div>

        <div className="sim-area" style={{ position: 'relative' }}>
          {/* Panel HUD Colapsable */}
          <HudPanel
            title="PALANCAS ANATÓMICAS"
            badge={leverClass === 1 ? '1ª CLASE' : (leverClass === 2 ? '2ª CLASE (VM > 1)' : '3ª CLASE (VM < 1)')}
            footer="💡 Selecciona la clase para comparar fulcro y brazos de palanca"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '0.62rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '2px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Tipo:</span>
                <b style={{ color: 'var(--teal-deep)' }}>{curDetail.name.split(':')[0]}</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '2px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Secuencia:</span>
                <b style={{ fontSize: '0.62rem' }}>{curDetail.order}</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '2px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Fuerza muscular (M):</span>
                <b style={{ color: 'var(--blood)', fontFamily: 'var(--mono)' }}>{fx(fmN)} N ({fx(fmN / wN, 2)} W)</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '2px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Peso (W):</span>
                <b style={{ color: 'var(--amber)', fontFamily: 'var(--mono)' }}>{fx(wN)} N ({loadKg} kg)</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--ink-2)' }}>Ventaja Mecánica (VM):</span>
                <b style={{ color: leverClass === 2 ? C.coronal : C.blood, fontFamily: 'JetBrains Mono, monospace' }}>
                  VM = {fx(vm, 2)} · d<sub>M</sub> {bp} cm · d<sub>W</sub> {br} cm
                </b>
              </div>
            </div>
          </HudPanel>

          <div className="lever-view-stage">
            <div className="lever-view-toggle" role="group" aria-label="Vista de la palanca">
              <button
                type="button"
                className={viewMode === '2d' ? 'active' : ''}
                aria-pressed={viewMode === '2d'}
                onClick={() => setViewMode('2d')}
              >
                2D · Diagrama
              </button>
              <button
                type="button"
                className={viewMode === '3d' ? 'active' : ''}
                aria-pressed={viewMode === '3d'}
                onClick={() => setViewMode('3d')}
              >
                3D · Anatomía
              </button>
            </div>
            {viewMode === '2d' ? (
              <LeverCanvas
                leverClass={leverClass}
                loadKg={loadKg}
                onSelectClass={handleSelect}
              />
            ) : leverClass === 3 ? (
              // La 3ª clase se ilustra con el codo real, no con el esquema de palanca:
              // también tiene que obedecer al mando de letreros del texto.
              <BicepsCanvas showLabels={showLabels} handLoadKg={loadKg} insertCm={4} elbowAngleDeg={90} cameraTarget={[0, 0.24, 0]} />
            ) : (
              <LeverAnatomyCanvas showLabels={showLabels} leverClass={leverClass} />
            )}
          </div>
          <div className="prof-controls">
            <span className="badge">§2.2 · Palancas</span>

            {/* Selector de clase segmentado */}
            <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
              {[1, 2, 3].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => handleSelect(c as 1 | 2 | 3)}
                  style={{
                    background: leverClass === c ? 'var(--teal)' : 'var(--paper-2)',
                    color: leverClass === c ? C.card : 'var(--ink)',
                    border: '1px solid var(--line)',
                    borderRadius: '3px',
                    padding: '2px 7px',
                    fontSize: '0.62rem',
                    fontWeight: leverClass === c ? 700 : 500,
                    cursor: 'pointer',
                  }}
                >
                  {c}ª Clase {c === 1 ? '(Nuca)' : (c === 2 ? '(Tobillo)' : '(Codo)')}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.62rem', alignItems: 'center', fontSize: '0.62rem', marginLeft: 'auto' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                <span>Carga:</span>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={loadKg}
                  onChange={(e) => setLoadKg(parseFloat(e.target.value))}
                  style={{ width: '55px' }}
                />
                <b style={{ fontFamily: 'JetBrains Mono, monospace', minWidth: '32px' }}>{loadKg} kg</b>
              </label>

              <button
                type="button"
                onClick={handleReset}
                style={{
                  background: 'var(--paper-2)',
                  border: '1px solid var(--line)',
                  borderRadius: '4px',
                  padding: '2px 7px',
                  fontSize: '0.62rem',
                  cursor: 'pointer',
                  color: 'var(--ink)',
                }}
              >
                Reset
              </button>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
