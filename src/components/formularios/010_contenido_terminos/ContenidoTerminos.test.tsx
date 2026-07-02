import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ContenidoTerminos } from './ContenidoTerminos';
import { FLUJO_FORMULARIO_FALLBACK } from '@/utils/flujoFormularioFallback';

describe('ContenidoTerminos', () => {
  it('muestra enlaces legales con ortografia correcta en fallbacks', () => {
    render(
      <ContenidoTerminos
        textos={{
          ...FLUJO_FORMULARIO_FALLBACK.terminos,
          contenido: null,
        }}
        mostrarEnlacePublico
      />,
    );

    expect(
      screen.getByRole('link', { name: /política de protección de datos personales/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /términos y condiciones/i })).toBeInTheDocument();
  });
});
