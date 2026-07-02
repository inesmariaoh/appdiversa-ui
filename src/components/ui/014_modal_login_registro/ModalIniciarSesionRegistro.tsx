'use client';

/**
 * Modal para promover login o registro al usuario anonimo.
 */

import Link from 'next/link';
import { Modal } from '@/components/ui/011_modal';
import type { TextosModalSesion } from '@/types/interfaz';

interface ModalIniciarSesionRegistroProps {
  readonly abierto: boolean;
  readonly onCerrar: () => void;
  readonly textos: TextosModalSesion;
  readonly urlLogin?: string;
  readonly urlRegistro?: string;
}

export function ModalIniciarSesionRegistro({
  abierto,
  onCerrar,
  textos,
  urlLogin = '/auth/login',
  urlRegistro = '/auth/registro',
}: ModalIniciarSesionRegistroProps) {
  return (
    <Modal
      abierto={abierto}
      onCerrar={onCerrar}
      titulo={textos.titulo}
      descripcion={textos.parrafo}
      tamano="md"
    >
      <p
        className="mb-6 text-sm leading-relaxed"
        style={{ color: 'var(--color-texto-secundario)' }}
      >
        {textos.parrafo}
      </p>

      <div className="flex flex-col gap-3">
        <Link
          href={urlLogin}
          className="block w-full py-3 px-4 rounded-lg text-sm font-semibold text-center"
          style={{
            backgroundColor: 'var(--color-primario)',
            color: '#ffffff',
          }}
          onClick={onCerrar}
        >
          {textos.boton_login}
        </Link>

        <Link
          href={urlRegistro}
          className="block w-full py-3 px-4 rounded-lg text-sm font-semibold text-center border"
          style={{
            backgroundColor: 'transparent',
            color: 'var(--color-primario)',
            borderColor: 'var(--color-primario)',
          }}
          onClick={onCerrar}
        >
          {textos.boton_registro}
        </Link>

        <button
          type="button"
          onClick={onCerrar}
          className="block w-full text-sm font-semibold py-2 text-center"
          style={{ color: 'var(--color-texto-secundario)' }}
        >
          {textos.link_cancelar}
        </button>
      </div>
    </Modal>
  );
}
