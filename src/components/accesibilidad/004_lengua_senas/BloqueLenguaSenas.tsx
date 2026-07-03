'use client';

/**
 * Disparador y panel de video en lengua de senas para instrucciones o
 * contenidos. Se muestra unicamente cuando la bandera de accesibilidad esta
 * habilitada y existe una URL de video parametrizada en la configuracion de
 * interfaz, sin requerir cambios en el codigo.
 */

import { useState } from 'react';
import { useInterfazStore } from '@/store/interfazStore';
import { PanelLenguaSenas } from './PanelLenguaSenas';

const ETIQUETA_POR_DEFECTO = 'Ver en lengua de señas';

export function BloqueLenguaSenas() {
  const configuracion = useInterfazStore((estado) => estado.configuracion);
  const [abierto, setAbierto] = useState(false);

  const habilitado = configuracion?.accesibilidad?.lengua_senas_habilitada ?? false;
  const urlVideo = configuracion?.url_lengua_senas ?? null;

  if (!habilitado || !urlVideo) {
    return null;
  }

  const etiqueta = configuracion?.texto_lengua_senas?.trim() || ETIQUETA_POR_DEFECTO;

  return (
    <div className="mb-6">
      <button
        type="button"
        className="boton-lengua-senas"
        onClick={() => setAbierto(true)}
      >
        <span className="boton-lengua-senas-icono" aria-hidden="true">
          <IconoSenas />
        </span>
        <span>{etiqueta}</span>
      </button>
      <PanelLenguaSenas
        urlVideo={urlVideo}
        titulo={etiqueta}
        abierto={abierto}
        onCerrar={() => setAbierto(false)}
      />
    </div>
  );
}

function IconoSenas() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 11V6a2 2 0 0 0-4 0" />
      <path d="M14 10V4a2 2 0 0 0-4 0v2" />
      <path d="M10 10.5V6a2 2 0 0 0-4 0v8" />
      <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2a8 8 0 0 1-6.4-3.2l-2.1-2.8" />
    </svg>
  );
}
