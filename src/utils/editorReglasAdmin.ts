'use client';

/**
 * Utilidades para construir valor_esperado de reglas sin escribir JSON manual.
 */

import type { OperadorRegla } from '@/types/reglas';

export function construirValorEsperado(
  operador: OperadorRegla,
  valorSimple: string,
  valoresLista: string
): unknown {
  switch (operador) {
    case 'in':
      return valoresLista
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean);
    case 'gt':
    case 'lt':
      return Number(valorSimple);
    case 'equals':
    case 'not_equals':
    case 'contains':
    default:
      return valorSimple;
  }
}

export function valorEsperadoAString(valor: unknown): { simple: string; lista: string } {
  if (Array.isArray(valor)) {
    return { simple: '', lista: valor.map(String).join(', ') };
  }
  if (typeof valor === 'number') {
    return { simple: String(valor), lista: '' };
  }
  if (typeof valor === 'string') {
    return { simple: valor, lista: '' };
  }
  if (typeof valor === 'boolean' || typeof valor === 'bigint') {
    return { simple: String(valor), lista: '' };
  }
  if (valor === null || valor === undefined) {
    return { simple: '', lista: '' };
  }
  return { simple: '', lista: '' };
}

export const OPERADORES_REGLA: { valor: OperadorRegla; etiqueta: string }[] = [
  { valor: 'equals', etiqueta: 'Igual a' },
  { valor: 'not_equals', etiqueta: 'Distinto de' },
  { valor: 'contains', etiqueta: 'Contiene' },
  { valor: 'in', etiqueta: 'En lista' },
  { valor: 'gt', etiqueta: 'Mayor que' },
  { valor: 'lt', etiqueta: 'Menor que' },
];

export const ACCIONES_REGLA = [
  { valor: 'mostrar', etiqueta: 'Mostrar pregunta' },
  { valor: 'ocultar', etiqueta: 'Ocultar pregunta' },
  { valor: 'habilitar', etiqueta: 'Habilitar pregunta' },
  { valor: 'deshabilitar', etiqueta: 'Deshabilitar pregunta' },
  { valor: 'hacer_obligatoria', etiqueta: 'Hacer obligatoria' },
  { valor: 'hacer_opcional', etiqueta: 'Hacer opcional' },
  { valor: 'saltar_a_pregunta', etiqueta: 'Saltar a pregunta' },
  { valor: 'saltar_a_seccion', etiqueta: 'Saltar a sección' },
  { valor: 'finalizar_formulario', etiqueta: 'Finalizar formulario' },
  { valor: 'no_aplica_formulario', etiqueta: 'No aplica formulario' },
] as const;
