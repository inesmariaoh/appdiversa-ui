/**
 * Tipos para gestion administrativa de formularios y usuarios.
 */

import type { TipoFormulario, TipoPregunta, TipoTextoFormulario } from './formulario';
import type { AccionRegla, OperadorRegla } from './reglas';

export type EstadoFormularioAdmin =
  | 'borrador'
  | 'publicado'
  | 'cerrado'
  | 'archivado';

export interface FormularioAdminResumen {
  id: number;
  uuid: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  tipo_formulario: TipoFormulario;
  estado: EstadoFormularioAdmin;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  version_publicada: number | null;
  permite_offline: boolean;
  permite_registro_final: boolean;
  imagen_portada: string | null;
  fecha_creacion: string;
  fecha_modificacion: string;
}

export interface FormularioAdminDetalle extends FormularioAdminResumen {
  introduccion: string;
  objetivo: string;
}

export interface FormularioAdminEntrada {
  codigo: string;
  nombre: string;
  descripcion?: string;
  introduccion?: string;
  objetivo?: string;
  tipo_formulario: TipoFormulario;
  estado?: EstadoFormularioAdmin;
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
  permite_offline?: boolean;
  permite_registro_final?: boolean;
  imagen_portada?: string | null;
}

export interface VersionFormularioAdmin {
  id: number;
  numero_version: number;
  estado: string;
  fecha_creacion: string;
  fecha_publicacion: string | null;
}

export interface SeccionAdminEntrada {
  codigo: string;
  titulo: string;
  descripcion?: string;
  texto_ayuda?: string;
  orden: number;
}

export interface OpcionAdminEntrada {
  codigo: string;
  etiqueta: string;
  valor: string;
  tooltip?: string;
  tiene_tooltip?: boolean;
  orden: number;
  es_excluyente?: boolean;
  activa_otro?: boolean;
}

export interface PreguntaAdminEntrada {
  codigo: string;
  texto: string;
  descripcion?: string;
  tooltip?: string;
  tiene_tooltip?: boolean;
  tipo_pregunta: TipoPregunta;
  es_obligatoria?: boolean;
  es_pregunta_filtro?: boolean;
  permite_otro?: boolean;
  permite_observacion?: boolean;
  orden: number;
  longitud_minima?: number | null;
  longitud_maxima?: number | null;
  valor_minimo?: string | null;
  valor_maximo?: string | null;
  expresion_regular?: string;
  mensaje_error?: string;
  usa_catalogo?: boolean;
  catalogo_asociado?: string | null;
  pregunta_padre_catalogo?: string | null;
  permite_busqueda_catalogo?: boolean;
  limite_items_catalogo?: number | null;
  seccion_codigo: string;
}

export interface TextoAdminEntrada {
  tipo: TipoTextoFormulario;
  titulo?: string;
  contenido: string;
}

export interface ReglaAdminEntrada {
  id?: number;
  pregunta_origen: string;
  operador: OperadorRegla;
  valor_esperado: unknown;
  accion: AccionRegla;
  pregunta_destino?: string | null;
  seccion_destino?: string | null;
  mensaje?: string;
  esta_activa?: boolean;
}

export interface ReordenarEntrada {
  codigos: string[];
}

export interface UsuarioAdminResumen {
  id: number;
  username: string;
  email: string;
  nombre_completo: string;
  esta_activo: boolean;
  grupos: string[];
  permisos: string[];
  fecha_creacion: string;
}

export interface UsuarioAdminEntrada {
  username: string;
  email: string;
  nombre_completo: string;
  password?: string;
  grupos?: string[];
  esta_activo?: boolean;
}

export interface GrupoAdmin {
  codigo: string;
  nombre: string;
}
