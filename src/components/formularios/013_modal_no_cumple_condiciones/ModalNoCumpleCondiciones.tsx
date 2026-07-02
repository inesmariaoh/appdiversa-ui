'use client';

/**
 * Modal generico cuando el usuario no cumple condiciones de elegibilidad.
 */

import { Modal } from '@/components/ui/011_modal';
import { Boton } from '@/components/ui/001_boton';
import type { TextosModalNoElegible } from '@/types/filtros';

interface ModalNoCumpleCondicionesProps {
  readonly abierto: boolean;
  readonly textos: TextosModalNoElegible;
  readonly onVerOtrasEncuestas: () => void;
  readonly onVolver: () => void;
}

export function ModalNoCumpleCondiciones({
  abierto,
  textos,
  onVerOtrasEncuestas,
  onVolver,
}: ModalNoCumpleCondicionesProps) {
  return (
    <Modal
      abierto={abierto}
      onCerrar={onVolver}
      titulo={textos.titulo}
      tamano="md"
      mostrarBotonCerrar={false}
      alineacion="center"
    >
      <div className="mx-auto w-full max-w-sm">
        {textos.cuerpo && (
          <p
            className="text-sm leading-relaxed text-center whitespace-pre-line mb-6"
            style={{ color: 'var(--color-texto-secundario)' }}
          >
            {textos.cuerpo}
          </p>
        )}

        <div className="flex flex-col gap-3">
          <Boton variante="primario" ancho="completo" onClick={onVerOtrasEncuestas}>
            {textos.botonPrimario}
          </Boton>
          <Boton variante="secundario" ancho="completo" onClick={onVolver}>
            {textos.botonSecundario}
          </Boton>
        </div>
      </div>
    </Modal>
  );
}
