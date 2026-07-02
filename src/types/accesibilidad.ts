/**
 * Tipos de contenido accesible multimodal del backend.
 */

export interface ContenidoAccesible {
  lectura_facil?: string;
  texto_alternativo?: string;
  transcripcion?: string;
  archivo_audio?: string | null;
  archivo_video?: string | null;
  archivo_imagen?: string | null;
  archivo_lengua_senas?: string | null;
  metadatos?: unknown;
}
