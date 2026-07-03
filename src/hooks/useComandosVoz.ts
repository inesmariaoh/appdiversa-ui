'use client';

/**
 * Hook de comandos de voz basado en la Web Speech API (SpeechRecognition).
 * Reconoce frases habladas en espanol y ejecuta la accion asociada al primer
 * comando cuyos patrones coincidan. Degrada con elegancia cuando el navegador
 * no soporta reconocimiento de voz (soportado = falso).
 *
 * El reconocimiento de voz requiere HTTPS y permiso del microfono. Este hook
 * expone las primitivas; la asociacion de comandos concretos se define desde
 * el componente que lo utiliza, de forma reutilizable.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const IDIOMA_POR_DEFECTO = 'es-CO';

export interface ComandoVoz {
  /** Frases o palabras clave que activan la accion (en minusculas). */
  readonly patrones: readonly string[];
  /** Accion a ejecutar cuando se reconoce el comando. */
  readonly accion: () => void;
}

interface AlternativaReconocimiento {
  readonly transcript: string;
}

interface EventoReconocimiento {
  readonly results: ArrayLike<ArrayLike<AlternativaReconocimiento>>;
}

interface ReconocimientoVoz {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((evento: EventoReconocimiento) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
}

type ConstructorReconocimiento = new () => ReconocimientoVoz;

export interface ComandosVoz {
  soportado: boolean;
  escuchando: boolean;
  iniciar: () => void;
  detener: () => void;
}

function obtenerConstructorReconocimiento(): ConstructorReconocimiento | null {
  const ventana = globalThis.window as unknown as Record<string, unknown>;
  if (ventana === undefined) {
    return null;
  }
  const candidato =
    ventana.SpeechRecognition ?? ventana.webkitSpeechRecognition;
  return (candidato as ConstructorReconocimiento) ?? null;
}

function normalizarTexto(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function extraerTranscripcion(evento: EventoReconocimiento): string {
  const resultados = evento.results;
  const ultimo = resultados[resultados.length - 1];
  if (ultimo === undefined) {
    return '';
  }
  return ultimo[0]?.transcript ?? '';
}

function encontrarComando(
  transcripcion: string,
  comandos: readonly ComandoVoz[]
): ComandoVoz | null {
  const normalizada = normalizarTexto(transcripcion);
  if (normalizada.length === 0) {
    return null;
  }
  return (
    comandos.find((comando) =>
      comando.patrones.some((patron) =>
        normalizada.includes(normalizarTexto(patron))
      )
    ) ?? null
  );
}

export function useComandosVoz(
  comandos: readonly ComandoVoz[],
  idioma: string = IDIOMA_POR_DEFECTO
): ComandosVoz {
  const [escuchando, setEscuchando] = useState(false);
  const reconocimientoRef = useRef<ReconocimientoVoz | null>(null);
  const comandosRef = useRef(comandos);
  comandosRef.current = comandos;

  const constructor = useMemo(() => obtenerConstructorReconocimiento(), []);
  const soportado = constructor !== null;

  useEffect(() => {
    if (constructor === null) {
      return;
    }
    const reconocimiento = new constructor();
    reconocimiento.lang = idioma;
    reconocimiento.continuous = true;
    reconocimiento.interimResults = false;
    reconocimiento.onresult = (evento) => {
      const comando = encontrarComando(
        extraerTranscripcion(evento),
        comandosRef.current
      );
      comando?.accion();
    };
    reconocimiento.onend = () => setEscuchando(false);
    reconocimiento.onerror = () => setEscuchando(false);
    reconocimientoRef.current = reconocimiento;
    return () => {
      reconocimiento.stop();
      reconocimientoRef.current = null;
    };
  }, [constructor, idioma]);

  const iniciar = useCallback(() => {
    const reconocimiento = reconocimientoRef.current;
    if (reconocimiento === null) {
      return;
    }
    reconocimiento.start();
    setEscuchando(true);
  }, []);

  const detener = useCallback(() => {
    reconocimientoRef.current?.stop();
    setEscuchando(false);
  }, []);

  return { soportado, escuchando, iniciar, detener };
}
