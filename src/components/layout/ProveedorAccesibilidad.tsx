'use client';

/**
 * Proveedor cliente que aplica los atributos de accesibilidad al elemento HTML.
 * Se usa dentro del layout raiz para que los data-attributes CSS funcionen.
 */

import { useAccesibilidad } from '@/hooks/useAccesibilidad';

interface ProveedorAccesibilidadProps {
  readonly children: React.ReactNode;
}

export function ProveedorAccesibilidad({ children }: ProveedorAccesibilidadProps) {
  useAccesibilidad();
  return <>{children}</>;
}
