import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AvisoEncuestaProximamente } from './AvisoEncuestaProximamente';

describe('AvisoEncuestaProximamente', () => {
  it('informa que la encuesta estara disponible proximamente con ortografia correcta', () => {
    render(
      <AvisoEncuestaProximamente
        formulario={{ nombre: 'Encuesta de prueba', fecha_inicio: null }}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Encuesta de prueba' })).toBeInTheDocument();
    expect(
      screen.getByText('Esta encuesta estará disponible próximamente.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /volver al inicio/i })).toHaveAttribute('href', '/');
  });
});
