/**
 * Convierte respuestas almacenadas en IndexedDB al formato de valor del formulario.
 */

import type { Pregunta } from '@/types/formulario';
import type { RegistroRespuestaLocal } from '@/storage/appDiversaDb';

export function mapaValoresDesdeRespuestasLocales(
  preguntas: Pregunta[],
  registros: RegistroRespuestaLocal[]
): Record<string, unknown> {
  const codigosValidos = new Set(preguntas.map((pregunta) => pregunta.codigo));
  const mapa: Record<string, unknown> = {};
  for (const registro of registros) {
    if (!codigosValidos.has(registro.codigo_pregunta)) continue;
    if (registro.valor === undefined || registro.valor === null) continue;
    mapa[registro.codigo_pregunta] = registro.valor;
  }
  return mapa;
}
