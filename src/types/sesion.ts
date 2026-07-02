/**
 * Tipos de sesion anonima segun openapi_export.json.
 */

export type EstadoSesion =
  | 'iniciada'
  | 'en_proceso'
  | 'finalizada'
  | 'abandonada'
  | 'sincronizada';

export interface CrearSesionAnonimaEntrada {
  uuid_sesion: string;
  uuid_formulario: string;
  token_cliente?: string;
  idioma?: string;
  zona_horaria?: string;
  es_offline?: boolean;
}

export interface SesionAnonima {
  uuid_sesion: string;
  estado: EstadoSesion;
  token_cliente: string;
}

export interface ValidacionFinalizacion {
  es_valido: boolean;
  total_pendientes: number;
  preguntas_pendientes: PreguntaPendiente[];
}

export interface PreguntaPendiente {
  codigo: string;
  texto: string;
  seccion_codigo: string;
  seccion_titulo: string;
  orden: number;
}

export interface FinalizacionFormulario {
  estado: string;
  mensaje: string;
  resumen: ResumenFormularioSesion;
}

export interface FormularioResumenSesion {
  uuid: string;
  codigo: string;
  nombre: string;
}

export interface VersionResumen {
  numero_version: number;
}

export interface ResumenRespuesta {
  seccion_codigo: string;
  seccion_titulo: string;
  pregunta_codigo: string;
  pregunta_texto: string;
  tipo_pregunta: string;
  valor: unknown;
  valor_legible: string;
  observacion: string;
}

export interface ResumenFormularioSesion {
  uuid_sesion: string;
  estado: string;
  formulario: FormularioResumenSesion;
  version: VersionResumen;
  respuestas: ResumenRespuesta[];
  /** Fecha de finalizacion cuando el backend la incluye en el resumen. */
  fecha_finalizacion?: string | null;
}

export interface CredencialesSesion {
  uuidSesion: string;
  tokenCliente?: string;
}

/**
 * Entrada de historial del usuario autenticado.
 * Fuente: GET /api/v1/auth/mis-respuestas/
 */
export interface HistorialSesion {
  uuid_sesion: string;
  uuid_formulario: string;
  codigo_formulario: string;
  nombre_formulario: string;
  fecha_finalizacion: string;
  fecha_inicio?: string;
  fecha_ultima_actividad?: string;
  total_respuestas: number;
  estado: EstadoSesion;
  es_offline?: boolean;
}

export interface HistorialSesionPaginado {
  count: number;
  next: string | null;
  previous: string | null;
  results: HistorialSesion[];
}

export interface EnviarCopiaRespuestasPayload {
  correo: string;
}
