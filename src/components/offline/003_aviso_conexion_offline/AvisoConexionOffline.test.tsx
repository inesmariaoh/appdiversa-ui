/**
 * Componente de aviso offline sin acciones manuales del usuario.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AvisoConexionOffline } from './AvisoConexionOffline';
import { useOfflineStore } from '@/store/offlineStore';

describe('AvisoConexionOffline', () => {
  beforeEach(() => {
    useOfflineStore.setState({
      enLinea: true,
      finalizacionPendiente: false,
    });
  });

  it('no muestra aviso cuando hay conexion y no hay envio pendiente', () => {
    const { container } = render(<AvisoConexionOffline />);
    expect(container).toBeEmptyDOMElement();
  });

  it('informa al usuario cuando no hay conexion', () => {
    useOfflineStore.setState({ enLinea: false });
    render(<AvisoConexionOffline />);
    expect(
      screen.getByText(/se enviarán automáticamente cuando se restablezca la conexión/i),
    ).toBeInTheDocument();
  });

  it('informa envio automatico cuando hay finalizacion pendiente en linea', () => {
    useOfflineStore.setState({ enLinea: true, finalizacionPendiente: true });
    render(<AvisoConexionOffline />);
    expect(screen.getByText(/Enviando su formulario/i)).toBeInTheDocument();
  });
});
