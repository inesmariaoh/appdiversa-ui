import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ContenedorPagina } from './ContenedorPagina';

describe('ContenedorPagina', () => {
  it('renderiza el contenido hijo dentro del main', () => {
    render(<ContenedorPagina><p>Contenido de prueba</p></ContenedorPagina>);
    expect(screen.getByText('Contenido de prueba')).toBeInTheDocument();
  });

  it('tiene el id contenido-principal para el skip link', () => {
    render(<ContenedorPagina><span>Hijo</span></ContenedorPagina>);
    expect(document.getElementById('contenido-principal')).toBeInTheDocument();
  });

  it('usa el elemento semantico main', () => {
    render(<ContenedorPagina><span>Hijo</span></ContenedorPagina>);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('aplica etiqueta aria cuando se proporciona', () => {
    render(<ContenedorPagina etiquetaAria="Listado de encuestas"><span /></ContenedorPagina>);
    expect(screen.getByRole('main', { name: /listado de encuestas/i })).toBeInTheDocument();
  });
});
