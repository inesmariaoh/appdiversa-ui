/**
 * Tipos TypeScript para la configuracion de interfaz.
 * Los datos provienen de GET /api/v1/interfaz/configuracion/
 */

export interface LogoInterfaz {
  codigo: string;
  nombre: string;
  url: string;
  texto_alternativo: string;
}

export interface TextosModalSalir {
  titulo: string;
  parrafo_1: string;
  parrafo_2: string;
  boton_volver: string;
  boton_salir: string;
  link_sesion: string;
}

export interface TextosModalSesion {
  titulo: string;
  parrafo: string;
  boton_login: string;
  boton_registro: string;
  link_cancelar: string;
}

export interface TextosModalGuardado {
  titulo: string;
  parrafo: string;
  boton_seguir: string;
  boton_otras: string;
}

export interface TextosTerminosInterfaz {
  titulo: string;
  contenido: string | null;
  parrafo_1: string;
  parrafo_2: string;
  parrafo_3: string;
  url_ley: string | null;
  url_politica_datos: string | null;
  email_soporte: string | null;
  boton_aceptar?: string;
  boton_cerrar?: string;
  enlace_terminos?: string;
  texto_enlace_ley?: string;
  texto_enlace_politica_datos?: string;
}

export interface TextosEnvioExitoso {
  imagen_url: string | null;
  imagen_alt: string;
}

export interface FlujoFormularioInterfaz {
  modal_salir: TextosModalSalir;
  modal_sesion: TextosModalSesion;
  modal_guardado: TextosModalGuardado;
  terminos: TextosTerminosInterfaz;
  envio_exitoso: TextosEnvioExitoso;
}

export interface ConfiguracionInterfaz {
  nombre_aplicativo: string;
  nombre_corto: string | null;
  descripcion_aplicativo: string;
  logo_institucional: string | null;
  logo_institucional_alt?: string;
  logo_principal: string | null;
  logo_principal_alt?: string;
  logo_secundario: string | null;
  logo_secundario_alt?: string;
  favicon: string | null;
  favicon_alt?: string;
  logos?: LogoInterfaz[];
  color_primario: string;
  color_secundario: string;
  color_acento: string;
  color_fondo_pagina: string;
  color_fondo_tarjeta: string;
  color_error: string;
  texto_pie_pagina: string;
  texto_contacto: string;
  url_contacto: string;
  /** Correo de soporte de la interfaz activa (hereda en terminos si aplica). */
  email_soporte: string | null;
  accion_lengua_senas_habilitada: boolean;
  url_lengua_senas: string | null;
  texto_lengua_senas: string | null;
  meta_titulo_seo: string | null;
  meta_descripcion_seo: string | null;
  texto_titulo_seccion_encuestas?: string | null;
  texto_descripcion_seccion_encuestas?: string | null;
  /** Textos dinamicos del flujo de modales de formulario. */
  flujo_formulario?: FlujoFormularioInterfaz;
  /** true cuando flujo_formulario proviene de fallback local. */
  flujo_formulario_es_fallback?: boolean;
  /** Banderas de accesibilidad parametrizadas desde el backend. */
  accesibilidad?: AccesibilidadServidor;
}

export type TemaAccesibilidad = 'claro' | 'oscuro' | 'alto_contraste';

/**
 * Banderas de accesibilidad parametrizadas desde el backend
 * (GET /api/v1/interfaz/configuracion/ -> bloque "accesibilidad").
 * Permiten activar o desactivar funcionalidades sin nuevos despliegues.
 */
export interface AccesibilidadServidor {
  lectura_voz_habilitada: boolean;
  comandos_voz_habilitada: boolean;
  lengua_senas_habilitada: boolean;
  fuente_dislexia_habilitada: boolean;
  tema_por_defecto: TemaAccesibilidad;
  centro_relevo_habilitado: boolean;
  url_centro_relevo: string;
}

/**
 * Datos de accesibilidad editables desde el panel administrativo
 * (GET/PATCH /api/v1/interfaz/admin/accesibilidad/). Incluye, ademas de las
 * banderas publicas, la URL y el texto del video en lengua de senas.
 */
export interface AccesibilidadAdminDatos extends AccesibilidadServidor {
  url_lengua_senas: string;
  texto_lengua_senas: string;
}

export interface AccesibilidadConfig {
  alto_contraste: boolean;
  tamano_texto: 'normal' | 'grande' | 'muy_grande';
  reducir_animaciones: boolean;
  tema: TemaAccesibilidad;
  fuente_dislexia: boolean;
  lectura_facil: boolean;
}

export type CodigoLogoInterfaz =
  | 'logo_institucional'
  | 'logo_principal'
  | 'logo_secundario'
  | 'favicon';
