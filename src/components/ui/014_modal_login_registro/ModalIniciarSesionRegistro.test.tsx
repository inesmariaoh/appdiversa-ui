import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ModalIniciarSesionRegistro } from './ModalIniciarSesionRegistro';
import { FLUJO_FORMULARIO_FALLBACK } from '@/utils/flujoFormularioFallback';

describe('ModalIniciarSesionRegistro', () => {
  it('muestra textos desde configuracion de interfaz', () => {
    render(
      <ModalIniciarSesionRegistro
        abierto
        onCerrar={vi.fn()}
        textos={FLUJO_FORMULARIO_FALLBACK.modal_sesion}
      />
    );

    expect(
      screen.getByRole('heading', { name: FLUJO_FORMULARIO_FALLBACK.modal_sesion.titulo })
    ).toBeInTheDocument();
    expect(screen.getAllByText(FLUJO_FORMULARIO_FALLBACK.modal_sesion.parrafo).length).toBeGreaterThan(0);
  });

  it('expone enlaces de login y registro con urls parametrizadas', () => {
    render(
      <ModalIniciarSesionRegistro
        abierto
        onCerrar={vi.fn()}
        textos={FLUJO_FORMULARIO_FALLBACK.modal_sesion}
        urlLogin="/auth/login?intencion=guardar_progreso"
        urlRegistro="/auth/registro?intencion=guardar_progreso"
      />
    );

    expect(
      screen.getByRole('link', { name: FLUJO_FORMULARIO_FALLBACK.modal_sesion.boton_login })
    ).toHaveAttribute('href', '/auth/login?intencion=guardar_progreso');
    expect(
      screen.getByRole('link', { name: FLUJO_FORMULARIO_FALLBACK.modal_sesion.boton_registro })
    ).toHaveAttribute('href', '/auth/registro?intencion=guardar_progreso');
  });

  it('ejecuta onCerrar al cancelar', async () => {
    const onCerrar = vi.fn();
    const usuario = userEvent.setup();

    render(
      <ModalIniciarSesionRegistro
        abierto
        onCerrar={onCerrar}
        textos={FLUJO_FORMULARIO_FALLBACK.modal_sesion}
      />
    );

    await usuario.click(
      screen.getByRole('button', { name: FLUJO_FORMULARIO_FALLBACK.modal_sesion.link_cancelar })
    );
    expect(onCerrar).toHaveBeenCalled();
  });
});
