/**
 * Utilidades de compatibilidad para campo otro basadas en metadatos del backend.
 */

import type { OpcionRespuesta, Pregunta } from '@/types/formulario';
import {
  debeMostrarCampoTextoOtro as debeMostrarCampoTextoOtroBase,
  opcionRequiereCampoTexto,
} from './interaccionOpciones';

export function opcionActivaCampoOtro(
  pregunta: Pregunta,
  opcion: OpcionRespuesta,
): boolean {
  if (!pregunta.permite_otro) return false;
  return opcionRequiereCampoTexto(opcion);
}

export function debeMostrarCampoTextoOtro(
  pregunta: Pregunta,
  valor: unknown,
  opciones: OpcionRespuesta[],
): boolean {
  if (!pregunta.permite_otro) return false;
  return debeMostrarCampoTextoOtroBase(valor, opciones);
}

export function opcionSeleccionadaActivaCampoOtro(
  pregunta: Pregunta,
  opcion: OpcionRespuesta,
): boolean {
  return opcionActivaCampoOtro(pregunta, opcion);
}
