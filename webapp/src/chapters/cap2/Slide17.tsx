import React, { useState } from 'react';
import UnitsConverterCanvas from './UnitsConverterCanvas';
import HudPanel from './HudPanel';
import type { Engine } from './useEngine';

export default function Slide17({
  isActive,
  engine,
}: {
  isActive?: boolean;
  engine?: Engine;
  [key: string]: any;
}) {
  const [quantityType, setQuantityType] = useState<'force' | 'torque' | 'pressure'>('force');
  const [inputValue, setInputValue] = useState<number>(450);

  const handleSelectType = (t: 'force' | 'torque' | 'pressure') => {
    setQuantityType(t);
    if (t === 'force') setInputValue(450);
    else if (t === 'torque') setInputValue(50);
    else setInputValue(500000);
  };

  const handleSelectBenchmark = (val: number) => {
    setInputValue(val);
  };

  const handleReset = () => {
    setQuantityType('force');
    setInputValue(450);
  };

  // Dimensional analysis description
  const dimensionInfo = quantityType === 'force'
    ? { dim: '[M · L · T⁻²]', base: '1 N = 1 kg·m/s²', tech: '1 kgf = 9,80665 N' }
    : quantityType === 'torque'
    ? { dim: '[M · L² · T⁻²]', base: '1 N·m = 1 J/rad', tech: '1 kgf·m = 9,80665 N·m' }
    : { dim: '[M · L⁻¹ · T⁻²]', base: '1 Pa = 1 N/m²', tech: '1 MPa = 10 bar = 145 psi' };

  return (
    <>
      <div className="module-header">
        <span className="mnum">H1</span>
        <h2 className="mtitle">Conversor de unidades biomecánicas</h2>
        <span className="msub">§2.5 Unidades de fuerza y presión (Tablas 2.5–2.6) · N, lb, dina · Pa, MPa, atm, bar, mmHg, psi</span>
        <span className="mslide-count">1 / 2</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">🔄</span> Equivalencias fundamentales en biomecánica
            </div>
            <div className="card-body">
              <p style={{ fontSize: '.7rem' }}>
                {'El trabajo técnico usa MKS-SI (newtons); gran parte del médico, en EE. UU., el sistema inglés (libras). Un kilogramo pesa $9{,}8\\text{ N}$ ($2{,}2\\text{ lb}$) por $F = mg$ (Ec. 2.47), con $g = 9{,}8\\text{ m/s}^2 = 980{,}7\\text{ cm/s}^2 = 32{,}2\\text{ ft/s}^2$. La masa inglesa es el slug (pesa $32{,}2\\text{ lb}$). «1 kg» usado como fuerza debe leerse $1\\text{ kg (fuerza)} = 9{,}8\\text{ N} \\approx 10\\text{ N}$.'}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '.62rem', marginTop: '.25rem' }}>
                <button
                  type="button"
                  className="pill"
                  aria-pressed={quantityType === 'force'}
                  style={{ borderLeft: '3px solid #0d8577', cursor: 'pointer' }}
                  onClick={() => handleSelectType('force')}
                >
                  <b>Fuerza (Tabla 2.5):</b> {'$1\\text{ N} = 1\\text{ kg·m/s}^2 = 10^5\\text{ dinas} = 0{,}225\\text{ lb}$; $1\\text{ lb} = 4{,}45\\text{ N}$.'}
                </button>
                <button
                  type="button"
                  className="pill"
                  aria-pressed={quantityType === 'torque'}
                  style={{ borderLeft: '3px solid #2563eb', cursor: 'pointer' }}
                  onClick={() => handleSelectType('torque')}
                >
                  <b>Torque:</b> {'$1\\text{ kgf}\\cdot\\text{m} = 9{,}8\\text{ N}\\cdot\\text{m} \\approx 7{,}23\\text{ lb}\\cdot\\text{ft}$ (fuerza × distancia).'}
                </button>
                <button
                  type="button"
                  className="pill"
                  aria-pressed={quantityType === 'pressure'}
                  style={{ borderLeft: '3px solid #b02318', cursor: 'pointer' }}
                  onClick={() => handleSelectType('pressure')}
                >
                  <b>Presión (Tabla 2.6):</b> {'$1\\text{ MPa} = 1\\text{ N/mm}^2 = 145\\text{ psi} \\simeq 10\\text{ atm}$; $1\\text{ atm} = 1{,}013\\text{ bar} = 760\\text{ mmHg} = 1033\\text{ cmH}_2\\text{O}$; $1\\text{ mmHg} = 133\\text{ Pa}$.'}
                </button>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">📋</span> Presión de una columna de líquido
            </div>
            <div className="card-body">
              <p style={{ fontSize: '.64rem', color: 'var(--ink-3)' }}>
                {'Presión = fuerza por unidad de área (un esfuerzo; la hidrostática es igual en todas direcciones). Una columna de densidad $\\rho$ y altura $h$ ejerce $P = \\rho g h$ (Ec. 2.48): por eso mmHg y cmH$_2$O son en realidad alturas ($\\rho_{\\text{Hg}} = 13{,}6$, $\\rho_{\\text{agua}} = 1{,}0$, $\\rho_{\\text{sangre}} = 1{,}06\\text{ g/cm}^3$). La presión arterial 120/80 son 120 y 80 mmHg manométricos (sobre la atmosférica). Coincidencia notable: $1\\text{ atm}$ difiere de $1\\text{ bar} = 10^5\\text{ Pa}$ en menos del 1 %.'}
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
            <div className="a-text" id="info-text-17">
              Utilizar siempre el Newton (N) en lugar del kilogramo evita confusiones biomecánicas críticas entre <b>masa inercial</b> ($m$) y <b>fuerza de gravedad / peso</b> ($W = m\,g$).
            </div>
          </div>
        </div>

        <div className="sim-area" style={{ position: 'relative' }}>
          {/* Panel HUD Colapsable */}
          <HudPanel
            title="CONVERSOR BIOMECÁNICO"
            badge={`${quantityType.toUpperCase()} · ${dimensionInfo.dim}`}
            icon="🔄"
            footer="💡 Haz clic en los benchmarks anatómicos para cargar mediciones fisiológicas reales"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.62rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '3px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Magnitud:</span>
                <b style={{ color: 'var(--teal-deep)' }}>{quantityType.toUpperCase()}</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '3px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Análisis Dimensional:</span>
                <b style={{ color: '#0d6e64', fontFamily: 'JetBrains Mono, monospace' }}>{dimensionInfo.dim}</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '3px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Valor SI Base:</span>
                <b style={{ color: '#0d8577', fontFamily: 'JetBrains Mono, monospace' }}>
                  {quantityType === 'pressure' ? `${(inputValue / 1e6).toFixed(3)} MPa` : `${inputValue} ${quantityType === 'force' ? 'N' : 'N·m'}`}
                </b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--ink-2)' }}>Equivalente Técnico:</span>
                <b style={{ color: '#b02318', fontFamily: 'JetBrains Mono, monospace' }}>
                  {quantityType === 'force'
                    ? `${(inputValue / 9.80665).toFixed(1)} kgf`
                    : quantityType === 'torque'
                    ? `${(inputValue / 9.80665).toFixed(1)} kgf·m`
                    : `${(inputValue / 1e5).toFixed(1)} bar (${(inputValue / 133.322).toFixed(0)} mmHg)`}
                </b>
              </div>
            </div>
          </HudPanel>

          <UnitsConverterCanvas
            quantityType={quantityType}
            inputValue={inputValue}
            onSelectBenchmark={handleSelectBenchmark}
          />
          <div className="prof-controls">
            <span className="badge">2.8 · Unidades</span>
            <span>Tipo: <b style={{ color: 'var(--teal-deep)' }}>{quantityType.toUpperCase()}</b></span>

            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', fontSize: '0.62rem', marginLeft: 'auto', flexWrap: 'wrap' }}>
              <div style={{ display: 'inline-flex', gap: '2px', border: '1px solid var(--line)', borderRadius: '4px', padding: '1px', background: 'rgba(255,255,255,0.6)' }}>
                {(['force', 'torque', 'pressure'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => handleSelectType(t)}
                    style={{
                      background: quantityType === t ? 'var(--teal)' : 'transparent',
                      color: quantityType === t ? '#fff' : 'var(--ink)',
                      border: 'none',
                      borderRadius: '3px',
                      padding: '2px 7px',
                      fontSize: '0.58rem',
                      fontWeight: quantityType === t ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {t === 'force' ? 'Fuerza (N)' : (t === 'torque' ? 'Torque (N·m)' : 'Presión (Pa)')}
                  </button>
                ))}
              </div>

              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <span>Valor:</span>
                <input
                  type="range"
                  min={quantityType === 'pressure' ? 10000 : (quantityType === 'torque' ? 5 : 50)}
                  max={quantityType === 'pressure' ? 3500000 : (quantityType === 'torque' ? 250 : 5000)}
                  step={quantityType === 'pressure' ? 25000 : (quantityType === 'torque' ? 5 : 25)}
                  value={inputValue}
                  onChange={(e) => setInputValue(parseFloat(e.target.value))}
                  style={{ width: '65px' }}
                />
                <b style={{ fontFamily: 'JetBrains Mono, monospace', minWidth: '42px' }}>
                  {quantityType === 'pressure' ? `${(inputValue / 1e6).toFixed(2)} MPa` : `${inputValue}`}
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
