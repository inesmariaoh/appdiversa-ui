/**
 * Utilidades para resolver textos dinamicos del formulario.
 */

import type { FormularioEstructura, TextoFormulario, TipoTextoFormulario } from '@/types/formulario';
import type { ConfirmacionOpciones } from '@/store/uiStore';

const TITULO_CONFIRMACION_ENVIO_PREDETERMINADO = 'Confirmar envío';
const MENSAJE_CONFIRMACION_ENVIO_PREDETERMINADO = '¿Desea enviar el formulario?';
const ETIQUETA_CONFIRMAR_PREDETERMINADA = 'Confirmar envío';
const ETIQUETA_CANCELAR_PREDETERMINADA = 'Cancelar';

export function buscarTextoFormulario(
  estructura: FormularioEstructura,
  tipo: TipoTextoFormulario
): TextoFormulario | undefined {
  return estructura.textos.find((texto) => texto.tipo === tipo);
}

export function contenidoTextoFormulario(
  estructura: FormularioEstructura,
  tipo: TipoTextoFormulario,
  fallback = ''
): string {
  const texto = buscarTextoFormulario(estructura, tipo);
  return texto?.contenido?.trim() || fallback;
}

export function tituloTextoFormulario(
  estructura: FormularioEstructura,
  tipo: TipoTextoFormulario,
  fallback = ''
): string {
  const texto = buscarTextoFormulario(estructura, tipo);
  return texto?.titulo?.trim() || fallback;
}

/**
 * Resuelve titulo, mensaje y etiquetas del modal de confirmacion de envio
 * a partir de la estructura parametrizada del formulario.
 */
export function obtenerOpcionesConfirmacionEnvio(
  estructura: FormularioEstructura,
): ConfirmacionOpciones {
  const texto = buscarTextoFormulario(estructura, 'confirmacion_envio');
  const titulo =
    texto?.titulo?.trim() || TITULO_CONFIRMACION_ENVIO_PREDETERMINADO;
  const mensaje =
    texto?.contenido?.trim() || MENSAJE_CONFIRMACION_ENVIO_PREDETERMINADO;

  return {
    titulo,
    mensaje,
    etiquetaConfirmar: titulo || ETIQUETA_CONFIRMAR_PREDETERMINADA,
    etiquetaCancelar: ETIQUETA_CANCELAR_PREDETERMINADA,
  };
}
