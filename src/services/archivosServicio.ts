/**
 * Servicio para archivos del repositorio.
 * POST /api/v1/archivos/ (multipart/form-data)
 * GET /api/v1/archivos/{uuid}/
 * GET /api/v1/archivos/{uuid}/descargar/
 */

import type {
  ArchivoRepositorio,
  SubirArchivoEntrada,
  SubirArchivoMultipart,
} from '@/types/archivo';
import type { CredencialesSesion } from '@/types/sesion';
import { crearConfigConSesion } from '@/utils/headersSesion';
import { apiCliente } from './api';

const RUTA_ARCHIVOS = '/api/v1/archivos/';
const RUTA_ARCHIVO = (uuidArchivo: string) => `/api/v1/archivos/${uuidArchivo}/`;
const RUTA_DESCARGAR = (uuidArchivo: string) =>
  `${RUTA_ARCHIVO(uuidArchivo)}descargar/`;

function construirFormData(entrada: SubirArchivoMultipart): FormData {
  const formData = new FormData();
  formData.append('archivo', entrada.archivo);
  formData.append('tipo_archivo', entrada.tipo_archivo);
  formData.append('origen', entrada.origen);
  if (entrada.descripcion) formData.append('descripcion', entrada.descripcion);
  if (entrada.es_publico !== undefined) {
    formData.append('es_publico', String(entrada.es_publico));
  }
  if (entrada.metadatos !== undefined) {
    formData.append('metadatos', JSON.stringify(entrada.metadatos));
  }
  if (entrada.uuid_sesion) formData.append('uuid_sesion', entrada.uuid_sesion);
  if (entrada.token_cliente) formData.append('token_cliente', entrada.token_cliente);
  return formData;
}

/** @deprecated Usar subirArchivoMultipart */
export async function subirArchivo(
  entrada: SubirArchivoEntrada,
  credenciales?: CredencialesSesion
): Promise<ArchivoRepositorio> {
  const respuesta = await apiCliente.post<ArchivoRepositorio>(
    RUTA_ARCHIVOS,
    entrada,
    credenciales ? crearConfigConSesion(credenciales) : undefined
  );
  return respuesta.data;
}

export async function subirArchivoMultipart(
  entrada: SubirArchivoMultipart,
  credenciales: CredencialesSesion
): Promise<ArchivoRepositorio> {
  const formData = construirFormData(entrada);
  const respuesta = await apiCliente.post<ArchivoRepositorio>(
    RUTA_ARCHIVOS,
    formData,
    {
      ...crearConfigConSesion(credenciales),
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  );
  return respuesta.data;
}

export async function obtenerArchivo(uuidArchivo: string): Promise<ArchivoRepositorio> {
  const respuesta = await apiCliente.get<ArchivoRepositorio>(
    RUTA_ARCHIVO(uuidArchivo)
  );
  return respuesta.data;
}

export async function descargarArchivo(uuidArchivo: string): Promise<Blob> {
  const respuesta = await apiCliente.get<Blob>(RUTA_DESCARGAR(uuidArchivo), {
    responseType: 'blob',
  });
  return respuesta.data;
}
