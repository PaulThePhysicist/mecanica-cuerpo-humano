/**
 * Constantes del «Hombre Estándar» — Tabla 1.5, Cap. 1 §1.3 «El humano estándar»
 * (Capitulos/Capitulo_1/Capitulo_1.tex, líneas 320-347). Fuente única: toda vista
 * del capítulo que cite la Tabla 1.5 lee de aquí; no repetir el literal.
 *
 * Sobre área y peso (ticket C1-02): la Tabla 1.5 da área = 1,85 m² y peso = 690 N
 * como valores tabulados, sin fórmula asociada. La Ec. 1.2 del propio libro
 * (Du Bois, A = 0,202·m^0,425·H^0,725, Sec. 1.4) es una relación de escala
 * *distinta* que el libro invita a comparar con la Tabla 1.5 (Problema 1.36):
 * evaluada en 70 kg/1,72 m da ≈1,82 m², no 1,85. Del mismo modo, W = mg con
 * g = 9,81 da 687 N, no 690 N (g ≈ 9,86 implícito en la tabla, redondeo del
 * libro). No son errores: son dos números legítimamente distintos por método
 * distinto — igual que la grasa tabulada (15 %) frente a la grasa estimada por
 * IMC en D3 (~20,2 %).
 *
 * Decisión aplicada: las vistas que citan «Tabla 1.5» (C1: tabla + panel de
 * vitales cuando masa/altura están en su valor de referencia; Resumen) usan
 * los valores tabulados de este módulo. Las vistas que evalúan una fórmula en
 * vivo (D3: Du Bois e IMC; C1 con masa/altura distintas al hombre estándar)
 * siguen calculando su propio resultado y lo rotulan como tal.
 */
export const STANDARD_MAN = {
  ageYears: 30,          // Tabla 1.5: «Edad — 30 años»
  heightM: 1.72,         // Tabla 1.5: «Altura — 1,72 m (5 pies 8 pulgadas)»
  massKg: 70,            // Tabla 1.5: «Masa — 70 kg»
  weightN: 690,          // Tabla 1.5: «Peso — 690 N (154 lb)»
  bsaM2: 1.85,           // Tabla 1.5: «Área de superficie — 1,85 m²»
  bmrKcalH: 70,          // Tabla 1.5: «Tasa metabólica basal — 70 kcal/h»
  bmrKcalDay: 1680,      // Tabla 1.5: «... (1680 kcal/día, ...)»
  fatPercent: 15,        // Tabla 1.5: «Grasa corporal — 15 %»
  bodyFluidsL: 51,       // Tabla 1.5: «Volumen de fluidos corporales — 51 L»
  bodyFluidsIntracellularPercent: 53, // Tabla 1.5: «53 % intracelular; 40 % intersticial/linfa; 7 % plasma»
  restingHR: 65,         // Tabla 1.5: «Frecuencia cardíaca — 65 latidos/min»
  bloodVolumeL: 5.2,     // Tabla 1.5: «Volumen sanguíneo — 5,2 L»
  restingRR: 15,         // Tabla 1.5: «Frecuencia respiratoria — 15/min»
  lungCapacityTotalL: 6.0, // Tabla 1.5: «Capacidad pulmonar total — 6,0 L»
} as const;

/** g estándar (m/s²) usado por los paneles que calculan W = mg en vivo para
 *  masas distintas a la del hombre estándar. A 70 kg da 687 N, no los 690 N
 *  tabulados: ver nota de cabecera. */
export const STANDARD_GRAVITY = 9.81;
