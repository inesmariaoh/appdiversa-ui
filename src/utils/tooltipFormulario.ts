/**
 * Utilidades para tooltips de preguntas y opciones del motor de formularios.
 */

interface TooltipConfigurable {
  tiene_tooltip?: boolean;
  tooltip?: string;
}

/** Indica si debe mostrarse el icono de tooltip para una opcion. */
export function opcionMuestraTooltip(opcion: TooltipConfigurable): boolean {
  return Boolean(opcion.tiene_tooltip && opcion.tooltip?.trim());
}

/** Retorna el texto de ayuda de la pregunta segun configuracion de tooltip. */
export function textoAyudaPregunta(
  pregunta: TooltipConfigurable & { descripcion?: string | null },
): string | null {
  if (opcionMuestraTooltip(pregunta)) {
    return pregunta.tooltip?.trim() ?? null;
  }
  return pregunta.descripcion?.trim() || null;
}

/** Valida que exista texto cuando el tooltip esta activado. */
export function validarTooltipAdmin(
  tieneTooltip: boolean,
  tooltip: string | undefined,
): string | null {
  if (tieneTooltip && !tooltip?.trim()) {
    return 'El texto del tooltip es obligatorio cuando esta activado.';
  }
  return null;
}
