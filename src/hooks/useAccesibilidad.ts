'use client';

/**
 * Hook que sincroniza el estado del store de accesibilidad
 * con atributos data-* en el elemento <html> para que los estilos CSS los lean.
 * También aplica el estado persistido en localStorage al recargar la pagina.
 */

import { useEffect } from 'react';
import { useAccesibilidadStore } from '@/store/accesibilidadStore';

export function useAccesibilidad() {
  const { alto_contraste, tamano_texto, reducir_animaciones } =
    useAccesibilidadStore();

  useEffect(() => {
    document.documentElement.setAttribute(
      'data-alto-contraste',
      alto_contraste ? 'true' : 'false'
    );
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

  return { alto_contraste, tamano_texto, reducir_animaciones };
}
