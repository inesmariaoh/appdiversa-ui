'use client';

/**
 * Estado global de capa UI: carga, toasts, dialogos y confirmaciones.
 */

import { create } from 'zustand';

export interface ToastEntrada {
  id: string;
  mensaje: string;
  variante?: 'info' | 'exito' | 'error';
}

export interface DialogoEntrada {
  titulo: string;
  mensaje: string;
  accionPrimaria?: string;
  accionSecundaria?: string;
  onPrimaria?: () => void;
  onSecundaria?: () => void;
}

export interface ConfirmacionOpciones {
  titulo?: string;
  mensaje: string;
  etiquetaConfirmar?: string;
  etiquetaCancelar?: string;
}

interface ConfirmacionPendiente extends ConfirmacionOpciones {
  resolver: (valor: boolean) => void;
}

interface UiStore {
  cargandoGlobal: boolean;
  mensajeCarga: string | null;
  toasts: ToastEntrada[];
  dialogo: DialogoEntrada | null;
  confirmacion: ConfirmacionPendiente | null;
  establecerCarga: (activo: boolean, mensaje?: string | null) => void;
  agregarToast: (toast: Omit<ToastEntrada, 'id'>) => void;
  eliminarToast: (id: string) => void;
  mostrarDialogo: (dialogo: DialogoEntrada) => void;
  cerrarDialogo: () => void;
  confirmar: (entrada: string | ConfirmacionOpciones) => Promise<boolean>;
  resolverConfirmacion: (valor: boolean) => void;
}

export const useUiStore = create<UiStore>((set, get) => ({
  cargandoGlobal: false,
  mensajeCarga: null,
  toasts: [],
  dialogo: null,
  confirmacion: null,

  establecerCarga: (cargandoGlobal, mensajeCarga = null) =>
    set({ cargandoGlobal, mensajeCarga }),

  agregarToast: (toast) =>
    set((estado) => ({
      toasts: [
        ...estado.toasts,
        { ...toast, id: crypto.randomUUID() },
      ],
    })),

  eliminarToast: (id) =>
    set((estado) => ({
      toasts: estado.toasts.filter((item) => item.id !== id),
    })),

  mostrarDialogo: (dialogo) => set({ dialogo }),

  cerrarDialogo: () => set({ dialogo: null }),

  confirmar: (entrada) =>
    new Promise<boolean>((resolver) => {
      const opciones =
        typeof entrada === 'string' ? { mensaje: entrada } : entrada;
      set({ confirmacion: { ...opciones, resolver } });
    }),

  resolverConfirmacion: (valor) => {
    const pendiente = get().confirmacion;
    pendiente?.resolver(valor);
    set({ confirmacion: null });
  },
}));
