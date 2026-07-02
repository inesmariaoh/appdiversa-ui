/**
 * Utilidades para formatear respuestas del resumen de sesion.
 */

import type { ResumenRespuesta } from '@/types/sesion';

export interface FilaMatrizResumen {
  etiqueta: string;
  respuesta: string;
}

const TIPOS_SELECCION_MULTIPLE = new Set(['checkbox', 'select_multiple']);
const TIPOS_SELECCION_UNICA = new Set(['radio', 'select', 'likert', 'autocomplete']);

export function formatearFechaCompletada(isoFecha: string | null | undefined): string | null {
  if (!isoFecha) {
    return null;
  }
  const limpio = isoFecha.trim();
  if (!limpio) {
    return null;
  }
  const fecha = new Date(limpio);
  if (Number.isNaN(fecha.getTime())) {
    return limpio;
  }
  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Bogota',
  }).format(fecha);
}

export function resolverFechaDiligenciamientoIso(item: {
  fecha_finalizacion?: string | null;
  fecha_ultima_actividad?: string | null;
  fecha_inicio?: string | null;
}): string | null {
  const candidatos = [
    item.fecha_finalizacion,
    item.fecha_ultima_actividad,
    item.fecha_inicio,
  ];

  for (const candidato of candidatos) {
    const limpio = candidato?.trim();
    if (limpio) {
      return limpio;
    }
  }

  return null;
}

export function textoValorResumen(item: ResumenRespuesta): string {
  if (item.valor_legible?.trim()) {
    return item.valor_legible.trim();
  }
  if (item.valor == null || item.valor === '') {
    return item.observacion?.trim() || '—';
  }
  if (typeof item.valor === 'string' || typeof item.valor === 'number') {
    return String(item.valor);
  }
  if (typeof item.valor === 'boolean') {
    return item.valor ? 'Sí' : 'No';
  }
  return item.observacion?.trim() || '—';
}

export function esSeleccionMultipleResumen(item: ResumenRespuesta): boolean {
  return TIPOS_SELECCION_MULTIPLE.has(item.tipo_pregunta);
}

export function esSeleccionUnicaResumen(item: ResumenRespuesta): boolean {
  return TIPOS_SELECCION_UNICA.has(item.tipo_pregunta);
}

export function esMatrizResumen(item: ResumenRespuesta): boolean {
  return item.tipo_pregunta === 'matriz';
}

function dividirLineasValorLegible(valorLegible: string): string[] {
  return valorLegible
    .split('\n')
    .map((linea) => linea.trim())
    .filter(Boolean);
}

function dividirMultiplesDesdeLegible(valorLegible: string): string[] {
  const porLineas = dividirLineasValorLegible(valorLegible);
  if (porLineas.length > 1) {
    return porLineas;
  }
  return valorLegible
    .split(/[,;]/)
    .map((parte) => parte.trim())
    .filter(Boolean);
}

function textoDesdeDesconocido(valor: unknown): string {
  if (typeof valor === 'string') {
    return valor;
  }
  if (typeof valor === 'number' || typeof valor === 'boolean') {
    return String(valor);
  }
  return '';
}

export function opcionesMultiplesDesdeResumen(item: ResumenRespuesta): string[] {
  if (Array.isArray(item.valor) && item.valor.length > 0) {
    return item.valor
      .map((valor) => (typeof valor === 'string' ? valor : String(valor)))
      .filter(Boolean);
  }

  if (item.valor_legible?.trim()) {
    return dividirMultiplesDesdeLegible(item.valor_legible.trim());
  }

  const texto = textoValorResumen(item);
  if (texto === '—') {
    return [];
  }
  return [texto];
}

function parsearFilasDesdeLegible(valorLegible: string): FilaMatrizResumen[] {
  return dividirLineasValorLegible(valorLegible).flatMap((linea) => {
    const separador = linea.indexOf(':');
    if (separador <= 0) {
      return linea ? [{ etiqueta: linea, respuesta: '' }] : [];
    }
    return [
      {
        etiqueta: linea.slice(0, separador).trim(),
        respuesta: linea.slice(separador + 1).trim(),
      },
    ];
  });
}

function parsearFilasDesdeValor(valor: unknown): FilaMatrizResumen[] {
  if (!valor || typeof valor !== 'object' || Array.isArray(valor)) {
    return [];
  }

  return Object.entries(valor as Record<string, unknown>).map(([clave, respuesta]) => {
    if (respuesta && typeof respuesta === 'object' && !Array.isArray(respuesta)) {
      const fila = respuesta as { etiqueta?: string; valor_legible?: string; valor?: unknown };
      return {
        etiqueta: fila.etiqueta?.trim() || clave,
        respuesta:
          fila.valor_legible?.trim() ||
          textoDesdeDesconocido(fila.valor),
      };
    }

    return {
      etiqueta: clave,
      respuesta: textoDesdeDesconocido(respuesta),
    };
  });
}

export function filasMatrizDesdeResumen(item: ResumenRespuesta): FilaMatrizResumen[] {
  if (item.valor_legible?.includes(':') && item.valor_legible.includes('\n')) {
    return parsearFilasDesdeLegible(item.valor_legible);
  }

  const filasValor = parsearFilasDesdeValor(item.valor);
  if (filasValor.length > 0) {
    return filasValor;
  }

  if (item.valor_legible?.trim()) {
    return parsearFilasDesdeLegible(item.valor_legible);
  }

  const texto = textoValorResumen(item);
  if (texto === '—') {
    return [];
  }
  return [{ etiqueta: '', respuesta: texto }];
}
