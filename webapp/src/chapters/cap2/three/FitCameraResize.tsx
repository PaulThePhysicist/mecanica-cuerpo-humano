import type { ComponentProps } from 'react';
import { useThree } from '@react-three/fiber';
import { FitCamera } from '../../cap1/three/FitCamera';

/**
 * `FitCamera` (cap1) no reencuadra al redimensionar el `<Canvas>`: su efecto
 * depende de `refit`/`targetName`/`padding`/`camera`/`scene`/`controls`, pero
 * no del tamaño del lienzo, así que un resize dejaba el encuadre calculado
 * para el aspecto anterior. Este wrapper —vive en cap2 para no tocar cap1—
 * añade el tamaño actual del canvas a `refit`, forzando el recálculo en cada
 * resize sin cambiar el componente compartido.
 */
export function FitCameraResize(props: ComponentProps<typeof FitCamera>) {
  const size = useThree((s) => s.size);
  return <FitCamera {...props} refit={`${String(props.refit)}:${size.width}x${size.height}`} />;
}
