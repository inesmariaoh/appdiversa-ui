'use client';

/**
 * Agrupa proveedores globales de la aplicacion.
 */

import type { ConfiguracionInterfaz } from '@/types/interfaz';
import { AppThemeProvider } from '@/components/layout/007_app_theme';
import {
  ErrorBoundary,
  LoadingProvider,
  ToastProvider,
  DialogProvider,
  ConfirmProvider,
} from '@/components/ui/006_proveedores_ui';
import { InicializadorAuth } from '@/components/layout/010_inicializador_auth';

interface ProveedorAppProps {
  readonly configuracion: ConfiguracionInterfaz;
  readonly children: React.ReactNode;
}

export function ProveedorApp({ configuracion, children }: ProveedorAppProps) {
  return (
    <ErrorBoundary>
      <AppThemeProvider configuracion={configuracion}>
        <InicializadorAuth />
        {children}
        <LoadingProvider />
        <ToastProvider />
        <DialogProvider />
        <ConfirmProvider />
      </AppThemeProvider>
    </ErrorBoundary>
  );
}
