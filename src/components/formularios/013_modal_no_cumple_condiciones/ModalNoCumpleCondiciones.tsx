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
      descripcion={textos.cuerpo}
      tamano="md"
      mostrarBotonCerrar={false}
    >
      <div className="flex flex-col gap-3 mt-4">
        <Boton variante="primario" ancho="completo" onClick={onVerOtrasEncuestas}>
          {textos.botonPrimario}
        </Boton>
        <Boton variante="secundario" ancho="completo" onClick={onVolver}>
          {textos.botonSecundario}
        </Boton>
      </div>
    </Modal>
  );
}
