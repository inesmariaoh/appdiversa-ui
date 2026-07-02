'use client';

/**
 * Store global de accesibilidad usando Zustand con persistencia en localStorage.
 * Gestiona: alto contraste, tamano de texto y reduccion de animaciones.
 * El estado sobrevive recargas de pagina (clave: 'appdiversa-accesibilidad').
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AccesibilidadConfig } from '@/types/interfaz';

const ESTADO_INICIAL: AccesibilidadConfig = {
  alto_contraste: false,
  tamano_texto: 'normal',
  reducir_animaciones: false,
};

const TAMANOS_TEXTO: AccesibilidadConfig['tamano_texto'][] = [
  'normal',
  'grande',
  'muy_grande',
];

interface AccesibilidadStore extends AccesibilidadConfig {
  activarAltoContraste: () => void;
  desactivarAltoContraste: () => void;
  aumentarTexto: () => void;
  disminuirTexto: () => void;
  activarReducirAnimaciones: () => void;
  desactivarReducirAnimaciones: () => void;
  /** Restablece todos los valores al estado por defecto */
  resetearAccesibilidad: () => void;
}

export const useAccesibilidadStore = create<AccesibilidadStore>()(
  persist(
    (set, get) => ({
      ...ESTADO_INICIAL,

      activarAltoContraste: () => set({ alto_contraste: true }),
      desactivarAltoContraste: () => set({ alto_contraste: false }),

      aumentarTexto: () => {
        const indiceActual = TAMANOS_TEXTO.indexOf(get().tamano_texto);
        const siguiente =
          TAMANOS_TEXTO[Math.min(indiceActual + 1, TAMANOS_TEXTO.length - 1)];
        set({ tamano_texto: siguiente });
      },

      disminuirTexto: () => {
        const indiceActual = TAMANOS_TEXTO.indexOf(get().tamano_texto);
        const anterior = TAMANOS_TEXTO[Math.max(indiceActual - 1, 0)];
        set({ tamano_texto: anterior });
      },

      activarReducirAnimaciones: () => set({ reducir_animaciones: true }),
      desactivarReducirAnimaciones: () => set({ reducir_animaciones: false }),

      resetearAccesibilidad: () => set({ ...ESTADO_INICIAL }),
    }),
    {
      name: 'appdiversa-accesibilidad',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : sessionStorage
      ),
      // Solo persistir los valores de estado, no las acciones
      partialize: (state) => ({
        alto_contraste: state.alto_contraste,
        tamano_texto: state.tamano_texto,
        reducir_animaciones: state.reducir_animaciones,
      }),
    }
  )
);
