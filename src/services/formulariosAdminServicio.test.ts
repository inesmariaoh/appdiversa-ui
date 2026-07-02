import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiCliente } from './api';
import * as servicio from './formulariosAdminServicio';

vi.mock('./api', () => ({
  apiCliente: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const CONFIG = { withCredentials: true };

describe('formulariosAdminServicio', () => {
  beforeEach(() => {
    vi.mocked(apiCliente.get).mockReset();
    vi.mocked(apiCliente.post).mockReset();
    vi.mocked(apiCliente.patch).mockReset();
    vi.mocked(apiCliente.delete).mockReset();
  });

  it('listarFormulariosAdmin', async () => {
    vi.mocked(apiCliente.get).mockResolvedValue({ data: [] });
    await servicio.listarFormulariosAdmin();
    expect(apiCliente.get).toHaveBeenCalledWith('/api/v1/admin/formularios/', CONFIG);
  });

  it('obtenerFormularioAdmin', async () => {
    vi.mocked(apiCliente.get).mockResolvedValue({ data: { id: 1 } });
    await servicio.obtenerFormularioAdmin(1);
    expect(apiCliente.get).toHaveBeenCalledWith('/api/v1/admin/formularios/1/', CONFIG);
  });

  it('crearFormularioAdmin', async () => {
    const entrada = { codigo: 'F1', nombre: 'N', tipo_formulario: 'encuesta' as const };
    vi.mocked(apiCliente.post).mockResolvedValue({ data: entrada });
    await servicio.crearFormularioAdmin(entrada);
    expect(apiCliente.post).toHaveBeenCalledWith('/api/v1/admin/formularios/', entrada, CONFIG);
  });

  it('actualizarFormularioAdmin', async () => {
    vi.mocked(apiCliente.patch).mockResolvedValue({ data: {} });
    await servicio.actualizarFormularioAdmin(2, { nombre: 'X' });
    expect(apiCliente.patch).toHaveBeenCalledWith('/api/v1/admin/formularios/2/', { nombre: 'X' }, CONFIG);
  });

  it('eliminarFormularioAdmin', async () => {
    vi.mocked(apiCliente.delete).mockResolvedValue({});
    await servicio.eliminarFormularioAdmin(3);
    expect(apiCliente.delete).toHaveBeenCalledWith('/api/v1/admin/formularios/3/', CONFIG);
  });

  it('duplicarFormularioAdmin', async () => {
    vi.mocked(apiCliente.post).mockResolvedValue({ data: {} });
    await servicio.duplicarFormularioAdmin(4);
    expect(apiCliente.post).toHaveBeenCalledWith('/api/v1/admin/formularios/4/duplicar/', {}, CONFIG);
  });

  it('publicarFormularioAdmin', async () => {
    vi.mocked(apiCliente.post).mockResolvedValue({ data: {} });
    await servicio.publicarFormularioAdmin(5);
    expect(apiCliente.post).toHaveBeenCalledWith('/api/v1/admin/formularios/5/publicar/', {}, CONFIG);
  });

  it('cerrarFormularioAdmin', async () => {
    vi.mocked(apiCliente.post).mockResolvedValue({ data: {} });
    await servicio.cerrarFormularioAdmin(6);
    expect(apiCliente.post).toHaveBeenCalledWith('/api/v1/admin/formularios/6/cerrar/', {}, CONFIG);
  });

  it('listarVersionesAdmin', async () => {
    vi.mocked(apiCliente.get).mockResolvedValue({ data: [] });
    await servicio.listarVersionesAdmin(7);
    expect(apiCliente.get).toHaveBeenCalledWith('/api/v1/admin/formularios/7/versiones/', CONFIG);
  });

  it('obtenerEstructuraAdmin', async () => {
    vi.mocked(apiCliente.get).mockResolvedValue({ data: { secciones: [] } });
    await servicio.obtenerEstructuraAdmin(8);
    expect(apiCliente.get).toHaveBeenCalledWith('/api/v1/admin/formularios/8/estructura/', CONFIG);
  });

  it('crearSeccionAdmin', async () => {
    const seccion = { codigo: 'S', titulo: 'T', orden: 1 };
    vi.mocked(apiCliente.post).mockResolvedValue({ data: seccion });
    await servicio.crearSeccionAdmin(1, seccion);
    expect(apiCliente.post).toHaveBeenCalledWith('/api/v1/admin/formularios/1/secciones/', seccion, CONFIG);
  });

  it('actualizarSeccionAdmin', async () => {
    vi.mocked(apiCliente.patch).mockResolvedValue({ data: {} });
    await servicio.actualizarSeccionAdmin(1, 'S1', { titulo: 'N' });
    expect(apiCliente.patch).toHaveBeenCalledWith(
      '/api/v1/admin/formularios/1/secciones/S1/',
      { titulo: 'N' },
      CONFIG
    );
  });

  it('eliminarSeccionAdmin', async () => {
    vi.mocked(apiCliente.delete).mockResolvedValue({});
    await servicio.eliminarSeccionAdmin(1, 'S1');
    expect(apiCliente.delete).toHaveBeenCalledWith('/api/v1/admin/formularios/1/secciones/S1/', CONFIG);
  });

  it('reordenarSeccionesAdmin', async () => {
    const entrada = { codigos: ['A', 'B'] };
    vi.mocked(apiCliente.post).mockResolvedValue({});
    await servicio.reordenarSeccionesAdmin(1, entrada);
    expect(apiCliente.post).toHaveBeenCalledWith(
      '/api/v1/admin/formularios/1/secciones/reordenar/',
      entrada,
      CONFIG
    );
  });

  it('crearPreguntaAdmin', async () => {
    const pregunta = {
      codigo: 'P', texto: 'T', tipo_pregunta: 'texto_corto' as const, orden: 1, seccion_codigo: 'S',
    };
    vi.mocked(apiCliente.post).mockResolvedValue({ data: pregunta });
    await servicio.crearPreguntaAdmin(1, pregunta);
    expect(apiCliente.post).toHaveBeenCalledWith('/api/v1/admin/formularios/1/preguntas/', pregunta, CONFIG);
  });

  it('actualizarPreguntaAdmin', async () => {
    vi.mocked(apiCliente.patch).mockResolvedValue({ data: {} });
    await servicio.actualizarPreguntaAdmin(1, 'P1', { texto: 'N' });
    expect(apiCliente.patch).toHaveBeenCalledWith(
      '/api/v1/admin/formularios/1/preguntas/P1/',
      { texto: 'N' },
      CONFIG
    );
  });

  it('eliminarPreguntaAdmin', async () => {
    vi.mocked(apiCliente.delete).mockResolvedValue({});
    await servicio.eliminarPreguntaAdmin(1, 'P1');
    expect(apiCliente.delete).toHaveBeenCalledWith('/api/v1/admin/formularios/1/preguntas/P1/', CONFIG);
  });

  it('duplicarPreguntaAdmin', async () => {
    vi.mocked(apiCliente.post).mockResolvedValue({ data: {} });
    await servicio.duplicarPreguntaAdmin(1, 'P1');
    expect(apiCliente.post).toHaveBeenCalledWith(
      '/api/v1/admin/formularios/1/preguntas/P1/duplicar/',
      {},
      CONFIG
    );
  });

  it('reordenarPreguntasAdmin', async () => {
    const entrada = { codigos: ['P1'] };
    vi.mocked(apiCliente.post).mockResolvedValue({});
    await servicio.reordenarPreguntasAdmin(1, entrada);
    expect(apiCliente.post).toHaveBeenCalledWith(
      '/api/v1/admin/formularios/1/preguntas/reordenar/',
      entrada,
      CONFIG
    );
  });

  it('crearOpcionAdmin', async () => {
    const opcion = { codigo: 'O', etiqueta: 'L', valor: 'V', orden: 1 };
    vi.mocked(apiCliente.post).mockResolvedValue({ data: opcion });
    await servicio.crearOpcionAdmin(1, 'P1', opcion);
    expect(apiCliente.post).toHaveBeenCalledWith(
      '/api/v1/admin/formularios/1/preguntas/P1/opciones/',
      opcion,
      CONFIG
    );
  });

  it('actualizarOpcionAdmin', async () => {
    vi.mocked(apiCliente.patch).mockResolvedValue({ data: {} });
    await servicio.actualizarOpcionAdmin(1, 'O1', { etiqueta: 'N' });
    expect(apiCliente.patch).toHaveBeenCalledWith(
      '/api/v1/admin/formularios/1/opciones/O1/',
      { etiqueta: 'N' },
      CONFIG
    );
  });

  it('eliminarOpcionAdmin', async () => {
    vi.mocked(apiCliente.delete).mockResolvedValue({});
    await servicio.eliminarOpcionAdmin(1, 'O1');
    expect(apiCliente.delete).toHaveBeenCalledWith('/api/v1/admin/formularios/1/opciones/O1/', CONFIG);
  });

  it('reordenarOpcionesAdmin', async () => {
    const entrada = { codigos: ['O1'] };
    vi.mocked(apiCliente.post).mockResolvedValue({});
    await servicio.reordenarOpcionesAdmin(1, 'P1', entrada);
    expect(apiCliente.post).toHaveBeenCalledWith(
      '/api/v1/admin/formularios/1/preguntas/P1/opciones/reordenar/',
      entrada,
      CONFIG
    );
  });

  it('actualizarTextosAdmin', async () => {
    const textos = [{ tipo: 'introduccion' as const, contenido: 'Hola' }];
    vi.mocked(apiCliente.patch).mockResolvedValue({ data: textos });
    await servicio.actualizarTextosAdmin(1, textos);
    expect(apiCliente.patch).toHaveBeenCalledWith(
      '/api/v1/admin/formularios/1/textos/',
      { textos },
      CONFIG
    );
  });

  it('crearReglaAdmin', async () => {
    const regla = {
      pregunta_origen: 'P1',
      operador: 'equals' as const,
      valor_esperado: 'si',
      accion: 'mostrar' as const,
    };
    vi.mocked(apiCliente.post).mockResolvedValue({ data: regla });
    await servicio.crearReglaAdmin(1, regla);
    expect(apiCliente.post).toHaveBeenCalledWith('/api/v1/admin/formularios/1/reglas/', regla, CONFIG);
  });

  it('actualizarReglaAdmin', async () => {
    vi.mocked(apiCliente.patch).mockResolvedValue({ data: {} });
    await servicio.actualizarReglaAdmin(1, 9, { esta_activa: false });
    expect(apiCliente.patch).toHaveBeenCalledWith(
      '/api/v1/admin/formularios/1/reglas/9/',
      { esta_activa: false },
      CONFIG
    );
  });

  it('eliminarReglaAdmin', async () => {
    vi.mocked(apiCliente.delete).mockResolvedValue({});
    await servicio.eliminarReglaAdmin(1, 9);
    expect(apiCliente.delete).toHaveBeenCalledWith('/api/v1/admin/formularios/1/reglas/9/', CONFIG);
  });

  it('listarReglasAdmin', async () => {
    vi.mocked(apiCliente.get).mockResolvedValue({ data: [] });
    await servicio.listarReglasAdmin(1);
    expect(apiCliente.get).toHaveBeenCalledWith('/api/v1/admin/formularios/1/reglas/', CONFIG);
  });
});
