import React, { useEffect, useMemo, useState } from 'react';
import StandardHumanCanvas from './StandardHumanCanvas';
import { STANDARD_MAN } from './standardMan';
import { fmt } from './format';
// @ts-ignore - katex auto-render no incluye tipos
import renderMathInElement from 'katex/contrib/auto-render';

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
    name: 'Área de superficie',
    refValue: `${fmt(STANDARD_MAN.bsaM2, 2)} m²`,
    desc: '<b>Área de superficie:</b> 1,85 m² es el valor tabulado (Tabla 1.5). La fórmula de Du Bois (Ec. 1.2, módulo D3) da 1,82 m² para 70 kg y 1,72 m: las tablas del libro no siempre coinciden entre sí. Clave para la disipación térmica y la dosificación farmacológica.',
  },
  bmr: {
    id: 'bmr',
    name: 'Tasa Metabólica Basal (Kleiber)',
    refValue: `${STANDARD_MAN.bmrKcalH} kcal/h (${STANDARD_MAN.bmrKcalDay} kcal/día)`,
    desc: `<b>Tasa metabólica basal (TMB):</b> ${STANDARD_MAN.bmrKcalH} kcal/h = ${STANDARD_MAN.bmrKcalDay} kcal/día ≈ 81 W (Tabla 1.5). La ley de Kleiber (módulo D1) predice $4{,}1\\,m_b^{0{,}75} \\approx 99\\text{ W}$ para 70 kg: el libro advierte que sus tablas proceden de fuentes distintas y no siempre coinciden.`,
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

function renderC1Math() {
  const info = document.getElementById('info-text-c1');
  if (!info) return;
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

export default function Slide8({ slideCount }: { slideCount?: string }) {
  const [mass, setMass] = useState<number>(STANDARD_MAN.massKg);
  const [height, setHeight] = useState<number>(STANDARD_MAN.heightM * 100);
  const [selectedParam, setSelectedParam] = useState<string>('mass');

  const currentDetail = PARAMS_DATA[selectedParam] || PARAMS_DATA.mass;
  // El apunte tiene un único dueño: el estado `selectedParam`. El objeto se
  // memoiza para que React no reescriba el innerHTML (ya pasado por KaTeX) en
  // cada render ajeno, p. ej. al mover los deslizadores de masa/estatura.
  const apunteHtml = useMemo(() => ({ __html: currentDetail.desc }), [currentDetail.desc]);

  // KaTeX se vuelve a aplicar cada vez que cambia el contenido del apunte
  // (mismo mecanismo que C3 y D1).
  useEffect(() => {
    const info = document.getElementById('info-text-c1');
    if (!info) return undefined;

    const renderIfNeeded = () => {
      if (info.textContent?.includes('$')) renderC1Math();
    };
    const timers = [0, 80, 200].map((delay) => window.setTimeout(renderIfNeeded, delay));
    const observer = new MutationObserver(renderIfNeeded);
    observer.observe(info, { childList: true, subtree: true, characterData: true });

    return () => {
      timers.forEach((id) => window.clearTimeout(id));
      observer.disconnect();
    };
  }, [selectedParam]);

  const handleSelectParam = (pId: string) => {
    setSelectedParam(pId);
  };

  const handleReset = () => {
    setMass(STANDARD_MAN.massKg);
    setHeight(STANDARD_MAN.heightM * 100);
    setSelectedParam('mass');
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
                    <td><b>Área de superficie</b></td><td>{fmt(STANDARD_MAN.bsaM2, 2)} m²</td>
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
              <span dangerouslySetInnerHTML={apunteHtml} />
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
