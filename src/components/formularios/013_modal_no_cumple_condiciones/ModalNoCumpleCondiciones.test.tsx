import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ModalNoCumpleCondiciones } from '@/components/formularios/013_modal_no_cumple_condiciones';

describe('ModalNoCumpleCondiciones', () => {
  it('muestra textos configurables', () => {
    render(
      <ModalNoCumpleCondiciones
        abierto
        textos={{
          titulo: 'Gracias por participar.',
          cuerpo: 'No cumples condiciones.',
          botonPrimario: 'Ver otras encuestas',
          botonSecundario: 'Volver',
        }}
        onVerOtrasEncuestas={() => undefined}
        onVolver={() => undefined}
      />,
    );

    expect(screen.getByText('Gracias por participar.')).toBeInTheDocument();
    expect(screen.getByText('No cumples condiciones.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ver otras encuestas' })).toBeInTheDocument();
  });
});
