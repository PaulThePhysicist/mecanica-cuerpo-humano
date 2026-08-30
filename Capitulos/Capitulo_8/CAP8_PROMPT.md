# Continuación: construir el deck HTML interactivo del Capítulo 8 (Sistema Cardiovascular)

Soy Paul, profesor universitario y dueño del proyecto. Estoy construyendo presentaciones HTML interactivas para dictar clase, replicando un sistema de diseño establecido. Vengo de terminar el deck del capítulo 7; ahora toca el capítulo 8.

**Tarea:** Construir `Capitulos/Capitulo_8/capitulo8.html` — un deck de presentación de una sola página (HTML/CSS/JS sin build step, en español) para el Capítulo 8 «Sistema Cardiovascular» de Irving P. Herman, *Physics of the Human Body* (2016, Springer). Fuente del contenido: `Capitulos/Capitulo_8/Capitulo_8.tex` (léelo completo primero). Debe ser una clase universitaria completa y dictable, con simulaciones interactivas en canvas como pieza central: seriedad académica + color estratégico + emojis ocasionales.

**Plantilla base:** Clona `Capitulos/Capitulo_7/capitulo7.html` (3.135 líneas) y **reutiliza su CSS, su engine JS y su patrón de simulaciones canvas verbatim** — no reescribas nada que ya exista. Mismo design system: «papel marfil», tinta fisiológica (teal/sangre/ámbar), fuentes Source Serif 4 + Karla + JetBrains Mono, KaTeX 0.16.11 vía CDN (`\(...\)`/`\[...\]`). Único cambio autorizado al motor: extender `window.AB.PAL` si una función de dibujo necesita un color nuevo. Ponytail modo `full` activo: mínimo código nuevo, sin sobre-ingeniería.

**Patrón del engine (cópialo de cap7):** slides `<div class="slide" data-slide="N" data-module="M">`; portada `.slide-full.active` con mpills; navegación por teclado (flechas/space/Home/End), `.module-bar` con pestañas, `#navDots`; slide de contenido = `.module-header` + `.content-grid` (`.theory` con cards + `.apuntes` con `div.a-text#info-text-N`) + `.sim-col` con `.sim-area` > `canvas.sim` + `.prof-controls` (badge, label+range+value-span, select, button, readout). Variables `const TOTAL=…; const MODULES=[…]`; funciones `go(n)`, `redrawSlide(n)`, `drawXx()` por slide, animaciones con `requestAnimationFrame` + `window.__damp` + globals `window.__xxPlaying/__xxT` y `toggleXx()`. Números en formato español (punto para miles, coma para decimales). Controles con IDs únicos `xx_*` (vigila colisiones de IDs entre slides). Al final `DOMContentLoaded`: dots, tabs, `renderMathInElement`, `redrawSlide(0)`.

**Flujo de trabajo (igual que caps 4–7):**
1. Lee el `.tex` del cap 8 y extrae todas las ecuaciones (8.1 a 8.133) y valores fisiológicos clave — presión arterial, gasto cardíaco, resistencias/resistencias en paralelo del circuito cardiovascular, ley de Poiseuille aplicada, trabajo del corazón, etc.
2. Diseña la estructura: ~23-25 slides en 8-9 módulos con una simulación canvas por slide de contenido.
3. Construye el HTML.
4. Verificación en navegador con driver CDP headless (Chrome `--headless=new`, `--remote-debugging-port`): navega todas las slides, activa los botones ▶ de las animadas, comprueba 0 excepciones JS / 0 errores de consola y que todos los canvases pinten píxeles no en blanco, captura screenshots en `_qc_c8/`.
5. Corrige cualquier error y re-verifica.
6. Limpia los temporales del QC.
7. Actualiza `STATUS.md` y `contexto_proyecto.md` (fila del deck 8, notas de verificación, capturas en `_qc_c8/`).

**Avisos conocidos:** el Cap. 8 tiene 5 `\ref{}` sin correspondencia en su `.log` (pendiente del proyecto, no lo arregles ahora, solo no te bloquees si algo no resuelve). Los decks 1–3 siguen pendientes de prueba en navegador. Respóndeme siempre en español. No me hagas preguntas: si hay una ambigüedad, resuélvela con el criterio que ya usaste en los caps 6–7.
