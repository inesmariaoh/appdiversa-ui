'use client';

import { ListadoCatalogosAdmin } from '@/components/admin/013_listado_catalogos';
import { TieneRol } from '@/components/auth/008_tiene_rol';
import { GRUPO_ADMINISTRADOR_GENERAL, GRUPO_ADMIN_APPDIVERSA } from '@/types/auth';

export default function PaginaCatalogosAdmin() {
  return (
    <TieneRol rol={[GRUPO_ADMINISTRADOR_GENERAL, GRUPO_ADMIN_APPDIVERSA]}>
      <ListadoCatalogosAdmin />
    </TieneRol>
  );
}
