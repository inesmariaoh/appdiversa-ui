/**
 * Tarjeta de entrada del historial de respuestas.
 * Diseno: cardsWrapper (1).png (parte04).
 * Muestra: fecha de diligenciamiento, nombre del formulario, total respuestas, boton "Ver resumen".
 */

import Link from 'next/link';
import type { HistorialSesion } from '@/types/sesion';
import {
  formatearFechaCompletada,
  resolverFechaDiligenciamientoIso,
} from '@/utils/resumenRespuestas';

interface TarjetaRespuestaProps {
  readonly sesion: HistorialSesion;
}

export function TarjetaRespuesta({ sesion }: TarjetaRespuestaProps) {
  const fechaIso = resolverFechaDiligenciamientoIso(sesion);
  const fechaFormateada = formatearFechaCompletada(fechaIso);
  const etiquetaRespuestas =
    sesion.total_respuestas === 1
      ? '1 respuesta'
      : `${sesion.total_respuestas} respuestas`;

  return (
    <article
      className="rounded-2xl p-6 flex flex-col gap-3"
      style={{
        backgroundColor: 'var(--color-fondo-tarjeta)',
        border: '1px solid var(--color-borde)',
        boxShadow: 'var(--sombra-sm)',
      }}
      aria-label={`Encuesta ${sesion.nombre_formulario}${
        fechaFormateada ? ` — diligenciada el ${fechaFormateada}` : ''
      }`}
    >
      <p className="text-sm" style={{ color: 'var(--color-texto-secundario)' }}>
        Diligenciada el:{' '}
        {fechaFormateada && fechaIso ? (
          <time
            dateTime={fechaIso}
            className="font-semibold"
            style={{ color: 'var(--color-primario)' }}
          >
            {fechaFormateada}
          </time>
        ) : (
          <span className="font-medium" style={{ color: 'var(--color-texto-primario)' }}>
            Fecha no disponible
          </span>
        )}
      </p>

      <h2
        className="text-lg font-bold"
        style={{ color: 'var(--color-texto-primario)' }}
      >
        {sesion.nombre_formulario}
      </h2>

      <p
        className="text-sm"
        style={{ color: 'var(--color-texto-secundario)' }}
        aria-label={`Total de respuestas: ${sesion.total_respuestas}`}
      >
        {etiquetaRespuestas}
      </p>

      <Link
        href={`/encuestas/${sesion.uuid_formulario}/resumen?uuid_sesion=${sesion.uuid_sesion}`}
        className="w-full flex items-center justify-center py-3 px-4 rounded-lg text-sm font-semibold mt-1 transition-opacity hover:opacity-90"
        style={{
          backgroundColor: 'var(--color-primario)',
          color: '#ffffff',
        }}
        aria-label={`Ver resumen de ${sesion.nombre_formulario}${
          fechaFormateada ? ` del ${fechaFormateada}` : ''
        }`}
      >
        Ver resumen
      </Link>
    </article>
  );
}
