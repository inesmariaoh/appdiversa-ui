import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiCliente } from './api';
import {
  obtenerFormulariosDisponibles,
  obtenerFormularioDisponiblePorUuid,
  obtenerEstructuraFormulario,
  obtenerEstructuraConCache,
} from './formulariosServicio';
import {
  guardarEstructuraEnCache,
  obtenerEstructuraDesdeCache,
} from '@/storage/formulariosCache';
import type { FormularioEstructura } from '@/types/formulario';

vi.mock('./api', () => ({
  apiCliente: {
    get: vi.fn(),
  },
}));

vi.mock('@/storage/formulariosCache', () => ({
  guardarEstructuraEnCache: vi.fn(),
  obtenerEstructuraDesdeCache: vi.fn(),
}));

describe('formulariosServicio', () => {
  beforeEach(() => {
    vi.mocked(apiCliente.get).mockReset();
    vi.mocked(guardarEstructuraEnCache).mockReset();
    vi.mocked(obtenerEstructuraDesdeCache).mockReset();
  });

  it('obtiene formularios disponibles con parametros y normaliza disponibilidad', async () => {
    const lista = [
      {
        uuid: 'abc',
        codigo: 'A',
        nombre: 'Encuesta',
        descripcion: '',
        tipo_formulario: 'encuesta',
        tiempo_estimado_minutos: 5,
        fecha_inicio: null,
        fecha_fin: null,
        permite_anonimo: true,
        permite_registro_final: false,
        permite_multiples_respuestas: false,
        permite_offline: false,
        imagen_portada: null,
        estado_disponibilidad: 'disponible',
        puede_iniciar: true,
        etiqueta_estado: 'Disponible',
      },
    ];
    vi.mocked(apiCliente.get).mockResolvedValue({ data: lista });

    const resultado = await obtenerFormulariosDisponibles({
      idioma: 'es',
      incluir_accesibilidad: true,
    });

    expect(apiCliente.get).toHaveBeenCalledWith('/api/v1/formularios/disponibles/', {
      params: { idioma: 'es', incluir_accesibilidad: true },
    });
    expect(resultado[0]?.puede_iniciar).toBe(true);
    expect(resultado[0]?.estado_disponibilidad).toBe('disponible');
  });

  it('aplica fallback de proximamente cuando el backend no envia estado', async () => {
    vi.mocked(apiCliente.get).mockResolvedValue({
      data: [
        {
          uuid: 'futuro',
          codigo: 'F',
          nombre: 'Futura',
          descripcion: '',
          tipo_formulario: 'encuesta',
          tiempo_estimado_minutos: null,
          fecha_inicio: '2099-01-01T00:00:00Z',
          fecha_fin: null,
          permite_anonimo: true,
          permite_registro_final: false,
          permite_multiples_respuestas: false,
          permite_offline: false,
          imagen_portada: null,
        },
      ],
    });

    const resultado = await obtenerFormulariosDisponibles();
    expect(resultado[0]?.puede_iniciar).toBe(false);
    expect(resultado[0]?.estado_disponibilidad).toBe('proximamente');
  });

  it('obtiene formulario disponible por uuid', async () => {
    vi.mocked(apiCliente.get).mockResolvedValue({
      data: [
        {
          uuid: 'abc',
          codigo: 'A',
          nombre: 'Encuesta',
          descripcion: '',
          tipo_formulario: 'encuesta',
          tiempo_estimado_minutos: null,
          fecha_inicio: null,
          fecha_fin: null,
          permite_anonimo: true,
          permite_registro_final: false,
          permite_multiples_respuestas: false,
          permite_offline: false,
          imagen_portada: null,
          puede_iniciar: true,
          estado_disponibilidad: 'disponible',
          etiqueta_estado: 'Disponible',
        },
      ],
    });

    const resultado = await obtenerFormularioDisponiblePorUuid('abc');
    expect(resultado?.uuid).toBe('abc');
  });

  it('obtiene estructura de formulario por uuid', async () => {
    const estructura = { uuid: 'abc', nombre: 'Test', secciones: [] };
    vi.mocked(apiCliente.get).mockResolvedValue({ data: estructura });

    const resultado = await obtenerEstructuraFormulario('abc', { idioma: 'es' });

    expect(apiCliente.get).toHaveBeenCalledWith('/api/v1/formularios/abc/estructura/', {
      params: { idioma: 'es' },
    });
    expect(resultado).toEqual(estructura);
  });

  it('persiste estructura en cache en cliente', async () => {
    const estructura = { uuid: 'abc', nombre: 'Test', secciones: [], textos: [] };
    vi.mocked(apiCliente.get).mockResolvedValue({ data: estructura });

    const resultado = await obtenerEstructuraConCache('abc');

    expect(resultado).toEqual(estructura);
    expect(guardarEstructuraEnCache).toHaveBeenCalledWith('abc', estructura);
  });

  it('devuelve cache cuando la API falla en cliente', async () => {
    const cacheada: FormularioEstructura = {
      uuid: 'abc',
      codigo: 'E2E-01',
      nombre: 'Cache',
      descripcion: '',
      introduccion: '',
      objetivo: '',
      tipo_formulario: 'encuesta',
      imagen_portada: null,
      version: { id: 1, numero_version: 1 },
      textos: [],
      secciones: [],
    };
    vi.mocked(apiCliente.get).mockRejectedValue(new Error('API caida'));
    vi.mocked(obtenerEstructuraDesdeCache).mockResolvedValue(cacheada);

    const resultado = await obtenerEstructuraConCache('abc');

    expect(resultado).toEqual(cacheada);
  });

  it('relanza error cuando la API falla y no hay cache', async () => {
    vi.mocked(apiCliente.get).mockRejectedValue(new Error('API caida'));
    vi.mocked(obtenerEstructuraDesdeCache).mockResolvedValue(null);

    await expect(obtenerEstructuraConCache('abc')).rejects.toThrow('API caida');
  });
});
