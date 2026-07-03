import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useComandosVoz, type ComandoVoz } from './useComandosVoz';

interface EventoFalso {
  results: { transcript: string }[][];
}

let instanciaActual: ReconocimientoFalso | null = null;

class ReconocimientoFalso {
  lang = '';
  continuous = false;
  interimResults = false;
  onresult: ((evento: EventoFalso) => void) | null = null;
  onend: (() => void) | null = null;
  onerror: (() => void) | null = null;
  start = vi.fn();
  stop = vi.fn();

  constructor() {
    instanciaActual = this;
  }

  emitir(transcript: string) {
    this.onresult?.({ results: [[{ transcript }]] });
  }
}

describe('useComandosVoz', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    instanciaActual = null;
  });

  it('marca no soportado cuando la API no existe', () => {
    vi.stubGlobal('SpeechRecognition', undefined);
    vi.stubGlobal('webkitSpeechRecognition', undefined);

    const { result } = renderHook(() => useComandosVoz([]));
    expect(result.current.soportado).toBe(false);
  });

  it('ejecuta la accion del comando reconocido', () => {
    vi.stubGlobal('SpeechRecognition', ReconocimientoFalso);
    const siguiente = vi.fn();
    const comandos: ComandoVoz[] = [
      { patrones: ['siguiente', 'avanzar'], accion: siguiente },
    ];

    const { result } = renderHook(() => useComandosVoz(comandos));
    expect(result.current.soportado).toBe(true);

    act(() => result.current.iniciar());
    expect(instanciaActual?.start).toHaveBeenCalled();
    expect(result.current.escuchando).toBe(true);

    act(() => instanciaActual?.emitir('Siguiente'));
    expect(siguiente).toHaveBeenCalledTimes(1);
  });

  it('ignora frases sin coincidencia', () => {
    vi.stubGlobal('SpeechRecognition', ReconocimientoFalso);
    const accion = vi.fn();

    renderHook(() => useComandosVoz([{ patrones: ['leer'], accion }]));
    act(() => instanciaActual?.emitir('color azul'));

    expect(accion).not.toHaveBeenCalled();
  });

  it('detiene el reconocimiento', () => {
    vi.stubGlobal('SpeechRecognition', ReconocimientoFalso);

    const { result } = renderHook(() => useComandosVoz([]));
    act(() => result.current.detener());

    expect(instanciaActual?.stop).toHaveBeenCalled();
    expect(result.current.escuchando).toBe(false);
  });
});
