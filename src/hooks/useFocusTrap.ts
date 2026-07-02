'use client';

/**
 * Hook para confinar el foco dentro de un contenedor modal o drawer.
 */

import { useEffect, type RefObject } from 'react';

const SELECTOR_ENFOCABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function useFocusTrap(
  contenedorRef: RefObject<HTMLElement | null>,
  activo: boolean
) {
  useEffect(() => {
    if (!activo || !contenedorRef.current) return;

    const contenedor = contenedorRef.current;
    const elementoPrevio = document.activeElement as HTMLElement | null;

    const enfocables = () =>
      Array.from(contenedor.querySelectorAll<HTMLElement>(SELECTOR_ENFOCABLE)).filter(
        (el) => !el.hasAttribute('disabled') && el.offsetParent !== null
      );

    const primerEnfocable = enfocables()[0];
    primerEnfocable?.focus();

    function manejarTecla(evento: KeyboardEvent) {
      if (evento.key !== 'Tab') return;
      const elementos = enfocables();
      if (elementos.length === 0) return;

      const primero = elementos[0];
      const ultimo = elementos[elementos.length - 1];

      if (evento.shiftKey && document.activeElement === primero) {
        evento.preventDefault();
        ultimo.focus();
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault();
        primero.focus();
      }
    }

    contenedor.addEventListener('keydown', manejarTecla);

    return () => {
      contenedor.removeEventListener('keydown', manejarTecla);
      elementoPrevio?.focus();
    };
  }, [activo, contenedorRef]);
}
