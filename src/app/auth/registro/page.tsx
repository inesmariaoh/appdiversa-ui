/**
 * Pagina de registro publico: cualquier persona puede crear una cuenta normal.
 * Los roles administrativos no se asignan en el autorregistro; se otorgan aparte.
 * Keycloak queda como integracion social opcional.
 */

import { ContenedorPagina } from '@/components/layout/003_contenedor_pagina';
import { VentanaAuth } from '@/components/auth/001_ventana_auth';
import { EncabezadoAuth } from '@/components/auth/002_encabezado_auth';
import { BotonSocial, IconoGoogle, IconoFacebook } from '@/components/auth/003_boton_social';
import { EnlaceCambioModo } from '@/components/auth/005_enlace_cambio_modo';
import { FormularioRegistroCorreo } from './correo/FormularioRegistroCorreo';
import { obtenerConfiguracionInterfaz } from '@/services/interfazServicio';
import { obtenerIdiomaServidor } from '@/utils/obtenerIdiomaServidor';

const URL_GOOGLE = process.env.NEXT_PUBLIC_KEYCLOAK_GOOGLE_URL?.trim() ?? '';
const URL_FACEBOOK = process.env.NEXT_PUBLIC_KEYCLOAK_FACEBOOK_URL?.trim() ?? '';
const URL_TERMINOS = process.env.NEXT_PUBLIC_URL_TERMINOS?.trim() ?? '#';

export default async function PaginaRegistro() {
  const idioma = await obtenerIdiomaServidor();
  const configuracion = await obtenerConfiguracionInterfaz(idioma);
  const keycloakConfigurado = Boolean(URL_GOOGLE || URL_FACEBOOK);

  return (
    <ContenedorPagina etiquetaAria="Registro de usuario">
      <div className="flex justify-center py-10 px-4">
        <VentanaAuth>
          <EncabezadoAuth
            titulo="Crea tu cuenta"
            subtitulo={configuracion.descripcion_aplicativo || undefined}
          />

          {keycloakConfigurado && (
            <>
              <p className="text-xs mb-3" style={{ color: 'var(--color-texto-muted)' }}>
                Regístrate con un proveedor de identidad:
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

          <FormularioRegistroCorreo urlTerminos={URL_TERMINOS} />

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
