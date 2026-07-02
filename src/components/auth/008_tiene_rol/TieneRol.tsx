'use client';

/**
 * Guard que exige pertenecer a uno o varios grupos o roles especificos.
 */

import type { ReactNode } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Pantalla403 } from '@/components/admin/012_pantalla_403';

interface TieneRolProps {
  readonly rol: string | readonly string[];
  readonly children: ReactNode;
  readonly mensaje?: string;
}

export function TieneRol({ rol, children, mensaje }: TieneRolProps) {
  const grupos = useAuthStore((s) => s.grupos);
  const rolesRequeridos = Array.isArray(rol) ? rol : [rol];
  const autorizado = rolesRequeridos.some((codigo) => grupos.includes(codigo));

  if (!autorizado) {
    return (
      <Pantalla403
        mensaje={
          mensaje ?? 'Su rol no permite acceder a esta sección.'
        }
      />
    );
  }

  return children;
}
