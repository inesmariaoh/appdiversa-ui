/**
 * Persistencia de aceptacion de terminos por sesion y formulario en IndexedDB.
 */

import { appDiversaDb } from './appDiversaDb';

export async function guardarAceptacionTerminos(datos: {
  uuid_sesion: string;
  uuid_formulario: string;
  version_texto_terminos?: string | null;
}): Promise<void> {
  const existente = await obtenerAceptacionTerminos(
    datos.uuid_sesion,
    datos.uuid_formulario
  );

  if (existente?.id) {
    await appDiversaDb.aceptaciones_terminos.update(existente.id, {
      fecha_aceptacion: new Date().toISOString(),
      version_texto_terminos: datos.version_texto_terminos ?? null,
    });
    return;
  }

  await appDiversaDb.aceptaciones_terminos.add({
    uuid_sesion: datos.uuid_sesion,
    uuid_formulario: datos.uuid_formulario,
    fecha_aceptacion: new Date().toISOString(),
    version_texto_terminos: datos.version_texto_terminos ?? null,
  });
}

export async function obtenerAceptacionTerminos(
  uuidSesion: string,
  uuidFormulario: string
) {
  return appDiversaDb.aceptaciones_terminos
    .where('[uuid_sesion+uuid_formulario]')
    .equals([uuidSesion, uuidFormulario])
    .first();
}

export async function limpiarAceptacionTerminosSesion(uuidSesion: string): Promise<void> {
  await appDiversaDb.aceptaciones_terminos
    .where('uuid_sesion')
    .equals(uuidSesion)
    .delete();
}
