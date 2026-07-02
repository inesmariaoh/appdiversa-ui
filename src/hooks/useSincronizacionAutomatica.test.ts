import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useSincronizacionAutomatica } from './useSincronizacionAutomatica';
import { useSesionStore } from '@/store/sesionStore';
import { useOfflineStore } from '@/store/offlineStore';

const mockPush = vi.fn();
const mockSincronizarPendientes = vi.fn();
const mockValidarFinalizacion = vi.fn();
const mockFinalizarSesion = vi.fn();
const mockObtenerResumenSesion = vi.fn();
const mockContarOperacionesPendientes = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock('@/hooks/useSincronizacionOffline', () => ({
  useSincronizacionOffline: () => ({
    sincronizarPendientes: mockSincronizarPendientes,
  }),
}));

vi.mock('@/services/sesionesServicio', () => ({
  validarFinalizacion: (...args: unknown[]) => mockValidarFinalizacion(...args),
  finalizarSesion: (...args: unknown[]) => mockFinalizarSesion(...args),
  obtenerResumenSesion: (...args: unknown[]) => mockObtenerResumenSesion(...args),
}));

vi.mock('@/storage/colaSincronizacion', () => ({
  contarOperacionesPendientes: (...args: unknown[]) =>
    mockContarOperacionesPendientes(...args),
}));

describe('useSincronizacionAutomatica', () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockSincronizarPendientes.mockReset();
    mockValidarFinalizacion.mockReset();
    mockFinalizarSesion.mockReset();
    mockObtenerResumenSesion.mockReset();
    mockContarOperacionesPendientes.mockReset();

    useSesionStore.getState().limpiar();
    useOfflineStore.setState({
      enLinea: true,
      operacionesPendientes: 0,
      sincronizando: false,
      finalizacionPendiente: false,
      uuidFormularioFinalizacion: null,
      ultimoResultado: null,
    });

    mockContarOperacionesPendientes.mockResolvedValue(0);
    mockSincronizarPendientes.mockResolvedValue(true);
    mockValidarFinalizacion.mockResolvedValue({ es_valido: true, preguntas_pendientes: [], total_pendientes: 0 });
    mockFinalizarSesion.mockResolvedValue({ mensaje: 'Enviado' });
    mockObtenerResumenSesion.mockResolvedValue({ respuestas: [] });
  });

  it('finaliza automaticamente al reconectar con envio pendiente', async () => {
    useSesionStore.getState().establecerSesion({
      uuidSesion: 's1',
      tokenCliente: 't1',
      uuidFormulario: 'f1',
      estado: 'en_proceso',
    });
    useOfflineStore.setState({
      finalizacionPendiente: true,
      uuidFormularioFinalizacion: 'f1',
    });

    renderHook(() =>
      useSincronizacionAutomatica({
        listo: true,
        uuidFormulario: 'f1',
      }),
    );

    await waitFor(() => {
      expect(mockSincronizarPendientes).toHaveBeenCalled();
      expect(mockFinalizarSesion).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/encuestas/f1/resumen');
    });

    expect(useOfflineStore.getState().finalizacionPendiente).toBe(false);
  });

  it('sincroniza respuestas en segundo plano sin finalizacion pendiente', async () => {
    useSesionStore.getState().establecerSesion({
      uuidSesion: 's1',
      tokenCliente: 't1',
      uuidFormulario: 'f1',
      estado: 'en_proceso',
    });

    const { result } = renderHook(() =>
      useSincronizacionAutomatica({
        listo: true,
        uuidFormulario: 'f1',
      }),
    );

    await act(async () => {
      await result.current.sincronizarEnSegundoPlano();
    });

    expect(mockSincronizarPendientes).toHaveBeenCalled();
    expect(mockFinalizarSesion).not.toHaveBeenCalled();
  });
});
