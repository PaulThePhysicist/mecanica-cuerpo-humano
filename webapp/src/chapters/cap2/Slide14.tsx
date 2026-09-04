import React, { useState } from 'react';
import ForcePlateCanvas from './ForcePlateCanvas';
import HudPanel from './HudPanel';
import { AnimateButton } from './AnimateButton';
import { useHarmonicClock } from '../cap1/three/useHarmonicClock';
import type { Engine } from './useEngine';

interface GaitPhaseOption {
  id: 'heel_strike' | 'mid_stance' | 'toe_off';
  name: string;
  badge: string;
  desc: string;
}

const PHASES: GaitPhaseOption[] = [
  {
    id: 'heel_strike',
    name: 'Contacto Inicial (Talón)',
    badge: 'FRENADO INICIAL (Fy < 0)',
    desc: '<b>1. Contacto Inicial de Talón:</b> Impacto con absorción elástica de choque (primer pico de la curva M, $F_z \\approx 1{,}15\\, W$). La componente anteroposterior ($F_y < 0$) actúa como vector de frenado desacelerando el avance inercial del cuerpo.',
  },
  {
    id: 'mid_stance',
    name: 'Apoyo Medio Plantar',
    badge: 'VALLE VERTICAL (0,85 W)',
    desc: '<b>2. Apoyo Medio Plantar:</b> El centro de masas del cuerpo cruza el plano vertical del pie de apoyo. Se produce un valle transitorio en la fuerza vertical ($F_z \\approx 0{,}85\\, W$) y la fuerza anteroposterior cruza por cero ($F_y = 0$).',
  },
  {
    id: 'toe_off',
    name: 'Despegue de Dedos',
    badge: 'PROPULSIÓN MÁXIMA (+Fy)',
    desc: '<b>3. Despegue de Dedos (Propulsión):</b> Segundo pico de fuerza vertical ($F_z > 1{,}25\\, W$) y potente aceleración positiva anteroposterior ($F_y > 0$) transmitida por el tríceps sural a través del 1er metatarsiano y el hallux.',
  },
];

export default function Slide14({
  isActive,
  engine,
}: {
  isActive?: boolean;
  engine?: Engine;
  [key: string]: any;
}) {
  const [gaitPhase, setGaitPhase] = useState<'heel_strike' | 'mid_stance' | 'toe_off'>('heel_strike');
  const [bodyMassKg, setBodyMassKg] = useState<number>(70);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  // Ciclo de la fase de apoyo de la marcha: contacto de talón → apoyo medio →
  // despegue de dedos, ~1,7 s por fase.
  useHarmonicClock({ playing: isAnimating }, (t) => {
    const order = ['heel_strike', 'mid_stance', 'toe_off'] as const;
    setGaitPhase(order[Math.floor((t * 0.58) % 3)]);
  });

  const curPhase = PHASES.find((p) => p.id === gaitPhase) || PHASES[0];

  const handleSelect = (id: 'heel_strike' | 'mid_stance' | 'toe_off') => {
    setIsAnimating(false);
    setGaitPhase(id);
  };

  const handleReset = () => {
    setIsAnimating(false);
    setGaitPhase('heel_strike');
    setBodyMassKg(70);
  };

  const fzN = bodyMassKg * 9.81 * (gaitPhase === 'toe_off' ? 1.25 : (gaitPhase === 'mid_stance' ? 0.85 : 1.15));
  const fyN = gaitPhase === 'toe_off' ? 185 : (gaitPhase === 'mid_stance' ? 0 : -125);
  const fxN = gaitPhase === 'toe_off' ? -12 : (gaitPhase === 'mid_stance' ? 22 : 15);
  const grfResultantN = Math.hypot(fzN, fyN, fxN);

  return (
    <>
      <div className="module-header">
        <span className="mnum">F2</span>
        <h2 className="mtitle">Plataforma de fuerza y marcha</h2>
        <span className="msub">Fuerzas de reacción del suelo (GRF), centro de presiones (COP) y baropodometría</span>
        <span className="mslide-count">2 / 2</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">👣</span> Componentes triaxiales de la GRF
            </div>
            <div className="card-body">
              <p style={{ fontSize: '.7rem' }}>
                Una plataforma dinamométrica piezoeléctrica registra las tres componentes ortogonales de la interacción pie-suelo:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '.62rem', marginTop: '.25rem' }}>
                <span className="pill" style={{ background: 'rgba(13, 110, 100, 0.12)', border: '1px solid var(--teal)' }}>
                  <b>Fz (Vertical):</b> {'Carga gravitatoria y de aceleración con el clásico patrón de doble pico en "M" ($1{,}15\\text{--}1{,}25\\times W$).'}
                </span>
                <span className="pill">
                  <b>Fy (Anteroposterior):</b> {'Fase de frenado ($< 0$) tras el talón y fase de propulsión ($> 0$) en el despegue.'}
                </span>
                <span className="pill">
                  <b>Fx (Mediolateral):</b> {'Balance de estabilidad lateral ($\\approx 5\\text{--}10\\%\\, W$).'}
                </span>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">📍</span> Centro de presiones (COP)
            </div>
            <div className="card-body">
              <p style={{ fontSize: '.64rem', color: 'var(--ink-3)' }}>
                El <strong>Centro de Presiones (COP)</strong> es el punto de aplicación instantáneo del vector resultante de fuerza en la planta del pie, migrando desde el talón posterolateral hacia el 1er metatarsiano y el hallux.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
            <div className="a-text" id="info-text-14">
              <span dangerouslySetInnerHTML={{ __html: curPhase.desc }} />
            </div>
          </div>
        </div>

        <div className="sim-area" style={{ position: 'relative' }}>
          {/* Panel HUD Colapsable */}
          <HudPanel
            title="DINAMOMETRÍA DE MARCHA"
            badge={curPhase.badge}
            icon="👣"
            footer="💡 Selecciona la fase del paso para observar la migración del COP y el vector resultante GRF"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.62rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '3px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Fase del Paso:</span>
                <b style={{ color: 'var(--teal-deep)' }}>{curPhase.name}</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '3px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Fuerza Vertical (Fz):</span>
                <b style={{ color: '#0d6e64', fontFamily: 'JetBrains Mono, monospace' }}>
                  {fzN.toFixed(0)} N ({(fzN / (bodyMassKg * 9.81)).toFixed(2)}× W)
                </b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '3px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Anteroposterior (Fy):</span>
                <b style={{ color: fyN > 0 ? '#10b981' : (fyN === 0 ? 'var(--ink-2)' : '#ef4444'), fontFamily: 'JetBrains Mono, monospace' }}>
                  {fyN > 0 ? `+${fyN} N (Propulsión)` : (fyN === 0 ? '0 N (Neutro)' : `${fyN} N (Frenado)`)}
                </b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '3px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Resultante GRF:</span>
                <b style={{ color: '#0d6e64', fontFamily: 'JetBrains Mono, monospace' }}>{grfResultantN.toFixed(0)} N</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--ink-2)' }}>Presión Plantar Pico:</span>
                <b style={{ color: '#ef4444', fontFamily: 'JetBrains Mono, monospace' }}>
                  {gaitPhase === 'toe_off' ? '380 kPa' : (gaitPhase === 'mid_stance' ? '145 kPa' : '290 kPa')}
                </b>
              </div>
            </div>
          </HudPanel>

          <ForcePlateCanvas
            gaitPhase={gaitPhase}
            bodyMassKg={bodyMassKg}
          />
          <div className="prof-controls">
            <span className="badge">2.6 · Dinamometría</span>
            <span>Fase: <b style={{ color: 'var(--teal-deep)' }}>{curPhase.name}</b></span>

            <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center', fontSize: '0.62rem', marginLeft: 'auto' }}>
              <div style={{ display: 'inline-flex', gap: '2px', border: '1px solid var(--line)', borderRadius: '4px', padding: '1px', background: 'var(--paper-2)' }}>
                {PHASES.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelect(p.id)}
                    style={{
                      background: gaitPhase === p.id ? 'var(--teal)' : 'transparent',
                      color: gaitPhase === p.id ? '#fff' : 'var(--ink)',
                      border: 'none',
                      borderRadius: '3px',
                      padding: '3px 7px',
                      fontSize: '0.58rem',
                      fontWeight: gaitPhase === p.id ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {p.name.split(' ')[0]}
                  </button>
                ))}
              </div>

              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <span>Masa:</span>
                <input
                  type="range"
                  min="40"
                  max="120"
                  value={bodyMassKg}
                  onChange={(e) => setBodyMassKg(parseFloat(e.target.value))}
                  style={{ width: '50px' }}
                />
                <b style={{ fontFamily: 'JetBrains Mono, monospace', minWidth: '28px' }}>{bodyMassKg} kg</b>
              </label>

              <AnimateButton playing={isAnimating} onToggle={() => setIsAnimating((a) => !a)} label="Marcha" />

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
