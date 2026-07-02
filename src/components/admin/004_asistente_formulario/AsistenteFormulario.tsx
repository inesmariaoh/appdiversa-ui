'use client';

/**
 * Asistente guiado para construir un formulario completo desde un unico lugar:
 * datos generales, secciones, preguntas, reglas, textos y publicacion.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormularioAdminDetalle, FormularioAdminEntrada } from '@/types/admin';
import type { FormularioEstructura } from '@/types/formulario';
import {
  actualizarFormularioAdmin,
  obtenerEstructuraAdmin,
  obtenerFormularioAdmin,
} from '@/services/formulariosAdminServicio';
import { SkeletonFormulario } from '@/components/ui/004_skeleton';
import { extraerDetalleError } from '@/utils/erroresApi';
import { ejecutarSinEspera } from '@/utils/ejecutarSinEspera';
import { ContenidoPaso } from './ContenidoPaso';
import { IndicadorPasos } from './IndicadorPasos';
import { NavegacionAsistente } from './NavegacionAsistente';
import { EncabezadoAsistente } from './EncabezadoAsistente';
import { PASOS_ASISTENTE, type PasoAsistenteId } from './pasos';

interface AsistenteFormularioProps {
  readonly idFormulario: number;
}

export function AsistenteFormulario({ idFormulario }: AsistenteFormularioProps) {
  const [paso, setPaso] = useState<PasoAsistenteId>('generales');
  const [detalle, setDetalle] = useState<FormularioAdminDetalle | null>(null);
  const [estructura, setEstructura] = useState<FormularioEstructura | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const [formulario, estruct] = await Promise.all([
        obtenerFormularioAdmin(idFormulario),
        obtenerEstructuraAdmin(idFormulario),
      ]);
      setDetalle(formulario);
      setEstructura(estruct);
    } catch (err) {
      setError(extraerDetalleError(err));
    } finally {
      setCargando(false);
    }
  }, [idFormulario]);

  useEffect(() => {
    ejecutarSinEspera((async () => {
      await cargar();
    })());
  }, [cargar]);

  const estaCompleto = useMemo(
    () => crearEvaluadorCompletitud(detalle, estructura),
    [detalle, estructura],
  );

  if (cargando || !detalle || !estructura) {
    return error ? (
      <p role="alert" style={{ color: 'var(--color-error)' }}>{error}</p>
    ) : (
      <SkeletonFormulario />
    );
  }

  return (
    <div>
      <EncabezadoAsistente detalle={detalle} />

      <IndicadorPasos
        pasos={PASOS_ASISTENTE}
        pasoActual={paso}
        estaCompleto={estaCompleto}
        onSeleccionar={setPaso}
      />

      <section aria-live="polite">
        <ContenidoPaso
          paso={paso}
          idFormulario={idFormulario}
          detalle={detalle}
          estructura={estructura}
          onGuardarGenerales={async (datos: FormularioAdminEntrada) => {
            await actualizarFormularioAdmin(idFormulario, datos);
            await cargar();
          }}
          onActualizado={() => ejecutarSinEspera(cargar())}
          onPublicado={() => ejecutarSinEspera(cargar())}
        />
      </section>

      <NavegacionAsistente pasoActual={paso} onCambiar={setPaso} />
    </div>
  );
}

function crearEvaluadorCompletitud(
  detalle: FormularioAdminDetalle | null,
  estructura: FormularioEstructura | null,
): (id: PasoAsistenteId) => boolean {
  const totalPreguntas =
    estructura?.secciones.reduce((total, seccion) => total + seccion.preguntas.length, 0) ?? 0;

  return (id: PasoAsistenteId): boolean => {
    if (id === 'generales') return Boolean(detalle?.codigo && detalle?.nombre);
    if (id === 'secciones') return (estructura?.secciones.length ?? 0) > 0;
    if (id === 'preguntas') return totalPreguntas > 0;
    if (id === 'textos') return (estructura?.textos.length ?? 0) > 0;
    return false;
  };
}
