import { describe, it, expect } from 'vitest';
import { FLUJO_FORMULARIO_FALLBACK } from './flujoFormularioFallback';

describe('FLUJO_FORMULARIO_FALLBACK', () => {
  it('expone textos de modales con ortografia correcta', () => {
    expect(FLUJO_FORMULARIO_FALLBACK.modal_sesion.titulo).toBe('Inicia sesión o regístrate');
    expect(FLUJO_FORMULARIO_FALLBACK.modal_sesion.boton_login).toBe('Iniciar sesión');
    expect(FLUJO_FORMULARIO_FALLBACK.modal_guardado.titulo).toBe('Encuesta guardada con éxito');
    expect(FLUJO_FORMULARIO_FALLBACK.modal_salir.link_sesion).toBe('Iniciar sesión');
  });

  it('expone textos de terminos con tildes en fallbacks locales', () => {
    expect(FLUJO_FORMULARIO_FALLBACK.terminos.titulo).toContain('Términos');
    expect(FLUJO_FORMULARIO_FALLBACK.terminos.parrafo_1).toContain('aplicación');
    expect(FLUJO_FORMULARIO_FALLBACK.terminos.parrafo_2).toContain('información');
    expect(FLUJO_FORMULARIO_FALLBACK.terminos.enlace_terminos).toBe('Términos y condiciones');
    expect(FLUJO_FORMULARIO_FALLBACK.terminos.texto_enlace_politica_datos).toContain(
      'Política de Protección'
    );
  });
});
