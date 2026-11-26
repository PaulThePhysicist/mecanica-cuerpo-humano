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

/** Tabla 1.8 — distancia del centro de masa desde cada extremo / longitud del
 *  segmento. `null` = «--» en el .tex. */
export const TABLE_18: { segment: string; proximal: string; distal: string | null }[] = [
  { segment: 'Mano', proximal: '0,506', distal: '0,494' },
  { segment: 'Antebrazo', proximal: '0,430', distal: '0,570' },
  { segment: 'Brazo', proximal: '0,436', distal: '0,564' },
  { segment: 'Antebrazo y mano', proximal: '0,682', distal: '0,318' },
  { segment: 'Brazo total', proximal: '0,530', distal: '0,470' },
  { segment: 'Pie', proximal: '0,50', distal: '0,50' },
  { segment: 'Pantorrilla', proximal: '0,433', distal: '0,567' },
  { segment: 'Muslo', proximal: '0,433', distal: '0,567' },
  { segment: 'Pie y pantorrilla', proximal: '0,606', distal: '0,394' },
  { segment: 'Pierna total', proximal: '0,447', distal: '0,553' },
  { segment: 'Cabeza y cuello', proximal: '1,00', distal: null },
  { segment: 'Tronco', proximal: '0,50', distal: '0,50' },
];

/** Tabla 1.9 — radio de giro alrededor del CdM y de cada extremo / longitud
 *  del segmento. Cifras como cadenas para conservar los ceros del libro. */
export const TABLE_19: { segment: string; com: string; proximal: string; distal: string | null }[] = [
  { segment: 'Mano', com: '0,297', proximal: '0,587', distal: '0,577' },
  { segment: 'Antebrazo', com: '0,303', proximal: '0,526', distal: '0,647' },
  { segment: 'Brazo', com: '0,322', proximal: '0,542', distal: '0,645' },
  { segment: 'Antebrazo y mano', com: '0,468', proximal: '0,827', distal: '0,565' },
  { segment: 'Brazo total', com: '0,368', proximal: '0,645', distal: '0,596' },
  { segment: 'Pie', com: '0,475', proximal: '0,690', distal: '0,690' },
  { segment: 'Pantorrilla', com: '0,302', proximal: '0,528', distal: '0,643' },
  { segment: 'Muslo', com: '0,323', proximal: '0,540', distal: '0,653' },
  { segment: 'Pie y pantorrilla', com: '0,416', proximal: '0,735', distal: '0,572' },
  { segment: 'Pierna total', com: '0,326', proximal: '0,560', distal: '0,650' },
  { segment: 'Cabeza y cuello', com: '0,495', proximal: '0,116', distal: null },
];
