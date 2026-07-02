/**
 * Textos fallback temporales del flujo de modales de formulario.
 * Se usan cuando el backend aun no envia flujo_formulario en configuracion de interfaz.
 */

import type { FlujoFormularioInterfaz } from '@/types/interfaz';

/** Indica que los textos provienen de fallback local, no del backend. */
export const FLUJO_FORMULARIO_ES_FALLBACK = true;

export const FLUJO_FORMULARIO_FALLBACK: FlujoFormularioInterfaz = {
  modal_salir: {
    titulo: '¿Salir sin guardar?',
    parrafo_1:
      'Si abandonas la encuesta ahora, perderás todas tus respuestas no guardadas.',
    parrafo_2:
      'Para conservar tu progreso y retomarlo más tarde, regístrate o inicia sesión antes de salir.',
    boton_volver: 'Volver a la encuesta (mantenerme aquí)',
    boton_salir: 'Salir sin guardar (perder mi progreso)',
    link_sesion: 'Iniciar sesión',
  },
  modal_sesion: {
    titulo: 'Inicia sesión o regístrate',
    parrafo:
      'Para conservar tus respuestas y retomar encuestas en curso más tarde, regístrate o inicia sesión.',
    boton_login: 'Iniciar sesión',
    boton_registro: 'Registrarse',
    link_cancelar: 'Cancelar',
  },
  modal_guardado: {
    titulo: 'Encuesta guardada con éxito',
    parrafo:
      'Tu progreso fue guardado correctamente. Puedes continuar viendo el resumen o explorar otras encuestas.',
    boton_seguir: 'Seguir viendo',
    boton_otras: 'Ver otras encuestas',
  },
  terminos: {
    titulo: 'Términos y Condiciones de Uso de AppDiversa',
    contenido: null,
    parrafo_1:
      'Al acceder a esta aplicación, se entenderá que usted ha dado su autorización para el tratamiento de datos personales, de conformidad con lo establecido en la Ley 1581 de 2012 y las normas que la reglamentan.',
    parrafo_2:
      'La información que usted suministre será gestionada por el DANE, y sus datos personales serán tratados de manera confidencial y segura, de acuerdo con la Política de Protección de Datos Personales implementada por la entidad.',
    parrafo_3:
      'De acuerdo con los objetivos de esta aplicación, se advierte que algunas de las interacciones pueden implicar el suministro de datos sensibles, los cuales contarán con un nivel de seguridad alto, en garantía de sus derechos constitucionales.',
    url_ley:
      'https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=49981',
    url_politica_datos:
      'https://www.dane.gov.co/files/images/ventana-unica/documentos/politicadedatosdane.pdf',
    email_soporte: null,
    boton_aceptar: 'Aceptar y comenzar encuesta',
    boton_cerrar: 'Cerrar',
    enlace_terminos: 'Términos y condiciones',
    texto_enlace_ley: 'Consultar Ley 1581 de 2012',
    texto_enlace_politica_datos: 'Política de Protección de Datos Personales',
  },
  envio_exitoso: {
    imagen_url: null,
    imagen_alt: 'Encuesta enviada con éxito',
  },
};
