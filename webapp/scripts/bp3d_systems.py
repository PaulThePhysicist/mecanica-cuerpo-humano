"""
Catálogo de sistemas anatómicos BodyParts3D (DBCLS, CC-BY-SA 2.1 Japan).

Fuente única de la verdad para qué mallas FMA componen cada GLB de sistema y con
qué nombre de nodo se exportan. El runner `gen_bp3d_system.py` consume `PACKAGES`
y hornea cada malla con el transform canónico de `bp3d_transform.json`, de modo
que todos los sistemas caen en el mismo espacio que `human_body.glb`.

Convención de nodo: nombre anatómico estándar en snake_case + sufijo `_R` / `_L`.
NO renombrar nodos ya publicados: los componentes React los referencian por
`useGLTF(...).nodes.<node_name>`.
"""
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC_CAP1 = os.path.join(ROOT, "public", "assets", "cap1")
ASSETS_SOURCE = os.path.join(ROOT, "assets_source")

# ── ESQUELETO ──────────────────────────────────────────────────────────────────
# La lista ósea vive en gen_anatomical_body.py (que además calcula y congela el
# transform canónico). Se reexporta aquí para tener el catálogo completo en un
# solo módulo.
from gen_anatomical_body import ALL as SKELETAL  # noqa: E402  (131 huesos)

# ── MÚSCULOS ───────────────────────────────────────────────────────────────────
# MIEMBRO SUPERIOR (hombro, brazo, antebrazo, manguito rotador) — 34 vientres
MUSCULAR_ARM = [
    ("34680", "deltoideus_clavicular_R"),
    ("34682", "deltoideus_acromial_R"),
    ("34684", "deltoideus_spinal_R"),
    ("34681", "deltoideus_clavicular_L"),
    ("34683", "deltoideus_acromial_L"),
    ("34685", "deltoideus_spinal_L"),
    ("37686", "biceps_brachii_long_head_R"),
    ("37684", "biceps_brachii_short_head_R"),
    ("37687", "biceps_brachii_long_head_L"),
    ("37685", "biceps_brachii_short_head_L"),
    ("37668", "brachialis_R"),
    ("37669", "brachialis_L"),
    ("37665", "coracobrachialis_R"),
    ("37666", "coracobrachialis_L"),
    ("37699", "triceps_brachii_long_head_R"),
    ("37697", "triceps_brachii_lateral_head_R"),
    ("37695", "triceps_brachii_medial_head_R"),
    ("37700", "triceps_brachii_long_head_L"),
    ("37698", "triceps_brachii_lateral_head_L"),
    ("37696", "triceps_brachii_medial_head_L"),
    ("38560", "pronator_teres_humeral_head_R"),
    ("38562", "pronator_teres_ulnar_head_R"),
    ("38561", "pronator_teres_humeral_head_L"),
    ("38563", "pronator_teres_ulnar_head_L"),
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

# CADERA Y MIEMBRO INFERIOR — 24 vientres
MUSCULAR_HIP_LEG = [
    ("22328", "gluteus_maximus_R"),
    ("22329", "gluteus_maximus_L"),
    ("22330", "gluteus_medius_R"),
    ("22331", "gluteus_medius_L"),
    ("22332", "gluteus_minimus_R"),
    ("22333", "gluteus_minimus_L"),
    ("22342", "psoas_major_R"),
    ("22343", "psoas_major_L"),
    ("38928", "rectus_femoris_R"),
    ("38929", "rectus_femoris_L"),
    ("45888", "biceps_femoris_long_head_R"),
    ("45891", "biceps_femoris_short_head_R"),
    ("45889", "biceps_femoris_long_head_L"),
    ("45892", "biceps_femoris_short_head_L"),
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

# TRONCO, ABDOMEN, CUELLO Y MANDÍBULA — 34 vientres
MUSCULAR_TRUNK = [
    ("34690", "pectoralis_major_clavicular_R"),
    ("79979", "pectoralis_major_sternocostal_R"),
    ("45874", "pectoralis_major_abdominal_R"),
    ("34691", "pectoralis_major_clavicular_L"),
    ("79980", "pectoralis_major_sternocostal_L"),
    ("45875", "pectoralis_major_abdominal_L"),
    ("13375", "pectoralis_minor_R"),
    ("13376", "pectoralis_minor_L"),
    ("13358", "latissimus_dorsi_R"),
    ("13359", "latissimus_dorsi_L"),
    ("13377", "rectus_abdominis_R"),
    ("13378", "rectus_abdominis_L"),
    ("13336", "obliquus_externus_R"),
    ("13337", "obliquus_externus_L"),
    ("13892", "obliquus_internus_R"),
    ("13893", "obliquus_internus_L"),
    ("33581", "trapezius_ascending_R"),
    ("33584", "trapezius_transverse_R"),
    ("33586", "trapezius_descending_R"),
    ("33583", "trapezius_ascending_L"),
    ("33585", "trapezius_transverse_L"),
    ("33587", "trapezius_descending_L"),
    ("49001", "masseter_superficial_R"),
    ("49004", "masseter_deep_R"),
    ("49002", "masseter_superficial_L"),
    ("49005", "masseter_deep_L"),
    ("46313", "rectus_capitis_anterior_R"),
    ("46314", "rectus_capitis_anterior_L"),
    ("46317", "rectus_capitis_lateralis_R"),
    ("46318", "rectus_capitis_lateralis_L"),
    ("32530", "rectus_capitis_posterior_major_R"),
    ("32531", "rectus_capitis_posterior_major_L"),
    ("32532", "rectus_capitis_posterior_minor_R"),
    ("32533", "rectus_capitis_posterior_minor_L"),
]

MUSCULAR_FULL = MUSCULAR_ARM + MUSCULAR_HIP_LEG + MUSCULAR_TRUNK

# Color de tejido (carmín cálido PBR) usado si se hornea color de vértice.
MUSCLE_COLOR = (0.69, 0.14, 0.10, 1.0)
BONE_COLOR = (0.90, 0.85, 0.74, 1.0)

# ── PAQUETES DE SALIDA ─────────────────────────────────────────────────────────
# key -> dict(parts, out, faces, label, coluor)
# `out` es ruta absoluta al .glb; `faces` es el presupuesto de decimación por
# malla (mismos valores que produjeron los GLB commiteados vía el antiguo
# optimize_muscles_glb.py: 2200 regional, 1800 atlas completo).
PACKAGES = {
    "muscular_arm": dict(
        parts=MUSCULAR_ARM, out=os.path.join(PUBLIC_CAP1, "human_muscles_arm.glb"),
        faces=2200, label="Músculos · Miembro Superior", color=MUSCLE_COLOR,
    ),
    "muscular_hip_leg": dict(
        parts=MUSCULAR_HIP_LEG, out=os.path.join(PUBLIC_CAP1, "human_muscles_hip_leg.glb"),
        faces=2200, label="Músculos · Cadera y Pierna", color=MUSCLE_COLOR,
    ),
    "muscular_trunk": dict(
        parts=MUSCULAR_TRUNK, out=os.path.join(ASSETS_SOURCE, "human_muscles_trunk.glb"),
        faces=2200, label="Músculos · Tronco y Mandíbula", color=MUSCLE_COLOR,
    ),
    "muscular_full": dict(
        parts=MUSCULAR_FULL, out=os.path.join(PUBLIC_CAP1, "human_muscles_full.glb"),
        faces=1800, label="Atlas Muscular Completo", color=MUSCLE_COLOR,
    ),
}

# Grupos que expande `gen_bp3d_system.py --system <grupo>`
GROUPS = {
    "muscular": ["muscular_arm", "muscular_hip_leg", "muscular_trunk", "muscular_full"],
    "all": ["muscular_arm", "muscular_hip_leg", "muscular_trunk", "muscular_full"],
}
