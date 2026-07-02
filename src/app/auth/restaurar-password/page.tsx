/**
 * Pagina para establecer nueva contrasena desde enlace de restauracion.
 */

import { Suspense } from 'react';
import { ContenedorPagina } from '@/components/layout/003_contenedor_pagina';
import { VentanaAuth } from '@/components/auth/001_ventana_auth';
import { EncabezadoAuth } from '@/components/auth/002_encabezado_auth';
import { FormularioRestaurarPassword } from '@/components/auth/011_formulario_restaurar_password';

export default function PaginaRestaurarPassword() {
  return (
    <ContenedorPagina etiquetaAria="Restaurar contraseña">
      <div className="flex justify-center py-10 px-4">
        <VentanaAuth>
          <EncabezadoAuth titulo="Nueva contraseña" />
          <Suspense fallback={<p role="status">Cargando formulario...</p>}>
            <FormularioRestaurarPassword />
          </Suspense>
        </VentanaAuth>
      </div>
    </ContenedorPagina>
  );
}
