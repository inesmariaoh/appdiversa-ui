'use client';

/**
 * Store de autenticacion Django para el panel administrativo.
 * No persiste contrasenas; la sesion se mantiene via cookies HTTP.
 */

import { create } from 'zustand';
import {
  tieneGrupoAdministrador,
  type LoginEntrada,
  type UsuarioAutenticado,
} from '@/types/auth';
import {
  cerrarSesion as cerrarSesionApi,
  iniciarSesion as iniciarSesionApi,
  obtenerPerfilActual,
} from '@/services/authServicio';
import { extraerDetalleError } from '@/utils/erroresApi';

interface AuthStore {
  usuario: UsuarioAutenticado | null;
  autenticado: boolean;
  grupos: string[];
  permisos: string[];
  cargando: boolean;
  error: string | null;
  inicializado: boolean;
  iniciarSesion: (entrada: LoginEntrada) => Promise<void>;
  cerrarSesion: () => Promise<void>;
  cargarPerfil: () => Promise<void>;
  tienePermiso: (permiso: string) => boolean;
  tieneRol: (rol: string) => boolean;
  esAdministrador: () => boolean;
  limpiarError: () => void;
}

function aplicarPerfil(
  set: (estado: Partial<AuthStore>) => void,
  perfil: {
    usuario: UsuarioAutenticado;
    grupos: string[];
    permisos: string[];
  }
) {
  set({
    usuario: perfil.usuario,
    autenticado: true,
    grupos: perfil.grupos,
    permisos: perfil.permisos,
    error: null,
  });
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  usuario: null,
  autenticado: false,
  grupos: [],
  permisos: [],
  cargando: false,
  error: null,
  inicializado: false,

  iniciarSesion: async (entrada) => {
    set({ cargando: true, error: null });
    try {
      const perfil = await iniciarSesionApi(entrada);
      aplicarPerfil(set, perfil);
    } catch (err) {
      set({
        autenticado: false,
        usuario: null,
        grupos: [],
        permisos: [],
        error: extraerDetalleError(err),
      });
      throw err;
    } finally {
      set({ cargando: false, inicializado: true });
    }
  },

  cerrarSesion: async () => {
    set({ cargando: true, error: null });
    try {
      await cerrarSesionApi();
    } catch {
      // Se limpia el estado local aunque falle la peticion remota.
    } finally {
      set({
        usuario: null,
        autenticado: false,
        grupos: [],
        permisos: [],
        cargando: false,
        inicializado: true,
        error: null,
      });
    }
  },

  cargarPerfil: async () => {
    set({ cargando: true, error: null });
    try {
      const perfil = await obtenerPerfilActual();
      aplicarPerfil(set, perfil);
    } catch {
      set({
        usuario: null,
        autenticado: false,
        grupos: [],
        permisos: [],
      });
    } finally {
      set({ cargando: false, inicializado: true });
    }
  },

  tienePermiso: (permiso) => get().permisos.includes(permiso),

  tieneRol: (rol) => get().grupos.includes(rol),

  esAdministrador: () => tieneGrupoAdministrador(get().grupos),

  limpiarError: () => set({ error: null }),
}));
