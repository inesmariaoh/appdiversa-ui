/**
 * Resuelve flujo_formulario desde configuracion de interfaz con fallback seguro.
 */

import type {
  FlujoFormularioInterfaz,
  TextosModalGuardado,
  TextosModalSalir,
  TextosModalSesion,
  TextosTerminosInterfaz,
} from '@/types/interfaz';
import { FLUJO_FORMULARIO_FALLBACK } from '@/utils/flujoFormularioFallback';

function textoONulo(valor: string | null | undefined): string | null {
  return valor?.trim() || null;
}

function combinarTexto(
  valor: string | null | undefined,
  fallback: string
): string {
  return textoONulo(valor) ?? fallback;
}

function combinarModalSalir(
  parcial: Partial<TextosModalSalir> | undefined,
  fallback: TextosModalSalir
): TextosModalSalir {
  return {
    titulo: combinarTexto(parcial?.titulo, fallback.titulo),
    parrafo_1: combinarTexto(parcial?.parrafo_1, fallback.parrafo_1),
    parrafo_2: combinarTexto(parcial?.parrafo_2, fallback.parrafo_2),
    boton_volver: combinarTexto(parcial?.boton_volver, fallback.boton_volver),
    boton_salir: combinarTexto(parcial?.boton_salir, fallback.boton_salir),
    link_sesion: combinarTexto(parcial?.link_sesion, fallback.link_sesion),
  };
}

function combinarModalSesion(
  parcial: Partial<TextosModalSesion> | undefined,
  fallback: TextosModalSesion
): TextosModalSesion {
  return {
    titulo: combinarTexto(parcial?.titulo, fallback.titulo),
    parrafo: combinarTexto(parcial?.parrafo, fallback.parrafo),
    boton_login: combinarTexto(parcial?.boton_login, fallback.boton_login),
    boton_registro: combinarTexto(parcial?.boton_registro, fallback.boton_registro),
    link_cancelar: combinarTexto(parcial?.link_cancelar, fallback.link_cancelar),
  };
}

function combinarModalGuardado(
  parcial: Partial<TextosModalGuardado> | undefined,
  fallback: TextosModalGuardado
): TextosModalGuardado {
  return {
    titulo: combinarTexto(parcial?.titulo, fallback.titulo),
    parrafo: combinarTexto(parcial?.parrafo, fallback.parrafo),
    boton_seguir: combinarTexto(parcial?.boton_seguir, fallback.boton_seguir),
    boton_otras: combinarTexto(parcial?.boton_otras, fallback.boton_otras),
  };
}

function combinarTerminos(
  parcial: Partial<TextosTerminosInterfaz> | undefined,
  fallback: TextosTerminosInterfaz,
  emailSoporteInterfaz?: string | null
): TextosTerminosInterfaz {
  return {
    titulo: combinarTexto(parcial?.titulo, fallback.titulo),
    contenido: textoONulo(parcial?.contenido) ?? fallback.contenido,
    parrafo_1: combinarTexto(parcial?.parrafo_1, fallback.parrafo_1),
    parrafo_2: combinarTexto(parcial?.parrafo_2, fallback.parrafo_2),
    parrafo_3: combinarTexto(parcial?.parrafo_3, fallback.parrafo_3),
    url_ley: textoONulo(parcial?.url_ley) ?? fallback.url_ley,
    url_politica_datos:
      textoONulo(parcial?.url_politica_datos) ?? fallback.url_politica_datos,
    email_soporte:
      textoONulo(parcial?.email_soporte) ??
      textoONulo(emailSoporteInterfaz) ??
      fallback.email_soporte,
    boton_aceptar: combinarTexto(
      parcial?.boton_aceptar,
      fallback.boton_aceptar ?? 'Aceptar y comenzar encuesta'
    ),
    boton_cerrar: combinarTexto(parcial?.boton_cerrar, fallback.boton_cerrar ?? 'Cerrar'),
    enlace_terminos: combinarTexto(
      parcial?.enlace_terminos,
      fallback.enlace_terminos ?? 'Términos y condiciones'
    ),
    texto_enlace_ley: combinarTexto(
      parcial?.texto_enlace_ley,
      fallback.texto_enlace_ley ?? 'Consultar Ley 1581 de 2012'
    ),
    texto_enlace_politica_datos: combinarTexto(
      parcial?.texto_enlace_politica_datos,
      fallback.texto_enlace_politica_datos ??
        'Política de Protección de Datos Personales'
    ),
  };
}

export type FlujoFormularioEntrada = {
  modal_salir?: Partial<TextosModalSalir>;
  modal_sesion?: Partial<TextosModalSesion>;
  modal_guardado?: Partial<TextosModalGuardado>;
  terminos?: Partial<TextosTerminosInterfaz>;
};

export interface ParametrosResolverFlujoFormulario {
  flujo_formulario?: FlujoFormularioEntrada;
  email_soporte?: string | null;
}

export function resolverFlujoFormulario(
  configuracion: ParametrosResolverFlujoFormulario,
): { flujo: FlujoFormularioInterfaz; esFallback: boolean } {
  const parcial = configuracion.flujo_formulario;
  if (!parcial) {
    return {
      flujo: FLUJO_FORMULARIO_FALLBACK,
      esFallback: true,
    };
  }

  const flujo: FlujoFormularioInterfaz = {
    modal_salir: combinarModalSalir(
      parcial?.modal_salir,
      FLUJO_FORMULARIO_FALLBACK.modal_salir
    ),
    modal_sesion: combinarModalSesion(
      parcial?.modal_sesion,
      FLUJO_FORMULARIO_FALLBACK.modal_sesion
    ),
    modal_guardado: combinarModalGuardado(
      parcial?.modal_guardado,
      FLUJO_FORMULARIO_FALLBACK.modal_guardado
    ),
    terminos: combinarTerminos(
      parcial?.terminos,
      FLUJO_FORMULARIO_FALLBACK.terminos,
      configuracion.email_soporte
    ),
  };

  return {
    flujo,
    esFallback: false,
  };
}
