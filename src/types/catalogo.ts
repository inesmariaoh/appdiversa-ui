/**
 * Tipos de catalogos segun openapi_export.json.
 */

export interface Catalogo {
  codigo: string;
  nombre: string;
  descripcion: string;
  tipo_catalogo: string;
  orden: number;
}

export interface ItemCatalogo {
  codigo: string;
  codigo_catalogo: string;
  nombre: string;
  descripcion: string;
  valor: string;
  codigo_padre: string | null;
  codigo_externo: string;
  metadatos: unknown;
  orden: number;
  esta_activo: boolean;
}

export interface ParametrosItemsCatalogo {
  codigo_padre?: string;
  solo_activos?: boolean;
  busqueda?: string;
  limite?: number;
  idioma?: string;
  incluir_accesibilidad?: boolean;
}
