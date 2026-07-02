import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MenuHamburguesa } from '@/components/layout/009_menu_hamburguesa';
import { useAuthStore } from '@/store/authStore';

vi.mock('@/store/authStore', () => ({
  useAuthStore: vi.fn(),
}));

type EstadoAuthMenu = {
  autenticado: boolean;
  tienePermiso: (permiso: string) => boolean;
  tieneRol: (rol: string) => boolean;
  cerrarSesion: () => Promise<void>;
};

function crearAuthStoreCompleto(estado: EstadoAuthMenu) {
  return {
    usuario: null,
    autenticado: estado.autenticado,
    grupos: [],
    permisos: [],
    cargando: false,
    error: null,
    inicializado: true,
    iniciarSesion: vi.fn(),
    cerrarSesion: estado.cerrarSesion,
    cargarPerfil: vi.fn(),
    tienePermiso: estado.tienePermiso,
    tieneRol: estado.tieneRol,
    esAdministrador: () => false,
    limpiarError: vi.fn(),
  };
}

function configurarAuthStore(estado: EstadoAuthMenu) {
  const store = crearAuthStoreCompleto(estado);
  vi.mocked(useAuthStore).mockImplementation((selector) => selector(store));
}

describe('MenuHamburguesa', () => {
  it('muestra enlaces de navegacion accesibles', () => {
    configurarAuthStore({
      autenticado: false,
      tienePermiso: () => false,
      tieneRol: () => false,
      cerrarSesion: vi.fn(),
    });

    render(
      <MenuHamburguesa
        abierto={true}
        onCerrar={vi.fn()}
        textoContacto="Contacto"
        urlContacto="/contacto"
      />
    );

    expect(screen.getByRole('dialog', { name: /menú de navegación/i })).toBeInTheDocument();
    expect(screen.getByText('Inicio')).toBeInTheDocument();
    expect(screen.getByText('Encuestas')).toBeInTheDocument();
    expect(screen.getByText('Iniciar sesión')).toBeInTheDocument();
  });

  it('cierra con boton accesible', () => {
    const onCerrar = vi.fn();
    configurarAuthStore({
      autenticado: true,
      tienePermiso: () => true,
      tieneRol: () => true,
      cerrarSesion: vi.fn().mockResolvedValue(undefined),
    });

    render(
      <MenuHamburguesa
        abierto={true}
        onCerrar={onCerrar}
        textoContacto="Contacto"
        urlContacto="/contacto"
      />
    );

    fireEvent.click(screen.getByLabelText(/cerrar menú de navegación/i));
    expect(onCerrar).toHaveBeenCalled();
  });

  it('muestra panel administrativo y perfil cuando esta autenticado con permisos', () => {
    configurarAuthStore({
      autenticado: true,
      tienePermiso: () => true,
      tieneRol: () => true,
      cerrarSesion: vi.fn().mockResolvedValue(undefined),
    });

    render(
      <MenuHamburguesa
        abierto={true}
        onCerrar={vi.fn()}
        textoContacto="Contacto"
        urlContacto="/contacto"
      />
    );

    expect(screen.getByText('Panel administrativo')).toBeInTheDocument();
    expect(screen.getByText('Perfil')).toHaveAttribute('href', '/perfil');
    expect(screen.getByText('Cerrar sesión')).toBeInTheDocument();
  });
});
