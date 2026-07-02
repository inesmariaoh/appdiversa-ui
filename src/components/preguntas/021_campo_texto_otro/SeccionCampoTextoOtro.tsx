'use client';

/**
 * Seccion condicional con el campo de texto libre para opciones otro/cual.
 */

import type { OpcionRespuesta, Pregunta } from '@/types/formulario';
import {
  debeMostrarCampoTextoOtro,
  preguntaExigeTextoOtro,
} from '@/utils/interaccionOpciones';
import { CampoTextoOtro } from '../021_campo_texto_otro';

interface SeccionCampoTextoOtroProps {
  readonly pregunta: Pregunta;
  readonly valor: unknown;
  readonly opciones: OpcionRespuesta[];
  readonly observacion?: string;
  readonly onCambioObservacion?: (texto: string) => void;
  readonly deshabilitada?: boolean;
  readonly idPrefijo: string;
}

export function SeccionCampoTextoOtro({
  pregunta,
  valor,
  opciones,
  observacion = '',
  onCambioObservacion,
  deshabilitada = false,
  idPrefijo,
}: SeccionCampoTextoOtroProps) {
  const mostrar =
    pregunta.permite_otro && debeMostrarCampoTextoOtro(valor, opciones);

  if (!mostrar || !onCambioObservacion) {
    return null;
  }

  const obligatorio = preguntaExigeTextoOtro(pregunta.comportamiento_interaccion);

  return (
    <CampoTextoOtro
      id={idPrefijo}
      valor={observacion}
      onCambio={onCambioObservacion}
      deshabilitada={deshabilitada}
      obligatorio={obligatorio}
    />
  );
}
