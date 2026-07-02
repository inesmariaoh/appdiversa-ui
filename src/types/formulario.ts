/**
 * Tipos TypeScript para formularios y encuestas.
 * Alineados con openapi_export.json (FormularioDisponible, FormularioEstructura, Pregunta).
 */

export type TipoFormulario =
  | 'encuesta'
  | 'inscripcion'
  | 'registro'
  | 'censo'
  | 'evaluacion';

export type EstadoDisponibilidadFormulario = 'disponible' | 'proximamente';

export interface FormularioDisponible {
  uuid: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  tipo_formulario: TipoFormulario;
  tiempo_estimado_minutos: number | null;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  permite_anonimo: boolean;
  permite_registro_final: boolean;
  permite_multiples_respuestas: boolean;
  permite_offline: boolean;
  orden?: number;
  imagen_portada: string | null;
  /** Estado calculado o enviado por el backend. */
  estado_disponibilidad: EstadoDisponibilidadFormulario;
  /** Indica si el usuario puede iniciar la encuesta. */
  puede_iniciar: boolean;
  /** Texto de la insignia de estado (Disponible, Próximamente, etc.). */
  etiqueta_estado: string;
}

export type TipoTextoFormulario =
  | 'introduccion'
  | 'definicion'
  | 'consentimiento'
  | 'terminos'
  | 'agradecimiento'
  | 'ayuda'
  | 'cierre'
  | 'consentimiento_datos'
  | 'confirmacion_envio'
  | 'verificacion_exitosa'
  | 'no_cumple_condiciones'
  | 'autorizacion_datos'
  | 'resumen_respuestas'
  | 'registro_opcional'
  | 'envio_correo'
  | 'contacto'
  | 'ayuda_accesibilidad';

export interface TextoFormulario {
  tipo: TipoTextoFormulario;
  titulo?: string;
  contenido: string;
  idioma?: string;
}

export interface FormularioVersionResumen {
  id: number;
  numero_version: number;
}

export interface SeccionFormulario {
  codigo: string;
  titulo: string;
  descripcion: string;
  texto_ayuda: string;
  orden: number;
  preguntas: Pregunta[];
}

export type TipoPregunta =
  | 'texto_corto'
  | 'texto_largo'
  | 'numero'
  | 'fecha'
  | 'hora'
  | 'fecha_hora'
  | 'radio'
  | 'checkbox'
  | 'select'
  | 'select_multiple'
  | 'autocomplete'
  | 'likert'
  | 'matriz'
  | 'archivo'
  | 'firma'
  | 'geolocalizacion'
  | 'ubicacion_geografica'
  | 'audio'
  | 'video';

export interface ValorUbicacionGeografica {
  departamento_codigo: string;
  departamento_nombre: string;
  municipio_codigo: string;
  municipio_nombre: string;
}

export interface CatalogoAsociadoMetadata {
  codigo?: string;
  nombre?: string;
  tipo_catalogo?: string;
  endpoint_items?: string;
  [clave: string]: string | undefined;
}

export interface PreguntaDependienteGeografica {
  codigo: string;
  texto: string;
}

export interface ComportamientoInteraccion {
  tipo_seleccion: 'multiple' | 'unica' | 'no_aplica';
  campo_texto_otro: 'opcional' | 'ninguno';
  modo_exclusion?: 'deseleccionar_otras_al_seleccionar';
}

export interface OpcionRespuesta {
  codigo: string;
  etiqueta: string;
  valor: string;
  tooltip?: string;
  tiene_tooltip?: boolean;
  orden: number;
  es_excluyente?: boolean;
  activa_otro?: boolean;
  acciones_ui?: string[];
}

export interface PreguntaMatrizFila {
  codigo: string;
  etiqueta: string;
  orden: number;
}

export interface PreguntaMatrizColumna {
  codigo: string;
  etiqueta: string;
  orden: number;
}

import type { AccionRegla, OperadorRegla } from './reglas';
import type { ContenidoAccesible } from './accesibilidad';
import type { ValidacionFiltro } from './filtros';

export type TipoValidacionFiltro = ValidacionFiltro['tipo_validacion'];

export interface ReglaPregunta {
  operador: OperadorRegla;
  valor_esperado: unknown;
  accion: AccionRegla;
  mensaje?: string;
  pregunta_destino_codigo: string | null;
  seccion_destino_codigo: string | null;
}

export interface Pregunta {
  codigo: string;
  texto: string;
  descripcion: string;
  tooltip: string;
  tiene_tooltip?: boolean;
  tipo_pregunta: TipoPregunta;
  es_obligatoria: boolean;
  es_pregunta_filtro: boolean;
  tipo_validacion_filtro?: TipoValidacionFiltro | '';
  valor_filtro_esperado?: unknown;
  bloquea_continuacion_si_no_cumple?: boolean;
  mensaje_no_cumple?: string;
  validacion_filtro?: ValidacionFiltro | null;
  permite_otro: boolean;
  permite_observacion: boolean;
  orden: number;
  longitud_minima: number | null;
  longitud_maxima: number | null;
  valor_minimo: string | null;
  valor_maximo: string | null;
  expresion_regular: string;
  mensaje_error: string;
  usa_catalogo: boolean;
  catalogo_asociado: CatalogoAsociadoMetadata | null;
  pregunta_padre_catalogo: CatalogoAsociadoMetadata | null;
  es_pregunta_geografica: boolean;
  preguntas_dependientes_geograficas: PreguntaDependienteGeografica[];
  permite_busqueda_catalogo: boolean;
  limite_items_catalogo: number | null;
  fuente_opciones: string;
  opciones: OpcionRespuesta[];
  filas_matriz: PreguntaMatrizFila[];
  columnas_matriz: PreguntaMatrizColumna[];
  reglas_origen: ReglaPregunta[];
  visible_por_defecto?: boolean;
  limpiar_respuesta_al_ocultar?: boolean;
  pregunta_origen_flujo_codigo?: string | null;
  codigo_catalogo_departamento?: string;
  catalogo_departamento?: CatalogoAsociadoMetadata | null;
  comportamiento_interaccion?: ComportamientoInteraccion;
  contenido_accesible?: ContenidoAccesible | null;
}

export interface FormularioEstructura {
  uuid: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  introduccion: string;
  objetivo: string;
  tipo_formulario: string;
  imagen_portada: string | null;
  version: FormularioVersionResumen;
  textos: TextoFormulario[];
  secciones: SeccionFormulario[];
}

/** @deprecated Usar FormularioDisponible */
export type FormularioResumen = FormularioDisponible;

/** @deprecated Usar FormularioEstructura */
export type EstructuraFormulario = FormularioEstructura;

/** @deprecated Usar Pregunta */
export type PreguntaFormulario = Pregunta;
