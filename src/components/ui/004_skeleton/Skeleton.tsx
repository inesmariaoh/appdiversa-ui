'use client';

/**
 * Bloque reutilizable de animacion skeleton para estados de carga.
 */

interface SkeletonProps {
  readonly className?: string;
  readonly etiqueta?: string;
}

export function Skeleton({ className = '', etiqueta = 'Cargando contenido' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-lg ${className}`}
      style={{ backgroundColor: 'var(--color-fondo-pagina)' }}
      role="status"
      aria-label={etiqueta}
    />
  );
}

export function SkeletonTexto({ lineas = 3 }: { lineas?: number }) {
  return (
    <div className="flex flex-col gap-2" aria-hidden="true">
      {Array.from({ length: lineas }, (_, indice) => (
        <Skeleton
          key={`linea-${indice}`}
          className={`h-4 ${indice === lineas - 1 ? 'w-2/3' : 'w-full'}`}
        />
      ))}
    </div>
  );
}

export function SkeletonFormulario() {
  return (
    <div className="flex flex-col gap-4 p-6 rounded-xl" style={{ backgroundColor: 'var(--color-fondo-tarjeta)' }}>
      <Skeleton className="h-6 w-1/2" etiqueta="Cargando formulario" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-10 w-32" />
    </div>
  );
}
