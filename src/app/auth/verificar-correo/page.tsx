/**
 * Pagina de verificacion de correo electronico desde el enlace enviado al usuario.
 */

import { Suspense } from 'react';
import { ContenedorPagina } from '@/components/layout/003_contenedor_pagina';
import { VentanaAuth } from '@/components/auth/001_ventana_auth';
import { EncabezadoAuth } from '@/components/auth/002_encabezado_auth';
import { ContenidoVerificarCorreo } from '@/components/auth/013_verificar_correo';

export default function PaginaVerificarCorreo() {
  return (
    <ContenedorPagina etiquetaAria="Verificar correo electrónico">
      <div className="flex justify-center py-10 px-4">
        <VentanaAuth>
          <EncabezadoAuth titulo="Verificación de correo" />
          <Suspense fallback={<output className="block">Cargando…</output>}>
            <ContenidoVerificarCorreo />
          </Suspense>
        </VentanaAuth>
      </div>
    </ContenedorPagina>
  );
}
