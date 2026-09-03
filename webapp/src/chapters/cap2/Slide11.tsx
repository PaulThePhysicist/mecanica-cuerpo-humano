import React, { useState } from 'react';
import JawCanvas from './JawCanvas';
import HudPanel from './HudPanel';
import type { Engine } from './useEngine';

interface JawPreset {
  id: string;
  name: string;
  mode: 'incisor' | 'molar';
  force: number;
  badge: string;
  desc: string;
}

const JAW_PRESETS: JawPreset[] = [
  {
    id: 'incisor_std',
    name: 'Incisivos (Corte)',
    mode: 'incisor',
    force: 450,
    badge: 'CORTE FINO (0,67× Fm)',
    desc: '<b>Mordida Incisiva ($d = 7{,}5\\text{ cm}$):</b> Palanca de 3ª clase ($d > d_m$). La fuerza de corte dental ($300\\text{ N}$) es inferior a la tensión muscular ($450\\text{ N}$), pero proporciona máxima velocidad angular y precisión de corte fino.',
  },
  {
    id: 'molar_std',
    name: 'Molares (Trituración)',
    mode: 'molar',
    force: 450,
    badge: 'TRITURACIÓN (1,43× Fm)',
    desc: '<b>Mordida Molar ($d = 3{,}5\\text{ cm}$):</b> Al situarse el alimento entre el fulcro (ATM) y la inserción del masetero ($d < d_m$), se genera una <strong>ventaja mecánica real de $1{,}43\\times$</strong>, alcanzando $643\\text{ N}$ ($65{,}5\\text{ kgf}$).',
  },
  {
    id: 'molar_max',
    name: 'Molar Máxima (800 N)',
    mode: 'molar',
    force: 800,
    badge: 'MÁXIMA POTENCIA (>1100 N)',
    desc: '<b>Potencia Máxima Molar ($F_m = 800\\text{ N}$):</b> Reclutamiento conjunto de masetero y temporal. Produce una fuerza trituradora extrema de <strong>$1143\\text{ N}$ ($116{,}5\\text{ kgf}$)</strong> con alta absorción de carga condilar en la ATM.',
  },
  {
    id: 'soft_bite',
    name: 'Masticación Ligera (250 N)',
    mode: 'incisor',
    force: 250,
    badge: 'MASTICACIÓN LEVE',
    desc: '<b>Masticación Habitual ($F_m = 250\\text{ N}$):</b> Rango fisiológico para deglución de alimentos blandos. Carga reducida tanto en los bordes incisales como en el menisco de la ATM.',
  },
];

export default function Slide11({
  isActive,
  engine,
}: {
  isActive?: boolean;
  engine?: Engine;
  [key: string]: any;
}) {
  const [biteMode, setBiteMode] = useState<'incisor' | 'molar'>('incisor');
  const [muscleForceN, setMuscleForceN] = useState<number>(450);
  const [activePresetId, setActivePresetId] = useState<string>('incisor_std');

  const dMuscM = 0.050; // 5.0 cm inserción masetero respecto a ATM
  const dBiteM = biteMode === 'incisor' ? 0.075 : 0.035; // 7.5 cm vs 3.5 cm
  const mechAdv = dMuscM / dBiteM; // 0.667 vs 1.429
  const fBiteN = (muscleForceN * dMuscM) / dBiteM;
  const fBiteKgf = fBiteN / 9.81;
  const rAtmN = Math.abs(muscleForceN - fBiteN);
  const rAtmKgf = rAtmN / 9.81;

  const curPreset = JAW_PRESETS.find((p) => p.id === activePresetId) || JAW_PRESETS[0];

  const handleSelectPreset = (preset: JawPreset) => {
    setActivePresetId(preset.id);
    setBiteMode(preset.mode);
    setMuscleForceN(preset.force);
  };

  const handleModeChange = (mode: 'incisor' | 'molar') => {
    setBiteMode(mode);
    if (mode === 'incisor' && activePresetId === 'molar_std') {
      setActivePresetId('incisor_std');
    } else if (mode === 'molar' && activePresetId === 'incisor_std') {
      setActivePresetId('molar_std');
    }
  };

  const handleReset = () => {
    setActivePresetId('incisor_std');
    setBiteMode('incisor');
    setMuscleForceN(450);
  };

  return (
    <>
      <div className="module-header">
        <span className="mnum">E1</span>
        <h2 className="mtitle">La mandíbula y la ATM</h2>
        <span className="msub">Fuerzas de mordida en incisivos vs molares y carga en la articulación temporomandibular</span>
        <span className="mslide-count">1 / 2</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🦷</span> Equilibrio de la palanca mandibular
            </div>
            <div className="card-body">
              <p style={{ fontSize: '.7rem' }}>
                {'El músculo masetero se inserta a $d_m = 5{,}0\\text{ cm}$ de la ATM (fulcro). El equilibrio estático de momentos ($\\sum M_{\\text{ATM}} = 0$) determina la fuerza sobre el bolo alimenticio:'}
              </p>
              <div className="eq-block">
                {'\\[ F_{\\text{bite}}\\, d_{\\text{bite}} = F_m\\, d_m \\qquad\\Longrightarrow\\qquad F_{\\text{bite}} = F_m \\left(\\frac{d_m}{d_{\\text{bite}}}\\right) \\]'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '.62rem', marginTop: '.25rem' }}>
                <span className="pill" style={{ background: biteMode === 'incisor' ? 'rgba(13, 110, 100, 0.12)' : 'var(--paper-2)', border: biteMode === 'incisor' ? '1px solid var(--teal)' : '1px solid var(--line)' }}>
                  <b>Incisivos:</b> {'$d = 7{,}5\\text{ cm} \\implies F_{\\text{bite}} = \\frac{5{,}0}{7{,}5} F_m = \\mathbf{0{,}67\\, F_m}$ (Palanca de 3ª clase: corte fino y velocidad).'}
                </span>
                <span className="pill" style={{ background: biteMode === 'molar' ? 'rgba(13, 110, 100, 0.12)' : 'var(--paper-2)', border: biteMode === 'molar' ? '1px solid var(--teal)' : '1px solid var(--line)' }}>
                  <b>Molares:</b> {'$d = 3{,}5\\text{ cm} \\implies F_{\\text{bite}} = \\frac{5{,}0}{3{,}5} F_m = \\mathbf{1{,}43\\, F_m}$ (Palanca multiplicadora: gran ventaja trituradora).'}
                </span>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">⚡</span> Carga articular en la ATM
            </div>
            <div className="card-body">
              <p style={{ fontSize: '.64rem', color: 'var(--ink-3)' }}>
                {'El cóndilo mandibular y el disco articular (menisco bicóncavo) absorben la fuerza resultante de equilibrio vertical:'}
              </p>
              <div className="eq-block">
                {'\\[ R_{\\text{atm}} = |F_m - F_{\\text{bite}}| \\]'}
              </div>
              <p style={{ fontSize: '.62rem', color: 'var(--ink-3)' }}>
                {'En mordida molar, la compresión oclusal supera los $> 600\\text{ N}$ ($60\\text{ kgf}$), liberando parcialmente la carga condilar gracias a la interposición dental.'}
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
            <div className="a-text" id="info-text-11">
              <span dangerouslySetInnerHTML={{ __html: curPreset.desc }} />
            </div>
          </div>
        </div>

        <div className="sim-area" style={{ position: 'relative' }}>
          {/* Panel HUD Colapsable */}
          <HudPanel
            title="BIOMECÁNICA ATM"
            badge={`F_bite = ${fBiteN.toFixed(0)} N (${fBiteKgf.toFixed(1)} kgf)`}
            icon="🦷"
            footer="💡 Alterna entre incisivos y molares para ver la duplicación de fuerza trituradora"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.62rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '3px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Fuerza de Mordida:</span>
                <b style={{ color: '#0d6e64', fontFamily: 'JetBrains Mono, monospace' }}>{fBiteN.toFixed(0)} N ({fBiteKgf.toFixed(1)} kgf)</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '3px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Tensión Masetero (Fm):</span>
                <b style={{ color: '#b91c1c', fontFamily: 'JetBrains Mono, monospace' }}>{muscleForceN} N</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '3px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Brazo Dental (d):</span>
                <b style={{ fontFamily: 'JetBrains Mono, monospace' }}>{(dBiteM * 100).toFixed(1)} cm ({biteMode === 'incisor' ? 'Incisivos' : 'Molares'})</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '3px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Ventaja Mecánica (dm/d):</span>
                <b style={{ color: biteMode === 'molar' ? '#047857' : '#b45309', fontFamily: 'JetBrains Mono, monospace' }}>
                  {mechAdv.toFixed(2)}× {biteMode === 'molar' ? '(Multiplica fuerza)' : '(Reduce fuerza)'}
                </b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--ink-2)' }}>Carga Cóndilo ATM (R):</span>
                <b style={{ color: '#43505c', fontFamily: 'JetBrains Mono, monospace' }}>{rAtmN.toFixed(0)} N ({rAtmKgf.toFixed(1)} kgf)</b>
              </div>
            </div>
          </HudPanel>

          <JawCanvas
            biteMode={biteMode}
            muscleForceN={muscleForceN}
          />
          <div className="prof-controls">
            <span className="badge">2.5 · Mandíbula</span>
            <span>Mordida = <b style={{ color: '#0d6e64' }}>{fBiteN.toFixed(0)} N</b> ({biteMode === 'incisor' ? '0,67× Fm' : '1,43× Fm'})</span>

            <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center', fontSize: '0.62rem', marginLeft: 'auto' }}>
              {/* Presets rápidos */}
              <div style={{ display: 'inline-flex', gap: '2px', border: '1px solid var(--line)', borderRadius: '4px', padding: '1px', background: 'var(--paper-2)' }}>
                {JAW_PRESETS.map((p) => (
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

              {/* Selector de modo */}
              <div style={{ display: 'inline-flex', gap: '2px', border: '1px solid var(--line)', borderRadius: '4px', padding: '1px', background: 'var(--paper-2)' }}>
                <button
                  type="button"
                  onClick={() => handleModeChange('incisor')}
                  style={{
                    background: biteMode === 'incisor' ? 'var(--teal)' : 'transparent',
                    color: biteMode === 'incisor' ? '#fff' : 'var(--ink)',
                    border: 'none',
                    borderRadius: '3px',
                    padding: '3px 7px',
                    fontSize: '0.58rem',
                    fontWeight: biteMode === 'incisor' ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  Incisivos (7,5 cm)
                </button>
                <button
                  type="button"
                  onClick={() => handleModeChange('molar')}
                  style={{
                    background: biteMode === 'molar' ? 'var(--teal)' : 'transparent',
                    color: biteMode === 'molar' ? '#fff' : 'var(--ink)',
                    border: 'none',
                    borderRadius: '3px',
                    padding: '3px 7px',
                    fontSize: '0.58rem',
                    fontWeight: biteMode === 'molar' ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  Molares (3,5 cm)
                </button>
              </div>

              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <span>Masetero (Fm):</span>
                <input
                  type="range"
                  min="100"
                  max="800"
                  step="25"
                  value={muscleForceN}
                  onChange={(e) => {
                    setMuscleForceN(parseFloat(e.target.value));
                    setActivePresetId('');
                  }}
                  style={{ width: '55px' }}
                />
                <b style={{ fontFamily: 'JetBrains Mono, monospace', minWidth: '36px' }}>{muscleForceN} N</b>
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
