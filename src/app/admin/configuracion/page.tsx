'use client';

import { ConfiguracionAccesibilidadAdmin } from '@/components/admin/014_configuracion_accesibilidad';
import { TieneRol } from '@/components/auth/008_tiene_rol';
import { GRUPO_ADMINISTRADOR_GENERAL, GRUPO_ADMIN_APPDIVERSA } from '@/types/auth';

export default function PaginaConfiguracionAdmin() {
  return (
    <TieneRol rol={[GRUPO_ADMINISTRADOR_GENERAL, GRUPO_ADMIN_APPDIVERSA]}>
      <ConfiguracionAccesibilidadAdmin />
    </TieneRol>
  );
}
