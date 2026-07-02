'use client';

/**
 * Store de respuestas locales en memoria por codigo de pregunta.
 */

import { create } from 'zustand';
import type { OrigenRespuesta } from '@/types/respuesta';

export interface ValorRespuestaLocal {
  valor: unknown;
  observacion?: string;
  versionCliente: number;
  origenRespuesta: OrigenRespuesta;
  fechaCliente: string;
}

interface RespuestasStore {
  respuestas: Record<string, ValorRespuestaLocal>;
  establecerRespuesta: (
    codigoPregunta: string,
    datos: ValorRespuestaLocal
  ) => void;
  obtenerRespuesta: (codigoPregunta: string) => ValorRespuestaLocal | undefined;
  eliminarRespuesta: (codigoPregunta: string) => void;
  limpiar: () => void;
}

export const useRespuestasStore = create<RespuestasStore>((set, get) => ({
  respuestas: {},

  establecerRespuesta: (codigoPregunta, datos) =>
    set((estado) => ({
      respuestas: { ...estado.respuestas, [codigoPregunta]: datos },
    })),

  obtenerRespuesta: (codigoPregunta) => get().respuestas[codigoPregunta],

  eliminarRespuesta: (codigoPregunta) =>
    set((estado) => {
      const { [codigoPregunta]: _omitido, ...resto } = estado.respuestas;
      return { respuestas: resto };
    }),

  limpiar: () => set({ respuestas: {} }),
}));
