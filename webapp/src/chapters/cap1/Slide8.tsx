import React, { useEffect, useMemo, useState } from 'react';
import StandardHumanCanvas from './StandardHumanCanvas';
import { STANDARD_MAN } from './standardMan';
import { fmt } from './format';
import Tex from './Tex';
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
    name: 'Tasa metabólica basal',
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
    refValue: `${STANDARD_MAN.restingRR} resp/min · ${fmt(STANDARD_MAN.lungCapacityTotalL, 1)} L CPT`,
    desc: `<b>Capacidad Pulmonar Total (CPT):</b> ${fmt(STANDARD_MAN.lungCapacityTotalL, 1)} L con un volumen corriente en reposo de ~500 ml a una frecuencia de ${STANDARD_MAN.restingRR} respiraciones por minuto.`,
  },
  composition: {
    id: 'composition',
    name: 'Composición Corporal',
    refValue: `${STANDARD_MAN.fatPercent} % grasa · ${STANDARD_MAN.bodyFluidsL} L fluidos`,
    desc: `<b>Distribución de Tejidos y Fluidos:</b> ${STANDARD_MAN.fatPercent}% tejido adiposo, ${STANDARD_MAN.bodyFluidsL} L de agua corporal total (${STANDARD_MAN.bodyFluidsIntracellularPercent}% intracelular, ${100 - STANDARD_MAN.bodyFluidsIntracellularPercent}% extracelular).`,
  },
};

/* P6-25 · Tabla 1.5 completa (29 parámetros, .tex líneas 320-347) en cuatro
   pestañas. Las filas con `param` responden al clic igual que antes (apunte y
   lienzo); las demás son de consulta. */
const SM = STANDARD_MAN;
type TabId = 'general' | 'heat' | 'cardio' | 'resp';
interface Row { label: React.ReactNode; value: React.ReactNode; param?: string }

const TABLE_15: { id: TabId; label: string; rows: Row[] }[] = [
  {
    id: 'general',
    label: 'General',
    rows: [
      { label: 'Edad', value: `${SM.ageYears} años`, param: 'mass' },
      { label: 'Altura', value: `${SM_HEIGHT} m (5 pies 8 pulgadas)`, param: 'mass' },
      { label: 'Masa', value: `${SM.massKg} kg`, param: 'mass' },
      { label: 'Peso', value: `${SM.weightN} N (${SM.weightLb} lb)`, param: 'mass' },
      { label: 'Área de superficie', value: `${fmt(SM.bsaM2, 2)} m²`, param: 'area' },
      { label: 'Grasa corporal', value: `${SM.fatPercent} %`, param: 'composition' },
      { label: 'Capa de grasa subcutánea', value: `${SM.subcutaneousFatMm} mm` },
      { label: 'Volumen de fluidos corporales', value: `${SM.bodyFluidsL} L`, param: 'composition' },
      {
        label: 'Composición de fluidos (intracelular · intersticial y linfa · plasma)',
        value: `${SM.bodyFluidsIntracellularPercent} % · ${SM.bodyFluidsInterstitialPercent} % · ${SM.bodyFluidsPlasmaPercent} %`,
        param: 'composition',
      },
    ],
  },
  {
    id: 'heat',
    label: 'Calor y energía',
    rows: [
      { label: 'Temperatura corporal central', value: `${fmt(SM.coreTempC, 1)} °C` },
      { label: 'Temperatura de la piel', value: `${fmt(SM.skinTempC, 1)} °C` },
      { label: 'Capacidad calorífica', value: `${fmt(SM.heatCapacityKcal, 2)} kcal/kg·°C (${fmt(SM.heatCapacityKJ, 1)} kJ/kg·°C)` },
      {
        label: 'Tasa metabólica basal',
        value: `${SM.bmrKcalH} kcal/h (${SM.bmrKcalDay} kcal/día · ${SM.bmrKcalM2H} kcal/m²·h · ${SM.bmrWM2} W/m²)`,
        param: 'bmr',
      },
      { label: 'Eficiencia del trabajo mecánico', value: `0–${SM.efficiencyMaxPercent} %` },
    ],
  },
  {
    id: 'cardio',
    label: 'Corazón y sangre',
    rows: [
      { label: 'Frecuencia cardíaca', value: `${SM.restingHR} latidos/min`, param: 'cardio' },
      { label: 'Volumen sanguíneo', value: `${fmt(SM.bloodVolumeL, 1)} L`, param: 'cardio' },
      { label: 'Hematocrito de la sangre', value: fmt(SM.hematocrit, 2) },
      { label: 'Gasto cardíaco (en reposo)', value: `${fmt(SM.cardiacOutputRestLMin, 1)} L/min` },
      {
        label: 'Gasto cardíaco (en general)',
        value: <><Tex>{'3{,}0 + 8 \\times (\\text{consumo de O}_2)'}</Tex> L/min</>,
      },
      { label: 'Presión arterial sistólica', value: `${SM.systolicMmHg} mmHg (${fmt(SM.systolicKPa, 1)} kPa)`, param: 'cardio' },
      { label: 'Presión arterial diastólica', value: `${SM.diastolicMmHg} mmHg (${fmt(SM.diastolicKPa, 1)} kPa)`, param: 'cardio' },
    ],
  },
  {
    id: 'resp',
    label: 'Respiración',
    rows: [
      { label: 'Frecuencia respiratoria', value: `${SM.restingRR}/min`, param: 'pulmonary' },
      { label: 'Consumo de O₂', value: `${fmt(SM.o2ConsumptionLMin, 2)} L/min` },
      { label: 'Producción de CO₂', value: `${fmt(SM.co2ProductionLMin, 2)} L/min` },
      { label: 'Capacidad pulmonar total', value: `${fmt(SM.lungCapacityTotalL, 1)} L`, param: 'pulmonary' },
      { label: 'Capacidad vital', value: `${fmt(SM.vitalCapacityL, 1)} L` },
      { label: 'Volumen corriente', value: `${fmt(SM.tidalVolumeL, 1)} L`, param: 'pulmonary' },
      { label: 'Espacio muerto pulmonar', value: `${fmt(SM.deadSpaceL, 2)} L` },
      { label: 'Área de transferencia de masa pulmonar', value: `${SM.lungAreaM2} m²` },
    ],
  },
];

/** Pestaña que contiene cada fila interactiva (para seguir al lienzo). */
const PARAM_TAB: Record<string, TabId> = {
  mass: 'general',
  area: 'general',
  composition: 'general',
  bmr: 'heat',
  cardio: 'cardio',
  pulmonary: 'resp',
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
  const [tab, setTab] = useState<TabId>('general');

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
    // Si la selección llega desde el lienzo, la tabla abre la pestaña que la contiene.
    const owner = PARAM_TAB[pId];
    if (owner) setTab(owner);
  };

  const handleReset = () => {
    setMass(STANDARD_MAN.massKg);
    setHeight(STANDARD_MAN.heightM * 100);
    setSelectedParam('mass');
    setTab('general');
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
              <div className="card-tabs" role="tablist" aria-label="Grupos de la Tabla 1.5">
                {TABLE_15.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    aria-selected={tab === t.id}
                    onClick={() => setTab(t.id)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <table className="data-mini" role="tabpanel">
                <tbody>
                  <tr><th>Parámetro</th><th>Valor</th></tr>
                  {TABLE_15.find((t) => t.id === tab)?.rows.map((row, i) => {
                    if (!row.param) {
                      return (
                        <tr key={i}>
                          <td>{row.label}</td><td>{row.value}</td>
                        </tr>
                      );
                    }
                    const pId = row.param;
                    const isSel = selectedParam === pId;
                    return (
                      <tr
                        key={i}
                        className="row-link"
                        onClick={() => handleSelectParam(pId)}
                        onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); handleSelectParam(pId); } }}
                        tabIndex={0}
                        aria-selected={isSel}
                      >
                        <td><b>{row.label}</b></td><td>{row.value}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <p className="table-note">En negrita, las filas que se señalan en el lienzo y cambian el apunte.</p>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <span className="icon">🧭</span> Nota de la Tabla 1.5 y escalas de tiempo
            </div>
            <div className="card-body">
              <p>
                Son valores <strong>típicos</strong>, con amplias variaciones entre personas: tipifican a los
                <strong> varones estadounidenses de mediados de la década de 1970</strong>. En las mujeres son distintos
                (estatura y peso menores, mayor porcentaje de grasa) y cambian con la región y con el tiempo: la estatura
                de los hombres de Europa occidental subió <span className="tag">8–17 cm</span> en dos siglos, a un ritmo
                reciente de <span className="tag">1–2 cm/década</span>.
              </p>
              <p style={{ marginTop: '.45rem' }}><strong>Tiempos característicos del cuerpo</strong></p>
              <div className="row">
                <span className="fact-chip"><b>~1 s</b> un latido, una respiración</span>
                <span className="fact-chip"><b>~1 min</b> la sangre da una vuelta al cuerpo</span>
                <span className="fact-chip"><b>~2 min</b> cada ATP se gasta y se regenera</span>
              </div>
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
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize:  'max(12px, 0.60rem)', fontWeight: 'bold' }}>
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
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize:  'max(12px, 0.60rem)', fontWeight: 'bold' }}>
                  {height} cm
                </span>
              </label>
            </div>

            <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
              <span style={{ fontSize:  'max(12px, 0.60rem)', color: 'var(--ink-2)' }}>
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
