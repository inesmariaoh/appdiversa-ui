/**
 * Servicio para consumir el endpoint de configuracion de interfaz.
 * GET /api/v1/interfaz/configuracion/
 */

import type {
  AccesibilidadServidor,
  CodigoLogoInterfaz,
  ConfiguracionInterfaz,
  LogoInterfaz,
} from '@/types/interfaz';
import {
  resolverFlujoFormulario,
  type FlujoFormularioEntrada,
  type ParametrosResolverFlujoFormulario,
} from '@/utils/flujoFormularioInterfaz';
import { apiCliente } from './api';

const RUTA_CONFIGURACION = '/api/v1/interfaz/configuracion/';

const ACCESIBILIDAD_FALLBACK: AccesibilidadServidor = {
  lectura_voz_habilitada: true,
  comandos_voz_habilitada: false,
  lengua_senas_habilitada: false,
  fuente_dislexia_habilitada: false,
  tema_por_defecto: 'claro',
  centro_relevo_habilitado: false,
  url_centro_relevo: '',
};

function normalizarAccesibilidad(
  valor: Partial<AccesibilidadServidor> | undefined
): AccesibilidadServidor {
  if (!valor) {
    return { ...ACCESIBILIDAD_FALLBACK };
  }
  return { ...ACCESIBILIDAD_FALLBACK, ...valor };
}

const CONFIGURACION_FALLBACK: ConfiguracionInterfaz = {
  nombre_aplicativo: 'Divers App',
  nombre_corto: null,
  descripcion_aplicativo: '',
  logo_institucional: null,
  logo_principal: null,
  logo_secundario: null,
  favicon: null,
  color_primario: '#3B2484',
  color_secundario: '#A50034',
  color_acento: '#00B4A0',
  color_fondo_pagina: '#F0F0F0',
  color_fondo_tarjeta: '#FFFFFF',
  color_error: '#E53E3E',
  texto_pie_pagina: '© 2025 DANE - SEN - App Recolección Datos',
  texto_contacto: 'Contacto',
  url_contacto: '/contacto',
  email_soporte: null,
  accion_lengua_senas_habilitada: false,
  url_lengua_senas: null,
  texto_lengua_senas: null,
  meta_titulo_seo: null,
  meta_descripcion_seo: null,
};

type RespuestaConfiguracionInterfaz = Partial<ConfiguracionInterfaz> & {
  logos?: LogoInterfaz[];
  flujo_formulario?: FlujoFormularioEntrada;
};

function textoOFallback(
  valor: string | null | undefined,
  fallback: string
): string {
  return valor?.trim() ? valor.trim() : fallback;
}

function urlImagenONulo(valor: string | null | undefined): string | null {
  return valor?.trim() ? valor.trim() : null;
}

function resolverLogo(
  codigo: CodigoLogoInterfaz,
  data: RespuestaConfiguracionInterfaz,
  urlPlano: string | null | undefined,
  altPlano: string | null | undefined
): { url: string | null; alt: string } {
  const logoLista = data.logos?.find((logo) => logo.codigo === codigo);
  const url = urlImagenONulo(logoLista?.url ?? urlPlano);
  const alt = textoOFallback(
    logoLista?.texto_alternativo ?? altPlano,
    logoLista?.nombre ?? ''
  );

  return { url, alt };
}

function normalizarConfiguracion(
  data: RespuestaConfiguracionInterfaz
): ConfiguracionInterfaz {
  const logoInstitucional = resolverLogo(
    'logo_institucional',
    data,
    data.logo_institucional,
    data.logo_institucional_alt
  );
  const logoPrincipal = resolverLogo(
    'logo_principal',
    data,
    data.logo_principal,
    data.logo_principal_alt
  );
  const logoSecundario = resolverLogo(
    'logo_secundario',
    data,
    data.logo_secundario,
    data.logo_secundario_alt
  );
  const favicon = resolverLogo(
    'favicon',
    data,
    data.favicon,
    data.favicon_alt
  );

  const base: Omit<
    ConfiguracionInterfaz,
    'flujo_formulario' | 'flujo_formulario_es_fallback'
  > = {
    nombre_aplicativo: textoOFallback(
      data.nombre_aplicativo,
      CONFIGURACION_FALLBACK.nombre_aplicativo
    ),
    nombre_corto: data.nombre_corto?.trim() || null,
    descripcion_aplicativo: data.descripcion_aplicativo?.trim() ?? '',
    logo_institucional: logoInstitucional.url,
    logo_institucional_alt: logoInstitucional.alt || 'DANE y SEN',
    logo_principal: logoPrincipal.url,
    logo_principal_alt:
      logoPrincipal.alt || textoOFallback(data.nombre_aplicativo, CONFIGURACION_FALLBACK.nombre_aplicativo),
    logo_secundario: logoSecundario.url,
    logo_secundario_alt: logoSecundario.alt,
    favicon: favicon.url,
    favicon_alt: favicon.alt,
    logos: data.logos,
    color_primario: textoOFallback(
      data.color_primario,
      CONFIGURACION_FALLBACK.color_primario
    ),
    color_secundario: textoOFallback(
      data.color_secundario,
      CONFIGURACION_FALLBACK.color_secundario
    ),
    color_acento: textoOFallback(
      data.color_acento,
      CONFIGURACION_FALLBACK.color_acento
    ),
    color_fondo_pagina: textoOFallback(
      data.color_fondo_pagina,
      CONFIGURACION_FALLBACK.color_fondo_pagina
    ),
    color_fondo_tarjeta: textoOFallback(
      data.color_fondo_tarjeta,
      CONFIGURACION_FALLBACK.color_fondo_tarjeta
    ),
    color_error: textoOFallback(
      data.color_error,
      CONFIGURACION_FALLBACK.color_error
    ),
    texto_pie_pagina: textoOFallback(
      data.texto_pie_pagina,
      CONFIGURACION_FALLBACK.texto_pie_pagina
    ),
    texto_contacto: textoOFallback(
      data.texto_contacto,
      CONFIGURACION_FALLBACK.texto_contacto
    ),
    url_contacto: textoOFallback(
      data.url_contacto,
      CONFIGURACION_FALLBACK.url_contacto
    ),
    email_soporte: data.email_soporte?.trim() || null,
    accion_lengua_senas_habilitada:
      data.accion_lengua_senas_habilitada ??
      CONFIGURACION_FALLBACK.accion_lengua_senas_habilitada,
    url_lengua_senas: data.url_lengua_senas?.trim() || null,
    texto_lengua_senas: data.texto_lengua_senas?.trim() || null,
    meta_titulo_seo: data.meta_titulo_seo?.trim() || null,
    meta_descripcion_seo: data.meta_descripcion_seo?.trim() || null,
    texto_titulo_seccion_encuestas:
      data.texto_titulo_seccion_encuestas?.trim() || null,
    texto_descripcion_seccion_encuestas:
      data.texto_descripcion_seccion_encuestas?.trim() || null,
    accesibilidad: normalizarAccesibilidad(data.accesibilidad),
  };

  const parametrosFlujo: ParametrosResolverFlujoFormulario = {
    flujo_formulario: data.flujo_formulario,
    email_soporte: base.email_soporte,
  };
  const { flujo, esFallback } = resolverFlujoFormulario(parametrosFlujo);

  return {
    ...base,
    flujo_formulario: flujo,
    flujo_formulario_es_fallback: esFallback,
  };
}

export async function obtenerConfiguracionInterfaz(
  idioma?: string
): Promise<ConfiguracionInterfaz> {
  try {
    const respuesta = await apiCliente.get<RespuestaConfiguracionInterfaz>(
      RUTA_CONFIGURACION,
      {
        params: idioma ? { idioma } : undefined,
      }
    );
    return normalizarConfiguracion(respuesta.data);
  } catch {
    return normalizarConfiguracion({});
  }
}

export { CONFIGURACION_FALLBACK };
