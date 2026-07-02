/**
 * Utilidades para mapear traducciones del backend a claves de UI.
 */

import type { TraduccionEntrada } from '@/services/internacionalizacionServicio';

export function mapaDesdeTraducciones(
  traducciones: TraduccionEntrada[]
): Record<string, string> {
  const mapa: Record<string, string> = {};
  for (const item of traducciones) {
    const clave = item.entidad_uuid
      ? `${item.entidad}.${item.entidad_uuid}.${item.campo}`
      : `${item.entidad}.${item.campo}`;
    mapa[clave] = item.valor;
  }
  return mapa;
}

export function traducirTexto(
  mapa: Record<string, string>,
  clave: string,
  fallback: string
): string {
  return mapa[clave]?.trim() || fallback;
}
