import { describe, it, expect, beforeEach } from 'vitest';
import { appDiversaDb } from './appDiversaDb';
import type { RegistroColaSincronizacion } from './appDiversaDb';
import {
  marcarOperacionEstado,
  reactivarOperacionesReintentables,
  obtenerOperacionesPendientes,
} from './colaSincronizacion';
import { MAX_REINTENTOS_SINCRONIZACION } from '@/utils/backoffSincronizacion';

const UUID_SESION = 'sesion-cola';

function operacionBase(
  uuidLocal: string,
  extra: Partial<RegistroColaSincronizacion> = {}
): RegistroColaSincronizacion {
  return {
    uuid_local: uuidLocal,
    uuid_sesion: UUID_SESION,
    codigo_pregunta: 'P1',
    valor: 'x',
    version_cliente: 1,
    fecha_cliente: '2026-01-01T00:00:00.000Z',
    checksum: 'abc',
    estado: 'error',
    ...extra,
  };
}

describe('colaSincronizacion reintentos', () => {
  beforeEach(async () => {
    await appDiversaDb.cola_sincronizacion.clear();
  });

  it('almacena metadatos de reintento al marcar error', async () => {
    await appDiversaDb.cola_sincronizacion.put(
      operacionBase('op-1', { estado: 'pendiente' })
    );

    await marcarOperacionEstado('op-1', 'error', {
      numero_reintentos: 2,
      proximo_reintento: '2026-01-01T00:00:30.000Z',
    });

    const guardada = await appDiversaDb.cola_sincronizacion.get('op-1');
    expect(guardada?.estado).toBe('error');
    expect(guardada?.numero_reintentos).toBe(2);
    expect(guardada?.proximo_reintento).toBe('2026-01-01T00:00:30.000Z');
  });

  it('reactiva operaciones cuyo backoff ya vencio', async () => {
    await appDiversaDb.cola_sincronizacion.put(
      operacionBase('op-lista', {
        numero_reintentos: 1,
        proximo_reintento: '2026-01-01T00:00:05.000Z',
      })
    );

    const ahora = Date.parse('2026-01-01T00:01:00.000Z');
    const reactivadas = await reactivarOperacionesReintentables(UUID_SESION, ahora);

    expect(reactivadas).toBe(1);
    const pendientes = await obtenerOperacionesPendientes(UUID_SESION);
    expect(pendientes.map((operacion) => operacion.uuid_local)).toContain('op-lista');
  });

  it('no reactiva operaciones con backoff vigente', async () => {
    await appDiversaDb.cola_sincronizacion.put(
      operacionBase('op-espera', {
        numero_reintentos: 1,
        proximo_reintento: '2026-01-01T00:05:00.000Z',
      })
    );

    const ahora = Date.parse('2026-01-01T00:01:00.000Z');
    const reactivadas = await reactivarOperacionesReintentables(UUID_SESION, ahora);

    expect(reactivadas).toBe(0);
    const pendientes = await obtenerOperacionesPendientes(UUID_SESION);
    expect(pendientes).toHaveLength(0);
  });

  it('no reactiva operaciones que superaron el maximo de reintentos', async () => {
    await appDiversaDb.cola_sincronizacion.put(
      operacionBase('op-agotada', {
        numero_reintentos: MAX_REINTENTOS_SINCRONIZACION,
        proximo_reintento: '2026-01-01T00:00:01.000Z',
      })
    );

    const ahora = Date.parse('2026-01-01T00:10:00.000Z');
    const reactivadas = await reactivarOperacionesReintentables(UUID_SESION, ahora);

    expect(reactivadas).toBe(0);
  });
});
