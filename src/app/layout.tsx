import type { Metadata } from 'next';
import './globals.css';
import { BarraFlotante } from '@/components/accesibilidad/002_barra_flotante';
import { EncabezadoConTema } from '@/components/layout/001_encabezado/EncabezadoConTema';
import { PiePagina } from '@/components/layout/002_pie_pagina';
import { ProveedorApp } from '@/components/layout/008_proveedor_app';
import { ProveedorAccesibilidad } from '@/components/layout/ProveedorAccesibilidad';
import { RegistrarServiceWorker } from '@/components/layout/RegistrarServiceWorker';
import { NotificationCenter } from '@/components/ui/006_proveedores_ui/NotificationCenter';
import { obtenerConfiguracionInterfaz } from '@/services/interfazServicio';
import { aplicarTokensInterfaz } from '@/utils/tokensInterfaz';
import { obtenerIdiomaServidor } from '@/utils/obtenerIdiomaServidor';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const config = await obtenerConfiguracionInterfaz();
  return {
    title: config.meta_titulo_seo ?? config.nombre_aplicativo,
    description:
      config.meta_descripcion_seo ?? config.descripcion_aplicativo,
    ...(config.favicon ? { icons: { icon: config.favicon } } : {}),
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const idioma = await obtenerIdiomaServidor();
  const configuracion = await obtenerConfiguracionInterfaz(idioma);
  const estilosTokens = aplicarTokensInterfaz(configuracion);

  return (
    <html lang={idioma} suppressHydrationWarning style={estilosTokens}>
      <body className="min-h-screen flex flex-col antialiased">
        <RegistrarServiceWorker />
        <ProveedorApp configuracion={configuracion}>
          <ProveedorAccesibilidad>
            <a href="#contenido-principal" className="saltar-al-contenido">
              Saltar al contenido principal
            </a>

            <BarraFlotante
              lenguaSenasHabilitada={configuracion.accion_lengua_senas_habilitada}
              urlLenguaSenas={configuracion.url_lengua_senas}
              textoLenguaSenas={configuracion.texto_lengua_senas}
            />

            <EncabezadoConTema />

            {children}

            <PiePagina textoPie={configuracion.texto_pie_pagina} />
            <NotificationCenter />
          </ProveedorAccesibilidad>
        </ProveedorApp>
      </body>
    </html>
  );
}
