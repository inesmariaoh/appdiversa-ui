import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BarraProgreso } from './BarraProgreso';

describe('BarraProgreso', () => {
  it('muestra el numero de pregunta actual y el total', () => {
    render(<BarraProgreso preguntaActual={1} totalPreguntas={3} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('calcula el porcentaje correcto en aria-valuenow', () => {
    render(<BarraProgreso preguntaActual={2} totalPreguntas={4} />);
    const barra = screen.getByRole('progressbar');
    expect(barra).toHaveAttribute('aria-valuenow', '50');
  });

  it('tiene aria-valuemin=0 y aria-valuemax=100', () => {
    render(<BarraProgreso preguntaActual={1} totalPreguntas={5} />);
    const barra = screen.getByRole('progressbar');
    expect(barra).toHaveAttribute('aria-valuemin', '0');
    expect(barra).toHaveAttribute('aria-valuemax', '100');
  });

  it('maneja totalPreguntas=0 sin dividir entre cero', () => {
    render(<BarraProgreso preguntaActual={0} totalPreguntas={0} />);
    const barra = screen.getByRole('progressbar');
    expect(barra).toHaveAttribute('aria-valuenow', '0');
  });
});
