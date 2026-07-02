/**
 * Esquemas Zod dinamicos por pregunta para React Hook Form.
 */

import { z } from 'zod';
import type { Pregunta } from '@/types/formulario';
import { validarRespuestaPregunta } from './validacionPregunta';

export function construirEsquemaPregunta(
  pregunta: Pregunta,
  obligatoria: boolean
): z.ZodType<unknown> {
  return z.unknown().superRefine((valor, ctx) => {
    const mensaje = validarRespuestaPregunta(pregunta, valor, obligatoria);
    if (mensaje) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: mensaje });
    }
  });
}

export function construirEsquemaFormulario(
  preguntas: Pregunta[],
  esObligatoria: (codigo: string, base: boolean) => boolean
): z.ZodObject<Record<string, z.ZodType<unknown>>> {
  const forma: Record<string, z.ZodType<unknown>> = {};
  for (const pregunta of preguntas) {
    forma[pregunta.codigo] = construirEsquemaPregunta(
      pregunta,
      esObligatoria(pregunta.codigo, pregunta.es_obligatoria)
    );
  }
  return z.object(forma);
}
