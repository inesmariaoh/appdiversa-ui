'use client';

/**
 * Sube archivos al repositorio documental con sesion anonima.
 */

import { useCallback, useState } from 'react';
import { subirArchivoMultipart } from '@/services/archivosServicio';
import { useSesionStore } from '@/store/sesionStore';
import { useOfflineStore } from '@/store/offlineStore';
import type { ArchivoRepositorio, SubirArchivoMultipart } from '@/types/archivo';
import { extraerDetalleError } from '@/utils/erroresApi';

export function useSubirArchivo() {
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subir = useCallback(
    async (entrada: Omit<SubirArchivoMultipart, 'uuid_sesion' | 'token_cliente'>) => {
      setSubiendo(true);
      setError(null);
      try {
        const enLinea = useOfflineStore.getState().enLinea;
        if (!enLinea) {
          throw new Error('Se requiere conexión a internet para subir archivos.');
        }

        const { uuidSesion, tokenCliente } = useSesionStore.getState();
        if (!uuidSesion || !tokenCliente) {
          throw new Error('No hay sesión activa para subir archivos.');
        }
        const credenciales = { uuidSesion, tokenCliente };
        const resultado: ArchivoRepositorio = await subirArchivoMultipart(
          {
            ...entrada,
            uuid_sesion: uuidSesion,
            token_cliente: tokenCliente,
          },
          credenciales
        );
        return resultado;
      } catch (err) {
        const detalle = extraerDetalleError(err);
        setError(detalle);
        throw err;
      } finally {
        setSubiendo(false);
      }
    },
    []
  );

  return { subir, subiendo, error };
}
