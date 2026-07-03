import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

import { LectorPregunta } from './LectorPregunta';
import { useInterfazStore } from '@/store/interfazStore';
import type { ConfiguracionInterfaz } from '@/types/interfaz';
import type { Pregunta } from '@/types/formulario';

const leer = vi.fn();

vi.mock('@/hooks/useLectorVoz', () => ({
  useLectorVoz: () => ({
    soportado: true,
    hablando: false,
    leer,
    detener: vi.fn(),
  }),
}));

function habilitarLecturaVoz(): void {
  useInterfazStore.setState({
    configuracion: {
      accesibilidad: { lectura_voz_habilitada: true },
    } as unknown as ConfiguracionInterfaz,
  });
}

function construirPregunta(parcial: Partial<Pregunta>): Pregunta {
  return {
    codigo: 'P1',
    texto: 'Como se identifica',
    descripcion: '',
    tooltip: '',
    tipo_pregunta: 'radio',
    orden: 1,
    opciones: [],
    filas_matriz: [],
    columnas_matriz: [],
    ...parcial,
  } as Pregunta;
}

afterEach(() => {
  leer.mockClear();
  useInterfazStore.setState({ configuracion: null });
  cleanup();
});

describe('LectorPregunta', () => {
  it('no se muestra cuando la lectura por voz esta deshabilitada', () => {
    render(<LectorPregunta pregunta={construirPregunta({})} />);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('lee el enunciado junto con las etiquetas de las opciones', () => {
    habilitarLecturaVoz();
    const pregunta = construirPregunta({
      opciones: [
        { codigo: 'A', etiqueta: 'Si', valor: 'si', orden: 1 },
        { codigo: 'B', etiqueta: 'No', valor: 'no', orden: 2 },
      ],
    });

    render(<LectorPregunta pregunta={pregunta} />);
    fireEvent.click(screen.getByRole('button'));

    expect(leer).toHaveBeenCalledTimes(1);
    const texto = leer.mock.calls[0][0] as string;
    expect(texto).toContain('1. Como se identifica');
    expect(texto).toContain('Opciones: Si, No');
  });

  it('lee el tooltip aclaratorio de una opcion cuando esta activado', () => {
    habilitarLecturaVoz();
    const pregunta = construirPregunta({
      opciones: [
        { codigo: 'A', etiqueta: 'Masculino', valor: 'm', orden: 1 },
        {
          codigo: 'B',
          etiqueta: 'Intersexual',
          valor: 'i',
          orden: 2,
          tiene_tooltip: true,
          tooltip: 'Variacion organica del sexo cromosomico.',
        },
      ],
    });

    render(<LectorPregunta pregunta={pregunta} />);
    fireEvent.click(screen.getByRole('button'));

    const texto = leer.mock.calls[0][0] as string;
    expect(texto).toContain(
      'Intersexual (Variacion organica del sexo cromosomico.)',
    );
  });

  it('lee los campos adicionales del grupo (departamento y municipio)', () => {
    habilitarLecturaVoz();
    const departamento = construirPregunta({
      codigo: 'P3',
      orden: 3,
      texto: '¿Lugar de residencia? — Departamento',
      descripcion: 'Seleccione el departamento.',
      tipo_pregunta: 'select',
    });
    const municipio = construirPregunta({
      codigo: 'P3-MUN',
      orden: 4,
      texto: 'Seleccione el municipio de residencia.',
      descripcion: 'Las opciones dependen del departamento elegido.',
      tipo_pregunta: 'select',
    });

    render(<LectorPregunta pregunta={departamento} campos={[departamento, municipio]} />);
    fireEvent.click(screen.getByRole('button'));

    const texto = leer.mock.calls[0][0] as string;
    expect(texto).toContain('3. ¿Lugar de residencia? — Departamento');
    expect(texto).toContain('Seleccione el municipio de residencia.');
    expect(texto).toContain('Las opciones dependen del departamento elegido.');
  });

  it('lee las filas y columnas de una pregunta matriz', () => {
    habilitarLecturaVoz();
    const pregunta = construirPregunta({
      tipo_pregunta: 'matriz',
      filas_matriz: [{ codigo: 'F1', etiqueta: 'Calidad', orden: 1 }],
      columnas_matriz: [
        { codigo: 'C1', etiqueta: 'Bueno', orden: 1 },
        { codigo: 'C2', etiqueta: 'Malo', orden: 2 },
      ],
    });

    render(<LectorPregunta pregunta={pregunta} />);
    fireEvent.click(screen.getByRole('button'));

    const texto = leer.mock.calls[0][0] as string;
    expect(texto).toContain('Filas: Calidad');
    expect(texto).toContain('Columnas: Bueno, Malo');
  });
});
