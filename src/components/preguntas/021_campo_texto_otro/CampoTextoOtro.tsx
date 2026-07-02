'use client';

/**
 * Campo de texto libre asociado a una opcion tipo otro/cual.
 */

import { estilosCampoTexto } from '../estilosCampo';

interface CampoTextoOtroProps {
  readonly id: string;
  readonly valor: string;
  readonly onCambio: (texto: string) => void;
  readonly deshabilitada?: boolean;
  readonly etiqueta?: string;
}

export function CampoTextoOtro({
  id,
  valor,
  onCambio,
  deshabilitada = false,
  etiqueta = 'Especifique',
}: CampoTextoOtroProps) {
  const idCampo = `${id}-otro-texto`;

  return (
    <div className="mt-3 w-full">
      <label
        htmlFor={idCampo}
        className="block text-sm mb-1"
        style={{ color: 'var(--color-texto-secundario)' }}
      >
        {etiqueta}
      </label>
      <input
        id={idCampo}
        type="text"
        value={valor}
        disabled={deshabilitada}
        onChange={(evento) => onCambio(evento.target.value)}
        className="w-full rounded-lg px-4 py-3 text-sm"
        style={estilosCampoTexto(undefined, deshabilitada)}
        placeholder="Escriba aquí..."
        autoComplete="off"
      />
    </div>
  );
}
