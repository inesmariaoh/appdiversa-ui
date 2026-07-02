import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppThemeProvider } from './AppThemeProvider';
import { CONFIGURACION_FALLBACK } from '@/services/interfazServicio';
import { useInterfazStore } from '@/store/interfazStore';

function HijoPrueba() {
  const configuracion = useInterfazStore((s) => s.configuracion);
  return <span>{configuracion?.nombre_aplicativo}</span>;
}

describe('AppThemeProvider', () => {
  it('sincroniza configuracion en el store de interfaz', () => {
    useInterfazStore.setState({ configuracion: null });

    render(
      <AppThemeProvider configuracion={CONFIGURACION_FALLBACK}>
        <HijoPrueba />
      </AppThemeProvider>
    );

    expect(screen.getByText(CONFIGURACION_FALLBACK.nombre_aplicativo)).toBeInTheDocument();
    expect(useInterfazStore.getState().configuracion?.nombre_aplicativo).toBe(
      CONFIGURACION_FALLBACK.nombre_aplicativo
    );
  });
});
