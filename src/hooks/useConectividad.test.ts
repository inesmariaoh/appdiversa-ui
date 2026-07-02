import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useConectividad } from './useConectividad';
import { useOfflineStore } from '@/store/offlineStore';
import { verificarSaludApi } from '@/services/saludServicio';

vi.mock('@/services/saludServicio', () => ({
  verificarSaludApi: vi.fn(),
}));

describe('useConectividad', () => {
  beforeEach(() => {
    useOfflineStore.setState({ enLinea: true });
    vi.mocked(verificarSaludApi).mockResolvedValue(true);
    Object.defineProperty(window.navigator, 'onLine', { value: true, configurable: true });
  });

  it('actualiza enLinea segun salud del backend', async () => {
    const { result } = renderHook(() => useConectividad());

    await waitFor(() => {
      expect(verificarSaludApi).toHaveBeenCalled();
      expect(useOfflineStore.getState().enLinea).toBe(true);
    });

    expect(result.current).toBe(true);
  });

  it('marca offline cuando navigator.onLine es false', async () => {
    Object.defineProperty(window.navigator, 'onLine', { value: false, configurable: true });

    renderHook(() => useConectividad());

    await waitFor(() => {
      expect(useOfflineStore.getState().enLinea).toBe(false);
    });
  });

  it('revalida al disparar evento online', async () => {
    vi.mocked(verificarSaludApi).mockResolvedValueOnce(false).mockResolvedValueOnce(true);

    renderHook(() => useConectividad());

    await waitFor(() => {
      expect(useOfflineStore.getState().enLinea).toBe(false);
    });

    act(() => {
      window.dispatchEvent(new Event('online'));
    });

    await waitFor(() => {
      expect(useOfflineStore.getState().enLinea).toBe(true);
    });
  });
});
