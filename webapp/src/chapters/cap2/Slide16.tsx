import React, { useState } from 'react';
import TactileThresholdCanvas from './TactileThresholdCanvas';
import HudPanel from './HudPanel';
import type { Engine } from './useEngine';

interface PresetOpt {
  name: string;
  freq: number;
  amp: number;
  tag: string;
  color: string;
}

const PRESETS: PresetOpt[] = [
  { name: 'Textura Sedosa', freq: 250, amp: 0.08, tag: 'Pacini Óptimo (80 nm)', color: '#2563eb' },
  { name: 'Deslizamiento', freq: 35, amp: 1.8, tag: 'Meissner Óptimo (1,8 µm)', color: '#0d8577' },
  { name: 'Borde Braille', freq: 3, amp: 6.5, tag: 'Merkel Óptimo (6,5 µm)', color: '#b02318' },
  { name: 'Vibración Motor', freq: 120, amp: 8.0, tag: 'Coactivación', color: '#7c3aed' },
  { name: 'Subumbral', freq: 20, amp: 0.05, tag: 'Imperceptible', color: '#64748b' },
];

export default function Slide16({
  isActive,
  engine,
}: {
  isActive?: boolean;
  engine?: Engine;
  [key: string]: any;
}) {
  const [freqHz, setFreqHz] = useState<number>(250);
  const [amplitudeUm, setAmplitudeUm] = useState<number>(1.0);

  const handleStimulusChange = (newFreq: number, newAmp: number) => {
    setFreqHz(newFreq);
    setAmplitudeUm(newAmp);
  };

  const handleApplyPreset = (p: PresetOpt) => {
    setFreqHz(p.freq);
    setAmplitudeUm(p.amp);
  };

  const handleReset = () => {
    setFreqHz(250);
    setAmplitudeUm(1.0);
  };

  // Canal activo estimado
  const activeChannel = freqHz >= 80 && amplitudeUm >= 0.08
    ? 'Pacini (RA2)'
    : freqHz >= 8 && freqHz < 80 && amplitudeUm >= 1.8
    ? 'Meissner (RA1)'
    : freqHz < 8 && amplitudeUm >= 6.5
    ? 'Merkel (SA1)'
    : amplitudeUm < 0.08
    ? 'Subumbral'
    : 'Mixto / Coestimulación';

  return (
    <>
      <div className="module-header">
        <span className="mnum">G2</span>
        <h2 className="mtitle">Sensibilidad y umbrales táctiles</h2>
        <span className="msub">Curvas psicofísicas de sintonía en "U" · Límite biofísico de la yema digital</span>
        <span className="mslide-count">2 / 2</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">📊</span> Curvas psicofísicas de sintonía
            </div>
            <div className="card-body">
              <p style={{ fontSize: '.7rem' }}>
                El umbral de percepción táctil consciente en la piel glabra sigue curvas en forma de "U" dependientes de la frecuencia del estímulo:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '.62rem', marginTop: '.25rem' }}>
                <button
                  type="button"
                  className="pill has-marker"
                  aria-pressed={freqHz === PRESETS[0].freq && amplitudeUm === PRESETS[0].amp}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleApplyPreset(PRESETS[0])}
                >
                  <span className="pill-dot" style={{ background: '#2563eb' }} />
                  <span><b>Corpúsculo de Pacini:</b> {'Valle de máxima agudeza de apenas $\\sim 0{,}08\\,\\mu\\text{m}$ ($80\\text{ nm}$) a $250\\text{ Hz}$.'}</span>
                </button>
                <button
                  type="button"
                  className="pill has-marker"
                  aria-pressed={freqHz === PRESETS[1].freq && amplitudeUm === PRESETS[1].amp}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleApplyPreset(PRESETS[1])}
                >
                  <span className="pill-dot" style={{ background: '#0d8577' }} />
                  <span><b>Corpúsculo de Meissner:</b> {'Óptimo de $\\sim 1{,}8\\,\\mu\\text{m}$ a $35\\text{ Hz}$ (sensación de aleteo).'}</span>
                </button>
                <button
                  type="button"
                  className="pill has-marker"
                  aria-pressed={freqHz === PRESETS[2].freq && amplitudeUm === PRESETS[2].amp}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleApplyPreset(PRESETS[2])}
                >
                  <span className="pill-dot" style={{ background: '#b02318' }} />
                  <span><b>Discos de Merkel:</b> {'Umbral de $\\sim 6{,}5\\,\\mu\\text{m}$ a frecuencias muy bajas ($< 5\\text{ Hz}$).'}</span>
                </button>
                <button
                  type="button"
                  className="pill has-marker"
                  aria-pressed={freqHz === 12 && amplitudeUm === 20}
                  style={{ cursor: 'pointer' }}
                  onClick={() => { setFreqHz(12); setAmplitudeUm(20); }}
                >
                  <span className="pill-dot" style={{ background: '#d97706' }} />
                  <span><b>Terminación de Ruffini:</b> {'Sensible al estiramiento sostenido ($\\sim 20\\,\\mu\\text{m}$).'}</span>
                </button>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🔬</span> Límite nanoscópico del tacto humano
            </div>
            <div className="card-body">
              <p style={{ fontSize: '.64rem', color: 'var(--ink-3)' }}>
                {'Al deslizar la yema sobre una superficie, las asperezas nanométricas ($< 100\\text{ nm}$) excitan resonancias mecánicas en la piel a $200\\text{--}300\\text{ Hz}$, amplificadas por las laminillas de Pacini.'}
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
            <div className="a-text" id="info-text-16">
              {'A $250\\text{ Hz}$, una deformación de apenas '}<b>{'0,08 micrómetros (80 nm)'}</b>{' (menor que la longitud de onda de la luz visible) basta para activar el corpúsculo de Pacini y generar una percepción táctil consciente en el córtex somatosensorial.'}
            </div>
          </div>
        </div>

        <div className="sim-area" style={{ position: 'relative' }}>
          {/* Panel HUD Colapsable */}
          <HudPanel
            title="PSICOFÍSICA TÁCTIL"
            badge={`${freqHz} Hz · ${amplitudeUm < 0.1 ? `${(amplitudeUm * 1000).toFixed(0)} nm` : `${amplitudeUm < 1 ? amplitudeUm.toFixed(2) : amplitudeUm.toFixed(1)} µm`}`}
            icon="📊"
            footer="💡 Haz clic y arrastra directamente sobre el gráfico logarítmico para explorar las curvas en U"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.62rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '3px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Frecuencia:</span>
                <b style={{ color: '#0d6e64', fontFamily: 'JetBrains Mono, monospace' }}>{freqHz} Hz</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '3px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Amplitud (Indentación):</span>
                <b style={{ color: '#d97706', fontFamily: 'JetBrains Mono, monospace' }}>
                  {amplitudeUm < 0.1 ? `${(amplitudeUm * 1000).toFixed(0)} nm` : `${amplitudeUm < 1 ? amplitudeUm.toFixed(2) : amplitudeUm.toFixed(1)} µm`}
                </b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '3px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Canal Predominante:</span>
                <b style={{ color: activeChannel === 'Pacini (RA2)' ? '#2563eb' : (activeChannel === 'Meissner (RA1)' ? '#0d8577' : (activeChannel === 'Merkel (SA1)' ? '#b02318' : '#64748b')) }}>
                  {activeChannel}
                </b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--ink-2)' }}>Mínimo Pacini:</span>
                <b style={{ fontFamily: 'JetBrains Mono, monospace' }}>0,08 µm (80 nm) @ 250 Hz</b>
              </div>
            </div>
          </HudPanel>

          <TactileThresholdCanvas
            freqHz={freqHz}
            amplitudeUm={amplitudeUm}
            onStimulusChange={handleStimulusChange}
          />
          <div className="prof-controls">
            <span className="badge">2.7 · Umbrales</span>
            <span>Estímulo: <b style={{ color: '#0d6e64' }}>{freqHz} Hz</b> ({amplitudeUm < 0.1 ? `${(amplitudeUm * 1000).toFixed(0)} nm` : `${amplitudeUm < 1 ? amplitudeUm.toFixed(2) : amplitudeUm.toFixed(1)} µm`})</span>

            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', fontSize: '0.62rem', marginLeft: 'auto', flexWrap: 'wrap' }}>
              <div style={{ display: 'inline-flex', gap: '2px', border: '1px solid var(--line)', borderRadius: '4px', padding: '1px', background: 'rgba(255,255,255,0.6)' }}>
                {PRESETS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    style={{
                      background: freqHz === p.freq && Math.abs(amplitudeUm - p.amp) < 0.1 ? p.color : 'transparent',
                      color: freqHz === p.freq && Math.abs(amplitudeUm - p.amp) < 0.1 ? '#fff' : 'var(--ink)',
                      border: 'none',
                      borderRadius: '3px',
                      padding: '2px 5px',
                      fontSize: '0.56rem',
                      fontWeight: freqHz === p.freq && Math.abs(amplitudeUm - p.amp) < 0.1 ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {p.name}
                  </button>
                ))}
              </div>

              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <span>Frec:</span>
                <input
                  type="range"
                  min="1"
                  max="500"
                  value={freqHz}
                  onChange={(e) => setFreqHz(parseFloat(e.target.value))}
                  style={{ width: '50px' }}
                />
                <b style={{ fontFamily: 'JetBrains Mono, monospace', minWidth: '32px' }}>{freqHz} Hz</b>
              </label>

              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <span>Amp:</span>
                <input
                  type="range"
                  min="0.05"
                  max="50"
                  step="0.05"
                  value={amplitudeUm}
                  onChange={(e) => setAmplitudeUm(parseFloat(e.target.value))}
                  style={{ width: '45px' }}
                />
                <b style={{ fontFamily: 'JetBrains Mono, monospace', minWidth: '32px' }}>
                  {amplitudeUm < 0.1 ? `${(amplitudeUm * 1000).toFixed(0)} nm` : `${amplitudeUm < 1 ? amplitudeUm.toFixed(2) : amplitudeUm.toFixed(1)} µm`}
                </b>
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
