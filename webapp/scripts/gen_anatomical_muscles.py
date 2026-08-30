"""
Genera los modelos GLB anatómicos de músculos desde BodyParts3D (DBCLS CC-BY-SA 2.1 Japan).
Cada músculo se exporta como malla separada con su nombre anatómico estándar,
conservando las coordenadas anatómicas exactas del cuerpo humano en pose anatómica (mm),
alineadas al milímetro con human_body.glb.

Genera 4 paquetes GLB modulares:
1. human_muscles_arm.glb        (Hombro, brazo, antebrazo y manguito rotador)
2. human_muscles_hip_leg.glb    (Cadera, glúteos, muslo, pierna y tríceps sural)
3. human_muscles_trunk.glb      (Tronco, pectorales, dorsales, abdomen, masetero y cuello)
4. human_muscles_full.glb       (Atlas muscular completo del cuerpo humano)
"""
import os, time, urllib.request, sys
import numpy as np
import trimesh

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSET = os.path.join(ROOT, "public", "assets", "cap1")
STL_DIR = os.path.join(ROOT, "assets_source", "_bp3d_stl")
os.makedirs(STL_DIR, exist_ok=True)

BASE_URL = "https://raw.githubusercontent.com/Kevin-Mattheus-Moerman/BodyParts3D/main/assets/BodyParts3D_data/stl/FMA{}.stl"

# Color del tejido muscular anatómico PBR (carmín cálido)
MUSCLE_COLOR = np.array([0.69, 0.14, 0.10, 1.0])

# ── DEFINICIÓN DE MÚSCULOS POR GRUPOS Y FMA ID ──

# MIEMBRO SUPERIOR (Brazo, Hombro, Antebrazo, Manguito rotador)
ARM_MUSCLES = [
    # Deltoides (3 porciones R & L)
    ("34680", "deltoideus_clavicular_R"),
    ("34682", "deltoideus_acromial_R"),
    ("34684", "deltoideus_spinal_R"),
    ("34681", "deltoideus_clavicular_L"),
    ("34683", "deltoideus_acromial_L"),
    ("34685", "deltoideus_spinal_L"),
    # Bíceps braquial (2 cabezas R & L)
    ("37686", "biceps_brachii_long_head_R"),
    ("37684", "biceps_brachii_short_head_R"),
    ("37687", "biceps_brachii_long_head_L"),
    ("37685", "biceps_brachii_short_head_L"),
    # Braquial anterior y Coracobraquial
    ("37668", "brachialis_R"),
    ("37669", "brachialis_L"),
    ("37665", "coracobrachialis_R"),
    ("37666", "coracobrachialis_L"),
    # Tríceps braquial (3 cabezas R & L)
    ("37699", "triceps_brachii_long_head_R"),
    ("37697", "triceps_brachii_lateral_head_R"),
    ("37695", "triceps_brachii_medial_head_R"),
    ("37700", "triceps_brachii_long_head_L"),
    ("37698", "triceps_brachii_lateral_head_L"),
    ("37696", "triceps_brachii_medial_head_L"),
    # Pronador redondo (2 cabezas R & L)
    ("38560", "pronator_teres_humeral_head_R"),
    ("38562", "pronator_teres_ulnar_head_R"),
    ("38561", "pronator_teres_humeral_head_L"),
    ("38563", "pronator_teres_ulnar_head_L"),
    # Manguito rotador
    ("32544", "supraspinatus_R"),
    ("32545", "supraspinatus_L"),
    ("32547", "infraspinatus_R"),
    ("32548", "infraspinatus_L"),
    ("13414", "subscapularis_R"),
    ("13415", "subscapularis_L"),
    ("32553", "teres_minor_R"),
    ("32554", "teres_minor_L"),
    ("32551", "teres_major_R"),
    ("32552", "teres_major_L"),
]

# CADERA Y MIEMBRO INFERIOR
HIP_LEG_MUSCLES = [
    # Glúteos
    ("22328", "gluteus_maximus_R"),
    ("22329", "gluteus_maximus_L"),
    ("22330", "gluteus_medius_R"),
    ("22331", "gluteus_medius_L"),
    ("22332", "gluteus_minimus_R"),
    ("22333", "gluteus_minimus_L"),
    # Psoas mayor
    ("22342", "psoas_major_R"),
    ("22343", "psoas_major_L"),
    # Cuádriceps / Recto femoral
    ("38928", "rectus_femoris_R"),
    ("38929", "rectus_femoris_L"),
    # Isquiotibiales (Bíceps femoral)
    ("45888", "biceps_femoris_long_head_R"),
    ("45891", "biceps_femoris_short_head_R"),
    ("45889", "biceps_femoris_long_head_L"),
    ("45892", "biceps_femoris_short_head_L"),
    # Pierna y Tríceps Sural
    ("22544", "tibialis_anterior_R"),
    ("22545", "tibialis_anterior_L"),
    ("45957", "gastrocnemius_medial_head_R"),
    ("45960", "gastrocnemius_lateral_head_R"),
    ("45958", "gastrocnemius_medial_head_L"),
    ("45961", "gastrocnemius_lateral_head_L"),
    ("22558", "soleus_R"),
    ("22559", "soleus_L"),
    ("65018", "tibialis_posterior_R"),
    ("65019", "tibialis_posterior_L"),
]

# TRONCO, ABDOMEN, CUELLO Y MANDÍBULA
TRUNK_MUSCLES = [
    # Pectorales
    ("34690", "pectoralis_major_clavicular_R"),
    ("79979", "pectoralis_major_sternocostal_R"),
    ("45874", "pectoralis_major_abdominal_R"),
    ("34691", "pectoralis_major_clavicular_L"),
    ("79980", "pectoralis_major_sternocostal_L"),
    ("45875", "pectoralis_major_abdominal_L"),
    ("13375", "pectoralis_minor_R"),
    ("13376", "pectoralis_minor_L"),
    # Dorsal ancho
    ("13358", "latissimus_dorsi_R"),
    ("13359", "latissimus_dorsi_L"),
    # Abdomen
    ("13377", "rectus_abdominis_R"),
    ("13378", "rectus_abdominis_L"),
    ("13336", "obliquus_externus_R"),
    ("13337", "obliquus_externus_L"),
    ("13892", "obliquus_internus_R"),
    ("13893", "obliquus_internus_L"),
    # Trapecio
    ("33581", "trapezius_ascending_R"),
    ("33584", "trapezius_transverse_R"),
    ("33586", "trapezius_descending_R"),
    ("33583", "trapezius_ascending_L"),
    ("33585", "trapezius_transverse_L"),
    ("33587", "trapezius_descending_L"),
    # Masetero (Mandíbula)
    ("49001", "masseter_superficial_R"),
    ("49004", "masseter_deep_R"),
    ("49002", "masseter_superficial_L"),
    ("49005", "masseter_deep_L"),
    # Rectos del cuello / cabeza
    ("46313", "rectus_capitis_anterior_R"),
    ("46314", "rectus_capitis_anterior_L"),
    ("46317", "rectus_capitis_lateralis_R"),
    ("46318", "rectus_capitis_lateralis_L"),
    ("32530", "rectus_capitis_posterior_major_R"),
    ("32531", "rectus_capitis_posterior_major_L"),
    ("32532", "rectus_capitis_posterior_minor_R"),
    ("32533", "rectus_capitis_posterior_minor_L"),
]

PACKAGES = [
    ("human_muscles_arm.glb", ARM_MUSCLES, "Miembro Superior"),
    ("human_muscles_hip_leg.glb", HIP_LEG_MUSCLES, "Cadera y Pierna"),
    ("human_muscles_trunk.glb", TRUNK_MUSCLES, "Tronco, Abdomen y Masetero"),
    ("human_muscles_full.glb", ARM_MUSCLES + HIP_LEG_MUSCLES + TRUNK_MUSCLES, "Atlas Muscular Completo"),
]

def ensure_stl(fid):
    p = os.path.join(STL_DIR, f"FMA{fid}.stl")
    if os.path.exists(p) and os.path.getsize(p) > 2000:
        return p
    for attempt in range(6):
        try:
            req = urllib.request.Request(BASE_URL.format(fid), headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req) as resp:
                data = resp.read()
                if len(data) > 2000:
                    with open(p, "wb") as f:
                        f.write(data)
                    return p
        except Exception as e:
            time.sleep(1.2 + attempt * 1.2)
    print(f"  !! FALLO descarga FMA{fid}", flush=True)
    return None

def load_muscle_mesh(fid, node_name):
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
        m.visual = trimesh.visual.ColorVisuals(mesh=m, face_colors=np.tile(MUSCLE_COLOR, (len(m.faces), 1)))
        return m
    except Exception as e:
        print(f"  !! Error cargando FMA{fid} ({node_name}): {e}", flush=True)
        return None

def build_package(filename, muscle_list, label):
    out_path = os.path.join(ASSET, filename)
    print(f"\n==========================================", flush=True)
    print(f" Ensamblando: {filename} ({label})", flush=True)
    print(f" Total músculos a procesar: {len(muscle_list)}", flush=True)
    print(f"==========================================", flush=True)

    scene = trimesh.Scene()
    count = 0

    for fid, node_name in muscle_list:
        mesh = load_muscle_mesh(fid, node_name)
        if mesh is not None:
            # Decimación leve si la malla supera 6.000 caras para fluidez a 60 FPS
            if len(mesh.faces) > 6000:
                try:
                    # face_count por nombre: el primer posicional es `percent`
                    # (0-1) y un conteo de caras lanza ValueError.
                    mesh = mesh.simplify_quadric_decimation(face_count=6000)
                except Exception as e:
                    print(f"  !! Decimacion fallida en {node_name}: {type(e).__name__}: {e}", flush=True)
            scene.add_geometry(mesh, node_name=node_name)
            count += 1
            print(f"  [OK] {node_name:<36} (FMA{fid}) | {len(mesh.vertices)} verts", flush=True)
        else:
            print(f"  [OMITIDO] {node_name} (FMA{fid})", flush=True)

    glb_bytes = scene.export(file_type="glb")
    with open(out_path, "wb") as f:
        f.write(glb_bytes)

    size_mb = os.path.getsize(out_path) / (1024 * 1024)
    print(f" -> Generado {filename}: {count} mallas | {size_mb:.2f} MB", flush=True)
    return count

def main():
    print("Iniciando extracción y ensamblado del Atlas de Músculos BodyParts3D...", flush=True)
    t0 = time.time()
    total_m = 0
    for fname, mlist, lbl in PACKAGES:
        total_m += build_package(fname, mlist, lbl)

    dt = time.time() - t0
    print(f"\n==========================================", flush=True)
    print(f" Exitoso: {total_m} músculos ensamblados en {dt:.1f}s", flush=True)
    print(f" Todos los paquetes GLB guardados en: {ASSET}", flush=True)
    print(f"==========================================", flush=True)

if __name__ == "__main__":
    main()
