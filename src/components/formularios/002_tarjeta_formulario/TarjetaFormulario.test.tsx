import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TarjetaFormulario } from './TarjetaFormulario';
import type { FormularioDisponible } from '@/types/formulario';

const formularioDisponible: FormularioDisponible = {
  uuid: 'abc-123',
  codigo: 'ENC-001',
  nombre: 'Discriminación',
  descripcion: 'Comparte tu experiencia para impulsar la igualdad.',
  tipo_formulario: 'encuesta',
  imagen_portada: null,
  tiempo_estimado_minutos: 6,
  fecha_inicio: null,
  fecha_fin: null,
  permite_anonimo: true,
  permite_registro_final: false,
  permite_multiples_respuestas: false,
  permite_offline: true,
  estado_disponibilidad: 'disponible',
  puede_iniciar: true,
  etiqueta_estado: 'Disponible offline',
};

const formularioProximamente: FormularioDisponible = {
  ...formularioDisponible,
  uuid: 'def-456',
  nombre: 'Violencias de Género',
  descripcion: 'Comparte tu historia.',
  tiempo_estimado_minutos: null,
  permite_offline: false,
  fecha_inicio: '2026-02-01T00:00:00Z',
  fecha_fin: null,
  estado_disponibilidad: 'proximamente',
  puede_iniciar: false,
  etiqueta_estado: 'Próximamente',
};

describe('TarjetaFormulario', () => {
  it('renderiza encuesta disponible con boton Iniciar encuesta', () => {
    render(<TarjetaFormulario formulario={formularioDisponible} />);
    expect(screen.getByRole('link', { name: /iniciar encuesta/i })).toBeInTheDocument();
  });

  it('muestra indicador offline cuando el backend lo indica', () => {
    render(<TarjetaFormulario formulario={formularioDisponible} />);
    expect(screen.getByText('Disponible offline')).toBeInTheDocument();
  });

  it('muestra duracion cuando el formulario esta disponible', () => {
    render(<TarjetaFormulario formulario={formularioDisponible} />);
    expect(screen.getByText(/6 minutos/i)).toBeInTheDocument();
  });

  it('renderiza encuesta futura con boton Proximamente deshabilitado', () => {
    render(<TarjetaFormulario formulario={formularioProximamente} />);
    const boton = screen.getByRole('button', {
      name: /encuesta próximamente disponible/i,
    });
    expect(boton).toBeDisabled();
    expect(boton).toHaveAttribute('aria-disabled', 'true');
    expect(boton).toHaveTextContent('Próximamente');
  });

  it('encuesta futura no permite navegacion', () => {
    render(<TarjetaFormulario formulario={formularioProximamente} />);
    expect(screen.queryByRole('link', { name: /iniciar encuesta/i })).not.toBeInTheDocument();
  });

  it('muestra fecha de lanzamiento para encuesta futura', () => {
    render(<TarjetaFormulario formulario={formularioProximamente} />);
    expect(screen.getByText('Lanzamiento: Feb 2026')).toBeInTheDocument();
  });

  it('muestra badge Proximamente para encuesta futura', () => {
    render(<TarjetaFormulario formulario={formularioProximamente} />);
    expect(screen.getAllByText('Próximamente').length).toBeGreaterThanOrEqual(2);
  });

  it('indica accesibilidad de encuesta proxima en el articulo', () => {
    render(<TarjetaFormulario formulario={formularioProximamente} />);
    expect(
      screen.getByRole('article', { name: /encuesta próximamente disponible/i })
    ).toBeInTheDocument();
  });

  it('usa elemento article para semantica correcta en encuesta disponible', () => {
    render(<TarjetaFormulario formulario={formularioDisponible} />);
    expect(screen.getByRole('article')).toBeInTheDocument();
  });

  it('conserva flujo visual de encuesta disponible con enlace', () => {
    render(<TarjetaFormulario formulario={formularioDisponible} />);
    const enlace = screen.getByRole('link', { name: /iniciar encuesta: discriminación/i });
    expect(enlace).toHaveAttribute('href', '/encuestas/abc-123');
  });
});
