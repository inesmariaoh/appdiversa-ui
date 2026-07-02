'use client';

/**
 * Barra de herramientas de accesibilidad.
 * Permite al usuario activar: alto contraste, aumento/disminucion de texto,
 * reducir animaciones y lengua de senas (si esta habilitada desde API).
 * WCAG 2.1 AAA - todos los controles son accesibles por teclado.
 */

import { useAccesibilidadStore } from '@/store/accesibilidadStore';

interface BarraAccesibilidadProps {
  readonly lenguaSenasHabilitada?: boolean;
  readonly urlLenguaSenas?: string | null;
  readonly textoLenguaSenas?: string | null;
}

export function BarraAccesibilidad({
  lenguaSenasHabilitada = false,
  urlLenguaSenas = null,
  textoLenguaSenas = 'Lengua de señas',
}: BarraAccesibilidadProps) {
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

  const estaModificado =
    alto_contraste || tamano_texto !== 'normal' || reducir_animaciones;

  function manejarLenguaSenas() {
    if (lenguaSenasHabilitada && urlLenguaSenas) {
      window.open(urlLenguaSenas, '_blank', 'noopener,noreferrer');
    }
  }

  const puedeDisminuirTexto = tamano_texto !== 'normal';
  const puedeAumentarTexto = tamano_texto !== 'muy_grande';

  return (
    <div
      role="toolbar"
      aria-label="Herramientas de accesibilidad"
      className="w-full flex items-center justify-end gap-2 px-4 py-1.5 text-xs"
      style={{
        backgroundColor: 'var(--color-primario)',
        color: 'var(--color-texto-invertido)',
      }}
    >
      <span className="mr-2 text-xs opacity-80" aria-hidden="true">
        Accesibilidad:
      </span>

      {/* Alto contraste */}
      <button
        type="button"
        onClick={alto_contraste ? desactivarAltoContraste : activarAltoContraste}
        aria-pressed={alto_contraste}
        aria-label={
          alto_contraste ? 'Desactivar alto contraste' : 'Activar alto contraste'
        }
        className="flex items-center gap-1 px-2 py-1 rounded border border-white/40 hover:bg-white/20 transition-colors"
        style={{ minHeight: '32px' }}
      >
        <IconoContraste aria-hidden={true} />
        <span>Contraste</span>
      </button>

      {/* Reducir tamano de texto */}
      <button
        type="button"
        onClick={disminuirTexto}
        disabled={!puedeDisminuirTexto}
        aria-label="Reducir tamaño de texto"
        aria-disabled={!puedeDisminuirTexto}
        className="flex items-center justify-center px-2 py-1 rounded border border-white/40 hover:bg-white/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ minHeight: '32px', minWidth: '32px' }}
      >
        <span aria-hidden="true" className="font-bold text-sm">A-</span>
      </button>

      {/* Aumentar tamano de texto */}
      <button
        type="button"
        onClick={aumentarTexto}
        disabled={!puedeAumentarTexto}
        aria-label="Aumentar tamaño de texto"
        aria-disabled={!puedeAumentarTexto}
        className="flex items-center justify-center px-2 py-1 rounded border border-white/40 hover:bg-white/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ minHeight: '32px', minWidth: '32px' }}
      >
        <span aria-hidden="true" className="font-bold text-base">A+</span>
      </button>

      {/* Reducir animaciones */}
      <button
        type="button"
        onClick={
          reducir_animaciones
            ? desactivarReducirAnimaciones
            : activarReducirAnimaciones
        }
        aria-pressed={reducir_animaciones}
        aria-label={
          reducir_animaciones
            ? 'Desactivar reducción de animaciones'
            : 'Activar reducción de animaciones'
        }
        className="flex items-center gap-1 px-2 py-1 rounded border border-white/40 hover:bg-white/20 transition-colors"
        style={{ minHeight: '32px' }}
      >
        <IconoAnimacion aria-hidden={true} />
        <span>Sin animaciones</span>
      </button>

      {/* Restablecer */}
      <button
        type="button"
        onClick={resetearAccesibilidad}
        disabled={!estaModificado}
        aria-label="Restablecer configuración de accesibilidad"
        aria-disabled={!estaModificado}
        className="flex items-center gap-1 px-2 py-1 rounded border border-white/40 hover:bg-white/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ minHeight: '32px' }}
      >
        <IconoRestablecer aria-hidden={true} />
        <span>Restablecer</span>
      </button>

      {/* Lengua de senas */}
      <button
        type="button"
        onClick={manejarLenguaSenas}
        disabled={!lenguaSenasHabilitada}
        aria-label={
          lenguaSenasHabilitada
            ? textoLenguaSenas ?? 'Ver en lengua de señas'
            : 'Lengua de señas no disponible'
        }
        aria-disabled={!lenguaSenasHabilitada}
        className="flex items-center gap-1 px-2 py-1 rounded border border-white/40 hover:bg-white/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ minHeight: '32px' }}
      >
        <IconoManos aria-hidden={true} />
        <span className="solo-lector-pantalla">{textoLenguaSenas}</span>
      </button>
    </div>
  );
}

function IconoContraste({ 'aria-hidden': ariaHidden }: { 'aria-hidden'?: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden={ariaHidden}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a10 10 0 0 1 0 20z" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconoRestablecer({ 'aria-hidden': ariaHidden }: { 'aria-hidden'?: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden={ariaHidden}>
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

function IconoAnimacion({ 'aria-hidden': ariaHidden }: { 'aria-hidden'?: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden={ariaHidden}>
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function IconoManos({ 'aria-hidden': ariaHidden }: { 'aria-hidden'?: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden={ariaHidden}>
      <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
      <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
      <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
      <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
    </svg>
  );
}
