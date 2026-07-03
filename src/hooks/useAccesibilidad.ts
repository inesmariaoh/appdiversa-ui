'use client';

/**
 * Hook que sincroniza el estado del store de accesibilidad
 * con atributos data-* en el elemento <html> para que los estilos CSS los lean.
 * También aplica el estado persistido en localStorage al recargar la pagina.
 */

import { useEffect } from 'react';
import { useAccesibilidadStore } from '@/store/accesibilidadStore';

export function useAccesibilidad() {
  const {
    alto_contraste,
    tamano_texto,
    reducir_animaciones,
    tema,
    fuente_dislexia,
    lectura_facil,
  } = useAccesibilidadStore();

  useEffect(() => {
    document.documentElement.dataset.altoContraste = alto_contraste
      ? 'true'
      : 'false';
  }, [alto_contraste]);

  useEffect(() => {
    document.documentElement.dataset.tamanoTexto = tamano_texto;
  }, [tamano_texto]);

  useEffect(() => {
    document.documentElement.dataset.reducirAnimaciones = reducir_animaciones
      ? 'true'
      : 'false';
  }, [reducir_animaciones]);

  useEffect(() => {
    document.documentElement.dataset.tema = tema;
  }, [tema]);

  useEffect(() => {
    document.documentElement.dataset.fuenteDislexia = fuente_dislexia
      ? 'true'
      : 'false';
  }, [fuente_dislexia]);

  useEffect(() => {
    document.documentElement.dataset.lecturaFacil = lectura_facil
      ? 'true'
      : 'false';
  }, [lectura_facil]);

  return {
    alto_contraste,
    tamano_texto,
    reducir_animaciones,
    tema,
    fuente_dislexia,
    lectura_facil,
  };
}
