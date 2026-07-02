'use client';

/**
 * Campo de texto libre asociado a una opcion tipo otro/cual.
 */

import { estilosCampoTexto } from '../estilosCampo';

const MENSAJE_TEXTO_OTRO_REQUERIDO = 'Es obligatorio especificar tu respuesta.';

interface CampoTextoOtroProps {
  readonly id: string;
  readonly valor: string;
  readonly onCambio: (texto: string) => void;
  readonly deshabilitada?: boolean;
  readonly etiqueta?: string;
  readonly obligatorio?: boolean;
}

export function CampoTextoOtro({
  id,
  valor,
  onCambio,
  deshabilitada = false,
  etiqueta = 'Especifique',
  obligatorio = false,
}: CampoTextoOtroProps) {
  const idCampo = `${id}-otro-texto`;
  const idError = `${idCampo}-error`;
  const faltaValor = obligatorio && valor.trim() === '';

  return (
    <div className="mt-3 w-full">
      <label
        htmlFor={idCampo}
        className="block text-sm mb-1"
        style={{ color: 'var(--color-texto-secundario)' }}
      >
        {etiqueta}
        {obligatorio && (
          <span aria-hidden="true" style={{ color: 'var(--color-error)' }}>
            {' *'}
          </span>
        )}
      </label>
      <input
        id={idCampo}
        type="text"
        value={valor}
        disabled={deshabilitada}
        onChange={(evento) => onCambio(evento.target.value)}
        className="w-full rounded-lg px-4 py-3 text-sm"
        style={estilosCampoTexto(
          faltaValor ? MENSAJE_TEXTO_OTRO_REQUERIDO : undefined,
          deshabilitada,
        )}
        placeholder="Escriba aquí..."
        autoComplete="off"
        required={obligatorio}
        aria-required={obligatorio}
        aria-invalid={faltaValor}
        aria-describedby={faltaValor ? idError : undefined}
      />
      {faltaValor && (
        <p
          id={idError}
          role="alert"
          className="mt-1 text-sm"
          style={{ color: 'var(--color-error)' }}
        >
          {MENSAJE_TEXTO_OTRO_REQUERIDO}
        </p>
      )}
    </div>
  );
}
