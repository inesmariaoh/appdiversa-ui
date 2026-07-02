/**
 * Tipos de sincronizacion offline segun openapi_export.json.
 */

export interface OperacionSincronizacionEntrada {
  uuid_local: string;
  codigo_pregunta: string;
  valor: unknown;
  version_cliente: number;
  fecha_cliente: string;
  checksum?: string;
}

export interface SincronizarBatchEntrada {
  uuid_sesion: string;
  token_cliente: string;
  dispositivo: string;
  version_app: string;
  operaciones: OperacionSincronizacionEntrada[];
}

export interface ResultadoOperacionConflicto {
  uuid_local: string;
  mensaje: string | null;
  respuesta_id: number | null;
}

export interface ResultadoOperacionError {
  uuid_local: string;
  mensaje: string | null;
}

export interface SincronizarBatchSalida {
  operaciones_procesadas: number;
  operaciones_actualizadas: number;
  duplicadas: number;
  conflictos: ResultadoOperacionConflicto[];
  errores: ResultadoOperacionError[];
}
