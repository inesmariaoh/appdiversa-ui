/**
 * Icono de informacion para tooltip de una opcion de respuesta.
 */

interface IconoTooltipOpcionProps {
  readonly etiqueta: string;
  readonly tooltip: string;
}

export function IconoTooltipOpcion({ etiqueta, tooltip }: IconoTooltipOpcionProps) {
  return (
    <span
      title={tooltip}
      aria-label={`Información sobre ${etiqueta}: ${tooltip}`}
      className="flex-shrink-0 rounded-full flex items-center justify-center text-xs font-bold cursor-help"
      style={{
        width: '20px',
        height: '20px',
        border: '1.5px solid var(--color-borde-fuerte)',
        color: 'var(--color-texto-secundario)',
      }}
    >
      i
    </span>
  );
}
