import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PiePagina } from './PiePagina';

describe('PiePagina', () => {
  it('renderiza el texto de pie de pagina desde props', () => {
    render(<PiePagina textoPie="© 2025 DANE - SEN - App Recolección Datos" />);
    expect(screen.getByText('© 2025 DANE - SEN - App Recolección Datos')).toBeInTheDocument();
  });

  it('contiene un elemento footer con role contentinfo', () => {
    render(<PiePagina textoPie="Pie de pagina" />);
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('acepta cualquier texto dinamico sin quemarlo', () => {
    const textoPersonalizado = 'Texto personalizado desde API 2026';
    render(<PiePagina textoPie={textoPersonalizado} />);
    expect(screen.getByText(textoPersonalizado)).toBeInTheDocument();
  });
});
