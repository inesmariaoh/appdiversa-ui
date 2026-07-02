import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EstadoSincronizacion } from './EstadoSincronizacion';
import { useOfflineStore } from '@/store/offlineStore';

describe('EstadoSincronizacion', () => {
  beforeEach(() => {
    useOfflineStore.setState({
      operacionesPendientes: 2,
      sincronizando: false,
      enLinea: true,
      ultimoResultado: null,
    });
  });

  it('muestra textos de sincronizacion con ortografia correcta', () => {
    render(<EstadoSincronizacion />);

    expect(screen.getByText(/pendiente de sincronizar/i)).toBeInTheDocument();
    expect(screen.getByText(/2 operación\(es\)/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /reintentar sincronización/i }),
    ).toBeInTheDocument();
  });

  it('informa conflictos y errores en ultimo lote', () => {
    useOfflineStore.setState({
      ultimoResultado: {
        operaciones_procesadas: 1,
        operaciones_actualizadas: 1,
        duplicadas: 0,
        errores: [{ uuid_local: '1', mensaje: 'Error' }],
        conflictos: [{ uuid_local: '2', mensaje: 'Conflicto', respuesta_id: null }],
      },
    });

    render(<EstadoSincronizacion />);

    expect(screen.getByText(/conflictos en último lote/i)).toBeInTheDocument();
    expect(screen.getByText(/errores en último lote/i)).toBeInTheDocument();
  });
});
