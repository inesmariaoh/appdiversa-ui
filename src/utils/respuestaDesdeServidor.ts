/**
 * Convierte respuestas del backend al formato de valor del formulario.
 */

import type { Pregunta } from '@/types/formulario';
import type { Respuesta } from '@/types/respuesta';

function parsearValorJson(valor: unknown): unknown {
  if (valor === null || valor === undefined || valor === '') return null;
  if (typeof valor === 'object') return valor;
  if (typeof valor === 'string') {
    try {
      return JSON.parse(valor) as unknown;
    } catch {
      return valor;
    }
  }
  return valor;
}

function parsearFechaIso(valor: string | null): unknown {
  if (!valor) return null;
  const partes = valor.split('-');
  if (partes.length !== 3) return valor;
  const [anio, mes, dia] = partes;
  return { anio, mes, dia };
}

export function valorDesdeRespuestaServidor(
  pregunta: Pregunta,
  respuesta: Respuesta
): unknown {
  const json = parsearValorJson(respuesta.valor_json);
  if (json !== null && json !== undefined && json !== '') {
    return json;
  }

  switch (pregunta.tipo_pregunta) {
    case 'numero':
      return respuesta.valor_numero ?? respuesta.valor_texto ?? '';
    case 'checkbox':
    case 'select_multiple':
      if (respuesta.valor_texto.includes(',')) {
        return respuesta.valor_texto.split(',').map((item) => item.trim());
      }
      return respuesta.valor_texto ? [respuesta.valor_texto] : [];
    case 'fecha':
      return parsearFechaIso(respuesta.valor_fecha) ?? respuesta.valor_texto;
    case 'hora':
      return respuesta.valor_hora ?? respuesta.valor_texto;
    case 'fecha_hora':
      return respuesta.valor_fecha_hora ?? respuesta.valor_texto;
    default:
      if (respuesta.valor_booleano !== null) {
        return respuesta.valor_booleano;
      }
      return respuesta.valor_texto ?? '';
  }
}

export function mapaValoresDesdeRespuestasServidor(
  preguntas: Pregunta[],
  respuestas: Respuesta[]
): Record<string, unknown> {
  const mapa: Record<string, unknown> = {};
  for (const respuesta of respuestas) {
    const pregunta = preguntas.find((item) => item.codigo === respuesta.codigo_pregunta);
    if (!pregunta) continue;
    mapa[pregunta.codigo] = valorDesdeRespuestaServidor(pregunta, respuesta);
  }
  return mapa;
}

export function mapaObservacionesDesdeRespuestasServidor(
  respuestas: Respuesta[],
): Record<string, string> {
  const mapa: Record<string, string> = {};
  for (const respuesta of respuestas) {
    if (respuesta.observacion) {
      mapa[respuesta.codigo_pregunta] = respuesta.observacion;
    }
  }
  return mapa;
}
