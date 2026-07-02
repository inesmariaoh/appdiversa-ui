/**
 * Enriquece respuestas del resumen con etiquetas legibles para el usuario.
 */

import type { ItemCatalogo } from '@/types/catalogo';
import type { Pregunta } from '@/types/formulario';
import type { ResumenRespuesta } from '@/types/sesion';
import { extraerCodigoCatalogo } from '@/utils/extraerCodigoCatalogo';
import type { FilaMatrizResumen } from '@/utils/resumenRespuestas';

export interface ItemResumenPresentacion {
  item: ResumenRespuesta;
  textoSimple: string;
  opcionesMultiples: string[];
  filasMatriz: FilaMatrizResumen[];
}

export interface ContextoEnriquecimientoResumen {
  indicePreguntas: Map<string, Pregunta>;
  catalogos: Map<string, ItemCatalogo[]>;
  respuestasPorCodigo: Map<string, ResumenRespuesta>;
}

type ValorMatriz = Record<string, string>;

const ETIQUETAS_RESPUESTA: Record<string, string> = {
  si: 'Sí',
  no: 'No',
  'no sabe': 'No sabe',
  'no informa': 'No informa',
};

function normalizarMatriz(valor: unknown): ValorMatriz {
  if (!valor || typeof valor !== 'object' || Array.isArray(valor)) {
    return {};
  }
  const salida: ValorMatriz = {};
  for (const [clave, respuesta] of Object.entries(valor as Record<string, unknown>)) {
    if (typeof respuesta === 'string') {
      salida[clave] = respuesta;
    } else if (respuesta != null) {
      salida[clave] = String(respuesta);
    }
  }
  return salida;
}

export function normalizarEtiquetaLegible(texto: string): string {
  const limpio = texto.trim();
  if (!limpio) {
    return '—';
  }
  const clave = limpio.toLowerCase();
  return ETIQUETAS_RESPUESTA[clave] ?? limpio;
}

function pareceCodigoInterno(texto: string): boolean {
  const limpio = texto.trim();
  if (!limpio) {
    return false;
  }
  if (/^(ROW|COL)[\w-]+$/i.test(limpio)) {
    return true;
  }
  if (/^[\w]+-P\d+$/i.test(limpio)) {
    return true;
  }
  return /^\d+$/.test(limpio);
}

function valorLegibleConfiable(item: ResumenRespuesta): string | null {
  const legible = item.valor_legible?.trim();
  if (!legible) {
    return null;
  }
  if (legible === String(item.valor ?? '')) {
    return null;
  }
  if (pareceCodigoInterno(legible) && item.tipo_pregunta !== 'texto_corto') {
    return null;
  }
  return legible;
}

function buscarEnCatalogo(
  items: ItemCatalogo[],
  valor: unknown,
): string | null {
  const clave = String(valor ?? '').trim();
  if (!clave) {
    return null;
  }
  const item = items.find(
    (catalogo) =>
      catalogo.codigo === clave ||
      catalogo.valor === clave ||
      catalogo.codigo_externo === clave,
  );
  return item?.nombre?.trim() || null;
}

function resolverDesdeOpciones(pregunta: Pregunta, valor: unknown): string | null {
  const clave = String(valor ?? '').trim();
  if (!clave) {
    return null;
  }
  const opcion = pregunta.opciones.find(
    (item) => item.valor === clave || item.codigo === clave,
  );
  return opcion?.etiqueta?.trim() || null;
}

function resolverDesdeCatalogo(
  pregunta: Pregunta,
  valor: unknown,
  catalogos: Map<string, ItemCatalogo[]>,
): string | null {
  const codigoCatalogo = extraerCodigoCatalogo(pregunta.catalogo_asociado);
  if (!codigoCatalogo) {
    return null;
  }
  const items = catalogos.get(codigoCatalogo);
  if (!items?.length) {
    return null;
  }
  return buscarEnCatalogo(items, valor);
}

function resolverUbicacionGeografica(valor: unknown): string | null {
  if (!valor || typeof valor !== 'object' || Array.isArray(valor)) {
    return null;
  }
  const datos = valor as {
    departamento_nombre?: string;
    municipio_nombre?: string;
  };
  const partes = [datos.departamento_nombre, datos.municipio_nombre]
    .map((parte) => parte?.trim())
    .filter(Boolean);
  return partes.length > 0 ? partes.join(' — ') : null;
}

function formatearFechaResumen(valor: unknown): string | null {
  if (typeof valor !== 'string' || !valor.trim()) {
    return null;
  }
  const fecha = new Date(`${valor.trim()}T12:00:00`);
  if (Number.isNaN(fecha.getTime())) {
    return null;
  }
  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Bogota',
  }).format(fecha);
}

function resolverColumnaMatriz(
  pregunta: Pregunta,
  codigoColumna: string,
): string {
  const columna = pregunta.columnas_matriz.find((item) => item.codigo === codigoColumna);
  if (columna?.etiqueta?.trim()) {
    return normalizarEtiquetaLegible(columna.etiqueta);
  }
  return normalizarEtiquetaLegible(codigoColumna);
}

function filasMatrizEnriquecidas(
  pregunta: Pregunta,
  valor: unknown,
): FilaMatrizResumen[] {
  const matriz = normalizarMatriz(valor);
  const filasOrdenadas = [...pregunta.filas_matriz].sort((a, b) => a.orden - b.orden);

  return filasOrdenadas
    .map((fila) => {
      const codigoColumna = matriz[fila.codigo];
      if (!codigoColumna) {
        return null;
      }
      return {
        etiqueta: fila.etiqueta,
        respuesta: resolverColumnaMatriz(pregunta, codigoColumna),
      };
    })
    .filter((fila): fila is FilaMatrizResumen => fila !== null);
}

function resolverMultiples(
  pregunta: Pregunta,
  item: ResumenRespuesta,
  contexto: ContextoEnriquecimientoResumen,
): string[] {
  const valores = Array.isArray(item.valor)
    ? item.valor.map((valor) => String(valor))
    : [String(item.valor ?? '')].filter(Boolean);

  return valores
    .map((valor) => {
      const desdeOpciones = resolverDesdeOpciones(pregunta, valor);
      if (desdeOpciones) {
        return normalizarEtiquetaLegible(desdeOpciones);
      }
      const desdeCatalogo = resolverDesdeCatalogo(pregunta, valor, contexto.catalogos);
      if (desdeCatalogo) {
        return normalizarEtiquetaLegible(desdeCatalogo);
      }
      return normalizarEtiquetaLegible(valor);
    })
    .filter((texto) => texto !== '—');
}

function resolverTextoSimple(
  item: ResumenRespuesta,
  pregunta: Pregunta | undefined,
  contexto: ContextoEnriquecimientoResumen,
): string {
  const legibleBackend = valorLegibleConfiable(item);
  if (legibleBackend) {
    return normalizarEtiquetaLegible(legibleBackend);
  }

  if (!pregunta) {
    return normalizarEtiquetaLegible(String(item.valor ?? item.observacion ?? '—'));
  }

  if (pregunta.tipo_pregunta === 'ubicacion_geografica') {
    const ubicacion = resolverUbicacionGeografica(item.valor);
    if (ubicacion) {
      return ubicacion;
    }
  }

  if (pregunta.tipo_pregunta === 'fecha') {
    const fecha = formatearFechaResumen(item.valor);
    if (fecha) {
      return fecha;
    }
  }

  const desdeOpciones = resolverDesdeOpciones(pregunta, item.valor);
  if (desdeOpciones) {
    return normalizarEtiquetaLegible(desdeOpciones);
  }

  const desdeCatalogo = resolverDesdeCatalogo(pregunta, item.valor, contexto.catalogos);
  if (desdeCatalogo) {
    return normalizarEtiquetaLegible(desdeCatalogo);
  }

  if (item.valor == null || item.valor === '') {
    return item.observacion?.trim() || '—';
  }

  return normalizarEtiquetaLegible(String(item.valor));
}

export function enriquecerRespuestaResumen(
  item: ResumenRespuesta,
  contexto: ContextoEnriquecimientoResumen,
): ItemResumenPresentacion {
  const pregunta = contexto.indicePreguntas.get(item.pregunta_codigo);

  if (item.tipo_pregunta === 'matriz' && pregunta?.filas_matriz.length) {
    const filasMatriz = filasMatrizEnriquecidas(pregunta, item.valor);
    if (filasMatriz.length > 0) {
      return {
        item,
        textoSimple: '',
        opcionesMultiples: [],
        filasMatriz,
      };
    }
  }

  if (
    (item.tipo_pregunta === 'checkbox' || item.tipo_pregunta === 'select_multiple') &&
    pregunta
  ) {
    const opcionesMultiples = resolverMultiples(pregunta, item, contexto);
    if (opcionesMultiples.length > 0) {
      return {
        item,
        textoSimple: '',
        opcionesMultiples,
        filasMatriz: [],
      };
    }
  }

  return {
    item,
    textoSimple: resolverTextoSimple(item, pregunta, contexto),
    opcionesMultiples: [],
    filasMatriz: [],
  };
}

function preguntaRequiereCatalogo(pregunta: Pregunta): boolean {
  return (
    pregunta.usa_catalogo ||
    pregunta.es_pregunta_geografica ||
    pregunta.fuente_opciones === 'catalogo'
  );
}

export function catalogosRequeridosParaResumen(
  respuestas: ResumenRespuesta[],
  indicePreguntas: Map<string, Pregunta>,
): Map<string, { codigoPadre?: string }> {
  const catalogos = new Map<string, { codigoPadre?: string }>();

  for (const respuesta of respuestas) {
    const pregunta = indicePreguntas.get(respuesta.pregunta_codigo);
    if (!pregunta || !preguntaRequiereCatalogo(pregunta)) {
      continue;
    }
    const codigoCatalogo = extraerCodigoCatalogo(pregunta.catalogo_asociado);
    if (!codigoCatalogo) {
      continue;
    }

    let codigoPadre: string | undefined;
    const codigoPreguntaPadre = pregunta.pregunta_padre_catalogo?.codigo;
    if (codigoPreguntaPadre) {
      const respuestaPadre = respuestas.find(
        (item) => item.pregunta_codigo === codigoPreguntaPadre,
      );
      if (respuestaPadre?.valor != null && respuestaPadre.valor !== '') {
        codigoPadre = String(respuestaPadre.valor);
      }
    }

    const existente = catalogos.get(codigoCatalogo);
    if (!existente?.codigoPadre && codigoPadre) {
      catalogos.set(codigoCatalogo, { codigoPadre });
    } else if (!existente) {
      catalogos.set(codigoCatalogo, { codigoPadre });
    }
  }

  return catalogos;
}
