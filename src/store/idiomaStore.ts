'use client';

/**
 * Store del idioma activo, traducciones y contenido accesible en peticiones.
 */

import { create } from 'zustand';

interface IdiomaStore {
  idioma: string;
  incluirAccesibilidad: boolean;
  traducciones: Record<string, string>;
  cargandoTraducciones: boolean;
  establecerIdioma: (idioma: string) => void;
  establecerIncluirAccesibilidad: (incluir: boolean) => void;
  establecerTraducciones: (traducciones: Record<string, string>) => void;
  establecerCargandoTraducciones: (cargando: boolean) => void;
  traducir: (clave: string, fallback: string) => string;
}

export const useIdiomaStore = create<IdiomaStore>((set, get) => ({
  idioma: 'es',
  incluirAccesibilidad: false,
  traducciones: {},
  cargandoTraducciones: false,

  establecerIdioma: (idioma) => set({ idioma }),
  establecerIncluirAccesibilidad: (incluirAccesibilidad) =>
    set({ incluirAccesibilidad }),
  establecerTraducciones: (traducciones) => set({ traducciones }),
  establecerCargandoTraducciones: (cargandoTraducciones) =>
    set({ cargandoTraducciones }),
  traducir: (clave, fallback) => get().traducciones[clave]?.trim() || fallback,
}));
