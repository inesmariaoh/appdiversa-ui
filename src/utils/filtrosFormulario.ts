/**
 * Utilidades genericas para validacion de preguntas filtro/preliminares.
 */

import type { FormularioEstructura, Pregunta } from '@/types/formulario';
import { contenidoTextoFormulario } from '@/utils/textosFormulario';
import type {
  FiltroCumplido,
  FiltroNoCumplido,
  FiltroPendiente,
  ResultadoFiltroPregunta,
  TipoValidacionFiltro,
  ValidacionFiltro,
} from '@/types/filtros';
import type { ValorFecha } from '@/components/preguntas/001_pregunta_fecha';

const CLAVE_VALOR = 'valor';
const CLAVE_VALORES = 'valores';

export function calcularEdad(
  fechaNacimiento: Date,
  fechaReferencia: Date = new Date(),
): number {
  let edad = fechaReferencia.getFullYear() - fechaNacimiento.getFullYear();
  const mesReferencia = fechaReferencia.getMonth();
  const diaReferencia = fechaReferencia.getDate();
  const mesNacimiento = fechaNacimiento.getMonth();
  const diaNacimiento = fechaNacimiento.getDate();

  if (
    mesReferencia < mesNacimiento ||
    (mesReferencia === mesNacimiento && diaReferencia < diaNacimiento)
  ) {
    edad -= 1;
  }
  return edad;
}

function extraerFechaDesdeValor(valor: unknown): Date | null {
  if (!valor || typeof valor !== 'object') {
    return null;
  }
  const fecha = valor as ValorFecha;
  if (!fecha.anio || !fecha.mes || !fecha.dia) {
    return null;
  }
  const anio = Number.parseInt(fecha.anio, 10);
  const mes = Number.parseInt(fecha.mes, 10);
  const dia = Number.parseInt(fecha.dia, 10);
  if (Number.isNaN(anio) || Number.isNaN(mes) || Number.isNaN(dia)) {
    return null;
  }
  const resultado = new Date(anio, mes - 1, dia);
  if (
    resultado.getFullYear() !== anio ||
    resultado.getMonth() !== mes - 1 ||
    resultado.getDate() !== dia
  ) {
    return null;
  }
  return resultado;
}

function normalizarValorEsperado(valorEsperado: unknown): unknown {
  if (!valorEsperado || typeof valorEsperado !== 'object') {
    return valorEsperado;
  }
  const datos = valorEsperado as Record<string, unknown>;
  if (CLAVE_VALOR in datos) {
    return datos[CLAVE_VALOR];
  }
  if (CLAVE_VALORES in datos) {
    return datos[CLAVE_VALORES];
  }
  return valorEsperado;
}

export function resolverValidacionFiltro(pregunta: Pregunta): ValidacionFiltro | null {
  if (!pregunta.es_pregunta_filtro) {
    return null;
  }
  if (pregunta.validacion_filtro) {
    return pregunta.validacion_filtro;
  }

  let tipo: TipoValidacionFiltro | null = null;
  if (pregunta.tipo_validacion_filtro) {
    tipo = pregunta.tipo_validacion_filtro;
  } else if (
    pregunta.tipo_pregunta === 'fecha' &&
    (pregunta.valor_minimo !== null || pregunta.valor_maximo !== null)
  ) {
    tipo = 'rango_edad';
  } else if (pregunta.tipo_pregunta === 'radio' || pregunta.tipo_pregunta === 'select') {
    tipo = 'opcion_exacta';
  }

  if (!tipo) {
    return null;
  }

  return {
    tipo_validacion: tipo,
    valor_minimo: pregunta.valor_minimo,
    valor_maximo: pregunta.valor_maximo,
    valor_esperado: pregunta.valor_filtro_esperado ?? null,
    bloquea_continuacion: pregunta.bloquea_continuacion_si_no_cumple ?? true,
    mensaje_no_cumple:
      pregunta.mensaje_no_cumple?.trim() ||
      pregunta.mensaje_error?.trim() ||
      null,
  };
}

export function validarRangoEdad(
  fechaNacimiento: Date,
  edadMinima: number,
  edadMaxima: number,
  fechaReferencia: Date = new Date(),
): boolean {
  const edad = calcularEdad(fechaNacimiento, fechaReferencia);
  return edad >= edadMinima && edad <= edadMaxima;
}

export function validarOpcionExacta(valor: unknown, valorEsperado: unknown): boolean {
  if (valorEsperado === null || valorEsperado === undefined) {
    return valor !== null && valor !== undefined && String(valor).trim() !== '';
  }
  return String(valor) === String(valorEsperado);
}

export function validarListaOpciones(valor: unknown, valoresPermitidos: unknown): boolean {
  if (!Array.isArray(valoresPermitidos)) {
    return validarOpcionExacta(valor, valoresPermitidos);
  }
  if (Array.isArray(valor)) {
    return valor.some((item) => valoresPermitidos.includes(item));
  }
  return valoresPermitidos.includes(valor);
}

function evaluarPorTipo(
  pregunta: Pregunta,
  validacion: ValidacionFiltro,
  valor: unknown,
  fechaReferencia: Date,
): boolean {
  switch (validacion.tipo_validacion) {
    case 'rango_edad': {
      const fecha = extraerFechaDesdeValor(valor);
      if (!fecha) {
        return false;
      }
      const minimo = Number(validacion.valor_minimo ?? pregunta.valor_minimo ?? 0);
      const maximo = Number(validacion.valor_maximo ?? pregunta.valor_maximo ?? 200);
      return validarRangoEdad(fecha, minimo, maximo, fechaReferencia);
    }
    case 'opcion_exacta':
      return validarOpcionExacta(
        valor,
        normalizarValorEsperado(validacion.valor_esperado),
      );
    case 'lista_opciones':
      return validarListaOpciones(
        valor,
        normalizarValorEsperado(validacion.valor_esperado),
      );
    case 'rango_numerico': {
      const numero = Number(valor);
      if (Number.isNaN(numero)) {
        return false;
      }
      const minimo = Number(validacion.valor_minimo ?? pregunta.valor_minimo);
      const maximo = Number(validacion.valor_maximo ?? pregunta.valor_maximo);
      if (!Number.isNaN(minimo) && numero < minimo) {
        return false;
      }
      if (!Number.isNaN(maximo) && numero > maximo) {
        return false;
      }
      return true;
    }
    case 'booleano': {
      const esperado = normalizarValorEsperado(validacion.valor_esperado);
      if (typeof esperado === 'boolean') {
        return Boolean(valor) === esperado;
      }
      return validarOpcionExacta(valor, esperado);
    }
    default:
      return true;
  }
}

export function evaluarPreguntaFiltro(
  pregunta: Pregunta,
  respuesta: unknown,
  fechaReferencia: Date = new Date(),
): ResultadoFiltroPregunta {
  const validacion = resolverValidacionFiltro(pregunta);
  if (!validacion) {
    return { estado: 'cumplido', codigoPregunta: pregunta.codigo };
  }

  if (
    respuesta === null ||
    respuesta === undefined ||
    (typeof respuesta === 'string' && respuesta.trim() === '')
  ) {
    return { estado: 'pendiente', codigoPregunta: pregunta.codigo };
  }

  const cumple = evaluarPorTipo(pregunta, validacion, respuesta, fechaReferencia);
  if (cumple) {
    return { estado: 'cumplido', codigoPregunta: pregunta.codigo };
  }

  const mensaje =
    validacion.mensaje_no_cumple ||
    pregunta.mensaje_error ||
    'No cumple las condiciones para continuar.';

  return {
    estado: 'no_cumplido',
    codigoPregunta: pregunta.codigo,
    mensaje,
    bloqueaContinuacion: validacion.bloquea_continuacion,
  };
}

export function obtenerPreguntasFiltro(preguntas: Pregunta[]): Pregunta[] {
  return preguntas
    .filter((pregunta) => pregunta.es_pregunta_filtro)
    .sort((a, b) => a.orden - b.orden);
}

export function obtenerPreguntasFiltroDesdeEstructura(
  secciones: Array<{ preguntas: Pregunta[] }>,
): Pregunta[] {
  return obtenerPreguntasFiltro(secciones.flatMap((seccion) => seccion.preguntas));
}

export function todasFiltrosCumplen(
  preguntasFiltro: Pregunta[],
  respuestas: Record<string, unknown>,
): boolean {
  return preguntasFiltro.every((pregunta) => {
    const resultado = evaluarPreguntaFiltro(pregunta, respuestas[pregunta.codigo]);
    return resultado.estado === 'cumplido';
  });
}

export function esResultadoNoCumplido(
  resultado: ResultadoFiltroPregunta,
): resultado is FiltroNoCumplido {
  return resultado.estado === 'no_cumplido';
}

export function esResultadoPendiente(
  resultado: ResultadoFiltroPregunta,
): resultado is FiltroPendiente {
  return resultado.estado === 'pendiente';
}

export function esResultadoCumplido(
  resultado: ResultadoFiltroPregunta,
): resultado is FiltroCumplido {
  return resultado.estado === 'cumplido';
}

export const TITULO_MODAL_NO_ELEGIBLE_PREDETERMINADO = 'No es posible continuar';

export const CUERPO_MODAL_NO_ELEGIBLE_PREDETERMINADO =
  'Gracias por tu interés en diligenciar esta encuesta. De acuerdo con tus respuestas, en esta ocasión no cumples con los requisitos para participar. Te invitamos a revisar otras encuestas que se adapten a tu perfil.';

function normalizarTextoComparacion(texto: string): string {
  return texto.trim().replace(/\s+/g, ' ').toLowerCase();
}

export function construirCuerpoModalNoElegible(
  estructura: FormularioEstructura,
  mensajeEspecifico: string | null,
): string {
  const base = contenidoTextoFormulario(
    estructura,
    'no_cumple_condiciones',
    CUERPO_MODAL_NO_ELEGIBLE_PREDETERMINADO,
  );
  const detalle = mensajeEspecifico?.trim();
  if (!detalle || normalizarTextoComparacion(detalle) === normalizarTextoComparacion(base)) {
    return base;
  }
  return `${base}\n\n${detalle}`;
}
