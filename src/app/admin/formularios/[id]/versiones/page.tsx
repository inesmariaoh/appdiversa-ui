'use client';

import { use, useCallback, useEffect, useState } from 'react';
import { TienePermiso } from '@/components/auth/007_tiene_permiso';
import { PERMISO_FORMULARIOS_VER } from '@/types/auth';
import { listarVersionesAdmin } from '@/services/formulariosAdminServicio';
import type { VersionFormularioAdmin } from '@/types/admin';
import { extraerDetalleError } from '@/utils/erroresApi';
import { ejecutarSinEspera } from '@/utils/ejecutarSinEspera';

interface PaginaVersionesProps {
  readonly params: Promise<{ id: string }>;
}

export default function PaginaVersionesFormulario({ params }: PaginaVersionesProps) {
  const { id } = use(params);
  const [versiones, setVersiones] = useState<VersionFormularioAdmin[]>([]);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      const lista = await listarVersionesAdmin(Number(id));
      setVersiones(lista);
    } catch (err) {
      setError(extraerDetalleError(err));
    }
  }, [id]);

  useEffect(() => {
    let cancelado = false;
    ejecutarSinEspera((async () => {
      await cargar();
      if (cancelado) return;
    })());
    return () => {
      cancelado = true;
    };
  }, [cargar]);

  return (
    <TienePermiso permiso={PERMISO_FORMULARIOS_VER}>
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-texto-primario)' }}>
        Versiones del formulario
      </h1>
      {error && <p role="alert" style={{ color: 'var(--color-error)' }}>{error}</p>}
      <ul className="flex flex-col gap-2" role="list">
        {versiones.map((v) => (
          <li key={v.id} className="p-3 rounded-lg border" style={{ borderColor: 'var(--color-borde)' }}>
            Versión {v.numero_version} — {v.estado}
          </li>
        ))}
      </ul>
    </TienePermiso>
  );
}
