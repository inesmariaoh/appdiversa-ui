import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSincronizacionOffline } from './useSincronizacionOffline';
import { useSesionStore } from '@/store/sesionStore';
import { useOfflineStore } from '@/store/offlineStore';
import { useReglasStore } from '@/store/reglasStore';
import { sincronizarBatch } from '@/services/sincronizacionServicio';
import { evaluarReglasSesion } from '@/services/reglasServicio';
import { RESULTADO_REGLAS_VACIO } from '@/types/reglas';

vi.mock('@/services/sincronizacionServicio', () => ({
  sincronizarBatch: vi.fn(),
}));

vi.mock('@/services/reglasServicio', () => ({
  evaluarReglasSesion: vi.fn(),
}));

vi.mock('@/storage/colaSincronizacion', () => ({
  obtenerOperacionesPendientes: vi.fn(),
  eliminarOperacionCola: vi.fn(),
  marcarOperacionEstado: vi.fn(),
  reactivarOperacionesReintentables: vi.fn(),
  registrarErrorSincronizacion: vi.fn(),
}));

import {
  obtenerOperacionesPendientes,
  eliminarOperacionCola,
  marcarOperacionEstado,
  reactivarOperacionesReintentables,
  registrarErrorSincronizacion,
} from '@/storage/colaSincronizacion';

describe('useSincronizacionOffline', () => {
  beforeEach(() => {
    useSesionStore.getState().limpiar();
    useOfflineStore.setState({
      enLinea: true,
      operacionesPendientes: 0,
      sincronizando: false,
      ultimoResultado: null,
    });
    useReglasStore.getState().limpiar();
    vi.mocked(obtenerOperacionesPendientes).mockReset();
    vi.mocked(sincronizarBatch).mockReset();
    vi.mocked(reactivarOperacionesReintentables).mockReset();
    vi.mocked(reactivarOperacionesReintentables).mockResolvedValue(0);
    vi.mocked(evaluarReglasSesion).mockResolvedValue(RESULTADO_REGLAS_VACIO);
  });

  it('retorna true cuando no hay operaciones pendientes', async () => {
    useSesionStore.getState().establecerSesion({
      uuidSesion: 's1',
      tokenCliente: 't1',
      uuidFormulario: 'f1',
      estado: 'en_proceso',
    });
    vi.mocked(obtenerOperacionesPendientes).mockResolvedValue([]);

    const { result } = renderHook(() => useSincronizacionOffline());
    let exito = false;

    await act(async () => {
      exito = await result.current.sincronizarPendientes();
    });

    expect(exito).toBe(true);
    expect(sincronizarBatch).not.toHaveBeenCalled();
  });

  it('sincroniza lote y elimina operaciones exitosas', async () => {
    useSesionStore.getState().establecerSesion({
      uuidSesion: 's1',
      tokenCliente: 't1',
      uuidFormulario: 'f1',
      estado: 'en_proceso',
    });

    const operacion = {
      uuid_local: 'op-1',
      codigo_pregunta: 'P1',
      valor: 'Ana',
      version_cliente: 1,
      fecha_cliente: '2026-01-01T00:00:00.000Z',
      checksum: 'abc',
      estado: 'pendiente' as const,
      uuid_sesion: 's1',
    };

    vi.mocked(obtenerOperacionesPendientes)
      .mockResolvedValueOnce([operacion])
      .mockResolvedValueOnce([]);

    vi.mocked(sincronizarBatch).mockResolvedValue({
      operaciones_procesadas: 1,
      operaciones_actualizadas: 1,
      duplicadas: 0,
      conflictos: [],
      errores: [],
    });

    const { result } = renderHook(() => useSincronizacionOffline());
    let exito = false;

    await act(async () => {
      exito = await result.current.sincronizarPendientes();
    });

    expect(exito).toBe(true);
    expect(eliminarOperacionCola).toHaveBeenCalledWith('op-1');
    expect(evaluarReglasSesion).toHaveBeenCalled();
  });

  it('marca error cuando el lote falla parcialmente', async () => {
    useSesionStore.getState().establecerSesion({
      uuidSesion: 's1',
      tokenCliente: 't1',
      uuidFormulario: 'f1',
      estado: 'en_proceso',
    });

    const operacion = {
      uuid_local: 'op-2',
      codigo_pregunta: 'P2',
      valor: 'x',
      version_cliente: 1,
      fecha_cliente: '2026-01-01T00:00:00.000Z',
      checksum: 'def',
      estado: 'pendiente' as const,
      uuid_sesion: 's1',
    };

    vi.mocked(obtenerOperacionesPendientes)
      .mockResolvedValueOnce([operacion])
      .mockResolvedValueOnce([operacion]);

    vi.mocked(sincronizarBatch).mockResolvedValue({
      operaciones_procesadas: 0,
      operaciones_actualizadas: 0,
      duplicadas: 0,
      conflictos: [],
      errores: [{ uuid_local: 'op-2', mensaje: 'Conflicto' }],
    });

    const { result } = renderHook(() => useSincronizacionOffline());
    let exito = true;

    await act(async () => {
      exito = await result.current.sincronizarPendientes();
    });

    expect(exito).toBe(false);
    expect(marcarOperacionEstado).toHaveBeenCalledWith(
      'op-2',
      'error',
      expect.objectContaining({ numero_reintentos: 1 })
    );
    expect(reactivarOperacionesReintentables).toHaveBeenCalledWith('s1', expect.any(Number));
  });

  it('retorna false cuando no hay sesion', async () => {
    const { result } = renderHook(() => useSincronizacionOffline());
    let exito = true;

    await act(async () => {
      exito = await result.current.sincronizarPendientes();
    });

    expect(exito).toBe(false);
  });

  it('registra error cuando la sincronizacion lanza excepcion', async () => {
    useSesionStore.getState().establecerSesion({
      uuidSesion: 's1',
      tokenCliente: 't1',
      uuidFormulario: 'f1',
      estado: 'en_proceso',
    });

    vi.mocked(obtenerOperacionesPendientes).mockResolvedValue([
      {
        uuid_local: 'op-3',
        codigo_pregunta: 'P3',
        valor: 'y',
        version_cliente: 1,
        fecha_cliente: '2026-01-01T00:00:00.000Z',
        checksum: 'ghi',
        estado: 'pendiente',
        uuid_sesion: 's1',
      },
    ]);
    vi.mocked(sincronizarBatch).mockRejectedValue(new Error('Red caida'));

    const { result } = renderHook(() => useSincronizacionOffline());
    let exito = true;

    await act(async () => {
      exito = await result.current.sincronizarPendientes();
    });

    expect(exito).toBe(false);
    expect(registrarErrorSincronizacion).toHaveBeenCalled();
  });
});
