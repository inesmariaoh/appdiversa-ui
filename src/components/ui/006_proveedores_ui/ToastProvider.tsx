'use client';

/**
 * Notificaciones efimeras accesibles.
 */

import { useEffect } from 'react';
import { useUiStore } from '@/store/uiStore';

const DURACION_MS = 5000;

export function ToastProvider() {
  const toasts = useUiStore((s) => s.toasts);
  const eliminarToast = useUiStore((s) => s.eliminarToast);

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-4 right-4 z-[90] flex flex-col gap-2 max-w-sm"
    >
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          id={toast.id}
          mensaje={toast.mensaje}
          variante={toast.variante}
          onCerrar={eliminarToast}
        />
      ))}
    </div>
  );
}

interface ToastItemProps {
  readonly id: string;
  readonly mensaje: string;
  readonly variante?: 'info' | 'exito' | 'error';
  readonly onCerrar: (id: string) => void;
}

function ToastItem({ id, mensaje, variante = 'info', onCerrar }: ToastItemProps) {
  useEffect(() => {
    const temporizador = setTimeout(() => onCerrar(id), DURACION_MS);
    return () => clearTimeout(temporizador);
  }, [id, onCerrar]);

  const borde = (() => {
    if (variante === 'error') return 'var(--color-error)';
    if (variante === 'exito') return 'var(--color-acento)';
    return 'var(--color-primario)';
  })();

  return (
    <div
      role="status"
      className="rounded-lg border-l-4 px-4 py-3 shadow-md text-sm"
      style={{
        backgroundColor: 'var(--color-fondo-tarjeta)',
        borderLeftColor: borde,
      }}
    >
      {mensaje}
    </div>
  );
}

export function useToast() {
  const agregarToast = useUiStore((s) => s.agregarToast);
  return {
    toast: (mensaje: string, variante?: 'info' | 'exito' | 'error') =>
      agregarToast({ mensaje, variante }),
  };
}
