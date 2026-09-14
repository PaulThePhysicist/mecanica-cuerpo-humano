import React, { useState } from 'react';
import BMICalculatorCanvas from './BMICalculatorCanvas';
import HudPanel from './HudPanel';
import { STANDARD_MAN } from './standardMan';
import { fmt } from './format';

export default function Slide14({ slideCount }: { slideCount?: string }) {
  const [mass, setMass] = useState<number>(STANDARD_MAN.massKg);
  const [heightCm, setHeightCm] = useState<number>(STANDARD_MAN.heightM * 100);
  const [gender, setGender] = useState<'H' | 'M'>('H');

  const heightM = heightCm / 100;
  const bmi = mass / (heightM * heightM);
  const S = heightM / Math.pow(mass, 1 / 3);
  const rho = 0.69 + 0.9 * S;
  const bsa = 0.202 * Math.pow(mass, 0.425) * Math.pow(heightM, 0.725);
  const fatH = 1.28 * bmi - 10.1;
  const fatM = 1.48 * bmi - 7.0;
  const currentFat = gender === 'H' ? fatH : fatM;

  let cat = 'Normal';
  let catColor = '#0d6e64';
  if (bmi < 18.5) {
    cat = 'Bajo peso';
    catColor = '#b86a1e';
  } else if (bmi < 25) {
    cat = 'Normal';
    catColor = '#0d6e64';
  } else if (bmi < 30) {
    cat = 'Sobrepeso';
    catColor = '#9a5b00';
  } else {
    cat = 'Obesidad';
    catColor = '#a92a1e';
  }

  const handleReset = () => {
    setMass(STANDARD_MAN.massKg);
    setHeightCm(STANDARD_MAN.heightM * 100);
    setGender('H');
  };

  return (
    <>
      <div className="module-header">
        <span className="mnum">D3</span>
        <span className="mtitle">Índices de escala</span>
        <span className="msub">Superficie, densidad, IMC y grasa corporal · Ecuaciones 1.2–1.3</span>
        <span className="mslide-count">{slideCount ?? '3 / 4'}</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">📐</span> Índices de masa y estatura
            </div>
            <div className="card-body">
              <div className="eq-block">
                {'\\[ S = \\frac{H}{m_b^{1/3}} \\qquad \\text{IMC} = \\frac{m_b}{H^2} \\]'}
              </div>
              <p style={{ fontSize: '.64rem' }}>
                El <strong>índice ponderal</strong> $S$ rige la densidad media del cuerpo:
              </p>
              <div className="eq-block" style={{ fontSize: '.72rem' }}>
                {'\\[ \\rho = 0{,}69 + 0{,}9\\, S \\quad [\\text{kg/L}] \\]'}
              </div>
              <div className="eq-block" style={{ fontSize: '.72rem' }}>
                {'\\[ \\text{H: } \\%\\text{grasa} = 1{,}28\\,\\text{IMC} - 10{,}1 \\qquad \\text{M: } 1{,}48\\,\\text{IMC} - 7{,}0 \\]'}
              </div>
              <p style={{ fontSize: '.62rem', color: 'var(--ink-3)' }}>
                Rangos OMS: Bajo &lt; 18,5 · Normal 18,5–24,9 · Sobrepeso 25–29,9 · Obesidad &ge; 30.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🟧</span> Área superficial: Du Bois (Eq. 1.2)
            </div>
            <div className="card-body">
              <div className="eq-block">
                {'\\[ A = 0{,}202\\, m_b^{0{,}425}\\, H^{0{,}725} \\]'}
              </div>
              <p style={{ fontSize: '.64rem', color: 'var(--ink-3)' }}>
                Depende de <strong>masa y estatura simultáneamente</strong>. Dos personas con igual peso pero diferente altura tienen superficies corporales muy distintas.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
            <div className="a-text" id="info-text-d3">
              Con <b>{mass} kg</b> y <b>{heightCm} cm</b>: Tu IMC es de <b style={{ color: catColor }}>{fmt(bmi, 1)} ({cat})</b>, tu área Du Bois es de <b>{fmt(bsa, 2)} m²</b> y tu grasa corporal estimada por IMC ({gender === 'H' ? 'Varón' : 'Mujer'}) es de <b>{fmt(currentFat, 1)}%</b>.
            </div>
          </div>
        </div>
        <div className="sim-area d3-bmi-area" id="sim-bmi-area" style={{ position: 'relative' }}>
          {/* Panel HUD Colapsable en la esquina superior derecha */}
          <HudPanel
            title="ÍNDICES BIOFÍSICOS"
            badge={`IMC ${fmt(bmi, 1)} · ${cat.toUpperCase()}`}
            icon="📐"
            footer="💡 Ajusta masa y estatura para ver el cuadro de instrumentos biofísicos"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.62rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '3px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Índice Quételet (IMC):</span>
                <b style={{ color: catColor, fontFamily: 'var(--mono)' }}>{fmt(bmi, 1)} kg/m²</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '3px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Categoría OMS:</span>
                <b style={{ color: catColor }}>{cat}</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '3px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Área Du Bois:</span>
                <b style={{ color: 'var(--teal-deep)', fontFamily: 'var(--mono)' }}>{fmt(bsa, 2)} m²</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '3px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Índice Ponderal S:</span>
                <b style={{ fontFamily: 'var(--mono)' }}>{fmt(S, 2)}</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '3px' }}>
                <span style={{ color: 'var(--ink-2)' }}>Densidad Media ρ:</span>
                <b style={{ fontFamily: 'var(--mono)' }}>{fmt(rho, 3)} kg/L</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--ink-2)' }}>Grasa Estimada por IMC ({gender === 'H' ? 'Varón' : 'Mujer'}):</span>
                <b style={{ color: '#b86a1e', fontFamily: 'var(--mono)' }}>{fmt(currentFat, 1)}%</b>
              </div>
            </div>
          </HudPanel>

          <BMICalculatorCanvas
            mass={mass}
            height={heightM}
            gender={gender}
          />
          <div className="prof-controls">
            <span className="badge">D3 · Índices</span>
            <span style={{ color: catColor, fontWeight: 'bold' }}>IMC: {fmt(bmi, 1)} ({cat})</span>

            {/* Controles dobles */}
            <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', fontSize: '0.62rem' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <span>Masa:</span>
                <input
                  type="range"
                  min="40"
                  max="140"
                  value={mass}
                  onChange={(e) => setMass(parseFloat(e.target.value))}
                  style={{ width: '65px' }}
                />
                <b style={{ fontFamily: 'var(--mono)', minWidth: '36px' }}>{mass} kg</b>
              </label>

              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <span>Estatura:</span>
                <input
                  type="range"
                  min="140"
                  max="210"
                  value={heightCm}
                  onChange={(e) => setHeightCm(parseFloat(e.target.value))}
                  style={{ width: '65px' }}
                />
                <b style={{ fontFamily: 'var(--mono)', minWidth: '42px' }}>{heightCm} cm</b>
              </label>

              <div style={{ display: 'inline-flex', gap: '2px', border: '1px solid var(--line)', borderRadius: '4px', padding: '1px' }}>
                <button
                  type="button"
                  onClick={() => setGender('H')}
                  style={{
                    background: gender === 'H' ? 'var(--teal)' : 'transparent',
                    color: gender === 'H' ? '#fff' : 'var(--ink)',
                    border: 'none',
                    borderRadius: '3px',
                    padding: '1px 5px',
                    fontSize: '0.58rem',
                    cursor: 'pointer',
                  }}
                >
                  ♂ H
                </button>
                <button
                  type="button"
                  onClick={() => setGender('M')}
                  style={{
                    background: gender === 'M' ? 'var(--teal)' : 'transparent',
                    color: gender === 'M' ? '#fff' : 'var(--ink)',
                    border: 'none',
                    borderRadius: '3px',
                    padding: '1px 5px',
                    fontSize: '0.58rem',
                    cursor: 'pointer',
                  }}
                >
                  ♀ M
                </button>
              </div>
            </div>

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
                marginLeft: 'auto',
              }}
            >
              Restablecer ({STANDARD_MAN.massKg} kg · {STANDARD_MAN.heightM * 100} cm)
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
