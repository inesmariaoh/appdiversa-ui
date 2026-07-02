import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useIdioma } from './useIdioma';
import { useIdiomaStore } from '@/store/idiomaStore';

const refreshMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: refreshMock }),
}));

vi.mock('@/services/internacionalizacionServicio', () => ({
  obtenerTraducciones: vi.fn().mockResolvedValue([
    { entidad: 'app', campo: 'titulo', valor: 'Inicio', idioma: 'es' },
  ]),
}));

import { leerCookieAccesibilidad, establecerCookieAccesibilidad } from '@/utils/idiomaCookie';

vi.mock('@/utils/idiomaCookie', () => ({
  leerCookieIdioma: vi.fn(() => null),
  leerCookieAccesibilidad: vi.fn(() => false),
  establecerCookieIdioma: vi.fn(),
  establecerCookieAccesibilidad: vi.fn(),
}));

describe('useIdioma', () => {
  beforeEach(() => {
    refreshMock.mockReset();
    useIdiomaStore.setState({
      idioma: 'es',
      incluirAccesibilidad: false,
      traducciones: {},
      cargandoTraducciones: false,
    });
  });

  it('carga traducciones y expone traducir', async () => {
    const { result } = renderHook(() => useIdioma());

    await waitFor(() => {
      expect(result.current.traducir('app.titulo', 'Inicio')).toBe('Inicio');
    });
  });

  it('cambia idioma y refresca la pagina', () => {
    const { result } = renderHook(() => useIdioma());

    act(() => {
      result.current.establecerIdioma('en');
    });

    expect(useIdiomaStore.getState().idioma).toBe('en');
    expect(refreshMock).toHaveBeenCalled();
  });

  it('alterna accesibilidad y refresca', () => {
    vi.mocked(establecerCookieAccesibilidad).mockImplementation((valor) => {
      vi.mocked(leerCookieAccesibilidad).mockReturnValue(valor);
    });

    const { result } = renderHook(() => useIdioma());

    act(() => {
      result.current.alternarAccesibilidad();
    });

    expect(useIdiomaStore.getState().incluirAccesibilidad).toBe(true);
    expect(establecerCookieAccesibilidad).toHaveBeenCalledWith(true);
    expect(refreshMock).toHaveBeenCalled();
  });
});
