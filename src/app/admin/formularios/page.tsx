'use client';

import { ListadoFormulariosAdmin } from '@/components/admin/002_listado_formularios';
import { TienePermiso } from '@/components/auth/007_tiene_permiso';
import { PERMISO_FORMULARIOS_VER } from '@/types/auth';

export default function PaginaFormulariosAdmin() {
  return (
    <TienePermiso permiso={PERMISO_FORMULARIOS_VER}>
      <ListadoFormulariosAdmin />
    </TienePermiso>
  );
}
