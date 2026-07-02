'use client';

/**
 * Insignia de estado del formulario con color segun su valor.
 */

import type { EstadoFormularioAdmin } from '@/types/admin';

interface EstiloEstado {
  readonly fondo: string;
  readonly texto: string;
}

const COLORES_ESTADO: Record<EstadoFormularioAdmin, EstiloEstado> = {
  borrador: {
    fondo: 'color-mix(in srgb, var(--color-texto-muted) 16%, transparent)',
    texto: 'var(--color-texto-secundario)',
  },
  publicado: {
    fondo: 'color-mix(in srgb, #16a34a 16%, transparent)',
    texto: '#15803d',
  },
  cerrado: {
    fondo: 'color-mix(in srgb, var(--color-error) 16%, transparent)',
    texto: 'var(--color-error)',
  },
  archivado: {
    fondo: 'color-mix(in srgb, var(--color-texto-muted) 12%, transparent)',
    texto: 'var(--color-texto-muted)',
  },
};

export function EstadoBadge({ estado }: { readonly estado: EstadoFormularioAdmin }) {
  const estilo = COLORES_ESTADO[estado] ?? COLORES_ESTADO.borrador;
  return (
    <span
      className="inline-block rounded-full px-2.5 py-1 text-xs font-medium capitalize"
      style={{ backgroundColor: estilo.fondo, color: estilo.texto }}
    >
      {estado}
    </span>
  );
}
