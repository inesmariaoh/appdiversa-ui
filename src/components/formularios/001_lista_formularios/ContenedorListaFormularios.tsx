'use client';

/**
 * Carga la lista de formularios en cliente cuando el SSR no pudo consultar la API.
 */

import { useEffect, useState } from 'react';
import type { FormularioDisponible } from '@/types/formulario';
import { obtenerFormulariosDisponibles } from '@/services/formulariosServicio';
import { ListaFormularios } from './ListaFormularios';

interface ContenedorListaFormulariosProps {
  readonly formulariosIniciales: FormularioDisponible[];
  readonly tituloSeccion?: string;
  readonly descripcionSeccion?: string;
  readonly idioma?: string;
}

function ContenedorListaFormulariosCargador({
  tituloSeccion,
  descripcionSeccion,
  idioma,
}: Readonly<Pick<ContenedorListaFormulariosProps, 'tituloSeccion' | 'descripcionSeccion' | 'idioma'>>) {
  const [formularios, setFormularios] = useState<FormularioDisponible[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;

    obtenerFormulariosDisponibles(idioma ? { idioma } : undefined)
      .then((disponibles) => {
        if (activo) {
          setFormularios(disponibles);
        }
      })
      .finally(() => {
        if (activo) {
          setCargando(false);
        }
      });

    return () => {
      activo = false;
    };
  }, [idioma]);

  if (cargando) {
    return (
      <output
        className="text-base block"
        style={{ color: 'var(--color-texto-muted)' }}
        aria-live="polite"
      >
        Cargando encuestas disponibles...
      </output>
    );
  }

  return (
    <ListaFormularios
      formularios={formularios}
      tituloSeccion={tituloSeccion}
      descripcionSeccion={descripcionSeccion}
    />
  );
}

export function ContenedorListaFormularios({
  formulariosIniciales,
  tituloSeccion,
  descripcionSeccion,
  idioma,
}: Readonly<ContenedorListaFormulariosProps>) {
  if (formulariosIniciales.length > 0) {
    return (
      <ListaFormularios
        formularios={formulariosIniciales}
        tituloSeccion={tituloSeccion}
        descripcionSeccion={descripcionSeccion}
      />
    );
  }

  return (
    <ContenedorListaFormulariosCargador
      tituloSeccion={tituloSeccion}
      descripcionSeccion={descripcionSeccion}
      idioma={idioma}
    />
  );
}
