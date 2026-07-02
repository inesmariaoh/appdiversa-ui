/**
 * Tipos de respuestas segun openapi_export.json.
 */

import type { ResultadoReglas } from './reglas';

export type OrigenRespuesta = 'web' | 'offline' | 'sincronizacion';

export interface GuardarRespuestaEntrada {
  uuid_sesion: string;
  codigo_pregunta: string;
  valor: unknown;
  observacion?: string;
  origen_respuesta?: OrigenRespuesta;
  fecha_respuesta_cliente?: string | null;
  token_cliente?: string;
}

export interface GuardarRespuestaSalida {
  uuid_sesion: string;
  codigo_pregunta: string;
  version_respuesta: number;
  origen_respuesta: string;
  requiere_sincronizacion: boolean;
  esta_eliminado: boolean;
  reglas?: ResultadoReglas;
}

export interface Respuesta {
  codigo_pregunta: string;
  tipo_pregunta: string;
  valor_numero: string | null;
  valor_texto: string;
  valor_json: unknown;
  valor_booleano: boolean | null;
  valor_fecha: string | null;
  valor_hora: string | null;
  valor_fecha_hora: string | null;
  observacion?: string;
  origen_respuesta: OrigenRespuesta;
  version_respuesta: number;
  fecha_respuesta_cliente: string | null;
  fecha_respuesta_servidor: string;
}

export interface RespuestasSesion {
  uuid_sesion: string;
  estado: string;
  respuestas: Respuesta[];
}

export interface RespuestaLocal {
  uuid_local: string;
  codigo_pregunta: string;
  valor: unknown;
  version_cliente: number;
  fecha_cliente: string;
  checksum: string;
  origen_respuesta: OrigenRespuesta;
}
