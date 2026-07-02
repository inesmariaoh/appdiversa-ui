import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ListadoFormulariosAdmin } from '@/components/admin/002_listado_formularios';
import { useAuthStore } from '@/store/authStore';

vi.mock('@/services/formulariosAdminServicio', () => ({
  listarFormulariosAdmin: vi.fn(),
  duplicarFormularioAdmin: vi.fn(),
  publicarFormularioAdmin: vi.fn(),
  cerrarFormularioAdmin: vi.fn(),
  eliminarFormularioAdmin: vi.fn(),
}));

vi.mock('@/components/ui/006_proveedores_ui', () => ({
  useConfirmacion: () => ({ confirmar: vi.fn().mockResolvedValue(false) }),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

import { listarFormulariosAdmin } from '@/services/formulariosAdminServicio';

describe('ListadoFormulariosAdmin', () => {
  beforeEach(() => {
    useAuthStore.setState({
      permisos: ['formularios.ver', 'formularios.editar'],
    });
    vi.mocked(listarFormulariosAdmin).mockReset();
  });

  it('muestra listado de formularios admin', async () => {
    vi.mocked(listarFormulariosAdmin).mockResolvedValue([
      {
        id: 1,
        uuid: 'uuid-1',
        codigo: 'F-01',
        nombre: 'Encuesta test',
        descripcion: '',
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
      },
    ]);

    render(<ListadoFormulariosAdmin />);

    await waitFor(() => {
      expect(screen.getByText('Encuesta test')).toBeInTheDocument();
    });
    expect(screen.getByText('F-01')).toBeInTheDocument();
  });

  it('lector solo ve accion Ver sin publicar', async () => {
    useAuthStore.setState({
      permisos: ['formularios.ver'],
    });
    vi.mocked(listarFormulariosAdmin).mockResolvedValue([
      {
        id: 1,
        uuid: 'uuid-1',
        codigo: 'F-01',
        nombre: 'Encuesta test',
        descripcion: '',
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
      },
    ]);

    render(<ListadoFormulariosAdmin />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Ver' })).toBeInTheDocument();
    });
    expect(screen.queryByRole('button', { name: 'Publicar' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Editar' })).not.toBeInTheDocument();
  });

  it('editor ve editar pero no publicar', async () => {
    useAuthStore.setState({
      permisos: ['formularios.ver', 'formularios.editar'],
    });
    vi.mocked(listarFormulariosAdmin).mockResolvedValue([
      {
        id: 1,
        uuid: 'uuid-1',
        codigo: 'F-01',
        nombre: 'Encuesta test',
        descripcion: '',
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
      },
    ]);

    render(<ListadoFormulariosAdmin />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Editar' })).toBeInTheDocument();
    });
    expect(screen.queryByRole('button', { name: 'Publicar' })).not.toBeInTheDocument();
  });

  it('gestor ve boton publicar', async () => {
    useAuthStore.setState({
      permisos: ['formularios.ver', 'formularios.editar', 'formularios.publicar'],
    });
    vi.mocked(listarFormulariosAdmin).mockResolvedValue([
      {
        id: 1,
        uuid: 'uuid-1',
        codigo: 'F-01',
        nombre: 'Encuesta test',
        descripcion: '',
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
      },
    ]);

    render(<ListadoFormulariosAdmin />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Publicar' })).toBeInTheDocument();
    });
  });
});
