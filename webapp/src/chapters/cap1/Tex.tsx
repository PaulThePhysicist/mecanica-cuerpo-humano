// @ts-ignore - katex no incluye tipos (mismo criterio que auto-render en el capítulo)
import katex from 'katex';

/**
 * Fórmula KaTeX en línea para celdas de tabla y textos cortos que React pinta
 * directamente (sin pasar por auto-render). Las cifras dentro de la fórmula
 * llevan coma decimal escrita como `{,}` en el propio TeX.
 */
export default function Tex({ children, display = false }: { children: string; display?: boolean }) {
  const html: string = katex.renderToString(children, { throwOnError: false, displayMode: display });
  return <span className="tex" dangerouslySetInnerHTML={{ __html: html }} />;
}
