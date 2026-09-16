import React, { useState } from 'react';
import DiscPressureCanvas from './DiscPressureCanvas';
import { TheoryToggle, TheoryCue } from './TheoryToggle';
import HudPanel from './HudPanel';
import type { Engine } from './useEngine';

interface PostureDetail {
  id: 'upright' | 'seated' | 'knees' | 'bent_back';
  name: string;
  emoji: string;
  pBase: number;
  mult: number;
  desc: string;
}

const POSTURE_LIST: PostureDetail[] = [
  {
    id: 'upright',
    name: 'De pie erguido',
    emoji: '🚶',
    pBase: 0.50,
    mult: 1.0,
    desc: '<b>De pie erguido (~0,5 MPa / 5 bar):</b> Curvaturas fisiológicas alineadas. La carga axial se distribuye de manera homogénea sobre toda la superficie del disco intervertebral.',
  },
  {
    id: 'seated',
    name: 'Sentado sin respaldo',
    emoji: '🪑',
    pBase: 0.85,
    mult: 1.4,
    desc: '<b>Sentado sin respaldo (~0,85 MPa / 8,5 bar):</b> La retroversión pélvica rectifica la lordosis lumbar y transfiere mayor presión hidrostática hacia el núcleo pulposo.',
  },
  {
    id: 'knees',
    name: 'Levantar con rodillas flexionadas',
    emoji: '🏋️',
    pBase: 1.30,
    mult: 2.2,
    desc: '<b>Levantamiento Ergonómico (~1,3 MPa / 13 bar):</b> El tronco se mantiene erguido; las articulaciones de la cadera y la rodilla asumen el brazo de momento, protegiendo los discos lumbares.',
  },
  {
    id: 'bent_back',
    name: 'Levantar con espalda curva',
    emoji: '⚠️',
    pBase: 2.40,
    mult: 4.8,
    desc: '<b>Levantamiento Lesivo con Espalda Curva (> 2,5 MPa / 25 bar):</b> El núcleo pulposo es comprimido anteriormente y empujado hacia atrás contra el anillo fibroso, <strong>generando riesgo crítico de protrusión o hernia discal</strong>.',
  },
];

export default function Slide10({
  isActive,
  engine,
}: {
  isActive?: boolean;
  engine?: Engine;
  [key: string]: any;
}) {
  const [posture, setPosture] = useState<'upright' | 'seated' | 'knees' | 'bent_back'>('bent_back');
  // Los letreros del visor los enciende el texto de abajo, no un botón
  // sobre el lienzo: el mando cuelga del párrafo que los explica.
  const [showLabels, setShowLabels] = useState<boolean>(false);
  const [loadKg, setLoadKg] = useState<number>(15);

  const curDetail = POSTURE_LIST.find((p) => p.id === posture) || POSTURE_LIST[3];
  const totalP = curDetail.pBase + curDetail.mult * 0.65 * (loadKg / 20);
  const totalPBar = totalP * 10;
  const isCritical = totalP >= 2.50;

  const handleSelectPosture = (id: 'upright' | 'seated' | 'knees' | 'bent_back') => {
    setPosture(id);
    const detail = POSTURE_LIST.find((p) => p.id === id);
    const info = document.getElementById('info-text-10');
    if (info && detail) {
      info.innerHTML = detail.desc;
    }
  };

  const handleReset = () => {
    setPosture('bent_back');
    setLoadKg(15);
    const info = document.getElementById('info-text-10');
    if (info) {
      info.innerHTML = POSTURE_LIST[3].desc;
    }
  };

  return (
    <>
      <div className="module-header">
        <span className="mnum">D2</span>
        <h2 className="mtitle">Presión intradiscal en L5-S1</h2>
        <span className="msub">Esfuerzos de compresión, cizallamiento y prevención de hernias discales</span>
        <span className="mslide-count">2 / 2</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">⚡</span> Esfuerzo compresivo sobre el disco
            </div>
            <div className="card-body">
              <p style={{ fontSize: '.7rem' }}>
                {'El disco intervertebral L5-S1 ($A \\approx 18\\text{ cm}^2$) absorbe la fuerza axial de compresión generada por la musculatura y el peso:'}
              </p>
              <div className="eq-block">
                {'\\[ P = \\frac{R_{\\text{comp}}}{A} = \\frac{F_m\\, \\cos 12^\\circ + (W_1 + W_2)\\, \\cos\\alpha}{18 \\times 10^{-4}\\text{ m}^2} \\]'}
              </div>
              <p style={{ fontSize: '.64rem', color: 'var(--ink-3)' }}>
                {'Umbral fisiológico seguro: $< 1{,}5\\text{ MPa}$. Carga lesiva: $> 2{,}5\\text{ MPa}$ ($25\\text{ bar}$). Límite de fractura trabecular del platillo vertebral: $\\sim 3{,}5\\text{ MPa}$.'}
              </p>
            
              <div style={{ marginTop: '.4rem' }}>
                <TheoryToggle on={showLabels} onClick={() => setShowLabels((v) => !v)}>
                  <b>🏷️ Rotular el disco y la compresión</b>
                </TheoryToggle>
              </div>
              <TheoryCue>Marca los cuerpos vertebrales <b>L5</b> y <b>S1</b>, la zona de herniación y la compresión <b>F<sub>n</sub></b> sobre el disco.</TheoryCue>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🛡️</span> Ergonomía de levantamiento (4 Posturas)
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {POSTURE_LIST.map((item) => {
                  const isSel = posture === item.id;
                  const isCurved = item.id === 'bent_back';
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectPosture(item.id)}
                      style={{
                        padding: '.35rem .5rem',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: isSel ? (isCurved ? 'rgba(176,35,24,0.12)' : 'var(--teal-tint)') : 'var(--paper-2)',
                        border: `1px solid ${isSel ? (isCurved ? '#b02318' : 'var(--teal)') : 'var(--line)'}`,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ fontSize: '.8rem' }}>{item.emoji}</span>
                        <b style={{ color: isSel ? (isCurved ? '#b02318' : 'var(--teal-deep)') : 'var(--ink)', fontSize: '.64rem' }}>
                          {item.name}
                        </b>
                      </div>
                      <span style={{ fontSize: '.58rem', fontFamily: 'JetBrains Mono, monospace', color: isCurved ? '#b02318' : 'var(--teal-deep)', fontWeight: 'bold' }}>
                        ~{item.pBase.toFixed(2)} MPa
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
            <div className="a-text" id="info-text-10">
              <span dangerouslySetInnerHTML={{ __html: curDetail.desc }} />
            </div>
          </div>
        </div>

        <div className="sim-area" style={{ position: 'relative' }}>
          {/* Panel HUD Colapsable */}
          <HudPanel
            title="PRESIÓN INTRADISCAL"
            badge={`${totalP.toFixed(2)} MPa (${totalPBar.toFixed(1)} BAR)`}
            icon="⚡"
            footer="💡 Selecciona la postura para observar la deformación del núcleo pulposo"
            width="270px"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.62rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '3px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Presión L5-S1:</span>
                <b style={{ color: isCritical ? '#b02318' : '#0d6e64', fontFamily: 'JetBrains Mono, monospace' }}>
                  {totalP.toFixed(2)} MPa ({totalPBar.toFixed(1)} bar)
                </b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '3px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Estado Discal:</span>
                <b style={{ color: isCritical ? '#b02318' : '#0d6e64' }}>
                  {isCritical ? '⚠️ Riesgo Crítico de Hernia' : (totalP > 1.0 ? 'Carga Moderada' : 'Zona Fisiológica')}
                </b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '3px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Área Transversal:</span>
                <b style={{ fontFamily: 'JetBrains Mono, monospace' }}>18,0 cm² (0,0018 m²)</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--ink-2)' }}>Carga Levantada:</span>
                <b style={{ color: '#d97706', fontFamily: 'JetBrains Mono, monospace' }}>{loadKg} kg</b>
              </div>
            </div>
          </HudPanel>

          <DiscPressureCanvas showLabels={showLabels}
            posture={posture}
            loadKg={loadKg}
          />
          <div className="prof-controls">
            <span className="badge">2.4 · Presión L5-S1</span>
            <span>P = <b style={{ color: isCritical ? '#b02318' : '#0d6e64' }}>{totalP.toFixed(2).replace('.', ',')} MPa</b> ({isCritical ? 'Riesgo Crítico' : 'Seguro'})</span>

            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', fontSize: '0.62rem', marginLeft: 'auto' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <span>Carga:</span>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={loadKg}
                  onChange={(e) => setLoadKg(parseFloat(e.target.value))}
                  style={{ width: '60px' }}
                />
                <b style={{ fontFamily: 'JetBrains Mono, monospace', minWidth: '28px' }}>{loadKg} kg</b>
              </label>

              <button
                type="button"
                onClick={handleReset}
                style={{
                  background: 'var(--paper-2)',
                  border: '1px solid var(--line)',
                  borderRadius: '4px',
                  padding: '2px 8px',
                  fontSize: '0.62rem',
                  cursor: 'pointer',
                  color: 'var(--ink)',
                }}
              >
                Restablecer
              </button>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
