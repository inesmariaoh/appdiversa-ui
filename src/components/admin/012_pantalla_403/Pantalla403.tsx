'use client';

/**
 * Pantalla amigable de acceso denegado (HTTP 403).
 */

import Link from 'next/link';
import { Boton } from '@/components/ui/001_boton';

interface Pantalla403Props {
  readonly mensaje?: string;
}

export function Pantalla403({
  mensaje = 'No tiene permisos para acceder a este recurso.',
}: Pantalla403Props) {
  return (
    <div
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
      role="alert"
      aria-live="polite"
    >
      <p
        className="text-6xl font-bold mb-4"
        style={{ color: 'var(--color-primario)' }}
        aria-hidden="true"
      >
        403
      </p>
      <h1
        className="text-2xl font-bold mb-3"
        style={{ color: 'var(--color-texto-primario)' }}
      >
        Acceso denegado
      </h1>
      <p
        className="mb-8 max-w-md"
        style={{ color: 'var(--color-texto-secundario)' }}
      >
        {mensaje}
      </p>
      <Link href="/">
        <Boton variante="secundario">Volver al inicio</Boton>
      </Link>
    </div>
  );
}
