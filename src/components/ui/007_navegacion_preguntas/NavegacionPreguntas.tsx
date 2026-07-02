'use client';

/**
 * Acciones de navegacion entre preguntas del formulario.
 */

import {
  Boton,
  IconoChevronDerecha,
  IconoChevronIzquierda,
} from '@/components/ui/001_boton';
import { ejecutarSinEspera } from '@/utils/ejecutarSinEspera';

interface NavegacionPreguntasProps {
  readonly puedeContinuar: boolean;
  readonly procesando?: boolean;
  readonly textoContinuar?: string;
  readonly ariaLabelContinuar?: string;
  readonly onVolver: () => void;
  readonly onContinuar: () => void | Promise<void>;
}

export function NavegacionPreguntas({
  puedeContinuar,
  procesando = false,
  textoContinuar = 'Continuar',
  ariaLabelContinuar = 'Continuar a la siguiente pregunta',
  onVolver,
  onContinuar,
}: NavegacionPreguntasProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 pt-2">
      <Boton
        variante="contorno"
        ancho="auto"
        onClick={onVolver}
        disabled={procesando}
        iconoIzquierda={<IconoChevronIzquierda aria-hidden />}
        aria-label="Volver a la pregunta anterior"
      >
        Volver
      </Boton>
      <Boton
        variante={puedeContinuar ? 'primario' : 'secundario'}
        ancho="auto"
        onClick={() => ejecutarSinEspera(Promise.resolve(onContinuar()))}
        disabled={!puedeContinuar || procesando}
        cargando={procesando}
        iconoDerecha={<IconoChevronDerecha aria-hidden />}
        aria-label={ariaLabelContinuar}
      >
        {textoContinuar}
      </Boton>
    </div>
  );
}
