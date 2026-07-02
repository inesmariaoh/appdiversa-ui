/**
 * Acceso a cache local de estructuras de formulario.
 */

import type { FormularioEstructura } from '@/types/formulario';
import { appDiversaDb } from './appDiversaDb';

export async function guardarEstructuraEnCache(
  uuidFormulario: string,
  estructura: FormularioEstructura
): Promise<void> {
  await appDiversaDb.formularios_cache.put({
    uuid_formulario: uuidFormulario,
    estructura,
    fecha_cache: new Date().toISOString(),
  });
}

export async function obtenerEstructuraDesdeCache(
  uuidFormulario: string
): Promise<FormularioEstructura | null> {
  const registro = await appDiversaDb.formularios_cache.get(uuidFormulario);
  return registro?.estructura ?? null;
}
