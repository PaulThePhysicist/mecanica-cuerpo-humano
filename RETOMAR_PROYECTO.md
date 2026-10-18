# 🧭 Guía para Retomar el Proyecto — "La Mecánica del Cuerpo Humano"

> **Fecha de pausa:** 18 de octubre de 2026  
> **Reactivación estimada:** Diciembre 2026 / Enero 2027 (~2 meses)  
> **Autor / Director del Proyecto:** Paul M.  
> **Estado de Producción:** Capítulos 1 y 2 en vivo en Vercel (sincronizados con GitHub `origin/main`).

---

## 📍 1. ¿En qué estado exacto quedó el proyecto?

1. **Fase 1 (Libro LaTeX Editorial):**
   - **100% Completada y Cerrada.** Todos los 13 capítulos, preliminares y apéndices están traducidos al español, maquetados en LaTeX y auditados contra el original de Irving P. Herman con paridad estructural exacta (verificado en `reporte.md`).

2. **Fase 2 (Plataforma Web React SPA en `webapp/`):**
   - **Capítulo 1:** 100% terminado, auditado, optimizado con vendor chunking y **activo en producción** (`available: true`).
   - **Capítulo 2:** 100% terminado, pulido en UI/interacción (tokens CSS, DCL unificados, selección de texto, lienzos con estado de reserva) y **activo en producción** (`available: true`).
   - **Capítulos 3 al 13:** Migrados en su totalidad a componentes React (`webapp/src/chapters/cap[3-13]`), pero configurados como `available: false` en `webapp/src/App.tsx`. Están esperando su ciclo de auditoría técnica y refinamiento antes de abrirse al público.

3. **Infraestructura y Repositorio:**
   - Git: `main` limpio y sincronizado con `origin/main` (`PaulThePhysicist/mecanica-cuerpo-humano`).
   - Build: `tsc -b && vite build` compila en ~6 segundos con **0 errores**.
   - Despliegue: Vercel automatizado ante cualquier `git push origin main`.

---

## ⚡ 2. Pasos Rápidos para Reactivar el Entorno (5 Minutos)

Cuando vuelvas a abrir el proyecto en dos meses, solo ejecuta:

```powershell
# 1. Abrir terminal en la raíz del proyecto
cd "c:\Users\PaulM\Documents\la universidad de paul\La Mecanica del Cuerpo Humano"

# 2. Verificar sincronización de git
git pull origin main
git status

# 3. Levantar la aplicación web en desarrollo
cd webapp
npm install
npm run dev
```

Abre `http://localhost:5173/` en tu navegador para ver la SPA en funcionamiento.

---

## 🎯 3. Misión Inmediata: Capítulo 3 ("El Movimiento")

Tu siguiente objetivo de trabajo es el **Capítulo 3**:
- **Directorio:** `webapp/src/chapters/cap3/`
- **Temas:** Bipedestación, marcha humana, carrera, saltos, lanzamientos, bateo, colisiones y aerodinámica balística (19 diapositivas).
- **Cantera original de código y física:** `Capitulos/Capitulo_3/capitulo3.html` y el texto en `Capitulos/Capitulo_3/Capitulo_3.tex`.

### Protocolo de Auditoría y Publicación del Capítulo 3:

Sigue la misma fórmula comprobada con la que dejamos listos los Capítulos 1 y 2:

1. **Rendimiento de Canvas y Loops:**
   - Asegurarse de que ningún canvas corra `requestAnimationFrame` en bucle infinito si la diapositiva está quieta. Usar `useHarmonicClock` o disparar repintado bajo demanda.
   - Implementar `CanvasReserveState` si los lienzos parpadean en blanco al navegar entre slides.

2. **Diseño y UI:**
   - Reemplazar valores de color hardcodeados por los tokens de diseño unificados en `:root` (`index.css` / `cap3.css`).
   - Asegurar que la selección de texto esté habilitada en el cuerpo teórico (`user-select: text`).

3. **Estandarización 3D (Bipedestación y Marcha):**
   - Para las escenas 3D de marcha o cinemática, montar sobre el contenedor oficial `AnatomyStage` documentado en `BIOMECHANICAL_3D_STANDARD_AND_WORKFLOW.md`.
   - Utilizar los materiales PBR estándar (`materials.bone`, `materials.muscleActive`, etc.).

4. **Verificación de Compilación:**
   ```powershell
   cd webapp
   npm run build
   ```
   Asegurarse de mantener 0 errores en TypeScript y Vite.

5. **Pase a Producción:**
   - En `webapp/src/App.tsx`, ubicar el Capítulo 3 (`id: 3`) y cambiar:
     ```tsx
     available: false, // -> cambiar a: available: true,
     ```
   - Comitear y empujar a GitHub:
     ```powershell
     git add -A
     git commit -m "feat(cap3): publicar Capitulo 3 en produccion tras auditoria"
     git push origin main
     ```
   - Vercel desplegará automáticamente la actualización en vivo.

---

## 📚 4. Índice de Documentación Crucial

Si olvidas algún detalle técnico o conceptual, consulta estos archivos:

| Documento | Utilidad |
| :--- | :--- |
| **`STATUS.md`** | La matriz maestra de avance de todos los capítulos y módulos. |
| **`contexto_proyecto.md`** | La historia, arquitectura y directrices globales del proyecto. |
| **`BIOMECHANICAL_3D_STANDARD_AND_WORKFLOW.md`** | Cómo usar las mallas 3D, coordenadas canónicas y `AnatomyStage`. |
| **`AUDITORIA_CAP1.md`** | Ejemplo de auditoría de rendimiento (desacople de rAF, vendor chunking). |
| **`AUDITORIA_CAP1_INTERACCION.md`** | Ejemplo de auditoría de interacción, pedagogía y diseño. |
| **`reporte.md`** | Comparativa de fidelidad matemática y estructural del libro LaTeX. |
| **`PRODUCT.md`** | Audiencia (estudiantes universitarios), objetivos de clase y tono. |

---

*¡Todo está en orden, limpio, respaldado y listo para cuando decidas regresar!*
