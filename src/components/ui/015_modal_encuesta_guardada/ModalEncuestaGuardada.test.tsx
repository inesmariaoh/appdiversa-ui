import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ModalEncuestaGuardada } from './ModalEncuestaGuardada';
import { FLUJO_FORMULARIO_FALLBACK } from '@/utils/flujoFormularioFallback';

describe('ModalEncuestaGuardada', () => {
  it('muestra textos desde configuracion de interfaz', () => {
    render(
      <ModalEncuestaGuardada
        abierto
        onCerrar={vi.fn()}
        onSeguirViendo={vi.fn()}
        textos={FLUJO_FORMULARIO_FALLBACK.modal_guardado}
      />
    );

    expect(
      screen.getByRole('heading', { name: FLUJO_FORMULARIO_FALLBACK.modal_guardado.titulo })
    ).toBeInTheDocument();
    expect(screen.getAllByText(FLUJO_FORMULARIO_FALLBACK.modal_guardado.parrafo).length).toBeGreaterThan(0);
  });

  it('ejecuta onSeguirViendo al confirmar', async () => {
    const onSeguirViendo = vi.fn();
    const usuario = userEvent.setup();

    render(
      <ModalEncuestaGuardada
        abierto
        onCerrar={vi.fn()}
        onSeguirViendo={onSeguirViendo}
        textos={FLUJO_FORMULARIO_FALLBACK.modal_guardado}
      />
    );

    await usuario.click(
      screen.getByRole('button', { name: FLUJO_FORMULARIO_FALLBACK.modal_guardado.boton_seguir })
    );
    expect(onSeguirViendo).toHaveBeenCalled();
  });

  it('expone enlace a otras encuestas', () => {
    render(
      <ModalEncuestaGuardada
        abierto
        onCerrar={vi.fn()}
        onSeguirViendo={vi.fn()}
        textos={FLUJO_FORMULARIO_FALLBACK.modal_guardado}
        urlOtrasEncuestas="/encuestas"
      />
    );

    expect(
      screen.getByRole('link', { name: FLUJO_FORMULARIO_FALLBACK.modal_guardado.boton_otras })
    ).toHaveAttribute('href', '/encuestas');
  });
});
