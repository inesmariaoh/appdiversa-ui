/**
 * Pagina de registro: disponible por invitacion de administradores.
 * Keycloak queda documentado como integracion futura.
 */

import { ContenedorPagina } from '@/components/layout/003_contenedor_pagina';
import { VentanaAuth } from '@/components/auth/001_ventana_auth';
import { EncabezadoAuth } from '@/components/auth/002_encabezado_auth';
import { BotonSocial, IconoGoogle, IconoFacebook } from '@/components/auth/003_boton_social';
import { EnlaceCambioModo } from '@/components/auth/005_enlace_cambio_modo';
import { obtenerConfiguracionInterfaz } from '@/services/interfazServicio';
import { obtenerIdiomaServidor } from '@/utils/obtenerIdiomaServidor';

const URL_GOOGLE = process.env.NEXT_PUBLIC_KEYCLOAK_GOOGLE_URL?.trim() ?? '';
const URL_FACEBOOK = process.env.NEXT_PUBLIC_KEYCLOAK_FACEBOOK_URL?.trim() ?? '';

export default async function PaginaRegistro() {
  const idioma = await obtenerIdiomaServidor();
  const configuracion = await obtenerConfiguracionInterfaz(idioma);
  const keycloakConfigurado = Boolean(URL_GOOGLE || URL_FACEBOOK);

  return (
    <ContenedorPagina etiquetaAria="Registro de usuario">
      <div className="flex justify-center py-10 px-4">
        <VentanaAuth>
          <EncabezadoAuth
            titulo="Registro de usuario"
            subtitulo={configuracion.descripcion_aplicativo || undefined}
          />

          <div
            className="p-4 rounded-lg mb-6 text-sm"
            role="status"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--color-primario) 8%, transparent)',
              color: 'var(--color-texto-primario)',
            }}
          >
            Registro disponible para administradores por invitación.
            Las encuestas públicas pueden diligenciarse sin registro ni inicio de sesión.
          </div>

          {keycloakConfigurado && (
            <>
              <p className="text-xs mb-3" style={{ color: 'var(--color-texto-muted)' }}>
                Integración con proveedor de identidad (Keycloak) — versión futura:
              </p>
              <div className="flex flex-col gap-3 mb-5">
                {URL_GOOGLE && (
                  <BotonSocial
                    href={URL_GOOGLE}
                    etiqueta="Regístrate con Google"
                    icono={<IconoGoogle />}
                  />
                )}
                {URL_FACEBOOK && (
                  <BotonSocial
                    href={URL_FACEBOOK}
                    etiqueta="Regístrate con Facebook"
                    icono={<IconoFacebook />}
                  />
                )}
              </div>
            </>
          )}

          <EnlaceCambioModo
            texto="¿Ya tienes cuenta?"
            etiquetaEnlace="Inicia sesión"
            href="/auth/login"
          />
        </VentanaAuth>
      </div>
    </ContenedorPagina>
  );
}
