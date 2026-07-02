/**
 * Resolucion del destino posterior a autenticacion en flujos de formulario.
 */

export const RUTA_HISTORIAL_RESPUESTAS = '/mis-respuestas';
export const RUTA_PANEL_ADMIN = '/admin/formularios';

const PATRON_RUTA_RESUMEN = /\/encuestas\/[^/]+\/resumen\/?$/;

export function destinoPorDefectoSegunRol(esAdministrador: boolean): string {
  return esAdministrador ? RUTA_PANEL_ADMIN : RUTA_HISTORIAL_RESPUESTAS;
}

export function esRutaResumenFormulario(ruta: string): boolean {
  return PATRON_RUTA_RESUMEN.test(ruta.trim());
}

export function resolverDestinoPostAuth(
  rutaActual: string,
  destinoPostAuth?: string,
): string {
  const destinoExplicito = destinoPostAuth?.trim();
  if (destinoExplicito) {
    return destinoExplicito;
  }
  if (esRutaResumenFormulario(rutaActual)) {
    return RUTA_HISTORIAL_RESPUESTAS;
  }
  return rutaActual;
}
