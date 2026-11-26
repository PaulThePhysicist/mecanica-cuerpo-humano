/**
 * Tablas antropométricas por segmento del Cap. 1 §1.3 (solo datos), copiadas
 * literalmente de Capitulos/Capitulo_1/Capitulo_1.tex. Las vistas formatean
 * con coma decimal (format.ts); aquí los números quedan en notación JS.
 */

/** Tabla 1.7 — masa del segmento / masa corporal total m_b y densidad (g/cm³). */
export const TABLE_17: { segment: string; massFrac: number; fracDigits: number; density: number }[] = [
  { segment: 'Mano', massFrac: 0.006, fracDigits: 3, density: 1.16 },
  { segment: 'Antebrazo', massFrac: 0.016, fracDigits: 3, density: 1.13 },
  { segment: 'Brazo', massFrac: 0.028, fracDigits: 3, density: 1.07 },
  { segment: 'Antebrazo y mano', massFrac: 0.022, fracDigits: 3, density: 1.14 },
  { segment: 'Brazo total', massFrac: 0.050, fracDigits: 3, density: 1.11 },
  { segment: 'Pie', massFrac: 0.0145, fracDigits: 4, density: 1.10 },
  { segment: 'Pantorrilla', massFrac: 0.0465, fracDigits: 4, density: 1.09 },
  { segment: 'Muslo', massFrac: 0.100, fracDigits: 3, density: 1.05 },
  { segment: 'Pie y pantorrilla', massFrac: 0.061, fracDigits: 3, density: 1.09 },
  { segment: 'Pierna total', massFrac: 0.161, fracDigits: 3, density: 1.06 },
  { segment: 'Cabeza y cuello', massFrac: 0.081, fracDigits: 3, density: 1.11 },
  { segment: 'Tronco', massFrac: 0.497, fracDigits: 3, density: 1.03 },
];
