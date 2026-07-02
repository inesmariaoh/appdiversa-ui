'use client';

/**
 * Captura errores de renderizado no controlados en el arbol de componentes.
 */

import { Component, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  readonly children: ReactNode;
  readonly titulo?: string;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  render() {
    const { error } = this.state;
    const { children, titulo = 'Ocurrió un error inesperado' } = this.props;

    if (error) {
      return (
        <div
          role="alert"
          className="max-w-lg mx-auto my-8 rounded-xl p-6"
          style={{
            backgroundColor: 'var(--color-fondo-tarjeta)',
            color: 'var(--color-texto-primario)',
          }}
        >
          <h2 className="text-xl font-bold mb-2">{titulo}</h2>
          <p className="text-sm mb-4" style={{ color: 'var(--color-texto-secundario)' }}>
            Recargue la página o intente nuevamente en unos momentos.
          </p>
          <button
            type="button"
            className="text-sm underline"
            onClick={() => this.setState({ error: null })}
          >
            Reintentar
          </button>
        </div>
      );
    }

    return children;
  }
}
