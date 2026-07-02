import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RutaProtegida } from '@/components/auth/006_ruta_protegida';
import { useAuthStore } from '@/store/authStore';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
}));

describe('RutaProtegida', () => {
  it('muestra contenido cuando esta autenticado', () => {
    useAuthStore.setState({
      autenticado: true,
      inicializado: true,
      cargando: false,
    });
    render(
      <RutaProtegida>
        <p>Contenido protegido</p>
      </RutaProtegida>
    );
    expect(screen.getByText('Contenido protegido')).toBeInTheDocument();
  });

  it('no muestra contenido cuando no esta autenticado', () => {
    useAuthStore.setState({
      autenticado: false,
      inicializado: true,
      cargando: false,
    });
    render(
      <RutaProtegida>
        <p>Contenido protegido</p>
      </RutaProtegida>
    );
    expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument();
  });
});
