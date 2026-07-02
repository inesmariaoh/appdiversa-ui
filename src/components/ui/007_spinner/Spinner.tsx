'use client';

/**
 * Indicador de carga circular reutilizable.
 */

interface SpinnerProps {
  readonly tamano?: 'sm' | 'md';
  readonly etiqueta?: string;
}

export function Spinner({ tamano = 'md', etiqueta = 'Cargando' }: SpinnerProps) {
  const clases = tamano === 'sm' ? 'h-5 w-5' : 'h-8 w-8';

  return (
    <span
      role="status"
      aria-label={etiqueta}
      className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent ${clases}`}
      style={{ color: 'var(--color-primario)' }}
    />
  );
}
