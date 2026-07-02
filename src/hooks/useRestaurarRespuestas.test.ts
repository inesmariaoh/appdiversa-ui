import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useRestaurarRespuestas } from './useRestaurarRespuestas';
import { useSesionStore } from '@/store/sesionStore';
import { useRespuestasStore } from '@/store/respuestasStore';
import { useOfflineStore } from '@/store/offlineStore';
import { obtenerRespuestasSesion } from '@/services/sesionesServicio';
import { obtenerRespuestasPorSesion } from '@/storage/respuestasLocal';
import type { Pregunta } from '@/types/formulario';

vi.mock('@/services/sesionesServicio', () => ({
  obtenerRespuestasSesion: vi.fn(),
}));

vi.mock('@/storage/respuestasLocal', () => ({
  obtenerRespuestasPorSesion: vi.fn(),
}));

const pregunta: Pregunta = {
  codigo: 'P1',
  texto: 'Nombre',
  descripcion: '',
  tooltip: '',
  tipo_pregunta: 'texto_corto',
  es_obligatoria: true,
  es_pregunta_filtro: false,
  permite_otro: false,
  permite_observacion: false,
  orden: 1,
  longitud_minima: null,
  longitud_maxima: null,
  valor_minimo: null,
  valor_maximo: null,
  expresion_regular: '',
  mensaje_error: '',
  usa_catalogo: false,
  catalogo_asociado: null,
  pregunta_padre_catalogo: null,
  es_pregunta_geografica: false,
  preguntas_dependientes_geograficas: [],
  permite_busqueda_catalogo: false,
  limite_items_catalogo: null,
  fuente_opciones: 'estatica',
  opciones: [],
  filas_matriz: [],
  columnas_matriz: [],
  reglas_origen: [],
};

describe('useRestaurarRespuestas', () => {
  const reset = vi.fn();

  beforeEach(() => {
    reset.mockReset();
    useSesionStore.getState().limpiar();
    useRespuestasStore.setState({ respuestas: {} });
    useOfflineStore.getState().establecerEnLinea(true);
    vi.mocked(obtenerRespuestasSesion).mockReset();
    vi.mocked(obtenerRespuestasPorSesion).mockReset();
    vi.mocked(obtenerRespuestasPorSesion).mockResolvedValue([]);
  });

  it('restaura valores en el formulario desde el backend', async () => {
    useSesionStore.getState().establecerSesion({
      uuidSesion: 'sesion-1',
      tokenCliente: 'token-1',
      uuidFormulario: 'form-1',
      estado: 'en_proceso',
    });

    vi.mocked(obtenerRespuestasSesion).mockResolvedValue({
      uuid_sesion: 'sesion-1',
      estado: 'en_proceso',
      respuestas: [
        {
          codigo_pregunta: 'P1',
          tipo_pregunta: 'texto_corto',
          valor_numero: null,
          valor_texto: 'Juan',
          valor_json: null,
          valor_booleano: null,
          valor_fecha: null,
          valor_hora: null,
          valor_fecha_hora: null,
          origen_respuesta: 'web',
          version_respuesta: 2,
          fecha_respuesta_cliente: '2026-01-01T00:00:00.000Z',
          fecha_respuesta_servidor: '2026-01-01T00:00:00.000Z',
        },
      ],
    });

    renderHook(() =>
      useRestaurarRespuestas({
        listo: true,
        preguntas: [pregunta],
        reset,
      })
    );

    await waitFor(() => {
      expect(reset).toHaveBeenCalledWith(
        expect.objectContaining({ P1: 'Juan' })
      );
    });

    expect(useRespuestasStore.getState().obtenerRespuesta('P1')?.valor).toBe('Juan');
  });

  it('restaura desde IndexedDB cuando esta offline', async () => {
    useSesionStore.getState().establecerSesion({
      uuidSesion: 'sesion-1',
      tokenCliente: 'token-1',
      uuidFormulario: 'form-1',
      estado: 'en_proceso',
    });
    useOfflineStore.getState().establecerEnLinea(false);

    vi.mocked(obtenerRespuestasPorSesion).mockResolvedValue([
      {
        uuid_local: 'local-1',
        uuid_sesion: 'sesion-1',
        codigo_pregunta: 'P1',
        valor: 'Ana',
        version_cliente: 3,
        fecha_cliente: '2026-01-02T00:00:00.000Z',
        checksum: 'abc',
      },
    ]);

    renderHook(() =>
      useRestaurarRespuestas({ listo: true, preguntas: [pregunta], reset })
    );

    await waitFor(() => {
      expect(reset).toHaveBeenCalledWith(expect.objectContaining({ P1: 'Ana' }));
    });

    expect(obtenerRespuestasSesion).not.toHaveBeenCalled();
    const almacenada = useRespuestasStore.getState().obtenerRespuesta('P1');
    expect(almacenada?.valor).toBe('Ana');
    expect(almacenada?.origenRespuesta).toBe('offline');
  });

  it('usa IndexedDB como respaldo si falla el backend', async () => {
    useSesionStore.getState().establecerSesion({
      uuidSesion: 'sesion-1',
      tokenCliente: 'token-1',
      uuidFormulario: 'form-1',
      estado: 'en_proceso',
    });

    vi.mocked(obtenerRespuestasSesion).mockRejectedValue(new Error('sin red'));
    vi.mocked(obtenerRespuestasPorSesion).mockResolvedValue([
      {
        uuid_local: 'local-2',
        uuid_sesion: 'sesion-1',
        codigo_pregunta: 'P1',
        valor: 'Local',
        version_cliente: 1,
        fecha_cliente: '2026-01-03T00:00:00.000Z',
        checksum: 'def',
      },
    ]);

    renderHook(() =>
      useRestaurarRespuestas({ listo: true, preguntas: [pregunta], reset })
    );

    await waitFor(() => {
      expect(reset).toHaveBeenCalledWith(expect.objectContaining({ P1: 'Local' }));
    });
  });
});
