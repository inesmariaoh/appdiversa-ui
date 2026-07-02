import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TienePermiso } from './TienePermiso';
import { useAuthStore } from '@/store/authStore';
import { PERMISO_FORMULARIOS_EDITAR } from '@/types/auth';

describe('TienePermiso', () => {
  it('muestra contenido cuando el usuario tiene permiso', () => {
    useAuthStore.setState({ permisos: [PERMISO_FORMULARIOS_EDITAR] });
    render(
      <TienePermiso permiso={PERMISO_FORMULARIOS_EDITAR}>
        <p>Seccion editable</p>
      </TienePermiso>
    );
    expect(screen.getByText('Seccion editable')).toBeInTheDocument();
  });

  it('muestra pantalla 403 cuando no tiene permiso', () => {
    useAuthStore.setState({ permisos: [] });
    render(
      <TienePermiso permiso={PERMISO_FORMULARIOS_EDITAR}>
        <p>Seccion editable</p>
      </TienePermiso>
    );
    expect(screen.queryByText('Seccion editable')).not.toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
