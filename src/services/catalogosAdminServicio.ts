/**
 * Servicio para gestion administrativa de catalogos parametrizables.
 */

import type {
  CatalogoAdmin,
  CatalogoAdminEntrada,
  ItemCatalogoAdmin,
  ItemCatalogoAdminEntrada,
  RespuestaPaginada,
} from '@/types/catalogo';
import { apiCliente } from './api';

const CONFIG_SESION = { withCredentials: true };
const BASE = '/api/v1/admin/catalogos';

const rutaCatalogo = (id: number) => `${BASE}/${id}/`;
const rutaItems = (catalogoId: number) => `${BASE}/${catalogoId}/items/`;
const rutaItem = (itemId: number) => `${BASE}/items/${itemId}/`;

export async function listarCatalogosAdmin(
  busqueda?: string
): Promise<CatalogoAdmin[]> {
  const params = busqueda ? { busqueda } : undefined;
  const respuesta = await apiCliente.get<RespuestaPaginada<CatalogoAdmin>>(`${BASE}/`, {
    ...CONFIG_SESION,
    params,
  });
  return respuesta.data.results;
}

export async function crearCatalogoAdmin(
  entrada: CatalogoAdminEntrada
): Promise<CatalogoAdmin> {
  const respuesta = await apiCliente.post<CatalogoAdmin>(`${BASE}/`, entrada, CONFIG_SESION);
  return respuesta.data;
}

export async function actualizarCatalogoAdmin(
  id: number,
  entrada: Partial<CatalogoAdminEntrada>
): Promise<CatalogoAdmin> {
  const respuesta = await apiCliente.patch<CatalogoAdmin>(rutaCatalogo(id), entrada, CONFIG_SESION);
  return respuesta.data;
}

export async function eliminarCatalogoAdmin(id: number): Promise<void> {
  await apiCliente.delete(rutaCatalogo(id), CONFIG_SESION);
}

export async function listarItemsCatalogoAdmin(
  catalogoId: number,
  busqueda?: string
): Promise<ItemCatalogoAdmin[]> {
  const params = busqueda ? { busqueda } : undefined;
  const respuesta = await apiCliente.get<RespuestaPaginada<ItemCatalogoAdmin>>(
    rutaItems(catalogoId),
    { ...CONFIG_SESION, params }
  );
  return respuesta.data.results;
}

export async function crearItemCatalogoAdmin(
  catalogoId: number,
  entrada: ItemCatalogoAdminEntrada
): Promise<ItemCatalogoAdmin> {
  const respuesta = await apiCliente.post<ItemCatalogoAdmin>(
    rutaItems(catalogoId),
    entrada,
    CONFIG_SESION
  );
  return respuesta.data;
}

export async function actualizarItemCatalogoAdmin(
  itemId: number,
  entrada: Partial<ItemCatalogoAdminEntrada>
): Promise<ItemCatalogoAdmin> {
  const respuesta = await apiCliente.patch<ItemCatalogoAdmin>(
    rutaItem(itemId),
    entrada,
    CONFIG_SESION
  );
  return respuesta.data;
}

export async function eliminarItemCatalogoAdmin(itemId: number): Promise<void> {
  await apiCliente.delete(rutaItem(itemId), CONFIG_SESION);
}
