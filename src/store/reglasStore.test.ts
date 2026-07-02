import { describe, it, expect, beforeEach } from 'vitest';
import { useReglasStore } from './reglasStore';
import { RESULTADO_REGLAS_VACIO } from '@/types/reglas';

describe('reglasStore ramas adicionales', () => {
  beforeEach(() => {
    useReglasStore.getState().limpiar();
  });

  it('considera visible cuando esta en preguntas_visibles', () => {
    useReglasStore.getState().establecerResultado({
      ...RESULTADO_REGLAS_VACIO,
      preguntas_visibles: ['P1'],
    });

    expect(useReglasStore.getState().preguntaEstaVisible('P1', false)).toBe(true);
  });

  it('respeta visible_por_defecto cuando no hay regla explicita', () => {
    expect(useReglasStore.getState().preguntaEstaVisible('P9', false)).toBe(false);
    expect(useReglasStore.getState().preguntaEstaVisible('P9', true)).toBe(true);
  });

  it('habilita cuando no esta deshabilitada', () => {
    expect(useReglasStore.getState().preguntaEstaHabilitada('P9')).toBe(true);
  });
});
