'use client';

/**
 * Store del resultado de evaluacion de reglas del motor.
 */

import { create } from 'zustand';
import type { ResultadoReglas } from '@/types/reglas';
import { RESULTADO_REGLAS_VACIO } from '@/types/reglas';

interface ReglasStore {
  resultado: ResultadoReglas;
  establecerResultado: (resultado: ResultadoReglas) => void;
  limpiar: () => void;
  preguntaEstaVisible: (codigoPregunta: string, visiblePorDefecto?: boolean) => boolean;
  preguntaEstaHabilitada: (codigoPregunta: string) => boolean;
  preguntaEsObligatoria: (codigoPregunta: string, esObligatoriaBase: boolean) => boolean;
}

export const useReglasStore = create<ReglasStore>((set, get) => ({
  resultado: RESULTADO_REGLAS_VACIO,

  establecerResultado: (resultado) => set({ resultado }),

  limpiar: () => set({ resultado: RESULTADO_REGLAS_VACIO }),

  preguntaEstaVisible: (codigoPregunta, visiblePorDefecto = true) => {
    const { resultado } = get();
    if (resultado.preguntas_ocultas.includes(codigoPregunta)) return false;
    if (resultado.preguntas_visibles.includes(codigoPregunta)) return true;
    return visiblePorDefecto;
  },

  preguntaEstaHabilitada: (codigoPregunta) => {
    const { resultado } = get();
    return !resultado.preguntas_deshabilitadas.includes(codigoPregunta);
  },

  preguntaEsObligatoria: (codigoPregunta, esObligatoriaBase) => {
    const { resultado } = get();
    if (resultado.preguntas_obligatorias.includes(codigoPregunta)) return true;
    if (resultado.preguntas_opcionales.includes(codigoPregunta)) return false;
    return esObligatoriaBase;
  },
}));
