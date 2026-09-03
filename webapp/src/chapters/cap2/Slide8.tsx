import React, { useState } from 'react';
import CaneCanvas from './CaneCanvas';
import HudPanel from './HudPanel';
import type { Engine } from './useEngine';

export default function Slide8({
  isActive,
  engine,
}: {
  isActive?: boolean;
  engine?: Engine;
  [key: string]: any;
}) {
  const [caneHand, setCaneHand] = useState<'contra' | 'ipsi' | 'none'>('contra');
  const [caneForceKg, setCaneForceKg] = useState<number>(10);
  const [bodyMassKg, setBodyMassKg] = useState<number>(70);

  const g = 9.81;
  const totalWeightN = bodyMassKg * g;
  const wbN = (5 / 6) * totalWeightN;
  const sin70 = Math.sin((70 * Math.PI) / 180);
  const cos70 = Math.cos((70 * Math.PI) / 180);

  const fCaneN = caneHand === 'none' ? 0 : caneForceKg * g;
  const dCaneM = caneHand === 'contra' ? 0.30 : (caneHand === 'ipsi' ? -0.05 : 0);

  const fAbductorN = Math.max(0, (wbN * 0.18 - fCaneN * dCaneM) / (0.07 * sin70));
  const fAbductorKgf = fAbductorN / g;
  const rxN = fAbductorN * cos70;
  const ryN = fAbductorN * sin70 + wbN;
  const rJointN = Math.hypot(rxN, ryN);
  const rJointKgf = rJointN / g;

  const rBaseN = Math.hypot(
    ((wbN * 0.18) / (0.07 * sin70)) * cos70,
    ((wbN * 0.18) / (0.07 * sin70)) * sin70 + wbN
  );
  const reliefPct = Math.max(0, ((rBaseN - rJointN) / rBaseN) * 100);

  const handleReset = () => {
    setCaneHand('contra');
    setCaneForceKg(10);
    setBodyMassKg(70);
  };

  return (
    <>
      <div className="module-header">
        <span className="mnum">C2</span>
        <h2 className="mtitle">Uso terapéutico del bastón</h2>
        <span className="msub">¿Por qué el bastón se lleva en la mano CONTRALATERAL a la cadera lesionada?</span>
        <span className="mslide-count">2 / 4</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🦯</span> Mecánica del bastón contralateral
            </div>
            <div className="card-body">
              <p style={{ fontSize: '.7rem' }}>
                {'Al apoyar el bastón en la mano opuesta a la cadera afectada ($d_c \\approx 30\\text{ cm}$), la fuerza hacia arriba del bastón ($F_c$) produce un torque que ayuda directamente a los abductores:'}
              </p>
              <div className="eq-block">
                {'\\[ F_a\\, b_m\\, \\sin 70^\\circ + F_c\\, d_c = W_b\\, b_w \\]'}
              </div>
              <div className="eq-block" style={{ fontSize: '.72rem' }}>
                {'\\[ F_a = \\frac{W_b\\, b_w - F_c\\, d_c}{b_m\\, \\sin 70^\\circ} \\]'}
              </div>
              <p style={{ fontSize: '.64rem', color: 'var(--ink-3)' }}>
                {'Apoyar apenas $10\\text{ kgf}$ ($98\\text{ N}$) en el bastón reduce la tensión del glúteo medio y descarga la cabeza femoral en casi un $\\mathbf{50\\%}$.'}
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">⚠️</span> El error de la mano ipsilateral
            </div>
            <div className="card-body">
              <p style={{ fontSize: '.64rem', color: 'var(--ink-3)' }}>
                Si el paciente lleva el bastón en el <strong>mismo lado de la lesión</strong>, el brazo de palanca es casi nulo ($d_c \approx 0$) o negativo, obligando a inclinar el tronco y perdiendo la ventaja biomecánica de descarga.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
            <div className="a-text" id="info-text-8">
              Prescripción clínica: <b>«Bastón siempre en la mano opuesta a la pierna que duele»</b>. Es una de las aplicaciones más elegantes y de mayor impacto terapéutico de la estática de momentos.
            </div>
          </div>
        </div>

        <div className="sim-area" style={{ position: 'relative' }}>
          {/* Panel HUD Colapsable */}
          <HudPanel
            title="DESCARGA CON BASTÓN"
            badge={caneHand === 'contra' ? `−${reliefPct.toFixed(0)}% ALIVIO` : (caneHand === 'ipsi' ? 'IPSILATERAL' : 'SIN BASTÓN')}
            icon="🦯"
            defaultCollapsed={true}
            footer="💡 Compara la mano contralateral vs ipsilateral para ver la reducción de carga"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.62rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '3px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Carga Articular (R):</span>
                <b style={{ color: caneHand === 'contra' ? '#2e8b57' : '#0d6e64', fontFamily: 'JetBrains Mono, monospace' }}>
                  {rJointN.toFixed(0)} N ({rJointKgf.toFixed(1)} kgf)
                </b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '3px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Alivio Relativo:</span>
                <b style={{ color: caneHand === 'contra' ? '#2e8b57' : '#b02318' }}>
                  {caneHand === 'contra' ? `−${reliefPct.toFixed(0)}% de carga` : '0% (Sin alivio)'}
                </b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '3px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Fuerza en Bastón (Fc):</span>
                <b style={{ color: '#0d8577', fontFamily: 'JetBrains Mono, monospace' }}>{fCaneN.toFixed(0)} N ({caneForceKg} kgf)</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '3px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Abductores (Fa):</span>
                <b style={{ color: '#b02318', fontFamily: 'JetBrains Mono, monospace' }}>{fAbductorN.toFixed(0)} N ({fAbductorKgf.toFixed(1)} kgf)</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--ink-2)' }}>Torque de ayuda (Fc · dc):</span>
                <b style={{ color: '#0d8577', fontFamily: 'JetBrains Mono, monospace' }}>
                  {caneHand === 'contra' ? `+${(fCaneN * 0.30).toFixed(1)} N·m` : '0,0 N·m'}
                </b>
              </div>
            </div>
          </HudPanel>

          <CaneCanvas
            caneHand={caneHand}
            caneForceKg={caneForceKg}
            bodyMassKg={bodyMassKg}
          />
          <div className="prof-controls">
            <span className="badge">2.3 · Bastón</span>
            <span>R = <b style={{ color: caneHand === 'contra' ? '#2e8b57' : '#0d6e64' }}>{rJointN.toFixed(0)} N</b> ({caneHand === 'contra' ? `−${reliefPct.toFixed(0)}%` : 'Sin descarga'})</span>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.62rem', marginLeft: 'auto' }}>
              <div style={{ display: 'inline-flex', gap: '1px', border: '1px solid var(--line)', borderRadius: '4px', padding: '1px', background: 'var(--paper-2)' }}>
                <button
                  type="button"
                  onClick={() => setCaneHand('contra')}
                  style={{
                    background: caneHand === 'contra' ? 'var(--teal)' : 'transparent',
                    color: caneHand === 'contra' ? '#fff' : 'var(--ink)',
                    border: 'none',
                    borderRadius: '3px',
                    padding: '2px 7px',
                    fontSize: '0.58rem',
                    fontWeight: caneHand === 'contra' ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  Contralateral (Óptimo)
                </button>
                <button
                  type="button"
                  onClick={() => setCaneHand('ipsi')}
                  style={{
                    background: caneHand === 'ipsi' ? '#d97706' : 'transparent',
                    color: caneHand === 'ipsi' ? '#fff' : 'var(--ink)',
                    border: 'none',
                    borderRadius: '3px',
                    padding: '2px 7px',
                    fontSize: '0.58rem',
                    fontWeight: caneHand === 'ipsi' ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  Ipsilateral
                </button>
                <button
                  type="button"
                  onClick={() => setCaneHand('none')}
                  style={{
                    background: caneHand === 'none' ? '#b02318' : 'transparent',
                    color: caneHand === 'none' ? '#fff' : 'var(--ink)',
                    border: 'none',
                    borderRadius: '3px',
                    padding: '2px 7px',
                    fontSize: '0.58rem',
                    fontWeight: caneHand === 'none' ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  Sin Bastón
                </button>
              </div>

              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <span>Apoyo:</span>
                <input
                  type="range"
                  min="0"
                  max="25"
                  value={caneForceKg}
                  onChange={(e) => setCaneForceKg(parseFloat(e.target.value))}
                  style={{ width: '50px' }}
                  disabled={caneHand === 'none'}
                />
                <b style={{ fontFamily: 'JetBrains Mono, monospace', minWidth: '28px' }}>{caneForceKg} kg</b>
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
