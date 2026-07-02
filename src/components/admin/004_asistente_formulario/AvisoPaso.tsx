'use client';

/**
 * Aviso contextual que orienta al usuario cuando un paso aun no puede completarse.
 */

interface AvisoPasoProps {
  readonly mensaje: string;
}

export function AvisoPaso({ mensaje }: AvisoPasoProps) {
  return (
    <p
      role="status"
      className="rounded-xl border border-dashed p-6 text-sm"
      style={{
        borderColor: 'var(--color-borde-fuerte)',
        color: 'var(--color-texto-muted)',
        backgroundColor: 'var(--color-fondo-pagina)',
      }}
    >
      {mensaje}
    </p>
  );
}
