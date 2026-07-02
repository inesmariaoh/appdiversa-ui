import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import 'fake-indexeddb/auto';
import { appDiversaDb } from './appDiversaDb';
import { guardarEstructuraEnCache, obtenerEstructuraDesdeCache } from './formulariosCache';

const estructuraMinima = {
  uuid: '11111111-1111-1111-1111-111111111111',
  codigo: 'F1',
  nombre: 'Formulario prueba',
  descripcion: 'Desc',
  introduccion: '',
  objetivo: '',
  tipo_formulario: 'encuesta',
  imagen_portada: null,
  version: { id: 1, numero_version: 1 },
  textos: [],
  secciones: [],
};

describe('appDiversaDb formularios_cache', () => {
  beforeEach(async () => {
    await appDiversaDb.delete();
    await appDiversaDb.open();
  });

  afterEach(async () => {
    await appDiversaDb.delete();
  });

  it('guarda y recupera estructura de formulario', async () => {
    await guardarEstructuraEnCache(estructuraMinima.uuid, estructuraMinima);

    const recuperada = await obtenerEstructuraDesdeCache(estructuraMinima.uuid);
    expect(recuperada?.nombre).toBe('Formulario prueba');
  });
});
