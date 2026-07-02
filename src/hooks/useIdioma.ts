'use client';

/**
 * Hook para idioma, traducciones y contenido accesible en peticiones.
 */

import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { obtenerTraducciones } from '@/services/internacionalizacionServicio';
import { useIdiomaStore } from '@/store/idiomaStore';
import { establecerCookieIdioma, leerCookieIdioma, establecerCookieAccesibilidad, leerCookieAccesibilidad } from '@/utils/idiomaCookie';
import { mapaDesdeTraducciones } from '@/utils/traduccionesUi';
import { ejecutarSinEspera } from '@/utils/ejecutarSinEspera';

export function useIdioma() {
  const router = useRouter();
  const idioma = useIdiomaStore((s) => s.idioma);
  const incluirAccesibilidad = useIdiomaStore((s) => s.incluirAccesibilidad);
  const traducir = useIdiomaStore((s) => s.traducir);
  const establecerIdioma = useIdiomaStore((s) => s.establecerIdioma);
  const establecerIncluirAccesibilidad = useIdiomaStore(
    (s) => s.establecerIncluirAccesibilidad
  );
  const establecerTraducciones = useIdiomaStore((s) => s.establecerTraducciones);
  const establecerCargandoTraducciones = useIdiomaStore(
    (s) => s.establecerCargandoTraducciones
  );

  useEffect(() => {
    const cookieIdioma = leerCookieIdioma();
    if (cookieIdioma && cookieIdioma !== idioma) {
      establecerIdioma(cookieIdioma);
    }
    const cookieAccesibilidad = leerCookieAccesibilidad();
    if (cookieAccesibilidad !== incluirAccesibilidad) {
      establecerIncluirAccesibilidad(cookieAccesibilidad);
    }
  }, [establecerIdioma, establecerIncluirAccesibilidad, idioma, incluirAccesibilidad]);

  useEffect(() => {
    let cancelado = false;

    async function cargarTraducciones() {
      establecerCargandoTraducciones(true);
      try {
        const items = await obtenerTraducciones({ idioma });
        if (!cancelado) {
          establecerTraducciones(mapaDesdeTraducciones(items));
        }
      } catch {
        if (!cancelado) establecerTraducciones({});
      } finally {
        if (!cancelado) establecerCargandoTraducciones(false);
      }
    }

    ejecutarSinEspera(cargarTraducciones());

    return () => {
      cancelado = true;
    };
  }, [idioma, establecerTraducciones, establecerCargandoTraducciones]);

  const cambiarIdioma = useCallback(
    (nuevoIdioma: string) => {
      establecerIdioma(nuevoIdioma);
      establecerCookieIdioma(nuevoIdioma);
      router.refresh();
    },
    [establecerIdioma, router]
  );

  const alternarAccesibilidad = useCallback(() => {
    const siguiente = !incluirAccesibilidad;
    establecerIncluirAccesibilidad(siguiente);
    establecerCookieAccesibilidad(siguiente);
    router.refresh();
  }, [establecerIncluirAccesibilidad, incluirAccesibilidad, router]);

  return {
    idioma,
    incluirAccesibilidad,
    traducir,
    establecerIdioma: cambiarIdioma,
    alternarAccesibilidad,
  };
}
