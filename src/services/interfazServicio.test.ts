import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiCliente } from './api';
import {
  obtenerConfiguracionInterfaz,
  CONFIGURACION_FALLBACK,
} from './interfazServicio';

vi.mock('./api', () => ({
  apiCliente: {
    get: vi.fn(),
  },
}));

describe('interfazServicio', () => {
  beforeEach(() => {
    vi.mocked(apiCliente.get).mockReset();
  });

  it('normaliza flujo_formulario desde la API', async () => {
    vi.mocked(apiCliente.get).mockResolvedValue({
      data: {
        nombre_aplicativo: 'App Test',
        email_soporte: 'soporte@dane.gov.co',
        flujo_formulario: {
          modal_salir: {
            titulo: 'Salir API',
            parrafo_1: 'Parrafo 1',
            parrafo_2: 'Parrafo 2',
            boton_volver: 'Volver',
            boton_salir: 'Salir',
            link_sesion: 'Sesion',
          },
          modal_sesion: {
            titulo: 'Sesion API',
            parrafo: 'Texto sesion',
            boton_login: 'Login',
            boton_registro: 'Registro',
            link_cancelar: 'Cancelar',
          },
          modal_guardado: {
            titulo: 'Guardado API',
            parrafo: 'Texto guardado',
            boton_seguir: 'Seguir',
            boton_otras: 'Otras',
          },
          terminos: {
            titulo: 'Terminos API',
            contenido: null,
            parrafo_1: 'P1',
            parrafo_2: 'P2',
            parrafo_3: 'P3',
            url_ley: 'https://ley.test',
            url_politica_datos: 'https://politica.test',
            email_soporte: null,
            boton_aceptar: 'Aceptar API',
            boton_cerrar: 'Cerrar API',
            enlace_terminos: 'Enlace API',
          },
          envio_exitoso: {
            imagen_url: 'https://res.cloudinary.com/demo/exito.png',
            imagen_alt: 'Encuesta enviada',
          },
        },
      },
    });

    const config = await obtenerConfiguracionInterfaz('es');

    expect(config.flujo_formulario?.modal_salir.titulo).toBe('Salir API');
    expect(config.flujo_formulario?.terminos.boton_aceptar).toBe('Aceptar API');
    expect(config.flujo_formulario?.terminos.boton_cerrar).toBe('Cerrar API');
    expect(config.flujo_formulario?.terminos.enlace_terminos).toBe('Enlace API');
    expect(config.flujo_formulario?.terminos.email_soporte).toBe('soporte@dane.gov.co');
    expect(config.flujo_formulario?.envio_exitoso.imagen_url).toBe(
      'https://res.cloudinary.com/demo/exito.png'
    );
    expect(config.flujo_formulario?.envio_exitoso.imagen_alt).toBe('Encuesta enviada');
    expect(config.flujo_formulario_es_fallback).toBe(false);
  });

  it('marca fallback cuando la API no envia flujo_formulario', async () => {
    vi.mocked(apiCliente.get).mockResolvedValue({
      data: {
        nombre_aplicativo: 'App Test',
      },
    });

    const config = await obtenerConfiguracionInterfaz();

    expect(config.flujo_formulario_es_fallback).toBe(true);
    expect(config.flujo_formulario?.modal_salir.titulo).toBeTruthy();
  });

  it('devuelve fallback cuando la API falla', async () => {
    vi.mocked(apiCliente.get).mockRejectedValue(new Error('red'));

    const config = await obtenerConfiguracionInterfaz();

    expect(config.nombre_aplicativo).toBe(CONFIGURACION_FALLBACK.nombre_aplicativo);
  });
});
