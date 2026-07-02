import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useFlujoModalesFormulario } from './useFlujoModalesFormulario';
import { useSesionStore } from '@/store/sesionStore';
import { useRespuestasStore } from '@/store/respuestasStore';
import { useOfflineStore } from '@/store/offlineStore';
import { useAuthStore } from '@/store/authStore';

const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock('@/components/layout/007_app_theme', () => ({
  useAppTheme: () => ({
    configuracion: {
      flujo_formulario: undefined,
      url_contacto: '/contacto',
    },
  }),
}));

vi.mock('@/storage/aceptacionesTerminos', () => ({
  obtenerAceptacionTerminos: vi.fn(),
  guardarAceptacionTerminos: vi.fn(),
}));

vi.mock('@/storage/limpiarProgresoSesion', () => ({
  limpiarProgresoLocalSesion: vi.fn(),
}));

import {
  obtenerAceptacionTerminos,
  guardarAceptacionTerminos,
} from '@/storage/aceptacionesTerminos';
import { limpiarProgresoLocalSesion } from '@/storage/limpiarProgresoSesion';

const UUID_FORMULARIO = '11111111-1111-1111-1111-111111111111';
const UUID_SESION = '22222222-2222-2222-2222-222222222222';

describe('useFlujoModalesFormulario', () => {
  beforeEach(() => {
    pushMock.mockReset();
    vi.mocked(obtenerAceptacionTerminos).mockReset();
    vi.mocked(guardarAceptacionTerminos).mockReset();
    vi.mocked(limpiarProgresoLocalSesion).mockReset();

    useSesionStore.setState({ uuidSesion: UUID_SESION, tokenCliente: 'token' });
    useRespuestasStore.setState({ respuestas: {} });
    useOfflineStore.setState({ operacionesPendientes: 0 });
    useAuthStore.setState({ autenticado: false });
  });

  it('omite verificacion de terminos cuando el flujo esta deshabilitado', () => {
    const { result } = renderHook(() =>
      useFlujoModalesFormulario({
        uuidFormulario: UUID_FORMULARIO,
        rutaActual: '/encuestas/responder',
        deshabilitado: true,
      })
    );

    expect(result.current.terminosAceptados).toBe(true);
    expect(result.current.verificandoTerminos).toBe(false);
    expect(obtenerAceptacionTerminos).not.toHaveBeenCalled();
  });

  it('abre modal de terminos cuando no hay aceptacion previa', async () => {
    vi.mocked(obtenerAceptacionTerminos).mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useFlujoModalesFormulario({
        uuidFormulario: UUID_FORMULARIO,
        rutaActual: '/encuestas/responder',
      })
    );

    await waitFor(() => {
      expect(result.current.verificandoTerminos).toBe(false);
    });

    expect(result.current.modalActivo).toBe('terminos');
    expect(result.current.terminosAceptados).toBe(false);
  });

  it('navega directamente al salir si no hay progreso', () => {
    const { result } = renderHook(() =>
      useFlujoModalesFormulario({
        uuidFormulario: UUID_FORMULARIO,
        rutaActual: '/encuestas/responder',
        deshabilitado: true,
      })
    );

    act(() => {
      result.current.solicitarSalida('/encuestas');
    });

    expect(pushMock).toHaveBeenCalledWith('/encuestas');
    expect(result.current.modalActivo).toBeNull();
  });

  it('muestra modal de salir cuando hay respuestas sin guardar', () => {
    useRespuestasStore.setState({
      respuestas: {
        P1: {
          valor: 'valor',
          versionCliente: 1,
          origenRespuesta: 'web',
          fechaCliente: new Date().toISOString(),
        },
      },
    });

    const { result } = renderHook(() =>
      useFlujoModalesFormulario({
        uuidFormulario: UUID_FORMULARIO,
        rutaActual: '/encuestas/responder',
        deshabilitado: true,
      })
    );

    act(() => {
      result.current.solicitarSalida('/');
    });

    expect(pushMock).not.toHaveBeenCalled();
    expect(result.current.modalActivo).toBe('salir');
  });

  it('construye urls de auth con contexto de formulario y sesion', () => {
    const { result } = renderHook(() =>
      useFlujoModalesFormulario({
        uuidFormulario: UUID_FORMULARIO,
        rutaActual: '/encuestas/responder',
        deshabilitado: true,
      })
    );

    expect(result.current.urlLogin).toContain('uuid_formulario=' + UUID_FORMULARIO);
    expect(result.current.urlLogin).toContain('uuid_sesion=' + UUID_SESION);
    expect(result.current.urlLogin).toContain('token_cliente=token');
    expect(result.current.urlLogin).toContain('intencion=guardar_progreso');
    expect(result.current.urlLogin).toContain('destino=%2Fencuestas%2Fresponder');
  });

  it('envia al historial cuando el flujo parte del resumen', () => {
    const { result } = renderHook(() =>
      useFlujoModalesFormulario({
        uuidFormulario: UUID_FORMULARIO,
        rutaActual: `/encuestas/${UUID_FORMULARIO}/resumen`,
        deshabilitado: true,
      })
    );

    expect(result.current.urlLogin).toContain('destino=%2Fmis-respuestas');
  });
});
