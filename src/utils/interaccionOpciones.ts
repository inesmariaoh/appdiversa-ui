/**
 * Constantes y utilidades de interaccion de opciones enviadas por el backend.
 */

import type { ComportamientoInteraccion, OpcionRespuesta } from '@/types/formulario';

export const ACCION_MOSTRAR_CAMPO_TEXTO = 'mostrar_campo_texto';
export const ACCION_EXCLUIR_OTRAS_OPCIONES = 'excluir_otras_opciones';

export const MODO_CAMPO_TEXTO_OPCIONAL = 'opcional';
export const MODO_EXCLUSION_DESELECCIONAR_OTRAS = 'deseleccionar_otras_al_seleccionar';

function normalizarValores(valor: unknown): string[] {
  if (Array.isArray(valor)) return valor.map(String);
  if (typeof valor === 'string' && valor) return [valor];
  return [];
}

export function opcionRequiereCampoTexto(opcion: OpcionRespuesta): boolean {
  if (opcion.acciones_ui?.includes(ACCION_MOSTRAR_CAMPO_TEXTO)) {
    return true;
  }
  return opcion.activa_otro === true;
}

export function opcionEsExcluyente(opcion: OpcionRespuesta): boolean {
  if (opcion.acciones_ui?.includes(ACCION_EXCLUIR_OTRAS_OPCIONES)) {
    return true;
  }
  return opcion.es_excluyente === true;
}

export function preguntaPermiteCampoTextoOtro(
  comportamiento?: ComportamientoInteraccion,
): boolean {
  return comportamiento?.campo_texto_otro === MODO_CAMPO_TEXTO_OPCIONAL;
}

export function preguntaUsaExclusionOpciones(
  comportamiento?: ComportamientoInteraccion,
): boolean {
  return comportamiento?.modo_exclusion === MODO_EXCLUSION_DESELECCIONAR_OTRAS;
}

export function hayOpcionExcluyenteSeleccionada(
  seleccionados: string[],
  opciones: OpcionRespuesta[],
): boolean {
  return seleccionados.some((valor) => {
    const opcion = opciones.find((item) => item.valor === valor);
    return opcion !== undefined && opcionEsExcluyente(opcion);
  });
}

export function opcionBloqueadaPorExclusion(
  opcion: OpcionRespuesta,
  seleccionados: string[],
  opciones: OpcionRespuesta[],
  deshabilitadaGlobal = false,
): boolean {
  if (deshabilitadaGlobal) return true;
  if (seleccionados.includes(opcion.valor)) return false;
  return hayOpcionExcluyenteSeleccionada(seleccionados, opciones);
}

export function calcularSeleccionMultiple(
  seleccionados: string[],
  valorOpcion: string,
  marcado: boolean,
  opciones: OpcionRespuesta[],
): string[] {
  const opcion = opciones.find((item) => item.valor === valorOpcion);
  if (!opcion) return seleccionados;

  if (marcado && opcionEsExcluyente(opcion)) {
    return [valorOpcion];
  }

  if (marcado) {
    if (hayOpcionExcluyenteSeleccionada(seleccionados, opciones)) {
      return seleccionados;
    }
    if (seleccionados.includes(valorOpcion)) {
      return seleccionados;
    }
    return [...seleccionados, valorOpcion];
  }

  return seleccionados.filter((valor) => valor !== valorOpcion);
}

export function debeMostrarCampoTextoOtro(
  valor: unknown,
  opciones: OpcionRespuesta[],
): boolean {
  const seleccionados = normalizarValores(valor);
  if (seleccionados.length === 0) return false;
  return opciones.some(
    (opcion) =>
      seleccionados.includes(opcion.valor) && opcionRequiereCampoTexto(opcion),
  );
}

export function debeLimpiarObservacion(
  seleccionAnterior: string[],
  seleccionNueva: string[],
  opciones: OpcionRespuesta[],
): boolean {
  const habiaOtro = seleccionAnterior.some((valor) => {
    const opcion = opciones.find((item) => item.valor === valor);
    return opcion !== undefined && opcionRequiereCampoTexto(opcion);
  });
  if (!habiaOtro) return false;
  return !debeMostrarCampoTextoOtro(seleccionNueva, opciones);
}
