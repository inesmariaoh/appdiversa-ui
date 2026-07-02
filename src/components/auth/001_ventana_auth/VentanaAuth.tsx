/**
 * Contenedor tipo tarjeta para pantallas de autenticacion.
 * Centrado horizontal, sombra suave, padding uniforme.
 * Se usa como wrapper de todos los formularios de auth.
 */

import type { ReactNode } from 'react';

interface VentanaAuthProps {
  readonly children: ReactNode;
  /** Ancho maximo de la tarjeta. Por defecto 480px. */
  readonly anchoMax?: string;
}

export function VentanaAuth({ children, anchoMax = '480px' }: VentanaAuthProps) {
  return (
    <div
      className="w-full mx-auto rounded-2xl px-8 py-10"
      style={{
        maxWidth: anchoMax,
        backgroundColor: 'var(--color-fondo-tarjeta)',
        boxShadow: 'var(--sombra-md)',
      }}
    >
      {children}
    </div>
  );
}
