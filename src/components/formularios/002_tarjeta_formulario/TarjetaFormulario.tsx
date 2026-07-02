/**
 * Tarjeta de formulario/encuesta.
 * Diseno alineado con Figma: imagen superior, insignia de estado,
 * metadatos, titulo, descripcion y boton CTA con posiciones fijas.
 */

'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { FormularioDisponible } from '@/types/formulario';
import { formatearFechaLanzamiento } from '@/utils/formatearFechaLanzamiento';

const IMAGEN_PORTADA_FALLBACK = '/images/portada-fallback.svg';
const IMAGEN_PORTADA_DISPONIBLE_FALLBACK = '/images/portada-fallback-disponible.svg';

interface TarjetaFormularioProps {
  readonly formulario: FormularioDisponible;
}

function IconoCandado({ className }: Readonly<{ className?: string }>) {
  return (
    <svg
      className={className}
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M3 5V3.5C3 2.11929 4.11929 1 5.5 1C6.88071 1 8 2.11929 8 3.5V5M2.5 5H8.5C9.05228 5 9.5 5.44772 9.5 6V10C9.5 10.5523 9.05228 11 8.5 11H2.5C1.94772 11 1.5 10.5523 1.5 10V6C1.5 5.44772 1.94772 5 2.5 5Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function InsigniaDisponible({ texto }: Readonly<{ texto: string }>) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{
        backgroundColor: 'var(--color-insignia-disponible-fondo)',
        color: 'var(--color-texto-invertido)',
      }}
    >
      <span
        className="inline-block rounded-full shrink-0"
        style={{
          width: '6px',
          height: '6px',
          backgroundColor: 'var(--color-insignia-disponible-indicador)',
        }}
        aria-hidden="true"
      />
      {texto}
    </span>
  );
}

function InsigniaProximamente({ texto }: Readonly<{ texto: string }>) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{
        backgroundColor: 'var(--color-fondo-tarjeta)',
        color: 'var(--color-texto-secundario)',
        border: '1px solid var(--color-borde-fuerte)',
      }}
    >
      <IconoCandado />
      {texto}
    </span>
  );
}

function MetadatosTarjeta({
  puedeIniciar,
  tiempoEstimadoMinutos,
  fechaInicio,
}: Readonly<{
  puedeIniciar: boolean;
  tiempoEstimadoMinutos: number | null;
  fechaInicio: string | null;
}>) {
  let contenido: string | null = null;
  let etiquetaAria = '';

  if (puedeIniciar && tiempoEstimadoMinutos !== null) {
    contenido = `${tiempoEstimadoMinutos} minutos`;
    etiquetaAria = `Duración estimada: ${tiempoEstimadoMinutos} minutos`;
  } else if (!puedeIniciar && fechaInicio) {
    const fechaFormateada = formatearFechaLanzamiento(fechaInicio);
    if (fechaFormateada) {
      contenido = `Lanzamiento: ${fechaFormateada}`;
      etiquetaAria = `Lanzamiento: ${fechaFormateada}`;
    }
  }

  return (
    <p
      className="text-xs m-0"
      style={{
        color: 'var(--color-texto-muted)',
        minHeight: 'var(--altura-metadatos-tarjeta-encuesta)',
      }}
      aria-label={contenido ? etiquetaAria : undefined}
    >
      {contenido ?? '\u00A0'}
    </p>
  );
}

export function TarjetaFormulario({ formulario }: TarjetaFormularioProps) {
  const {
    uuid,
    nombre,
    descripcion,
    imagen_portada,
    tiempo_estimado_minutos,
    fecha_inicio,
    puede_iniciar,
    estado_disponibilidad,
    etiqueta_estado,
  } = formulario;

  const esProximamente = !puede_iniciar && estado_disponibilidad === 'proximamente';
  const fallbackPortada = puede_iniciar
    ? IMAGEN_PORTADA_DISPONIBLE_FALLBACK
    : IMAGEN_PORTADA_FALLBACK;
  const urlPortada = imagen_portada ?? fallbackPortada;
  const etiquetaArticulo = esProximamente
    ? `Encuesta próximamente disponible: ${nombre}`
    : `Encuesta: ${nombre}`;

  const manejarErrorPortada = (evento: React.SyntheticEvent<HTMLImageElement>) => {
    const destino = evento.currentTarget.src;
    if (destino.endsWith(fallbackPortada)) {
      return;
    }
    evento.currentTarget.src = fallbackPortada;
  };

  return (
    <article
      className="flex flex-col flex-1 w-full h-full min-h-full overflow-hidden"
      style={{
        backgroundColor: 'var(--color-fondo-tarjeta)',
        borderRadius: 'var(--radio-borde-tarjeta)',
        boxShadow: 'var(--sombra-md)',
        opacity: esProximamente ? 0.92 : 1,
      }}
      aria-label={etiquetaArticulo}
    >
      <div
        className="relative shrink-0 overflow-hidden"
        style={{
          height: 'var(--altura-imagen-tarjeta-encuesta)',
          backgroundColor: 'var(--color-fondo-portada-tarjeta)',
        }}
      >
        <Image
          src={urlPortada}
          alt=""
          fill
          unoptimized
          aria-hidden
          className="object-cover"
          style={{
            objectPosition: 'center top',
            filter: esProximamente ? 'grayscale(100%)' : undefined,
          }}
          onError={manejarErrorPortada}
        />
        <div className="absolute top-3 left-3" style={{ zIndex: 1 }}>
          {puede_iniciar ? (
            <InsigniaDisponible texto={etiqueta_estado} />
          ) : (
            <InsigniaProximamente texto={etiqueta_estado} />
          )}
        </div>
      </div>

      <div
        className="grid flex-1"
        style={{
          padding: 'var(--espacio-lg)',
          gap: 'var(--espacio-sm)',
          minHeight: 'var(--altura-contenido-tarjeta-encuesta)',
          gridTemplateRows: 'auto auto 1fr auto',
        }}
      >
        <MetadatosTarjeta
          puedeIniciar={puede_iniciar}
          tiempoEstimadoMinutos={tiempo_estimado_minutos}
          fechaInicio={fecha_inicio}
        />

        <h2
          className="font-bold leading-tight line-clamp-2 m-0"
          style={{
            color: 'var(--color-texto-primario)',
            fontSize: 'var(--tamano-texto-xl)',
            minHeight: 'var(--altura-titulo-tarjeta-encuesta)',
          }}
        >
          {nombre}
        </h2>

        <p
          className="text-sm leading-relaxed line-clamp-4 m-0 self-start"
          style={{
            color: 'var(--color-texto-secundario)',
          }}
        >
          {descripcion || '\u00A0'}
        </p>

        <div className="self-end w-full">
          {puede_iniciar ? (
            <Link
              href={`/encuestas/${uuid}`}
              className="inline-flex items-center justify-center w-full px-4 py-3 text-sm font-medium transition-colors"
              style={{
                backgroundColor: 'var(--color-primario)',
                color: 'var(--color-texto-sobre-primario)',
                borderRadius: 'var(--radio-borde-boton)',
                minHeight: 'var(--tamano-control-min)',
              }}
              aria-label={`Iniciar encuesta: ${nombre}`}
            >
              Iniciar encuesta &gt;
            </Link>
          ) : (
            <button
              type="button"
              disabled
              aria-disabled="true"
              aria-label={`Encuesta próximamente disponible: ${nombre}`}
              className="inline-flex items-center justify-center w-full px-4 py-3 text-sm font-medium cursor-not-allowed"
              style={{
                backgroundColor: 'var(--color-deshabilitado-fondo)',
                color: 'var(--color-deshabilitado)',
                borderRadius: 'var(--radio-borde-boton)',
                minHeight: 'var(--tamano-control-min)',
                border: '1px solid var(--color-borde)',
              }}
            >
              {etiqueta_estado}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
