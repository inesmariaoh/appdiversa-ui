import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useOpcionesPregunta } from './useOpcionesPregunta';
import { useCatalogosStore } from '@/store/catalogosStore';
import { useOfflineStore } from '@/store/offlineStore';
import { obtenerItemsCatalogo } from '@/services/catalogosServicio';
import {
  guardarCatalogoEnCache,
  obtenerCatalogoDesdeCache,
} from '@/storage/catalogosCache';
import type { Pregunta } from '@/types/formulario';

vi.mock('@/services/catalogosServicio', () => ({
  obtenerItemsCatalogo: vi.fn(),
}));

vi.mock('@/storage/catalogosCache', () => ({
  guardarCatalogoEnCache: vi.fn().mockResolvedValue(undefined),
  obtenerCatalogoDesdeCache: vi.fn(),
}));

function crearPregunta(parcial: Partial<Pregunta>): Pregunta {
  return {
    codigo: 'P1',
    texto: 'Departamento',
    descripcion: '',
    tooltip: '',
    tipo_pregunta: 'select',
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
    opciones: [{ codigo: 'A', etiqueta: 'Opcion A', valor: 'A', orden: 1 }],
    filas_matriz: [],
    columnas_matriz: [],
    reglas_origen: [],
    ...parcial,
  };
}

describe('useOpcionesPregunta', () => {
  const respuestasVacias = {};

  beforeEach(() => {
    useCatalogosStore.getState().limpiar();
    useOfflineStore.setState({ enLinea: true });
    vi.mocked(obtenerItemsCatalogo).mockReset();
    vi.mocked(obtenerCatalogoDesdeCache).mockReset();
  });

  it('devuelve opciones estaticas sin catalogo', () => {
    const pregunta = crearPregunta({ usa_catalogo: false });
    const { result } = renderHook(() => useOpcionesPregunta(pregunta, respuestasVacias));

    expect(result.current.opciones).toEqual(pregunta.opciones);
    expect(result.current.cargando).toBe(false);
  });

  it('carga opciones desde memoria si ya estan cacheadas', async () => {
    const pregunta = crearPregunta({
      usa_catalogo: true,
      catalogo_asociado: { codigo: 'departamentos', endpoint_items: '/items/' },
    });

    useCatalogosStore.getState().establecerItems('departamentos', [
      { codigo: '05', nombre: 'Antioquia', activo: true, orden: 1 },
    ] as never);

    const { result } = renderHook(() => useOpcionesPregunta(pregunta, respuestasVacias));

    await waitFor(() => {
      expect(result.current.opciones.length).toBeGreaterThan(0);
    });

    expect(obtenerItemsCatalogo).not.toHaveBeenCalled();
  });

  it('consulta API cuando no hay cache en memoria', async () => {
    const pregunta = crearPregunta({
      usa_catalogo: true,
      opciones: [],
      catalogo_asociado: { codigo: 'municipios', endpoint_items: '/items/' },
    });

    vi.mocked(obtenerItemsCatalogo).mockResolvedValue([
      { codigo: '05001', nombre: 'Medellin', activo: true, orden: 1 },
    ] as never);

    const { result } = renderHook(() => useOpcionesPregunta(pregunta, respuestasVacias));

    await waitFor(() => {
      expect(result.current.opciones.some((o) => o.codigo === '05001')).toBe(true);
    });

    expect(obtenerItemsCatalogo).toHaveBeenCalled();
    expect(guardarCatalogoEnCache).toHaveBeenCalled();
  });

  it('filtra cache en memoria por codigo_padre del catalogo', async () => {
    const pregunta = crearPregunta({
      usa_catalogo: true,
      opciones: [],
      catalogo_asociado: { codigo: 'municipios', endpoint_items: '/items/' },
      pregunta_padre_catalogo: { codigo: 'P_PADRE', endpoint_items: '/items/' },
    });

    useCatalogosStore.getState().establecerItems('municipios', [
      {
        codigo: '05001',
        nombre: 'Medellin',
        valor: '05001',
        codigo_padre: '05',
        orden: 1,
      },
      {
        codigo: '11001',
        nombre: 'Bogota',
        valor: '11001',
        codigo_padre: '11',
        orden: 2,
      },
    ] as never);

    const { result } = renderHook(() =>
      useOpcionesPregunta(pregunta, { P_PADRE: '05' }),
    );

    await waitFor(() => {
      expect(result.current.opciones[0]?.codigo).toBe('05001');
    });
    expect(obtenerItemsCatalogo).not.toHaveBeenCalled();
  });

  it('vacía opciones si falta respuesta del padre de catalogo', async () => {
    const pregunta = crearPregunta({
      usa_catalogo: true,
      catalogo_asociado: { codigo: 'municipios', endpoint_items: '/items/' },
      pregunta_padre_catalogo: { codigo: 'P_PADRE', endpoint_items: '/items/' },
    });

    const { result } = renderHook(() => useOpcionesPregunta(pregunta, respuestasVacias));

    await waitFor(() => {
      expect(result.current.cargando).toBe(false);
    });

    expect(result.current.opciones).toEqual([]);
    expect(obtenerItemsCatalogo).not.toHaveBeenCalled();
  });

  it('usa cache Dexie offline y fallback ante error', async () => {
    useOfflineStore.setState({ enLinea: false });

    const pregunta = crearPregunta({
      usa_catalogo: true,
      catalogo_asociado: { codigo: 'departamentos', endpoint_items: '/items/' },
    });

    vi.mocked(obtenerCatalogoDesdeCache).mockResolvedValue([
      { codigo: '05', nombre: 'Antioquia', activo: true, orden: 1 },
    ] as never);

    const { result } = renderHook(() => useOpcionesPregunta(pregunta, respuestasVacias));

    await waitFor(() => {
      expect(result.current.opciones.length).toBeGreaterThan(0);
    });
  });

  it('consulta API con filtro de codigo padre cuando hay respuesta del padre', async () => {
    const pregunta = crearPregunta({
      usa_catalogo: true,
      opciones: [],
      catalogo_asociado: { codigo: 'municipios', endpoint_items: '/items/' },
      pregunta_padre_catalogo: { codigo: 'P_PADRE', endpoint_items: '/items/' },
    });

    vi.mocked(obtenerItemsCatalogo).mockResolvedValue([
      { codigo: '05001', nombre: 'Medellin', activo: true, orden: 1, codigo_padre: '05' },
    ] as never);

    const { result } = renderHook(() =>
      useOpcionesPregunta(pregunta, { P_PADRE: '05' }),
    );

    await waitFor(() => {
      expect(result.current.opciones[0]?.codigo).toBe('05001');
    });

    expect(obtenerItemsCatalogo).toHaveBeenCalledWith(
      'municipios',
      expect.objectContaining({ codigo_padre: '05' }),
    );
  });

  it('consulta API con termino de busqueda sin usar cache en memoria', async () => {
    const pregunta = crearPregunta({
      usa_catalogo: true,
      opciones: [],
      catalogo_asociado: { codigo: 'departamentos', endpoint_items: '/items/' },
    });

    useCatalogosStore.getState().establecerItems('departamentos', [
      { codigo: '05', nombre: 'Antioquia', activo: true, orden: 1 },
    ] as never);

    vi.mocked(obtenerItemsCatalogo).mockResolvedValue([
      { codigo: '11', nombre: 'Bogota D.C.', activo: true, orden: 1 },
    ] as never);

    const { result } = renderHook(() =>
      useOpcionesPregunta(pregunta, respuestasVacias, 'bog'),
    );

    await waitFor(() => {
      expect(result.current.opciones.some((o) => o.codigo === '11')).toBe(true);
    });

    expect(obtenerItemsCatalogo).toHaveBeenCalledWith(
      'departamentos',
      expect.objectContaining({ busqueda: 'bog' }),
    );
  });

  it('restaura opciones estaticas si falla API y no hay cache', async () => {
    const pregunta = crearPregunta({
      usa_catalogo: true,
      catalogo_asociado: { codigo: 'departamentos', endpoint_items: '/items/' },
      opciones: [{ codigo: 'FB', etiqueta: 'Fallback', valor: 'FB', orden: 1 }],
    });

    vi.mocked(obtenerItemsCatalogo).mockRejectedValue(new Error('API caida'));
    vi.mocked(obtenerCatalogoDesdeCache).mockResolvedValue(null);

    const { result } = renderHook(() => useOpcionesPregunta(pregunta, respuestasVacias));

    await waitFor(() => {
      expect(result.current.error).toMatch(/catalogo/i);
    });

    expect(result.current.opciones).toEqual(pregunta.opciones);
  });
});
