import { describe, it, expect } from 'vitest';
import { mapaDesdeTraducciones, traducirTexto } from './traduccionesUi';

describe('traduccionesUi', () => {
  it('construye claves con y sin entidad_uuid', () => {
    const mapa = mapaDesdeTraducciones([
      { entidad: 'app', campo: 'titulo', valor: 'Inicio', idioma: 'es' },
      {
        entidad: 'formulario',
        entidad_uuid: 'uuid-1',
        campo: 'nombre',
        valor: 'Encuesta',
        idioma: 'es',
      },
    ]);

    expect(mapa['app.titulo']).toBe('Inicio');
    expect(mapa['formulario.uuid-1.nombre']).toBe('Encuesta');
  });

  it('traduce con fallback cuando falta clave', () => {
    const mapa = { 'app.titulo': 'Inicio' };
    expect(traducirTexto(mapa, 'app.titulo', 'Home')).toBe('Inicio');
    expect(traducirTexto(mapa, 'app.otro', 'Home')).toBe('Home');
    expect(traducirTexto({ 'app.vacio': '   ' }, 'app.vacio', 'Home')).toBe('Home');
  });
});
