'use client';

/**
 * Centraliza la configuracion visual proveniente del backend en cliente.
 */

import { createContext, useContext, useEffect, useMemo } from 'react';
import type { ConfiguracionInterfaz } from '@/types/interfaz';
import { useInterfazStore } from '@/store/interfazStore';
import { aplicarTemaDocumento } from '@/utils/aplicarTemaDocumento';
import { aplicarTokensInterfaz } from '@/utils/tokensInterfaz';

interface AppThemeContextValue {
  configuracion: ConfiguracionInterfaz;
}

const AppThemeContext = createContext<AppThemeContextValue | null>(null);

interface AppThemeProviderProps {
  readonly configuracion: ConfiguracionInterfaz;
  readonly children: React.ReactNode;
}

export function AppThemeProvider({
  configuracion,
  children,
}: AppThemeProviderProps) {
  const establecerConfiguracion = useInterfazStore((s) => s.establecerConfiguracion);

  const estilosTokens = useMemo(
    () => aplicarTokensInterfaz(configuracion),
    [configuracion]
  );

  useEffect(() => {
    establecerConfiguracion(configuracion);
    aplicarTemaDocumento(configuracion);
  }, [configuracion, establecerConfiguracion]);

  const valor = useMemo(() => ({ configuracion }), [configuracion]);

  return (
    <AppThemeContext.Provider value={valor}>
      <div style={estilosTokens} className="contents">
        {children}
      </div>
    </AppThemeContext.Provider>
  );
}

export function useAppTheme(): AppThemeContextValue {
  const contexto = useContext(AppThemeContext);
  const configuracionStore = useInterfazStore((s) => s.configuracion);

  if (contexto) return contexto;

  if (configuracionStore) {
    return { configuracion: configuracionStore };
  }

  throw new Error('useAppTheme debe usarse dentro de AppThemeProvider.');
}
