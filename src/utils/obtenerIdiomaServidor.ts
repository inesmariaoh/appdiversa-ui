/**
 * Resuelve el idioma activo en componentes de servidor Next.js.
 */

import { cookies } from 'next/headers';
import { NOMBRE_COOKIE_IDIOMA, NOMBRE_COOKIE_ACCESIBILIDAD } from './idiomaCookie';

export async function obtenerIdiomaServidor(): Promise<string> {
  const almacen = await cookies();
  return almacen.get(NOMBRE_COOKIE_IDIOMA)?.value ?? 'es';
}

export interface ParametrosIdiomaServidor {
  idioma: string;
  incluir_accesibilidad?: boolean;
}

export async function obtenerParametrosIdiomaServidor(): Promise<ParametrosIdiomaServidor> {
  const almacen = await cookies();
  const idioma = almacen.get(NOMBRE_COOKIE_IDIOMA)?.value ?? 'es';
  const incluirAccesibilidad = almacen.get(NOMBRE_COOKIE_ACCESIBILIDAD)?.value === '1';
  return { idioma, incluir_accesibilidad: incluirAccesibilidad };
}
