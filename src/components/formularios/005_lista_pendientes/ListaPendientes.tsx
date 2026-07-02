'use client';

/**
 * Lista navegable de preguntas obligatorias pendientes antes de finalizar.
 */

import type { PreguntaPendiente } from '@/types/sesion';

interface ListaPendientesProps {
  readonly pendientes: PreguntaPendiente[];
  readonly onSeleccionar: (codigo: string) => void;
}

export function ListaPendientes({ pendientes, onSeleccionar }: ListaPendientesProps) {
  if (pendientes.length === 0) return null;

  return (
    <div
      className="rounded-lg p-4 flex flex-col gap-2"
      style={{
        backgroundColor: 'var(--color-fondo-pagina)',
        border: '1.5px solid var(--color-error)',
      }}
      role="alert"
    >
      <p className="text-sm font-semibold" style={{ color: 'var(--color-error)' }}>
        Complete las siguientes preguntas obligatorias:
      </p>
      <ul className="flex flex-col gap-1">
        {pendientes.map((item) => (
          <li key={item.codigo}>
            <button
              type="button"
              className="text-sm underline text-left w-full py-1"
              style={{ color: 'var(--color-texto-primario)' }}
              onClick={() => onSeleccionar(item.codigo)}
            >
              {item.seccion_titulo}: {item.texto}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
