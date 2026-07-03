import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { ConfiguracionAccesibilidadAdmin } from './ConfiguracionAccesibilidadAdmin';
import * as servicio from '@/services/interfazAdminServicio';
import type { AccesibilidadAdminDatos } from '@/types/interfaz';

vi.mock('@/services/interfazAdminServicio', () => ({
  obtenerAccesibilidadAdmin: vi.fn(),
  actualizarAccesibilidadAdmin: vi.fn(),
}));

const DATOS_INICIALES: AccesibilidadAdminDatos = {
  lectura_voz_habilitada: true,
  comandos_voz_habilitada: false,
  lengua_senas_habilitada: false,
  fuente_dislexia_habilitada: false,
  tema_por_defecto: 'claro',
  centro_relevo_habilitado: false,
  url_centro_relevo: '',
  url_lengua_senas: '',
  texto_lengua_senas: '',
};

describe('ConfiguracionAccesibilidadAdmin', () => {
  beforeEach(() => {
    vi.mocked(servicio.obtenerAccesibilidadAdmin).mockReset();
    vi.mocked(servicio.actualizarAccesibilidadAdmin).mockReset();
  });

  it('carga las banderas incluyendo Centro de Relevo y lengua de señas', async () => {
    vi.mocked(servicio.obtenerAccesibilidadAdmin).mockResolvedValue(DATOS_INICIALES);

    render(<ConfiguracionAccesibilidadAdmin />);

    expect(await screen.findByText('Centro de Relevo')).toBeInTheDocument();
    expect(screen.getAllByRole('checkbox')).toHaveLength(5);
    expect(screen.getByLabelText('URL del Centro de Relevo')).toBeInTheDocument();
    expect(screen.getByLabelText('URL del video en lengua de señas')).toBeInTheDocument();
  });

  it('activa Centro de Relevo y guarda los cambios', async () => {
    vi.mocked(servicio.obtenerAccesibilidadAdmin).mockResolvedValue(DATOS_INICIALES);
    vi.mocked(servicio.actualizarAccesibilidadAdmin).mockResolvedValue({
      ...DATOS_INICIALES,
      centro_relevo_habilitado: true,
    });

    render(<ConfiguracionAccesibilidadAdmin />);
    await screen.findByText('Centro de Relevo');

    const casillas = screen.getAllByRole('checkbox');
    fireEvent.click(casillas[4]);
    fireEvent.click(screen.getByRole('button', { name: /guardar/i }));

    await waitFor(() => {
      expect(servicio.actualizarAccesibilidadAdmin).toHaveBeenCalledWith(
        expect.objectContaining({ centro_relevo_habilitado: true })
      );
    });
    expect(await screen.findByText('Cambios guardados correctamente.')).toBeInTheDocument();
  });

  it('muestra un error cuando falla la carga', async () => {
    vi.mocked(servicio.obtenerAccesibilidadAdmin).mockRejectedValue(new Error('falla'));

    render(<ConfiguracionAccesibilidadAdmin />);

    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });
});
