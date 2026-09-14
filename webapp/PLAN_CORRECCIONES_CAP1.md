# Plan de correcciones — Capítulo 1

**Origen:** auditoría de diseño y UX del 2026-09-11 (17 diapositivas, desktop 1440×900 y móvil 820×1180).
**Alcance:** `webapp/src/chapters/cap1/**` + `webapp/src/index.css`.
**Método de trabajo:** **un ticket a la vez**. No se abre el siguiente hasta que el anterior pasa su
criterio de aceptación y su verificación visual.

---

## Cómo usar este documento

Cada ticket tiene:

- **ID** — referencia corta para hablar de él (`C1-01`, `V2-03`, …).
- **Síntoma** — qué se ve mal, con la diapositiva concreta.
- **Dónde** — archivos candidatos. Hay que confirmarlos leyendo el código; no son dogma.
- **Arreglo** — qué cambiar.
- **Criterio de aceptación** — la condición binaria que cierra el ticket.
- **Verificación** — qué capturar para dejar constancia.

### Ciclo por ticket

1. Marcar el ticket como `EN CURSO` en la tabla de control.
2. Capturar el estado **antes** en `scratch/fix-<ID>/before-*.png`.
3. Hacer **solo** ese cambio. Sin refactors de paso, sin arreglar lo de al lado.
4. Capturar el **después** en `scratch/fix-<ID>/after-*.png`.
5. Comprobar el criterio de aceptación y que no se rompió ninguna otra diapositiva del mismo módulo.
6. `npm run lint` + `npm run build` en verde.
7. Commit con el ID en el mensaje: `fix(cap1): C1-01 unificar convención de planos`.
8. Marcar `CERRADO` y pasar al siguiente.

### Convenciones que fija este plan

Estas decisiones se toman una vez y valen para todos los tickets:

- **Decimales:** coma en todo el capítulo (es-ES), incluido el texto pintado en canvas y en Three.js.
- **Colores:** solo tokens de `:root` (`index.css`). Ningún color literal nuevo en canvas ni en
  materiales 3D. Si hace falta una gama nueva, se añade primero como token.
- **Tipografía:** `--mono` solo para cifras, unidades y código. Prosa en `--sans`, títulos en `--serif`.
- **Matemáticas:** toda expresión va por KaTeX. Cero notación de teclado (`^`, `_`) visible al lector.
- **Iconografía:** sin emoji. Vocabulario único de glifos o nada.

---

## Orden de ejecución

El orden no es negociable: primero lo que miente al lector, después lo que estorba, al final lo estético.

| Fase | Bloque | Tickets | Por qué va aquí |
| :--- | :--- | :--- | :--- |
| 1 | Contenido y datos | `C1-01` … `C1-06` | Un tratado con cifras contradictorias pierde autoridad. Es lo único que no se puede publicar. |
| 2 | Encuadre de visualizaciones | `V2-01` … `V2-05` | Es el mayor golpe a la calidad percibida y el más barato de arreglar. |
| 3 | Estructura de la diapositiva | `E3-01` … `E3-06` | Afecta a la comprensión: contenido que se corta, interacción que no se descubre. |
| 4 | Sistema visual | `S4-01` … `S4-06` | Cohesión. Importa, pero no impide entender nada. |

---

# Fase 1 · Contenido y datos

## `C1-01` · Unificar la convención de planos anatómicos

- **Síntoma** — A1 define `x` = anterior/posterior e `y` = derecha/izquierda. Con esa convención
  el plano sagital (separa derecha de izquierda) es `y = cte` y el coronal `x = cte`. A2 muestra lo
  contrario: «Sagital `x = cte`», «Coronal `y = cte`», y la píldora «midsagital: x = 0». Además la
  descripción del eje medial en A1 («|y| medial/lateral: distancia al plano sagital medio»)
  confirma que el sagital es `y = cte` — o sea, A1 y A2 se desmienten entre sí.
- **Dónde** — `Slide2.tsx` (etiquetas y píldoras), `Capitulo1.tsx` (`DESCRIPTIONS`, claves
  `plane-sagittal` / `plane-coronal` / `axis-*`), `PlanesCanvas.tsx` y/o el generador de planos en
  `sims.ts` (orientación de la geometría en 3D).
- **Arreglo** — Elegir la convención del libro (Herman) y aplicarla en los tres sitios: texto de la
  píldora, descripción del apunte y **orientación real del plano en la escena 3D**. Verificar que el
  plano que se pinta al pulsar «Sagital» es el que divide izquierda/derecha, no anterior/posterior.
- **Criterio de aceptación** — Las ecuaciones de A2, las descripciones de A1 y la geometría que se
  ve en el visor 3D dicen lo mismo. Un lector que compare A1 con A2 no encuentra contradicción.
- **Verificación** — Captura de A1 y A2, más una captura por cada plano aislado (sagital, coronal,
  transverso) mostrando que el corte es el correcto.

## `C1-02` · Una sola fuente de verdad para el Hombre Estándar

- **Síntoma** — El mismo cuerpo de referencia tiene cifras distintas según dónde se mire:
  - Área de superficie: `1,85 m²` en la tabla 1.5 de C1 (Du Bois), `1,82 m²` en las constantes
    vitales, en el chip «REFERENCIA» y en el disco de D3; el Resumen vuelve a `1,85`.
  - Peso: `690 N` en la tabla y el apunte, `687 N` en el panel de vitales.
  - Grasa: `15 %` en C1 y en el Resumen, `20,2 %` en la composición de D3 para el mismo 70 kg / 172 cm.
- **Dónde** — `Slide8.tsx` (C1), `StandardHumanCanvas.tsx`, `Slide14.tsx` (D3), `BMICalculatorCanvas.tsx`,
  `Slide16.tsx` (Resumen) y las constantes correspondientes en `sims.ts`.
- **Arreglo** — Crear **un único módulo de constantes** del hombre estándar (p. ej.
  `standardMan.ts`) con altura, masa, peso en N, área Du Bois, TMB, grasa y composición, y que
  tabla, panel de vitales, chips y resumen lean de ahí. Decidir explícitamente si el área se muestra
  como valor tabulado del libro o como resultado calculado de la ecuación de Du Bois — y usar el
  mismo criterio en todas las vistas.
- **Criterio de aceptación** — Ningún par de vistas del capítulo muestra dos valores distintos para
  la misma magnitud del cuerpo de referencia. Búsqueda de `1,85` / `1.85` / `687` / `690` en el
  código da un único origen.
- **Verificación** — Capturas de C1, D3 y Resumen con las cifras coincidiendo.

## `C1-03` · Añadir la unidad de tiempo a la TMB

- **Síntoma** — El panel de constantes vitales de C1 muestra «TMB `70 kcal`». Una tasa metabólica
  sin unidad de tiempo no es una tasa. La tabla, al lado, pone «70 kcal/h (1680 kcal/día)».
- **Dónde** — `StandardHumanCanvas.tsx` (rótulo del panel de vitales).
- **Arreglo** — Rotular `70 kcal/h`, y valorar añadir el equivalente diario como valor secundario.
  Revisar de paso las demás filas del panel por si alguna más va sin unidad.
- **Criterio de aceptación** — Toda magnitud del panel de vitales lleva su unidad completa.
- **Verificación** — Captura del panel de vitales de C1.

## `C1-04` · Renderizar el LaTeX pendiente del Resumen

- **Síntoma** — En la diapositiva de cierre se lee el LaTeX crudo: `L^{3/2}`, `a·m^α`,
  `K(S−S₀)^n`. Es la única diapositiva donde las matemáticas no se renderizan, justo la que
  recapitula el capítulo.
- **Dónde** — `Slide16.tsx` (las cadenas están escritas como texto plano, sin delimitadores `$`),
  y `renderKatex()` en `Capitulo1.tsx` si el problema es de alcance del auto-render.
- **Arreglo** — Envolver cada expresión en delimitadores KaTeX. Comprobar que la normalización de
  `renderKatex()` no está comiéndose las llaves ni las barras invertidas de estas cadenas en concreto.
- **Criterio de aceptación** — No queda ninguna `^`, `_`, `{` ni `\` visible al lector en toda la
  diapositiva de Resumen.
- **Verificación** — Captura del Resumen completo, desktop y móvil.

## `C1-05` · Corregir la coma doble de los grados de libertad

- **Síntoma** — En B1 KaTeX imprime `θx,,θy,,θz` con comas dobles bajo «3 rotacionales».
- **Dónde** — `Slide4.tsx` (la cadena de la ecuación) — probablemente un separador duplicado dentro
  de un `\underbrace`.
- **Arreglo** — Limpiar el separador. Revisar de paso la línea hermana `x, y, z` por simetría.
- **Criterio de aceptación** — Se lee `θx, θy, θz` con un separador por término.
- **Verificación** — Recorte de la ecuación de B1.

## `C1-06` · Unificar el separador decimal (coma) en todo el capítulo

- **Síntoma** — La prosa y las tablas usan coma (`0,75` · `23,7` · `1,72 m`) y los canvas usan punto
  (`99.22 W` · `×1.26` · `IMC 23.7` · `ρ = 1.066` · `1.82 m²`). En la tabla de D4 conviven en la
  misma fila: «n = 0,33» junto a «×1.26».
- **Dónde** — Todo el texto que se pinta con `fillText` en `sims.ts` y en los `*Canvas.tsx`
  (`AllometryCanvas`, `StevensCanvas`, `BMICalculatorCanvas`, `BoneScaleCanvas`,
  `StandardHumanCanvas`, `ProportionsCanvas`), más las etiquetas 3D de `Callouts.tsx`.
- **Arreglo** — Un único formateador (p. ej. `fmt(n, decimales)`) que devuelva la cifra con coma, y
  usarlo en **todos** los sitios donde hoy se hace `toFixed()` directo. Ojo a los casos que ya
  hacen `.replace('.', ',')` a mano: deben pasar por el mismo formateador.
- **Criterio de aceptación** — Ninguna cifra visible en el capítulo usa punto decimal. Buscar
  `toFixed(` en `cap1/**` y comprobar que toda ocurrencia pasa por el formateador.
- **Verificación** — Capturas de D1, D3, D4 y C1 (son las que más cifras pintan).

---

# Fase 2 · Encuadre de las visualizaciones

## `V2-01` · Encuadrar la cámara en el objetivo, no en el miembro

- **Síntoma** — La cámara no enmarca al protagonista en ninguna escena:
  - **B3:** el brazo ocupa ~12 % del lienzo, arrinconado arriba a la derecha, mientras un plano
    sagital translúcido gigante llena el resto y se corta por los cuatro lados.
  - **B2:** el tema es la *articulación*, pero se ve un húmero entero cortado por arriba y la
    cápsula del codo queda en unos 20 px.
  - **B1:** la pierna flota descentrada con la pelvis recortada por el borde superior.
- **Dónde** — `three/FitCamera.tsx`, `three/AnatomyStage.tsx`, `BodyScene.tsx`,
  `useAnatomyNodes.ts` (para obtener el nodo objetivo), `KinematicsCanvas.tsx`, `MobilityCanvas.tsx`.
- **Arreglo** — Que el *fit* se calcule sobre la **caja del nodo seleccionado** (articulación o
  hueso activo), no sobre la escena entera, con un margen relativo constante y el mismo criterio en
  las cuatro escenas. Limitar el tamaño del plano auxiliar de B3 a la caja del objetivo en vez de
  dejarlo en escala de escena.
- **Criterio de aceptación** — En B1, B2, B3 y C3 el objeto de interés ocupa como mínimo el 55 % de
  la altura útil del lienzo, está centrado y no toca ningún borde.
- **Verificación** — Capturas de las cuatro escenas y, en B2, una por cada uno de los 6 tipos
  sinoviales (cada selección reencuadra).

## `V2-02` · Hacer legible el rango de movilidad de C3

- **Síntoma** — El arco de ROM del hombro es un hilo de ~30 px sobre un esqueleto estático: no
  comunica los 188° que anuncia la tabla, y la figura no cambia de forma perceptible al elegir otra fila.
- **Dónde** — `MobilityCanvas.tsx`, `romTable.ts`, `three/Callouts.tsx`.
- **Arreglo** — Encuadrar la articulación seleccionada (depende de `V2-01`), engordar el arco, poner
  el valor en grados sobre el propio arco y mostrar las dos posiciones extremas del movimiento.
- **Criterio de aceptación** — Al pulsar una fila de la tabla 1.10, la figura reencuadra la
  articulación y el arco con su valor en grados es legible sin acercarse a la pantalla.
- **Verificación** — Capturas de tres filas distintas (hombro, codo, tobillo).

## `V2-03` · Eliminar las colisiones de rótulos

- **Síntoma** — En A1, A2, A3 y C3, «Posterior / Dorsal», «Anterior / Ventral» y «−x» se superponen
  en el mismo punto sobre la pelvis, y «← Derecha» cae encima de la mano. En C2 el callout
  «44,5 cm · 0,259·H» se pinta sobre el torso y las cotas verticales se solapan entre sí.
- **Dónde** — `three/Callouts.tsx` (rótulos de ejes 3D), `ProportionsCanvas.tsx` (cotas de C2).
- **Arreglo** — Separar rótulo y ancla con línea guía (*leader line*) y desplazamiento, y descartar
  o desplazar el rótulo cuando su caja se solape con otra ya colocada. Para las cotas de C2, alternar
  lados y escalonar en vertical.
- **Criterio de aceptación** — Ningún rótulo se solapa con otro ni cae sobre el cuerpo del modelo,
  en las cuatro diapositivas y con la cámara en su posición por defecto.
- **Verificación** — Capturas de A1, A2, A3, C2 y C3.

## `V2-04` · Terminar las dos gráficas

- **Síntoma** —
  - **D4 (Stevens):** sin marcas ni números en ningún eje, sin títulos de eje; «Lineal (n = 1,0)»
    choca con el subtítulo; cinco curvas de colores sin leyenda; la tarjeta flotante «Sonoridad»
    recorta el lado derecho del plot.
  - **D1 (alometría):** «99.2 W» se imprime encima de «Humano»; el título del eje x queda tapado
    por el panel de controles; el punto de la ballena azul toca el borde.
  - Ambas mezclan rótulos en mono, sans y cursiva dentro del mismo lienzo.
- **Dónde** — `StevensCanvas.tsx`, `AllometryCanvas.tsx`, y sus funciones de dibujo en `sims.ts`.
- **Arreglo** — Para cada gráfica: ejes con marcas y números, título de eje con unidad, leyenda de
  las curvas, margen interior que garantice que ningún punto ni rótulo toque el borde, y una única
  regla tipográfica (mono para cifras de eje, sans para rótulos). La tarjeta «Sonoridad» pasa a
  ocupar un hueco reservado, no a flotar sobre los datos.
- **Criterio de aceptación** — Las dos gráficas se leen sin el texto de apoyo: ejes rotulados,
  curvas identificables y ningún elemento recortado o solapado.
- **Verificación** — Capturas de D1 y D4, y de D4 con «Ver todas» activo.

## `V2-05` · Que el panel de controles reserve espacio en vez de tapar

- **Síntoma** — En C1, C2, D1 y D2 el HUD inferior flota sobre el lienzo y parte por la mitad textos
  que están debajo: «Kleiber: TMB ∝ m⁰·⁷⁵», «Pasa el cursor: resalta cuerpo y barra», el título del
  eje x. Además el botón `×` de cerrar queda descolgado en el extremo derecho, lejos de los
  controles que gobierna.
- **Dónde** — `HudPanel.tsx`, `legacy.css` (`.prof-controls`, `.prof-controls-toggle`), y el efecto
  que inyecta el toggle en `Capitulo1.tsx`.
- **Arreglo** — El lienzo reserva el alto del panel (o el pie de figura se coloca por encima de él),
  de modo que nada quede debajo. Recolocar el `×` junto al grupo de controles.
- **Criterio de aceptación** — Con el panel abierto no hay ningún texto ni eje parcialmente oculto
  en ninguna de las 17 diapositivas. Con el panel cerrado, el lienzo aprovecha el espacio liberado.
- **Verificación** — Barrido de las 17 diapositivas con panel abierto y con panel cerrado.

---

# Fase 3 · Estructura de la diapositiva

## `E3-01` · Resolver el desbordamiento de la columna izquierda

- **Síntoma** — En B1, C1, C2, C3, D1, D2, D3 y D4 hay una tarjeta cortada a media altura en el
  borde inferior (la tabla de masas de órganos, el apunte de cátedra, la fig. 1.15). En una
  presentación el usuario asume que lo que ve es todo: no hay sombra de scroll, ni indicador, ni
  señal de «continúa».
- **Dónde** — `legacy.css` (rejilla de `.slide`, alto de la columna de contenido), y los slides
  afectados si hay que repartir contenido.
- **Arreglo** — Dos caminos posibles; elegir uno y aplicarlo igual en las ocho: (a) paginar el
  contenido dentro del módulo para que cada diapositiva quepa, o (b) marcar el desbordamiento
  explícitamente con sombra de scroll y un indicador de continuación.
- **Criterio de aceptación** — Ninguna diapositiva corta una tarjeta sin señal visible de que hay
  más contenido, a 1440×900 y a 1280×720.
- **Verificación** — Barrido de las 17 diapositivas a dos resoluciones.

## `E3-02` · Dar señal de «esto se pulsa» a las tablas interactivas

- **Síntoma** — Las filas de B2 (los 6 tipos sinoviales), C3 (ROM), D1 y D4 son clicables y
  controlan la visualización, pero se leen como tablas de consulta: una sola fila resaltada y ninguna
  señal permanente. La enseñanza depende de que el lector descubra por casualidad que puede pulsarlas.
- **Dónde** — `legacy.css` (estilos de fila con `data-joint`, `data-mobility`, `data-prop`,
  `data-allometry`, `data-stevens`), y los slides correspondientes.
- **Arreglo** — Adoptar la misma convención que ya funciona en los chips de A1/A3: cursor de
  puntero, estado de hover claro, marca persistente en la fila activa (p. ej. `▸` o barra lateral) y
  una pista de una línea bajo la tabla la primera vez.
- **Criterio de aceptación** — Sin pasar el ratón, se distingue a simple vista que las filas son
  pulsables y cuál está activa.
- **Verificación** — Capturas de B2, C3, D1 y D4 en reposo y con una fila seleccionada.

## `E3-03` · Reequilibrar el reparto tabla / lienzo en móvil

- **Síntoma** — En B2 móvil la tabla de los 6 tipos se recorta a ~90 px mostrando una fila y media
  (el corte cae dentro de la segunda fila), mientras el lienzo 3D se queda con ~560 px para un
  modelo que ocupa el 15 % de ese espacio. El reparto está invertido.
- **Dónde** — `legacy.css` (media queries del capítulo), `three/AnatomyStage.tsx` (alto del lienzo).
- **Arreglo** — En móvil, la tabla se muestra completa (es el contenido) y el lienzo baja a un alto
  razonable con la cámara encuadrada al detalle (depende de `V2-01`). Ningún contenedor recorta una
  fila por la mitad.
- **Criterio de aceptación** — En 820×1180 ninguna tabla queda cortada dentro de una fila y ningún
  lienzo tiene más del 40 % de superficie vacía.
- **Verificación** — Barrido móvil de las 17 diapositivas.

## `E3-04` · Reconstruir la diapositiva de Resumen

- **Síntoma** — Cuatro tarjetas de ~310 px de alto con dos líneas de texto cada una: el 80 % es
  aire. Y como recapitulación no sirve: repite titulares en vez de devolver las cifras y ecuaciones
  que el lector querría fijar.
- **Dónde** — `Slide16.tsx`, `legacy.css`.
- **Arreglo** — O las tarjetas se ajustan a su contenido, o el contenido crece hasta merecer el
  tamaño: la cifra clave de cada pilar, su ecuación renderizada y un enlace a la diapositiva de
  origen. Depende de `C1-04` (LaTeX) y `C1-02` (cifras).
- **Criterio de aceptación** — Ninguna tarjeta tiene más de un 35 % de espacio vacío, y desde el
  resumen se puede saltar a cada módulo.
- **Verificación** — Captura del Resumen, desktop y móvil.

## `E3-05` · Corregir el recorte de las pestañas de módulo

- **Síntoma** — En las 17 capturas la barra de módulos aparece recortada por el borde superior de la
  ventana: se les ve el borde inferior pero no el superior.
- **Dónde** — `legacy.css` (`.module-bar`, `.module-tab`), y el ajuste de `font-size` de la raíz que
  hace `Capitulo1.tsx` en `useLayoutEffect` (puede estar descuadrando los altos calculados).
- **Arreglo** — Dar el espacio superior necesario para que las pestañas se vean completas, incluido
  su estado activo elevado.
- **Criterio de aceptación** — Las cinco pestañas se ven enteras, con su borde superior, en las 17
  diapositivas y a 1280×720.
- **Verificación** — Recorte de la barra superior en tres diapositivas de módulos distintos.

## `E3-06` · Replantear el riel de navegación lateral

- **Síntoma** — 17 puntos diminutos en el lateral izquierdo, sin etiqueta, con las flechas ← y →
  a alturas distintas y aparentemente huérfanas; el punto activo apenas se distingue de los demás.
  No dice dónde estás ni a dónde vas.
- **Dónde** — `legacy.css` (`.nav-bar`, `.nav-dots`, `.nav-dot`, `.nav-btn`), `Capitulo1.tsx`
  (marcado de la navegación).
- **Arreglo** — Agrupar los puntos por módulo (A, B, C, D + resumen), reforzar el contraste del
  estado activo y colocar las flechas como un par contiguo. Los módulos ya están rotulados arriba:
  el riel debe reflejar esa misma estructura.
- **Criterio de aceptación** — Se identifica de un vistazo el módulo y la posición dentro de él, y
  el punto activo se distingue sin comparar.
- **Verificación** — Recortes del riel en las diapositivas 1, 6, 11 y 17.

---

# Fase 4 · Sistema visual

## `S4-01` · Retirar los emoji

- **Síntoma** — 🐭 🐕 🐘 🐋 en la gráfica de Kleiber (D1), 🔊 sobre un rectángulo negro en Stevens
  (D4), ✅ en el pie del Resumen, ✍ y 💡 en los apuntes de cátedra. Rompen el registro editorial
  (papel, serif, grabado anatómico), se pintan con la tipografía del sistema operativo de cada
  usuario y en la gráfica compiten visualmente con los puntos de datos.
- **Dónde** — `sims.ts` (rótulos de `AllometryCanvas` y `StevensCanvas`), `Slide16.tsx`, los slides
  con apuntes, y `MODULES` en `sims.ts` (campo `ico` de las pestañas).
- **Arreglo** — Quitarlos. Los rótulos «Ratón / Caballo / Elefante / Ballena Azul» ya nombran la
  especie. Si se quiere marca visual, adoptar un vocabulario único y homogéneo en lugar de emoji
  del sistema.
- **Criterio de aceptación** — Cero emoji en el capítulo, incluidas las pestañas de módulo y el
  texto pintado en canvas.
- **Verificación** — Barrido de las 17 diapositivas; búsqueda de emoji en `cap1/**`.

## `S4-02` · Devolver los lienzos a la paleta de `:root`

- **Síntoma** — El sistema define teal, sangre, ámbar y los tres colores de plano. Pero C2 pinta las
  barras de segmentos con un degradado teal→violeta que no existe en `:root`, D4 dibuja cinco curvas
  en naranja, verde, lila, amarillo y rojo, y el checkbox «Ver todas» usa el azul nativo del navegador.
- **Dónde** — `ProportionsCanvas.tsx`, `StevensCanvas.tsx`, `sims.ts`, `three/materials.ts`,
  `legacy.css` (estilo del checkbox).
- **Arreglo** — Leer los colores de los tokens (o de una tabla derivada de ellos) en vez de
  literales. Si una gráfica necesita una serie categórica de 5 colores, definirla primero como
  escala en `:root` con la misma luminosidad y croma, variando el tono. Estilar el checkbox.
- **Criterio de aceptación** — Ningún color literal nuevo en el código de cap1; la serie de D4 es
  una escala declarada en el sistema.
- **Verificación** — Capturas de C2 y D4; revisión de literales de color en `cap1/**`.

## `S4-03` · Coser los tres lenguajes visuales del cuerpo

- **Síntoma** — Módulos A y B: esqueleto GLB casi fotorrealista. Módulo C y D3: maniquí vectorial
  plano de color arena. Módulo D: diagramas esquemáticos. Son tres lenguajes sin transición entre
  ellos; el salto de A3 a C1 se lee como cambiar de producto.
- **Dónde** — `three/StudioLights.tsx`, `three/materials.ts`, `three/AnatomyStage.tsx`,
  `StandardHumanCanvas.tsx`, `BMICalculatorCanvas.tsx`, `sims.ts`.
- **Arreglo** — No rehacer nada: acercarlos con un tratamiento común — mismo fondo, misma
  cuadrícula de suelo, misma familia de cotas, rótulos y líneas guía, mismo peso de línea. El
  contenido de cada módulo puede seguir siendo lo que es.
- **Criterio de aceptación** — Al pasar de A3 a C1 y de C1 a D1, el fondo, la cuadrícula y el
  estilo de las cotas y rótulos son reconociblemente los mismos.
- **Verificación** — Contactsheet con las 17 visualizaciones en miniatura, para juzgar la cohesión
  de un vistazo.

## `S4-04` · Acotar el uso de la monoespaciada

- **Síntoma** — Mono funciona bien para valores en tabla, pero también rotula prosa («Occipital:
  nuca», «tras la rodilla» en A3), encabezados («ÍNDICES DE MASA Y ESTATURA (W / H^P)» en D3) y
  resultados dentro de gráficas. Y en ese encabezado queda un `H^P` en notación de teclado teniendo
  KaTeX disponible.
- **Dónde** — `Slide3.tsx`, `Slide14.tsx`, `legacy.css`, rótulos de gráficas en `sims.ts`.
- **Arreglo** — Mono solo para cifras, unidades y código. La prosa de las tablas de términos pasa a
  `--sans`. El encabezado de D3 usa KaTeX o se reescribe en palabras.
- **Criterio de aceptación** — No hay prosa ni encabezados en monoespaciada, y no queda notación de
  teclado visible.
- **Verificación** — Capturas de A3 y D3.

## `S4-05` · Arreglar los dos iconos defectuosos de C3

- **Síntoma** — El encabezado «MASA DE LOS ÓRGANOS» muestra un cuadrado vacío (glifo no disponible
  en la fuente), y el icono de «RANGO DE MOVILIDAD ARTICULAR» se lee como un símbolo de
  prohibido/tachado, que significa lo contrario de lo que titula.
- **Dónde** — `Slide10.tsx`.
- **Arreglo** — Sustituir ambos por glifos del mismo vocabulario que los que sí funcionan (el compás
  de A1, el brazo de B). Depende de la decisión de `S4-01`.
- **Criterio de aceptación** — Los dos encabezados muestran un glifo que se renderiza en todas las
  plataformas y cuyo significado no contradice el título.
- **Verificación** — Recorte de los dos encabezados de C3.

## `S4-06` · Quitar los datos repetidos

- **Síntoma** — A3 lista las regiones como chips y otra vez como tabla justo debajo. C2 muestra las
  mismas longitudes tres veces: en la tabla, en las cotas del maniquí y en las barras Σ. Repetir no
  refuerza: obliga al lector a comprobar que las tres coinciden.
- **Dónde** — `Slide3.tsx` (A3), `Slide9.tsx` y `ProportionsCanvas.tsx` (C2).
- **Arreglo** — Asignar un papel distinto a cada representación y eliminar la redundante: en A3, o
  chips interactivos o tabla de referencia, no las dos con el mismo contenido. En C2, la tabla da
  los números y la figura da la proporción — las barras Σ deben aportar algo que la tabla no diga
  (la suma, la fracción del total) o desaparecer.
- **Criterio de aceptación** — Cada dato del capítulo aparece una vez, o si aparece dos, la segunda
  vez responde a una pregunta distinta.
- **Verificación** — Capturas de A3 y C2.

---

## Tabla de control

Estado: `PENDIENTE` · `EN CURSO` · `CERRADO`.

| ID | Fase | Título | Estado | Commit |
| :--- | :--- | :--- | :--- | :--- |
| `C1-01` | 1 | Unificar la convención de planos anatómicos | CERRADO | `fix(cap1): C1-01 unificar convención de planos anatómicos` |
| `C1-02` | 1 | Una sola fuente de verdad para el Hombre Estándar | CERRADO | `fix(cap1): C1-02 unificar constantes del hombre estándar` |
| `C1-03` | 1 | Añadir la unidad de tiempo a la TMB | CERRADO | `fix(cap1): C1-03 añadir la unidad de tiempo a la TMB` |
| `C1-04` | 1 | Renderizar el LaTeX pendiente del Resumen | CERRADO | `fix(cap1): C1-04 renderizar el LaTeX pendiente del Resumen` |
| `C1-05` | 1 | Corregir la coma doble de los grados de libertad | CERRADO | `fix(cap1): C1-05 corregir la coma doble de los grados de libertad` |
| `C1-06` | 1 | Unificar el separador decimal (coma) | CERRADO | `fix(cap1): C1-06 unificar el separador decimal (coma)` |
| `V2-01` | 2 | Encuadrar la cámara en el objetivo | CERRADO | `fix(cap1): V2-01 encuadrar la cámara en el objetivo, no en el miembro` |
| `V2-02` | 2 | Hacer legible el rango de movilidad de C3 | CERRADO | `fix(cap1): V2-02 hacer legible el rango de movilidad de C3` |
| `V2-03` | 2 | Eliminar las colisiones de rótulos | CERRADO | `fix(cap1): V2-03 eliminar las colisiones de rótulos` |
| `V2-04` | 2 | Terminar las dos gráficas | CERRADO | `fix(cap1): V2-04 terminar las dos gráficas (D1, D4)` |
| `V2-05` | 2 | Que el panel de controles reserve espacio | CERRADO | `fix(cap1): V2-05 que el panel de controles reserve espacio` |
| `E3-01` | 3 | Resolver el desbordamiento de la columna izquierda | CERRADO | `fix(cap1): E3-01 señal de scroll en la columna de teoría` |
| `E3-02` | 3 | Señal de «esto se pulsa» en las tablas | CERRADO | `fix(cap1): E3-02 señal de interactividad en las tablas de B2, C3, D1 y D4` |
| `E3-03` | 3 | Reequilibrar tabla / lienzo en móvil | CERRADO | `fix(cap1): E3-03 dejar que la diapositiva móvil scrollee en vez de recortar la teoría` |
| `E3-04` | 3 | Reconstruir la diapositiva de Resumen | CERRADO | `fix(cap1): E3-04 ajustar las tarjetas del Resumen a su contenido` |
| `E3-05` | 3 | Corregir el recorte de las pestañas de módulo | CERRADO | `fix(cap1): E3-05 evitar que las pestañas de módulo envuelvan a dos líneas` |
| `E3-06` | 3 | Replantear el riel de navegación lateral | CERRADO | `fix(cap1): E3-06 agrupar el riel de navegación por módulo` |
| `S4-01` | 4 | Retirar los emoji | PENDIENTE | |
| `S4-02` | 4 | Devolver los lienzos a la paleta de `:root` | CERRADO | `fix(cap1): S4-02 devolver los lienzos a la paleta de :root` |
| `S4-03` | 4 | Coser los tres lenguajes visuales del cuerpo | CERRADO | `fix(cap1): S4-03 coser los tres lenguajes visuales del cuerpo` |
| `S4-04` | 4 | Acotar el uso de la monoespaciada | PENDIENTE | |
| `S4-05` | 4 | Arreglar los dos iconos defectuosos de C3 | PENDIENTE | |
| `S4-06` | 4 | Quitar los datos repetidos | PENDIENTE | |

---

## Dependencias

- `V2-02` depende de `V2-01` (necesita el encuadre por objetivo).
- `E3-03` depende de `V2-01` (el lienzo móvil solo puede encogerse si la cámara enmarca el detalle).
- `E3-04` depende de `C1-02` y `C1-04` (cifras unificadas y matemáticas renderizadas).
- `S4-05` depende de `S4-01` (la decisión sobre iconografía).
- `S4-06` (parte de C2) conviene hacerlo después de `V2-03`, que ya toca las cotas de esa figura.

## Fuera de alcance de este plan

La auditoría técnica del 2026-09-02 (`AUDITORIA_CAP1.md`) cubre bundle de entrada,
`requestAnimationFrame` permanente y fugas de listeners. Este plan no los repite; si se abordan en
paralelo, conviene hacerlo **entre fases**, no dentro de un ticket, para no mezclar cambios de
rendimiento con cambios visuales en el mismo commit.
