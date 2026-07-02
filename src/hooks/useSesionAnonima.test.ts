import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useSesionAnonima } from './useSesionAnonima';
import { useSesionStore } from '@/store/sesionStore';
import { crearSesionAnonima } from '@/services/sesionesServicio';

vi.mock('@/services/sesionesServicio', () => ({
  crearSesionAnonima: vi.fn(),
}));

vi.mock('@/storage/sesionesLocal', () => ({
  guardarSesionLocal: vi.fn().mockResolvedValue(undefined),
}));

describe('useSesionAnonima', () => {
  beforeEach(() => {
    useSesionStore.getState().limpiar();
    vi.mocked(crearSesionAnonima).mockReset();
    vi.mocked(crearSesionAnonima).mockResolvedValue({
      uuid_sesion: 'sesion-nueva',
      token_cliente: 'token-nuevo',
      estado: 'en_proceso',
    });
  });

  it('crea sesion remota cuando no hay sesion previa', async () => {
    const { result } = renderHook(() =>
      useSesionAnonima({ uuidFormulario: 'form-1', idioma: 'es' })
    );

    await waitFor(() => {
      expect(result.current.listo).toBe(true);
    });

    expect(crearSesionAnonima).toHaveBeenCalled();
    expect(useSesionStore.getState().uuidSesion).toBe('sesion-nueva');
  });

  it('reutiliza sesion existente del store', async () => {
    useSesionStore.getState().establecerSesion({
      uuidSesion: 'sesion-existente',
      tokenCliente: 'token-existente',
      uuidFormulario: 'form-1',
      estado: 'en_proceso',
    });

    const { result } = renderHook(() =>
      useSesionAnonima({ uuidFormulario: 'form-1', idioma: 'es' })
    );

    await waitFor(() => {
      expect(result.current.listo).toBe(true);
    });

    expect(crearSesionAnonima).not.toHaveBeenCalled();
  });

  it('restaura sesion desde IndexedDB cuando esta offline', async () => {
    Object.defineProperty(window.navigator, 'onLine', { value: false, configurable: true });

    const { appDiversaDb } = await import('@/storage/appDiversaDb');
    await appDiversaDb.sesiones.add({
      uuid_sesion: 'sesion-local',
      token_cliente: 'token-local',
      uuid_formulario: 'form-offline',
      estado: 'en_proceso',
      fecha_actualizacion: '2026-01-01T00:00:00.000Z',
    });

    const { result } = renderHook(() =>
      useSesionAnonima({ uuidFormulario: 'form-offline', idioma: 'es' })
    );

    await waitFor(() => {
      expect(result.current.listo).toBe(true);
    });

    expect(useSesionStore.getState().uuidSesion).toBe('sesion-local');
    expect(crearSesionAnonima).not.toHaveBeenCalled();

    Object.defineProperty(window.navigator, 'onLine', { value: true, configurable: true });
  });
});
