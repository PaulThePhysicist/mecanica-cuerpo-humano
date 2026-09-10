/**
 * C3 · Tabla 1.10 (rangos de movimiento articular) llevada al rig del esqueleto.
 *
 * Vive aparte de BodyScene.tsx porque es dato puro: lo consumen tanto la escena
 * 3D (para posar los pivotes) como el slide (para rotular el ángulo en vivo), y
 * exportar funciones desde un archivo de componentes rompe el fast refresh.
 */

export interface MobilityRange {
  joint: string;
  label: string;
  primary: number;
  secondary?: number;
  primaryLabel: string;
  secondaryLabel?: string;
  plane: 'sagittal' | 'coronal' | 'axial';
  position: [number, number, number];
}

/** Pivotes del rig articular que construye BodyScene sobre human_body.glb. */
export type PivotKey = 'shoulder' | 'elbow' | 'forearm' | 'wrist' | 'hip' | 'knee' | 'ankle';

export interface RomMotion {
  pivot: PivotKey;
  axis: 'x' | 'y' | 'z';
  /** Grados del pivote en fase 0 y en fase 1; rotación 0 = posición anatómica. */
  from: number;
  to: number;
  /** Signo del ángulo del rig que corresponde al movimiento primario, para
   *  rotular la lectura sin repetir la convención en cada articulación. */
  primarySign: 1 | -1;
  /** Radio del abanico ROM, elegido para que el arco alcance el extremo distal
   *  del segmento que gira (unidades de mundo, esqueleto a escala 6.5). */
  radius: number;
  /** Antebrazo y muñeca heredan una orientación no identidad del pivote padre:
   *  se giran con rotateX/rotateY sobre su cuaternión base, no fijando .rotation. */
  relative?: boolean;
}

export const ROM_MOTIONS: Record<string, RomMotion> = {
  // 188° flexión / 61° extensión
  'hombro-flex': { pivot: 'shoulder', axis: 'x', from: 61, to: -188, primarySign: -1, radius: 1.55 },
  // 134° abducción / 48° aducción
  'hombro-abd': { pivot: 'shoulder', axis: 'z', from: 48, to: -134, primarySign: -1, radius: 1.55 },
  // 97° rotación medial / 34° lateral
  'hombro-rot': { pivot: 'shoulder', axis: 'y', from: 34, to: -97, primarySign: -1, radius: 1.0 },
  // 142° flexión
  codo: { pivot: 'elbow', axis: 'x', from: 0, to: -142, primarySign: -1, radius: 0.85 },
  // 113° supinación / 77° pronación
  antebrazo: { pivot: 'forearm', axis: 'y', from: 77, to: -113, primarySign: -1, radius: 0.5, relative: true },
  // 90° flexión / 99° extensión
  muneca: { pivot: 'wrist', axis: 'x', from: 99, to: -90, primarySign: -1, radius: 0.4, relative: true },
  // 113° flexión
  cadera: { pivot: 'hip', axis: 'x', from: 0, to: -113, primarySign: -1, radius: 2.2 },
  // 125° flexión (única con el primario en positivo: la tibia va hacia posterior)
  rodilla: { pivot: 'knee', axis: 'x', from: 0, to: 125, primarySign: 1, radius: 1.2 },
  // 35° dorsiflexión / 38° flexión plantar
  tobillo: { pivot: 'ankle', axis: 'x', from: 38, to: -35, primarySign: -1, radius: 0.5 },
};

/** Ángulo del rig (grados con signo) para una articulación en una fase dada. */
export function romAngleAt(joint: string, progress: number): number | null {
  const m = ROM_MOTIONS[joint];
  if (!m) return null;
  return m.from + (m.to - m.from) * progress;
}

/** Lectura en vivo lista para rotular: magnitud + nombre del movimiento en curso. */
export function romReadout(range: MobilityRange, progress: number): { deg: number; label: string } {
  const m = ROM_MOTIONS[range.joint];
  const raw = romAngleAt(range.joint, progress) ?? 0;
  const towardsPrimary = m ? raw * m.primarySign >= 0 : raw >= 0;
  return {
    deg: Math.abs(raw),
    label: towardsPrimary ? range.primaryLabel : (range.secondaryLabel ?? range.primaryLabel),
  };
}
