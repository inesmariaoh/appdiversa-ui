/**
 * Servicio para gestion administrativa de usuarios.
 */

import type {
  GrupoAdmin,
  UsuarioAdminEntrada,
  UsuarioAdminResumen,
} from '@/types/admin';
import { apiCliente } from './api';

const CONFIG_SESION = { withCredentials: true };
const BASE = '/api/v1/admin/usuarios';
const ruta = (id: number) => `${BASE}/${id}/`;

export async function listarUsuariosAdmin(): Promise<UsuarioAdminResumen[]> {
  const respuesta = await apiCliente.get<UsuarioAdminResumen[]>(`${BASE}/`, CONFIG_SESION);
  return respuesta.data;
}

export async function obtenerUsuarioAdmin(id: number): Promise<UsuarioAdminResumen> {
  const respuesta = await apiCliente.get<UsuarioAdminResumen>(ruta(id), CONFIG_SESION);
  return respuesta.data;
}

export async function crearUsuarioAdmin(
  entrada: UsuarioAdminEntrada
): Promise<UsuarioAdminResumen> {
  const respuesta = await apiCliente.post<UsuarioAdminResumen>(
    `${BASE}/`,
    entrada,
    CONFIG_SESION
  );
  return respuesta.data;
}

export async function actualizarUsuarioAdmin(
  id: number,
  entrada: Partial<UsuarioAdminEntrada>
): Promise<UsuarioAdminResumen> {
  const respuesta = await apiCliente.patch<UsuarioAdminResumen>(
    ruta(id),
    entrada,
    CONFIG_SESION
  );
  return respuesta.data;
}

export async function activarUsuarioAdmin(id: number): Promise<UsuarioAdminResumen> {
  const respuesta = await apiCliente.post<UsuarioAdminResumen>(
    `${ruta(id)}activar/`,
    {},
    CONFIG_SESION
  );
  return respuesta.data;
}

export async function desactivarUsuarioAdmin(id: number): Promise<UsuarioAdminResumen> {
  const respuesta = await apiCliente.post<UsuarioAdminResumen>(
    `${ruta(id)}desactivar/`,
    {},
    CONFIG_SESION
  );
  return respuesta.data;
}

export async function listarGruposAdmin(): Promise<GrupoAdmin[]> {
  const respuesta = await apiCliente.get<GrupoAdmin[]>(
    '/api/v1/admin/grupos/',
    CONFIG_SESION
  );
  return respuesta.data;
}
