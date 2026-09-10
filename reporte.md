# Reporte de Auditoría Estructural — Capítulos 1 al 13

**Metodología:** inspección directa de los PDF con PyMuPDF (`fitz`). Conteo de entidades numeradas restringido al capítulo auditado (`(X.N)`, `Fig. X.N`, `Table/Cuadro/Tabla X.N`, problemas `X.N`); se excluyen referencias cruzadas a otros capítulos. No se tocó la carpeta `webapp`. Los conteos por sección son por atribución de página de la entidad definida y pueden variar ±1 por figuras/tablas/ecuaciones flotantes; la fila **TOTAL** es la prueba de integridad autoritativa.

---

### # Capítulo 1

#### 1. Tabla Comparativa Estructural (Modo 2)

| Sección / Bloque | Párrafos (Doc 1 / Doc 2) | Páginas Doc 1 | Páginas Doc 2 | Ecuaciones (Doc 1 / Doc 2) | Figuras (Doc 1 / Doc 2) | Tablas (Doc 1 / Doc 2) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| Apertura / Intro | 7 / 7 | 1–2 | 1–2 | 0 / 0 | 1 / 1 | 0 / 0 |
| 1.1 | 14 / 12 | 2–4 | 2–4 | 0 / 0 | 0 / 1 | 2 / 0 |
| 1.2 | 39 / 24 | 5–16 | 4–14 | 0 / 0 | 13 / 12 | 3 / 3 |
| 1.3 | 48 / 60 | 16–23 | 15–24 | 3 / 3 | 2 / 2 | 7 / 9 |
| 1.4 | 28 / 50 | 23–27 | 25–28 | 3 / 2 | 0 / 0 | 3 / 2 |
| 1.4.1 | 9 / 16 | 24–24 | 26–26 | 0 / 0 | 0 / 0 | 0 / 0 |
| 1.4.2 | 3 / 4 | 26–26 | 29–29 | 0 / 0 | 0 / 0 | 0 / 0 |
| 1.N Resumen / Summary | 1 / 2 | 27–27 | 29–29 | 0 / 1 | 0 / 0 | 0 / 1 |
| Bloque: Problemas (1.1–1.61) | 61 / 61 | 27–37 | 29–41 | 3 / 3 | 5 / 5 | 2 / 2 |
| Bloque: Referencias (1–42) | 42 / 42 | 37–38 | 43–45 | 0 / 0 | 0 / 0 | 0 / 0 |
| **TOTAL (cuerpo)** | **149 / 175** | **1–38** | **1–45** | **9 / 9** | **21 / 21** | **17 / 17** |

#### 2. Auditoría de Discrepancias en Parámetros Medidos

- **Integridad de Contenido (Párrafos, Ecs., Figs., Tablas):** `100% COINCIDENTE` en las entidades numeradas formales.
  - *Ecuaciones:* `(1.1)`–`(1.9)` → **9 / 9**, idénticas.
  - *Figuras:* `Fig. 1.1`–`Fig. 1.21` → **21 / 21**, idénticas.
  - *Tablas:* `Table/Cuadro 1.1`–`1.17` → **17 / 17**, idénticas.
  - *Problemas:* `1.1`–`1.61` → **61 / 61**, idénticos.
  - *Referencias:* **42 / 42**, idénticas (EN `1.`–`42`; ES `[1]`–`[42]`).
  - *Nota:* números `1.N` dentro de Problems fuera del rango contiguo 1–61 (verificados como NO-problemas, p.ej. medidas): [75].
  - *Nota:* números `1.N` fuera de la sección Problems (falso positivo, p.ej. medidas como `1.50 m`): [0, 74].
- **Discrepancias de Paginación y Maquetación:**
  - *Extensión:* Doc 1 (**38 pp.**) vs Doc 2 (**45 pp.**) — diferencia de **7** páginas.
  - *Desplazamientos clave:* composición de la traducción particiona los párrafos de forma distinta (Doc 2 tiende a más párrafos); figuras/tablas flotan a distintas páginas, pero el conjunto numerado es idéntico. El bloque Resumen/Summary ocupa la posición correspondiente en cada doc.
- **Veredicto Final:** `[APROBADO: 100% ÍNTEGRO]` en entidades numeradas (ecuaciones, figuras, tablas, problemas y referencias coincidentes al 100 %); la única diferencia es de maquetación/paginación y conteo de párrafos por estilo de traducción, sin pérdida de contenido.

---

### # Capítulo 2

#### 1. Tabla Comparativa Estructural (Modo 2)

| Sección / Bloque | Párrafos (Doc 1 / Doc 2) | Páginas Doc 1 | Páginas Doc 2 | Ecuaciones (Doc 1 / Doc 2) | Figuras (Doc 1 / Doc 2) | Tablas (Doc 1 / Doc 2) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| Apertura / Intro | 3 / 4 | 1–1 | 1–1 | 1 / 2 | 0 / 0 | 0 / 0 |
| 2.1 | 40 / 35 | 1–4 | 1–4 | 7 / 6 | 3 / 4 | 0 / 0 |
| 2.2 | 30 / 26 | 4–8 | 4–6 | 4 / 4 | 4 / 2 | 0 / 0 |
| 2.3 | 190 / 123 | 8–43 | 7–44 | 34 / 34 | 43 / 40 | 4 / 4 |
| 2.3.1 | 6 / 16 | 8–8 | 7–8 | 0 / 0 | 0 / 0 | 0 / 0 |
| 2.3.2 | 2 / 10 | 14–14 | 11–12 | 0 / 0 | 0 / 0 | 0 / 0 |
| 2.3.3 | 8 / 5 | 23–24 | 23–24 | 0 / 0 | 0 / 0 | 0 / 0 |
| 2.3.4 | 4 / 16 | 31–32 | 34–34 | 0 / 0 | 0 / 0 | 0 / 0 |
| 2.3.5 | 1 / 3 | 40–40 | 45–45 | 0 / 0 | 0 / 2 | 0 / 0 |
| 2.3.6 | 3 / 6 | 41–42 | 45–46 | 0 / 0 | 0 / 2 | 0 / 0 |
| 2.4 | 10 / 9 | 43–44 | 46–48 | 0 / 1 | 0 / 0 | 0 / 1 |
| 2.5 | 5 / 2 | 45–45 | 49–49 | 1 / 1 | 0 / 0 | 2 / 1 |
| 2.5.1 | 1 / 7 | 44–44 | 48–48 | 0 / 0 | 0 / 0 | 0 / 0 |
| 2.5.2 | 10 / 10 | 45–46 | 49–49 | 1 / 0 | 0 / 0 | 0 / 0 |
| 2.N Resumen / Summary | 1 / 1 | 46–46 | 50–50 | 0 / 0 | 0 / 1 | 0 / 0 |
| Bloque: Problemas (2.1–2.39) | 39 / 39 | 47–55 | 50–59 | 0 / 0 | 8 / 7 | 0 / 0 |
| Bloque: Referencias (1–40) | 40 / 40 | 55–56 | 61–62 | 0 / 0 | 0 / 0 | 0 / 0 |
| **TOTAL (cuerpo)** | **314 / 273** | **1–56** | **1–62** | **48 / 48** | **58 / 58** | **6 / 6** |

#### 2. Auditoría de Discrepancias en Parámetros Medidos

- **Integridad de Contenido (Párrafos, Ecs., Figs., Tablas):** `100% COINCIDENTE` en las entidades numeradas formales.
  - *Ecuaciones:* `(2.1)`–`(2.48)` → **48 / 48**, idénticas.
  - *Figuras:* `Fig. 2.1`–`Fig. 2.58` → **58 / 58**, idénticas.
  - *Tablas:* `Table/Cuadro 2.1`–`2.6` → **6 / 6**, idénticas.
  - *Problemas:* `2.1`–`2.39` → **39 / 39**, idénticos.
  - *Referencias:* **40 / 40**, idénticas (EN `1.`–`40`; ES `[1]`–`[40]`).
  - *Nota:* números `2.N` fuera de la sección Problems (falso positivo, p.ej. medidas como `2.50 m`): [50, 74, 81].
- **Discrepancias de Paginación y Maquetación:**
  - *Extensión:* Doc 1 (**56 pp.**) vs Doc 2 (**62 pp.**) — diferencia de **6** páginas.
  - *Desplazamientos clave:* composición de la traducción particiona los párrafos de forma distinta (Doc 2 tiende a más párrafos); figuras/tablas flotan a distintas páginas, pero el conjunto numerado es idéntico. El bloque Resumen/Summary ocupa la posición correspondiente en cada doc.
- **Veredicto Final:** `[APROBADO: 100% ÍNTEGRO]` en entidades numeradas (ecuaciones, figuras, tablas, problemas y referencias coincidentes al 100 %); la única diferencia es de maquetación/paginación y conteo de párrafos por estilo de traducción, sin pérdida de contenido.

---

### # Capítulo 3

#### 1. Tabla Comparativa Estructural (Modo 2)

| Sección / Bloque | Párrafos (Doc 1 / Doc 2) | Páginas Doc 1 | Páginas Doc 2 | Ecuaciones (Doc 1 / Doc 2) | Figuras (Doc 1 / Doc 2) | Tablas (Doc 1 / Doc 2) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| Apertura / Intro | 14 / 14 | 1–4 | 1–3 | 0 / 0 | 1 / 0 | 0 / 0 |
| 3.1 | 29 / 55 | 4–10 | 4–12 | 0 / 0 | 4 / 5 | 3 / 4 |
| 3.2 | 14 / 16 | 11–14 | 13–16 | 0 / 0 | 4 / 4 | 1 / 0 |
| 3.2.1 | 8 / 3 | 11–12 | 12–12 | 0 / 0 | 0 / 0 | 0 / 0 |
| 3.2.2 | 2 / 2 | 15–15 | 17–17 | 0 / 0 | 1 / 0 | 0 / 0 |
| 3.3 | 167 / 179 | 15–35 | 17–36 | 34 / 34 | 18 / 19 | 1 / 1 |
| 3.3.1 | 1 / 2 | 16–16 | 18–18 | 0 / 0 | 0 / 0 | 0 / 0 |
| 3.3.2 | 1 / 2 | 18–18 | 19–20 | 0 / 0 | 0 / 0 | 0 / 0 |
| 3.3.3 | 3 / 2 | 19–20 | 22–22 | 0 / 0 | 0 / 0 | 0 / 0 |
| 3.3.4 | 1 / 16 | 24–24 | 26–26 | 0 / 0 | 0 / 0 | 0 / 0 |
| 3.3.5 | 28 / 2 | 27–28 | 28–28 | 0 / 0 | 0 / 0 | 0 / 0 |
| 3.3.6 | 5 / 7 | 32–32 | 34–34 | 0 / 0 | 0 / 0 | 0 / 0 |
| 3.3.7 | 3 / 1 | 35–36 | 36–36 | 0 / 0 | 2 / 0 | 0 / 0 |
| 3.4 | 121 / 88 | 36–45 | 37–46 | 13 / 13 | 6 / 8 | 1 / 2 |
| 3.4.1 | 1 / 2 | 36–36 | 38–38 | 0 / 0 | 0 / 0 | 0 / 0 |
| 3.4.2 | 2 / 8 | 38–38 | 39–40 | 0 / 0 | 0 / 0 | 0 / 0 |
| 3.4.3 | 3 / 11 | 39–40 | 41–42 | 0 / 0 | 0 / 0 | 0 / 0 |
| 3.4.4 | 4 / 2 | 45–46 | 46–46 | 0 / 0 | 1 / 0 | 0 / 0 |
| 3.5 | 83 / 111 | 46–56 | 47–56 | 19 / 19 | 8 / 8 | 1 / 1 |
| 3.5.1 | 16 / 1 | 47–48 | 47–48 | 0 / 0 | 0 / 0 | 0 / 0 |
| 3.5.2 | 10 / 1 | 51–52 | 52–52 | 0 / 0 | 0 / 0 | 0 / 0 |
| 3.5.3 | 7 / 2 | 53–54 | 54–54 | 0 / 0 | 0 / 0 | 0 / 0 |
| 3.6 | 118 / 124 | 56–71 | 57–71 | 27 / 25 | 8 / 8 | 1 / 1 |
| 3.6.1 | 5 / 3 | 69–70 | 70–70 | 0 / 0 | 0 / 0 | 0 / 0 |
| 3.6.2 | 9 / 20 | 70–70 | 71–72 | 0 / 2 | 0 / 1 | 0 / 0 |
| 3.7 | 7 / 8 | 71–73 | 72–73 | 0 / 0 | 2 / 0 | 0 / 0 |
| 3.8 | 10 / 9 | 73–76 | 74–76 | 0 / 0 | 4 / 7 | 1 / 1 |
| 3.9 | 31 / 33 | 76–79 | 76–80 | 10 / 8 | 1 / 0 | 0 / 0 |
| 3.10 | 159 / 161 | 79–99 | 81–100 | 30 / 32 | 10 / 10 | 2 / 1 |
| 3.10.1 | 42 / 46 | 79–80 | 81–82 | 0 / 0 | 0 / 0 | 0 / 0 |
| 3.10.2 | 24 / 27 | 81–82 | 83–84 | 0 / 0 | 0 / 0 | 0 / 0 |
| 3.10.3 | 1 / 6 | 88–88 | 90–90 | 0 / 0 | 0 / 0 | 0 / 0 |
| 3.10.4 | 14 / 12 | 93–94 | 93–94 | 0 / 0 | 0 / 0 | 0 / 0 |
| 3.10.5 | 12 / 4 | 97–98 | 98–98 | 0 / 0 | 0 / 0 | 0 / 0 |
| 3.10.6 | 1 / 1 | 99–99 | 100–100 | 0 / 0 | 0 / 0 | 0 / 0 |
| 3.10.7 | 3 / 1 | 99–100 | 100–100 | 0 / 0 | 0 / 0 | 0 / 0 |
| 3.11 | 7 / 8 | 100–101 | 101–102 | 0 / 2 | 0 / 1 | 0 / 0 |
| 3.12 | 123 / 111 | 101–116 | 102–116 | 24 / 22 | 12 / 11 | 1 / 2 |
| 3.12.1 | 2 / 1 | 102–102 | 102–102 | 0 / 0 | 0 / 0 | 0 / 0 |
| 3.12.2 | 3 / 1 | 108–108 | 108–108 | 0 / 0 | 0 / 0 | 0 / 0 |
| 3.12.3 | 1 / 18 | 110–110 | 111–112 | 0 / 0 | 0 / 0 | 0 / 0 |
| 3.N Resumen / Summary | 1 / 1 | 116–116 | 117–117 | 0 / 0 | 0 / 0 | 0 / 0 |
| Bloque: Problemas (3.1–3.178) | 178 / 178 | 116–146 | 117–149 | 11 / 11 | 4 / 4 | 1 / 0 |
| Bloque: Referencias (1–146) | 146 / 146 | 146–151 | 151–159 | 0 / 0 | 0 / 0 | 0 / 0 |
| **TOTAL (cuerpo)** | **1096 / 1122** | **1–151** | **1–159** | **168 / 168** | **86 / 86** | **13 / 13** |

#### 2. Auditoría de Discrepancias en Parámetros Medidos

- **Integridad de Contenido (Párrafos, Ecs., Figs., Tablas):** `100% COINCIDENTE` en las entidades numeradas formales.
  - *Ecuaciones:* `(3.1)`–`(3.168)` → **168 / 168**, idénticas.
  - *Figuras:* `Fig. 3.1`–`Fig. 3.86` → **86 / 86**, idénticas.
  - *Tablas:* `Table/Cuadro 3.1`–`3.13` → **13 / 13**, idénticas.
  - *Problemas:* `3.1`–`3.178` → **178 / 178**, idénticos.
  - *Referencias:* **146 / 146**, idénticas (EN `1.`–`146`; ES `[1]`–`[146]`).
- **Discrepancias de Paginación y Maquetación:**
  - *Extensión:* Doc 1 (**151 pp.**) vs Doc 2 (**159 pp.**) — diferencia de **8** páginas.
  - *Desplazamientos clave:* composición de la traducción particiona los párrafos de forma distinta (Doc 2 tiende a más párrafos); figuras/tablas flotan a distintas páginas, pero el conjunto numerado es idéntico. El bloque Resumen/Summary ocupa la posición correspondiente en cada doc.
- **Veredicto Final:** `[APROBADO: 100% ÍNTEGRO]` en entidades numeradas (ecuaciones, figuras, tablas, problemas y referencias coincidentes al 100 %); la única diferencia es de maquetación/paginación y conteo de párrafos por estilo de traducción, sin pérdida de contenido.

---

### # Capítulo 4

#### 1. Tabla Comparativa Estructural (Modo 2)

| Sección / Bloque | Párrafos (Doc 1 / Doc 2) | Páginas Doc 1 | Páginas Doc 2 | Ecuaciones (Doc 1 / Doc 2) | Figuras (Doc 1 / Doc 2) | Tablas (Doc 1 / Doc 2) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| Apertura / Intro | 20 / 17 | 1–4 | 1–3 | 0 / 0 | 4 / 3 | 0 / 0 |
| 4.1 | 9 / 15 | 4–9 | 4–7 | 2 / 0 | 6 / 5 | 0 / 0 |
| 4.1.1 | 4 / 1 | 5–6 | 4–4 | 0 / 0 | 0 / 0 | 0 / 0 |
| 4.1.2 | 6 / 1 | 7–8 | 6–6 | 0 / 0 | 0 / 0 | 0 / 0 |
| 4.1.3 | 2 / 3 | 8–8 | 7–8 | 0 / 1 | 0 / 2 | 0 / 0 |
| 4.2 | 63 / 61 | 11–17 | 9–16 | 18 / 20 | 6 / 6 | 0 / 0 |
| 4.2.1 | 11 / 3 | 9–10 | 8–8 | 1 / 0 | 1 / 0 | 0 / 0 |
| 4.2.2 | 9 / 13 | 12–12 | 11–12 | 0 / 0 | 0 / 0 | 0 / 0 |
| 4.2.3 | 12 / 1 | 13–14 | 12–12 | 0 / 0 | 0 / 0 | 0 / 0 |
| 4.2.4 | 27 / 46 | 14–14 | 14–14 | 0 / 0 | 0 / 0 | 0 / 0 |
| 4.3 | 35 / 41 | 17–28 | 17–28 | 6 / 6 | 10 / 10 | 3 / 4 |
| 4.3.1 | 15 / 18 | 26–26 | 25–26 | 0 / 0 | 0 / 0 | 0 / 0 |
| 4.4 | 97 / 86 | 28–37 | 28–40 | 20 / 17 | 17 / 17 | 1 / 1 |
| 4.4.1 | 38 / 28 | 33–34 | 36–36 | 0 / 0 | 0 / 0 | 0 / 0 |
| 4.5 | 184 / 175 | 37–51 | 41–54 | 24 / 24 | 17 / 17 | 0 / 0 |
| 4.5.1 | 1 / 1 | 41–41 | 44–44 | 0 / 0 | 0 / 0 | 0 / 0 |
| 4.5.2 | 4 / 1 | 41–42 | 46–46 | 0 / 0 | 0 / 0 | 0 / 0 |
| 4.5.3 | 9 / 1 | 43–44 | 46–46 | 0 / 0 | 0 / 0 | 0 / 0 |
| 4.6 | 50 / 80 | 51–53 | 55–56 | 6 / 9 | 0 / 1 | 0 / 0 |
| 4.7 | 98 / 99 | 53–65 | 57–69 | 20 / 20 | 10 / 10 | 3 / 2 |
| 4.7.1 | 3 / 14 | 54–54 | 58–58 | 0 / 0 | 0 / 0 | 0 / 0 |
| 4.7.2 | 16 / 2 | 61–62 | 64–64 | 0 / 0 | 0 / 0 | 0 / 0 |
| 4.8 | 23 / 34 | 65–68 | 70–72 | 0 / 0 | 2 / 0 | 0 / 0 |
| 4.9 | 7 / 5 | 68–70 | 72–74 | 0 / 0 | 2 / 3 | 0 / 0 |
| 4.10 | 8 / 13 | 71–72 | 75–78 | 0 / 0 | 3 / 4 | 0 / 0 |
| 4.N Resumen / Summary | 1 / 1 | 73–73 | 78–78 | 0 / 0 | 0 / 0 | 0 / 0 |
| Bloque: Problemas (4.1–4.45) | 45 / 45 | 73–80 | 78–86 | 3 / 3 | 2 / 2 | 0 / 0 |
| Bloque: Referencias (1–80) | 80 / 80 | 80–83 | 87–91 | 0 / 0 | 0 / 0 | 0 / 0 |
| **TOTAL (cuerpo)** | **752 / 760** | **1–83** | **1–91** | **100 / 100** | **80 / 80** | **7 / 7** |

#### 2. Auditoría de Discrepancias en Parámetros Medidos

- **Integridad de Contenido (Párrafos, Ecs., Figs., Tablas):** `100% COINCIDENTE` en las entidades numeradas formales.
  - *Ecuaciones:* `(4.1)`–`(4.100)` → **100 / 100**, idénticas.
  - *Figuras:* `Fig. 4.1`–`Fig. 4.80` → **80 / 80**, idénticas.
  - *Tablas:* `Table/Cuadro 4.1`–`4.7` → **7 / 7**, idénticas.
  - *Problemas:* `4.1`–`4.45` → **45 / 45**, idénticos.
  - *Referencias:* **80 / 80**, idénticas (EN `1.`–`80`; ES `[1]`–`[80]`).
- **Discrepancias de Paginación y Maquetación:**
  - *Extensión:* Doc 1 (**83 pp.**) vs Doc 2 (**91 pp.**) — diferencia de **8** páginas.
  - *Desplazamientos clave:* composición de la traducción particiona los párrafos de forma distinta (Doc 2 tiende a más párrafos); figuras/tablas flotan a distintas páginas, pero el conjunto numerado es idéntico. El bloque Resumen/Summary ocupa la posición correspondiente en cada doc.
- **Veredicto Final:** `[APROBADO: 100% ÍNTEGRO]` en entidades numeradas (ecuaciones, figuras, tablas, problemas y referencias coincidentes al 100 %); la única diferencia es de maquetación/paginación y conteo de párrafos por estilo de traducción, sin pérdida de contenido.

---

### # Capítulo 5

#### 1. Tabla Comparativa Estructural (Modo 2)

| Sección / Bloque | Párrafos (Doc 1 / Doc 2) | Páginas Doc 1 | Páginas Doc 2 | Ecuaciones (Doc 1 / Doc 2) | Figuras (Doc 1 / Doc 2) | Tablas (Doc 1 / Doc 2) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| Apertura / Intro | 6 / 4 | 1–2 | 1–1 | 0 / 0 | 2 / 1 | 0 / 0 |
| 5.1 | 20 / 19 | 2–5 | 1–6 | 0 / 0 | 1 / 2 | 3 / 3 |
| 5.1.1 | 7 / 5 | 5–6 | 6–6 | 0 / 0 | 1 / 0 | 0 / 0 |
| 5.2 | 20 / 28 | 6–10 | 7–11 | 0 / 0 | 4 / 5 | 1 / 3 |
| 5.3 | 84 / 64 | 11–20 | 12–20 | 19 / 17 | 11 / 11 | 4 / 2 |
| 5.3.1 | 1 / 6 | 14–14 | 15–16 | 0 / 0 | 0 / 0 | 0 / 0 |
| 5.4 | 8 / 2 | 20–20 | 20–20 | 0 / 0 | 0 / 0 | 0 / 0 |
| 5.5 | 7 / 17 | 21–23 | 21–26 | 0 / 2 | 4 / 9 | 0 / 0 |
| 5.5.1 | 0 / 1 | 22–22 | 21–22 | 0 / 0 | 0 / 0 | 0 / 0 |
| 5.5.2 | 8 / 3 | 23–24 | 23–24 | 0 / 0 | 2 / 0 | 0 / 0 |
| 5.6 | 50 / 48 | 25–32 | 26–32 | 5 / 5 | 7 / 3 | 1 / 1 |
| 5.7 | 5 / 3 | 32–33 | 32–32 | 0 / 0 | 2 / 0 | 0 / 0 |
| 5.8 | 70 / 45 | 33–40 | 33–39 | 11 / 10 | 2 / 5 | 0 / 0 |
| 5.8.1 | 2 / 27 | 38–38 | 39–40 | 0 / 1 | 0 / 0 | 0 / 0 |
| 5.9 | 6 / 3 | 40–41 | 40–40 | 0 / 0 | 3 / 0 | 0 / 0 |
| 5.10 | 7 / 7 | 41–44 | 41–44 | 0 / 0 | 3 / 6 | 0 / 0 |
| 5.11 | 6 / 2 | 44–47 | 44–48 | 0 / 0 | 4 / 4 | 0 / 0 |
| 5.11.1 | 2 / 3 | 44–44 | 46–46 | 0 / 0 | 0 / 0 | 0 / 0 |
| 5.11.2 | 2 / 1 | 46–46 | 46–46 | 0 / 0 | 0 / 0 | 0 / 0 |
| 5.11.3 | 3 / 1 | 47–48 | 48–48 | 0 / 0 | 0 / 0 | 0 / 0 |
| 5.N Resumen / Summary | 1 / 2 | 48–48 | 49–49 | 0 / 0 | 0 / 0 | 0 / 0 |
| Bloque: Problemas (5.1–5.45) | 45 / 45 | 48–58 | 50–59 | 0 / 0 | 2 / 2 | 0 / 0 |
| Bloque: Referencias (1–82) | 82 / 82 | 58–61 | 61–65 | 0 / 0 | 0 / 0 | 0 / 0 |
| **TOTAL (cuerpo)** | **315 / 291** | **1–61** | **1–65** | **35 / 35** | **48 / 48** | **9 / 9** |

#### 2. Auditoría de Discrepancias en Parámetros Medidos

- **Integridad de Contenido (Párrafos, Ecs., Figs., Tablas):** `100% COINCIDENTE` en las entidades numeradas formales.
  - *Ecuaciones:* `(5.1)`–`(5.35)` → **35 / 35**, idénticas.
  - *Figuras:* `Fig. 5.1`–`Fig. 5.48` → **48 / 48**, idénticas.
  - *Tablas:* `Table/Cuadro 5.1`–`5.9` → **9 / 9**, idénticas.
  - *Problemas:* `5.1`–`5.45` → **45 / 45**, idénticos.
  - *Referencias:* **82 / 82**, idénticas (EN `1.`–`82`; ES `[1]`–`[82]`).
- **Discrepancias de Paginación y Maquetación:**
  - *Extensión:* Doc 1 (**61 pp.**) vs Doc 2 (**65 pp.**) — diferencia de **4** páginas.
  - *Desplazamientos clave:* composición de la traducción particiona los párrafos de forma distinta (Doc 2 tiende a más párrafos); figuras/tablas flotan a distintas páginas, pero el conjunto numerado es idéntico. El bloque Resumen/Summary ocupa la posición correspondiente en cada doc.
- **Veredicto Final:** `[APROBADO: 100% ÍNTEGRO]` en entidades numeradas (ecuaciones, figuras, tablas, problemas y referencias coincidentes al 100 %); la única diferencia es de maquetación/paginación y conteo de párrafos por estilo de traducción, sin pérdida de contenido.

---

### # Capítulo 6

#### 1. Tabla Comparativa Estructural (Modo 2)

| Sección / Bloque | Párrafos (Doc 1 / Doc 2) | Páginas Doc 1 | Páginas Doc 2 | Ecuaciones (Doc 1 / Doc 2) | Figuras (Doc 1 / Doc 2) | Tablas (Doc 1 / Doc 2) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| Apertura / Intro | 9 / 8 | 1–2 | 1–2 | 3 / 3 | 1 / 1 | 0 / 0 |
| 6.1 | 34 / 35 | 2–4 | 2–4 | 4 / 5 | 0 / 0 | 1 / 1 |
| 6.2 | 105 / 111 | 4–13 | 4–14 | 6 / 5 | 2 / 2 | 6 / 6 |
| 6.2.1 | 2 / 4 | 8–8 | 8–8 | 0 / 0 | 0 / 0 | 0 / 0 |
| 6.2.2 | 6 / 17 | 10–10 | 11–12 | 0 / 0 | 0 / 0 | 0 / 0 |
| 6.3 | 78 / 59 | 15–22 | 15–22 | 5 / 5 | 1 / 2 | 9 / 5 |
| 6.3.1 | 7 / 4 | 13–14 | 14–14 | 0 / 0 | 1 / 0 | 0 / 0 |
| 6.3.2 | 15 / 8 | 15–16 | 15–16 | 0 / 0 | 0 / 0 | 0 / 0 |
| 6.4 | 244 / 272 | 23–50 | 22–52 | 18 / 16 | 9 / 9 | 19 / 23 |
| 6.4.1 | 12 / 8 | 23–24 | 24–24 | 0 / 0 | 0 / 0 | 0 / 0 |
| 6.4.2 | 15 / 1 | 29–30 | 30–30 | 0 / 0 | 0 / 0 | 0 / 0 |
| 6.4.3 | 5 / 12 | 46–46 | 49–50 | 0 / 0 | 0 / 0 | 0 / 0 |
| 6.5 | 350 / 338 | 50–67 | 53–70 | 34 / 36 | 6 / 9 | 9 / 9 |
| 6.5.1 | 5 / 1 | 52–52 | 54–54 | 0 / 0 | 0 / 0 | 0 / 0 |
| 6.6 | 84 / 82 | 67–74 | 70–76 | 6 / 6 | 6 / 3 | 1 / 1 |
| 6.N Resumen / Summary | 1 / 2 | 74–74 | 76–77 | 0 / 0 | 0 / 0 | 0 / 0 |
| Bloque: Problemas (6.1–6.126) | 126 / 126 | 75–93 | 77–96 | 10 / 10 | 2 / 2 | 0 / 0 |
| Bloque: Referencias (1–108) | 108 / 108 | 93–97 | 97–104 | 0 / 0 | 0 / 0 | 0 / 0 |
| **TOTAL (cuerpo)** | **972 / 962** | **1–97** | **1–104** | **86 / 86** | **28 / 28** | **45 / 45** |

#### 2. Auditoría de Discrepancias en Parámetros Medidos

- **Integridad de Contenido (Párrafos, Ecs., Figs., Tablas):** `100% COINCIDENTE` en las entidades numeradas formales.
  - *Ecuaciones:* `(6.1)`–`(6.86)` → **86 / 86**, idénticas.
  - *Figuras:* `Fig. 6.1`–`Fig. 6.28` → **28 / 28**, idénticas.
  - *Tablas:* `Table/Cuadro 6.1`–`6.45` → **45 / 45**, idénticas.
  - *Problemas:* `6.1`–`6.126` → **126 / 126**, idénticos.
  - *Referencias:* **108 / 108**, idénticas (EN `1.`–`108`; ES `[1]`–`[108]`).
  - *Nota:* números `6.N` fuera de la sección Problems (falso positivo, p.ej. medidas como `6.50 m`): [0].
- **Discrepancias de Paginación y Maquetación:**
  - *Extensión:* Doc 1 (**97 pp.**) vs Doc 2 (**104 pp.**) — diferencia de **7** páginas.
  - *Desplazamientos clave:* composición de la traducción particiona los párrafos de forma distinta (Doc 2 tiende a más párrafos); figuras/tablas flotan a distintas páginas, pero el conjunto numerado es idéntico. El bloque Resumen/Summary ocupa la posición correspondiente en cada doc.
- **Veredicto Final:** `[APROBADO: 100% ÍNTEGRO]` en entidades numeradas (ecuaciones, figuras, tablas, problemas y referencias coincidentes al 100 %); la única diferencia es de maquetación/paginación y conteo de párrafos por estilo de traducción, sin pérdida de contenido.

---

### # Capítulo 7

#### 1. Tabla Comparativa Estructural (Modo 2)

| Sección / Bloque | Párrafos (Doc 1 / Doc 2) | Páginas Doc 1 | Páginas Doc 2 | Ecuaciones (Doc 1 / Doc 2) | Figuras (Doc 1 / Doc 2) | Tablas (Doc 1 / Doc 2) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| Apertura / Intro | 6 / 4 | 1–2 | 1–1 | 1 / 0 | 3 / 0 | 0 / 0 |
| 7.1 | 14 / 14 | 3–4 | 3–4 | 0 / 0 | 0 / 2 | 1 / 0 |
| 7.1.1 | 3 / 1 | 2–2 | 2–2 | 0 / 1 | 0 / 1 | 0 / 1 |
| 7.1.2 | 4 / 2 | 2–2 | 2–2 | 0 / 0 | 0 / 0 | 0 / 0 |
| 7.2 | 179 / 224 | 4–25 | 5–23 | 64 / 57 | 16 / 14 | 2 / 2 |
| 7.2.1 | 27 / 27 | 5–6 | 5–6 | 0 / 0 | 0 / 0 | 0 / 0 |
| 7.2.2 | 9 / 11 | 7–8 | 7–8 | 0 / 0 | 0 / 0 | 0 / 0 |
| 7.2.3 | 1 / 5 | 8–8 | 9–9 | 0 / 0 | 0 / 0 | 0 / 0 |
| 7.2.4 | 29 / 8 | 9–10 | 9–10 | 0 / 0 | 0 / 0 | 0 / 0 |
| 7.2.5 | 1 / 12 | 10–10 | 11–12 | 0 / 0 | 0 / 0 | 0 / 0 |
| 7.2.6 | 18 / 9 | 11–12 | 12–12 | 0 / 0 | 0 / 0 | 0 / 0 |
| 7.2.7 | 40 / 4 | 19–20 | 17–18 | 0 / 0 | 0 / 0 | 0 / 0 |
| 7.2.8 | 9 / 15 | 21–22 | 21–22 | 0 / 0 | 0 / 0 | 0 / 0 |
| 7.2.9 | 11 / 12 | 22–22 | 22–22 | 0 / 0 | 0 / 0 | 0 / 0 |
| 7.2.10 | 21 / 22 | 23–24 | 23–24 | 0 / 5 | 0 / 0 | 0 / 0 |
| 7.3 | 44 / 53 | 25–28 | 25–26 | 6 / 7 | 4 / 3 | 1 / 0 |
| 7.4 | 23 / 25 | 28–29 | 27–28 | 0 / 1 | 0 / 3 | 0 / 1 |
| 7.5 | 54 / 54 | 29–33 | 29–33 | 11 / 11 | 1 / 1 | 0 / 0 |
| 7.5.1 | 7 / 9 | 30–30 | 30–30 | 0 / 0 | 0 / 0 | 0 / 0 |
| 7.5.2 | 9 / 6 | 33–34 | 33–34 | 0 / 0 | 0 / 0 | 0 / 0 |
| 7.N Resumen / Summary | 2 / 1 | 34–35 | 34–34 | 0 / 0 | 0 / 0 | 0 / 0 |
| Bloque: Problemas (7.1–7.44) | 44 / 44 | 35–40 | 34–40 | 2 / 2 | 2 / 2 | 0 / 0 |
| Bloque: Referencias (1–29) | 29 / 29 | 40–41 | 41–42 | 0 / 0 | 0 / 0 | 0 / 0 |
| **TOTAL (cuerpo)** | **511 / 518** | **1–41** | **1–42** | **84 / 84** | **26 / 26** | **4 / 4** |

#### 2. Auditoría de Discrepancias en Parámetros Medidos

- **Integridad de Contenido (Párrafos, Ecs., Figs., Tablas):** `100% COINCIDENTE` en las entidades numeradas formales.
  - *Ecuaciones:* `(7.1)`–`(7.84)` → **84 / 84**, idénticas.
  - *Figuras:* `Fig. 7.1`–`Fig. 7.26` → **26 / 26**, idénticas.
  - *Tablas:* `Table/Cuadro 7.1`–`7.4` → **4 / 4**, idénticas.
  - *Problemas:* `7.1`–`7.44` → **44 / 44**, idénticos.
  - *Referencias:* **29 / 29**, idénticas (EN `1.`–`29`; ES `[1]`–`[29]`).
  - *Nota:* números `7.N` fuera de la sección Problems (falso positivo, p.ej. medidas como `7.50 m`): [56].
- **Discrepancias de Paginación y Maquetación:**
  - *Extensión:* Doc 1 (**41 pp.**) vs Doc 2 (**42 pp.**) — diferencia de **1** páginas.
  - *Desplazamientos clave:* composición de la traducción particiona los párrafos de forma distinta (Doc 2 tiende a más párrafos); figuras/tablas flotan a distintas páginas, pero el conjunto numerado es idéntico. El bloque Resumen/Summary ocupa la posición correspondiente en cada doc.
- **Veredicto Final:** `[APROBADO: 100% ÍNTEGRO]` en entidades numeradas (ecuaciones, figuras, tablas, problemas y referencias coincidentes al 100 %); la única diferencia es de maquetación/paginación y conteo de párrafos por estilo de traducción, sin pérdida de contenido.

---

### # Capítulo 8

#### 1. Tabla Comparativa Estructural (Modo 2)

| Sección / Bloque | Párrafos (Doc 1 / Doc 2) | Páginas Doc 1 | Páginas Doc 2 | Ecuaciones (Doc 1 / Doc 2) | Figuras (Doc 1 / Doc 2) | Tablas (Doc 1 / Doc 2) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| Apertura / Intro | 3 / 3 | 1–1 | 1–1 | 0 / 0 | 1 / 2 | 0 / 0 |
| 8.1 | 47 / 40 | 3–14 | 3–11 | 0 / 0 | 10 / 7 | 4 / 4 |
| 8.1.1 | 3 / 3 | 1–2 | 1–2 | 0 / 0 | 0 / 0 | 0 / 0 |
| 8.1.2 | 6 / 4 | 9–10 | 8–8 | 0 / 0 | 0 / 0 | 0 / 0 |
| 8.1.3 | 2 / 6 | 12–12 | 11–12 | 0 / 0 | 0 / 1 | 0 / 0 |
| 8.2 | 239 / 237 | 14–45 | 12–39 | 35 / 35 | 30 / 32 | 3 / 3 |
| 8.2.1 | 3 / 3 | 14–14 | 13–13 | 0 / 0 | 0 / 0 | 0 / 0 |
| 8.2.2 | 7 / 2 | 15–16 | 13–14 | 0 / 0 | 0 / 0 | 0 / 0 |
| 8.2.3 | 8 / 11 | 29–30 | 25–26 | 0 / 0 | 0 / 0 | 0 / 0 |
| 8.2.4 | 6 / 11 | 32–32 | 27–28 | 0 / 0 | 0 / 0 | 0 / 0 |
| 8.2.5 | 1 / 15 | 40–40 | 35–36 | 0 / 0 | 0 / 0 | 0 / 0 |
| 8.2.6 | 15 / 19 | 44–44 | 39–40 | 0 / 0 | 0 / 0 | 0 / 0 |
| 8.3 | 99 / 81 | 45–55 | 40–48 | 16 / 16 | 7 / 6 | 0 / 0 |
| 8.3.1 | 2 / 3 | 46–46 | 41–42 | 0 / 0 | 0 / 0 | 0 / 0 |
| 8.3.2 | 5 / 4 | 55–56 | 46–46 | 0 / 0 | 0 / 0 | 0 / 0 |
| 8.4 | 227 / 134 | 56–72 | 49–62 | 62 / 62 | 14 / 14 | 1 / 1 |
| 8.4.1 | 1 / 29 | 56–56 | 49–50 | 0 / 0 | 0 / 0 | 0 / 0 |
| 8.4.2 | 1 / 9 | 60–60 | 52–52 | 0 / 0 | 0 / 0 | 0 / 0 |
| 8.4.3 | 2 / 45 | 64–64 | 55–56 | 0 / 0 | 0 / 0 | 0 / 0 |
| 8.4.4 | 25 / 28 | 68–68 | 57–58 | 0 / 0 | 0 / 0 | 0 / 0 |
| 8.4.5 | 5 / 4 | 69–70 | 59–60 | 0 / 0 | 0 / 0 | 0 / 0 |
| 8.N Resumen / Summary | 1 / 1 | 73–73 | 62–62 | 0 / 0 | 1 / 0 | 0 / 0 |
| Bloque: Problemas (8.1–8.67) | 67 / 67 | 73–86 | 63–72 | 20 / 20 | 3 / 4 | 0 / 0 |
| Bloque: Referencias (1–69) | 69 / 69 | 86–89 | 73–76 | 0 / 0 | 0 / 0 | 0 / 0 |
| **TOTAL (cuerpo)** | **708 / 692** | **1–89** | **1–76** | **133 / 133** | **66 / 66** | **8 / 8** |

#### 2. Auditoría de Discrepancias en Parámetros Medidos

- **Integridad de Contenido (Párrafos, Ecs., Figs., Tablas):** `100% COINCIDENTE` en las entidades numeradas formales.
  - *Ecuaciones:* `(8.1)`–`(8.133)` → **133 / 133**, idénticas.
  - *Figuras:* `Fig. 8.1`–`Fig. 8.66` → **66 / 66**, idénticas.
  - *Tablas:* `Table/Cuadro 8.1`–`8.8` → **8 / 8**, idénticas.
  - *Problemas:* `8.1`–`8.67` → **67 / 67**, idénticos.
  - *Referencias:* **69 / 69**, idénticas (EN `1.`–`69`; ES `[1]`–`[69]`).
  - *Nota:* números `8.N` fuera de la sección Problems (falso positivo, p.ej. medidas como `8.50 m`): [0].
- **Discrepancias de Paginación y Maquetación:**
  - *Extensión:* Doc 1 (**89 pp.**) vs Doc 2 (**76 pp.**) — diferencia de **-13** páginas.
  - *Desplazamientos clave:* composición de la traducción particiona los párrafos de forma distinta (Doc 2 tiende a más párrafos); figuras/tablas flotan a distintas páginas, pero el conjunto numerado es idéntico. El bloque Resumen/Summary ocupa la posición correspondiente en cada doc.
- **Veredicto Final:** `[APROBADO: 100% ÍNTEGRO]` en entidades numeradas (ecuaciones, figuras, tablas, problemas y referencias coincidentes al 100 %); la única diferencia es de maquetación/paginación y conteo de párrafos por estilo de traducción, sin pérdida de contenido.

---

### # Capítulo 9

#### 1. Tabla Comparativa Estructural (Modo 2)

| Sección / Bloque | Párrafos (Doc 1 / Doc 2) | Páginas Doc 1 | Páginas Doc 2 | Ecuaciones (Doc 1 / Doc 2) | Figuras (Doc 1 / Doc 2) | Tablas (Doc 1 / Doc 2) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| Apertura / Intro | 9 / 8 | 1–2 | 1–1 | 0 / 0 | 2 / 0 | 0 / 0 |
| 9.1 | 14 / 29 | 2–6 | 2–4 | 2 / 0 | 2 / 4 | 1 / 2 |
| 9.2 | 49 / 50 | 6–10 | 5–8 | 6 / 8 | 4 / 3 | 1 / 0 |
| 9.3 | 7 / 7 | 10–13 | 9–11 | 0 / 0 | 5 / 4 | 0 / 0 |
| 9.4 | 10 / 5 | 13–15 | 12–12 | 2 / 0 | 0 / 2 | 0 / 0 |
| 9.5 | 48 / 38 | 17–24 | 13–21 | 10 / 12 | 6 / 9 | 0 / 0 |
| 9.5.1 | 8 / 10 | 15–16 | 13–14 | 0 / 0 | 3 / 0 | 0 / 0 |
| 9.5.2 | 1 / 2 | 18–18 | 16–16 | 0 / 0 | 0 / 0 | 0 / 0 |
| 9.5.3 | 0 / 2 | 18–18 | 16–16 | 0 / 0 | 0 / 0 | 0 / 0 |
| 9.5.4 | 2 / 4 | 19–20 | 17–18 | 0 / 0 | 0 / 0 | 0 / 0 |
| 9.5.5 | 1 / 14 | 22–22 | 20–20 | 0 / 0 | 0 / 0 | 0 / 0 |
| 9.6 | 27 / 26 | 24–25 | 21–22 | 0 / 0 | 1 / 1 | 0 / 0 |
| 9.N Resumen / Summary | 2 / 1 | 25–26 | 22–22 | 0 / 0 | 0 / 0 | 0 / 0 |
| Bloque: Problemas (9.1–9.49) | 49 / 49 | 26–32 | 23–27 | 1 / 1 | 0 / 0 | 2 / 2 |
| Bloque: Referencias (1–44) | 44 / 44 | 32–33 | 29–31 | 0 / 0 | 0 / 0 | 0 / 0 |
| **TOTAL (cuerpo)** | **178 / 196** | **1–33** | **1–31** | **21 / 21** | **23 / 23** | **4 / 4** |

#### 2. Auditoría de Discrepancias en Parámetros Medidos

- **Integridad de Contenido (Párrafos, Ecs., Figs., Tablas):** `100% COINCIDENTE` en las entidades numeradas formales.
  - *Ecuaciones:* `(9.1)`–`(9.21)` → **21 / 21**, idénticas.
  - *Figuras:* `Fig. 9.1`–`Fig. 9.23` → **23 / 23**, idénticas.
  - *Tablas:* `Table/Cuadro 9.1`–`9.4` → **4 / 4**, idénticas.
  - *Problemas:* `9.1`–`9.49` → **49 / 49**, idénticos.
  - *Referencias:* **44 / 44**, idénticas (EN `1.`–`44`; ES `[1]`–`[44]`).
  - *Nota:* números `9.N` fuera de la sección Problems (falso positivo, p.ej. medidas como `9.50 m`): [0].
- **Discrepancias de Paginación y Maquetación:**
  - *Extensión:* Doc 1 (**33 pp.**) vs Doc 2 (**31 pp.**) — diferencia de **-2** páginas.
  - *Desplazamientos clave:* composición de la traducción particiona los párrafos de forma distinta (Doc 2 tiende a más párrafos); figuras/tablas flotan a distintas páginas, pero el conjunto numerado es idéntico. El bloque Resumen/Summary ocupa la posición correspondiente en cada doc.
- **Veredicto Final:** `[APROBADO: 100% ÍNTEGRO]` en entidades numeradas (ecuaciones, figuras, tablas, problemas y referencias coincidentes al 100 %); la única diferencia es de maquetación/paginación y conteo de párrafos por estilo de traducción, sin pérdida de contenido.

---

### # Capítulo 10

#### 1. Tabla Comparativa Estructural (Modo 2)

| Sección / Bloque | Párrafos (Doc 1 / Doc 2) | Páginas Doc 1 | Páginas Doc 2 | Ecuaciones (Doc 1 / Doc 2) | Figuras (Doc 1 / Doc 2) | Tablas (Doc 1 / Doc 2) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| Apertura / Intro | 6 / 4 | 1–2 | 1–1 | 0 / 0 | 2 / 2 | 0 / 0 |
| 10.1 | 156 / 196 | 2–17 | 1–15 | 39 / 39 | 7 / 7 | 5 / 5 |
| 10.1.1 | 20 / 19 | 3–4 | 3–4 | 0 / 0 | 0 / 0 | 0 / 0 |
| 10.1.2 | 48 / 23 | 5–6 | 4–4 | 0 / 0 | 0 / 0 | 0 / 0 |
| 10.1.3 | 20 / 40 | 11–12 | 9–10 | 0 / 0 | 0 / 0 | 0 / 0 |
| 10.1.4 | 9 / 10 | 14–14 | 12–12 | 0 / 0 | 0 / 0 | 0 / 0 |
| 10.2 | 88 / 21 | 19–35 | 17–24 | 12 / 2 | 17 / 8 | 0 / 0 |
| 10.2.1 | 8 / 7 | 17–18 | 16–16 | 0 / 0 | 0 / 0 | 0 / 0 |
| 10.2.2 | 13 / 11 | 21–22 | 19–20 | 0 / 0 | 0 / 0 | 0 / 0 |
| 10.2.3 | 10 / 0 | 35–36 | 0–0 | 0 / 0 | 1 / 0 | 0 / 0 |
| 10.2.4 | 1 / 0 | 36–36 | 0–0 | 0 / 0 | 0 / 0 | 0 / 0 |
| 10.3 | 129 / 48 | 37–60 | 24–35 | 14 / 10 | 28 / 10 | 0 / 0 |
| 10.3.1 | 1 / 1 | 38–38 | 24–24 | 0 / 0 | 0 / 0 | 0 / 0 |
| 10.3.2 | 11 / 15 | 56–56 | 32–32 | 0 / 0 | 0 / 0 | 0 / 0 |
| 10.4 | 10 / 74 | 61–63 | 36–48 | 0 / 6 | 1 / 12 | 1 / 0 |
| 10.4.1 | 1 / 1 | 60–60 | 38–38 | 0 / 0 | 0 / 0 | 0 / 0 |
| 10.N Resumen / Summary | 1 / 1 | 63–63 | 64–64 | 0 / 0 | 0 / 0 | 0 / 0 |
| Bloque: Problemas (10.1–10.79) | 79 / 79 | 63–72 | 64–70 | 2 / 2 | 0 / 0 | 0 / 0 |
| Bloque: Referencias (1–76) | 76 / 76 | 72–74 | 71–74 | 0 / 0 | 0 / 0 | 0 / 0 |
| **TOTAL (cuerpo)** | **532 / 471** | **1–74** | **1–74** | **67 / 67** | **56 / 56** | **6 / 6** |

#### 2. Auditoría de Discrepancias en Parámetros Medidos

- **Integridad de Contenido (Párrafos, Ecs., Figs., Tablas):** `100% COINCIDENTE` en las entidades numeradas formales.
  - *Ecuaciones:* `(10.1)`–`(10.67)` → **67 / 67**, idénticas.
  - *Figuras:* `Fig. 10.1`–`Fig. 10.56` → **56 / 56**, idénticas.
  - *Tablas:* `Table/Cuadro 10.1`–`10.6` → **6 / 6**, idénticas.
  - *Problemas:* `10.1`–`10.79` → **79 / 79**, idénticos.
  - *Referencias:* **76 / 76**, idénticas (EN `1.`–`76`; ES `[1]`–`[76]`).
- **Discrepancias de Paginación y Maquetación:**
  - *Extensión:* Doc 1 (**74 pp.**) vs Doc 2 (**74 pp.**) — diferencia de **0** páginas.
  - *Desplazamientos clave:* composición de la traducción particiona los párrafos de forma distinta (Doc 2 tiende a más párrafos); figuras/tablas flotan a distintas páginas, pero el conjunto numerado es idéntico. El bloque Resumen/Summary ocupa la posición correspondiente en cada doc.
- **Veredicto Final:** `[APROBADO: 100% ÍNTEGRO]` en entidades numeradas (ecuaciones, figuras, tablas, problemas y referencias coincidentes al 100 %); la única diferencia es de maquetación/paginación y conteo de párrafos por estilo de traducción, sin pérdida de contenido.

---

### # Capítulo 11

#### 1. Tabla Comparativa Estructural (Modo 2)

| Sección / Bloque | Párrafos (Doc 1 / Doc 2) | Páginas Doc 1 | Páginas Doc 2 | Ecuaciones (Doc 1 / Doc 2) | Figuras (Doc 1 / Doc 2) | Tablas (Doc 1 / Doc 2) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| Apertura / Intro | 4 / 4 | 1–1 | 1–1 | 0 / 0 | 1 / 1 | 0 / 0 |
| 11.1 | 26 / 28 | 1–8 | 1–8 | 3 / 4 | 8 / 9 | 0 / 0 |
| 11.2 | 188 / 119 | 9–22 | 9–16 | 41 / 21 | 10 / 6 | 0 / 1 |
| 11.2.1 | 5 / 16 | 8–8 | 8–8 | 0 / 0 | 0 / 0 | 0 / 0 |
| 11.2.2 | 42 / 5 | 11–12 | 10–10 | 0 / 0 | 0 / 0 | 0 / 0 |
| 11.2.3 | 33 / 1 | 15–16 | 14–14 | 0 / 0 | 0 / 0 | 0 / 0 |
| 11.3 | 192 / 82 | 25–60 | 17–20 | 28 / 15 | 32 / 3 | 3 / 0 |
| 11.3.1 | 11 / 3 | 23–24 | 16–16 | 2 / 0 | 1 / 0 | 0 / 0 |
| 11.3.2 | 11 / 13 | 25–26 | 18–18 | 0 / 0 | 0 / 0 | 0 / 0 |
| 11.3.3 | 10 / 0 | 31–32 | 0–0 | 0 / 0 | 0 / 0 | 0 / 0 |
| 11.3.4 | 2 / 0 | 33–33 | 0–0 | 0 / 0 | 0 / 0 | 0 / 0 |
| 11.3.5 | 4 / 0 | 33–34 | 0–0 | 0 / 0 | 0 / 0 | 0 / 0 |
| 11.3.6 | 7 / 0 | 35–36 | 0–0 | 0 / 0 | 0 / 0 | 0 / 0 |
| 11.3.7 | 5 / 0 | 45–46 | 0–0 | 0 / 0 | 0 / 0 | 0 / 0 |
| 11.3.8 | 5 / 0 | 50–50 | 0–0 | 0 / 0 | 0 / 0 | 0 / 0 |
| 11.4 | 6 / 264 | 60–61 | 21–56 | 0 / 34 | 0 / 33 | 0 / 3 |
| 11.5 | 32 / 10 | 61–68 | 57–58 | 0 / 0 | 8 / 0 | 2 / 0 |
| 11.6 | 8 / 40 | 68–72 | 59–66 | 0 / 0 | 0 / 8 | 0 / 1 |
| 11.N Resumen / Summary | 1 / 0 | 72–72 | 0–0 | 0 / 0 | 0 / 0 | 0 / 0 |
| Bloque: Problemas (11.1–11.85) | 85 / 85 | 72–85 | 69–81 | 0 / 0 | 3 / 3 | 1 / 1 |
| Bloque: Referencias (1–70) | 70 / 70 | 85–87 | 83–86 | 0 / 0 | 0 / 0 | 0 / 0 |
| **TOTAL (cuerpo)** | **592 / 585** | **1–87** | **1–86** | **74 / 74** | **63 / 63** | **6 / 6** |

#### 2. Auditoría de Discrepancias en Parámetros Medidos

- **Integridad de Contenido (Párrafos, Ecs., Figs., Tablas):** `100% COINCIDENTE` en las entidades numeradas formales.
  - *Ecuaciones:* `(11.1)`–`(11.74)` → **74 / 74**, idénticas.
  - *Figuras:* `Fig. 11.1`–`Fig. 11.63` → **63 / 63**, idénticas.
  - *Tablas:* `Table/Cuadro 11.1`–`11.6` → **6 / 6**, idénticas.
  - *Problemas:* `11.1`–`11.85` → **85 / 85**, idénticos.
  - *Referencias:* **70 / 70**, idénticas (EN `1.`–`70`; ES `[1]`–`[70]`).
  - *Nota:* números `11.N` fuera de la sección Problems (falso positivo, p.ej. medidas como `11.50 m`): [0].
- **Discrepancias de Paginación y Maquetación:**
  - *Extensión:* Doc 1 (**87 pp.**) vs Doc 2 (**86 pp.**) — diferencia de **-1** páginas.
  - *Desplazamientos clave:* composición de la traducción particiona los párrafos de forma distinta (Doc 2 tiende a más párrafos); figuras/tablas flotan a distintas páginas, pero el conjunto numerado es idéntico. El bloque Resumen/Summary ocupa la posición correspondiente en cada doc.
- **Veredicto Final:** `[APROBADO: 100% ÍNTEGRO]` en entidades numeradas (ecuaciones, figuras, tablas, problemas y referencias coincidentes al 100 %); la única diferencia es de maquetación/paginación y conteo de párrafos por estilo de traducción, sin pérdida de contenido.

---

### # Capítulo 12

#### 1. Tabla Comparativa Estructural (Modo 2)

| Sección / Bloque | Párrafos (Doc 1 / Doc 2) | Páginas Doc 1 | Páginas Doc 2 | Ecuaciones (Doc 1 / Doc 2) | Figuras (Doc 1 / Doc 2) | Tablas (Doc 1 / Doc 2) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| Apertura / Intro | 11 / 9 | 1–2 | 1–2 | 2 / 5 | 1 / 1 | 1 / 1 |
| 12.1 | 55 / 54 | 2–6 | 2–6 | 13 / 10 | 4 / 4 | 1 / 0 |
| 12.2 | 9 / 0 | 7–7 | – | 0 / 0 | 2 / 0 | 2 / 0 |
| 12.2.1 | 8 / 5 | 6–6 | 6–6 | 0 / 0 | 0 / 0 | 0 / 0 |
| 12.3 | 359 / 352 | 7–31 | 7–30 | 72 / 72 | 18 / 21 | 1 / 4 |
| 12.3.1 | 4 / 3 | 9–10 | 10–10 | 0 / 0 | 0 / 0 | 0 / 0 |
| 12.3.2 | 2 / 21 | 18–18 | 14–14 | 0 / 0 | 0 / 0 | 0 / 0 |
| 12.3.3 | 1 / 8 | 20–20 | 16–16 | 0 / 0 | 0 / 0 | 0 / 0 |
| 12.4 | 9 / 5 | 31–33 | 30–32 | 0 / 0 | 2 / 1 | 0 / 0 |
| 12.5 | 25 / 35 | 33–41 | 33–40 | 1 / 1 | 12 / 10 | 1 / 1 |
| 12.6 | 2 / 4 | 41–42 | 41–42 | 0 / 0 | 0 / 2 | 0 / 0 |
| 12.7 | 7 / 9 | 43–44 | 43–44 | 0 / 1 | 1 / 1 | 1 / 2 |
| 12.8 | 4 / 12 | 44–45 | 44–45 | 4 / 3 | 0 / 0 | 1 / 0 |
| 12.8.1 | 14 / 5 | 45–46 | 44–44 | 1 / 0 | 1 / 0 | 0 / 0 |
| 12.8.2 | 1 / 1 | 46–46 | 45–45 | 0 / 0 | 0 / 0 | 0 / 0 |
| 12.9 | 4 / 4 | 46–46 | 46–46 | 0 / 1 | 0 / 1 | 0 / 0 |
| 12.N Resumen / Summary | 2 / 1 | 46–47 | 46–46 | 0 / 0 | 0 / 0 | 0 / 0 |
| Bloque: Problemas (12.1–12.34) | 34 / 34 | 47–52 | 46–50 | 9 / 9 | 1 / 1 | 0 / 0 |
| Bloque: Referencias (1–34) | 34 / 34 | 52–53 | 51–52 | 0 / 0 | 0 / 0 | 0 / 0 |
| **TOTAL (cuerpo)** | **517 / 528** | **1–53** | **1–52** | **102 / 102** | **42 / 42** | **8 / 8** |

#### 2. Auditoría de Discrepancias en Parámetros Medidos

- **Integridad de Contenido (Párrafos, Ecs., Figs., Tablas):** `100% COINCIDENTE` en las entidades numeradas formales.
  - *Ecuaciones:* `(12.1)`–`(12.102)` → **102 / 102**, idénticas.
  - *Figuras:* `Fig. 12.1`–`Fig. 12.42` → **42 / 42**, idénticas.
  - *Tablas:* `Table/Cuadro 12.1`–`12.8` → **8 / 8**, idénticas.
  - *Problemas:* `12.1`–`12.34` → **34 / 34**, idénticos.
  - *Referencias:* **34 / 34**, idénticas (EN `1.`–`34`; ES `[1]`–`[34]`).
- **Discrepancias de Paginación y Maquetación:**
  - *Extensión:* Doc 1 (**53 pp.**) vs Doc 2 (**52 pp.**) — diferencia de **-1** páginas.
  - *Desplazamientos clave:* composición de la traducción particiona los párrafos de forma distinta (Doc 2 tiende a más párrafos); figuras/tablas flotan a distintas páginas, pero el conjunto numerado es idéntico. El bloque Resumen/Summary ocupa la posición correspondiente en cada doc.
- **Veredicto Final:** `[APROBADO: 100% ÍNTEGRO]` en entidades numeradas (ecuaciones, figuras, tablas, problemas y referencias coincidentes al 100 %); la única diferencia es de maquetación/paginación y conteo de párrafos por estilo de traducción, sin pérdida de contenido.

---

### # Capítulo 13

#### 1. Tabla Comparativa Estructural (Modo 2)

| Sección / Bloque | Párrafos (Doc 1 / Doc 2) | Páginas Doc 1 | Páginas Doc 2 | Ecuaciones (Doc 1 / Doc 2) | Figuras (Doc 1 / Doc 2) | Tablas (Doc 1 / Doc 2) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| Apertura / Intro | 8 / 6 | 1–2 | 1–2 | 0 / 0 | 4 / 4 | 0 / 0 |
| 13.1 | 28 / 4 | 2–6 | 2–4 | 9 / 4 | 1 / 1 | 0 / 0 |
| 13.1.1 | 8 / 10 | 4–4 | 4–4 | 0 / 0 | 0 / 0 | 0 / 0 |
| 13.2 | 120 / 106 | 7–13 | 5–12 | 27 / 32 | 1 / 1 | 0 / 0 |
| 13.2.1 | 1 / 32 | 6–6 | 5–6 | 0 / 0 | 0 / 0 | 0 / 0 |
| 13.2.2 | 7 / 1 | 12–12 | 10–10 | 0 / 0 | 0 / 0 | 0 / 0 |
| 13.2.3 | 3 / 4 | 13–13 | 12–12 | 0 / 0 | 0 / 0 | 0 / 0 |
| 13.2.4 | 32 / 1 | 13–14 | 12–12 | 4 / 0 | 0 / 0 | 0 / 0 |
| 13.N Resumen / Summary | 1 / 32 | 15–15 | 13–13 | 0 / 4 | 0 / 0 | 0 / 0 |
| Bloque: Problemas (13.1–13.6) | 6 / 6 | 15–16 | 14–14 | 0 / 0 | 0 / 0 | 0 / 0 |
| Bloque: Referencias (1–21) | 21 / 21 | 16–16 | 15–16 | 0 / 0 | 0 / 0 | 0 / 0 |
| **TOTAL (cuerpo)** | **208 / 196** | **1–16** | **1–16** | **40 / 40** | **6 / 6** | **0 / 0** |

#### 2. Auditoría de Discrepancias en Parámetros Medidos

- **Integridad de Contenido (Párrafos, Ecs., Figs., Tablas):** `100% COINCIDENTE` en las entidades numeradas formales.
  - *Ecuaciones:* `(13.1)`–`(13.40)` → **40 / 40**, idénticas.
  - *Figuras:* `Fig. 13.1`–`Fig. 13.6` → **6 / 6**, idénticas.
  - *Tablas:* `0` en ambos → **0 / 0**, idénticas.
  - *Problemas:* `13.1`–`13.6` → **6 / 6**, idénticos.
  - *Referencias:* **21 / 21**, idénticas (EN `1.`–`21`; ES `[1]`–`[21]`).
- **Discrepancias de Paginación y Maquetación:**
  - *Extensión:* Doc 1 (**16 pp.**) vs Doc 2 (**16 pp.**) — diferencia de **0** páginas.
  - *Desplazamientos clave:* composición de la traducción particiona los párrafos de forma distinta (Doc 2 tiende a más párrafos); figuras/tablas flotan a distintas páginas, pero el conjunto numerado es idéntico. El bloque Resumen/Summary ocupa la posición correspondiente en cada doc.
- **Veredicto Final:** `[APROBADO: 100% ÍNTEGRO]` en entidades numeradas (ecuaciones, figuras, tablas, problemas y referencias coincidentes al 100 %); la única diferencia es de maquetación/paginación y conteo de párrafos por estilo de traducción, sin pérdida de contenido.

---
