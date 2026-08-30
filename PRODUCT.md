# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React + Vite + TypeScript SPA (la nueva arquitectura en `webapp/`: slide-engine + Canvas 2D + KaTeX, con Three.js/R3F planeado para la escena 3D). Los HTML estáticos de `Capitulos/Capitulo_*/` funcionan como repositorio de código base/cantera; la SPA es el producto entregable. KaTeX vía npm (offline).

## Users

- **Primary — professor (the owner, Paul):** delivers a university lecture on "Physics of the Human Body", Chapter 1, in Spanish, in a classroom, presenting from a projected screen. The deck is the script: it must carry the full lesson so the lecture can be dictated from it.
- **Secondary — university students:** modern undergraduates who lose attention with dry, graphic-heavy formal slides. The deck must hold their attention without sacrificing academic seriousness.

## Product Purpose

Interactive presentation of the Herman *Physics of the Human Body* chapters (translated to Spanish), delivered as a React SPA the professor can use to teach in class. **Chapter 2 — "Fuerzas y Torcas en el Cuerpo" — is fully migrated and verified** (19 slides, 15 interactive 2D simulations, KaTeX equations). Chapter 1 is partially migrated (hybrid). Success = the full lesson can be dictated from the deck and students stay engaged.

The deck replaces a previous dark/neon "cyber" design that the owner got stuck polishing, and the single-file HTML approach is being superseded by the SPA for maintainability and offline use.

## Positioning

The book's static figures become alive: a rotatable 3D body with anatomical axes/planes/regions, interactive joint and movement simulations, and explorable scaling graphs. This is the differentiator against a plain slide deck or the PDF — the mechanism that makes a hard physics-of-the-body topic graspable in class.

## Operating Context

- In-class lecture, projected; navigation by keyboard (arrows) and mouse; ideally also openable by students.
- Content source of truth: `Capitulos/Capitulo_1/Capitulo_1.tex` (full Spanish translation) and the original book PDF. Figures available as PNGs (`imagenes/11.png`–`121.png`) and a 3D model (`imagenes/human_body.glb`).
- The deck replaces a previous dark/neon "cyber" design that the owner got stuck polishing.

## Capabilities and Constraints

- **Coverage:** full lecture depth over all chapter sections (1.1 Terminología anatómica · 1.2 Movimiento en la máquina humana · 1.3 El humano estándar · 1.4 Relaciones de escala · 1.5 Resumen), with the chapter's key tables, equations, and figures. Not a paragraph-by-paragraph 1:1 of the tex (that was declared out of scope for the HTML).
- **Interactivity is the center of gravity:** keep and push the 3D body, canvas simulations (degrees of freedom, synovial joints, antagonists, segment proportions, somatotypes), and charts (allometry, Stevens' law). KaTeX for equations.
- **Language:** Spanish (the tex translation). Terminology per the tex.
- **Formality vs. engagement ("el punto dulce"):** must keep the topic's seriousness and academic credibility, but use strategic color and occasional emojis so students do not get bored. Binding constraint from the owner.
- Standalone file that opens in any browser; images referenced relative to `imagenes/`.
- Remove the debug scaffolding of the old boilerplate (error overlays, debug panel, console traps).

## Brand Commitments

- The source book: Irving P. Herman, *Physics of the Human Body*, 2016 (Springer), used with the project's translation.
- Academic seriousness of the subject must be preserved ("no perder la formalidad ni la seriedad").
- The owner explicitly wants color and occasional emojis as engagement tools — a "punto dulce" between formal and captivating.

## Evidence on Hand

- `Capitulos/Capitulo_1/Capitulo_1.tex` — full Spanish translation (source of content).
- `Capitulos/Capitulo_1/Capitulo_1.pdf` — compiled LaTeX (visual reference).
- `Capitulos/Capitulo_1/boilerplate.html` — previous interactive attempt (engine + interactive code to reuse).
- `Capitulos/Capitulo_1/imagenes/` — 21 PNG figures (`11.png`–`121.png`) + `human_body.glb`.
- `Capitulos/Capitulo_2/capitulo2.html` — source HTML estático del Cap. 2 (cantera migrada).
- `webapp/src/chapters/cap2/` — **Cap. 2 ya migrado** a la SPA (ab.ts, sims.ts, Sim.tsx, useEngine.ts, Slide0..18.tsx, Capitulo2.tsx, cap2.css).
- Root `contexto_proyecto.md` and `raw/instrucciones.txt` — project translation rules.

## Product Principles

1. **Fidelity to the text:** the whole lecture is covered with the book's data, terms, and equations — the deck must be dictatable as a complete lesson.
2. **The sweet spot:** formal and serious enough to be credible, vivid enough that no student checks out; color and emoji are tools, not noise.
3. **Interactivity is the point:** every static figure worth exploring becomes explorable; the 3D body and simulations carry the lecture.
4. **Clarity beats decoration:** the physics is explained through the body; hierarchy and legibility come before flourish.
5. **Self-contained and portable:** one file, opens anywhere, no build, assets relative.

## Accessibility & Inclusion

- Presenter-facing deck in a bright classroom: readable contrast, sizable type, keyboard navigation, no reliance on color alone (labels + color). (No stricter standard was established.)
