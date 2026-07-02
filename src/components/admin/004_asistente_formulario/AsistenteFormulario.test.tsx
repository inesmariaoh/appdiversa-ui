import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AsistenteFormulario } from './AsistenteFormulario';
import { useAuthStore } from '@/store/authStore';
import type { FormularioAdminDetalle } from '@/types/admin';
import type { FormularioEstructura } from '@/types/formulario';

vi.mock('@/services/formulariosAdminServicio', () => ({
  obtenerFormularioAdmin: vi.fn(),
  obtenerEstructuraAdmin: vi.fn(),
  actualizarFormularioAdmin: vi.fn(),
  publicarFormularioAdmin: vi.fn(),
}));

vi.mock('@/components/ui/006_proveedores_ui', () => ({
  useConfirmacion: () => ({ confirmar: vi.fn().mockResolvedValue(false) }),
}));

vi.mock('@/components/admin/010_vista_previa', () => ({
  VistaPreviaFormulario: () => <div data-testid="vista-previa" />,
}));

import {
  obtenerFormularioAdmin,
  obtenerEstructuraAdmin,
} from '@/services/formulariosAdminServicio';

const detalle: FormularioAdminDetalle = {
  id: 7,
  uuid: 'uuid-7',
  codigo: 'F-07',
  nombre: 'Encuesta demo',
  descripcion: '',
  introduccion: '',
  objetivo: '',
  tipo_formulario: 'encuesta',
  estado: 'borrador',
  fecha_inicio: null,
  fecha_fin: null,
  version_publicada: null,
  permite_offline: true,
  permite_registro_final: false,
  imagen_portada: null,
  fecha_creacion: '2026-01-01',
  fecha_modificacion: '2026-01-01',
};

const estructura: FormularioEstructura = {
  uuid: 'uuid-7',
  codigo: 'F-07',
  nombre: 'Encuesta demo',
  descripcion: '',
  introduccion: '',
  objetivo: '',
  tipo_formulario: 'encuesta',
  imagen_portada: null,
  version: { id: 1, numero_version: 1 },
  textos: [],
  secciones: [],
};

describe('AsistenteFormulario', () => {
  beforeEach(() => {
    useAuthStore.setState({ permisos: ['formularios.editar'] });
    vi.mocked(obtenerFormularioAdmin).mockResolvedValue(detalle);
    vi.mocked(obtenerEstructuraAdmin).mockResolvedValue(estructura);
  });

  it('muestra el encabezado y el primer paso', async () => {
    render(<AsistenteFormulario idFormulario={7} />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Encuesta demo' })).toBeInTheDocument();
    });
    expect(screen.getByRole('navigation', { name: /progreso/i })).toBeInTheDocument();
  });

  it('avanza al paso de secciones al pulsar siguiente', async () => {
    render(<AsistenteFormulario idFormulario={7} />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Encuesta demo' })).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('button', { name: 'Secciones' }));

    expect(screen.getByRole('heading', { name: 'Secciones' })).toBeInTheDocument();
  });

  it('orienta a crear secciones antes de agregar preguntas', async () => {
    render(<AsistenteFormulario idFormulario={7} />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Encuesta demo' })).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('button', { name: /Preguntas/ }));

    expect(screen.getByRole('status')).toHaveTextContent(/seccion/i);
  });
});
