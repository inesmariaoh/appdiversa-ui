'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FormularioBaseAdmin } from '@/components/admin/003_formulario_base';
import { TienePermiso } from '@/components/auth/007_tiene_permiso';
import { PERMISO_FORMULARIOS_EDITAR } from '@/types/auth';
import { crearFormularioAdmin } from '@/services/formulariosAdminServicio';
import { extraerDetalleError } from '@/utils/erroresApi';

export default function PaginaNuevoFormulario() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  return (
    <TienePermiso permiso={PERMISO_FORMULARIOS_EDITAR}>
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-texto-primario)' }}>
        Nuevo formulario
      </h1>
      {error && (
        <p role="alert" className="mb-4" style={{ color: 'var(--color-error)' }}>
          {error}
        </p>
      )}
      <FormularioBaseAdmin
        cargando={cargando}
        etiquetaBoton="Crear formulario"
        onEnviar={async (datos) => {
          setCargando(true);
          setError(null);
          try {
            const creado = await crearFormularioAdmin(datos);
            router.push(`/admin/formularios/${creado.id}/editor`);
          } catch (err) {
            setError(extraerDetalleError(err));
          } finally {
            setCargando(false);
          }
        }}
      />
    </TienePermiso>
  );
}
