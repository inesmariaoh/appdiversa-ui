import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VistaPreviaFormulario } from './VistaPreviaFormulario';
import type { FormularioEstructura } from '@/types/formulario';

vi.mock('@/components/formularios/003_panel_formulario', () => ({
  PanelFormulario: ({ modoPreview }: { modoPreview?: boolean }) => (
    <div data-testid="panel-formulario">{modoPreview ? 'modo-preview' : 'modo-live'}</div>
  ),
}));

const estructuraMinima: FormularioEstructura = {
  uuid: 'uuid-test',
  codigo: 'F-01',
  nombre: 'Formulario demo',
  descripcion: '',
  introduccion: '',
  objetivo: '',
  tipo_formulario: 'encuesta',
  imagen_portada: null,
  version: { id: 1, numero_version: 1 },
  textos: [],
  secciones: [],
};

describe('VistaPreviaFormulario', () => {
  it('muestra aviso de vista previa y panel en modo preview', () => {
    render(
      <VistaPreviaFormulario uuidFormulario="uuid-test" estructura={estructuraMinima} />
    );
    expect(screen.getByRole('status')).toHaveTextContent(/vista previa/i);
    expect(screen.getByTestId('panel-formulario')).toHaveTextContent('modo-preview');
  });
});
