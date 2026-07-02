'use client';

/**
 * Confirmacion modal con promesa booleana y estilos de la paleta de marca.
 */

import { useEffect } from 'react';
import { useUiStore } from '@/store/uiStore';
import { Boton } from '@/components/ui/001_boton';

export function ConfirmProvider() {
  const confirmacion = useUiStore((s) => s.confirmacion);
  const resolverConfirmacion = useUiStore((s) => s.resolverConfirmacion);

  useEffect(() => {
    if (!confirmacion) {
      return;
    }

    function manejarTecla(evento: KeyboardEvent) {
      if (evento.key === 'Escape') {
        resolverConfirmacion(false);
      }
    }

    document.addEventListener('keydown', manejarTecla);
    return () => document.removeEventListener('keydown', manejarTecla);
  }, [confirmacion, resolverConfirmacion]);

  if (!confirmacion) {
    return null;
  }

  const titulo = confirmacion.titulo ?? 'Confirmar acción';
  const etiquetaConfirmar = confirmacion.etiquetaConfirmar ?? 'Confirmar';
  const etiquetaCancelar = confirmacion.etiquetaCancelar ?? 'Cancelar';

  return (
    <div
      className="fixed inset-0 z-[85] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgb(45 45 58 / 0.45)' }}
      onClick={() => resolverConfirmacion(false)}
      role="presentation"
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirmacion-titulo"
        aria-describedby="confirmacion-mensaje"
        className="w-full max-w-md p-6 flex flex-col gap-5"
        style={{
          backgroundColor: 'var(--color-fondo-tarjeta)',
          borderRadius: 'var(--radio-borde-tarjeta)',
          boxShadow: 'var(--sombra-lg)',
        }}
        onClick={(evento) => evento.stopPropagation()}
      >
        <div className="flex flex-col gap-2">
          <h2
            id="confirmacion-titulo"
            className="text-xl font-bold"
            style={{ color: 'var(--color-primario)' }}
          >
            {titulo}
          </h2>
          <p
            id="confirmacion-mensaje"
            className="text-sm leading-relaxed"
            style={{ color: 'var(--color-texto-secundario)' }}
          >
            {confirmacion.mensaje}
          </p>
        </div>
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <Boton
            variante="contorno"
            ancho="completo"
            className="sm:w-auto"
            onClick={() => resolverConfirmacion(false)}
          >
            {etiquetaCancelar}
          </Boton>
          <Boton
            variante="primario"
            ancho="completo"
            className="sm:w-auto"
            onClick={() => resolverConfirmacion(true)}
          >
            {etiquetaConfirmar}
          </Boton>
        </div>
      </div>
    </div>
  );
}

export function useConfirmacion() {
  const confirmar = useUiStore((s) => s.confirmar);
  return { confirmar };
}
