'use client';

/**
 * Capa visual de carga global.
 */

import { useUiStore } from '@/store/uiStore';
import { Spinner } from '@/components/ui/007_spinner';

export function LoadingProvider() {
  const cargando = useUiStore((s) => s.cargandoGlobal);
  const mensaje = useUiStore((s) => s.mensajeCarga);

  if (!cargando) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30"
    >
      <div
        className="flex flex-col items-center gap-3 rounded-xl px-6 py-5 shadow-lg"
        style={{ backgroundColor: 'var(--color-fondo-tarjeta)' }}
      >
        <Spinner />
        {mensaje ? (
          <p className="text-sm" style={{ color: 'var(--color-texto-secundario)' }}>
            {mensaje}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function useLoading() {
  const establecerCarga = useUiStore((s) => s.establecerCarga);
  return {
    mostrarCarga: (mensaje?: string) => establecerCarga(true, mensaje ?? null),
    ocultarCarga: () => establecerCarga(false, null),
  };
}
