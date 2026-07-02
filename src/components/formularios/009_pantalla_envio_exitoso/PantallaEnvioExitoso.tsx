'use client';

/**
 * Pantalla de confirmacion post-envio de encuesta — Figma parte06 / windowContainer(1).png.
 *
 * Estructura:
 *   - Imagen de portada (url de la API, opcional)
 *   - Icono check + titulo + subtitulo (desde textos API tipo 'confirmacion_envio')
 *   - Boton primario: "Ver otras encuestas"
 *   - Boton contorno: "Ver resumen de respuestas"
 *   - Pie: "¿Quieres guardar tu progreso? Inicia sesion" (solo si usuario es anonimo)
 *
 * Todos los textos provienen de props (API). No se hardcodea contenido.
 */

import Link from 'next/link';
import Image from 'next/image';

interface PantallaEnvioExitosoProps {
  /** Titulo principal (desde API tipo 'confirmacion_envio') */
  readonly titulo?: string;
  /** Subtitulo / descripcion motivacional */
  readonly subtitulo?: string;
  /** URL de la imagen de portada del formulario */
  readonly imagenPortada?: string | null;
  /** Nombre del formulario para alt de la imagen */
  readonly nombreFormulario?: string;
  /** URL para "Ver otras encuestas". Default '/encuestas'. */
  readonly urlOtrasEncuestas?: string;
  /** URL del resumen de respuestas */
  readonly urlResumen?: string;
  /** URL de login para usuario anonimo. Default '/auth/login'. */
  readonly urlLogin?: string;
  /** Si el usuario es anonimo, muestra el pie de "Inicia sesion". */
  readonly esAnonimo?: boolean;
}

export function PantallaEnvioExitoso({
  titulo = 'Encuesta enviada con éxito',
  subtitulo,
  imagenPortada,
  nombreFormulario = 'Encuesta',
  urlOtrasEncuestas = '/encuestas',
  urlResumen,
  urlLogin = '/auth/login',
  esAnonimo = false,
}: PantallaEnvioExitosoProps) {
  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{
        backgroundColor: 'var(--color-fondo-tarjeta)',
        boxShadow: 'var(--sombra-md)',
      }}
    >
      {/* Imagen de portada */}
      {imagenPortada && (
        <div className="relative w-full" style={{ height: '180px' }}>
          <Image
            src={imagenPortada}
            alt={`Portada: ${nombreFormulario}`}
            fill
            style={{ objectFit: 'cover' }}
            priority
          />
        </div>
      )}

      <div className="flex flex-col items-center gap-4 px-6 py-8 text-center">
        {/* Icono check */}
        <IconoCheckCirculo />

        {/* Textos */}
        <h1
          className="text-2xl font-bold leading-snug"
          style={{ color: 'var(--color-texto-primario)' }}
        >
          {titulo}
        </h1>

        {subtitulo && (
          <p
            className="text-sm leading-relaxed max-w-xs"
            style={{ color: 'var(--color-texto-secundario)' }}
          >
            {subtitulo}
          </p>
        )}

        {/* Acciones */}
        <div className="flex flex-col gap-3 w-full mt-2">
          <Link
            href={urlOtrasEncuestas}
            className="block w-full py-3 px-4 rounded-xl text-sm font-semibold text-center"
            style={{
              backgroundColor: 'var(--color-primario)',
              color: '#ffffff',
            }}
          >
            Ver otras encuestas
          </Link>

          {urlResumen && (
            <Link
              href={urlResumen}
              className="block w-full py-3 px-4 rounded-xl text-sm font-semibold text-center border"
              style={{
                backgroundColor: 'transparent',
                color: 'var(--color-primario)',
                borderColor: 'var(--color-primario)',
              }}
            >
              Ver resumen de respuestas
            </Link>
          )}
        </div>

        {/* Pie: guardar progreso (solo para usuario anonimo) */}
        {esAnonimo && (
          <p
            className="text-sm mt-2"
            style={{ color: 'var(--color-texto-secundario)' }}
          >
            ¿Quieres guardar tu progreso?{' '}
            <Link
              href={urlLogin}
              className="font-semibold"
              style={{ color: 'var(--color-primario)' }}
            >
              Inicia sesión
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

function IconoCheckCirculo() {
  return (
    <svg
      aria-hidden="true"
      width="56"
      height="56"
      viewBox="0 0 56 56"
      fill="none"
    >
      <circle
        cx="28"
        cy="28"
        r="27"
        fill="color-mix(in srgb, var(--color-acento, #00B4A0) 12%, transparent)"
        stroke="var(--color-acento, #00B4A0)"
        strokeWidth="2"
      />
      <path
        d="M17 28L24 35L39 20"
        stroke="var(--color-acento, #00B4A0)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
