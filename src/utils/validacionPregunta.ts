/**
 * Validacion local de respuestas segun tipo de pregunta.
 */

import { z } from 'zod';
import type { Pregunta, TipoPregunta, ValorUbicacionGeografica } from '@/types/formulario';
import type { ValorFecha } from '@/components/preguntas/001_pregunta_fecha';
import type { ValorMatriz } from '@/components/preguntas/014_pregunta_matriz';
import type { ValorGeolocalizacion } from '@/components/preguntas/017_pregunta_geolocalizacion';

function esFechaVacia(valor: unknown): boolean {
  if (typeof valor !== 'object' || valor === null || !('anio' in valor)) return true;
  const fecha = valor as ValorFecha;
  return !fecha.anio || !fecha.mes || !fecha.dia;
}

function esMatrizVacia(valor: unknown): boolean {
  if (typeof valor !== 'object' || valor === null) return true;
  return Object.keys(valor as ValorMatriz).length === 0;
}

function esGeolocalizacionVacia(valor: unknown): boolean {
  if (typeof valor !== 'object' || valor === null) return true;
  const geo = valor as ValorGeolocalizacion;
  return geo.latitud === undefined || geo.longitud === undefined;
}

function esArchivoVacio(valor: unknown): boolean {
  if (typeof valor !== 'object' || valor === null) return true;
  return !('uuid' in (valor as Record<string, unknown>));
}

function esFirmaVacia(valor: unknown): boolean {
  if (typeof valor === 'string' && valor.startsWith('data:')) return false;
  if (valor && typeof valor === 'object' && 'uuid' in (valor as Record<string, unknown>)) {
    return false;
  }
  return true;
}

function esUbicacionGeograficaVacia(valor: unknown): boolean {
  if (typeof valor !== 'object' || valor === null) return true;
  const ubicacion = valor as ValorUbicacionGeografica;
  return (
    !ubicacion.departamento_codigo?.trim() || !ubicacion.municipio_codigo?.trim()
  );
}

function esValorVacio(valor: unknown, tipo: TipoPregunta): boolean {
  if (valor === null || valor === undefined) return true;
  if (typeof valor === 'string') return valor.trim() === '';
  if (Array.isArray(valor)) return valor.length === 0;
  if (tipo === 'fecha') return esFechaVacia(valor);
  if (tipo === 'matriz') return esMatrizVacia(valor);
  if (tipo === 'geolocalizacion') return esGeolocalizacionVacia(valor);
  if (tipo === 'ubicacion_geografica') return esUbicacionGeograficaVacia(valor);
  if (tipo === 'archivo' || tipo === 'audio' || tipo === 'video') return esArchivoVacio(valor);
  if (tipo === 'firma') return esFirmaVacia(valor);
  return false;
}

function validarTexto(pregunta: Pregunta, valor: unknown): string | null {
  if (typeof valor !== 'string') return 'El valor debe ser texto.';
  if (pregunta.longitud_minima !== null && valor.length < pregunta.longitud_minima) {
    return pregunta.mensaje_error || `Mínimo ${pregunta.longitud_minima} caracteres.`;
  }
  if (pregunta.longitud_maxima !== null && valor.length > pregunta.longitud_maxima) {
    return pregunta.mensaje_error || `Máximo ${pregunta.longitud_maxima} caracteres.`;
  }
  if (pregunta.expresion_regular) {
    try {
      const regex = new RegExp(pregunta.expresion_regular);
      if (!regex.test(valor)) {
        return pregunta.mensaje_error || 'El formato no es válido.';
      }
    } catch {
      z.string().parse(valor);
    }
  }
  return null;
}

function validarNumero(pregunta: Pregunta, valor: unknown): string | null {
  const texto = String(valor);
  const numero = Number(texto);
  if (Number.isNaN(numero)) return 'Ingrese un número válido.';
  if (pregunta.valor_minimo !== null && numero < Number(pregunta.valor_minimo)) {
    return pregunta.mensaje_error || `El valor mínimo es ${pregunta.valor_minimo}.`;
  }
  if (pregunta.valor_maximo !== null && numero > Number(pregunta.valor_maximo)) {
    return pregunta.mensaje_error || `El valor máximo es ${pregunta.valor_maximo}.`;
  }
  return null;
}

function validarFecha(valor: unknown): string | null {
  const fecha = valor as ValorFecha;
  if (!fecha.anio || !fecha.mes || !fecha.dia) {
    return 'Seleccione año, mes y día.';
  }
  return null;
}

function validarMatriz(pregunta: Pregunta, valor: unknown): string | null {
  const filas = pregunta.filas_matriz.length;
  const matriz = valor as ValorMatriz;
  const respondidas = Object.keys(matriz).length;
  return respondidas >= filas ? null : 'Complete todas las filas de la matriz.';
}

function validarArchivoMultimedia(valor: unknown): string | null {
  const tieneUuid =
    valor &&
    typeof valor === 'object' &&
    'uuid' in (valor as Record<string, unknown>);
  return tieneUuid ? null : 'Seleccione y suba un archivo.';
}

function validarFirma(valor: unknown): string | null {
  const firmaValida =
    (typeof valor === 'string' && valor.startsWith('data:')) ||
    (valor && typeof valor === 'object' && 'uuid' in (valor as Record<string, unknown>));
  return firmaValida ? null : 'Capture su firma.';
}

function validarPorTipo(pregunta: Pregunta, valor: unknown): string | null {
  const tipo = pregunta.tipo_pregunta;

  switch (tipo) {
    case 'texto_corto':
    case 'texto_largo':
    case 'autocomplete':
      return validarTexto(pregunta, valor);
    case 'numero':
      return validarNumero(pregunta, valor);
    case 'fecha':
      return validarFecha(valor);
    case 'hora':
    case 'fecha_hora':
      return typeof valor === 'string' && valor ? null : 'Seleccione fecha y hora.';
    case 'radio':
    case 'select':
    case 'likert':
      return typeof valor === 'string' && valor ? null : 'Seleccione una opción.';
    case 'matriz':
      return validarMatriz(pregunta, valor);
    case 'archivo':
    case 'audio':
    case 'video':
      return validarArchivoMultimedia(valor);
    case 'firma':
      return validarFirma(valor);
    case 'geolocalizacion':
      return valor && typeof valor === 'object' ? null : 'Capture la ubicación.';
    case 'ubicacion_geografica':
      return esUbicacionGeograficaVacia(valor)
        ? 'Debe seleccionar departamento y municipio.'
        : null;
    default:
      return null;
  }
}

export function respuestaPermiteContinuar(
  pregunta: Pregunta,
  valor: unknown,
  obligatoria: boolean
): boolean {
  if (!obligatoria) {
    return true;
  }
  return validarRespuestaPregunta(pregunta, valor, true) === null;
}

export function validarRespuestaPregunta(
  pregunta: Pregunta,
  valor: unknown,
  obligatoria: boolean
): string | null {
  const tipo = pregunta.tipo_pregunta;

  if (!obligatoria) return null;

  if (tipo === 'checkbox' || tipo === 'select_multiple') {
    if (!Array.isArray(valor) || valor.length === 0) {
      return 'Seleccione al menos una opción.';
    }
    return null;
  }

  if (esValorVacio(valor, tipo)) {
    return 'Este campo es obligatorio.';
  }

  return validarPorTipo(pregunta, valor);
}

export function valorInicialPorTipo(tipo: TipoPregunta): unknown {
  switch (tipo) {
    case 'fecha':
      return { anio: '', mes: '', dia: '' };
    case 'checkbox':
    case 'select_multiple':
      return [];
    case 'matriz':
      return {};
    case 'ubicacion_geografica':
      return {
        departamento_codigo: '',
        departamento_nombre: '',
        municipio_codigo: '',
        municipio_nombre: '',
      };
    default:
      return '';
  }
}

export function construirValoresIniciales(
  preguntas: Pregunta[]
): Record<string, unknown> {
  return Object.fromEntries(
    preguntas.map((p) => [p.codigo, valorInicialPorTipo(p.tipo_pregunta)])
  );
}
