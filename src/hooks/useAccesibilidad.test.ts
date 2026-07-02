import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAccesibilidad } from './useAccesibilidad';
import { useAccesibilidadStore } from '@/store/accesibilidadStore';

describe('useAccesibilidad', () => {
  beforeEach(() => {
    useAccesibilidadStore.setState({
      alto_contraste: true,
      tamano_texto: 'grande',
      reducir_animaciones: true,
    });
    document.documentElement.removeAttribute('data-alto-contraste');
    document.documentElement.removeAttribute('data-tamano-texto');
    document.documentElement.removeAttribute('data-reducir-animaciones');
  });

  it('sincroniza atributos data-* en html', () => {
    const { result } = renderHook(() => useAccesibilidad());

    expect(result.current.alto_contraste).toBe(true);
    expect(document.documentElement.getAttribute('data-alto-contraste')).toBe('true');
    expect(document.documentElement.getAttribute('data-tamano-texto')).toBe('grande');
    expect(document.documentElement.getAttribute('data-reducir-animaciones')).toBe('true');
  });
});
