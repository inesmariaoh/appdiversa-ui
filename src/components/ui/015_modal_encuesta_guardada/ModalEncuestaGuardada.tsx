'use client';

/**
 * Modal de exito cuando la encuesta fue guardada o finalizada.
 */

import Link from 'next/link';
import { Modal } from '@/components/ui/011_modal';
import type { TextosModalGuardado } from '@/types/interfaz';

interface ModalEncuestaGuardadaProps {
  readonly abierto: boolean;
  readonly onCerrar: () => void;
  readonly onSeguirViendo: () => void;
  readonly textos: TextosModalGuardado;
  readonly urlOtrasEncuestas?: string;
}

export function ModalEncuestaGuardada({
  abierto,
  onCerrar,
  onSeguirViendo,
  textos,
  urlOtrasEncuestas = '/encuestas',
}: ModalEncuestaGuardadaProps) {
  return (
    <Modal
      abierto={abierto}
      onCerrar={onCerrar}
      titulo={textos.titulo}
      descripcion={textos.parrafo}
      tamano="md"
      mostrarBotonCerrar
    >
      <div className="flex items-start mb-3 -mt-2" aria-hidden="true">
        <IconoCheckCircle />
      </div>

      <p
        className="mb-6 text-sm leading-relaxed"
        style={{ color: 'var(--color-texto-secundario)' }}
      >
        {textos.parrafo}
      </p>

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={onSeguirViendo}
          className="w-full py-3 px-4 rounded-lg text-sm font-semibold"
          style={{
            backgroundColor: 'var(--color-primario)',
            color: '#ffffff',
          }}
        >
          {textos.boton_seguir}
        </button>

        <Link
          href={urlOtrasEncuestas}
          className="block w-full py-3 px-4 rounded-lg text-sm font-semibold text-center border"
          style={{
            backgroundColor: 'transparent',
            color: 'var(--color-primario)',
            borderColor: 'var(--color-primario)',
          }}
          onClick={onCerrar}
        >
          {textos.boton_otras}
        </Link>
      </div>
    </Modal>
  );
}

function IconoCheckCircle() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
      <circle
        cx="22"
        cy="22"
        r="22"
        fill="color-mix(in srgb, var(--color-acento, #00B4A0) 15%, transparent)"
      />
      <circle
        cx="22"
        cy="22"
        r="16"
        fill="none"
        stroke="var(--color-acento, #00B4A0)"
        strokeWidth="2.5"
      />
      <path
        d="M14 22L19.5 27.5L30 17"
        stroke="var(--color-acento, #00B4A0)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
