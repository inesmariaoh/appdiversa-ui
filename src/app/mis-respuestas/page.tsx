/**
 * Pagina de historial de respuestas del usuario autenticado.
 * Diseno: Title (1).png + cardsWrapper (1).png (parte04).
 * Proteccion de ruta: RutaProtegida (cliente) redirige a login si no hay sesion.
 */

import { ContenedorPagina } from '@/components/layout/003_contenedor_pagina';
import { Migas } from '@/components/layout/004_migas';
import { ContenidoHistorial } from './ContenidoHistorial';

const MIGAS = [
  { etiqueta: 'Inicio', href: '/' },
  { etiqueta: 'Historial de respuestas' },
];

export default function PaginaHistorialRespuestas() {
  return (
    <ContenedorPagina etiquetaAria="Historial de respuestas">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Migas items={MIGAS} />
        <h1
          className="text-2xl font-bold mt-2 mb-8"
          style={{ color: 'var(--color-texto-primario)' }}
        >
          Historial de respuestas
        </h1>
        <ContenidoHistorial />
      </div>
    </ContenedorPagina>
  );
}
