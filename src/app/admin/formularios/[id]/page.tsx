'use client';

import { use, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { TienePermiso } from '@/components/auth/007_tiene_permiso';
import { PERMISO_FORMULARIOS_VER } from '@/types/auth';
import { obtenerFormularioAdmin } from '@/services/formulariosAdminServicio';
import type { FormularioAdminDetalle } from '@/types/admin';
import { extraerDetalleError } from '@/utils/erroresApi';
import { SkeletonFormulario } from '@/components/ui/004_skeleton';
import { ejecutarSinEspera } from '@/utils/ejecutarSinEspera';

interface PaginaDetalleFormularioProps {
  readonly params: Promise<{ id: string }>;
}

export default function PaginaDetalleFormulario({ params }: PaginaDetalleFormularioProps) {
  const { id } = use(params);
  const idNumerico = Number(id);
  const [detalle, setDetalle] = useState<FormularioAdminDetalle | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      const formulario = await obtenerFormularioAdmin(idNumerico);
      setDetalle(formulario);
    } catch (err) {
      setError(extraerDetalleError(err));
    }
  }, [idNumerico]);

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
      {!detalle && !error && <SkeletonFormulario />}
      {error && <p role="alert" style={{ color: 'var(--color-error)' }}>{error}</p>}
      {detalle && (
        <div>
          <h1 className="text-2xl font-bold mb-2">{detalle.nombre}</h1>
          <p className="mb-4 text-sm" style={{ color: 'var(--color-texto-muted)' }}>
            {detalle.descripcion}
          </p>
          <div className="flex gap-4 mb-6">
            <Link href={`/admin/formularios/${id}/editor`} style={{ color: 'var(--color-primario)' }}>
              Abrir editor
            </Link>
            <Link href={`/admin/formularios/${id}/versiones`} style={{ color: 'var(--color-primario)' }}>
              Ver versiones
            </Link>
          </div>
        </div>
      )}
    </TienePermiso>
  );
}
