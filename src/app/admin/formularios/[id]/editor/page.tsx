'use client';

import { use } from 'react';
import { AsistenteFormulario } from '@/components/admin/004_asistente_formulario';
import { TienePermiso } from '@/components/auth/007_tiene_permiso';
import { PERMISO_FORMULARIOS_EDITAR } from '@/types/auth';

interface PaginaEditorProps {
  readonly params: Promise<{ id: string }>;
}

export default function PaginaEditorFormulario({ params }: PaginaEditorProps) {
  const { id } = use(params);

  return (
    <TienePermiso permiso={PERMISO_FORMULARIOS_EDITAR}>
      <AsistenteFormulario idFormulario={Number(id)} />
    </TienePermiso>
  );
}
