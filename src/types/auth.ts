/**
 * Tipos para autenticacion Django del panel administrativo.
 */

export interface UsuarioAutenticado {
  id: number;
  username: string;
  email: string;
  nombre_completo: string;
  esta_activo: boolean;
}

export interface PerfilAutenticado {
  usuario: UsuarioAutenticado;
  grupos: string[];
  permisos: string[];
}

export interface PerfilEditable {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  fecha_ultimo_inicio_sesion: string | null;
  tipo_inicio_sesion: string;
  tipo_inicio_sesion_etiqueta: string;
}

export interface PerfilActualizacionEntrada {
  first_name?: string;
  last_name?: string;
  email?: string;
}

export interface LoginEntrada {
  username: string;
  password: string;
}

export interface RegistroCorreoEntrada {
  correo: string;
  contrasena: string;
}

export interface CambiarPasswordEntrada {
  password_actual: string;
  password_nueva: string;
  password_nueva_confirmacion: string;
}

export interface RespuestaDetalle {
  detalle: string;
}

export interface SolicitarRestaurarPasswordPayload {
  email: string;
}

export interface RestaurarPasswordPayload {
  uid: string;
  token: string;
  password_nueva: string;
  password_confirmacion: string;
}

export const GRUPO_ADMINISTRADOR_GENERAL = 'administrador_general';
export const GRUPO_ADMIN_APPDIVERSA = 'admin_appdiversa';
export const GRUPO_GESTOR_FORMULARIOS = 'gestor_formularios';
export const GRUPO_EDITOR_FORMULARIOS = 'editor_formularios';
export const GRUPO_LECTOR_FORMULARIOS = 'lector_formularios';

export const GRUPOS_ADMINISTRADOR: readonly string[] = [
  GRUPO_ADMINISTRADOR_GENERAL,
  GRUPO_ADMIN_APPDIVERSA,
];

export const PERMISO_FORMULARIOS_VER = 'formularios.ver';
export const PERMISO_FORMULARIOS_EDITAR = 'formularios.editar';
export const PERMISO_FORMULARIOS_PUBLICAR = 'formularios.publicar';
export const PERMISO_USUARIOS_VER = 'usuarios.ver';
export const PERMISO_USUARIOS_EDITAR = 'usuarios.editar';

/** Indica si el codigo de grupo corresponde a un administrador del aplicativo. */
export function esGrupoAdministrador(grupo: string): boolean {
  return GRUPOS_ADMINISTRADOR.includes(grupo);
}

/** Indica si alguno de los grupos del usuario es administrador del aplicativo. */
export function tieneGrupoAdministrador(grupos: readonly string[]): boolean {
  return grupos.some(esGrupoAdministrador);
}
