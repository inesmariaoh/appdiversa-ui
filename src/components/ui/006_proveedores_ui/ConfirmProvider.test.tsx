import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmProvider } from './ConfirmProvider';
import { useUiStore } from '@/store/uiStore';

describe('ConfirmProvider', () => {
  beforeEach(() => {
    useUiStore.setState({ confirmacion: null });
  });

  it('no renderiza cuando no hay confirmacion pendiente', () => {
    const { container } = render(<ConfirmProvider />);
    expect(container).toBeEmptyDOMElement();
  });

  it('muestra titulo, mensaje y botones con la paleta de marca', () => {
    useUiStore.setState({
      confirmacion: {
        titulo: 'Confirmar envío',
        mensaje: '¿Desea enviar el formulario?',
        etiquetaConfirmar: 'Enviar',
        etiquetaCancelar: 'Cancelar',
        resolver: () => undefined,
      },
    });

    render(<ConfirmProvider />);

    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(screen.getByText('Confirmar envío')).toBeInTheDocument();
    expect(screen.getByText('¿Desea enviar el formulario?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Enviar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
  });

  it('resuelve la confirmacion al pulsar un boton', async () => {
    const usuario = userEvent.setup();
    let resultado: boolean | null = null;

    useUiStore.setState({
      confirmacion: {
        mensaje: '¿Continuar?',
        resolver: (valor) => {
          resultado = valor;
        },
      },
    });

    render(<ConfirmProvider />);
    await usuario.click(screen.getByRole('button', { name: 'Confirmar' }));

    expect(resultado).toBe(true);
    expect(useUiStore.getState().confirmacion).toBeNull();
  });
});
