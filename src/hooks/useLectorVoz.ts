'use client';

/**
 * Hook de lectura por voz (texto a voz) basado en la Web Speech API nativa
 * del navegador (SpeechSynthesis). No requiere dependencias externas ni costos.
 * Degrada con elegancia: si el navegador no soporta la API, `soportado` es
 * falso y las acciones no producen efecto.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

const IDIOMA_POR_DEFECTO = 'es-CO';
const VELOCIDAD_POR_DEFECTO = 1;

export interface OpcionesLectura {
  idioma?: string;
  velocidad?: number;
}

export interface LectorVoz {
  /** Indica si el navegador soporta sintesis de voz. */
  soportado: boolean;
  /** Indica si hay una lectura en curso. */
  hablando: boolean;
  /** Lee en voz alta el texto indicado; cancela cualquier lectura previa. */
  leer: (texto: string, opciones?: OpcionesLectura) => void;
  /** Detiene la lectura en curso. */
  detener: () => void;
}

function obtenerSintetizador(): SpeechSynthesis | null {
  if (globalThis.window === undefined) {
    return null;
  }
  return globalThis.window.speechSynthesis ?? null;
}

function soportaSintesis(sintetizador: SpeechSynthesis | null): boolean {
  return (
    sintetizador !== null &&
    globalThis.window?.SpeechSynthesisUtterance !== undefined
  );
}

export function useLectorVoz(): LectorVoz {
  const [hablando, setHablando] = useState(false);
  const [soportado, setSoportado] = useState(false);
  const sintetizadorRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    const sintetizador = obtenerSintetizador();
    sintetizadorRef.current = sintetizador;
    setSoportado(soportaSintesis(sintetizador));
    return () => {
      sintetizador?.cancel();
    };
  }, []);

  const detener = useCallback(() => {
    sintetizadorRef.current?.cancel();
    setHablando(false);
  }, []);

  const leer = useCallback((texto: string, opciones?: OpcionesLectura) => {
    const sintetizador = sintetizadorRef.current;
    const contenido = texto.trim();
    if (sintetizador === null || contenido.length === 0) {
      return;
    }
    sintetizador.cancel();
    const enunciado = new SpeechSynthesisUtterance(contenido);
    enunciado.lang = opciones?.idioma ?? IDIOMA_POR_DEFECTO;
    enunciado.rate = opciones?.velocidad ?? VELOCIDAD_POR_DEFECTO;
    enunciado.onend = () => setHablando(false);
    enunciado.onerror = () => setHablando(false);
    setHablando(true);
    sintetizador.speak(enunciado);
  }, []);

  return { soportado, hablando, leer, detener };
}
