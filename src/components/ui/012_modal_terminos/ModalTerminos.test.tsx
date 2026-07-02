import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ModalTerminos } from './ModalTerminos';
import { FLUJO_FORMULARIO_FALLBACK } from '@/utils/flujoFormularioFallback';

describe('ModalTerminos', () => {
  it('muestra contenido desde API cuando existe', () => {
    render(
      <ModalTerminos
        abierto
        onCerrar={vi.fn()}
        onAceptar={vi.fn()}
        textos={{
          ...FLUJO_FORMULARIO_FALLBACK.terminos,
          contenido: 'Texto legal desde API.',
          parrafo_1: '',
          parrafo_2: '',
          parrafo_3: '',
        }}
        bloqueante
      />
    );

    expect(screen.getByText('Texto legal desde API.')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /aceptar y comenzar encuesta/i })
    ).toBeInTheDocument();
  });

  it('muestra parrafos fallback cuando no hay contenido', () => {
    render(
      <ModalTerminos
        abierto
        onCerrar={vi.fn()}
        textos={{
          ...FLUJO_FORMULARIO_FALLBACK.terminos,
          contenido: null,
        }}
      />
    );

    expect(
      screen.getByRole('link', { name: /Consultar Ley 1581 de 2012/i })
    ).toBeInTheDocument();
  });

  it('ejecuta onAceptar al confirmar', async () => {
    const onAceptar = vi.fn();
    const usuario = userEvent.setup();

    render(
      <ModalTerminos
        abierto
        onCerrar={vi.fn()}
        onAceptar={onAceptar}
        textos={FLUJO_FORMULARIO_FALLBACK.terminos}
        bloqueante
      />
    );

    await usuario.click(
      screen.getByRole('button', { name: /aceptar y comenzar encuesta/i })
    );
    expect(onAceptar).toHaveBeenCalled();
  });

  it('expone dialog accesible con titulo', () => {
    render(
      <ModalTerminos
        abierto
        onCerrar={vi.fn()}
        textos={FLUJO_FORMULARIO_FALLBACK.terminos}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: FLUJO_FORMULARIO_FALLBACK.terminos.titulo })).toBeInTheDocument();
  });
});
