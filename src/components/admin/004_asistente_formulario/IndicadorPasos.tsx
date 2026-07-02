'use client';

/**
 * Indicador visual de progreso del asistente. Muestra los pasos como una
 * secuencia navegable con estado completado, activo o pendiente.
 */

import type { DefinicionPaso, PasoAsistenteId } from './pasos';

interface IndicadorPasosProps {
  readonly pasos: readonly DefinicionPaso[];
  readonly pasoActual: PasoAsistenteId;
  readonly estaCompleto: (id: PasoAsistenteId) => boolean;
  readonly onSeleccionar: (id: PasoAsistenteId) => void;
}

export function IndicadorPasos({
  pasos,
  pasoActual,
  estaCompleto,
  onSeleccionar,
}: IndicadorPasosProps) {
  return (
    <nav aria-label="Progreso del asistente" className="mb-8">
      <ol className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3" role="list">
        {pasos.map((paso) => (
          <li key={paso.id} className="flex-1 min-w-[8rem]">
            <BotonPaso
              paso={paso}
              activo={paso.id === pasoActual}
              completo={estaCompleto(paso.id)}
              onSeleccionar={onSeleccionar}
            />
          </li>
        ))}
      </ol>
    </nav>
  );
}

interface BotonPasoProps {
  readonly paso: DefinicionPaso;
  readonly activo: boolean;
  readonly completo: boolean;
  readonly onSeleccionar: (id: PasoAsistenteId) => void;
}

function BotonPaso({ paso, activo, completo, onSeleccionar }: BotonPasoProps) {
  const colorBorde = activo ? 'var(--color-primario)' : 'var(--color-borde)';
  return (
    <button
      type="button"
      aria-current={activo ? 'step' : undefined}
      onClick={() => onSeleccionar(paso.id)}
      className="flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors"
      style={{
        borderColor: colorBorde,
        backgroundColor: activo
          ? 'color-mix(in srgb, var(--color-primario) 10%, transparent)'
          : 'var(--color-fondo-tarjeta)',
        minHeight: 'var(--tamano-control-min)',
      }}
    >
      <MarcaPaso numero={paso.numero} activo={activo} completo={completo} />
      <span className="flex flex-col">
        <span
          className="text-sm font-semibold"
          style={{ color: activo ? 'var(--color-primario)' : 'var(--color-texto-primario)' }}
        >
          {paso.etiqueta}
        </span>
        <span className="text-xs" style={{ color: 'var(--color-texto-muted)' }}>
          {paso.descripcion}
        </span>
      </span>
    </button>
  );
}

function MarcaPaso({
  numero,
  activo,
  completo,
}: {
  readonly numero: number;
  readonly activo: boolean;
  readonly completo: boolean;
}) {
  const fondo = obtenerColorMarca(activo, completo);
  return (
    <span
      aria-hidden="true"
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold"
      style={{ backgroundColor: fondo, color: 'var(--color-texto-invertido)' }}
    >
      {completo ? <IconoCheck /> : numero}
    </span>
  );
}

function obtenerColorMarca(activo: boolean, completo: boolean): string {
  if (completo) return 'var(--color-exito, #16a34a)';
  if (activo) return 'var(--color-primario)';
  return 'var(--color-borde-fuerte)';
}

function IconoCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}
