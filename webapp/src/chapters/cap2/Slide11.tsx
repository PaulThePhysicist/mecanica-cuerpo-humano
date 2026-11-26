import React, { useState } from 'react';
import { C } from './palette';
import JawCanvas from './JawCanvas';
import { TheoryToggle, TheoryCue } from './TheoryToggle';
import HudPanel from './HudPanel';
import KatexHtml from './KatexHtml';
import type { Engine } from './useEngine';
import { JAW_MA } from './staticsModels';
import { fx } from './ab';

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
    name: 'Incisivo',
    mode: 'incisor',
    force: 450,
    badge: 'INCISIVO · VM 0,50',
    desc: '<b>Mordida incisiva:</b> la ventaja mecánica del masetero es $0{,}50$: la fuerza sobre el alimento es la mitad de la del músculo. Para el temporal anterior es $0{,}24$ y para el posterior $0{,}37$ (hombres; algo menor en mujeres).',
  },
  {
    id: 'molar_std',
    name: 'Primer molar',
    mode: 'molar',
    force: 450,
    badge: 'PRIMER MOLAR · VM 0,76',
    desc: '<b>Mordida en el primer molar:</b> el alimento está más cerca de la ATM y la ventaja mecánica del masetero sube a $0{,}76$ (temporal anterior $0{,}48$, posterior $0{,}72$). Sigue siendo $< 1$: palanca de 3ª clase.',
  },
  {
    id: 'molar_max',
    name: 'Molar, M = 800 N',
    mode: 'molar',
    force: 800,
    badge: 'MOLAR · M = 800 N',
    desc: '<b>Masetero a 800 N en el primer molar (valor ilustrativo):</b> con VM = 0,76 la mordida es de unos $610\\text{ N}$. Estas fuerzas deben entenderse junto a las propiedades mecánicas de los alimentos (Cap. 4).',
  },
  {
    id: 'soft_bite',
    name: 'Masticación ligera',
    mode: 'incisor',
    force: 250,
    badge: 'MASTICACIÓN LIGERA',
    desc: '<b>Masticación ligera (valor ilustrativo, M = 250 N):</b> para alimentos blandos. Una hipótesis del libro: con dietas blandas la mandíbula en crecimiento no recibe las tensiones de masticar y no crece tanto, y la ortodoncia sustituye esas fuerzas.',
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
  // Los letreros del visor los enciende el texto de abajo, no un botón
  // sobre el lienzo: el mando cuelga del párrafo que los explica.
  const [showLabels, setShowLabels] = useState<boolean>(false);
  const [muscleForceN, setMuscleForceN] = useState<number>(450);
  const [activePresetId, setActivePresetId] = useState<string>('incisor_std');

  const dMuscM = 0.050; // 5.0 cm inserción masetero respecto a ATM
  // Ventaja mecánica del masetero (libro): 0,50 incisivo y 0,76 primer molar.
  const mechAdv = biteMode === 'incisor' ? JAW_MA.masseter.incisor : JAW_MA.masseter.molar;
  const dBiteM = dMuscM / mechAdv; // 10 cm y 6,6 cm con el masetero a 5 cm (ilustrativo)
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
        <span className="msub">Masetero y temporal sobre la ATM · ventajas mecánicas del libro y ortodoncia</span>
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
                {'La mandíbula tiene un ángulo recto: cada rama sube a la ATM (bisagra con el temporal) y el cuerpo lleva los dientes, de modo que muchos dientes se tocan a la vez. A cada lado de la línea media hay ocho dientes: 2 incisivos, 1 canino, 2 bicúspides (premolares) y 3 molares (el último, la muela del juicio): «ICBM». Las cúspides: 1 el canino, 2 los bicúspides, 4 o 5 los molares.'}
              </p>
              <div className="eq-block">
                {'\\[ \\text{VM} = \\frac{F_{\\text{mordida}}}{M} = \\frac{d_M}{d_{\\text{diente}}} \\]'}
              </div>
              <table className="data-mini">
                <thead><tr><th>Ventaja mecánica</th><th>Incisivo</th><th>Primer molar</th></tr></thead>
                <tbody>
                  <tr><td>Masetero</td><td>0,50</td><td>0,76</td></tr>
                  <tr><td>Temporal anterior</td><td>0,24</td><td>0,48</td></tr>
                  <tr><td>Temporal posterior</td><td>0,37</td><td>0,72</td></tr>
                </tbody>
              </table>
              <p style={{ fontSize: '.62rem', color: 'var(--ink-3)', marginTop: '0.62rem' }}>
                Hombres; algo menores en mujeres (Problema 2.28). Todas son menores que 1: el visor usa la del masetero.
              </p>
              <div style={{ marginTop: '0.62rem' }}>
                <TheoryToggle on={showLabels} onClick={() => setShowLabels((v) => !v)}>
                  <b>Rotular la ATM y las fuerzas</b>
                </TheoryToggle>
              </div>
              <TheoryCue>Señala el fulcro de la articulación temporomandibular y las fuerzas de la palanca masticatoria.</TheoryCue>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">⚡</span> Ortodoncia: el centro de resistencia
            </div>
            <div className="card-body">
              <p style={{ fontSize: '.64rem', color: 'var(--ink-2)' }}>
                {'La ortodoncia mueve dientes con fuerzas aplicadas por alambres, brackets y elásticos. Como el diente no es un cuerpo libre (lo sujeta el periodonto), se usa su centro de resistencia: fuerzas y torques en la corona se diseñan para dar una fuerza lateral en ese punto sin torque (Figs. 2.31–2.33, arco de intrusión).'}
              </p>
              <p style={{ fontSize: '.62rem', color: 'var(--ink-3)' }}>
                {'En el visor, la reacción en la ATM sale del equilibrio vertical, $R = M - F_{\\text{mordida}}$ (modelo simplificado con fuerzas paralelas).'}
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
            <div className="a-text" id="info-text-11">
              <KatexHtml html={curPreset.desc} />
            </div>
          </div>
        </div>

        <div className="sim-area" style={{ position: 'relative' }}>
          {/* Panel HUD Colapsable */}
          <HudPanel
            title="BIOMECÁNICA ATM"
            badge={`Mordida = ${fx(fBiteN)} N`}
            footer="💡 Alterna entre incisivos y molares para ver la duplicación de fuerza trituradora"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.62rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '3px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Fuerza de Mordida:</span>
                <b style={{ color: C.teal, fontFamily: 'JetBrains Mono, monospace' }}>{fBiteN.toFixed(0)} N ({fx(fBiteKgf, 1)} kgf)</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '3px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Masetero (M):</span>
                <b style={{ color: C.bloodDeep, fontFamily: 'JetBrains Mono, monospace' }}>{muscleForceN} N</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '3px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Brazo Dental (d):</span>
                <b style={{ fontFamily: 'JetBrains Mono, monospace' }}>{fx((dBiteM * 100), 1)} cm ({biteMode === 'incisor' ? 'Incisivos' : 'Molares'})</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '3px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Ventaja Mecánica (dm/d):</span>
                <b style={{ color: biteMode === 'molar' ? C.tealDeep : C.amber, fontFamily: 'JetBrains Mono, monospace' }}>
                  {fx(mechAdv, 2)} (masetero, libro)
                </b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--ink-2)' }}>Carga Cóndilo ATM (R):</span>
                <b style={{ color: C.ink2, fontFamily: 'JetBrains Mono, monospace' }}>{rAtmN.toFixed(0)} N ({fx(rAtmKgf, 1)} kgf)</b>
              </div>
            </div>
          </HudPanel>

          <JawCanvas showLabels={showLabels}
            biteMode={biteMode}
            muscleForceN={muscleForceN}
          />
          <div className="prof-controls">
            <span className="badge">§2.3.3 · Mandíbula</span>
            <span>Mordida = <b style={{ color: C.teal }}>{fBiteN.toFixed(0)} N</b> ({biteMode === 'incisor' ? '0,50 M' : '0,76 M'})</span>

            <div style={{ display: 'flex', gap: '0.62rem', alignItems: 'center', fontSize: '0.62rem', marginLeft: 'auto' }}>
              {/* Presets rápidos */}
              <div style={{ display: 'inline-flex', gap: '2px', border: '1px solid var(--line)', borderRadius: '4px', padding: '1px', background: 'var(--paper-2)' }}>
                {JAW_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPreset(p)}
                    style={{
                      background: activePresetId === p.id ? 'var(--teal)' : 'transparent',
                      color: activePresetId === p.id ? C.card : 'var(--ink)',
                      border: 'none',
                      borderRadius: '3px',
                      padding: '3px 6px',
                      fontSize: '0.62rem',
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
                    color: biteMode === 'incisor' ? C.card : 'var(--ink)',
                    border: 'none',
                    borderRadius: '3px',
                    padding: '3px 7px',
                    fontSize: '0.62rem',
                    fontWeight: biteMode === 'incisor' ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  Incisivo (VM 0,50)
                </button>
                <button
                  type="button"
                  onClick={() => handleModeChange('molar')}
                  style={{
                    background: biteMode === 'molar' ? 'var(--teal)' : 'transparent',
                    color: biteMode === 'molar' ? C.card : 'var(--ink)',
                    border: 'none',
                    borderRadius: '3px',
                    padding: '3px 7px',
                    fontSize: '0.62rem',
                    fontWeight: biteMode === 'molar' ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  Primer molar (VM 0,76)
                </button>
              </div>

              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <span>Masetero (M):</span>
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
