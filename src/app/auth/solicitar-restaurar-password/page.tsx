/**
 * Pagina para solicitar restauracion de contrasena por correo.
 */

import { ContenedorPagina } from '@/components/layout/003_contenedor_pagina';
import { VentanaAuth } from '@/components/auth/001_ventana_auth';
import { EncabezadoAuth } from '@/components/auth/002_encabezado_auth';
import { FormularioSolicitarRestaurarPassword } from '@/components/auth/010_formulario_solicitar_restaurar_password';

export default function PaginaSolicitarRestaurarPassword() {
  return (
    <ContenedorPagina etiquetaAria="Restaurar contraseña">
      <div className="flex justify-center py-10 px-4">
        <VentanaAuth>
          <EncabezadoAuth
            titulo="Restaurar contraseña"
            subtitulo="Te enviaremos instrucciones si el correo está registrado"
          />
          <FormularioSolicitarRestaurarPassword />
        </VentanaAuth>
      </div>
    </ContenedorPagina>
  );
}
