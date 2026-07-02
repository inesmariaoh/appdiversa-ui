'use client';

/**
 * Encabezado del asistente con el nombre del formulario, su estado y accesos rapidos.
 */

import Link from 'next/link';
import type { FormularioAdminDetalle } from '@/types/admin';

interface EncabezadoAsistenteProps {
  readonly detalle: FormularioAdminDetalle;
}

export function EncabezadoAsistente({ detalle }: EncabezadoAsistenteProps) {
  return (
    <header className="mb-6">
      <div className="flex flex-wrap items-center gap-4">
        <Link
          href="/admin/formularios"
          className="text-sm"
          style={{ color: 'var(--color-primario)' }}
        >
          &larr; Volver a formularios
        </Link>
        <Link
          href={`/admin/formularios/${detalle.id}/versiones`}
          className="text-sm"
          style={{ color: 'var(--color-primario)' }}
        >
          Ver versiones
        </Link>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-texto-primario)' }}>
          {detalle.nombre}
        </h1>
        <EstadoEtiqueta estado={detalle.estado} />
      </div>
      <p className="mt-1 text-sm" style={{ color: 'var(--color-texto-muted)' }}>
        Codigo: {detalle.codigo}
      </p>
    </header>
  );
}

function EstadoEtiqueta({ estado }: { readonly estado: string }) {
  return (
    <span
      className="inline-block rounded-full px-3 py-1 text-xs font-medium capitalize"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--color-primario) 12%, transparent)',
        color: 'var(--color-primario)',
      }}
    >
      {estado}
    </span>
  );
}
