/**
 * Estilos compartidos para campos de entrada de preguntas.
 */

import type { CSSProperties } from 'react';

export function estilosCampoTexto(
  error?: string,
  deshabilitada?: boolean
): CSSProperties {
  return {
    border: error
      ? '1.5px solid var(--color-error)'
      : '1.5px solid var(--color-borde-fuerte)',
    backgroundColor: deshabilitada
      ? 'var(--color-deshabilitado-fondo)'
      : 'var(--color-fondo-tarjeta)',
    color: 'var(--color-texto-primario)',
    minHeight: 'var(--tamano-control-min)',
  };
}
