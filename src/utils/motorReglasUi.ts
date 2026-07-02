/**
 * Utilidades puras para aplicar ResultadoReglas en la UI.
 */

import type { Pregunta, SeccionFormulario } from '@/types/formulario';
import type { ResultadoReglas } from '@/types/reglas';

export function preguntaVisibleSegunReglas(
  pregunta: Pregunta,
  resultado: ResultadoReglas,
): boolean {
  const codigo = pregunta.codigo;
  if (resultado.preguntas_ocultas.includes(codigo)) return false;
  if (resultado.preguntas_visibles.includes(codigo)) return true;
  return pregunta.visible_por_defecto ?? true;
}

export function preguntaHabilitadaSegunReglas(
  codigoPregunta: string,
  resultado: ResultadoReglas,
): boolean {
  if (resultado.preguntas_deshabilitadas.includes(codigoPregunta)) return false;
  if (resultado.preguntas_habilitadas.includes(codigoPregunta)) return true;
  return true;
}

export function preguntaObligatoriaSegunReglas(
  codigoPregunta: string,
  esObligatoriaBase: boolean,
  resultado: ResultadoReglas,
): boolean {
  if (resultado.preguntas_obligatorias.includes(codigoPregunta)) return true;
  if (resultado.preguntas_opcionales.includes(codigoPregunta)) return false;
  return esObligatoriaBase;
}

function construirMapaDestinoOrigenMostrar(
  preguntas: Pregunta[],
): Map<string, string> {
  const mapa = new Map<string, string>();
  for (const pregunta of preguntas) {
    for (const regla of pregunta.reglas_origen) {
      if (regla.accion !== 'mostrar' || !regla.pregunta_destino_codigo) {
        continue;
      }
      mapa.set(regla.pregunta_destino_codigo, pregunta.codigo);
    }
  }
  return mapa;
}

function resolverCodigoOrigenFlujo(
  pregunta: Pregunta,
  mapaDestinoOrigen: Map<string, string>,
): string | null {
  if (pregunta.pregunta_origen_flujo_codigo) {
    return pregunta.pregunta_origen_flujo_codigo;
  }
  return mapaDestinoOrigen.get(pregunta.codigo) ?? null;
}

export function ordenarPreguntasFlujoVisual(
  preguntas: Pregunta[],
  mapaDestinoOrigen: Map<string, string>,
): Pregunta[] {
  let resultado = [...preguntas];

  for (const dependiente of preguntas) {
    const origen = resolverCodigoOrigenFlujo(dependiente, mapaDestinoOrigen);
    if (!origen) {
      continue;
    }

    resultado = resultado.filter((item) => item.codigo !== dependiente.codigo);
    const indiceOrigen = resultado.findIndex((item) => item.codigo === origen);
    if (indiceOrigen >= 0) {
      resultado.splice(indiceOrigen + 1, 0, dependiente);
    } else {
      resultado.push(dependiente);
    }
  }

  return resultado;
}

export function listarPreguntasVisibles(
  secciones: SeccionFormulario[],
  resultado: ResultadoReglas,
): Pregunta[] {
  const todas = secciones
    .flatMap((seccion) => seccion.preguntas)
    .sort((a, b) => a.orden - b.orden);

  const visibles = todas.filter((pregunta) =>
    preguntaVisibleSegunReglas(pregunta, resultado),
  );

  const mapaOrigen = construirMapaDestinoOrigenMostrar(todas);
  return ordenarPreguntasFlujoVisual(visibles, mapaOrigen);
}

export function calcularNumeracionVisual(
  preguntas: Pregunta[],
): Map<string, number> {
  const mapa = new Map<string, number>();
  preguntas.forEach((pregunta, indice) => {
    mapa.set(pregunta.codigo, indice + 1);
  });
  return mapa;
}

export function preguntaConNumeroVisual(
  pregunta: Pregunta,
  numeroVisual: number,
): Pregunta {
  return { ...pregunta, orden: numeroVisual };
}

export function buscarIndicePregunta(
  preguntas: Pregunta[],
  codigoPregunta: string,
): number {
  return preguntas.findIndex((p) => p.codigo === codigoPregunta);
}

export function buscarIndiceSeccion(
  secciones: SeccionFormulario[],
  codigoSeccion: string,
): number {
  return secciones.findIndex((s) => s.codigo === codigoSeccion);
}

/** @deprecated Usar preguntaVisibleSegunReglas con objeto Pregunta */
export function preguntaVisibleSegunReglasPorCodigo(
  codigoPregunta: string,
  visiblePorDefecto: boolean,
  resultado: ResultadoReglas,
): boolean {
  if (resultado.preguntas_ocultas.includes(codigoPregunta)) return false;
  if (resultado.preguntas_visibles.includes(codigoPregunta)) return true;
  return visiblePorDefecto;
}
