'use client';

import { ListadoUsuariosAdmin } from '@/components/admin/011_listado_usuarios';
import { TieneRol } from '@/components/auth/008_tiene_rol';
import { GRUPO_ADMINISTRADOR_GENERAL, GRUPO_ADMIN_APPDIVERSA } from '@/types/auth';

export default function PaginaUsuariosAdmin() {
  return (
    <TieneRol rol={[GRUPO_ADMINISTRADOR_GENERAL, GRUPO_ADMIN_APPDIVERSA]}>
      <ListadoUsuariosAdmin />
    </TieneRol>
  );
}
