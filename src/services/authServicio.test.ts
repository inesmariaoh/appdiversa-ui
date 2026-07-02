import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiCliente } from './api';
import {
  iniciarSesion,
  cerrarSesion,
  obtenerPerfilActual,
  obtenerPerfilEditable,
  actualizarPerfil,
  cambiarPassword,
  registrarCorreo,
  solicitarRestaurarPassword,
  restaurarPassword,
} from './authServicio';

vi.mock('./api', () => ({
  apiCliente: {
    post: vi.fn(),
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

describe('authServicio', () => {
  beforeEach(() => {
    vi.mocked(apiCliente.post).mockReset();
    vi.mocked(apiCliente.get).mockReset();
    vi.mocked(apiCliente.patch).mockReset();
  });

  it('inicia sesion con credenciales', async () => {
    const perfil = {
      usuario: { id: 1, username: 'admin', email: 'a@b.com', nombre_completo: 'Admin', esta_activo: true },
      grupos: ['administrador_general'],
      permisos: ['formularios.ver'],
    };
    vi.mocked(apiCliente.post).mockResolvedValue({ data: perfil });

    const resultado = await iniciarSesion({ username: 'admin', password: 'secret' });

    expect(apiCliente.post).toHaveBeenCalledWith(
      '/api/v1/auth/login/',
      { username: 'admin', password: 'secret' },
      { withCredentials: true }
    );
    expect(resultado).toEqual(perfil);
  });

  it('cierra sesion', async () => {
    vi.mocked(apiCliente.post).mockResolvedValue({ data: {} });
    await cerrarSesion();
    expect(apiCliente.post).toHaveBeenCalledWith(
      '/api/v1/auth/logout/',
      {},
      { withCredentials: true }
    );
  });

  it('registra usuario por correo', async () => {
    vi.mocked(apiCliente.post).mockResolvedValue({
      data: { detalle: 'Revisa tu correo para verificar la cuenta.' },
    });

    const resultado = await registrarCorreo({
      correo: 'usuario@correo.com',
      contrasena: 'Secreta123',
    });

    expect(apiCliente.post).toHaveBeenCalledWith('/api/v1/auth/registro/correo/', {
      correo: 'usuario@correo.com',
      contrasena: 'Secreta123',
    });
    expect(resultado.detalle).toContain('Revisa tu correo');
  });

  it('obtiene perfil actual', async () => {
    const perfil = { usuario: { id: 1, username: 'u', email: '', nombre_completo: '', esta_activo: true }, grupos: [], permisos: [] };
    vi.mocked(apiCliente.get).mockResolvedValue({ data: perfil });
    const resultado = await obtenerPerfilActual();
    expect(apiCliente.get).toHaveBeenCalledWith('/api/v1/auth/me/', { withCredentials: true });
    expect(resultado).toEqual(perfil);
  });

  it('obtiene perfil editable', async () => {
    const perfil = {
      id: 1,
      username: 'u',
      email: 'u@correo.com',
      first_name: 'Juan',
      last_name: 'Perez',
      fecha_ultimo_inicio_sesion: '2025-08-06T12:00:00Z',
      tipo_inicio_sesion: 'correo_electronico',
      tipo_inicio_sesion_etiqueta: 'Correo electrónico',
    };
    vi.mocked(apiCliente.get).mockResolvedValue({ data: perfil });

    const resultado = await obtenerPerfilEditable();

    expect(apiCliente.get).toHaveBeenCalledWith('/api/v1/auth/perfil/', {
      withCredentials: true,
    });
    expect(resultado).toEqual(perfil);
  });

  it('actualiza perfil editable', async () => {
    const perfil = {
      id: 1,
      username: 'u',
      email: 'u@correo.com',
      first_name: 'Juan',
      last_name: 'Perez',
      fecha_ultimo_inicio_sesion: null,
      tipo_inicio_sesion: 'correo_electronico',
      tipo_inicio_sesion_etiqueta: 'Correo electrónico',
    };
    vi.mocked(apiCliente.patch).mockResolvedValue({ data: perfil });

    const resultado = await actualizarPerfil({ first_name: 'Juan' });

    expect(apiCliente.patch).toHaveBeenCalledWith(
      '/api/v1/auth/perfil/',
      { first_name: 'Juan' },
      { withCredentials: true },
    );
    expect(resultado).toEqual(perfil);
  });

  it('cambia contrasena', async () => {
    vi.mocked(apiCliente.post).mockResolvedValue({ data: {} });
    await cambiarPassword({
      password_actual: 'a',
      password_nueva: 'b',
      password_nueva_confirmacion: 'b',
    });
    expect(apiCliente.post).toHaveBeenCalledWith(
      '/api/v1/auth/cambiar-password/',
      {
        password_actual: 'a',
        password_nueva: 'b',
        password_confirmacion: 'b',
      },
      { withCredentials: true }
    );
  });

  it('solicita restauracion de contrasena con email', async () => {
    const detalle = {
      detalle: 'Si el correo esta registrado, recibiras instrucciones para restaurar la contrasena.',
    };
    vi.mocked(apiCliente.post).mockResolvedValue({ data: detalle });

    const resultado = await solicitarRestaurarPassword({ email: 'usuario@correo.com' });

    expect(apiCliente.post).toHaveBeenCalledWith(
      '/api/v1/auth/solicitar-restaurar-password/',
      { email: 'usuario@correo.com' }
    );
    expect(resultado).toEqual(detalle);
  });

  it('restaura contrasena con uid y token', async () => {
    const detalle = { detalle: 'Contrasena restaurada correctamente.' };
    vi.mocked(apiCliente.post).mockResolvedValue({ data: detalle });

    const passwordNueva = ['nueva', '1234'].join('');
    const payload = {
      uid: 'uid-1',
      token: 'token-1',
      password_nueva: passwordNueva,
      password_confirmacion: passwordNueva,
    };
    const resultado = await restaurarPassword(payload);

    expect(apiCliente.post).toHaveBeenCalledWith(
      '/api/v1/auth/restaurar-password/',
      payload
    );
    expect(resultado).toEqual(detalle);
  });

  it('propaga error al solicitar restauracion', async () => {
    vi.mocked(apiCliente.post).mockRejectedValue(new Error('fallo de red'));

    await expect(
      solicitarRestaurarPassword({ email: 'usuario@correo.com' })
    ).rejects.toThrow('fallo de red');
  });
});
