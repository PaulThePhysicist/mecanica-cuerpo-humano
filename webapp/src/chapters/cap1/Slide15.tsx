import React, { useState } from 'react';
import StevensCanvas from './StevensCanvas';
import HudPanel from './HudPanel';
// @ts-ignore - katex auto-render no incluye tipos
import renderMathInElement from 'katex/contrib/auto-render';

function updateStevensNote(html: string) {
  const info = document.getElementById('info-text-d4');
  if (!info) return;
  info.innerHTML = html;
  renderMathInElement(info, {
    delimiters: [
      { left: '$$', right: '$$', display: true },
      { left: '$', right: '$', display: false },
      { left: '\\(', right: '\\)', display: false },
      { left: '\\[', right: '\\]', display: true },
    ],
    throwOnError: false,
  });
}

interface SensationDetail {
  id: string;
  name: string;
  n: number;
  type: 'sub' | 'lin' | 'super';
  desc: string;
}

const STEVENS_SENSATIONS: Record<string, SensationDetail> = {
  brillo: {
    id: 'brillo',
    name: 'Brillo visual',
    n: 0.33,
    type: 'sub',
    desc: '<b>Brillo ($n = 0{,}33$ · Sublineal):</b> La visión comprime el enorme rango dinámico de la luz ambiental. Duplicar el flujo lumínico ($2S$) solo produce una sensación $1{,}26\\times$ mayor ($2^{0{,}33}$).',
  },
  sonoridad: {
    id: 'sonoridad',
    name: 'Sonoridad acústica (1000 Hz)',
    n: 0.54,
    type: 'sub',
    desc: '<b>Sonoridad ($n = 0{,}54$ · Sublineal):</b> El oído humano abarca 12 órdenes de magnitud de presión sonora (de $10^{-12}\\text{ W/m}^2$ al umbral de dolor).',
  },
  olor: {
    id: 'olor',
    name: 'Olor (Heptano)',
    n: 0.55,
    type: 'sub',
    desc: '<b>Olor ($n = 0{,}55$ · Sublineal):</b> Los quimiorreceptores olfatorios saturan rápidamente ante concentraciones altas.',
  },
  vibracion: {
    id: 'vibracion',
    name: 'Vibración (60 Hz en el dedo)',
    n: 0.60,
    type: 'sub',
    desc: '<b>Vibración ($n = 0{,}60$ · Sublineal):</b> Mecanorreceptores de Pacini y Meissner adaptados a microvibraciones.',
  },
  presion: {
    id: 'presion',
    name: 'Presión en la palma',
    n: 1.10,
    type: 'super',
    desc: '<b>Presión en la palma ($n = 1{,}10$ · Cuasilineal):</b> Respuesta prácticamente proporcional a la fuerza aplicada para una manipulación precisa de objetos.',
  },
  pesadez: {
    id: 'pesadez',
    name: 'Pesadez (Levantar pesos)',
    n: 1.45,
    type: 'super',
    desc: '<b>Pesadez ($n = 1{,}45$ · Superlineal):</b> La sensación subjetiva de carga crece más rápido que la masa física levantada por fatiga neuromuscular progresiva ($2^{1{,}45} \\approx 2{,}73\\times$).',
  },
  descarga: {
    id: 'descarga',
    name: 'Descarga eléctrica (60 Hz)',
    n: 3.50,
    type: 'super',
    desc: '<b>Descarga eléctrica ($n = 3{,}50$ · Extremadamente superlineal):</b> Un incremento de $2\\times$ en la corriente produce una sensación de dolor $\\mathbf{11{,}3\\times}$ más intensa ($2^{3{,}5}$). Alarma fisiológica extrema.',
  },
};

export default function Slide15({ slideCount }: { slideCount?: string }) {
  const [n, setN] = useState<number>(0.54);
  const [selectedSensation, setSelectedSensation] = useState<string>('sonoridad');
  const [showAllCurves, setShowAllCurves] = useState<boolean>(true);

  const currentDetail = STEVENS_SENSATIONS[selectedSensation] || STEVENS_SENSATIONS.sonoridad;

  const handleSelectPreset = (key: string) => {
    setSelectedSensation(key);
    const detail = STEVENS_SENSATIONS[key];
    if (detail) {
      setN(detail.n);
      updateStevensNote(detail.desc);
    }
  };

  const handleSliderChange = (newN: number) => {
    setN(newN);
    const match = Object.values(STEVENS_SENSATIONS).find((s) => Math.abs(s.n - newN) < 0.05);
    if (match) {
      setSelectedSensation(match.id);
    }
  };

  const handleReset = () => {
    setN(0.54);
    setSelectedSensation('sonoridad');
    setShowAllCurves(true);
    updateStevensNote(STEVENS_SENSATIONS.sonoridad.desc);
  };

  const nType = n < 0.95 ? 'Sublineal (n < 1)' : (n > 1.05 ? 'Superlineal (n > 1)' : 'Lineal (n = 1)');
  const nColor = n < 0.95 ? '#c0681e' : (n > 1.05 ? '#b02318' : '#0d6e64');

  return (
    <>
      <div className="module-header">
        <span className="mnum">D4</span>
        <span className="mtitle">Ley de Stevens</span>
        <span className="msub">La percepción y el escalado psicofísico · Tabla 1.15</span>
        <span className="mslide-count">{slideCount ?? '4 / 4'}</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🧠</span> Percepción vs. estímulo físico
            </div>
            <div className="card-body">
              <div className="eq-block">
                {'\\[ P = K\\,(S - S_0)^n \\]'}
              </div>
              <p style={{ fontSize: '.64rem', color: 'var(--ink-3)' }}>
                Donde $S_0$ es el umbral sensorial. Cuando <strong>n &lt; 1</strong> la percepción es <strong>sublineal</strong> (compresión de rango); cuando <strong>n &gt; 1</strong> es <strong>superlineal</strong> (amplificación nociceptiva de alarma).
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">📋</span> Exponentes sensoriales n (Tabla 1.15)
            </div>
            <div className="card-body">
              <table className="interactive-table">
                <tbody>
                  <tr><th>Modalidad Sensorial</th><th>Exponente n</th><th>Duplicar (2×S)</th></tr>
                  {Object.values(STEVENS_SENSATIONS).map((s) => {
                    const isSel = selectedSensation === s.id;
                    const mult = Math.pow(2, s.n).toFixed(2);
                    return (
                      <tr
                        key={s.id}
                        onClick={() => handleSelectPreset(s.id)}
                        style={{
                          cursor: 'pointer',
                          background: isSel ? 'var(--teal-tint)' : 'transparent',
                          fontWeight: isSel ? 700 : 'normal',
                        }}
                      >
                        <td><b>{s.name}</b></td>
                        <td style={{ fontFamily: 'JetBrains Mono, monospace', color: s.n > 1 ? '#b02318' : '#0d6e64' }}>
                          n = {s.n.toFixed(2).replace('.', ',')}
                        </td>
                        <td style={{ fontFamily: 'JetBrains Mono, monospace', color: s.n > 1 ? '#b02318' : 'var(--teal-deep)' }}>
                          ×{mult}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <p style={{ fontSize: '.6rem', color: 'var(--ink-3)', marginTop: '.25rem' }}>
                La visión y audición abarcan ~12 órdenes de magnitud de sensibilidad física.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
            <div className="a-text" id="info-text-d4">
              <span dangerouslySetInnerHTML={{ __html: currentDetail.desc }} />
            </div>
          </div>
        </div>
        <div className="sim-area d4-stevens-area" style={{ position: 'relative' }}>
          {/* Panel HUD Colapsable en la esquina superior derecha */}
          <HudPanel
            title="LEY DE STEVENS"
            badge={`n = ${n.toFixed(2)} · ${nType.toUpperCase()}`}
            icon="🧠"
            footer="💡 P = K · (S - S₀)^n · Compara sublineal vs superlineal"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {Object.values(STEVENS_SENSATIONS).map((s) => {
                const isSel = selectedSensation === s.id;
                return (
                  <div
                    key={s.id}
                    onClick={() => handleSelectPreset(s.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '3px 6px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      background: isSel ? 'var(--teal-tint)' : 'transparent',
                      border: `1px solid ${isSel ? 'var(--teal)' : 'transparent'}`,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span style={{ fontSize: '0.62rem', fontWeight: 600, color: 'var(--ink)' }}>{s.name.split('(')[0].trim()}</span>
                    <span style={{ fontSize: '0.58rem', fontFamily: 'JetBrains Mono, monospace', color: s.n > 1 ? '#b02318' : '#0d6e64', fontWeight: 'bold' }}>
                      n = {s.n.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                );
              })}

              <div style={{ marginTop: '4px', borderTop: '1px dashed var(--line)', paddingTop: '4px', fontSize: '0.54rem', color: 'var(--ink-3)' }}>
                ⚡ <b>Duplicación:</b> 2^n = {Math.pow(2, n).toFixed(2)}×
              </div>
            </div>
          </HudPanel>

          <StevensCanvas
            n={n}
            selectedSensation={selectedSensation}
            showAllCurves={showAllCurves}
          />
          <div className="prof-controls">
            <span className="badge">D4 · Stevens</span>
            <span>Sensación: <b style={{ color: nColor }}>{currentDetail.name.split('(')[0].trim()}</b> (n = {n.toFixed(2).replace('.', ',')})</span>

            <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', fontSize: '0.62rem', marginLeft: 'auto' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span>Exponente n</span>:
                <input
                  type="range"
                  min="0.1"
                  max="4.0"
                  step="0.05"
                  value={n}
                  onChange={(e) => handleSliderChange(parseFloat(e.target.value))}
                  style={{ width: '75px' }}
                />
                <b style={{ fontFamily: 'JetBrains Mono, monospace', minWidth: '32px' }}>{n.toFixed(2)}</b>
              </label>

              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={showAllCurves}
                  onChange={(e) => setShowAllCurves(e.target.checked)}
                />
                <span>Ver todas</span>
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
