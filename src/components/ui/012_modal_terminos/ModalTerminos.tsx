'use client';

/**
 * Modal de terminos y condiciones con textos desde configuracion de interfaz.
 */

import Link from 'next/link';
import { Modal } from '@/components/ui/011_modal';
import { ContenidoTerminos } from '@/components/formularios/010_contenido_terminos';
import type { TextosTerminosInterfaz } from '@/types/interfaz';

const CLASE_BOTON =
  'w-full min-h-[52px] py-4 px-6 rounded-lg text-sm font-semibold text-center inline-flex items-center justify-center';

interface ModalTerminosProps {
  readonly abierto: boolean;
  readonly onCerrar: () => void;
  readonly onAceptar?: () => void;
  readonly textos: TextosTerminosInterfaz;
  readonly bloqueante?: boolean;
  readonly urlPaginaTerminos?: string;
}

export function ModalTerminos({
  abierto,
  onCerrar,
  onAceptar,
  textos,
  bloqueante = false,
  urlPaginaTerminos = '/terminos-condiciones',
}: ModalTerminosProps) {
  const idCuerpo = 'modal-terminos-cuerpo';

  return (
    <Modal
      abierto={abierto}
      onCerrar={bloqueante ? () => undefined : onCerrar}
      titulo={textos.titulo}
      descripcion={textos.parrafo_1 ?? textos.contenido ?? undefined}
      tamano="lg"
      mostrarBotonCerrar={!bloqueante}
      alineacion="center"
    >
      <div className="mx-auto flex w-full max-w-md min-h-0 flex-1 flex-col">
        <div
          className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden mb-5"
          aria-labelledby="modal-terminos-cuerpo"
        >
          <ContenidoTerminos
            textos={textos}
            idDescripcion={idCuerpo}
            mostrarEnlacePublico
            urlPaginaTerminos={urlPaginaTerminos}
            className="text-sm leading-6 space-y-4 sm:text-base sm:leading-7 sm:space-y-5"
            centrado
          />
        </div>

        <div className="shrink-0 flex flex-col items-center gap-3">
          {onAceptar && (
            <button
              type="button"
              onClick={onAceptar}
              className={CLASE_BOTON}
              style={{
                backgroundColor: 'var(--color-primario)',
                color: '#ffffff',
              }}
            >
              {textos.boton_aceptar ?? 'Aceptar y comenzar encuesta'}
            </button>
          )}

          {!bloqueante && (
            <button
              type="button"
              onClick={onCerrar}
              className={`${CLASE_BOTON} border`}
              style={{
                backgroundColor: 'transparent',
                color: 'var(--color-texto-primario)',
                borderColor: 'var(--color-borde-fuerte)',
              }}
            >
              {textos.boton_cerrar ?? 'Cerrar'}
            </button>
          )}

          {bloqueante && (
            <Link
              href="/"
              className={CLASE_BOTON}
              style={{ color: 'var(--color-primario)' }}
            >
              Volver al inicio
            </Link>
          )}
        </div>
      </div>
    </Modal>
  );
}
