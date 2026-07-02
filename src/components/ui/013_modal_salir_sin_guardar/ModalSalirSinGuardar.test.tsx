import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ModalSalirSinGuardar } from './ModalSalirSinGuardar';
import { FLUJO_FORMULARIO_FALLBACK } from '@/utils/flujoFormularioFallback';

describe('ModalSalirSinGuardar', () => {
  it('muestra textos desde configuracion de interfaz', () => {
    render(
      <ModalSalirSinGuardar
        abierto
        onCerrar={vi.fn()}
        onVolver={vi.fn()}
        onSalir={vi.fn()}
        textos={FLUJO_FORMULARIO_FALLBACK.modal_salir}
      />
    );

    expect(
      screen.getByRole('heading', { name: FLUJO_FORMULARIO_FALLBACK.modal_salir.titulo })
    ).toBeInTheDocument();
    expect(screen.getByText(FLUJO_FORMULARIO_FALLBACK.modal_salir.parrafo_1)).toBeInTheDocument();
  });

  it('ejecuta onVolver y onSalir', async () => {
    const onVolver = vi.fn();
    const onSalir = vi.fn();
    const usuario = userEvent.setup();

    render(
      <ModalSalirSinGuardar
        abierto
        onCerrar={vi.fn()}
        onVolver={onVolver}
        onSalir={onSalir}
        textos={FLUJO_FORMULARIO_FALLBACK.modal_salir}
      />
    );

    await usuario.click(
      screen.getByRole('button', { name: FLUJO_FORMULARIO_FALLBACK.modal_salir.boton_volver })
    );
    await usuario.click(
      screen.getByRole('button', { name: FLUJO_FORMULARIO_FALLBACK.modal_salir.boton_salir })
    );

    expect(onVolver).toHaveBeenCalled();
    expect(onSalir).toHaveBeenCalled();
  });

  it('expone enlace de sesion con url parametrizada', () => {
    render(
      <ModalSalirSinGuardar
        abierto
        onCerrar={vi.fn()}
        onVolver={vi.fn()}
        onSalir={vi.fn()}
        textos={FLUJO_FORMULARIO_FALLBACK.modal_salir}
        urlLogin="/auth/login?destino=%2Fencuestas"
      />
    );

    const enlace = screen.getByRole('link', {
      name: FLUJO_FORMULARIO_FALLBACK.modal_salir.link_sesion,
    });
    expect(enlace).toHaveAttribute('href', '/auth/login?destino=%2Fencuestas');
  });
});
