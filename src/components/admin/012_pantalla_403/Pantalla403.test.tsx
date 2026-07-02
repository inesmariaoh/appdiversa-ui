import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Pantalla403 } from '@/components/admin/012_pantalla_403';

describe('Pantalla403', () => {
  it('muestra mensaje amigable de acceso denegado', () => {
    render(<Pantalla403 mensaje="Sin permiso para usuarios" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Sin permiso para usuarios');
    expect(screen.getByText('403')).toBeInTheDocument();
  });
});
