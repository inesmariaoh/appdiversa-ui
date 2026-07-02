'use client';

/**
 * Barra de accesibilidad flotante, fija al lado derecho de la pantalla.
 * Se expande en hover/focus mostrando el texto de cada accion.
 * Inspirada en la barra de sen.gov.co — implementacion propia con semantica WCAG 2.1 AAA.
 *
 * Botones: Contraste | A+ | A- | Sin animaciones | Restablecer | Lengua senas (condicional)
 */

import { useEffect } from 'react';
import { useAccesibilidadStore } from '@/store/accesibilidadStore';

interface BarraFlotanteProps {
  readonly lenguaSenasHabilitada?: boolean;
  readonly urlLenguaSenas?: string | null;
  readonly textoLenguaSenas?: string | null;
}

export function BarraFlotante({
  lenguaSenasHabilitada = false,
  urlLenguaSenas = null,
  textoLenguaSenas = 'Lengua de señas',
}: BarraFlotanteProps) {
  const {
    alto_contraste,
    tamano_texto,
    reducir_animaciones,
    activarAltoContraste,
    desactivarAltoContraste,
    aumentarTexto,
    disminuirTexto,
    activarReducirAnimaciones,
    desactivarReducirAnimaciones,
    resetearAccesibilidad,
  } = useAccesibilidadStore();

  const puedeAumentarTexto = tamano_texto !== 'muy_grande';
  const puedeDisminuirTexto = tamano_texto !== 'normal';
  const estaModificado =
    alto_contraste || tamano_texto !== 'normal' || reducir_animaciones;

  // Sincroniza directamente con el DOM desde este componente,
  // sin depender de ProveedorAccesibilidad como intermediario.
  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute('data-alto-contraste', alto_contraste ? 'true' : 'false');
  }, [alto_contraste]);

  useEffect(() => {
    document.documentElement.setAttribute('data-tamano-texto', tamano_texto);
  }, [tamano_texto]);

  useEffect(() => {
    document.documentElement.setAttribute(
      'data-reducir-animaciones',
      reducir_animaciones ? 'true' : 'false'
    );
  }, [reducir_animaciones]);

  function manejarLenguaSenas() {
    if (lenguaSenasHabilitada && urlLenguaSenas) {
      window.open(urlLenguaSenas, '_blank', 'noopener,noreferrer');
    }
  }

  return (
    <nav
      className="barra-flotante"
      aria-label="Herramientas de accesibilidad"
    >
      {/* Alto contraste */}
      <button
        type="button"
        className="barra-flotante-btn"
        onClick={alto_contraste ? desactivarAltoContraste : activarAltoContraste}
        aria-pressed={alto_contraste}
        aria-label={alto_contraste ? 'Desactivar alto contraste' : 'Activar alto contraste'}
        title={alto_contraste ? 'Desactivar alto contraste' : 'Activar alto contraste'}
      >
        <span className="barra-flotante-texto">Alto Contraste</span>
        <span className="barra-flotante-icono" aria-hidden="true">
          <IconoContraste />
        </span>
      </button>

      {/* Aumentar texto */}
      <button
        type="button"
        className="barra-flotante-btn"
        onClick={aumentarTexto}
        disabled={!puedeAumentarTexto}
        aria-label="Aumentar tamaño de texto"
        aria-disabled={!puedeAumentarTexto}
        title="Aumentar tamaño de texto"
      >
        <span className="barra-flotante-texto">Aumentar letra</span>
        <span className="barra-flotante-icono" aria-hidden="true">
          A<sup>+</sup>
        </span>
      </button>

      {/* Reducir texto */}
      <button
        type="button"
        className="barra-flotante-btn"
        onClick={disminuirTexto}
        disabled={!puedeDisminuirTexto}
        aria-label="Reducir tamaño de texto"
        aria-disabled={!puedeDisminuirTexto}
        title="Reducir tamaño de texto"
      >
        <span className="barra-flotante-texto">Reducir letra</span>
        <span className="barra-flotante-icono" aria-hidden="true">
          A<sup>-</sup>
        </span>
      </button>

      {/* Reducir animaciones */}
      <button
        type="button"
        className="barra-flotante-btn"
        onClick={reducir_animaciones ? desactivarReducirAnimaciones : activarReducirAnimaciones}
        aria-pressed={reducir_animaciones}
        aria-label={reducir_animaciones ? 'Desactivar reducción de animaciones' : 'Activar reducción de animaciones'}
        title={reducir_animaciones ? 'Desactivar reducción de animaciones' : 'Sin animaciones'}
      >
        <span className="barra-flotante-texto">Sin animaciones</span>
        <span className="barra-flotante-icono" aria-hidden="true">
          <IconoAnimacion />
        </span>
      </button>

      {/* Restablecer */}
      <button
        type="button"
        className="barra-flotante-btn"
        onClick={resetearAccesibilidad}
        disabled={!estaModificado}
        aria-label="Restablecer configuración de accesibilidad"
        aria-disabled={!estaModificado}
        title="Restablecer configuración"
      >
        <span className="barra-flotante-texto">Restablecer</span>
        <span className="barra-flotante-icono" aria-hidden="true">
          <IconoRestablecer />
        </span>
      </button>

      {/* Lengua de senas — solo si la API lo habilita */}
      {lenguaSenasHabilitada && (
        <>
          <div className="barra-flotante-separador" role="separator" />
          <button
            type="button"
            className="barra-flotante-btn"
            onClick={manejarLenguaSenas}
            aria-label={textoLenguaSenas ?? 'Ver en lengua de señas'}
            title={textoLenguaSenas ?? 'Lengua de señas'}
          >
            <span className="barra-flotante-texto">
              {textoLenguaSenas ?? 'Lengua de señas'}
            </span>
            <span className="barra-flotante-icono" aria-hidden="true">
              <IconoManos />
            </span>
          </button>
        </>
      )}
    </nav>
  );
}

/* ---- Iconos SVG ---- */

function IconoContraste() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a10 10 0 0 1 0 20z" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconoAnimacion() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
    </svg>
  );
}

function IconoRestablecer() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

function IconoManos() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 11V6a2 2 0 0 0-4 0v0" />
      <path d="M14 10V4a2 2 0 0 0-4 0v2" />
      <path d="M10 10.5V6a2 2 0 0 0-4 0v8" />
      <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
    </svg>
  );
}
