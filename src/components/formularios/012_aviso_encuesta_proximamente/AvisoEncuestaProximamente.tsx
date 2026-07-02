'use client';

/**
 * Aviso cuando el usuario intenta acceder a una encuesta aun no disponible.
 */

import Link from 'next/link';
import type { FormularioDisponible } from '@/types/formulario';
import { formatearFechaLanzamiento } from '@/utils/formatearFechaLanzamiento';

interface AvisoEncuestaProximamenteProps {
  readonly formulario: Pick<FormularioDisponible, 'nombre' | 'fecha_inicio'>;
}

export function AvisoEncuestaProximamente({ formulario }: AvisoEncuestaProximamenteProps) {
  const fechaLanzamiento = formatearFechaLanzamiento(formulario.fecha_inicio);

  return (
    <div
      className="rounded-xl p-6 sm:p-8 flex flex-col gap-4"
      role="status"
      aria-live="polite"
      style={{
        backgroundColor: 'var(--color-fondo-tarjeta)',
        boxShadow: 'var(--sombra-md)',
      }}
    >
      <h1
        className="text-xl font-bold"
        style={{ color: 'var(--color-texto-primario)' }}
      >
        {formulario.nombre}
      </h1>
      <p style={{ color: 'var(--color-texto-secundario)' }}>
        Esta encuesta estará disponible próximamente.
      </p>
      {fechaLanzamiento && (
        <p
          className="text-sm font-medium"
          style={{ color: 'var(--color-texto-muted)' }}
        >
          Lanzamiento: {fechaLanzamiento}
        </p>
      )}
      <Link
        href="/"
        className="inline-flex items-center justify-center px-4 py-3 text-sm font-semibold rounded-lg w-fit"
        style={{
          backgroundColor: 'var(--color-primario)',
          color: 'var(--color-texto-sobre-primario)',
          minHeight: 'var(--tamano-control-min)',
        }}
      >
        Volver al inicio
      </Link>
    </div>
  );
}
