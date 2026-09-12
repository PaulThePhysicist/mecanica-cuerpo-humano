/**
 * Formateador único de cifras visibles al lector — separador decimal coma
 * (es-ES), en prosa, tablas HTML, canvas y etiquetas 3D. Ticket C1-06: antes
 * cada vista redondeaba con `toFixed()` y algunas parcheaban el punto a mano
 * con `.replace('.', ',')`; ahora todas pasan por aquí.
 *
 * No usar en números que no ve el lector (coordenadas, factores de una
 * expresión JS, valores internos de cálculo): esos se dejan tal cual.
 */
export function fmt(n: number, decimals = 0): string {
  return n.toFixed(decimals).replace('.', ',');
}

/** Como fmt(), con espacio fino (U+2009) como separador de miles — úsalo
 *  solo cuando el valor puede alcanzar miles (p. ej. masas en gramos). */
export function fmtMil(n: number, decimals = 0): string {
  const sign = n < 0 ? '-' : '';
  const [intPart, decPart] = Math.abs(n).toFixed(decimals).split('.');
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return sign + grouped + (decPart ? ',' + decPart : '');
}
