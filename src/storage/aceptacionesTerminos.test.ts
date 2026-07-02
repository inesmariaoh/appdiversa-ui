import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import 'fake-indexeddb/auto';
import { appDiversaDb } from './appDiversaDb';
import {
  guardarAceptacionTerminos,
  obtenerAceptacionTerminos,
  limpiarAceptacionTerminosSesion,
} from './aceptacionesTerminos';

const UUID_SESION = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const UUID_FORMULARIO = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

describe('aceptacionesTerminos', () => {
  beforeEach(async () => {
    await appDiversaDb.delete();
    await appDiversaDb.open();
  });

  afterEach(async () => {
    await appDiversaDb.delete();
  });

  it('guarda y recupera aceptacion por sesion y formulario', async () => {
    await guardarAceptacionTerminos({
      uuid_sesion: UUID_SESION,
      uuid_formulario: UUID_FORMULARIO,
      version_texto_terminos: 'Terminos v1',
    });

    const aceptacion = await obtenerAceptacionTerminos(UUID_SESION, UUID_FORMULARIO);
    expect(aceptacion?.uuid_sesion).toBe(UUID_SESION);
    expect(aceptacion?.uuid_formulario).toBe(UUID_FORMULARIO);
    expect(aceptacion?.version_texto_terminos).toBe('Terminos v1');
  });

  it('actualiza aceptacion existente sin duplicar registros', async () => {
    await guardarAceptacionTerminos({
      uuid_sesion: UUID_SESION,
      uuid_formulario: UUID_FORMULARIO,
      version_texto_terminos: 'Terminos v1',
    });

    await guardarAceptacionTerminos({
      uuid_sesion: UUID_SESION,
      uuid_formulario: UUID_FORMULARIO,
      version_texto_terminos: 'Terminos v2',
    });

    const registros = await appDiversaDb.aceptaciones_terminos.toArray();
    expect(registros).toHaveLength(1);
    expect(registros[0]?.version_texto_terminos).toBe('Terminos v2');
  });

  it('limpia aceptaciones al cerrar sesion', async () => {
    await guardarAceptacionTerminos({
      uuid_sesion: UUID_SESION,
      uuid_formulario: UUID_FORMULARIO,
    });

    await limpiarAceptacionTerminosSesion(UUID_SESION);

    const aceptacion = await obtenerAceptacionTerminos(UUID_SESION, UUID_FORMULARIO);
    expect(aceptacion).toBeUndefined();
  });
});
