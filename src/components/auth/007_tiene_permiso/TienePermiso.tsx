'use client';

/**
 * Guard que exige un permiso especifico del usuario autenticado.
 */

import type { ReactNode } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Pantalla403 } from '@/components/admin/012_pantalla_403';

interface TienePermisoProps {
  readonly permiso: string;
  readonly children: ReactNode;
  readonly mensaje?: string;
}

export function TienePermiso({ permiso, children, mensaje }: TienePermisoProps) {
  const tienePermiso = useAuthStore((s) => s.tienePermiso(permiso));

  if (!tienePermiso) {
    return (
      <Pantalla403
        mensaje={
          mensaje ??
          'No tiene permisos suficientes para acceder a esta sección.'
        }
      />
    );
  }

  return children;
}
