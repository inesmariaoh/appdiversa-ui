'use client';

/**
 * Modal de terminos y condiciones con textos desde configuracion de interfaz.
 */

import Link from 'next/link';
import { Modal } from '@/components/ui/011_modal';
import { ContenidoTerminos } from '@/components/formularios/010_contenido_terminos';
import type { TextosTerminosInterfaz } from '@/types/interfaz';

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
      tamano="xl"
      mostrarBotonCerrar={!bloqueante}
    >
      <div
        className="overflow-y-auto mb-6 pr-1 -mr-1"
        style={{ maxHeight: 'min(62vh, 32rem)' }}
        aria-labelledby="modal-terminos-cuerpo"
      >
        <ContenidoTerminos
          textos={textos}
          idDescripcion={idCuerpo}
          mostrarEnlacePublico
          urlPaginaTerminos={urlPaginaTerminos}
          className="text-base leading-7 space-y-5"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        {onAceptar && (
          <button
            type="button"
            onClick={onAceptar}
            className="w-full sm:w-auto sm:min-w-[14rem] py-3 px-6 rounded-lg text-sm font-semibold shrink-0"
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
            className="w-full sm:w-auto py-3 px-6 rounded-lg text-sm font-semibold border"
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
            className="text-center text-sm font-semibold py-2"
            style={{ color: 'var(--color-primario)' }}
          >
            Volver al inicio
          </Link>
        )}
      </div>
    </Modal>
  );
}
