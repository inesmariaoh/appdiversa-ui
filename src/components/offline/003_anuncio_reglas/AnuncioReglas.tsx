'use client';

/**
 * Anuncia cambios del motor de reglas a lectores de pantalla.
 */

import type { ResultadoReglas } from '@/types/reglas';

interface AnuncioReglasProps {
  readonly resultado: ResultadoReglas;
}

function resumirCambioReglas(resultado: ResultadoReglas): string | null {
  const partes: string[] = [];
  if (resultado.preguntas_ocultas.length > 0) {
    partes.push(`Se ocultaron ${resultado.preguntas_ocultas.length} pregunta(s).`);
  }
  if (resultado.preguntas_visibles.length > 0) {
    partes.push(`Se mostraron ${resultado.preguntas_visibles.length} pregunta(s).`);
  }
  if (resultado.preguntas_obligatorias.length > 0) {
    partes.push('Cambio la obligatoriedad de algunas preguntas.');
  }
  if (resultado.saltar_a_pregunta) {
    partes.push('El formulario salta a otra pregunta.');
  }
  if (resultado.finalizar_formulario) {
    partes.push('El formulario puede finalizarse.');
  }
  if (resultado.mensajes.length > 0) {
    partes.push(resultado.mensajes.join(' '));
  }
  return partes.length > 0 ? partes.join(' ') : null;
}

export function AnuncioReglas({ resultado }: AnuncioReglasProps) {
  const mensaje = resumirCambioReglas(resultado) ?? '';

  if (!mensaje) return null;

  return (
    <p className="solo-lector-pantalla" role="status" aria-live="assertive" aria-atomic="true">
      {mensaje}
    </p>
  );
}
