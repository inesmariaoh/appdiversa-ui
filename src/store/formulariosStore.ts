'use client';

/**
 * Store de formularios disponibles y estructura activa.
 */

import { create } from 'zustand';
import type {
  FormularioDisponible,
  FormularioEstructura,
} from '@/types/formulario';

interface FormulariosStore {
  disponibles: FormularioDisponible[];
  estructuraActiva: FormularioEstructura | null;
  seccionActivaCodigo: string | null;
  cargando: boolean;
  error: string | null;
  establecerDisponibles: (formularios: FormularioDisponible[]) => void;
  establecerEstructura: (estructura: FormularioEstructura | null) => void;
  establecerSeccionActiva: (codigoSeccion: string | null) => void;
  establecerCargando: (cargando: boolean) => void;
  establecerError: (error: string | null) => void;
  limpiar: () => void;
}

export const useFormulariosStore = create<FormulariosStore>((set) => ({
  disponibles: [],
  estructuraActiva: null,
  seccionActivaCodigo: null,
  cargando: false,
  error: null,

  establecerDisponibles: (disponibles) => set({ disponibles }),
  establecerEstructura: (estructuraActiva) => set({ estructuraActiva }),
  establecerSeccionActiva: (seccionActivaCodigo) => set({ seccionActivaCodigo }),
  establecerCargando: (cargando) => set({ cargando }),
  establecerError: (error) => set({ error }),
  limpiar: () =>
    set({
      disponibles: [],
      estructuraActiva: null,
      seccionActivaCodigo: null,
      error: null,
    }),
}));
