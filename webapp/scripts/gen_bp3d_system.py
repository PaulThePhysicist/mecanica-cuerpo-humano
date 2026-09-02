"""
Generador unificado de GLB de sistemas anatómicos BodyParts3D.

Reemplaza a gen_anatomical_muscles.py + optimize_muscles_glb.py. Diferencia
clave: **hornea cada malla con el transform canónico de bp3d_transform.json**
(rotar de pie → recentrar en el centroide del esqueleto → escalar a 1.0), de
modo que el GLB resultante cae exactamente en el espacio de human_body.glb y sus
nodos se pueden renderizar como hermanos directos de las mallas óseas — sin
ningún ajuste en runtime.

El esqueleto (human_body.glb) lo sigue generando gen_anatomical_body.py, que
además escribe bp3d_transform.json.

Uso:
  env -u PYTHONPATH .venv_assets/Scripts/python.exe scripts/gen_bp3d_system.py --system muscular
  env -u PYTHONPATH .venv_assets/Scripts/python.exe scripts/gen_bp3d_system.py --system muscular_arm
  ...

Requiere el venv aislado con trimesh + scipy (ver gen_anatomical_body.py).
BodyParts3D, (c) DBCLS — CC Attribution-Share Alike 2.1 Japan.
"""
import argparse
import json
import os
import sys
import time
import urllib.request

import numpy as np
import trimesh

try:  # consola de Windows en cp1252 revienta con caracteres no-ASCII
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

from bp3d_systems import PACKAGES, GROUPS  # noqa: E402

STL_DIR = os.path.join(os.path.dirname(HERE), "assets_source", "_bp3d_stl")
TRANSFORM_PATH = os.path.join(HERE, "bp3d_transform.json")
BASE_URL = "https://raw.githubusercontent.com/Kevin-Mattheus-Moerman/BodyParts3D/main/assets/BodyParts3D_data/stl/FMA{}.stl"

# Envolvente aproximada del esqueleto (space canónico) para el QC.
SKELETON_ENVELOPE = np.array([[-0.28, -0.52, -0.18], [0.28, 0.52, 0.18]])


def load_canonical_matrix():
    """Compone S @ T @ R desde bp3d_transform.json → matriz 4x4 única."""
    with open(TRANSFORM_PATH, "r", encoding="utf-8") as f:
        spec = json.load(f)
    axis = spec["rotate"]["axis"]
    ang = np.deg2rad(spec["rotate"]["deg"])
    R = trimesh.transformations.rotation_matrix(ang, axis)
    cb = np.asarray(spec["centroid_mm_post_rot"], dtype=float)
    T = np.eye(4)
    T[:3, 3] = -cb
    s = float(spec["scale"])
    S = np.diag([s, s, s, 1.0])
    M = S @ T @ R
    return M, spec


def ensure_stl(fid):
    p = os.path.join(STL_DIR, f"FMA{fid}.stl")
    if os.path.exists(p) and os.path.getsize(p) > 2000:
        return p
    os.makedirs(STL_DIR, exist_ok=True)
    for attempt in range(6):
        try:
            req = urllib.request.Request(BASE_URL.format(fid), headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req) as resp:
                data = resp.read()
            if len(data) > 2000:
                with open(p, "wb") as fh:
                    fh.write(data)
                return p
        except Exception:
            time.sleep(1.2 + attempt * 1.2)
    print(f"  !! FALLO descarga FMA{fid}", flush=True)
    return None


def load_part(fid, node_name, M, color, faces):
    p = ensure_stl(fid)
    if not p:
        return None
    try:
        m = trimesh.load(p)
        if isinstance(m, trimesh.Scene):
            m = trimesh.util.concatenate(m.dump())
        if not hasattr(m, "vertices") or len(m.vertices) == 0:
            return None
        m = m.copy()
        m.apply_transform(M)  # -> espacio canonico del esqueleto
        if len(m.faces) > faces:
            try:
                # face_count por nombre: el primer posicional es `percent` (0-1)
                # y un conteo de caras lanza ValueError.
                m = m.simplify_quadric_decimation(face_count=faces)
            except Exception as e:
                print(f"  !! decimación falló en {node_name}: {type(e).__name__}: {e}", flush=True)
        m.visual = trimesh.visual.ColorVisuals(mesh=m, face_colors=np.tile(np.array(color), (len(m.faces), 1)))
        return m
    except Exception as e:
        print(f"  !! error cargando FMA{fid} ({node_name}): {e}", flush=True)
        return None


def build_package(key, M):
    pkg = PACKAGES[key]
    parts, out, faces, label, color = pkg["parts"], pkg["out"], pkg["faces"], pkg["label"], pkg["color"]
    rel = os.path.relpath(out, os.path.dirname(HERE))
    print(f"\n{'='*60}\n {key}  -  {label}\n {len(parts)} mallas -> {rel}  (<={faces} caras/malla)\n{'='*60}", flush=True)

    scene = trimesh.Scene()
    ok = 0
    warnings = []
    for fid, node in parts:
        m = load_part(fid, node, M, color, faces)
        if m is None:
            print(f"  [OMITIDO] {node} (FMA{fid})", flush=True)
            continue
        scene.add_geometry(m, geom_name=node, node_name=node)
        ok += 1
        c = m.bounds.mean(axis=0)
        inside = np.all(c >= SKELETON_ENVELOPE[0]) and np.all(c <= SKELETON_ENVELOPE[1])
        flag = "" if inside else "  <-- FUERA DE LA ENVOLVENTE OSEA"
        if not inside:
            warnings.append(node)
        print(f"  [OK] {node:<38} centro=({c[0]:+.3f},{c[1]:+.3f},{c[2]:+.3f}) v={len(m.vertices)}{flag}", flush=True)

    os.makedirs(os.path.dirname(out), exist_ok=True)
    scene.export(out, file_type="glb")
    size_mb = os.path.getsize(out) / (1024 * 1024)
    gb = trimesh.util.concatenate(list(scene.geometry.values())).bounds
    print(f"\n -> {os.path.basename(out)}: {ok}/{len(parts)} mallas | {size_mb:.2f} MB", flush=True)
    print(f"    bbox global: min {np.round(gb[0],4).tolist()}  max {np.round(gb[1],4).tolist()}", flush=True)
    if warnings:
        print(f"    !! {len(warnings)} nodo(s) fuera de la envolvente: {', '.join(warnings)}", flush=True)
    return ok, warnings


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--system", required=True,
                    help="clave de PACKAGES (p.ej. muscular_arm) o grupo (" + ", ".join(GROUPS) + ")")
    args = ap.parse_args()

    keys = GROUPS.get(args.system, [args.system])
    unknown = [k for k in keys if k not in PACKAGES]
    if unknown:
        ap.error(f"sistema(s) desconocido(s): {unknown}. Disponibles: {list(PACKAGES)} o grupos {list(GROUPS)}")

    M, spec = load_canonical_matrix()
    print(f"transform canonico: scale={spec['scale']:.8g}  centroid_mm={spec['centroid_mm_post_rot']}", flush=True)

    t0 = time.time()
    total = 0
    allw = []
    for k in keys:
        ok, w = build_package(k, M)
        total += ok
        allw += w
    print(f"\n{'='*60}\n {total} mallas horneadas en {time.time()-t0:.1f}s"
          + (f"  ·  ⚠ {len(allw)} advertencia(s) de envolvente" if allw else "  ·  sin advertencias")
          + f"\n{'='*60}", flush=True)


if __name__ == "__main__":
    main()
