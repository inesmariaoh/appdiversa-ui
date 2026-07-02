/**
 * Pagina de inicio de sesion.
 * Diseno: Social First.png — social buttons + campo identificador + contrasena.
 * Textos dinamicos desde configuracion; URLs sociales desde variables de entorno.
 */

import { Suspense } from 'react';
import { ContenedorPagina } from '@/components/layout/003_contenedor_pagina';
import { VentanaAuth } from '@/components/auth/001_ventana_auth';
import { EncabezadoAuth } from '@/components/auth/002_encabezado_auth';
import { BotonSocial, IconoGoogle, IconoFacebook } from '@/components/auth/003_boton_social';
import { EnlaceCambioModo } from '@/components/auth/005_enlace_cambio_modo';
import { FormularioLogin } from '@/components/auth/009_formulario_login';
import { obtenerConfiguracionInterfaz } from '@/services/interfazServicio';
import { obtenerIdiomaServidor } from '@/utils/obtenerIdiomaServidor';

const URL_GOOGLE = process.env.NEXT_PUBLIC_KEYCLOAK_GOOGLE_URL?.trim() ?? '';
const URL_FACEBOOK = process.env.NEXT_PUBLIC_KEYCLOAK_FACEBOOK_URL?.trim() ?? '';

export default async function PaginaLogin() {
  const idioma = await obtenerIdiomaServidor();
  const configuracion = await obtenerConfiguracionInterfaz(idioma);

  const mostrarSocial = Boolean(URL_GOOGLE || URL_FACEBOOK);

  return (
    <ContenedorPagina etiquetaAria="Iniciar sesión">
      <div className="flex justify-center py-10 px-4">
        <VentanaAuth>
          <EncabezadoAuth
            titulo="Inicia sesión"
            subtitulo={configuracion.descripcion_aplicativo || undefined}
          />

          {mostrarSocial && (
            <div
              className="flex gap-3 mb-6"
              role="group"
              aria-label="Iniciar sesión con red social"
            >
              {URL_GOOGLE && (
                <BotonSocial
                  href={URL_GOOGLE}
                  etiqueta="Inicia sesión con Google"
                  icono={<IconoGoogle />}
                  distribucion="mitad"
                />
              )}
              {URL_FACEBOOK && (
                <BotonSocial
                  href={URL_FACEBOOK}
                  etiqueta="Inicia sesión con Facebook"
                  icono={<IconoFacebook />}
                  distribucion="mitad"
                />
              )}
            </div>
          )}

          <Suspense fallback={<p role="status">Cargando formulario...</p>}>
            <FormularioLogin />
          </Suspense>

          <EnlaceCambioModo
            texto="¿No tienes cuenta?"
            etiquetaEnlace="Registrarse aquí"
            href="/auth/registro"
          />
        </VentanaAuth>
      </div>
    </ContenedorPagina>
  );
}
