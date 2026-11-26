/**
 * Área segura frente al panel flotante de controles (decisión D2, V6-01…V6-03).
 *
 * El panel `.prof-controls` flota sobre el borde inferior del lienzo (a sangre)
 * y, abierto, tapa ejes, pies de figura y cotas. Cada lienzo sigue pintando el
 * fondo y la cuadrícula hasta el borde, pero compone su contenido por encima
 * del panel usando este margen. Con el panel colapsado (o ausente) vale 0.
 */
export function panelOverlap(el: Element | null): number {
  if (!el) return 0;
  const area = el.closest('.sim-area');
  if (!area) return 0;
  const panel = Array.from(area.children).find((c) => c.classList.contains('prof-controls')) as HTMLElement | undefined;
  if (!panel || panel.classList.contains('is-collapsed')) return 0;
  const cs = getComputedStyle(panel);
  if (cs.display === 'none' || cs.visibility === 'hidden') return 0;
  const pr = panel.getBoundingClientRect();
  if (pr.height === 0) return 0;
  const cr = el.getBoundingClientRect();
  // `offsetTop` ignora la transformación de la animación de entrada (fadeUp),
  // así el margen no «salta» durante los primeros 480 ms.
  const top = area.getBoundingClientRect().top + panel.offsetTop;
  return Math.max(0, Math.round(cr.bottom - top + 6));
}

/**
 * Llama a `onChange` cuando el panel de la misma `.sim-area` se abre, se
 * cierra o cambia de alto. Para lienzos que no redibujan en cada fotograma.
 */
export function watchPanel(el: Element | null, onChange: () => void): () => void {
  const area = el?.closest('.sim-area');
  if (!area) return () => {};
  const panel = Array.from(area.children).find((c) => c.classList.contains('prof-controls'));
  if (!panel) return () => {};
  const mo = new MutationObserver(onChange);
  mo.observe(panel, { attributes: true, attributeFilter: ['class', 'style'] });
  const ro = new ResizeObserver(onChange);
  ro.observe(panel);
  return () => {
    mo.disconnect();
    ro.disconnect();
  };
}
