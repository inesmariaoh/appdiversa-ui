/**
 * Cache local de items de catalogos.
 */

import type { ItemCatalogo } from '@/types/catalogo';
import { appDiversaDb } from './appDiversaDb';

export async function guardarCatalogoEnCache(
  codigoCatalogo: string,
  items: ItemCatalogo[]
): Promise<void> {
  await appDiversaDb.catalogos_cache.put({
    codigo_catalogo: codigoCatalogo,
    items,
    fecha_cache: new Date().toISOString(),
  });
}

export async function obtenerCatalogoDesdeCache(
  codigoCatalogo: string
): Promise<ItemCatalogo[] | null> {
  const registro = await appDiversaDb.catalogos_cache.get(codigoCatalogo);
  return registro?.items ?? null;
}
