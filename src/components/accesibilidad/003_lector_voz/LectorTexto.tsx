'use client';

/**
 * Boton de lectura por voz para un bloque de texto arbitrario (p. ej. el
 * contenido de una card). Solo se muestra cuando la bandera de accesibilidad
 * "lectura por voz" esta habilitada en la configuracion de interfaz.
 */

import { useInterfazStore } from '@/store/interfazStore';
import { BotonEscuchar } from './BotonEscuchar';

interface LectorTextoProps {
  readonly texto: string;
  readonly className?: string;
}

export function LectorTexto({ texto, className = 'mb-2' }: LectorTextoProps) {
  const habilitado = useInterfazStore(
    (estado) => estado.configuracion?.accesibilidad?.lectura_voz_habilitada ?? false,
  );

  if (!habilitado || !texto.trim()) {
    return null;
  }

  return (
    <div className={className}>
      <BotonEscuchar texto={texto} />
    </div>
  );
}
