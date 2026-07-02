import { describe, it, expect } from 'vitest';
import { normalizarFormularioDisponible } from './formularioDisponibilidad';
import type { FormularioDisponibleEntrada } from './formularioDisponibilidad';

const baseFormulario: FormularioDisponibleEntrada = {
  uuid: 'uuid-test',
  codigo: 'ENC-001',
  nombre: 'Encuesta prueba',
  descripcion: 'Descripcion',
  tipo_formulario: 'encuesta',
  tiempo_estimado_minutos: 5,
  fecha_inicio: null,
  fecha_fin: null,
  permite_anonimo: true,
  permite_registro_final: false,
  permite_multiples_respuestas: false,
  permite_offline: false,
  imagen_portada: null,
};

describe('normalizarFormularioDisponible', () => {
  it('usa campos del backend cuando estan presentes', () => {
    const resultado = normalizarFormularioDisponible({
      ...baseFormulario,
      estado_disponibilidad: 'proximamente',
      puede_iniciar: false,
      etiqueta_estado: 'Próximamente',
    });

    expect(resultado.estado_disponibilidad).toBe('proximamente');
    expect(resultado.puede_iniciar).toBe(false);
    expect(resultado.etiqueta_estado).toBe('Próximamente');
  });

  it('calcula proximamente desde fecha_inicio futura sin campos del backend', () => {
    const referencia = new Date('2026-01-01T00:00:00Z');
    const resultado = normalizarFormularioDisponible(
      {
        ...baseFormulario,
        fecha_inicio: '2026-06-01T00:00:00Z',
      },
      referencia
    );

    expect(resultado.estado_disponibilidad).toBe('proximamente');
    expect(resultado.puede_iniciar).toBe(false);
    expect(resultado.etiqueta_estado).toBe('Próximamente');
  });

  it('calcula disponible cuando la encuesta esta vigente', () => {
    const referencia = new Date('2026-06-01T00:00:00Z');
    const resultado = normalizarFormularioDisponible(
      {
        ...baseFormulario,
        fecha_inicio: '2026-01-01T00:00:00Z',
        fecha_fin: '2026-12-31T00:00:00Z',
        permite_offline: true,
      },
      referencia
    );

    expect(resultado.estado_disponibilidad).toBe('disponible');
    expect(resultado.puede_iniciar).toBe(true);
    expect(resultado.etiqueta_estado).toBe('Disponible offline');
  });
});
