'use client';

/**
 * Store de estado offline y sincronizacion.
 */

import { create } from 'zustand';
import type { SincronizarBatchSalida } from '@/types/sincronizacion';

interface OfflineStore {
  enLinea: boolean;
  operacionesPendientes: number;
  sincronizando: boolean;
  finalizacionPendiente: boolean;
  uuidFormularioFinalizacion: string | null;
  ultimoResultado: SincronizarBatchSalida | null;
  establecerEnLinea: (enLinea: boolean) => void;
  establecerOperacionesPendientes: (cantidad: number) => void;
  establecerSincronizando: (sincronizando: boolean) => void;
  establecerFinalizacionPendiente: (
    pendiente: boolean,
    uuidFormulario?: string | null,
  ) => void;
  establecerUltimoResultado: (resultado: SincronizarBatchSalida | null) => void;
}

export const useOfflineStore = create<OfflineStore>((set) => ({
  enLinea: typeof navigator !== 'undefined' ? navigator.onLine : true,
  operacionesPendientes: 0,
  sincronizando: false,
  finalizacionPendiente: false,
  uuidFormularioFinalizacion: null,
  ultimoResultado: null,

  establecerEnLinea: (enLinea) => set({ enLinea }),
  establecerOperacionesPendientes: (operacionesPendientes) =>
    set({ operacionesPendientes }),
  establecerSincronizando: (sincronizando) => set({ sincronizando }),
  establecerFinalizacionPendiente: (finalizacionPendiente, uuidFormulario = null) =>
    set({
      finalizacionPendiente,
      uuidFormularioFinalizacion: finalizacionPendiente
        ? uuidFormulario ?? null
        : null,
    }),
  establecerUltimoResultado: (ultimoResultado) => set({ ultimoResultado }),
}));
