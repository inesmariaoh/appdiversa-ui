import { describe, expect, it } from 'vitest';
import {
  filasMatrizDesdeResumen,
  opcionesMultiplesDesdeResumen,
  resolverFechaDiligenciamientoIso,
  textoValorResumen,
} from './resumenRespuestas';
import type { ResumenRespuesta } from '@/types/sesion';

function crearItem(parcial: Partial<ResumenRespuesta>): ResumenRespuesta {
  return {
    seccion_codigo: 'S1',
    seccion_titulo: 'Seccion',
    pregunta_codigo: 'P1',
    pregunta_texto: 'Pregunta',
    tipo_pregunta: 'texto_corto',
    valor: null,
    valor_legible: '',
    observacion: '',
    ...parcial,
  };
}

describe('resumenRespuestas', () => {
  it('prioriza valor legible sobre valor crudo', () => {
    const item = crearItem({ valor: 35, valor_legible: 'Treinta y cinco' });
    expect(textoValorResumen(item)).toBe('Treinta y cinco');
  });

  it('divide opciones multiples por lineas', () => {
    const item = crearItem({
      tipo_pregunta: 'checkbox',
      valor_legible: 'Edad\nEstado civil\nOcupación',
    });
    expect(opcionesMultiplesDesdeResumen(item)).toEqual([
      'Edad',
      'Estado civil',
      'Ocupación',
    ]);
  });

  it('prioriza fecha de finalizacion sobre otras fechas', () => {
    expect(
      resolverFechaDiligenciamientoIso({
        fecha_finalizacion: '2025-02-03',
        fecha_ultima_actividad: '2025-02-01',
        fecha_inicio: '2025-01-01',
      }),
    ).toBe('2025-02-03');
  });

  it('usa fecha de ultima actividad como respaldo', () => {
    expect(
      resolverFechaDiligenciamientoIso({
        fecha_finalizacion: '',
        fecha_ultima_actividad: '2025-02-01',
      }),
    ).toBe('2025-02-01');
  });

  it('parsea filas de matriz desde valor legible', () => {
    const item = crearItem({
      tipo_pregunta: 'matriz',
      valor_legible: 'Entorno laboral: Sí\nEntorno educativo: No',
    });
    expect(filasMatrizDesdeResumen(item)).toEqual([
      { etiqueta: 'Entorno laboral', respuesta: 'Sí' },
      { etiqueta: 'Entorno educativo', respuesta: 'No' },
    ]);
  });
});
