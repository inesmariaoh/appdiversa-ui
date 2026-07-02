'use client';

/**
 * Panel de consentimiento previo al inicio de la encuesta — Figma parte06 / windowContainer.png.
 *
 * Estructura:
 *   - Banner "Verificado con exito" (AlertaVerificacion)
 *   - Texto de autorizacion de datos (desde API: tipo 'autorizacion_datos' o 'consentimiento_datos')
 *   - Enlace a Terminos y condiciones
 *   - Boton "Aceptar y comenzar encuesta"
 *
 * El texto proviene del FormularioEstructura.textos → no se hardcodea nada.
 */

import Link from 'next/link';
import { AlertaVerificacion } from '@/components/ui/016_alerta_verificacion';
import { ContenidoHtml } from '@/components/ui/005_contenido_html';
import { Boton } from '@/components/ui/001_boton';
import { buscarTextoFormulario } from '@/utils/textosFormulario';
import type { FormularioEstructura } from '@/types/formulario';

interface PanelConsentimientoProps {
  readonly estructura: FormularioEstructura;
  readonly onAceptar: () => void;
  readonly procesando?: boolean;
  /** URL de la pagina de terminos. Por defecto '/terminos-condiciones'. */
  readonly urlTerminos?: string;
  /** Abre el modal de terminos de interfaz sin abandonar el flujo. */
  readonly onAbrirTerminos?: () => void;
  /** Etiqueta del enlace a terminos desde configuracion de interfaz. */
  readonly textoEnlaceTerminos?: string;
  /** Etiqueta del boton principal de aceptacion desde configuracion de interfaz. */
  readonly textoBotonAceptar?: string;
  /**
   * Titulo y descripcion del banner de verificacion.
   * Tomados del texto tipo 'verificacion_exitosa' si existe; de lo contrario texto estatico.
   */
  readonly tituloVerificacion?: string;
  readonly descripcionVerificacion?: string;
}

export function PanelConsentimiento({
  estructura,
  onAceptar,
  procesando = false,
  urlTerminos = '/terminos-condiciones',
  onAbrirTerminos,
  textoEnlaceTerminos = 'Términos y condiciones',
  textoBotonAceptar = 'Aceptar y comenzar encuesta',
  tituloVerificacion,
  descripcionVerificacion,
}: PanelConsentimientoProps) {
  // Texto de verificacion exitosa (puede ser null si no esta en la API)
  const textoVerificacion = buscarTextoFormulario(estructura, 'verificacion_exitosa');
  const tituloBanner = tituloVerificacion ?? textoVerificacion?.titulo ?? 'Verificado con éxito';
  const descBanner =
    descripcionVerificacion ??
    textoVerificacion?.contenido ??
    'Cumples con todos los requisitos para participar.';

  // Texto de autorizacion de datos personales
  const textoAutorizacion =
    buscarTextoFormulario(estructura, 'autorizacion_datos') ??
    buscarTextoFormulario(estructura, 'consentimiento_datos');

  return (
    <div
      className="rounded-2xl p-6 sm:p-8 flex flex-col gap-6"
      style={{
        backgroundColor: 'var(--color-fondo-tarjeta)',
        boxShadow: 'var(--sombra-md)',
      }}
    >
      {/* Banner verificacion */}
      <AlertaVerificacion titulo={tituloBanner} descripcion={descBanner} />

      {/* Texto legal de autorizacion de datos */}
      {textoAutorizacion?.contenido && (
        <div
          className="text-sm leading-relaxed"
          style={{ color: 'var(--color-texto-secundario)' }}
        >
          <ContenidoHtml contenido={textoAutorizacion.contenido} />
        </div>
      )}

      {/* Enlace a terminos */}
      <p
        className="text-sm text-center"
        style={{ color: 'var(--color-texto-secundario)' }}
      >
        Al continuar aceptas nuestros{' '}
        {onAbrirTerminos ? (
          <button
            type="button"
            onClick={onAbrirTerminos}
            className="font-semibold underline"
            style={{ color: 'var(--color-primario)' }}
          >
            {textoEnlaceTerminos}
          </button>
        ) : (
          <Link
            href={urlTerminos}
            className="font-semibold underline"
            style={{ color: 'var(--color-primario)' }}
          >
            {textoEnlaceTerminos}
          </Link>
        )}
      </p>

      {/* CTA principal */}
      <Boton
        variante="primario"
        ancho="completo"
        onClick={onAceptar}
        disabled={procesando}
        cargando={procesando}
        aria-label={textoBotonAceptar}
        style={{ minHeight: '52px', paddingBlock: '1rem' }}
      >
        {textoBotonAceptar}
      </Boton>
    </div>
  );
}
