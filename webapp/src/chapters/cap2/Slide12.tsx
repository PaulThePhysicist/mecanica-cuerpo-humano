import React, { useState } from 'react';
import JointTractionCanvas from './JointTractionCanvas';
import HudPanel from './HudPanel';
import type { Engine } from './useEngine';

interface TractionPreset {
  id: string;
  name: string;
  kg: number;
  deg: number;
  badge: string;
  desc: string;
}

const TRACTION_PRESETS: TractionPreset[] = [
  {
    id: 'light',
    name: 'Suave (3 kg, 15°)',
    kg: 3,
    deg: 15,
    badge: 'FASE AGUDA (3 kg)',
    desc: '<b>Tracción Suave ($3\\text{ kg}, 15^\\circ$):</b> Dosimetría inicial para desinflamación y relajación de espasmos musculares suboccipitales con mínima tensión ligamentosa.',
  },
  {
    id: 'clinical',
    name: 'Clínico (6 kg, 25°)',
    kg: 6,
    deg: 25,
    badge: 'RANGO ÓPTIMO (6 kg)',
    desc: '<b>Tracción Clínica Estándar ($6\\text{ kg}, 25^\\circ$):</b> Ángulo de tiro ideal ($\\beta = 25^\\circ$) que flexiona ligeramente el cuello, alineando los agujeros de conjunción y generando <strong>$\\Delta h \\approx 1{,}5\\text{ mm}$ de apertura foraminal</strong>.',
  },
  {
    id: 'intense',
    name: 'Intenso (10 kg, 35°)',
    kg: 10,
    deg: 35,
    badge: 'MÁXIMA APERTURA (10 kg)',
    desc: '<b>Descompresión Máxima ($10\\text{ kg}, 35^\\circ$):</b> Alta fuerza axial ($80\\text{ N}$) para casos de estenosis foraminal o protrusiones discales recalcitrantes en C5-C6 y C6-C7.',
  },
  {
    id: 'pure_axial',
    name: 'Axial Puro (5 kg, 10°)',
    kg: 5,
    deg: 10,
    badge: 'TENSIÓN AXIAL PURA',
    desc: '<b>Tracción Axial Pura ($5\\text{ kg}, 10^\\circ$):</b> El $98\\%$ de la tensión se transmite como fuerza longitudinal directa ($F_{\\text{axial}} \\approx 48{,}3\\text{ N}$), reduciendo la presión hidrostática del núcleo pulposo.',
  },
];

export default function Slide12({
  isActive,
  engine,
}: {
  isActive?: boolean;
  engine?: Engine;
  [key: string]: any;
}) {
  const [tractionKg, setTractionKg] = useState<number>(6);
  const [angleDeg, setAngleDeg] = useState<number>(25);
  const [activePresetId, setActivePresetId] = useState<string>('clinical');

  const g = 9.81;
  const tN = tractionKg * g;
  const fAxialN = tN * Math.cos((angleDeg * Math.PI) / 180);
  const fTransN = tN * Math.sin((angleDeg * Math.PI) / 180);
  const deltaH_mm = Math.min(2.5, 0.35 + (fAxialN / 150) * 1.85);
  const isTherapeutic = tractionKg >= 5 && tractionKg <= 8;

  const curPreset = TRACTION_PRESETS.find((p) => p.id === activePresetId) || TRACTION_PRESETS[1];

  const handleSelectPreset = (preset: TractionPreset) => {
    setActivePresetId(preset.id);
    setTractionKg(preset.kg);
    setAngleDeg(preset.deg);
  };

  const handleReset = () => {
    setActivePresetId('clinical');
    setTractionKg(6);
    setAngleDeg(25);
  };

  return (
    <>
      <div className="module-header">
        <span className="mnum">E2</span>
        <span className="mtitle">Tracción articular y estática</span>
        <span className="msub">Aparatos de tracción cervical y descomposición ortogonal de fuerzas terapéuticas</span>
        <span className="mslide-count">2 / 2</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">📐</span> Descomposición de la fuerza de tracción
            </div>
            <div className="card-body">
              <p style={{ fontSize: '.7rem' }}>
                {'La tensión $T = m\\, g$ transmitida por el cable se descompone en dos componentes ortogonales respecto al eje longitudinal del raquis cervical:'}
              </p>
              <div className="eq-block">
                {'\\[ F_{\\text{axial}} = T\\, \\cos\\beta \\qquad \\text{(Descompresión discal y ensanchamiento foraminal)} \\]'}
              </div>
              <div className="eq-block">
                {'\\[ F_{\\text{transversal}} = T\\, \\sin\\beta \\qquad \\text{(Momento de flexión cefálica / corrección)} \\]'}
              </div>
              <p style={{ fontSize: '.64rem', color: 'var(--ink-3)' }}>
                {'Un ángulo $\\beta \\approx 20^\\circ\\text{--}25^\\circ$ maximiza la separación de los agujeros de conjunción neurales ($\\Delta h \\approx 1\\text{--}2\\text{ mm}$) sin sobrecargar los ligamentos longitudinales.'}
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🏥</span> Aplicación clínica terapéutica
            </div>
            <div className="card-body">
              <p style={{ fontSize: '.64rem', color: 'var(--ink-3)' }}>
                {'En radiculopatías por compresión o hernia discal cervical, una carga de $5\\text{--}8\\text{ kg}$ alivia la raíz nerviosa al ensanchar el foramen intervertebral y generar una presión negativa que favorece la reabsorción del núcleo.'}
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
            <div className="a-text" id="info-text-12">
              <span dangerouslySetInnerHTML={{ __html: curPreset.desc }} />
            </div>
          </div>
        </div>

        <div className="sim-area" style={{ position: 'relative' }}>
          {/* Panel HUD Colapsable */}
          <HudPanel
            title="TRACCIÓN CERVICAL"
            badge={`T = ${tN.toFixed(0)} N (${tractionKg} kg)`}
            icon="📐"
            footer="💡 Modifica el ángulo y la carga para observar la descompresión milimétrica del disco"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.62rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '3px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Tensión Cable (T):</span>
                <b style={{ color: '#0d8577', fontFamily: 'JetBrains Mono, monospace' }}>{tN.toFixed(0)} N ({tractionKg} kg)</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '3px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Descompresión Axial:</span>
                <b style={{ color: '#059669', fontFamily: 'JetBrains Mono, monospace' }}>{fAxialN.toFixed(0)} N</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '3px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Flexión Transversal:</span>
                <b style={{ color: '#d97706', fontFamily: 'JetBrains Mono, monospace' }}>{fTransN.toFixed(0)} N</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '3px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Apertura Discal (Δh):</span>
                <b style={{ color: '#059669', fontFamily: 'JetBrains Mono, monospace' }}>+{deltaH_mm.toFixed(2)} mm</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--ink-2)' }}>Ángulo de Tiro (β):</span>
                <b style={{ color: '#2563eb', fontFamily: 'JetBrains Mono, monospace' }}>{angleDeg}°</b>
              </div>
            </div>
          </HudPanel>

          <JointTractionCanvas
            tractionKg={tractionKg}
            angleDeg={angleDeg}
            tractionType="cervical"
          />
          <div className="prof-controls">
            <span className="badge">2.5 · Tracción</span>
            <span>T = <b style={{ color: '#0d8577' }}>{tN.toFixed(0)} N</b> · F_axial = {fAxialN.toFixed(0)} N</span>

            <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center', fontSize: '0.62rem', marginLeft: 'auto' }}>
              {/* Presets de dosimetría */}
              <div style={{ display: 'inline-flex', gap: '2px', border: '1px solid var(--line)', borderRadius: '4px', padding: '1px', background: 'var(--paper-2)' }}>
                {TRACTION_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPreset(p)}
                    style={{
                      background: activePresetId === p.id ? 'var(--teal)' : 'transparent',
                      color: activePresetId === p.id ? '#fff' : 'var(--ink)',
                      border: 'none',
                      borderRadius: '3px',
                      padding: '3px 6px',
                      fontSize: '0.56rem',
                      fontWeight: activePresetId === p.id ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {p.name.split(' ')[0]}
                  </button>
                ))}
              </div>

              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <span>Carga:</span>
                <input
                  type="range"
                  min="1"
                  max="15"
                  value={tractionKg}
                  onChange={(e) => {
                    setTractionKg(parseFloat(e.target.value));
                    setActivePresetId('');
                  }}
                  style={{ width: '50px' }}
                />
                <b style={{ fontFamily: 'JetBrains Mono, monospace', minWidth: '28px' }}>{tractionKg} kg</b>
              </label>

              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <span>Ángulo (β):</span>
                <input
                  type="range"
                  min="10"
                  max="60"
                  value={angleDeg}
                  onChange={(e) => {
                    setAngleDeg(parseFloat(e.target.value));
                    setActivePresetId('');
                  }}
                  style={{ width: '50px' }}
                />
                <b style={{ fontFamily: 'JetBrains Mono, monospace', minWidth: '28px' }}>{angleDeg}°</b>
              </label>

              <button
                type="button"
                onClick={handleReset}
                style={{
                  background: 'var(--paper-2)',
                  border: '1px solid var(--line)',
                  borderRadius: '4px',
                  padding: '3px 8px',
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
