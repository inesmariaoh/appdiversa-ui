/**
 * Barra de progreso del formulario.
 * Muestra "Pregunta X de Y" y una barra visual con porcentaje de avance.
 * WCAG: usa role="progressbar" con aria-valuenow, aria-valuemin, aria-valuemax.
 */

interface BarraProgresoProps {
  readonly preguntaActual: number;
  readonly totalPreguntas: number;
  readonly etiqueta?: string;
}

export function BarraProgreso({
  preguntaActual,
  totalPreguntas,
  etiqueta,
}: BarraProgresoProps) {
  const porcentaje =
    totalPreguntas > 0
      ? Math.round((preguntaActual / totalPreguntas) * 100)
      : 0;

  const textoProgreso =
    etiqueta ?? `Pregunta ${preguntaActual} de ${totalPreguntas}`;

  return (
    <div className="w-full flex flex-col gap-2">
      <p
        className="text-sm"
        style={{ color: 'var(--color-texto-secundario)' }}
        aria-live="polite"
        aria-atomic="true"
      >
        Pregunta{' '}
        <strong style={{ color: 'var(--color-texto-primario)' }}>
          {preguntaActual}
        </strong>{' '}
        de{' '}
        <strong style={{ color: 'var(--color-texto-primario)' }}>
          {totalPreguntas}
        </strong>
      </p>

      <div
        role="progressbar"
        aria-valuenow={porcentaje}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={textoProgreso}
        className="w-full rounded-full overflow-hidden"
        style={{
          height: '6px',
          backgroundColor: 'var(--color-borde)',
        }}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${porcentaje}%`,
            backgroundColor: 'var(--color-primario)',
            transitionDuration: 'var(--duracion-transicion)',
          }}
        />
      </div>
    </div>
  );
}
