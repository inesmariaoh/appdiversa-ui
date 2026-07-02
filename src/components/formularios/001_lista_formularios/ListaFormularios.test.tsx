import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ListaFormularios } from './ListaFormularios';
import { normalizarFormularioDisponible } from '@/utils/formularioDisponibilidad';
import type { FormularioDisponibleEntrada } from '@/utils/formularioDisponibilidad';

const formularioBaseA: FormularioDisponibleEntrada = {
  uuid: 'uuid-1',
  codigo: 'A',
  nombre: 'Encuesta A',
  descripcion: 'Descripcion A',
  tipo_formulario: 'encuesta',
  imagen_portada: null,
  tiempo_estimado_minutos: 5,
  fecha_inicio: null,
  fecha_fin: null,
  permite_anonimo: true,
  permite_registro_final: false,
  permite_multiples_respuestas: false,
  permite_offline: false,
};

const formularios = [
  normalizarFormularioDisponible(formularioBaseA),
  normalizarFormularioDisponible({
    ...formularioBaseA,
    uuid: 'uuid-2',
    codigo: 'B',
    nombre: 'Encuesta B',
    descripcion: 'Descripcion B',
    tiempo_estimado_minutos: null,
    fecha_inicio: '2099-01-01T00:00:00Z',
  }),
];

describe('ListaFormularios', () => {
  it('renderiza el titulo de seccion', () => {
    render(<ListaFormularios formularios={formularios} tituloSeccion="Encuestas" />);
    expect(screen.getByRole('heading', { name: 'Encuestas', level: 1 })).toBeInTheDocument();
  });

  it('muestra descripcion de seccion si se proporciona', () => {
    render(
      <ListaFormularios
        formularios={formularios}
        descripcionSeccion="Comparte tu experiencia"
      />
    );
    expect(screen.getByText('Comparte tu experiencia')).toBeInTheDocument();
  });

  it('renderiza todas las tarjetas de la lista', () => {
    render(<ListaFormularios formularios={formularios} tituloSeccion="Encuestas" />);
    expect(screen.getByText('Encuesta A')).toBeInTheDocument();
    expect(screen.getByText('Encuesta B')).toBeInTheDocument();
  });

  it('muestra mensaje cuando la lista esta vacia', () => {
    render(<ListaFormularios formularios={[]} />);
    expect(
      screen.getByText(/no hay encuestas disponibles/i)
    ).toBeInTheDocument();
  });

  it('usa seccion semantica con aria-labelledby', () => {
    render(<ListaFormularios formularios={formularios} tituloSeccion="Encuestas" />);
    const seccion = screen.getByRole('region', { name: /encuestas/i });
    expect(seccion).toBeInTheDocument();
  });
});
