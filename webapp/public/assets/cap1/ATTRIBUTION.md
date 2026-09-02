# Atribución de los modelos 3D — Capítulo 1

## human_body.glb (modelo esquelético actual)
Esqueleto anatómico generado a partir de **BodyParts3D** (STL por FMA ID),
ensamblado y exportado como GLB con `trimesh` (ver `webapp/scripts/gen_anatomical_body.py`).

> BodyParts3D, (c) The Database Center for Life Science (DBCLS), licenciado bajo
> **CC Attribution-Share Alike 2.1 Japan**.
> Fuente: https://github.com/Kevin-Mattheus-Moerman/BodyParts3D

Cada hueso se exporta como malla separada con su node name (p.ej. `humerus_L`,
`femur_R`, `scaphoid_R`), de modo que las regiones anatómicas de A3 se resaltan
tiñendo los huesos correspondientes. Esto lo hace reutilizable en capítulos
posteriores (articulaciones, huesos, etc.).

## Paquetes musculares

Los modelos `human_muscles_arm.glb`, `human_muscles_hip_leg.glb` y
`human_muscles_full.glb` se generan a partir de mallas musculares de BodyParts3D
usando `trimesh` y el generador unificado `webapp/scripts/gen_bp3d_system.py`
(catálogo de FMA IDs en `scripts/bp3d_systems.py`). Cada músculo se conserva como
una malla independiente con un nombre anatómico estándar para poder resaltarlo o
controlarlo desde Three.js.

Cada malla se **hornea con el transform canónico** de `scripts/bp3d_transform.json`
(rotar −90° X → recentrar en el centroide del esqueleto → escalar a 1/altura), de
modo que los GLB musculares comparten el sistema de coordenadas de
`human_body.glb` al milímetro y sus nodos se montan como hermanos directos de las
mallas óseas, sin ningún ajuste en runtime.

Los STL fuente se almacenan en `webapp/assets_source/_bp3d_stl/` (fuera de
`public/`, para que Vite no los copie al build) y son insumos de generación; los
GLB son los recursos que consume la aplicación web.

La atribución y licencia de BodyParts3D indicadas arriba aplican también a
estos paquetes musculares.

## Paquetes no incluidos

`human_muscles_trunk.glb` (paquete de tronco y mandíbula) no se versiona porque
ninguna escena lo consume. Se conserva localmente en `webapp/assets_source/` y se
regenera con `gen_bp3d_system.py --system muscular_trunk` (o `--system muscular`,
que hace los cuatro paquetes) desde los STL de `assets_source/_bp3d_stl/`.

También se retiraron dos respaldos históricos sin uso: `human_body_legacy.glb`
(maniquí sólido Tripo previo al esqueleto BodyParts3D) y
`human_body_placeholder_backup.glb` (placeholder de 55 KB de `gen_run.py`).

## Regenerar los GLB
```
cd webapp
uv venv --python 3.13 .venv_assets
uv pip install --python .venv_assets/Scripts/python.exe trimesh scipy

# Esqueleto (además escribe scripts/bp3d_transform.json):
env -u PYTHONPATH .venv_assets/Scripts/python.exe scripts/gen_anatomical_body.py
# ⚠ produce un GLB de ~32 MB; el human_body.glb commiteado (5.8 MB) pasó luego
#   por un paso de decimación externo — no recommitear sin volver a optimizar.

# Músculos (ya alineados al esqueleto vía bp3d_transform.json):
env -u PYTHONPATH .venv_assets/Scripts/python.exe scripts/gen_bp3d_system.py --system muscular
```
