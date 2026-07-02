'use client';
/**
 * Parte cliente del historial de respuestas.
 * Protege la ruta (RutaProtegida) y carga el historial desde el API.
 */

import { useEffect, useState } from 'react';
import { RutaProtegida } from '@/components/auth/006_ruta_protegida';
import { TarjetaRespuesta } from '@/components/mis-respuestas/001_tarjeta_respuesta';
import { obtenerHistorialSesiones } from '@/services/sesionesServicio';
import type { HistorialSesion } from '@/types/sesion';
import { resolverFechaDiligenciamientoIso } from '@/utils/resumenRespuestas';

function ordenarHistorialPorFecha(items: HistorialSesion[]): HistorialSesion[] {
  return [...items].sort((a, b) => {
    const fechaA = resolverFechaDiligenciamientoIso(a);
    const fechaB = resolverFechaDiligenciamientoIso(b);
    if (!fechaA && !fechaB) return 0;
    if (!fechaA) return 1;
    if (!fechaB) return -1;
    return new Date(fechaB).getTime() - new Date(fechaA).getTime();
  });
}

const PLACEHOLDERS_CARGA_HISTORIAL = [
  'skeleton-historial-1',
  'skeleton-historial-2',
  'skeleton-historial-3',
] as const;

function ListaHistorial() {
  const [historial, setHistorial] = useState<HistorialSesion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;
    obtenerHistorialSesiones()
      .then((datos) => {
        if (!cancelado) setHistorial(ordenarHistorialPorFecha(datos));
      })
      .catch(() => {
        if (!cancelado) setError('No fue posible cargar el historial. Intenta nuevamente.');
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });
    return () => {
      cancelado = true;
    };
  }, []);

  if (cargando) {
    return (
      <output
        aria-label="Cargando historial de respuestas"
        aria-live="polite"
        className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        {PLACEHOLDERS_CARGA_HISTORIAL.map((id) => (
          <div
            key={id}
            className="rounded-2xl p-6 animate-pulse"
            style={{
              backgroundColor: 'var(--color-fondo-tarjeta)',
              border: '1px solid var(--color-borde)',
              minHeight: '180px',
            }}
            aria-hidden="true"
          />
        ))}
      </output>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="rounded-xl p-4 text-sm"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--color-error, #dc2626) 8%, transparent)',
          color: 'var(--color-error, #dc2626)',
          border: '1px solid color-mix(in srgb, var(--color-error, #dc2626) 20%, transparent)',
        }}
      >
        {error}
      </div>
    );
  }

  if (historial.length === 0) {
    return (
      <div
        className="rounded-xl p-8 text-center"
        style={{
          backgroundColor: 'var(--color-fondo-tarjeta)',
          border: '1px solid var(--color-borde)',
        }}
      >
        <p
          className="text-base font-medium mb-2"
          style={{ color: 'var(--color-texto-primario)' }}
        >
          Aún no tienes respuestas registradas
        </p>
        <p className="text-sm" style={{ color: 'var(--color-texto-secundario)' }}>
          Cuando completes una encuesta, aparecerá aquí tu historial.
        </p>
      </div>
    );
  }

  return (
    <ul
      className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
      aria-label="Listado de respuestas enviadas"
    >
      {historial.map((sesion) => (
        <li key={sesion.uuid_sesion}>
          <TarjetaRespuesta sesion={sesion} />
        </li>
      ))}
    </ul>
  );
}

export function ContenidoHistorial() {
  return (
    <RutaProtegida rutaLogin="/auth/login?destino=/mis-respuestas">
      <ListaHistorial />
    </RutaProtegida>
  );
}
