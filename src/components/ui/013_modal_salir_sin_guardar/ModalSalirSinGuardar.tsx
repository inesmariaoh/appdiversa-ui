'use client';

/**
 * Modal de confirmacion al intentar salir de una encuesta sin guardar.
 */

import Link from 'next/link';
import { Modal } from '@/components/ui/011_modal';
import type { TextosModalSalir } from '@/types/interfaz';

interface ModalSalirSinGuardarProps {
  readonly abierto: boolean;
  readonly onCerrar: () => void;
  readonly onVolver: () => void;
  readonly onSalir: () => void;
  readonly textos: TextosModalSalir;
  readonly urlLogin?: string;
}

export function ModalSalirSinGuardar({
  abierto,
  onCerrar,
  onVolver,
  onSalir,
  textos,
  urlLogin = '/auth/login',
}: ModalSalirSinGuardarProps) {
  return (
    <Modal
      abierto={abierto}
      onCerrar={onCerrar}
      titulo={textos.titulo}
      descripcion={`${textos.parrafo_1} ${textos.parrafo_2}`}
      tamano="md"
    >
      <div
        className="mb-6 text-sm leading-relaxed space-y-3"
        style={{ color: 'var(--color-texto-secundario)' }}
      >
        <p>{textos.parrafo_1}</p>
        <p>{textos.parrafo_2}</p>
      </div>

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={onVolver}
          className="w-full py-3 px-4 rounded-lg text-sm font-semibold"
          style={{
            backgroundColor: 'var(--color-primario)',
            color: '#ffffff',
          }}
        >
          {textos.boton_volver}
        </button>

        <button
          type="button"
          onClick={onSalir}
          className="w-full py-3 px-4 rounded-lg text-sm font-semibold border"
          style={{
            backgroundColor: 'transparent',
            color: 'var(--color-texto-primario)',
            borderColor: 'var(--color-borde-fuerte)',
          }}
        >
          {textos.boton_salir}
        </button>

        <Link
          href={urlLogin}
          className="block text-center text-sm font-semibold py-2"
          style={{ color: 'var(--color-primario)' }}
          onClick={onCerrar}
        >
          {textos.link_sesion}
        </Link>
      </div>
    </Modal>
  );
}
