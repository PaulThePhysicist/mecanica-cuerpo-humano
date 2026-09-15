# Instrucciones de ejecución — Correcciones Capítulo 2

> **Para Claude Code.** Este archivo es ejecutable: cada ticket lleva archivos, pasos, criterio de
> aceptación y comandos. Sigue el mismo contrato que `EJECUTAR_CORRECCIONES_CAP1.md`.
>
> **Origen:** auditoría gráfica del 2026-09-14 sobre `scratch/cap2-after` (19 de 21 diapositivas,
> desktop 1440×900) + lectura del código actual de `src/chapters/cap2/**`.
>
> **Contexto que importa:** el capítulo 2 **nunca recibió el pase de correcciones que sí se aplicó al
> capítulo 1**. Las reglas globales que el cap. 1 fijó (tokens, sin emoji, coma decimal, encuadre
> automático) están incumplidas aquí de forma sistemática. Ocho de los dieciocho hallazgos son causas
> de raíz en código compartido; los otros diez son sus manifestaciones. Por eso el orden de ejecución
> va de la causa al síntoma, y no por diapositiva.

---

## 0 · Protocolo de ejecución

**Regla número uno: un ticket por sesión.** El usuario revisa y aprueba cada corrección antes de
pasar a la siguiente. No encadenes tickets aunque parezcan triviales o relacionados.

Para cada ticket:

1. Leer el ticket completo antes de tocar nada.
2. Leer los archivos listados en **Archivos**. Si una ruta no existe o el contenido no coincide con
   lo que describe el ticket, **detente y repórtalo** — no improvises la ubicación.
3. Aplicar **solo** lo que dice **Pasos**. Nada de refactors de paso, renombrados, formateo del
   archivo entero, ni arreglar algo que veas mal al lado: si encuentras un problema nuevo, anótalo en
   **Hallazgos colaterales** al final de este archivo y sigue.
4. Ejecutar los comandos de **Verificación**.
5. Commit con el ID en el mensaje: `fix(cap2): N1-01 corregir el formateador de cifras`.
6. Reportar al usuario: qué cambió, en qué archivos, y qué debe mirar él en pantalla.

### Nivel de confianza de cada ticket

| Etiqueta | Significa |
| :--- | :--- |
| **VERIFICADO** | Las cadenas literales de este ticket se leyeron en el archivo, en la línea indicada. Aplicar tal cual. |
| **DIAGNOSTICADO** | El síntoma está confirmado en capturas, pero la ubicación exacta hay que localizarla. El ticket trae los comandos de búsqueda. **Confirma antes de editar.** |

### Comandos base

```bash
cd webapp
npm run lint          # oxlint
npm run build         # tsc -b + vite build
npm run dev           # servidor de desarrollo, :5173
```

**Ojo con el type-check:** `tsconfig.app.json` excluye los capítulos 4 y 6–13. Confirma si cap2 está
incluido antes de confiar en que `npm run build` valide estos cambios; si no lo está, el único
control real es visual y `npm run lint`.

### Reglas globales del capítulo

Valen para todos los tickets. Si un ticket te obliga a violar una de estas, detente y pregunta.

- **Decimales:** coma (es-ES) en todo lo visible, incluido el texto pintado en canvas y en Three.js.
- **Colores:** solo tokens de `:root` en `src/index.css`. Ningún literal hex o `rgba()` nuevo en cap2.
  Si hace falta una gama, se añade primero como token.
- **Tipografía:** `--mono` solo para cifras, unidades y código. Prosa en `--sans`, títulos en `--serif`.
- **Matemáticas:** todo por KaTeX. Cero notación de teclado (`^`, `_`, `{}`) visible al lector.
- **Iconografía:** sin emoji. Vocabulario único de glifos o nada.
- **Alcance:** solo `src/chapters/cap2/**` y, donde el ticket lo diga explícitamente, `src/index.css`.
  **No toques cap1** — es la referencia estable de la que copiamos.

### Nota de método sobre las capturas

Las capturas de `scratch/cap2-after` son del **2 de septiembre**, previas al pase del cap. 1, y cubren
**19 de 21** diapositivas. Los hallazgos marcados VERIFICADO se confirmaron contra el código actual y
no dependen de las capturas. **Antes de abrir el primer ticket**, recaptura el capítulo completo a
`scratch/cap2-baseline/` (21 diapositivas, 1440×900 y 820×1180) para tener un antes fiable y cubrir
las dos diapositivas ausentes.

---

## 1 · Orden de ejecución

El orden no es negociable: primero lo que miente al lector, después lo que estorba, al final lo estético.

| Fase | Tickets | Contenido | Por qué va aquí |
| :--- | :--- | :--- | :--- |
| 0 | `P0-01` | Preparación | Para que los diffs de las fases siguientes sean legibles. |
| 1 | `N1-01` | Cifras | El capítulo imprime números falsos. Es lo único que no se puede publicar. |
| 2 | `V2-01` … `V2-03` | Visualizaciones 3D | Mayor golpe a la calidad percibida, y el más barato de arreglar. |
| 3 | `L3-01` … `L3-02` | Leyendas y chips | Contenido que se corta e iconografía fuera de sistema. |
| 4 | `S4-01` … `S4-03` | Sistema visual | Cohesión. Importa, pero no impide entender nada. |
| 5 | `E5-01` … `E5-02` | Estados y selección | Correcciones de comportamiento, sin impacto visual en reposo. |

**Dependencias duras:**

- `V2-01` antes de `V2-02` y antes de `V2-03` — el encuadre cambia dónde caen los rótulos; resolverlos
  contra el encuadre viejo es trabajo perdido.
- `L3-01` antes de `L3-02` — quitar el emoji cambia el alto de los chips.
- `S4-01` después de `N1-01` — al tocar los lienzos conviene que las cifras ya sean correctas.
- `E5-02` después de `S4-01` — el estado de reserva debe pintarse ya con tokens.

### Trazabilidad con la auditoría

| Ticket | Hallazgos que cierra |
| :--- | :--- |
| `P0-01` | G-08 |
| `N1-01` | G-01 |
| `V2-01` | G-03, S-06, S-09 |
| `V2-02` | G-04, S-11 |
| `V2-03` | S-13 |
| `L3-01` | G-02 |
| `L3-02` | S-05, S-16, S-18 |
| `S4-01` | G-05 |
| `S4-02` | S-02 |
| `S4-03` | S-10 |
| `E5-01` | G-07 |
| `E5-02` | G-06, S-17 |

---

# FASE 0 · Preparación

## `P0-01` · Formatear `cap2.css` — **VERIFICADO**

### Contexto

Varias reglas llegan minificadas a mano. La línea 50 apila cinco declaraciones sin espacio tras los
dos puntos:

```css
overflow-y: auto; overflow-x: hidden;min-height: 100dvh;user-select:none;line-height:1.5;
```

No afecta al render, pero vuelve ilegible el diff de cualquier corrección de paleta o espaciado —
justo el trabajo de las fases 4 y 5. Va primero y **en un commit aislado** para que ningún diff
posterior mezcle formato con cambio real.

### Archivos

- `src/chapters/cap2/cap2.css` — único archivo a modificar.

### Pasos

1. Pasar el archivo por el formateador del proyecto (Prettier si está configurado; si no, formateo
   manual: una declaración por línea, espacio tras los dos puntos).
2. **Cero cambios semánticos.** Ni un valor, ni un selector, ni el orden de las reglas. Si el
   formateador quiere reordenar o colapsar algo, desactívalo para este archivo.

### Criterio de aceptación

`git diff --ignore-all-space` sobre `cap2.css` sale **vacío**. El capítulo se ve idéntico píxel a
píxel antes y después.

### Verificación

```bash
cd webapp && npm run build
git diff --ignore-all-space -- src/chapters/cap2/cap2.css   # debe salir vacío
```

Captura de dos diapositivas cualesquiera antes y después, para confirmar que no hay cambio visual.

---

# FASE 1 · Cifras

## `N1-01` · El formateador corrompe todos los enteros — **VERIFICADO**

### Contexto imprescindible

`src/chapters/cap2/ab.ts`, líneas 44–48, tal como está hoy:

```ts
export function fmt(x: number, d: number = 1): string {
  let s = Number(x).toFixed(d).replace(/\.?0+$/, '').replace('.', ',');
  if (s === '' || s === '-') s = '0';
  return s;
}
```

La intención de `/\.?0+$/` es recortar los ceros finales del decimal (`2,50` → `2,5`). Pero la
expresión no está anclada a la parte decimal: **muerde cualquier cero final, también los de la parte
entera**, porque se aplica antes de que exista la coma.

```
fmt(100, 0)   "100"    → "1"        ✗   debería ser "100"
fmt(2400, 0)  "2400"   → "24"       ✗   debería ser "2400"
fmt(10, 0)    "10"     → "1"        ✗   debería ser "10"
fmt(0.5, 1)   "0.5"    → "0,5"      ✓
fmt(2.50, 2)  "2.50"   → "2,5"      ✓
fmt(100, 1)   "100.0"  → "100"      ✓   (aquí sí acierta, por casualidad)
```

El fallo es silencioso: no hay excepción ni aviso, y `fmt` alimenta todas las etiquetas de fuerza,
torque y presión del capítulo. **Cualquier revisión gráfica posterior es inútil mientras las cifras
sean falsas** — de ahí que este ticket vaya antes que todo lo visual.

El capítulo 1 ya resolvió esto en el ticket `C1-06` creando `src/chapters/cap1/format.ts`:

```ts
export function fmt(n: number, decimals = 0): string {
  return n.toFixed(decimals).replace('.', ',');
}
```

Ese formateador **no recorta ceros** (decisión deliberada del cap. 1: `1,0` se muestra como `1,0`).
cap2 sí quiere recortarlos. **No unifiques las dos semánticas en este ticket** — son decisiones de
producto distintas y unificarlas cambiaría cómo se lee cap1. Aquí solo se arregla el recorte de cap2.

### Archivos

- `src/chapters/cap2/ab.ts` — único archivo a modificar.

### Pasos — una sustitución

Reemplazar el cuerpo de `fmt` (líneas 44–48) por:

```ts
export function fmt(x: number, d: number = 1): string {
  let s = Number(x).toFixed(d);
  // Recortar ceros finales SOLO en la parte decimal, y la coma si queda sola.
  if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, '');
  s = s.replace('.', ',');
  if (s === '' || s === '-') s = '0';
  return s;
}
```

No cambies la firma ni el valor por defecto de `d`: hay llamadas en todo el capítulo que dependen de
`d = 1`.

### Criterio de aceptación

Estos ocho casos dan el resultado esperado:

| Llamada | Esperado |
| :--- | :--- |
| `fmt(100, 0)` | `"100"` |
| `fmt(2400, 0)` | `"2400"` |
| `fmt(10, 0)` | `"10"` |
| `fmt(0)` | `"0"` |
| `fmt(0.5, 1)` | `"0,5"` |
| `fmt(2.5, 2)` | `"2,5"` |
| `fmt(-100, 0)` | `"-100"` |
| `fmt(1.05, 1)` | `"1,1"` |

Y ninguna diapositiva del capítulo muestra una cifra distinta de la que muestra hoy **salvo** las que
hoy están mal por este bug (que crecerán, nunca al revés).

### Verificación

```bash
cd webapp && npm run lint && npm run build
```

Recorrido visual de las 21 diapositivas comparando contra `scratch/cap2-baseline/`: cualquier cifra
que cambie debe ser una que antes estuviera truncada. Presta atención especial a los valores de
fuerza en newtons de los módulos A y B, y a las presiones del módulo D — son los que más enteros
redondos producen. Archiva el después en `scratch/fix-N1-01/`.

### Nota de alcance

La misma firma `export function fmt(x: number, d: number = 1)` aparece en el `ab.ts` de **cap3, cap4,
cap5, cap6, cap7, cap8, cap9, cap10, cap11, cap12 y cap13**. No se ha leído el cuerpo de esos once
archivos, así que no está confirmado que compartan el bug — es muy probable que sí, por copia.
**No los toques en este ticket** (el alcance es cap2), pero al cerrarlo comprueba uno de ellos y, si
el bug está, anótalo en **Hallazgos colaterales** y avisa al usuario: sería un ticket transversal
propio, con impacto en todo el tratado.

---

# FASE 2 · Visualizaciones 3D

## `V2-01` · Encuadre automático en las escenas 3D — **VERIFICADO**

### Contexto imprescindible

Las cámaras de cap2 se declaran con posición y campo de visión literales. Confirmado en
`src/chapters/cap2/BicepsCanvas.tsx`, línea 308:

```tsx
camera={ { position: [1.45, 0.3, 2.15], fov: 42 } }
```

Un grep de `Box3`, `setFromObject`, `fitToBox` o `FitCamera` en todo `cap2/**` **no devuelve nada**:
no hay ningún cálculo de caja envolvente. El encuadre solo es correcto en la relación de aspecto en
que se tuneó a mano. Al cambiar el ancho del panel el sujeto se descentra (S-09: la columna queda a
la izquierda con un vacío a la derecha y el aire superior/inferior descompensado) y en los paneles
estrechos la figura llega a tocar el borde, cortando las anotaciones ancladas abajo (S-06).

**El cap. 1 ya tiene la pieza resuelta:** `src/chapters/cap1/three/FitCamera.tsx` (136 líneas).
Calcula la caja envolvente del objeto llamado `targetName` (por defecto `'fit-root'`), construye la
base ortonormal de la cámara y deriva la distancia proyectando las ocho esquinas sobre los ejes
`right`/`up` — es decir, tiene en cuenta el aspecto real, no solo el `fov` vertical. Espera dos frames
con `requestAnimationFrame` para que las mallas GLB ya estén en la escena, y acepta un `refit` para
recalcular. Firma:

```tsx
FitCamera({ targetName = 'fit-root', padding = 1.35, lookTarget, refit })
```

### Decisión a tomar antes de editar

`FitCamera` vive bajo `cap1/`. Hay dos caminos:

- **(A) Importar desde cap2** — `import { FitCamera } from '../cap1/three/FitCamera'`. Cero riesgo
  para cap1, pero deja una dependencia cruzada entre capítulos.
- **(B) Promover a `src/three/FitCamera.tsx`** y que cap1 y cap2 importen de ahí. Más limpio, pero
  **toca cap1**, que este plan declara intocable.

**Empieza por (A).** Si el usuario prefiere (B), eso es un ticket aparte con su propia verificación
de las 17 diapositivas de cap1.

### Archivos

- `src/chapters/cap2/BicepsCanvas.tsx` — **VERIFICADO**, línea 308.
- Las demás escenas `<Canvas>` de cap2 — **DIAGNOSTICADO**, localízalas con:

```bash
cd webapp
grep -rn "camera={" src/chapters/cap2/
grep -rln "<Canvas" src/chapters/cap2/
```

Trátalas en este mismo ticket solo si tienen el mismo patrón de cámara literal. Si alguna ya encuadra
de otra forma, **déjala y anótalo**.

### Pasos

1. En cada escena afectada, dar `name="fit-root"` al grupo que contiene las mallas a encuadrar
   (el grupo, no la escena entera: no debe incluir suelo, luces ni gizmos).
2. Montar `<FitCamera />` dentro del `<Canvas>`.
3. Quitar del prop `camera` la posición tuneada a mano, dejando solo el `fov`: la posición ahora la
   fija `FitCamera`. **Conserva el `fov` original** (42 en `BicepsCanvas`) — cambiarlo altera la
   perspectiva, que es una decisión de diseño, no un bug.
4. Ajustar `padding` si el encuadre queda demasiado justo o demasiado suelto. Parte de `1.35`.
5. Si la escena cambia de contenido al interactuar (mostrar/ocultar estructuras), pasar ese estado
   como `refit` para que recalcule.
6. Revisar `cap1/three/AnatomyStage.tsx:100` antes de copiar patrones: hay un `if (fit) return;`
   con el comentario «FitCamera es dueño de la cámara». Si cap2 tiene cualquier otro efecto que
   escriba `camera.position`, hay que desactivarlo igual o se pelearán.

### Criterio de aceptación

Cada escena 3D de cap2 mantiene el sujeto **centrado y completo**, con aire simétrico, a los tres
anchos de ventana: 1440, 1024 y 768 px. Ninguna malla toca el borde del lienzo. En D1 la columna está
centrada en el marco, no desplazada a la izquierda.

### Verificación

Capturas de cada escena a los tres anchos, en `scratch/fix-V2-01/`. Comprueba además que al
redimensionar la ventana en vivo el encuadre se recalcula y no se queda con el de la carga.

---

## `V2-02` · Rótulos 3D que se solapan y atraviesan la geometría — **VERIFICADO**

### Contexto imprescindible

Los rótulos anclados a la escena se montan centrados y sin más. Confirmado:

```
src/chapters/cap2/BicepsCanvas.tsx:55            <Html center>
src/chapters/cap2/BiomechSummaryCanvas.tsx:660   <Html …>
```

Un grep de `occlude`, `zIndexRange`, `declutter` o `avoidOverlap` en `cap2/**` no devuelve nada. Sin
oclusión, los rótulos de estructuras posteriores flotan sobre el hueso que debería taparlos; sin
anticolisión, dos rótulos que caen en el mismo punto de pantalla se escriben uno encima del otro.
En E1 (mandíbula), la escena más densa del capítulo, los rótulos de los músculos masticadores se
montan entre sí y deja de distinguirse a qué estructura pertenece cada línea guía.

### ⚠ Corrección a la auditoría

La auditoría dice «pasar los rótulos por el desapilador del cap. 1». **Ese desapilador no existe.**
Verificado: no hay `declutter`/`avoidOverlap`/`occlude` en ningún archivo de cap1. Lo que cap1 tiene
de verdad son dos cosas distintas:

- **`cap1/three/Callouts.tsx`** — un sistema de letreros donde `Callout` se ancla al punto a señalar
  pero, cuando la escena lo permite, **se renderiza en el `overlay` del stage en vez de flotar fijo
  con `<Html>`** (ver el comentario de `cap1/AnatomyCanvas.tsx:600`). El `<Html>` fijo con
  `zIndexRange={[100, 0]}` es su **caída**, no su camino principal (`Callouts.tsx:170-173`).
- **`zIndexRange={[100, 0]}`** aplicado consistentemente en `PlanesCanvas.tsx:195,285,290`, que ordena
  el apilado de los rótulos entre sí pero **no resuelve colisiones ni oclusión por geometría**.

Así que aquí no hay nada que «portar»: hay que **decidir la estrategia**. Recomendación, de menos a
más riesgo:

1. **Reducir el número de rótulos simultáneos** — mostrar solo el de la estructura activa y dejar los
   demás como punto de anclaje. En E1, con tantas estructuras en tan poco espacio, esto resuelve el
   problema sin ningún algoritmo. **Es la opción recomendada.**
2. **Adoptar el patrón overlay de `Callouts.tsx`** — sacar los rótulos a una lista en el margen con
   línea guía al punto. Más trabajo, pero es el lenguaje que ya habla cap1.
3. **Activar `occlude` en los `<Html>`** de drei para que los rótulos tapados por geometría se oculten.
   Baratísimo, pero solo arregla la oclusión, no el solape entre rótulos visibles.

**Empieza por (1) + (3) en E1.** No implementes un algoritmo de desapilado sin hablarlo con el
usuario: es un componente nuevo con superficie de prueba propia.

### Archivos

- `src/chapters/cap2/BicepsCanvas.tsx` — **VERIFICADO**, línea 55.
- `src/chapters/cap2/BiomechSummaryCanvas.tsx` — **VERIFICADO**, línea 660.
- La escena de la mandíbula (E1) — **DIAGNOSTICADO**. Localízala:

```bash
cd webapp
grep -rln "masetero\|temporal\|pterigoideo\|mandíbula" src/chapters/cap2/
grep -rn "<Html" src/chapters/cap2/
```

### Pasos

1. Añadir `occlude` a los `<Html>` que rotulan estructuras 3D, para que los tapados no floten.
2. Añadir `zIndexRange={[100, 0]}` donde falte, siguiendo la convención de `PlanesCanvas.tsx`.
3. En E1, pasar a «solo el rótulo de la estructura activa»: los demás quedan como punto de anclaje
   (un disco pequeño del color de la estructura), y el rótulo aparece al activarla.
4. No cambies el contenido de los rótulos ni sus colores — eso es `S4-01`/`S4-02`.

### Criterio de aceptación

Rotando cada escena 3D del capítulo a 0°, 90° y 180°, **ningún par de rótulos se solapa** y ningún
rótulo de una estructura oculta se lee sobre la geometría que la tapa.

### Verificación

Tres capturas por escena (0°, 90°, 180°) en `scratch/fix-V2-02/`, con E1 como caso crítico.

---

## `V2-03` · Cifras de masa segmentaria solapadas (F1) — **DIAGNOSTICADO**

### Síntoma

En F1 (segmentos corporales), las fracciones de masa se colocan junto a cada segmento sin comprobar
el espacio disponible. En los segmentos cortos —antebrazo y pie— la cifra se monta sobre la etiqueta
vecina: dos números contiguos e ilegibles, en la diapositiva cuyo contenido **es precisamente** la
distribución numérica.

### Archivos — confirmar antes de editar

```bash
cd webapp
grep -rln "segmento\|antebrazo\|SEGMENT" src/chapters/cap2/
```

Busca el componente que pinta la figura de segmentos con sus fracciones de masa. Puede ser un lienzo
2D o una escena 3D; el arreglo difiere.

### Pasos

1. Sacar las cifras del centro de cada segmento a una **columna alineada al margen**, con línea guía
   fina desde la cifra hasta el segmento que describe.
2. Mantener el orden vertical de la columna igual al orden anatómico de los segmentos, para que las
   líneas guía no se crucen.
3. Si el componente es 3D, aplicar antes `V2-01` y `V2-02`: el encuadre nuevo puede cambiar dónde
   caen las cifras y parte del solape puede desaparecer solo.

### Criterio de aceptación

Las once fracciones de masa de F1 se leen completas y sin solape, y cada una es inequívocamente
atribuible a su segmento. Se cumple a 1440, 1024 y 768 px de ancho.

### Verificación

Captura de F1 a los tres anchos en `scratch/fix-V2-03/`. Comprueba que las fracciones suman lo que
debe sumar el modelo — si `N1-01` cambió alguna cifra aquí, es el momento de verlo.

---

# FASE 3 · Leyendas y chips

## `L3-01` · Sustituir los emoji por glifos del sistema — **VERIFICADO**

### Contexto imprescindible

El panel de síntesis rotula las tres estructuras del capítulo con emoji de sistema, y marca el estado
activo con un check de texto:

```
src/chapters/cap2/BiomechSummaryCanvas.tsx:59    icon: '🦷',
src/chapters/cap2/BiomechSummaryCanvas.tsx:95    icon: '💪',
src/chapters/cap2/BiomechSummaryCanvas.tsx:113   icon: '🦴',
src/chapters/cap2/BiomechSummaryCanvas.tsx:852   '✓ Vista General · …'
```

El renderizado depende de la fuente de emoji del sistema operativo: cambia de color, peso y
alineación vertical entre plataformas, rompe el registro con el texto de al lado y desentona con el
grabado del tratado. En H2 (S-18) desplaza verticalmente el texto de cada chip una cantidad distinta,
que es la causa de que la fila pierda la línea base. **El cap. 1 ya eliminó esta práctica**; la regla
global «sin emoji» viene de ahí.

### Archivos

- `src/chapters/cap2/BiomechSummaryCanvas.tsx` — **VERIFICADO**, líneas 59, 95, 113, 852.
- Barrido del resto del capítulo, por si hay más:

```bash
cd webapp
grep -rnP "[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}\x{2B00}-\x{2BFF}\x{FE0F}]" src/chapters/cap2/
```

### Pasos

1. Localizar el set de glifos SVG monocromos que usa cap1 tras su pase de correcciones y reutilizarlo.
   Si no hay un glifo equivalente para diente / músculo / hueso, **la alternativa correcta es ninguno**:
   la regla global admite «vocabulario único de glifos o nada», y un chip con solo texto bien
   compuesto es mejor que un emoji. Pregunta al usuario antes de dibujar glifos nuevos.
2. Los glifos heredan el color con `currentColor`; no les asignes color propio.
3. Sustituir el `'✓ '` de la línea 852 por estado tipográfico: peso y fondo del chip activo, no un
   carácter. El check de texto sufre el mismo problema de fuente que el emoji.
4. Si el `icon` se pinta en un lienzo 2D con `fillText`, un SVG no sirve directamente: o se dibuja con
   `Path2D`, o se elimina el icono en esa vista. **Detente y repórtalo** si es el caso — cambia el
   alcance del ticket.

### Criterio de aceptación

El grep de emoji sobre `src/chapters/cap2/` **no devuelve nada**. Los chips de H2 comparten línea base
exacta. El estado activo se distingue sin ningún carácter especial.

### Verificación

Capturas de H2 y del panel de síntesis en `scratch/fix-L3-01/`, en macOS y en Windows si es posible
(el defecto es específicamente de fuente de sistema).

---

## `L3-02` · Filas de leyenda: salto de línea y alto uniforme — **DIAGNOSTICADO**

### Síntoma

Tres diapositivas, un solo defecto de patrón:

- **B3 (S-05, el más visible del módulo B)** — las pastillas de leyenda se disponen en una sola línea
  sin permitir salto, con anchos dictados por la longitud del nombre de cada músculo. La fila excede
  el ancho útil: la última pastilla queda cortada por el borde y los espacios entre elementos se
  comprimen de forma desigual.
- **G2 (S-16)** — las entradas de umbral táctil no comparten alto ni peso tipográfico: las de dos
  líneas crecen y empujan la línea base del resto. Los marcadores de color tampoco quedan alineados.
- **H2 (S-18)** — la fila de chips no comparte línea base ni alto (además del emoji, ya resuelto en
  `L3-01`).

### Archivos — confirmar antes de editar

```bash
cd webapp
grep -rn "flex-wrap\|display:\s*flex" src/chapters/cap2/cap2.css
grep -rn "legend\|leyenda\|chip\|pill" src/chapters/cap2/
```

Identifica si las tres filas comparten clase CSS o si cada diapositiva tiene la suya. **Esto decide
el alcance:** si comparten clase, es un arreglo en `cap2.css`; si no, son tres arreglos y conviene
crear un componente común.

### Pasos

1. Convertir la fila en rejilla con salto: `flex-wrap: wrap` y `gap` fijo (o `display: grid` con
   `repeat(auto-fit, minmax(…, 1fr))`). **Nunca espaciado por márgenes individuales ni por espacios
   en el código** — el `gap` es lo que sobrevive a que se añada o quite una entrada.
2. Alto mínimo común para todas las entradas, y un solo peso tipográfico.
3. Alinear marcador y texto con una rejilla de dos columnas (marcador · texto), no con espacios.
4. En B3, abreviar los nombres largos usando el nombre corto que ya existe en los datos. Si no existe,
   **no lo inventes**: pregunta al usuario qué abreviatura quiere para cada músculo.
5. Respetar las reglas globales: colores por token, `--mono` solo en las cifras de la leyenda.

### Criterio de aceptación

Las tres filas saltan de línea sin recorte ni compresión desigual a 1440, 1024 y 768 px. Todas las
entradas de una misma fila comparten alto y línea base. Ninguna entrada queda cortada por el borde.

### Verificación

Capturas de B3, G2 y H2 a los tres anchos en `scratch/fix-L3-02/`. H2 es el control final: reúne este
ticket y `L3-01`.

---

# FASE 4 · Sistema visual

## `S4-01` · Los lienzos deben leer los tokens, no copiar los colores — **VERIFICADO**

### Contexto imprescindible

Los lienzos 2D reconstruyen la paleta con literales `rgba()` y degradados propios en lugar de leer las
variables ya definidas en `src/index.css`. Confirmado:

```
src/chapters/cap2/TactileThresholdCanvas.tsx:144   ctx.fillStyle = bgGrad;
src/chapters/cap2/TactileThresholdCanvas.tsx:162   ctx.fillStyle = 'rgba(35, 44, 54, 0.06)';
src/chapters/cap2/TactileThresholdCanvas.tsx:166   …
src/index.css:13                                   --ink: #232c36;
```

`rgba(35, 44, 54, 0.06)` es exactamente `--ink` al 6 %, escrito a mano. Son copias del mismo color:
cualquier ajuste de paleta deja los gráficos desincronizados del resto de la página, y ya hoy el gris
de las retículas no coincide con el del texto que las acompaña.

### Archivos

- `src/chapters/cap2/TactileThresholdCanvas.tsx` — **VERIFICADO**.
- Barrido del resto de lienzos del capítulo:

```bash
cd webapp
grep -rn "#[0-9a-fA-F]\{3,8\}\b\|rgba\?(" src/chapters/cap2/ | grep -v "\.css:"
```

### Pasos

1. Leer los tokens **una vez por render** con `getComputedStyle(document.documentElement)` y
   derivar de ahí las opacidades, como ya hace cap1. No lo hagas dentro del bucle de dibujo.
2. Sustituir cada literal por el token correspondiente. Si un literal no tiene token equivalente,
   **la regla global manda añadir el token primero** en `src/index.css` — y eso hay que consultarlo
   con el usuario, porque amplía la paleta del tratado.
3. Ojo con el bloque de DPR de `TactileThresholdCanvas.tsx:126-155`: toca el dimensionado del lienzo.
   **No lo modifiques** en este ticket, solo los colores.
4. Los degradados de varias paradas deliberados (sombreado de hueso, relieves) **no se colapsan a un
   token plano** — eso sería rehacer la figura. Anótalos y déjalos; cap1 tomó la misma decisión.

### Criterio de aceptación

El grep de literales de color sobre los `.tsx` de cap2 no devuelve ninguno, salvo degradados
deliberados explícitamente anotados. El gris de las retículas coincide exactamente con el del texto.

### Verificación

Captura de cada lienzo 2D del capítulo en `scratch/fix-S4-01/`. Prueba además a cambiar `--ink` en
`:root` temporalmente y confirmar que los lienzos lo siguen; revierte el cambio después.

---

## `S4-02` · Unificar los rótulos de vector en A2 — **DIAGNOSTICADO**

### Síntoma

En A2 (torque), los rótulos de la misma clase —magnitud de fuerza y brazo de palanca— se pintan con
tratamientos diferentes: unos con fondo de pastilla, otros como texto suelto sobre el lienzo. Al
coexistir en el mismo diagrama sugieren una jerarquía que no existe, y el texto sin fondo pierde
contraste al cruzar la retícula.

### Archivos — confirmar antes de editar

```bash
cd webapp
grep -rln "torque\|momento\|brazo" src/chapters/cap2/
```

### Pasos

1. Unificar en **un solo componente de rótulo**: fondo semiopaco del token de papel, un único tamaño,
   `--mono` para la cifra y la unidad.
2. Reservar la variante destacada para el valor que el usuario está manipulando en ese momento —
   esa sí es una jerarquía real.
3. Si cap1 ya tiene un helper de rótulo encajonado (busca `chip(` o `CFX.chip` en `cap1/`), úsalo
   como referencia de estilo para que los dos capítulos hablen el mismo idioma. **No lo importes**
   si vive en `sims.ts`: ese archivo tiene `@ts-nocheck` y 4.500 líneas.

### Criterio de aceptación

Todos los rótulos de A2 comparten tratamiento. Ningún texto de rótulo se lee sobre la retícula sin
fondo. El contraste del texto de rótulo es ≥ 4,5:1 contra su fondo.

### Verificación

Captura de A2 en `scratch/fix-S4-02/`, con la retícula visible detrás de al menos un rótulo.

---

## `S4-03` · Ancho mínimo del panel de lecturas en D2 — **DIAGNOSTICADO**

### Síntoma

La columna de lecturas del disco (D2) se corta por su borde derecho: las unidades quedan fuera del
área visible y el último bloque de la lista se interrumpe sin indicio de que continúe. Como la raíz
del capítulo lleva `overflow-x: hidden` (`cap2.css:50`, la misma línea de `E5-01`), **el contenido
perdido no es recuperable por desplazamiento**: simplemente no existe para el lector.

### Archivos — confirmar antes de editar

```bash
cd webapp
grep -rn "content-grid\|grid-template-columns" src/chapters/cap2/cap2.css
```

La rejilla de contenido está en `cap2.css` a partir de la línea ~165 (`/* ─── CONTENT GRID ─── */`).

### Pasos

1. Dar al panel ancho mínimo propio dentro de la rejilla, con `minmax(0, 1fr)` en la pista correcta
   (el `0` es lo que permite encogerse sin desbordar; un `minmax(auto, …)` reproduce el bug).
2. Verificar con la cifra de unidad más larga del panel, no con la que haya por defecto.
3. Si a 768 px no caben las dos columnas, que la rejilla pase a una sola columna apilada antes que
   recortar.

### Criterio de aceptación

Todas las lecturas de D2, con sus unidades, se leen completas a 1440, 1024 y 768 px. Ningún bloque se
interrumpe por el borde.

### Verificación

Captura de D2 a los tres anchos en `scratch/fix-S4-03/`.

---

# FASE 5 · Estados y selección

## `E5-01` · Devolver la selección de texto al cuerpo teórico — **VERIFICADO**

### Contexto imprescindible

`src/chapters/cap2/cap2.css`, línea 50 (tras `P0-01` estará reformateada, misma regla):

```css
overflow-y: auto; overflow-x: hidden;min-height: 100dvh;user-select:none;line-height:1.5;
```

La raíz del capítulo desactiva la selección de texto para **toda** la página. La intención —evitar
selecciones accidentales al arrastrar las escenas 3D— es razonable, pero el alcance es demasiado
amplio: impide copiar una fórmula, un valor o una cita del cuerpo teórico, que en un tratado de
estudio es una función esperada.

### Archivos

- `src/chapters/cap2/cap2.css` — **VERIFICADO**, línea 50.

### Pasos

1. Quitar `user-select: none` de la regla raíz.
2. Añadirlo **solo** a los contenedores de lienzo y de controles (`.sim-area`, `.prof-controls` y los
   wrappers de `<Canvas>`), que es donde el arrastre causa el problema.
3. Confirmar que los bloques de teoría, las tablas y las cifras quedan seleccionables.
4. **No cambies `overflow-x: hidden`** en este ticket: quitarlo puede revelar desbordes horizontales
   en varias diapositivas a la vez y es lo que `S4-03` arregla en su sitio concreto. Si al hacer
   `E5-01` aparece una barra horizontal, anótalo y déjalo.

### Criterio de aceptación

Se puede seleccionar y copiar el texto teórico y las cifras de las 21 diapositivas. Arrastrar sobre un
lienzo 3D **no** selecciona texto.

### Verificación

Prueba manual: seleccionar y copiar un párrafo de teoría y una cifra en tres diapositivas distintas;
arrastrar para rotar en dos escenas 3D y confirmar que no aparece selección azul.

---

## `E5-02` · Estado de reserva visible en los lienzos (y el vacío de H1) — **VERIFICADO + DIAGNOSTICADO**

### Contexto imprescindible

Cuando el contexto de dibujo no está disponible, la plataforma de fuerzas devuelve una textura en
blanco y sigue adelante:

```
src/chapters/cap2/ForcePlateCanvas.tsx:190
if (!ctx) return new THREE.CanvasTexture(canvas);   // ← lienzo en blanco
```

En pantalla eso no se lee como un fallo, se lee como una superficie apagada: el usuario ve una
plataforma sin graduación y asume que así se diseñó. **Es la causa probable del panel sin contenido
observado en H1** (S-17): una porción apreciable del panel queda en blanco, sin gráfico ni texto,
rodeada de contenido, y lee como error de carga más que como respiro compositivo.

Hay más guardas del mismo tipo en el capítulo:

```bash
cd webapp
grep -rn "if (!ctx) return\|if (!canvas) return" src/chapters/cap2/
```

### Pasos

1. En cada guarda de contexto ausente: registrar el fallo en consola con el nombre del lienzo, y
   pintar un **estado de reserva explícito** —retícula plana con la leyenda «vista no disponible»—
   para que el defecto sea visible en revisión y no se confunda con una decisión de diseño.
2. Usar tokens para ese estado de reserva (depende de `S4-01`, ya cerrado a esta altura).
3. **Diagnosticar H1 en ejecución:** abrir H1 con la consola abierta y comprobar si salta alguno de
   esos avisos nuevos.
   - Si **sí** salta: el vacío era un fallo de carga. Arreglar la causa raíz.
   - Si **no** salta: el vacío es intencional o es espacio reservado de más. Reducir la altura
     reservada para que no se lea como hueco, y reportarlo al usuario como decisión de diseño.
   **No rediseñes H1** sin saber en qué caso estás.

### Criterio de aceptación

Ningún lienzo del capítulo puede quedar en blanco de forma silenciosa: o pinta su contenido, o pinta
el estado de reserva y avisa en consola. H1 no tiene zonas que se lean como error de carga.

### Verificación

Captura de H1 en `scratch/fix-E5-02/` y log de consola del recorrido completo del capítulo. Para
probar el estado de reserva, fuerza temporalmente `ctx = null` en un lienzo y confirma que se ve el
mensaje; revierte después.

---

# Verificación de cierre del capítulo

Cuando los doce tickets estén cerrados:

- [ ] Las cifras 10, 100, 2400 y 0,50 se imprimen correctas en las 21 diapositivas.
- [ ] Ningún emoji en `src/chapters/cap2/**`; iconografía solo SVG monocromo o ninguna.
- [ ] Cada escena 3D mantiene el sujeto centrado y completo a 1440, 1024 y 768 px de ancho.
- [ ] Ningún par de rótulos se solapa tras rotar cada escena a 0°, 90° y 180°.
- [ ] Las filas de leyenda saltan de línea sin recorte en los tres anchos.
- [ ] Ningún literal de color en los `.tsx` de cap2: todos derivan de los tokens de `:root`.
- [ ] El texto teórico y las cifras se pueden seleccionar y copiar.
- [ ] Ningún lienzo queda en blanco sin avisar en consola.
- [ ] `npm run lint` y `npm run build` en verde.
- [ ] Capturas nuevas de las 21 diapositivas archivadas como `scratch/cap2-fixed/`.

---

# Hallazgos colaterales

> Anota aquí lo que encuentres y **no** corrijas, con el ticket en el que lo detectaste. No abras
> tickets nuevos por tu cuenta: repórtalos al usuario al cerrar la sesión.

- **El bug de `fmt` es probablemente transversal a todo el tratado.** La misma firma
  `export function fmt(x: number, d: number = 1)` está en el `ab.ts` de cap3, cap4, cap5, cap6, cap7,
  cap8, cap9, cap10, cap11, cap12 y cap13. No se leyó el cuerpo de esos archivos. Si comparten la
  expresión `/\.?0+$/`, once capítulos más están imprimiendo enteros truncados. *(Detectado al
  redactar `N1-01`.)*
- **`cap1/format.ts` y `cap2/ab.ts:fmt` tienen semánticas distintas a propósito** (cap1 no recorta
  ceros, cap2 sí; cap1 usa `decimals = 0` por defecto, cap2 `d = 1`). Unificarlas es una decisión de
  producto, no una limpieza: cambiaría cómo se leen las cifras de cap1. Candidato a módulo compartido
  `src/format.ts` con las dos funciones nombradas explícitamente. *(Detectado al redactar `N1-01`.)*
- **`FitCamera` vive bajo `cap1/`** y `V2-01` la importa de forma cruzada entre capítulos. Promoverla
  a `src/three/FitCamera.tsx` es lo correcto a medio plazo, pero obliga a reverificar las 17
  diapositivas de cap1. *(Detectado al redactar `V2-01`.)*
- **La auditoría gráfica atribuía a cap1 un «desapilador de etiquetas» que no existe.** Lo que hay es
  `cap1/three/Callouts.tsx` (patrón overlay) y `zIndexRange` aplicado por convención. Corregido en el
  cuerpo de `V2-02`. *(Detectado al redactar `V2-02`.)*
- **El bug de `fmt()` arreglado en `N1-01` no tiene ningún efecto visible hoy: su único
  consumidor es código muerto.** `ab.ts:fmt` solo lo importa `sims.ts` (`import * as AB from
  './ab'`). Las ~30 llamadas `fmt(x, 0)` de `sims.ts` (fuerzas/torques en N de los módulos A–D)
  viven todas dentro de `drawById`, invocado por `redrawSlide`, que busca los canvas por
  `document.getElementById(id)` con los IDs de `CANVASMAP` (`sim-torque`, `sim-levers`,
  `sim-hip`…). Ningún `.tsx` actual renderiza un elemento con esos IDs (`grep 'id=["\']sim-'
  src/chapters/cap2/*.tsx` → 0 resultados) ni importa `fmt` de `ab.ts` (`grep 'fmt('
  src/chapters/cap2/*.tsx` → 0 resultados): cada `*Canvas.tsx` formatea sus propios números con
  `.toFixed()` inline. `redrawSlide` corre cada frame en el rAF de `useEngine.ts` pero su `if
  (!cv) continue` lo vuelve un no-op total. Confirma y precisa el hallazgo ya anotado en memoria
  de que `sims.ts` es código muerto — aquí con el mecanismo exacto. El fix en `ab.ts` sigue siendo
  correcto y es lo que pedía el ticket (y protege si `sims.ts` se revive), pero el "recorrido
  visual" de la Verificación de `N1-01` no puede mostrar ningún cambio: no hay cifra que cambie
  en las 21 diapositivas. *(Detectado al cerrar `N1-01`.)*
- **`FitCamera` (cap1) no reencuadra al redimensionar el `<Canvas>`.** Su `useEffect` depende de
  `[refit, targetName, padding, camera, scene, controls]`, ninguno de los cuales cambia cuando el
  contenedor cambia de tamaño (r3f solo actualiza `camera.aspect` internamente). Verificado en vivo:
  redimensionar de 800px a 1024px sin ningún cambio de `refit` deja el encuadre calculado para el
  aspecto anterior — el sujeto se veía más pequeño y descentrado tras el resize. Es un límite del
  componente compartido, no de cap2. **Workaround dentro de cap2** (no toca cap1): nuevo
  `cap2/three/FitCameraResize.tsx`, un wrapper que lee `useThree(s => s.size)` y lo añade al `refit`
  que le pasa a `FitCamera`, forzando el recálculo en cada resize. Los 13 canvas de `<Canvas>` crudo
  de V2-01 lo usan (import aliased `FitCameraResize as FitCamera`); Knee/Ankle (que llegan a
  `FitCamera` a través de `AnatomyStage`, cap1) **siguen con el hueco**: no hay forma de aplicar el
  mismo parche sin tocar `AnatomyStage.tsx`. Cualquier escena de **cap1** que use `fit` en
  `AnatomyStage` probablemente tiene el mismo hueco — no se verificó, pero el mecanismo es idéntico.
  Ticket propio si se quiere cerrar también ahí: mover el `useThree(size)` dentro de `AnatomyStage`
  mismo, o exponer un prop `refit` ya compuesto con el tamaño. *(Detectado al verificar `V2-01`.)*
- **`BiomechSummaryCanvas` (H2) excluido de `V2-01` a propósito.** Su cámara no usa un único encuadre
  estático: `CameraRig` (local al archivo) hace `camera.position.lerp(...)` en un `useFrame`
  **continuo**, con un `targetPos`/`targetLook` propio por nodo articular (`NODES_DATA[node].camPos`)
  más un modo "overview" para el esqueleto completo. Montar `FitCamera` ahí competiría por escribir
  `camera.position` cada frame contra ese lerp — exactamente el conflicto que el ticket pide evitar
  (Pasos, paso 6). Encuadrar cada uno de los 7 nodos + overview de forma responsiva exigiría rehacer
  `CameraRig` para que sea consciente del bbox real, un ticket propio (bastante más grande que
  "quitar camera.position y montar FitCamera"). *(Detectado al ejecutar `V2-01`.)*
- **`NewtonCanvas` (A1): el anillo del DCL (`dclRing`) se sacó de `fit-root`.** Es una referencia de
  radio fijo (0.5u), no anatomía — de contarlo, habría alejado la cámara más de lo necesario para la
  articulación + vectores reales (mismo caso que ya documenta `AnatomyStage` `contextChildren`, citado
  en el propio código de cap1 como "V2-01, B3"). Se mantiene visible, solo fuera del cálculo de la
  caja envolvente. *(Detectado al ejecutar `V2-01`.)*
- **La premisa de `V2-02` estaba desactualizada: E1 ya no tiene el problema que describe el ticket.**
  El ticket auditaba "los rótulos de los músculos masticadores se montan entre sí" en E1 y recomendaba
  "(1) mostrar solo el rótulo de la estructura activa" ahí. Verificado con grep: `JawCanvas.tsx` tiene
  **0** `<Html>` propios — la migración al riel de leader-lines (ver memoria del proyecto,
  "MIGRACIÓN DE RIEL DE CAP2 COMPLETA") ya reemplazó esos rótulos flotantes por `<Callout>` (va al
  riel lateral, fuera del lienzo) + 2 `<DclTag>` bien separados. `BicepsCanvas.tsx:56` y
  `LeverAnatomyCanvas.tsx:41`, citados también, resultaron ser spinners de carga ("Cargando
  anatomía…"), no rótulos de estructura. El problema real (reproducido en vivo, rotando D2): dos
  `DclTag` (`⚠ hernia` / `⚡ ciatalgia`) que se proyectan cerca en pantalla desde cierto ángulo y el
  texto se mezcla. Aplicado solo el Paso 1 del ticket (`occlude="blending"` en `DclTag` —
  `DclReadout.tsx` — y en los 2 `<Html>` sueltos de `BiomechSummaryCanvas`/`NewtonCanvas`, ambos ya
  con `zIndexRange`): un tag detrás de la vértebra ahora desaparece en vez de flotar encima.
  **No implementado** (confirmado con el usuario): el desapilado que evitaría que dos tags visibles
  se solapen entre sí cuando sus puntos de anclaje 3D caen cerca en pantalla — el propio ticket pide
  no construir ese algoritmo sin hablarlo. Sigue reproducible en D2 rotando ~180°; candidato a ticket
  propio si se quiere resolver (separar a mano los anclajes de D2, o el patrón overlay que ya usa
  `Callouts.tsx`). *(Detectado al ejecutar `V2-02`.)*
- **Ojo al leer el historial de cap1: hay un `V2-03` de cap1 que no es este ticket.** El commit
  `25e6613 fix(cap1): V2-03 eliminar las colisiones de rótulos` construyó `AnchoredLabelOverlay`
  en `cap1/three/Callouts.tsx` — un desapilador por empuje para rótulos de eje (`+z`, `Posterior/
  Dorsal`…) que deben quedarse junto a su punto en vez de ir al riel. Coincidencia de numeración
  entre los dos planes (cap1 y cap2 tienen su propio ticket "V2-03"), nada que ver con las masas
  segmentarias de F1. Se evaluó usarlo aquí y se descartó: el Paso 1 del ticket de **cap2** pide
  literalmente "sacar las cifras... a una columna alineada al margen con línea guía" — exactamente
  lo que ya hace `<Callout>` + `<CalloutRail>` (el mismo mecanismo que este archivo ya usaba para
  CG/margen) — así que no hacía falta el desapilador de `AnchoredLabelOverlay`, pensado para un
  problema distinto (rótulos que NO deben moverse del punto). *(Detectado al ejecutar `V2-03`.)*
- **El riel de F1 se recorta en el layout móvil de cap2 (≤820px de ancho) por falta de altura, no
  por solape.** Verificado en vivo a 768×1000: con 9 letreros en el riel (7 masas + CG + margen),
  la mayoría queda invisible (recortada, no superpuesta) porque `.sim-area` en cap2.css solo tiene
  `min-height:200px` — **cap2 nunca recibió el fix `min-height:56vh` para el layout móvil que ya
  tiene cap1** (memoria del proyecto, "Bug de layout en MÓVIL" del pase de cap1). A 1024×768 y
  1440×900 los 9 letreros se leen completos y sin solape (verificado en vivo). Es un problema de
  layout general de cap2 en móvil, no específico de F1 ni de este ticket — mismo síntoma afectaría
  cualquier riel con varios letreros en cualquier escena 3D del capítulo. *(Detectado al verificar
  `V2-03`.)*
- **`L3-01` tiene una premisa falsa: cap1 nunca eliminó los emoji.** El ticket dice "el cap. 1 ya
  eliminó esta práctica; la regla global 'sin emoji' viene de ahí" y pide reutilizar "el set de
  glifos SVG monocromos que usa cap1". Un primer grep dio 0 emoji en cap1 — falso negativo por un
  problema de locale de `grep -P` con rangos Unicode en este entorno (Bash lo reportó: "supports
  only unibyte and UTF-8 locales"). Repetido con la herramienta de búsqueda correcta: **cap1 tiene
  140 emoji en 26 archivos** (module tabs `🏠🧭🦾📐📈✓`, encabezados de tarjeta, etc.) — el mismo
  patrón que cap2. No existe ningún vocabulario de glifos SVG en cap1 para copiar. Además, el
  barrido de cap2 (`grep -rnP` del propio ticket) da **186 emoji en 39 de 53 archivos**, no las ~4
  líneas que el ticket marca VERIFICADO — es la iconografía de todo el capítulo (module tabs,
  encabezados de tarjetas de teoría, botones, chips clínicos), no un caso aislado en
  `BiomechSummaryCanvas.tsx`. Presentado al usuario con tres opciones (alcance mínimo de las 4
  líneas VERIFICADAS / vocabulario nuevo si el usuario lo define / posponer). **Decisión: pausar
  `L3-01` sin tocar código y seguir con `L3-02`.** Sigue abierto — retomar cuando haya un criterio
  de iconografía definido; candidato real a ticket transversal (cap1 + cap2, ~326 emoji en total).
  *(Detectado al abrir `L3-01`.)*
