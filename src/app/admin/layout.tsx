'use client';

/**
 * Layout del panel administrativo con menu lateral y proteccion de rutas.
 */

import { RutaProtegida } from '@/components/auth/006_ruta_protegida';
import { MenuLateralAdmin } from '@/components/admin/001_menu_lateral';
import { ContenedorPagina } from '@/components/layout/003_contenedor_pagina';

export default function LayoutAdmin({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <RutaProtegida>
      <ContenedorPagina etiquetaAria="Panel administrativo">
        <div className="flex flex-col lg:flex-row gap-6">
          <MenuLateralAdmin />
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </ContenedorPagina>
    </RutaProtegida>
  );
}
