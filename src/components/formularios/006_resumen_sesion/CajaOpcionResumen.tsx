/**
 * Caja de respuesta seleccionada en modo lectura (Figma parte06).
 */

type TipoIndicadorResumen = 'radio' | 'checkbox' | 'ninguno';

interface CajaOpcionResumenProps {
  readonly texto: string;
  readonly tipoIndicador?: TipoIndicadorResumen;
  readonly className?: string;
}

export function CajaOpcionResumen({
  texto,
  tipoIndicador = 'radio',
  className = '',
}: CajaOpcionResumenProps) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm ${className}`.trim()}
      style={{
        minHeight: '44px',
        border: '1.5px solid var(--color-primario)',
        backgroundColor: 'color-mix(in srgb, var(--color-primario) 6%, var(--color-fondo-tarjeta))',
        color: 'var(--color-texto-primario)',
      }}
    >
      {tipoIndicador === 'radio' && <IndicadorRadioResumen />}
      {tipoIndicador === 'checkbox' && <IndicadorCheckboxResumen />}
      <span className="flex-1">{texto}</span>
    </div>
  );
}

function IndicadorRadioResumen() {
  return (
    <span
      aria-hidden="true"
      className="flex-shrink-0 rounded-full flex items-center justify-center"
      style={{
        width: '20px',
        height: '20px',
        border: '2px solid var(--color-primario)',
        backgroundColor: 'var(--color-primario)',
      }}
    >
      <span
        className="rounded-full"
        style={{ width: '8px', height: '8px', backgroundColor: '#ffffff' }}
      />
    </span>
  );
}

function IndicadorCheckboxResumen() {
  return (
    <span
      aria-hidden="true"
      className="flex-shrink-0 rounded flex items-center justify-center"
      style={{
        width: '20px',
        height: '20px',
        backgroundColor: 'var(--color-primario)',
        color: '#ffffff',
      }}
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path
          d="M2 6l3 3 5-5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
