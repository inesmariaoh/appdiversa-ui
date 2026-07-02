/**
 * Extrae el codigo de catalogo desde metadata o endpoint del backend.
 */

import type { CatalogoAsociadoMetadata } from '@/types/formulario';

export function extraerCodigoCatalogo(
  catalogo: CatalogoAsociadoMetadata | null | undefined
): string | null {
  if (!catalogo) return null;
  if (catalogo.codigo?.trim()) return catalogo.codigo.trim();

  const endpoint = catalogo.endpoint_items?.trim();
  if (!endpoint) return null;

  const coincidencia = endpoint.match(/\/catalogos\/([^/]+)\/items\/?/);
  return coincidencia?.[1] ?? null;
}
