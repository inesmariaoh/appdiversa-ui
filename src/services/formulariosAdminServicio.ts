/**
 * Servicio para gestion administrativa de formularios.
 */

import type { FormularioEstructura } from '@/types/formulario';
import type {
  FormularioAdminDetalle,
  FormularioAdminEntrada,
  FormularioAdminResumen,
  OpcionAdminEntrada,
  PreguntaAdminEntrada,
  ReglaAdminEntrada,
  ReordenarEntrada,
  SeccionAdminEntrada,
  TextoAdminEntrada,
  VersionFormularioAdmin,
} from '@/types/admin';
import { apiCliente } from './api';

const CONFIG_SESION = { withCredentials: true };
const BASE = '/api/v1/admin/formularios';
const ruta = (id: number | string) => `${BASE}/${id}/`;

export async function listarFormulariosAdmin(): Promise<FormularioAdminResumen[]> {
  const respuesta = await apiCliente.get<FormularioAdminResumen[]>(`${BASE}/`, CONFIG_SESION);
  return respuesta.data;
}

export async function obtenerFormularioAdmin(id: number): Promise<FormularioAdminDetalle> {
  const respuesta = await apiCliente.get<FormularioAdminDetalle>(ruta(id), CONFIG_SESION);
  return respuesta.data;
}

export async function crearFormularioAdmin(
  entrada: FormularioAdminEntrada
): Promise<FormularioAdminDetalle> {
  const respuesta = await apiCliente.post<FormularioAdminDetalle>(
    `${BASE}/`,
    entrada,
    CONFIG_SESION
  );
  return respuesta.data;
}

export async function actualizarFormularioAdmin(
  id: number,
  entrada: Partial<FormularioAdminEntrada>
): Promise<FormularioAdminDetalle> {
  const respuesta = await apiCliente.patch<FormularioAdminDetalle>(
    ruta(id),
    entrada,
    CONFIG_SESION
  );
  return respuesta.data;
}

export async function eliminarFormularioAdmin(id: number): Promise<void> {
  await apiCliente.delete(ruta(id), CONFIG_SESION);
}

export async function duplicarFormularioAdmin(id: number): Promise<FormularioAdminDetalle> {
  const respuesta = await apiCliente.post<FormularioAdminDetalle>(
    `${ruta(id)}duplicar/`,
    {},
    CONFIG_SESION
  );
  return respuesta.data;
}

export async function publicarFormularioAdmin(id: number): Promise<FormularioAdminDetalle> {
  const respuesta = await apiCliente.post<FormularioAdminDetalle>(
    `${ruta(id)}publicar/`,
    {},
    CONFIG_SESION
  );
  return respuesta.data;
}

export async function cerrarFormularioAdmin(id: number): Promise<FormularioAdminDetalle> {
  const respuesta = await apiCliente.post<FormularioAdminDetalle>(
    `${ruta(id)}cerrar/`,
    {},
    CONFIG_SESION
  );
  return respuesta.data;
}

export async function listarVersionesAdmin(id: number): Promise<VersionFormularioAdmin[]> {
  const respuesta = await apiCliente.get<VersionFormularioAdmin[]>(
    `${ruta(id)}versiones/`,
    CONFIG_SESION
  );
  return respuesta.data;
}

export async function obtenerEstructuraAdmin(id: number): Promise<FormularioEstructura> {
  const respuesta = await apiCliente.get<FormularioEstructura>(
    `${ruta(id)}estructura/`,
    CONFIG_SESION
  );
  return respuesta.data;
}

export async function crearSeccionAdmin(
  id: number,
  entrada: SeccionAdminEntrada
): Promise<SeccionAdminEntrada> {
  const respuesta = await apiCliente.post<SeccionAdminEntrada>(
    `${ruta(id)}secciones/`,
    entrada,
    CONFIG_SESION
  );
  return respuesta.data;
}

export async function actualizarSeccionAdmin(
  id: number,
  codigo: string,
  entrada: Partial<SeccionAdminEntrada>
): Promise<SeccionAdminEntrada> {
  const respuesta = await apiCliente.patch<SeccionAdminEntrada>(
    `${ruta(id)}secciones/${codigo}/`,
    entrada,
    CONFIG_SESION
  );
  return respuesta.data;
}

export async function eliminarSeccionAdmin(id: number, codigo: string): Promise<void> {
  await apiCliente.delete(`${ruta(id)}secciones/${codigo}/`, CONFIG_SESION);
}

export async function reordenarSeccionesAdmin(
  id: number,
  entrada: ReordenarEntrada
): Promise<void> {
  await apiCliente.post(`${ruta(id)}secciones/reordenar/`, entrada, CONFIG_SESION);
}

export async function crearPreguntaAdmin(
  id: number,
  entrada: PreguntaAdminEntrada
): Promise<PreguntaAdminEntrada> {
  const respuesta = await apiCliente.post<PreguntaAdminEntrada>(
    `${ruta(id)}preguntas/`,
    entrada,
    CONFIG_SESION
  );
  return respuesta.data;
}

export async function actualizarPreguntaAdmin(
  id: number,
  codigo: string,
  entrada: Partial<PreguntaAdminEntrada>
): Promise<PreguntaAdminEntrada> {
  const respuesta = await apiCliente.patch<PreguntaAdminEntrada>(
    `${ruta(id)}preguntas/${codigo}/`,
    entrada,
    CONFIG_SESION
  );
  return respuesta.data;
}

export async function eliminarPreguntaAdmin(id: number, codigo: string): Promise<void> {
  await apiCliente.delete(`${ruta(id)}preguntas/${codigo}/`, CONFIG_SESION);
}

export async function duplicarPreguntaAdmin(
  id: number,
  codigo: string
): Promise<PreguntaAdminEntrada> {
  const respuesta = await apiCliente.post<PreguntaAdminEntrada>(
    `${ruta(id)}preguntas/${codigo}/duplicar/`,
    {},
    CONFIG_SESION
  );
  return respuesta.data;
}

export async function reordenarPreguntasAdmin(
  id: number,
  entrada: ReordenarEntrada
): Promise<void> {
  await apiCliente.post(`${ruta(id)}preguntas/reordenar/`, entrada, CONFIG_SESION);
}

export async function crearOpcionAdmin(
  id: number,
  codigoPregunta: string,
  entrada: OpcionAdminEntrada
): Promise<OpcionAdminEntrada> {
  const respuesta = await apiCliente.post<OpcionAdminEntrada>(
    `${ruta(id)}preguntas/${codigoPregunta}/opciones/`,
    entrada,
    CONFIG_SESION
  );
  return respuesta.data;
}

export async function actualizarOpcionAdmin(
  id: number,
  codigo: string,
  entrada: Partial<OpcionAdminEntrada>
): Promise<OpcionAdminEntrada> {
  const respuesta = await apiCliente.patch<OpcionAdminEntrada>(
    `${ruta(id)}opciones/${codigo}/`,
    entrada,
    CONFIG_SESION
  );
  return respuesta.data;
}

export async function eliminarOpcionAdmin(id: number, codigo: string): Promise<void> {
  await apiCliente.delete(`${ruta(id)}opciones/${codigo}/`, CONFIG_SESION);
}

export async function reordenarOpcionesAdmin(
  id: number,
  codigoPregunta: string,
  entrada: ReordenarEntrada
): Promise<void> {
  await apiCliente.post(
    `${ruta(id)}preguntas/${codigoPregunta}/opciones/reordenar/`,
    entrada,
    CONFIG_SESION
  );
}

export async function actualizarTextosAdmin(
  id: number,
  textos: TextoAdminEntrada[]
): Promise<TextoAdminEntrada[]> {
  const respuesta = await apiCliente.patch<TextoAdminEntrada[]>(
    `${ruta(id)}textos/`,
    { textos },
    CONFIG_SESION
  );
  return respuesta.data;
}

export async function crearReglaAdmin(
  id: number,
  entrada: ReglaAdminEntrada
): Promise<ReglaAdminEntrada> {
  const respuesta = await apiCliente.post<ReglaAdminEntrada>(
    `${ruta(id)}reglas/`,
    entrada,
    CONFIG_SESION
  );
  return respuesta.data;
}

export async function actualizarReglaAdmin(
  id: number,
  idRegla: number,
  entrada: Partial<ReglaAdminEntrada>
): Promise<ReglaAdminEntrada> {
  const respuesta = await apiCliente.patch<ReglaAdminEntrada>(
    `${ruta(id)}reglas/${idRegla}/`,
    entrada,
    CONFIG_SESION
  );
  return respuesta.data;
}

export async function eliminarReglaAdmin(id: number, idRegla: number): Promise<void> {
  await apiCliente.delete(`${ruta(id)}reglas/${idRegla}/`, CONFIG_SESION);
}

export async function listarReglasAdmin(id: number): Promise<ReglaAdminEntrada[]> {
  const respuesta = await apiCliente.get<ReglaAdminEntrada[]>(
    `${ruta(id)}reglas/`,
    CONFIG_SESION
  );
  return respuesta.data;
}
