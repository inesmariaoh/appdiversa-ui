/**
 * Indice de preguntas por codigo a partir de las secciones del formulario.
 */

import type { Pregunta, SeccionFormulario } from '@/types/formulario';

export function indicePreguntasDesdeSecciones(
  secciones: SeccionFormulario[],
): Map<string, Pregunta> {
  const indice = new Map<string, Pregunta>();
  for (const seccion of secciones) {
    for (const pregunta of seccion.preguntas) {
      indice.set(pregunta.codigo, pregunta);
    }
  }
  return indice;
}
