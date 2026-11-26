import { useLayoutEffect, useRef } from 'react';
// @ts-ignore - katex auto-render no incluye tipos
import renderMathInElement from 'katex/contrib/auto-render';

/**
 * Apunte de cátedra con HTML + KaTeX que cambia con el estado de la diapositiva.
 *
 * `renderKatex()` de Capitulo2 solo recorre el DOM al cambiar de diapositiva; un
 * `dangerouslySetInnerHTML` que cambia después (al elegir una fila, una fase, una
 * postura…) dejaba visible la notación cruda (`$b_p \approx 5\text{ cm}$`). Aquí
 * el propio nodo se re-renderiza con KaTeX cada vez que cambia su contenido.
 */
export default function KatexHtml({ html }: { html: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = html;
    renderMathInElement(el, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false },
        { left: '\\(', right: '\\)', display: false },
        { left: '\\[', right: '\\]', display: true },
      ],
      throwOnError: false,
    });
  }, [html]);
  return <span ref={ref} />;
}
