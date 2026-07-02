/**
 * Pagina de registro con correo electronico.
 * Formulario: correo + contrasena + aceptar terminos.
 * Validacion con Zod en el cliente. Envio hacia endpoint del backend.
 * Todos los textos de la UI provienen de la configuracion del backend.
 */

import { ContenedorPagina } from '@/components/layout/003_contenedor_pagina';
import { VentanaAuth } from '@/components/auth/001_ventana_auth';
import { EncabezadoAuth } from '@/components/auth/002_encabezado_auth';
import { EnlaceCambioModo } from '@/components/auth/005_enlace_cambio_modo';
import { FormularioRegistroCorreo } from './FormularioRegistroCorreo';
import { obtenerConfiguracionInterfaz } from '@/services/interfazServicio';
import { obtenerIdiomaServidor } from '@/utils/obtenerIdiomaServidor';

const URL_TERMINOS = process.env.NEXT_PUBLIC_URL_TERMINOS?.trim() ?? '#';

export default async function PaginaRegistroCorreo() {
  const idioma = await obtenerIdiomaServidor();
  const configuracion = await obtenerConfiguracionInterfaz(idioma);

  return (
    <ContenedorPagina etiquetaAria="Registro con correo electrónico">
      <div className="flex justify-center py-10 px-4">
        <VentanaAuth>
          <EncabezadoAuth
            titulo="Registro con correo electrónico"
            subtitulo={configuracion.descripcion_aplicativo || undefined}
          />

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
