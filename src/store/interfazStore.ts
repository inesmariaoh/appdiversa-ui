'use client';

/**
 * Store de configuracion de interfaz y tokens visuales dinamicos.
 */

import { create } from 'zustand';
import type { ConfiguracionInterfaz, FlujoFormularioInterfaz } from '@/types/interfaz';
import { aplicarTokensInterfaz } from '@/utils/tokensInterfaz';

interface InterfazStore {
  configuracion: ConfiguracionInterfaz | null;
  cargando: boolean;
  error: string | null;
  establecerConfiguracion: (configuracion: ConfiguracionInterfaz) => void;
  establecerCargando: (cargando: boolean) => void;
  establecerError: (error: string | null) => void;
  obtenerEstilosTokens: () => Record<string, string>;
  obtenerFlujoFormulario: () => FlujoFormularioInterfaz | null;
}

export const useInterfazStore = create<InterfazStore>((set, get) => ({
  configuracion: null,
  cargando: false,
  error: null,

  establecerConfiguracion: (configuracion) => set({ configuracion, error: null }),
  establecerCargando: (cargando) => set({ cargando }),
  establecerError: (error) => set({ error }),

  obtenerEstilosTokens: () => {
    const configuracion = get().configuracion;
    if (!configuracion) return {};
    return aplicarTokensInterfaz(configuracion);
  },

  obtenerFlujoFormulario: () => get().configuracion?.flujo_formulario ?? null,
}));
