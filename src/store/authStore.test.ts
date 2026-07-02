import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuthStore } from './authStore';

vi.mock('@/services/authServicio', () => ({
  iniciarSesion: vi.fn(),
  cerrarSesion: vi.fn(),
  obtenerPerfilActual: vi.fn(),
}));

import {
  iniciarSesion,
  cerrarSesion,
  obtenerPerfilActual,
} from '@/services/authServicio';

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      usuario: null,
      autenticado: false,
      grupos: [],
      permisos: [],
      cargando: false,
      error: null,
      inicializado: false,
    });
    vi.mocked(iniciarSesion).mockReset();
    vi.mocked(cerrarSesion).mockReset();
    vi.mocked(obtenerPerfilActual).mockReset();
  });

  it('inicia sesion y guarda perfil sin contrasena', async () => {
    vi.mocked(iniciarSesion).mockResolvedValue({
      usuario: {
        id: 1,
        username: 'admin',
        email: 'admin@test.com',
        nombre_completo: 'Administrador',
        esta_activo: true,
      },
      grupos: ['administrador_general'],
      permisos: ['formularios.ver', 'formularios.editar'],
    });

    await useAuthStore.getState().iniciarSesion({
      username: 'admin',
      password: 'secret',
    });

    const estado = useAuthStore.getState();
    expect(estado.autenticado).toBe(true);
    expect(estado.usuario?.username).toBe('admin');
    expect(estado.grupos).toContain('administrador_general');
  });

  it('verifica permisos y roles', () => {
    useAuthStore.setState({
      autenticado: true,
      permisos: ['formularios.ver'],
      grupos: ['administrador_general'],
    });
    expect(useAuthStore.getState().tienePermiso('formularios.ver')).toBe(true);
    expect(useAuthStore.getState().tienePermiso('usuarios.ver')).toBe(false);
    expect(useAuthStore.getState().tieneRol('administrador_general')).toBe(true);
  });

  it('detecta administrador por grupo admin_appdiversa', () => {
    useAuthStore.setState({
      autenticado: true,
      grupos: ['admin_appdiversa'],
      permisos: [],
    });
    expect(useAuthStore.getState().esAdministrador()).toBe(true);
  });

  it('cierra sesion y limpia estado', async () => {
    useAuthStore.setState({
      autenticado: true,
      usuario: {
        id: 1,
        username: 'admin',
        email: '',
        nombre_completo: '',
        esta_activo: true,
      },
    });
    vi.mocked(cerrarSesion).mockResolvedValue();
    await useAuthStore.getState().cerrarSesion();
    expect(useAuthStore.getState().autenticado).toBe(false);
    expect(useAuthStore.getState().usuario).toBeNull();
  });

  it('carga perfil desde API', async () => {
    vi.mocked(obtenerPerfilActual).mockResolvedValue({
      usuario: {
        id: 2,
        username: 'editor',
        email: 'e@test.com',
        nombre_completo: 'Editor',
        esta_activo: true,
      },
      grupos: [],
      permisos: ['formularios.editar'],
    });
    await useAuthStore.getState().cargarPerfil();
    expect(useAuthStore.getState().autenticado).toBe(true);
    expect(useAuthStore.getState().inicializado).toBe(true);
  });

  it('limpia mensaje de error', () => {
    useAuthStore.setState({ error: 'Fallo' });
    useAuthStore.getState().limpiarError();
    expect(useAuthStore.getState().error).toBeNull();
  });

  it('registra error cuando falla el inicio de sesion', async () => {
    vi.mocked(iniciarSesion).mockRejectedValue(new Error('Credenciales invalidas'));
    await expect(
      useAuthStore.getState().iniciarSesion({ username: 'x', password: 'y' })
    ).rejects.toThrow();
    expect(useAuthStore.getState().autenticado).toBe(false);
    expect(useAuthStore.getState().error).toBeTruthy();
  });

  it('limpia estado cuando falla cargar perfil', async () => {
    useAuthStore.setState({ autenticado: true });
    vi.mocked(obtenerPerfilActual).mockRejectedValue(new Error('No autenticado'));
    await useAuthStore.getState().cargarPerfil();
    expect(useAuthStore.getState().autenticado).toBe(false);
    expect(useAuthStore.getState().inicializado).toBe(true);
  });

  it('limpia estado local aunque falle logout remoto', async () => {
    useAuthStore.setState({ autenticado: true, usuario: { id: 1, username: 'a', email: '', nombre_completo: '', esta_activo: true } });
    vi.mocked(cerrarSesion).mockRejectedValue(new Error('Red'));
    await useAuthStore.getState().cerrarSesion();
    expect(useAuthStore.getState().autenticado).toBe(false);
  });
});
