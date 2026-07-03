import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MenuLateralAdmin } from './MenuLateralAdmin';
import { useAuthStore } from '@/store/authStore';

vi.mock('@/store/authStore', () => ({
  useAuthStore: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/admin/usuarios',
}));

describe('MenuLateralAdmin', () => {
  it('muestra etiquetas del menu con tildes correctas', () => {
    vi.mocked(useAuthStore).mockImplementation((selector) =>
      selector({
        autenticado: true,
        tienePermiso: () => true,
        esAdministrador: () => true,
      } as never),
    );

    render(<MenuLateralAdmin />);

    expect(screen.getByText('Formularios')).toBeInTheDocument();
    expect(screen.getByText('Usuarios')).toBeInTheDocument();
    expect(screen.getByText('Catálogos')).toBeInTheDocument();
    expect(screen.getByText('Analítica')).toBeInTheDocument();
    expect(screen.getByText('Configuración')).toBeInTheDocument();
    expect(screen.getAllByText('(próximamente)').length).toBeGreaterThanOrEqual(1);
  });

  it('expone aria-label del menu con tilde', () => {
    vi.mocked(useAuthStore).mockImplementation((selector) =>
      selector({
        autenticado: true,
        tienePermiso: () => true,
        esAdministrador: () => false,
      } as never),
    );

    render(<MenuLateralAdmin />);

    expect(document.querySelector('[aria-label="Menú administrativo"]')).toBeTruthy();
  });
});
