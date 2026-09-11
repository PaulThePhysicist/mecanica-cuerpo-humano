# Instrucciones de ejecución — Correcciones Capítulo 1

> **Para Claude Code.** Este archivo es ejecutable: cada ticket lleva archivos, pasos,
> criterio de aceptación y comandos. El documento hermano `PLAN_CORRECCIONES_CAP1.md` explica
> el *por qué* de cada corrección; este explica el *cómo*. Si los dos se contradicen, manda este.
>
> **Origen:** auditoría de diseño y UX del 2026-09-11 sobre `scratch/prod-verify4` + lectura de código.

---

## 0 · Protocolo de ejecución

**Regla número uno: un ticket por sesión.** El usuario revisa y aprueba cada corrección antes de
pasar a la siguiente. No encadenes tickets aunque parezcan triviales o relacionados.

Para cada ticket:

1. Leer el ticket completo antes de tocar nada.
2. Leer los archivos listados en **Archivos**. Si una ruta no existe o el contenido no coincide con
   lo que describe el ticket, **detente y repórtalo** — no improvises la ubicación.
3. Aplicar **solo** lo que dice **Pasos**. Nada de refactors de paso, renombrados, formateo del
   archivo entero, ni arreglar algo que veas mal al lado: si encuentras un problema nuevo, anótalo
   en **Hallazgos colaterales** al final de este archivo y sigue.
4. Ejecutar los comandos de **Verificación**.
5. Marcar el ticket en la tabla de control de `PLAN_CORRECCIONES_CAP1.md` y hacer commit con el ID:
   `fix(cap1): C1-01 unificar convención de planos anatómicos`
6. Reportar al usuario: qué cambió, en qué archivos, y qué debe mirar él en pantalla.

### Nivel de confianza de cada ticket

| Etiqueta | Significa |
| :--- | :--- |
| **VERIFICADO** | Las cadenas literales de este ticket se leyeron en el archivo. Aplicar tal cual. |
| **DIAGNOSTICADO** | El síntoma está confirmado en capturas, pero la ubicación exacta hay que localizarla. El ticket trae los comandos de búsqueda. **Confirma antes de editar.** |

### Comandos base

```bash
cd webapp
npm run lint          # oxlint
npm run build         # tsc -b + vite build
npm run dev           # servidor de desarrollo, :5173
```

**Ojo con el type-check:** `tsconfig.app.json` excluye los capítulos 4 y 6–13. `npm run build` sí
valida cap1, así que un error de tipos en estos tickets rompe el build. Eso es lo que queremos.

### Reglas globales del capítulo

Valen para todos los tickets. Si un ticket te obliga a violar una de estas, detente y pregunta.

- **Decimales:** coma (es-ES) en todo lo visible, incluido el texto pintado en canvas y en Three.js.
- **Colores:** solo tokens de `:root` en `src/index.css`. Ningún literal hex nuevo en cap1. Si hace
  falta una gama, se añade primero como token.
- **Tipografía:** `--mono` solo para cifras, unidades y código. Prosa en `--sans`, títulos en `--serif`.
- **Matemáticas:** todo por KaTeX. Cero notación de teclado (`^`, `_`, `{}`) visible al lector.
- **Iconografía:** sin emoji.
- **No toques** `sims.ts` más de lo que pida el ticket: son 4.535 líneas con `@ts-nocheck` y es fácil
  romper algo sin que el compilador avise.

---

## 1 · Orden de ejecución

| Fase | Tickets | Contenido |
| :--- | :--- | :--- |
| 1 | `C1-01` … `C1-06` | Contenido y datos — lo único que no se puede publicar tal cual. |
| 2 | `V2-01` … `V2-05` | Encuadre de visualizaciones. |
| 3 | `E3-01` … `E3-06` | Estructura de la diapositiva. |
| 4 | `S4-01` … `S4-06` | Sistema visual. |

Dependencias duras: `V2-02` y `E3-03` después de `V2-01`. `E3-04` después de `C1-02` y `C1-04`.
`S4-05` después de `S4-01`. La parte de C2 de `S4-06` después de `V2-03`.

---

# FASE 1 · Contenido y datos

## `C1-01` · Unificar la convención de planos anatómicos — **VERIFICADO**

### Contexto imprescindible

La convención del libro (Cap. 1 §1.1, `Capitulos/Capitulo_1/Capitulo_1.tex`, línea 65) es:

> «Una sección transversal u horizontal separa el cuerpo en porciones superior e inferior. Dichos
> planos tienen una **z constante**. Las secciones sagitales separan el cuerpo en porciones derecha
> e izquierda, y son planos con una **y constante**. La sección sagital media o midsagital […] es un
> plano con **y = 0**. La sección frontal o coronal separa el cuerpo en porciones anterior y
> posterior, según lo descrito por planos con una **x constante**.»

Consistente con los ejes que ya define A1: `x` = anterior/posterior, `y` = derecha/izquierda,
`z` = superior/inferior.

### ⚠ La geometría 3D ya es correcta — NO la toques

Verificado en `src/chapters/cap1/PlanesCanvas.tsx`. El mapeo escena→anatomía que declara
`AxisDirectionArrows` (líneas ~240) es: anat `x` → three `z`, anat `y` → three `x`, anat `z` → three `y`.
Con ese mapeo, el array `PLANES` (líneas 64–104) está bien:

| Plano | `rot` | Normal resultante | Plano anatómico | Campo `eq` | ¿Correcto? |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `plane-sagittal` | `[0, π/2, 0]` | three x = anat y | `y = cte` | `'y = 0 (midsagital)'` | Sí |
| `plane-coronal` | `[0, 0, 0]` | three z = anat x | `x = cte` | `'x = 0 (frontal)'` | Sí |
| `plane-transverse` | `[-π/2, 0, 0]` | three y = anat z | `z = cte` | `'z = 0 (horizontal)'` | Sí |

Los `travelAxis` también son correctos (cada plano se desplaza a lo largo de su propia normal).

**El error es exclusivamente textual, en `Slide2.tsx`.** Hoy las píldoras de la columna izquierda
dicen lo contrario que las etiquetas flotantes del propio visor 3D. Al corregir el texto, ambos
coinciden.

### Archivos

- `src/chapters/cap1/Slide2.tsx` — **único archivo a modificar.**

### Pasos — 4 sustituciones literales

**1.** En `PLANE_DESCRIPTIONS`, línea 10:

```
-  'plane-sagittal': '<b>Plano sagital (x = cte):</b> Divide el cuerpo en mitades derecha e izquierda. Plano principal para flexión y extensión. El plano midsagital (x = 0) pasa por el centro.',
+  'plane-sagittal': '<b>Plano sagital (y = cte):</b> Divide el cuerpo en mitades derecha e izquierda. Plano principal para flexión y extensión. El plano midsagital (y = 0) pasa por el centro.',
```

**2.** En `PLANE_DESCRIPTIONS`, línea 11 — solo cambia la ecuación del paréntesis:

```
-  'plane-coronal': '<b>Plano coronal o frontal (y = cte):</b>
+  'plane-coronal': '<b>Plano coronal o frontal (x = cte):</b>
```

**3.** Píldora sagital, línea ~85. El `<span className="tag">` que sigue al rótulo «Sagital», y el
tag del midsagital dos líneas más abajo:

```
             <span style={{ fontWeight: 700, fontSize: '.7rem', color: 'var(--sagittal)' }}>Sagital</span>
-            <span className="tag">x = cte</span>
+            <span className="tag">y = cte</span>
             <span style={{ fontSize: '.62rem', color: 'var(--ink-3)' }}>derecha / izquierda</span>
-            <span className="tag" style={{ fontSize: '.52rem' }}>midsagital: x = 0</span>
+            <span className="tag" style={{ fontSize: '.52rem' }}>midsagital: y = 0</span>
```

**4.** Píldora coronal, línea ~97:

```
             <span style={{ fontWeight: 700, fontSize: '.7rem', color: 'var(--coronal)' }}>Coronal</span>
-            <span className="tag">y = cte</span>
+            <span className="tag">x = cte</span>
```

El tag del transverso (`z = cte`) **no se toca**: ya es correcto.

### Criterio de aceptación

- En `Slide2.tsx`: exactamente 2 apariciones de `y = cte` (píldora + descripción del sagital),
  2 de `x = cte` (píldora + descripción del coronal), 1 de `z = cte`, y `midsagital: y = 0`.
- En A2, cada píldora coincide con la etiqueta flotante del visor 3D al seleccionar su plano:
  sagital → `y = 0 (midsagital)`, coronal → `x = 0 (frontal)`, transverso → `z = 0 (horizontal)`.
- Ninguna contradicción entre A1 y A2 para un lector que compare las dos diapositivas.

### Verificación

```bash
cd webapp
grep -n "cte\|midsagital" src/chapters/cap1/Slide2.tsx     # 5 líneas, según el criterio
npm run lint && npm run build
```

Capturas: A2 en reposo, y A2 con cada uno de los tres planos aislado (3 capturas) mostrando píldora
y etiqueta 3D de acuerdo. Guardar en `scratch/fix-C1-01/`.

### No incluido en este ticket

Dos cosas que se encontraron al diagnosticar y que **no** se tocan aquí:

- `BodyScene.tsx:392-396` tiene otro array `PLANES` con ids (`plane-sagital`, `plane-frontal`,
  `plane-transversal`) que **nunca coinciden** con los de A2 (`plane-sagittal`, `plane-coronal`,
  `plane-transverse`), y su `Planes` solo se monta con `mode === 'planes'`, que ningún slide usa
  (Slide10 usa `mode="regions"`). Es código muerto. Geométricamente también es correcto. Candidato
  a limpieza en un ticket aparte.
- Los colores de `PlanesCanvas` (`#6d5fbf`, `#0d6e64`, `#c0681e`) no son los tokens
  `--sagittal` / `--coronal` / `--transverse` (`#5d4fa8`, `#2d7d4f`, `#b86a1e`). Eso es `S4-02`.

---

## `C1-02` · Una sola fuente de verdad para el Hombre Estándar — **DIAGNOSTICADO**

### Síntoma verificado en capturas

El mismo cuerpo de referencia muestra cifras distintas según la vista:

| Magnitud | Tabla 1.5 (C1, izquierda) | Panel de vitales / chip (C1, derecha) | D3 | Resumen |
| :--- | :--- | :--- | :--- | :--- |
| Área de superficie | `1,85 m²` (Du Bois) | `1,82 m²` | `1.82 m²` | `1,85 m²` |
| Peso | `690 N` | `687 N` | — | — |
| Grasa | `15 %` | — | `20,2 %` | `15 %` |
| TMB | `70 kcal/h` | `70 kcal` (sin unidad de tiempo) | — | `70 kcal/h` |

### Localizar

```bash
cd webapp/src/chapters/cap1
grep -rn "1,85\|1\.85\|1,82\|1\.82" .
grep -rn "687\|690" .
grep -rn "15 %\|20,2\|20\.2" .
```

Archivos esperados: `Slide8.tsx` (C1), `StandardHumanCanvas.tsx`, `Slide14.tsx` (D3),
`BMICalculatorCanvas.tsx`, `Slide16.tsx` (Resumen), y constantes en `sims.ts`.

### Pasos

1. Crear `src/chapters/cap1/standardMan.ts` exportando un único objeto con las constantes del hombre
   estándar: altura, masa, peso en N, área de superficie, TMB (por hora y por día), grasa,
   composición, sangre, capacidad pulmonar, frecuencia cardíaca y respiratoria. Un comentario por
   campo indicando de qué tabla del libro sale.
2. **Decidir y documentar en ese archivo** si el área que se muestra es el valor tabulado del libro
   (`1,85 m²`) o el resultado de evaluar Du Bois con 70 kg / 1,72 m. Es una decisión, no un bug: lo
   que no vale es que cada vista use uno distinto. Mismo criterio para el peso (`690` vs `687` N es
   `g = 9,81` frente a `g ≈ 9,86`).
3. Reemplazar los literales de las cinco vistas por lecturas de ese módulo.
4. La composición de grasa de D3 se calcula con la ecuación `%grasa = 1,28·IMC − 10,1`, que para
   IMC 23,7 da ~20,2 %. El `15 %` de C1 es el valor del hombre estándar tabulado. **No son la misma
   magnitud**: la de C1 es una constante del cuerpo de referencia, la de D3 es una estimación
   derivada del IMC. Diferenciarlas en el rótulo (p. ej. «grasa estimada (IMC)» en D3) en vez de
   igualar los números.

### Criterio de aceptación

- Ninguna pareja de vistas del capítulo muestra dos valores distintos para la misma magnitud.
- Los greps de arriba dan un único origen por constante (el módulo nuevo), no literales repartidos.
- Donde dos cifras sí son legítimamente distintas (grasa tabulada vs estimada), el rótulo lo explica.

### Verificación

```bash
npm run lint && npm run build
```

Capturas de C1 (tabla + panel de vitales en el mismo encuadre), D3 y Resumen en `scratch/fix-C1-02/`.

---

## `C1-03` · Añadir la unidad de tiempo a la TMB — **DIAGNOSTICADO**

### Síntoma

El panel «CONSTANTES VITALES» de C1 rotula `TMB  70 kcal`. Una tasa sin unidad de tiempo no es una
tasa. La tabla, a 30 cm a la izquierda, pone `70 kcal/h (1680 kcal/día)`.

### Localizar

```bash
grep -rn "TMB" webapp/src/chapters/cap1/
```

Esperado: `StandardHumanCanvas.tsx`, en el bloque que pinta las filas del panel de vitales.

### Pasos

1. Rotular `70 kcal/h`.
2. Revisar **todas** las filas del panel en el mismo bloque y confirmar que cada magnitud lleva su
   unidad completa (`Masa kg`, `Peso N`, `Área m²`, `Sangre L`, `Pulmón L`, `Fluidos L`, `IMC` es
   adimensional). Corregir las que falten.

### Criterio de aceptación

Toda fila del panel de vitales lleva unidad, y ninguna unidad contradice la tabla 1.5.

### Verificación

Captura recortada del panel de vitales de C1 en `scratch/fix-C1-03/`.

---

## `C1-04` · Renderizar el LaTeX pendiente del Resumen — **DIAGNOSTICADO**

### Síntoma

En la diapositiva 17 (Resumen) se lee LaTeX crudo dentro de las tarjetas:

- «huesos w ∝ `L^{3/2}`»
- «Alometría f = `a·m^α`»
- «la Ley de Stevens P = `K(S−S₀)^n`»

Es la única diapositiva donde las matemáticas no se renderizan.

### Archivos

- `src/chapters/cap1/Slide16.tsx` — las expresiones están como texto plano, sin delimitadores.
- `src/chapters/cap1/Capitulo1.tsx` — `renderKatex()` (línea ~100) si el problema resulta ser de
  alcance o de la normalización de texto.

### Pasos

1. Envolver cada expresión en delimitadores KaTeX inline (`$…$`).
2. **Cuidado con `renderKatex()`**: antes del auto-render recorre los nodos de texto y hace
   `split(slash + slash).join(slash)` entre otras normalizaciones, pensadas para arreglar `\approx`.
   Comprobar que no se come las llaves ni las barras de estas expresiones nuevas. Si interfiere,
   la solución correcta es escribir la expresión de forma que no dependa de esa normalización, no
   añadir casos especiales al normalizador.
3. Revisar el resto del Resumen: `(x, y, z, r, ρ)`, `1–3 GL`, `L/H` — decidir cuáles merecen KaTeX
   y cuáles son prosa. No convertir todo por convertir.

### Criterio de aceptación

No queda ninguna `^`, `_`, `{`, `}` ni `\` visible al lector en toda la diapositiva de Resumen, ni en
desktop ni en móvil.

### Verificación

```bash
npm run dev   # navegar a la diapositiva 17
```

Capturas de Resumen desktop y móvil en `scratch/fix-C1-04/`.

---

## `C1-05` · Corregir la coma doble de los grados de libertad — **DIAGNOSTICADO**

### Síntoma

En B1 (diapositiva 5), bajo «3 rotacionales», KaTeX imprime `θx,,θy,,θz` con comas dobles.
La línea hermana bajo «3 traslacionales» sí se ve bien: `x, y, z`.

### Localizar

```bash
grep -n "theta\|underbrace" webapp/src/chapters/cap1/Slide4.tsx
```

### Pasos

1. Localizar la cadena de la ecuación `6\,\mathrm{GL} = …` con sus dos `\underbrace`.
2. Eliminar el separador duplicado. Sospecha principal: una coma literal seguida de `\,` (espacio
   fino de LaTeX) que el normalizador de `renderKatex()` convierte en una segunda coma visible.
   Confirmar en el DOM renderizado antes de decidir el arreglo.
3. Dejar los dos `\underbrace` con el mismo estilo de separador.

### Criterio de aceptación

Se lee `θx, θy, θz` con un solo separador por término, y la línea de traslaciones sigue igual.

### Verificación

Recorte de la ecuación de B1 en `scratch/fix-C1-05/`.

---

## `C1-06` · Unificar el separador decimal (coma) — **DIAGNOSTICADO**

### Síntoma

La prosa y las tablas HTML usan coma; el texto pintado en canvas y en Three.js usa punto. Conviven
en la misma fila: en la tabla de D4, `n = 0,33` junto a `×1.26`.

Casos confirmados en capturas: `99.22 W` y `f = 4.1` (D1), `×1.26 / ×1.45 / ×11.31` y `2⁰·⁵⁴ = 1.45×`
(D4), `IMC 23.7`, `1.82 m²`, `ρ = 1.066 kg/L`, `Magra 55.9 kg`, `Grasa 14.1 kg`, `Magra 79.8 %`,
`Grasa 20.2 %` (D3).

### Localizar

```bash
cd webapp/src/chapters/cap1
grep -rn "toFixed(" .                    # todos los puntos de formateo
grep -rn "replace('\.', ',')" .          # los que ya parchean a mano
```

### Pasos

1. Crear un formateador único (p. ej. `src/chapters/cap1/format.ts` con `fmt(n, decimales)`) que
   devuelva la cifra con coma decimal. Añadir también un `fmtMil` si hace falta separador de miles
   (la tabla 1.11 ya usa espacio fino: `30 000 g` — mantener ese estilo).
2. Hacer que **toda** ocurrencia de `toFixed()` en `cap1/**` pase por el formateador, incluidos los
   `fillText` de `sims.ts` y las etiquetas `Html` de los componentes 3D.
3. Los sitios que ya hacen `.replace('.', ',')` a mano deben pasar por el mismo formateador, no
   quedarse como excepción.
4. **No tocar** los números en código (coordenadas, factores, `0.75` como valor de α en una
   expresión JS). Solo el texto que ve el lector.

### Criterio de aceptación

- Ninguna cifra visible del capítulo usa punto decimal, en ninguna de las 17 diapositivas.
- `grep -rn "toFixed(" webapp/src/chapters/cap1/` no devuelve ninguna llamada cuyo resultado vaya
  directo a un `fillText`, `textContent`, `innerHTML` o JSX sin pasar por el formateador.

### Verificación

Barrido de las 17 diapositivas. Prestar atención a D1, D3, D4 y C1, que son las que más cifras
pintan. Guardar en `scratch/fix-C1-06/`.

---

# FASE 2 · Encuadre de las visualizaciones

## `V2-01` · Encuadrar la cámara en el objetivo, no en el miembro — **DIAGNOSTICADO**

### Síntoma verificado en capturas

- **B3** (diapositiva 7): el brazo ocupa ~12 % del lienzo, arrinconado arriba a la derecha, mientras
  una lámina translúcida (el plano sagital de referencia) llena el resto y se corta por los cuatro
  lados.
- **B2** (diapositiva 6): el tema es la *articulación*, pero se ve un húmero entero cortado por
  arriba y la cápsula del codo queda en ~20 px.
- **B1** (diapositiva 5): la pierna flota descentrada, con la pelvis recortada por el borde superior.

### Archivos

- `src/chapters/cap1/three/FitCamera.tsx` — el encuadre.
- `src/chapters/cap1/three/AnatomyStage.tsx` — el escenario y sus props de cámara.
- `src/chapters/cap1/three/useAnatomyNodes.ts` — de aquí sale el nodo objetivo.
- `src/chapters/cap1/KinematicsCanvas.tsx`, `MobilityCanvas.tsx`, `AntagonistCanvas.tsx`.

### Pasos

1. Leer `FitCamera.tsx` y determinar sobre qué caja calcula hoy el encuadre (sospecha: la escena
   completa, o un `position`/`fov` fijo pasado por cada slide — en `PlanesCanvas` es literal:
   `camera={{ position: [3.6, 1.8, 12.5], fov: 45 }}`).
2. Hacer que el encuadre se calcule sobre el **`Box3` del nodo seleccionado** (articulación o hueso
   activo), con un margen relativo constante — un solo parámetro compartido por las cuatro escenas.
3. En B3, limitar el tamaño de la lámina de referencia a la caja del objetivo en lugar de dejarla en
   escala de escena.
4. Reencuadrar al cambiar de selección, con transición suave. Reutilizar `useHarmonicClock` o el
   `__damp()` existente si ya hay amortiguación disponible; no añadir otro sistema.
5. El botón «Restablecer» debe volver al encuadre del objetivo actual, no a un encuadre global.

### Criterio de aceptación

En B1, B2, B3 y C3: el objeto de interés ocupa **≥ 55 %** de la altura útil del lienzo, está
centrado, y no toca ningún borde. Se cumple en el estado por defecto y después de cada selección.

### Verificación

Capturas de las cuatro escenas + una por cada uno de los 6 tipos sinoviales de B2 (cada selección
reencuadra). Guardar en `scratch/fix-V2-01/`.

---

## `V2-02` · Hacer legible el rango de movilidad de C3 — **DIAGNOSTICADO** · depende de `V2-01`

### Síntoma

El arco de ROM del hombro es un hilo de ~30 px sobre un esqueleto estático. La tabla anuncia 188° de
flexión y la figura no lo comunica; al elegir otra fila el cambio es casi imperceptible.

### Archivos

`MobilityCanvas.tsx`, `romTable.ts`, `three/Callouts.tsx`, `Slide10.tsx`.

### Pasos

1. Encuadrar la articulación seleccionada (ya resuelto por `V2-01`).
2. Engrosar el arco y pintar el valor en grados sobre el propio arco.
2. Mostrar las dos posiciones extremas del movimiento (fantasma de inicio y fin), no solo el arco.
4. Verificar que los valores dibujados salen de `romTable.ts` y coinciden con la tabla 1.10 de la
   columna izquierda — si hay discrepancia, es un `C1-02` encubierto: reportar, no ajustar a ojo.

### Criterio de aceptación

Al pulsar una fila de la tabla 1.10, la figura reencuadra la articulación y el arco con su valor en
grados se lee sin acercarse a la pantalla.

### Verificación

Capturas de tres filas distintas (hombro flexión, codo, tobillo) en `scratch/fix-V2-02/`.

---

## `V2-03` · Eliminar las colisiones de rótulos — **DIAGNOSTICADO**

### Síntoma

- En A1, A2, A3 y C3, los rótulos `−x`, `Posterior / Dorsal` y `Anterior / Ventral` se amontonan en
  el mismo punto sobre la pelvis; `← Derecha` cae encima de la mano.
- En C2, el callout `44,5 cm · 0,259·H` se pinta sobre el torso y las cotas verticales se solapan.

### Archivos

- `src/chapters/cap1/three/Callouts.tsx` — ya tiene un store con `projected` y un flag `hidden`
  (líneas ~46–210): el mecanismo de proyección existe, falta la resolución de colisiones.
- `src/chapters/cap1/PlanesCanvas.tsx` — `AxisDoubleArrow` coloca los rótulos a
  `length / 2 − 0.16` sobre el eje, sin comprobar solapes.
- `src/chapters/cap1/ProportionsCanvas.tsx` — las cotas de C2.

### Pasos

1. En `Callouts.tsx`, añadir resolución de colisiones sobre las cajas ya proyectadas: recorrer los
   rótulos en orden de prioridad y desplazar (o marcar `hidden`) el que solape con uno ya colocado.
2. Separar rótulo y ancla con línea guía corta cuando haya desplazamiento, para no perder la relación.
3. En C2, alternar el lado de las cotas y escalonarlas en vertical; ninguna cota sobre el cuerpo.
4. Dar prioridad explícita: los rótulos de eje (`+z`, `−z`, `+y`…) por encima de los descriptivos
   (`Posterior / Dorsal`) cuando haya que descartar uno.

### Criterio de aceptación

Con la cámara en su posición por defecto, ningún rótulo se solapa con otro ni cae sobre el cuerpo del
modelo, en A1, A2, A3, C2 y C3.

### Verificación

Capturas de las cinco diapositivas, más una de A1 con la cámara rotada 45°, en `scratch/fix-V2-03/`.

---

## `V2-04` · Terminar las dos gráficas — **DIAGNOSTICADO**

### Síntoma

**D4 (Stevens)** — sin marcas ni números en **ningún** eje; sin títulos de eje; `Lineal (n = 1,0)`
choca con el subtítulo del encabezado; cinco curvas de colores sin leyenda; la tarjeta flotante
«Sonoridad (1 kHz)» con su rectángulo negro recorta el lado derecho del plot.

**D1 (alometría)** — `99.2 W` se imprime encima del rótulo `Humano`; el título del eje x
(`Masa Corporal m_b (kg, escala logarítmica…)`) queda tapado por el panel de controles; el punto de
la ballena azul toca el borde superior derecho; la cajita «Baja escala / Alta escala» flota sin ancla.

Ambas mezclan rótulos en mono, sans y cursiva dentro del mismo lienzo.

### Archivos

`StevensCanvas.tsx`, `AllometryCanvas.tsx`, y sus funciones `drawStevens` / `drawAllometry` en `sims.ts`.

### Pasos — para cada gráfica

1. Ejes con marcas y números. En escalas log, marcas en las décadas (`0,1 · 1 · 10 · 100 · 1e3 · 1e4`)
   — D1 ya las tiene en el eje y; D4 no tiene ninguna.
2. Título de eje con unidad, **dentro** del área reservada del lienzo, nunca bajo el panel de
   controles (coordinar con `V2-05`).
3. Leyenda de las series, con el mismo orden que la tabla de la izquierda.
4. Margen interior que garantice que ningún punto ni rótulo toque el borde.
5. Una sola regla tipográfica: mono para cifras de eje, sans para rótulos. Sin cursiva en el lienzo.
6. La tarjeta «Sonoridad» de D4 pasa a un hueco reservado del layout, no sobre los datos.
7. Colores de la paleta (coordinar con `S4-02`: si `S4-02` ya se hizo, usar la escala declarada).

### Criterio de aceptación

Las dos gráficas se leen **sin** el texto de apoyo de la izquierda: ejes rotulados con unidades,
series identificables por leyenda, y ningún elemento recortado o solapado.

### Verificación

Capturas de D1, D2, D4, y de D4 con «Ver todas» activo, en `scratch/fix-V2-04/`.

---

## `V2-05` · Que el panel de controles reserve espacio en vez de tapar — **DIAGNOSTICADO**

### Síntoma

El HUD inferior (`.prof-controls`) flota sobre el lienzo y parte por la mitad lo que hay debajo:

- C1: «Kleiber: TMB ∝ m⁰·⁷⁵» cortado a media altura.
- C2: «Pasa el cursor: resalta cuerpo y barra» cortado.
- D1: el título del eje x, tapado.

Además el botón `×` de cerrar queda descolgado en el extremo derecho, lejos de los controles que
gobierna.

### Archivos

- `src/chapters/cap1/HudPanel.tsx`
- `src/chapters/cap1/legacy.css` — `.prof-controls`, `.prof-controls-toggle`, `.is-collapsed`.
- `src/chapters/cap1/Capitulo1.tsx` — el `useEffect` (líneas ~160–215) que **inyecta el botón de
  toggle por DOM** y persiste el estado en `localStorage` con clave
  `cap1.prof-controls.collapsed.v3.${activeSlide}`.

### Pasos

1. El lienzo reserva el alto del panel cuando está abierto (padding inferior o una fila de grid),
   de modo que nada quede debajo. Alternativa aceptable: el pie de figura se coloca por encima del
   panel. Elegir una y aplicarla igual en todas las diapositivas.
2. Al colapsar el panel, el lienzo recupera ese espacio.
3. Recolocar el `×` junto al grupo de controles, no en el extremo opuesto.
4. **No cambies la clave de `localStorage`** sin querer: si cambia, los usuarios que ya colapsaron
   un panel vuelven al estado por defecto. Si el cambio es inevitable, súbele la versión (`v4`)
   deliberadamente y dilo en el commit.

### Criterio de aceptación

Con el panel abierto no hay ningún texto, pie de figura ni título de eje parcialmente oculto en
ninguna de las 17 diapositivas. Con el panel cerrado, el lienzo aprovecha el espacio liberado.

### Verificación

Barrido de las 17 diapositivas con panel abierto **y** con panel cerrado, en `scratch/fix-V2-05/`.

---

# FASE 3 · Estructura de la diapositiva

## `E3-01` · Resolver el desbordamiento de la columna izquierda — **DIAGNOSTICADO**

### Síntoma

En B1, C1, C2, C3, D1, D2, D3 y D4 hay una tarjeta cortada a media altura en el borde inferior de la
ventana: la tabla de masas de órganos (C3), el apunte de cátedra (B1, D3), la fig. 1.15 (C2), la
fila «Masa Muscular Esquelética» (D1). No hay sombra de scroll, indicador, ni señal de «continúa».

### Archivos

`legacy.css` (rejilla `.content-grid`, `.theory`, alto de `.slide`), y los slides afectados si hay
que repartir contenido.

### Pasos

1. Elegir **un** camino y aplicarlo igual en las ocho diapositivas:
   - **(a)** Paginar el contenido dentro del módulo para que cada diapositiva quepa. Más trabajo,
     mejor resultado: es una presentación, no una página de scroll.
   - **(b)** Marcar el desbordamiento con sombra de scroll en el borde inferior y un indicador de
     continuación.
2. Consultar al usuario qué camino prefiere **antes** de implementar: (a) cambia el reparto de
   contenido y eso es una decisión editorial, no técnica.
3. Tener en cuenta que `Capitulo1.tsx` fuerza el tamaño de raíz a
   `calc(clamp(16px, 1.32vw, 21px) + 3px)` mientras el capítulo está montado (líneas ~140–150):
   cualquier cálculo de alto depende de eso.

### Criterio de aceptación

Ninguna diapositiva corta una tarjeta sin señal visible de que hay más contenido, a 1440×900
**y** a 1280×720.

### Verificación

Barrido de las 17 diapositivas a las dos resoluciones, en `scratch/fix-E3-01/`.

---

## `E3-02` · Señal de «esto se pulsa» en las tablas interactivas — **DIAGNOSTICADO**

### Síntoma

Las filas de B2 (6 tipos sinoviales), C3 (ROM), D1 (parámetros alométricos) y D4 (exponentes
sensoriales) controlan la visualización, pero se leen como tablas de consulta: solo una fila
resaltada y ninguna señal permanente de interactividad.

### Archivos

- `legacy.css` — `.interactive-table` (línea ~501 ya estila `tr[aria-selected="true"]` con
  `inset 3px 0 0 var(--teal)`; el patrón existe, no se aplica en todas).
- Los handlers viven en el `useEffect` gigante de `Capitulo1.tsx` (líneas ~420–490): selectores
  `[data-joint]`, `[data-mobility]`, `[data-prop]`, `[data-allometry]`, `[data-stevens]`,
  `[data-somatotype]`, `[data-bone]`.

### Pasos

1. Adoptar en las cuatro tablas la convención que **ya funciona** en los chips de A1/A3: cursor de
   puntero, hover claro, y marca persistente en la fila activa — la barra lateral teal de
   `.interactive-table tr[aria-selected="true"]` es el patrón a extender.
2. Añadir una pista de una línea bajo cada tabla, con el mismo tono que las existentes («Pasa el
   cursor o haz clic…»).
3. Verificar que las filas son alcanzables por teclado y tienen `aria-selected` correcto — parte ya
   está puesto (`aria-pressed` en `[data-allometry]`, `aria-selected` en `[data-stevens]`);
   completar lo que falte.

### Criterio de aceptación

Sin pasar el ratón se distingue a simple vista que las filas son pulsables y cuál está activa, en las
cuatro diapositivas.

### Verificación

Capturas de B2, C3, D1 y D4 en reposo y con una fila seleccionada, en `scratch/fix-E3-02/`.

---

## `E3-03` · Reequilibrar tabla / lienzo en móvil — **DIAGNOSTICADO** · depende de `V2-01`

### Síntoma

En B2 a 820×1180, la tabla de los 6 tipos sinoviales se recorta a ~90 px mostrando una fila y media
—y el corte cae **dentro** de la segunda fila—, mientras el lienzo 3D se queda con ~560 px para un
modelo que ocupa el 15 % de ese espacio.

### Archivos

`legacy.css` (media queries del capítulo), `three/AnatomyStage.tsx` (alto del lienzo).

### Pasos

1. En móvil, la tabla se muestra completa: es el contenido.
2. El lienzo baja a un alto razonable, con la cámara encuadrada al detalle (resuelto por `V2-01`).
3. Ningún contenedor puede recortar una fila por la mitad: si hay que limitar el alto, que el corte
   caiga entre filas y con indicador (coordinar con `E3-01`).

### Criterio de aceptación

A 820×1180, ninguna tabla queda cortada dentro de una fila y ningún lienzo tiene más del 40 % de
superficie vacía.

### Verificación

Barrido móvil de las 17 diapositivas en `scratch/fix-E3-03/`.

---

## `E3-04` · Reconstruir la diapositiva de Resumen — **DIAGNOSTICADO** · depende de `C1-02`, `C1-04`

### Síntoma

Cuatro tarjetas de ~310 px de alto con dos líneas de texto cada una: ~80 % de aire. Y como
recapitulación no sirve — repite titulares en vez de devolver las cifras y ecuaciones que el lector
querría fijar.

### Archivos

`Slide16.tsx`, `legacy.css`.

### Pasos

1. Decidir con el usuario: **(a)** las tarjetas se ajustan a su contenido, o **(b)** el contenido
   crece hasta merecer el tamaño (cifra clave del pilar + ecuación renderizada + enlace a la
   diapositiva de origen). Es una decisión editorial.
2. Si se elige (b), los enlaces usan el `go(n)` que ya expone el capítulo por props.
3. Las cifras salen del módulo de `C1-02`; las ecuaciones, ya renderizadas por `C1-04`.
4. Quitar el `✅` del pie (adelanta parte de `S4-01`; aquí es inevitable porque se reescribe el pie).

### Criterio de aceptación

Ninguna tarjeta con más de un 35 % de espacio vacío, y desde el resumen se puede saltar a cada módulo.

### Verificación

Capturas de Resumen desktop y móvil en `scratch/fix-E3-04/`.

---

## `E3-05` · Corregir el recorte de las pestañas de módulo — **DIAGNOSTICADO**

### Síntoma

En **las 17 capturas**, la barra de módulos aparece recortada por el borde superior de la ventana: se
ve el borde inferior de las pestañas pero no el superior.

### Archivos

- `legacy.css` — `.module-bar`, `.module-tab`, `.module-tab.active`, `.mod-badge`.
- `Capitulo1.tsx` — el `useLayoutEffect` (líneas ~140–150) que fuerza
  `root.style.fontSize = 'calc(clamp(16px, 1.32vw, 21px) + 3px)'` mientras el capítulo está montado.
  Sospechoso principal: los altos se calcularon con el tamaño de raíz sin ese `+ 3px`.

### Pasos

1. Dar el espacio superior necesario para que las pestañas se vean completas, incluido el estado
   activo elevado (la pestaña activa sobresale).
2. Comprobar a 1280×720, donde el `clamp` da otro tamaño de raíz.

### Criterio de aceptación

Las cinco pestañas se ven enteras, con su borde superior, en las 17 diapositivas, a 1440×900 y a
1280×720.

### Verificación

Recorte de la barra superior en tres diapositivas de módulos distintos, en `scratch/fix-E3-05/`.

---

## `E3-06` · Replantear el riel de navegación lateral — **DIAGNOSTICADO**

### Síntoma

17 puntos diminutos en el lateral izquierdo, sin etiqueta, con las flechas `←` y `→` a alturas
distintas y aparentemente huérfanas. El punto activo apenas se distingue. No dice dónde estás.

### Archivos

`legacy.css` — `.nav-bar`, `.nav-dots`, `.nav-dot`, `.nav-btn`, `.slide-counter`,
`.nav-module-label`; y el marcado de la navegación en `Capitulo1.tsx` (líneas ~540–560).

### Pasos

1. Agrupar los puntos por módulo (A, B, C, D + resumen), con separación entre grupos: la barra
   superior ya rotula los módulos, el riel debe reflejar la misma estructura. `MODULES` en `sims.ts`
   ya tiene el mapa `slides` por módulo — usarlo, no duplicar el reparto.
2. Reforzar el contraste del estado activo.
3. Colocar las flechas como un par contiguo, no una arriba y otra abajo.
4. En móvil el mismo componente se pinta abajo en horizontal: comprobar las dos disposiciones.

### Criterio de aceptación

Se identifica de un vistazo el módulo y la posición dentro de él; el punto activo se distingue sin
comparar con los demás.

### Verificación

Recortes del riel en las diapositivas 1, 6, 11 y 17, desktop y móvil, en `scratch/fix-E3-06/`.

---

# FASE 4 · Sistema visual

## `S4-01` · Retirar los emoji — **DIAGNOSTICADO**

### Síntoma

`🐭 🐕 🐘 🐋` en la gráfica de Kleiber (D1), `🔊` sobre un rectángulo negro en Stevens (D4), `✅` en
el pie del Resumen, `🏥` en el recuadro clínico de A2, `✍️` y `💡` en los apuntes de cátedra, y los
iconos de las pestañas de módulo (campo `ico` de `MODULES`). Rompen el registro editorial, se pintan
con la tipografía del sistema operativo de cada usuario, y en la gráfica compiten con los puntos de
datos.

### Localizar

```bash
cd webapp/src/chapters/cap1
grep -rnP "[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}\x{2B00}-\x{2BFF}\x{FE0F}]" .
```

Esperado: `sims.ts` (rótulos de D1 y D4), `Slide2.tsx`, `Slide16.tsx`, los slides con apuntes, y
`MODULES` en `sims.ts`.

### Pasos

1. Quitarlos. En D1 los rótulos «Ratón / Caballo / Elefante / Ballena Azul» ya nombran la especie:
   el emoji no aporta.
2. Donde el emoji hacía de icono de sección (apuntes, recuadro clínico, pestañas), decidir **una**
   de dos: vocabulario único de glifos coherente con el registro, o nada. Consultar al usuario.
3. `▶ ⏸ ← → × ▦ ◉` **no son emoji** — son símbolos Unicode monocromos y forman parte del lenguaje de
   controles. Se quedan.

### Criterio de aceptación

El grep de arriba no devuelve resultados en `cap1/**`, incluidas las pestañas y el texto pintado en
canvas.

### Verificación

Barrido de las 17 diapositivas en `scratch/fix-S4-01/`.

---

## `S4-02` · Devolver los lienzos a la paleta de `:root` — **DIAGNOSTICADO**

### Síntoma

El sistema de `src/index.css` define `--teal #0d6e64`, `--blood #a92a1e`, `--amber #9a5b00`,
`--sagittal #5d4fa8`, `--coronal #2d7d4f`, `--transverse #b86a1e`, `--bone #b6a67f`. Pero:

- `PlanesCanvas.tsx` usa `#6d5fbf`, `#0d6e64`, `#c0681e` para los tres planos — ninguno es el token
  correspondiente.
- `BodyScene.tsx:392-396` usa otra terna distinta (`#0f6f67`, `#9a5b00`, `#a92a1e`).
- `ProportionsCanvas.tsx` (C2) pinta las barras de segmentos con un degradado teal→violeta que no
  existe en `:root`.
- `StevensCanvas.tsx` (D4) dibuja cinco curvas en naranja, verde, lila, amarillo y rojo.
- El checkbox «Ver todas» de D4 usa el azul nativo del navegador, sin estilar.

### Localizar

```bash
grep -rn "#[0-9a-fA-F]\{6\}\|#[0-9a-fA-F]\{3\}\b" webapp/src/chapters/cap1/
```

### Pasos

1. Los tres planos leen `--sagittal`, `--coronal`, `--transverse`. Los materiales de Three.js no
   pueden leer variables CSS directamente: exportar los tokens como constantes JS desde un único
   módulo que documente su equivalencia con `:root`, y usarlas en materiales y canvas.
2. Para la serie categórica de 5 colores de D4, **declararla primero en `:root`** como escala con la
   misma luminosidad y croma, variando el tono (el archivo ya usa oklch-friendly hexes; mantener la
   coherencia con teal/sangre/ámbar).
3. Estilar el checkbox de D4 con el lenguaje del capítulo.
4. Las barras de C2 usan tokens, no un degradado inventado.

### Criterio de aceptación

Ningún literal hex nuevo en `cap1/**`; los planos usan sus tokens; la serie de D4 está declarada en
el sistema; el checkbox no muestra azul nativo.

### Verificación

Capturas de A2, C2 y D4 en `scratch/fix-S4-02/`, más el grep de literales.

---

## `S4-03` · Coser los tres lenguajes visuales del cuerpo — **DIAGNOSTICADO**

### Síntoma

Módulos A y B: esqueleto GLB casi fotorrealista. Módulo C y D3: maniquí vectorial plano de color
arena. Módulo D: diagramas esquemáticos. Tres lenguajes sin transición; el salto de A3 a C1 se lee
como cambiar de producto.

### Archivos

`three/StudioLights.tsx`, `three/materials.ts`, `three/AnatomyStage.tsx`, `StandardHumanCanvas.tsx`,
`BMICalculatorCanvas.tsx`, `ProportionsCanvas.tsx`, `sims.ts`.

### Pasos

**No rehacer las figuras.** Acercarlas con un tratamiento común:

1. Mismo fondo de lienzo en las tres familias.
2. Misma cuadrícula de referencia (los 3D ya tienen suelo con rejilla; los 2D usan otra o ninguna).
3. Misma familia de cotas, rótulos y líneas guía: un solo estilo de línea de cota, un solo estilo de
   caja de rótulo, un solo peso de línea.
4. Mismo tratamiento del hueso: `--bone` es el token; hoy `PlanesCanvas` usa `#e8dcc4` y
   `KinematicsCanvas` `#d8cfb8`. Unificar (se solapa con `S4-02`).

### Criterio de aceptación

Al pasar de A3 a C1 y de C1 a D1, el fondo, la cuadrícula y el estilo de cotas y rótulos son
reconociblemente los mismos.

### Verificación

Una contactsheet con las 17 visualizaciones en miniatura, para juzgar la cohesión de un vistazo.
Guardar en `scratch/fix-S4-03/contactsheet.png`.

---

## `S4-04` · Acotar el uso de la monoespaciada — **DIAGNOSTICADO**

### Síntoma

Mono funciona bien para valores en tabla, pero también rotula prosa (`Occipital: nuca`,
`tras la rodilla`, `Radiocubital proximal` en A3 y B2), encabezados
(`ÍNDICES DE MASA Y ESTATURA (W / H^P)` en D3) y resultados dentro de gráficas. Y en ese encabezado
queda un `H^P` en notación de teclado teniendo KaTeX disponible.

### Archivos

`Slide3.tsx` (A3), `Slide5.tsx` (B2), `Slide14.tsx` (D3), `legacy.css`, rótulos de gráficas en `sims.ts`.

### Pasos

1. Mono solo para cifras, unidades y código. La prosa de las tablas de términos pasa a `--sans`.
2. El encabezado de D3 usa KaTeX o se reescribe en palabras.
3. Revisar `legacy.css` por si la mono está aplicada a nivel de tabla entera en vez de por columna.

### Criterio de aceptación

No hay prosa ni encabezados en monoespaciada, y no queda notación de teclado visible.

### Verificación

Capturas de A3, B2 y D3 en `scratch/fix-S4-04/`.

---

## `S4-05` · Arreglar los dos iconos defectuosos de C3 — **DIAGNOSTICADO** · depende de `S4-01`

### Síntoma

En C3 (diapositiva 11): el encabezado «MASA DE LOS ÓRGANOS (TABLA 1.11)» muestra un **cuadrado vacío**
(glifo no disponible en la fuente), y el icono de «RANGO DE MOVILIDAD ARTICULAR (TABLA 1.10)» se lee
como un símbolo de prohibido/tachado — lo contrario de lo que titula.

### Archivos

`Slide10.tsx`, en los `card-hdr` de las dos tarjetas.

### Pasos

1. Sustituir ambos por glifos del mismo vocabulario que los que sí funcionan (el compás de A1, el
   hueso de B2), según lo que se decida en `S4-01`.
2. Comprobar que el glifo elegido existe en las fuentes cargadas (Source Serif 4, Karla,
   JetBrains Mono). Un glifo que solo renderiza en macOS no vale.

### Criterio de aceptación

Los dos encabezados muestran un glifo que renderiza en todas las plataformas y cuyo significado no
contradice el título.

### Verificación

Recorte de los dos encabezados de C3 en `scratch/fix-S4-05/`.

---

## `S4-06` · Quitar los datos repetidos — **DIAGNOSTICADO** · la parte de C2, después de `V2-03`

### Síntoma

- **A3:** las regiones aparecen como chips (`Thorax Pecho`, `Gluteal Nalga`…) y otra vez como tabla
  de términos regionales justo debajo, con el mismo contenido.
- **C2:** las mismas longitudes se muestran tres veces: en la tabla 1.6 (`L calculada`), en las cotas
  del maniquí, y en las barras `Σ segmentos`.

### Archivos

`Slide3.tsx` (A3), `Slide9.tsx` y `ProportionsCanvas.tsx` (C2).

### Pasos

1. **A3:** decidir con el usuario si se quedan los chips interactivos (que controlan el 3D) o la
   tabla de referencia. Es contenido, no estilo: preguntar antes.
2. **C2:** la tabla da los números y la figura da la proporción. Las barras `Σ` deben aportar algo
   que la tabla no diga —la suma, la fracción del total, el cierre a `H`— o desaparecer.

### Criterio de aceptación

Cada dato del capítulo aparece una vez; si aparece dos, la segunda responde a una pregunta distinta.

### Verificación

Capturas de A3 y C2 en `scratch/fix-S4-06/`.

---

## Hallazgos colaterales

Anota aquí lo que encuentres durante la ejecución y **no** corrijas en el ticket en curso.

- **Código muerto:** `BodyScene.tsx:392-396`, array `PLANES` con ids que nunca coinciden con los de
  A2, y `Planes` solo se monta con `mode === 'planes'`, que ningún slide usa. *(Detectado al
  diagnosticar `C1-01`.)*
- **Popliteus:** A3 traduce `Popliteus` como «Rodilla»; el propio `DESCRIPTIONS` de `Capitulo1.tsx`
  dice «región poplítea, detrás de la rodilla». Inexactitud menor, sin ticket asignado.
- **`calcBMI` en `sims.ts` es código muerto:** lee `document.getElementById('bmiMass'/'bmiHeight')`
  y pinta en un canvas `id="sim-bmi"`, pero el D3 actual (`Slide14.tsx` + `BMICalculatorCanvas.tsx`)
  no usa esos ids — el `canvas` sale `null` y la función retorna en su segunda línea. Se sigue
  invocando desde `Capitulo1.tsx:322` y `sims.ts:4531` (`case 14`) sin efecto visible. Mismo patrón
  que el `PLANES` muerto de `BodyScene.tsx` anotado en `C1-01`. *(Detectado al diagnosticar `C1-02`.)*
- **`Slide8.tsx`, fila «Área de superficie»:** el texto rotula el valor tabulado de la Tabla 1.5
  (1,85 m²) como «(Du Bois)», pero el libro no atribuye esa cifra a la Ec. 1.2 — la Tabla 1.5 (§1.3)
  y la fórmula de Du Bois (§1.4, Ec. 1.2) son fuentes distintas, y evaluar la fórmula con 70 kg/1,72 m
  da ≈1,82 m², no 1,85 (confirmado: el Problema 1.36 del libro pide comparar ambas explícitamente).
  `C1-02` no tocó ese rótulo por ser una precisión de redacción fuera de sus Pasos, no un valor
  duplicado; queda para un ticket de texto aparte. *(Detectado al diagnosticar `C1-02`.)*
- **`Slide8.tsx:84`:** variable `bmr` declarada y sin usar (preexistente, no introducida por `C1-02`).
- **LaTeX crudo en el apunte de C1:** el texto de `PARAMS_DATA.mass.desc` en `Slide8.tsx`
  (`peso $W = mg \approx 690\text{ N}$`) se pinta sin procesar por KaTeX al seleccionar el parámetro
  «Estatura y Masa» — se ve el `$...$` literal. Mismo síntoma que `C1-04`, pero en C1 en vez de en el
  Resumen; `C1-04` tal como está redactado solo cubre Slide16. *(Detectado al verificar `C1-02`.)*

---

## Fuera de alcance

La auditoría técnica del 2026-09-02 (`../AUDITORIA_CAP1.md`) cubre el bundle de entrada
(`Capitulo1` importado estático arrastra Three.js al chunk inicial), el `requestAnimationFrame`
permanente de `useEngine.ts`, y las fugas de listeners. **No** se abordan en estos tickets. Si se
tocan, hacerlo **entre fases** y en commits propios: mezclar cambios de rendimiento con cambios
visuales hace imposible saber qué rompió qué.
