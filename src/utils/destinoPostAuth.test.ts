import { describe, it, expect } from 'vitest';
import {
  RUTA_HISTORIAL_RESPUESTAS,
  RUTA_PANEL_ADMIN,
  destinoPorDefectoSegunRol,
  esRutaResumenFormulario,
  resolverDestinoPostAuth,
} from './destinoPostAuth';

describe('destinoPostAuth', () => {
  it('detecta rutas de resumen de encuesta', () => {
    expect(esRutaResumenFormulario('/encuestas/uuid/resumen')).toBe(true);
    expect(esRutaResumenFormulario('/encuestas/uuid/resumen/')).toBe(true);
    expect(esRutaResumenFormulario('/encuestas/uuid/responder')).toBe(false);
  });

  it('redirige resumen al historial de respuestas', () => {
    expect(
      resolverDestinoPostAuth('/encuestas/uuid/resumen'),
    ).toBe(RUTA_HISTORIAL_RESPUESTAS);
  });

  it('respeta destino explicito sobre resumen', () => {
    expect(
      resolverDestinoPostAuth('/encuestas/uuid/resumen', '/otra-ruta'),
    ).toBe('/otra-ruta');
  });

  it('conserva destino en flujo de diligenciamiento', () => {
    const ruta = '/encuestas/uuid/responder';
    expect(resolverDestinoPostAuth(ruta)).toBe(ruta);
  });

  it('envia a los administradores al panel de administracion', () => {
    expect(destinoPorDefectoSegunRol(true)).toBe(RUTA_PANEL_ADMIN);
  });

  it('envia a los usuarios normales al historial de respuestas', () => {
    expect(destinoPorDefectoSegunRol(false)).toBe(RUTA_HISTORIAL_RESPUESTAS);
  });
});
