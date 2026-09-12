import React, { useState } from 'react';
import StandardHumanCanvas from './StandardHumanCanvas';
import { STANDARD_MAN } from './standardMan';
import { fmt } from './format';

interface ParamDetail {
  id: string;
  name: string;
  refValue: string;
  desc: string;
}

const SM_HEIGHT = fmt(STANDARD_MAN.heightM, 2);

const PARAMS_DATA: Record<string, ParamDetail> = {
  mass: {
    id: 'mass',
    name: 'Estatura y Masa',
    refValue: `${SM_HEIGHT} m · ${STANDARD_MAN.massKg} kg (${STANDARD_MAN.weightN} N)`,
    desc: `<b>Hombre Estándar de Referencia:</b> Definido a los ${STANDARD_MAN.ageYears} años, ${SM_HEIGHT} m de estatura y ${STANDARD_MAN.massKg} kg de masa corporal (peso $W = mg \\approx ${STANDARD_MAN.weightN}\\text{ N}$).`,
  },
  area: {
    id: 'area',
    name: 'Área de Superficie (Du Bois)',
    refValue: `${fmt(STANDARD_MAN.bsaM2, 2)} m²`,
    desc: '<b>Área de Superficie (Fórmula de Du Bois):</b> $A = 0{,}202 \\cdot m^{0{,}425} \\cdot H^{0{,}725}$. Clave para la disipación térmica y dosificación farmacológica.',
  },
  bmr: {
    id: 'bmr',
    name: 'Tasa Metabólica Basal (Kleiber)',
    refValue: `${STANDARD_MAN.bmrKcalH} kcal/h (${STANDARD_MAN.bmrKcalDay} kcal/día)`,
    desc: `<b>Tasa Metabólica Basal (TMB · Ley de Kleiber):</b> $\\text{TMB} = ${STANDARD_MAN.bmrKcalH} \\cdot (m / ${STANDARD_MAN.massKg})^{0{,}75}\\text{ kcal/h}$. Escala alométrica con exponente $3/4$.`,
  },
  cardio: {
    id: 'cardio',
    name: 'Sistema Cardiovascular',
    refValue: `${STANDARD_MAN.restingHR} lpm · ${fmt(STANDARD_MAN.bloodVolumeL, 1)} L volemia · 120/80 mmHg`,
    desc: `<b>Constantes Cardiovasculares:</b> Frecuencia cardíaca en reposo de ${STANDARD_MAN.restingHR} lpm, volumen sanguíneo de ${fmt(STANDARD_MAN.bloodVolumeL, 1)} L (aprox. 7,5% de la masa) y presión de 120/80 mmHg.`,
  },
  pulmonary: {
    id: 'pulmonary',
    name: 'Sistema Respiratorio',
    refValue: `${STANDARD_MAN.restingRR} rpm · ${fmt(STANDARD_MAN.lungCapacityTotalL, 1)} L CPT`,
    desc: `<b>Capacidad Pulmonar Total (CPT):</b> ${fmt(STANDARD_MAN.lungCapacityTotalL, 1)} L con un volumen corriente en reposo de ~500 ml a una frecuencia de ${STANDARD_MAN.restingRR} respiraciones por minuto.`,
  },
  composition: {
    id: 'composition',
    name: 'Composición Corporal',
    refValue: `${STANDARD_MAN.fatPercent} % grasa · ${STANDARD_MAN.bodyFluidsL} L fluidos`,
    desc: `<b>Distribución de Tejidos y Fluidos:</b> ${STANDARD_MAN.fatPercent}% tejido adiposo, ${STANDARD_MAN.bodyFluidsL} L de agua corporal total (${STANDARD_MAN.bodyFluidsIntracellularPercent}% intracelular, ${100 - STANDARD_MAN.bodyFluidsIntracellularPercent}% extracelular).`,
  },
};

export default function Slide8({ slideCount }: { slideCount?: string }) {
  const [mass, setMass] = useState<number>(STANDARD_MAN.massKg);
  const [height, setHeight] = useState<number>(STANDARD_MAN.heightM * 100);
  const [selectedParam, setSelectedParam] = useState<string>('mass');

  const currentDetail = PARAMS_DATA[selectedParam] || PARAMS_DATA.mass;

  const handleSelectParam = (pId: string) => {
    setSelectedParam(pId);
    const detail = PARAMS_DATA[pId];
    const info = document.getElementById('info-text-c1');
    if (info && detail) {
      info.innerHTML = detail.desc;
    }
  };

  const handleReset = () => {
    setMass(STANDARD_MAN.massKg);
    setHeight(STANDARD_MAN.heightM * 100);
    setSelectedParam('mass');
    const info = document.getElementById('info-text-c1');
    if (info) {
      info.innerHTML = PARAMS_DATA.mass.desc;
    }
  };

  // Cálculos reactivos
  const hM = height / 100;
  const bmi = mass / (hM * hM);
  const isReferenceBody = mass === STANDARD_MAN.massKg && hM === STANDARD_MAN.heightM;
  const bsa = isReferenceBody ? STANDARD_MAN.bsaM2 : 0.202 * Math.pow(mass, 0.425) * Math.pow(hM, 0.725);
  const bmr = 70 * Math.pow(mass / 70, 0.75);

  return (
    <>
      <div className="module-header">
        <span className="mnum">C1</span>
        <span className="mtitle">El Hombre Estándar</span>
        <span className="msub">El cuerpo de referencia de {STANDARD_MAN.massKg} kg · Tabla 1.5</span>
        <span className="mslide-count">{slideCount ?? '1 / 4'}</span>
      </div>
      <div className="content-grid">
        <div className="theory">
          <div className="card active">
            <div className="card-hdr">
              <span className="icon">📊</span> Parámetros del Hombre Estándar (Tabla 1.5)
            </div>
            <div className="card-body">
              <table className="data-mini">
                <tbody>
                  <tr><th>Parámetro</th><th>Valor de Referencia</th></tr>
                  <tr
                    onClick={() => handleSelectParam('mass')}
                    style={{ cursor: 'pointer', background: selectedParam === 'mass' ? 'var(--teal-tint)' : 'transparent' }}
                  >
                    <td><b>Altura · masa</b></td><td>{SM_HEIGHT} m · {STANDARD_MAN.massKg} kg ({STANDARD_MAN.weightN} N)</td>
                  </tr>
                  <tr
                    onClick={() => handleSelectParam('area')}
                    style={{ cursor: 'pointer', background: selectedParam === 'area' ? 'var(--teal-tint)' : 'transparent' }}
                  >
                    <td><b>Área de superficie</b></td><td>{fmt(STANDARD_MAN.bsaM2, 2)} m² (Du Bois)</td>
                  </tr>
                  <tr
                    onClick={() => handleSelectParam('bmr')}
                    style={{ cursor: 'pointer', background: selectedParam === 'bmr' ? 'var(--teal-tint)' : 'transparent' }}
                  >
                    <td><b>Tasa metabólica basal</b></td><td>{STANDARD_MAN.bmrKcalH} kcal/h ({STANDARD_MAN.bmrKcalDay} kcal/día)</td>
                  </tr>
                  <tr
                    onClick={() => handleSelectParam('cardio')}
                    style={{ cursor: 'pointer', background: selectedParam === 'cardio' ? 'var(--teal-tint)' : 'transparent' }}
                  >
                    <td><b>Frecuencia cardíaca</b></td><td>{STANDARD_MAN.restingHR} latidos/min · {fmt(STANDARD_MAN.bloodVolumeL, 1)} L</td>
                  </tr>
                  <tr
                    onClick={() => handleSelectParam('pulmonary')}
                    style={{ cursor: 'pointer', background: selectedParam === 'pulmonary' ? 'var(--teal-tint)' : 'transparent' }}
                  >
                    <td><b>Capacidad pulmonar</b></td><td>{fmt(STANDARD_MAN.lungCapacityTotalL, 1)} L total · {STANDARD_MAN.restingRR} rpm</td>
                  </tr>
                  <tr
                    onClick={() => handleSelectParam('composition')}
                    style={{ cursor: 'pointer', background: selectedParam === 'composition' ? 'var(--teal-tint)' : 'transparent' }}
                  >
                    <td><b>Composición y fluidos</b></td><td>{STANDARD_MAN.fatPercent} % grasa · {STANDARD_MAN.bodyFluidsL} L fluidos</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🧭</span> ¿Para qué sirve el estándar?
            </div>
            <div className="card-body">
              <p style={{ fontSize: '.7rem' }}>
                El <strong>Hombre Estándar</strong> es el punto de partida universal de los modelos biomecánicos y fisiológicos en medicina e ingeniería biomédica. Permite contrastar valores clínicos e identificar desviaciones anatómicas o metabólicas.
              </p>
            </div>
          </div>
          <div className="apuntes">
            <div className="a-hdr"><span>✍️</span> Apunte de cátedra</div>
            <div className="a-text" id="info-text-c1">
              <span dangerouslySetInnerHTML={{ __html: currentDetail.desc }} />
            </div>
          </div>
        </div>
        <div className="sim-area" style={{ position: 'relative' }}>
          <StandardHumanCanvas
            mass={mass}
            height={height}
            selectedParam={selectedParam}
            onParamSelect={handleSelectParam}
          />
          <div className="prof-controls">
            <span className="badge">C1 · Antropometría</span>

            {/* Sliders dobles interactivos de Masa y Estatura */}
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', fontSize: '0.62rem' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <span>Masa</span>:
                <input
                  type="range"
                  min="40"
                  max="130"
                  value={mass}
                  onChange={(e) => setMass(parseFloat(e.target.value))}
                  style={{ width: '65px' }}
                />
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.60rem', fontWeight: 'bold' }}>
                  {mass} kg
                </span>
              </label>

              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <span>Estatura</span>:
                <input
                  type="range"
                  min="140"
                  max="210"
                  value={height}
                  onChange={(e) => setHeight(parseFloat(e.target.value))}
                  style={{ width: '65px' }}
                />
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.60rem', fontWeight: 'bold' }}>
                  {height} cm
                </span>
              </label>
            </div>

            <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.60rem', color: 'var(--ink-2)' }}>
                IMC: <b>{fmt(bmi, 1)}</b> · Área: <b>{fmt(bsa, 2)} m²</b>
              </span>

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
                Restablecer ({STANDARD_MAN.massKg} kg)
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
