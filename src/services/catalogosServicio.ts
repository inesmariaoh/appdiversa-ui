/**
 * Servicio para consumir endpoints de catalogos.
 * GET /api/v1/catalogos/
 * GET /api/v1/catalogos/{codigo}/items/
 * GET /api/v1/catalogos/{codigo}/items/{codigo_item}/hijos/
 */

import type { Catalogo, ItemCatalogo, ParametrosItemsCatalogo } from '@/types/catalogo';
import { apiCliente } from './api';

const RUTA_CATALOGOS = '/api/v1/catalogos/';
const RUTA_ITEMS = (codigoCatalogo: string) =>
  `/api/v1/catalogos/${codigoCatalogo}/items/`;
const RUTA_HIJOS = (codigoCatalogo: string, codigoItem: string) =>
  `/api/v1/catalogos/${codigoCatalogo}/items/${codigoItem}/hijos/`;

export async function obtenerCatalogos(): Promise<Catalogo[]> {
  const respuesta = await apiCliente.get<Catalogo[]>(RUTA_CATALOGOS);
  return respuesta.data;
}

export async function obtenerItemsCatalogo(
  codigoCatalogo: string,
  parametros?: ParametrosItemsCatalogo
): Promise<ItemCatalogo[]> {
  const respuesta = await apiCliente.get<ItemCatalogo[]>(
    RUTA_ITEMS(codigoCatalogo),
    { params: parametros }
  );
  return respuesta.data;
}

export async function obtenerItemsHijosCatalogo(
  codigoCatalogo: string,
  codigoItem: string,
  parametros?: ParametrosItemsCatalogo
): Promise<ItemCatalogo[]> {
  const respuesta = await apiCliente.get<ItemCatalogo[]>(
    RUTA_HIJOS(codigoCatalogo, codigoItem),
    { params: parametros }
  );
  return respuesta.data;
}
