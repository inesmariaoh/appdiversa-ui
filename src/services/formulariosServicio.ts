/**
 * Servicio para consumir los endpoints de formularios.
 * GET /api/v1/formularios/disponibles/
 * GET /api/v1/formularios/{uuid}/estructura/
 */

import type { FormularioDisponible, FormularioEstructura } from '@/types/formulario';
import {
  normalizarFormulariosDisponibles,
  type FormularioDisponibleEntrada,
} from '@/utils/formularioDisponibilidad';
import { apiCliente } from './api';

const RUTA_DISPONIBLES = '/api/v1/formularios/disponibles/';
const RUTA_ESTRUCTURA = (uuid: string) =>
  `/api/v1/formularios/${uuid}/estructura/`;

export interface ParametrosFormularios {
  idioma?: string;
  incluir_accesibilidad?: boolean;
}

export async function obtenerFormulariosDisponibles(
  parametros?: ParametrosFormularios
): Promise<FormularioDisponible[]> {
  const respuesta = await apiCliente.get<FormularioDisponibleEntrada[]>(
    RUTA_DISPONIBLES,
    {
      params: parametros,
    }
  );
  return normalizarFormulariosDisponibles(respuesta.data);
}

export async function obtenerFormularioDisponiblePorUuid(
  uuid: string,
  parametros?: ParametrosFormularios
): Promise<FormularioDisponible | null> {
  const formularios = await obtenerFormulariosDisponibles(parametros);
  return formularios.find((formulario) => formulario.uuid === uuid) ?? null;
}

export async function obtenerEstructuraFormulario(
  uuid: string,
  parametros?: ParametrosFormularios
): Promise<FormularioEstructura> {
  const respuesta = await apiCliente.get<FormularioEstructura>(
    RUTA_ESTRUCTURA(uuid),
    { params: parametros }
  );
  return respuesta.data;
}

/**
 * Obtiene la estructura desde la API y la persiste en IndexedDB cuando corre en cliente.
 * Si la API falla en cliente, intenta devolver la copia cacheada.
 */
export async function obtenerEstructuraConCache(
  uuid: string,
  parametros?: ParametrosFormularios
): Promise<FormularioEstructura> {
  try {
    const estructura = await obtenerEstructuraFormulario(uuid, parametros);
    if (typeof window !== 'undefined') {
      const { guardarEstructuraEnCache } = await import('@/storage/formulariosCache');
      await guardarEstructuraEnCache(uuid, estructura);
    }
    return estructura;
  } catch (error) {
    if (typeof window !== 'undefined') {
      const { obtenerEstructuraDesdeCache } = await import('@/storage/formulariosCache');
      const cacheada = await obtenerEstructuraDesdeCache(uuid);
      if (cacheada) return cacheada;
    }
    throw error;
  }
}

/** @deprecated Usar obtenerEstructuraFormulario con parametros */
export async function obtenerEstructuraFormularioLocalizado(
  uuid: string,
  idioma: string
): Promise<FormularioEstructura> {
  return obtenerEstructuraFormulario(uuid, { idioma });
}
