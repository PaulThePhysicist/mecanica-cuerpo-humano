import React, { useState } from 'react';
import LeverCanvas from './LeverCanvas';
import LeverAnatomyCanvas from './LeverAnatomyCanvas';
import { TheoryToggle, TheoryCue } from './TheoryToggle';
import BicepsCanvas from './BicepsCanvas';
import HudPanel from './HudPanel';
import type { Engine } from './useEngine';

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
    name: '1ª Clase: Interapoyo',
    order: 'Potencia — Fulcro — Resistencia',
    anat: 'Articulación Atlanto-occipital (Cabeza/Cuello) y Tríceps',
    vm: 'VM variable (puede ser > 1 o < 1)',
    desc: '<b>1ª Clase (Interapoyo):</b> El fulcro está entre la potencia y la resistencia. En la cabeza, los músculos de la nuca (esplenio y trapecio) tiran hacia abajo ($b_p \\approx 5\\text{ cm}$) para equilibrar el peso anterior de la cabeza ($b_r \\approx 12\\text{ cm}$) sobre el atlas ($C_1$), requiriendo $F_m \\approx 2{,}4 \\times W$.',
  },
  2: {
    id: 2,
    name: '2ª Clase: Interresistencia',
    order: 'Fulcro — Resistencia — Potencia',
    anat: 'Apoyo plantar sobre metatarsos (Gemelos y Sóleo)',
    vm: 'VM > 1 (Ahorro de fuerza muscular permanente)',
    desc: '<b>2ª Clase (Interresistencia):</b> La resistencia está entre el fulcro y la potencia. Al pararse de puntillas, el tendón de Aquiles tira a mayor distancia del fulcro ($b_p = 18\\text{ cm} > b_r = 10\\text{ cm}$), logrando ventaja mecánica ($\\text{VM} = 1{,}8$) que permite elevar todo el peso corporal con facilidad.',
  },
  3: {
    id: 3,
    name: '3ª Clase: Interpotencia',
    order: 'Fulcro — Potencia — Resistencia',
    anat: 'Flexión de codo (Bíceps), Mandíbula, Cuádriceps',
    vm: 'VM < 1 (Desventaja de fuerza, gran ventaja de velocidad)',
    desc: '<b>3ª Clase (Interpotencia):</b> La potencia muscular está entre el fulcro y la carga ($b_p = 4\\text{ cm} < b_r = 35\\text{ cm}$). Es la más abundante en el cuerpo: sacrifica fuerza ($F_m \\approx 8{,}75 \\times W$) pero amplifica por $8{,}75\\times$ la velocidad y el arco de movimiento de las manos y pies.',
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

  const bp = leverClass === 1 ? 5 : (leverClass === 2 ? 18 : 4);
  const br = leverClass === 1 ? 12 : (leverClass === 2 ? 10 : 35);
  const vm = bp / br;
  const wN = loadKg * 9.81;
  const fmN = wN / vm;

  return (
    <>
      <div className="module-header">
        <span className="mnum">B1</span>
        <h2 className="mtitle">Las tres clases de palancas</h2>
        <span className="msub">{'1ª, 2ª y 3ª clase · Ventaja mecánica $\\text{VM} = b_p / b_r$ en la anatomía humana'}</span>
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
                {'Una palanca es un cuerpo rígido articulado en un fulcro fijo ($\\Delta$). El equilibrio estático de momentos exige:'}
              </p>
              <div className="eq-block">
                {'\\[ F_m\\, b_p = W\\, b_r \\qquad\\Rightarrow\\qquad \\text{VM} = \\frac{W}{F_m} = \\frac{b_p}{b_r} \\]'}
              </div>
              <p style={{ fontSize: '.64rem', color: 'var(--ink-3)' }}>
                {'Donde $b_p$ es el brazo de potencia muscular y $b_r$ es el brazo de resistencia externa.'}
              </p>
            
              <div style={{ marginTop: '.4rem' }}>
                <TheoryToggle on={showLabels} onClick={() => setShowLabels((v) => !v)}>
                  <b>🏷️ Rotular fuerzas y brazos</b>
                </TheoryToggle>
              </div>
              <TheoryCue>
                En la vista <b>3D · Anatomía</b>, etiqueta sobre el modelo la potencia, la resistencia
                y los brazos <b>b<sub>p</sub></b> y <b>b<sub>r</sub></b> que entran en la fórmula.
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
                        <span style={{ fontSize: '.55rem', color: 'var(--ink-3)' }}>{item.anat}</span>
                      </span>
                      <span style={{ fontSize: '.60rem', fontFamily: 'JetBrains Mono, monospace', color: isSel ? 'var(--teal-deep)' : 'var(--ink-2)', fontWeight: 'bold' }}>
                        {c === 1 ? 'VM = 0,42' : (c === 2 ? 'VM = 1,80' : 'VM = 0,11')}
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
              <span dangerouslySetInnerHTML={{ __html: curDetail.desc }} />
            </div>
          </div>
        </div>

        <div className="sim-area" style={{ position: 'relative' }}>
          {/* Panel HUD Colapsable */}
          <HudPanel
            title="PALANCAS ANATÓMICAS"
            badge={leverClass === 1 ? '1ª CLASE (INTERAPOYO)' : (leverClass === 2 ? '2ª CLASE (VM > 1)' : '3ª CLASE (VM < 1)')}
            icon="⚖️"
            footer="💡 Selecciona la clase para comparar fulcro y brazos de palanca"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '0.58rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '2px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Tipo:</span>
                <b style={{ color: 'var(--teal-deep)' }}>{curDetail.name.split(':')[0]}</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '2px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Secuencia:</span>
                <b style={{ fontSize: '0.54rem' }}>{curDetail.order}</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '2px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Fuerza Músculo (Fm):</span>
                <b style={{ color: '#b02318', fontFamily: 'JetBrains Mono, monospace' }}>{fmN.toFixed(0)} N ({(fmN / 9.81).toFixed(1)} kgf)</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '2px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Carga Aplicada (W):</span>
                <b style={{ color: '#d97706', fontFamily: 'JetBrains Mono, monospace' }}>{wN.toFixed(0)} N ({loadKg} kg)</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--ink-2)' }}>Ventaja Mecánica (VM):</span>
                <b style={{ color: leverClass === 2 ? '#2e8b57' : '#b02318', fontFamily: 'JetBrains Mono, monospace' }}>
                  VM = {vm.toFixed(2).replace('.', ',')}
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
            <span className="badge">2.2 · Palancas</span>

            {/* Selector de clase segmentado */}
            <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
              {[1, 2, 3].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => handleSelect(c as 1 | 2 | 3)}
                  style={{
                    background: leverClass === c ? 'var(--teal)' : 'var(--paper-2)',
                    color: leverClass === c ? '#fff' : 'var(--ink)',
                    border: '1px solid var(--line)',
                    borderRadius: '3px',
                    padding: '2px 7px',
                    fontSize: '0.58rem',
                    fontWeight: leverClass === c ? 700 : 500,
                    cursor: 'pointer',
                  }}
                >
                  {c}ª Clase {c === 1 ? '(Nuca)' : (c === 2 ? '(Tobillo)' : '(Codo)')}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.60rem', marginLeft: 'auto' }}>
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
                  fontSize: '0.60rem',
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
