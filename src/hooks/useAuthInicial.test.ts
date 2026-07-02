import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAuthInicial } from './useAuthInicial';
import { useAuthStore } from '@/store/authStore';

vi.mock('@/services/authServicio', () => ({
  obtenerPerfilActual: vi.fn(),
  iniciarSesion: vi.fn(),
  cerrarSesion: vi.fn(),
}));

import { obtenerPerfilActual } from '@/services/authServicio';

describe('useAuthInicial', () => {
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
    vi.mocked(obtenerPerfilActual).mockReset();
  });

  it('carga perfil al montar si no esta inicializado', async () => {
    vi.mocked(obtenerPerfilActual).mockResolvedValue({
      usuario: {
        id: 1,
        username: 'admin',
        email: '',
        nombre_completo: '',
        esta_activo: true,
      },
      grupos: [],
      permisos: [],
    });

    renderHook(() => useAuthInicial());

    await waitFor(() => {
      expect(useAuthStore.getState().inicializado).toBe(true);
    });
  });
});
