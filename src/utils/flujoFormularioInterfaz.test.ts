import { describe, it, expect } from 'vitest';
import { resolverFlujoFormulario } from '@/utils/flujoFormularioInterfaz';
import { FLUJO_FORMULARIO_FALLBACK } from '@/utils/flujoFormularioFallback';

describe('resolverFlujoFormulario', () => {
  it('usa fallback completo cuando el backend no envia flujo_formulario', () => {
    const { flujo, esFallback } = resolverFlujoFormulario({
      email_soporte: 'soporte@dane.gov.co',
    });

    expect(esFallback).toBe(true);
    expect(flujo.modal_salir.titulo).toBe(FLUJO_FORMULARIO_FALLBACK.modal_salir.titulo);
    expect(flujo.terminos.titulo).toBe(FLUJO_FORMULARIO_FALLBACK.terminos.titulo);
  });

  it('combina textos parciales del backend con fallback', () => {
    const { flujo, esFallback } = resolverFlujoFormulario({
      email_soporte: 'soporte@correo.com',
      flujo_formulario: {
        modal_salir: { titulo: 'Titulo salir API' },
        terminos: {
          titulo: 'Terminos API',
          contenido: 'Contenido API de terminos.',
          parrafo_1: '',
          parrafo_2: '',
          parrafo_3: '',
          url_ley: null,
          url_politica_datos: null,
          email_soporte: null,
        },
      },
    });

    expect(esFallback).toBe(false);
    expect(flujo.modal_salir.titulo).toBe('Titulo salir API');
    expect(flujo.modal_salir.boton_volver).toBe(
      FLUJO_FORMULARIO_FALLBACK.modal_salir.boton_volver
    );
    expect(flujo.terminos.contenido).toBe('Contenido API de terminos.');
    expect(flujo.terminos.email_soporte).toBe('soporte@correo.com');
  });

  it('prioriza email_soporte del bloque terminos sobre el de interfaz', () => {
    const { flujo } = resolverFlujoFormulario({
      email_soporte: 'general@dane.gov.co',
      flujo_formulario: {
        terminos: {
          email_soporte: 'terminos@dane.gov.co',
        },
      },
    });

    expect(flujo.terminos.email_soporte).toBe('terminos@dane.gov.co');
  });

  it('combina botones y enlace de terminos desde la API', () => {
    const { flujo } = resolverFlujoFormulario({
      flujo_formulario: {
        terminos: {
          boton_aceptar: 'Comenzar ahora',
          enlace_terminos: 'Ver terminos legales',
        },
      },
    });

    expect(flujo.terminos.boton_aceptar).toBe('Comenzar ahora');
    expect(flujo.terminos.boton_cerrar).toBe(
      FLUJO_FORMULARIO_FALLBACK.terminos.boton_cerrar
    );
    expect(flujo.terminos.enlace_terminos).toBe('Ver terminos legales');
  });
});
