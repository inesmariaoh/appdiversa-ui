import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Selector } from './Selector';

const opciones = [
  { valor: '2024', etiqueta: '2024' },
  { valor: '2023', etiqueta: '2023' },
];

describe('Selector', () => {
  it('renderiza la etiqueta vinculada al select', () => {
    render(<Selector id="anio" etiqueta="Año" opciones={opciones} />);
    expect(screen.getByLabelText('Año')).toBeInTheDocument();
  });

  it('muestra el placeholder como primera opcion deshabilitada', () => {
    render(<Selector id="anio" etiqueta="Año" opciones={opciones} placeholder="Seleccione" />);
    expect(screen.getByRole('option', { name: 'Seleccione' })).toBeDisabled();
  });

  it('renderiza todas las opciones', () => {
    render(<Selector id="anio" etiqueta="Año" opciones={opciones} />);
    expect(screen.getByRole('option', { name: '2024' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '2023' })).toBeInTheDocument();
  });

  it('muestra mensaje de error y lo vincula con aria-describedby', () => {
    render(<Selector id="anio" etiqueta="Año" opciones={opciones} error="Campo requerido" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Campo requerido');
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('aplica aria-required cuando es obligatorio', () => {
    render(<Selector id="anio" etiqueta="Año" opciones={opciones} required />);
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-required', 'true');
  });
});
