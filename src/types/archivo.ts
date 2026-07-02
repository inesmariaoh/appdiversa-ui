/**
 * Tipos de archivos segun openapi_export.json.
 */

export type TipoArchivo =
  | 'imagen'
  | 'documento'
  | 'audio'
  | 'video'
  | 'firma'
  | 'otro';

export type OrigenArchivo =
  | 'formulario'
  | 'pregunta'
  | 'respuesta'
  | 'internacionalizacion'
  | 'configuracion'
  | 'catalogo'
  | 'notificacion'
  | 'otro';

export type EstadoArchivoRepositorio =
  | 'activo'
  | 'eliminado'
  | 'cuarentena'
  | 'procesando';

export interface SubirArchivoEntrada {
  archivo: string;
  tipo_archivo: TipoArchivo;
  origen: OrigenArchivo;
  descripcion?: string;
  es_publico?: boolean;
  metadatos?: unknown;
  uuid_sesion?: string | null;
  token_cliente?: string;
}

export interface SubirArchivoMultipart {
  archivo: File;
  tipo_archivo: TipoArchivo;
  origen: OrigenArchivo;
  descripcion?: string;
  es_publico?: boolean;
  metadatos?: unknown;
  uuid_sesion?: string | null;
  token_cliente?: string;
}

export interface ValorArchivoRespuesta {
  uuid: string;
  nombre: string;
  url: string | null;
  mime_type: string;
  tamano_bytes: number;
}

export interface ArchivoRepositorio {
  uuid: string;
  nombre_original: string;
  extension: string;
  mime_type: string;
  tamano_bytes: number;
  checksum_sha256: string;
  tipo_archivo: TipoArchivo;
  es_publico: boolean;
  origen: OrigenArchivo;
  estado: EstadoArchivoRepositorio;
  descripcion: string;
  metadatos: unknown;
  fecha_carga: string;
  usuario_keycloak: string;
  uuid_sesion: string | null;
  url: string | null;
}
