'use client';

/**
 * Store global de accesibilidad usando Zustand con persistencia en localStorage.
 * Gestiona: alto contraste, tamano de texto, reduccion de animaciones, tema de
 * contraste, fuente para dislexia y modo de lectura facil.
 * El estado sobrevive recargas de pagina (clave: 'appdiversa-accesibilidad').
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AccesibilidadConfig, TemaAccesibilidad } from '@/types/interfaz';

const ESTADO_INICIAL: AccesibilidadConfig = {
  alto_contraste: false,
  tamano_texto: 'normal',
  reducir_animaciones: false,
  tema: 'claro',
  fuente_dislexia: false,
  lectura_facil: false,
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
  establecerTema: (tema: TemaAccesibilidad) => void;
  alternarFuenteDislexia: () => void;
  alternarLecturaFacil: () => void;
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

      establecerTema: (tema) =>
        set({ tema, alto_contraste: tema === 'alto_contraste' }),
      alternarFuenteDislexia: () =>
        set({ fuente_dislexia: !get().fuente_dislexia }),
      alternarLecturaFacil: () => set({ lectura_facil: !get().lectura_facil }),

      resetearAccesibilidad: () => set({ ...ESTADO_INICIAL }),
    }),
    {
      name: 'appdiversa-accesibilidad',
      storage: createJSONStorage(() =>
        globalThis.window === undefined ? sessionStorage : localStorage
      ),
      // Solo persistir los valores de estado, no las acciones
      partialize: (state) => ({
        alto_contraste: state.alto_contraste,
        tamano_texto: state.tamano_texto,
        reducir_animaciones: state.reducir_animaciones,
        tema: state.tema,
        fuente_dislexia: state.fuente_dislexia,
        lectura_facil: state.lectura_facil,
      }),
    }
  )
);
