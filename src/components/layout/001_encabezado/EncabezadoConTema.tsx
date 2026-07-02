'use client';

/**
 * Encabezado alimentado desde el store de interfaz y autenticacion.
 */

import { Encabezado } from '@/components/layout/001_encabezado';
import { useInterfazStore } from '@/store/interfazStore';
import { useAuthStore } from '@/store/authStore';

export function EncabezadoConTema() {
  const configuracion = useInterfazStore((s) => s.configuracion);
  const autenticado = useAuthStore((s) => s.autenticado);

  if (!configuracion) return null;

  return (
    <Encabezado
      configuracion={{
        nombre_aplicativo: configuracion.nombre_aplicativo,
        logo_institucional: configuracion.logo_institucional,
        logo_institucional_alt: configuracion.logo_institucional_alt,
        logo_principal: configuracion.logo_principal,
        logo_principal_alt: configuracion.logo_principal_alt,
        texto_contacto: configuracion.texto_contacto,
        url_contacto: configuracion.url_contacto,
        color_primario: configuracion.color_primario,
      }}
      usuarioAutenticado={autenticado}
    />
  );
}
