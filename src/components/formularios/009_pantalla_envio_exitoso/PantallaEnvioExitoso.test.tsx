import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PantallaEnvioExitoso } from './PantallaEnvioExitoso';

describe('PantallaEnvioExitoso', () => {
  it('prioriza la imagen de exito parametrizada sobre la portada', () => {
    render(
      <PantallaEnvioExitoso
        titulo="Encuesta enviada"
        imagenPortada="https://res.cloudinary.com/demo/portada.png"
        imagenExito="https://res.cloudinary.com/demo/exito.png"
        imagenExitoAlt="Gracias por participar"
      />
    );

    const imagen = screen.getByRole('img', { name: 'Gracias por participar' });
    expect(imagen).toHaveAttribute('src');
    expect(decodeURIComponent(imagen.getAttribute('src') ?? '')).toContain(
      'https://res.cloudinary.com/demo/exito.png'
    );
  });

  it('usa la portada cuando no hay imagen de exito', () => {
    render(
      <PantallaEnvioExitoso
        titulo="Encuesta enviada"
        nombreFormulario="Discriminación"
        imagenPortada="https://res.cloudinary.com/demo/portada.png"
      />
    );

    expect(
      screen.getByRole('img', { name: 'Portada: Discriminación' })
    ).toBeInTheDocument();
  });

  it('no renderiza imagen cuando no hay ninguna fuente', () => {
    render(<PantallaEnvioExitoso titulo="Encuesta enviada" />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
