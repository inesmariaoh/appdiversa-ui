'use client';

/**
 * Store de sesion anonima y credenciales de mutacion.
 */

import { create } from 'zustand';
import type { CredencialesSesion, EstadoSesion } from '@/types/sesion';

interface SesionStore {
  uuidSesion: string | null;
  tokenCliente: string | null;
  uuidFormulario: string | null;
  estado: EstadoSesion | null;
  establecerSesion: (datos: {
    uuidSesion: string;
    tokenCliente: string;
    uuidFormulario: string;
    estado: EstadoSesion;
  }) => void;
  actualizarEstado: (estado: EstadoSesion) => void;
  limpiar: () => void;
  tieneCredenciales: () => boolean;
  obtenerCredenciales: () => CredencialesSesion | null;
}

export const useSesionStore = create<SesionStore>((set, get) => ({
  uuidSesion: null,
  tokenCliente: null,
  uuidFormulario: null,
  estado: null,

  establecerSesion: ({ uuidSesion, tokenCliente, uuidFormulario, estado }) =>
    set({ uuidSesion, tokenCliente, uuidFormulario, estado }),

  actualizarEstado: (estado) => set({ estado }),

  limpiar: () =>
    set({
      uuidSesion: null,
      tokenCliente: null,
      uuidFormulario: null,
      estado: null,
    }),

  tieneCredenciales: () => {
    const { uuidSesion, tokenCliente } = get();
    return Boolean(uuidSesion && tokenCliente);
  },

  obtenerCredenciales: () => {
    const { uuidSesion, tokenCliente } = get();
    if (!uuidSesion || !tokenCliente) return null;
    return { uuidSesion, tokenCliente };
  },
}));
