import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLectorVoz } from './useLectorVoz';

class UtteranceFalsa {
  text: string;
  lang = '';
  rate = 1;
  onend: (() => void) | null = null;
  onerror: (() => void) | null = null;

  constructor(text: string) {
    this.text = text;
  }
}

describe('useLectorVoz', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('marca no soportado cuando la API de voz no existe', () => {
    vi.stubGlobal('speechSynthesis', undefined);
    const { result } = renderHook(() => useLectorVoz());
    expect(result.current.soportado).toBe(false);
  });

  it('lee texto usando el sintetizador cuando esta soportado', () => {
    const speak = vi.fn();
    const cancel = vi.fn();
    vi.stubGlobal('speechSynthesis', { speak, cancel });
    vi.stubGlobal('SpeechSynthesisUtterance', UtteranceFalsa);

    const { result } = renderHook(() => useLectorVoz());
    expect(result.current.soportado).toBe(true);

    act(() => result.current.leer('Hola mundo'));

    expect(cancel).toHaveBeenCalled();
    expect(speak).toHaveBeenCalledTimes(1);
    const enunciado = speak.mock.calls[0][0] as UtteranceFalsa;
    expect(enunciado.text).toBe('Hola mundo');
    expect(enunciado.lang).toBe('es-CO');
    expect(result.current.hablando).toBe(true);
  });

  it('ignora texto vacio', () => {
    const speak = vi.fn();
    vi.stubGlobal('speechSynthesis', { speak, cancel: vi.fn() });
    vi.stubGlobal('SpeechSynthesisUtterance', UtteranceFalsa);

    const { result } = renderHook(() => useLectorVoz());
    act(() => result.current.leer('   '));

    expect(speak).not.toHaveBeenCalled();
  });

  it('detiene la lectura en curso', () => {
    const cancel = vi.fn();
    vi.stubGlobal('speechSynthesis', { speak: vi.fn(), cancel });
    vi.stubGlobal('SpeechSynthesisUtterance', UtteranceFalsa);

    const { result } = renderHook(() => useLectorVoz());
    act(() => result.current.detener());

    expect(cancel).toHaveBeenCalled();
    expect(result.current.hablando).toBe(false);
  });
});
