import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGuardarRespuesta } from './useGuardarRespuesta';
import { useSesionStore } from '@/store/sesionStore';
import { useOfflineStore } from '@/store/offlineStore';
import { useRespuestasStore } from '@/store/respuestasStore';
import { guardarRespuesta } from '@/services/respuestasServicio';
import { evaluarReglasPregunta } from '@/services/reglasServicio';
import { RESULTADO_REGLAS_VACIO } from '@/types/reglas';
import type { Pregunta } from '@/types/formulario';

vi.mock('@/services/respuestasServicio', () => ({
  guardarRespuesta: vi.fn(),
}));

vi.mock('@/services/reglasServicio', () => ({
  evaluarReglasPregunta: vi.fn(),
}));

vi.mock('@/storage/colaSincronizacion', () => ({
  agregarOperacionCola: vi.fn().mockResolvedValue(undefined),
  contarOperacionesPendientes: vi.fn().mockResolvedValue(0),
}));

vi.mock('@/storage/respuestasLocal', () => ({
  guardarRespuestaLocal: vi.fn().mockResolvedValue(undefined),
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

describe('useGuardarRespuesta', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(guardarRespuesta).mockClear();
    vi.mocked(evaluarReglasPregunta).mockResolvedValue(RESULTADO_REGLAS_VACIO);
    useSesionStore.getState().establecerSesion({
      uuidSesion: 'sesion-1',
      tokenCliente: 'token-1',
      uuidFormulario: 'form-1',
      estado: 'en_proceso',
    });
    useOfflineStore.setState({ enLinea: true, operacionesPendientes: 0 });
    useRespuestasStore.setState({ respuestas: {} });
    vi.mocked(guardarRespuesta).mockResolvedValue({
      uuid_sesion: 'sesion-1',
      codigo_pregunta: 'P1',
      version_respuesta: 1,
      origen_respuesta: 'web',
      requiere_sincronizacion: false,
      esta_eliminado: false,
      reglas: RESULTADO_REGLAS_VACIO,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('programa guardado con debounce en linea', async () => {
    const { result } = renderHook(() => useGuardarRespuesta());

    act(() => {
      result.current.programarGuardado(pregunta, 'Ana');
    });

    expect(useRespuestasStore.getState().obtenerRespuesta('P1')?.valor).toBe('Ana');

    await act(async () => {
      vi.advanceTimersByTime(600);
    });

    expect(guardarRespuesta).toHaveBeenCalled();
  });

  it('guarda inmediatamente sin debounce', async () => {
    const { result } = renderHook(() => useGuardarRespuesta());

    await act(async () => {
      await result.current.guardarInmediato(pregunta, 'Pedro');
    });

    expect(guardarRespuesta).toHaveBeenCalled();
    expect(useRespuestasStore.getState().obtenerRespuesta('P1')?.valor).toBe('Pedro');
  });

  it('persiste offline cuando no hay conexion', async () => {
    vi.mocked(guardarRespuesta).mockClear();
    useOfflineStore.setState({ enLinea: false, operacionesPendientes: 0 });

    const { result } = renderHook(() => useGuardarRespuesta());

    await act(async () => {
      await result.current.guardarInmediato(pregunta, 'Offline');
    });

    expect(guardarRespuesta).not.toHaveBeenCalled();
    expect(useRespuestasStore.getState().obtenerRespuesta('P1')?.origenRespuesta).toBe(
      'offline'
    );
  });

  it('encola offline cuando falla guardado en servidor', async () => {
    vi.mocked(guardarRespuesta).mockRejectedValue(new Error('Red caida'));

    const { result } = renderHook(() => useGuardarRespuesta());

    await act(async () => {
      await result.current.guardarInmediato(pregunta, 'Respaldo');
    });

    expect(useRespuestasStore.getState().obtenerRespuesta('P1')?.valor).toBe('Respaldo');
  });

  it('evalua reglas por pregunta cuando la respuesta no trae reglas', async () => {
    vi.mocked(guardarRespuesta).mockResolvedValue({
      uuid_sesion: 'sesion-1',
      codigo_pregunta: 'P1',
      version_respuesta: 1,
      origen_respuesta: 'web',
      requiere_sincronizacion: false,
      esta_eliminado: false,
    });

    const { evaluarReglasPregunta: evaluarReglasMock } = await import(
      '@/services/reglasServicio'
    );
    vi.mocked(evaluarReglasMock).mockResolvedValue(RESULTADO_REGLAS_VACIO);

    const { result } = renderHook(() => useGuardarRespuesta());

    await act(async () => {
      await result.current.guardarInmediato(pregunta, 'Con reglas');
    });

    expect(evaluarReglasMock).toHaveBeenCalled();
  });
});
