'use client';

/**
 * Dialogo modal generico controlado por store.
 */

import { useUiStore } from '@/store/uiStore';
import { Boton } from '@/components/ui/001_boton';

export function DialogProvider() {
  const dialogo = useUiStore((s) => s.dialogo);
  const cerrarDialogo = useUiStore((s) => s.cerrarDialogo);

  if (!dialogo) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialogo-titulo"
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4"
    >
      <div
        className="w-full max-w-md rounded-xl p-6 shadow-xl"
        style={{ backgroundColor: 'var(--color-fondo-tarjeta)' }}
      >
        <h2 id="dialogo-titulo" className="text-lg font-semibold mb-2">
          {dialogo.titulo}
        </h2>
        <p className="text-sm mb-6" style={{ color: 'var(--color-texto-secundario)' }}>
          {dialogo.mensaje}
        </p>
        <div className="flex justify-end gap-2">
          {dialogo.accionSecundaria ? (
            <Boton
              variante="secundario"
              onClick={() => {
                dialogo.onSecundaria?.();
                cerrarDialogo();
              }}
            >
              {dialogo.accionSecundaria}
            </Boton>
          ) : null}
          <Boton
            onClick={() => {
              dialogo.onPrimaria?.();
              cerrarDialogo();
            }}
          >
            {dialogo.accionPrimaria ?? 'Aceptar'}
          </Boton>
        </div>
      </div>
    </div>
  );
}

export function useDialogo() {
  const mostrarDialogo = useUiStore((s) => s.mostrarDialogo);
  const cerrarDialogo = useUiStore((s) => s.cerrarDialogo);
  return { mostrarDialogo, cerrarDialogo };
}
