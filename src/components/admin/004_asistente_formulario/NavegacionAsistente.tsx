'use client';

/**
 * Navegacion inferior del asistente para avanzar o retroceder entre pasos.
 */

import { Boton, IconoChevronDerecha, IconoChevronIzquierda } from '@/components/ui/001_boton';
import { PASOS_ASISTENTE, type PasoAsistenteId } from './pasos';

interface NavegacionAsistenteProps {
  readonly pasoActual: PasoAsistenteId;
  readonly onCambiar: (id: PasoAsistenteId) => void;
}

export function NavegacionAsistente({ pasoActual, onCambiar }: NavegacionAsistenteProps) {
  const indice = PASOS_ASISTENTE.findIndex((paso) => paso.id === pasoActual);
  const anterior = PASOS_ASISTENTE[indice - 1];
  const siguiente = PASOS_ASISTENTE[indice + 1];

  return (
    <div
      className="mt-8 flex items-center justify-between gap-4 border-t pt-6"
      style={{ borderColor: 'var(--color-borde)' }}
    >
      {anterior ? (
        <Boton
          type="button"
          variante="secundario"
          iconoIzquierda={<IconoChevronIzquierda aria-hidden={true} />}
          onClick={() => onCambiar(anterior.id)}
        >
          {anterior.etiqueta}
        </Boton>
      ) : (
        <span />
      )}

      {siguiente && (
        <Boton
          type="button"
          iconoDerecha={<IconoChevronDerecha aria-hidden={true} />}
          onClick={() => onCambiar(siguiente.id)}
        >
          {siguiente.etiqueta}
        </Boton>
      )}
    </div>
  );
}
