import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useSubirArchivo } from './useSubirArchivo';
import { useSesionStore } from '@/store/sesionStore';
import { useOfflineStore } from '@/store/offlineStore';
import { subirArchivoMultipart } from '@/services/archivosServicio';

vi.mock('@/services/archivosServicio', () => ({
  subirArchivoMultipart: vi.fn(),
}));

describe('useSubirArchivo', () => {
  beforeEach(() => {
    useSesionStore.getState().limpiar();
    useOfflineStore.setState({ enLinea: true });
    vi.mocked(subirArchivoMultipart).mockReset();
  });

  it('sube archivo cuando hay sesion y conexion', async () => {
    useSesionStore.getState().establecerSesion({
      uuidSesion: 's1',
      tokenCliente: 't1',
      uuidFormulario: 'f1',
      estado: 'en_proceso',
    });

    const archivo = new File(['contenido'], 'doc.pdf', { type: 'application/pdf' });
    vi.mocked(subirArchivoMultipart).mockResolvedValue({
      uuid: 'arch-1',
      nombre: 'doc.pdf',
    } as never);

    const { result } = renderHook(() => useSubirArchivo());

    let respuesta: unknown;
    await act(async () => {
      respuesta = await result.current.subir({
        archivo,
        tipo_archivo: 'documento',
        origen: 'formulario',
      });
    });

    expect(respuesta).toEqual({ uuid: 'arch-1', nombre: 'doc.pdf' });
    expect(subirArchivoMultipart).toHaveBeenCalled();
  });

  it('falla sin conexion', async () => {
    useOfflineStore.setState({ enLinea: false });
    useSesionStore.getState().establecerSesion({
      uuidSesion: 's1',
      tokenCliente: 't1',
      uuidFormulario: 'f1',
      estado: 'en_proceso',
    });

    const { result } = renderHook(() => useSubirArchivo());

    await act(async () => {
      await expect(
        result.current.subir({
          archivo: new File(['x'], 'a.txt'),
          tipo_archivo: 'documento',
          origen: 'formulario',
        })
      ).rejects.toThrow(/conexion/i);
    });

    await waitFor(() => {
      expect(result.current.error).toMatch(/conexion/i);
    });
  });
});
