import { test, expect, type Route } from '@playwright/test';

const UUID_FORMULARIO = '00000000-0000-4000-8000-000000000001';

const RESULTADO_REGLAS_VACIO = {
  preguntas_ocultas: [],
  preguntas_visibles: [],
  preguntas_deshabilitadas: [],
  preguntas_habilitadas: [],
  preguntas_obligatorias: [],
  preguntas_opcionales: [],
  saltar_a_pregunta: null,
  saltar_a_seccion: null,
  finalizar_formulario: false,
  no_aplica_formulario: false,
  mensajes: [],
};

interface RespuestaApiSimulada {
  status: number;
  body: unknown;
}

function respuestaSesionOffline(pathname: string, metodo: string): RespuestaApiSimulada | null {
  if (pathname.endsWith('/sesiones/') && metodo === 'POST') {
    return {
      status: 201,
      body: {
        uuid_sesion: 'e2e-offline-01',
        token_cliente: 'e2e-offline-token',
        estado: 'en_proceso',
      },
    };
  }

  if (pathname === '/api/v1/respuestas/' && metodo === 'POST') {
    return {
      status: 201,
      body: { guardado: true, reglas: RESULTADO_REGLAS_VACIO },
    };
  }

  return null;
}

function respuestaReglasYSincronizacion(
  pathname: string,
  metodo: string,
): RespuestaApiSimulada | null {
  if (pathname.endsWith('/evaluar-reglas/') && metodo === 'POST') {
    return {
      status: 200,
      body: RESULTADO_REGLAS_VACIO,
    };
  }

  if (pathname === '/api/v1/salud/' && metodo === 'GET') {
    return {
      status: 200,
      body: { estado: 'ok' },
    };
  }

  if (pathname === '/api/v1/sincronizacion/' && metodo === 'POST') {
    return {
      status: 200,
      body: {
        operaciones_procesadas: 1,
        operaciones_actualizadas: 1,
        duplicadas: 0,
        conflictos: [],
        errores: [],
      },
    };
  }

  return null;
}

function respuestaFinalizacionOffline(
  pathname: string,
  metodo: string,
): RespuestaApiSimulada | null {
  if (pathname.endsWith('/validar-finalizacion/') && metodo === 'POST') {
    return {
      status: 200,
      body: {
        es_valido: true,
        total_pendientes: 0,
        preguntas_pendientes: [],
      },
    };
  }

  if (pathname.endsWith('/finalizar/') && metodo === 'POST') {
    return {
      status: 200,
      body: {
        estado: 'finalizada',
        mensaje: 'Finalizado offline',
        resumen: {
          uuid_sesion: 'e2e-offline-01',
          estado: 'finalizada',
          formulario: { uuid: UUID_FORMULARIO, codigo: 'E2E-01', nombre: 'Encuesta E2E' },
          version: { numero_version: 1 },
          respuestas: [],
        },
      },
    };
  }

  if (pathname.endsWith('/resumen/') && metodo === 'GET') {
    return {
      status: 200,
      body: {
        uuid_sesion: 'e2e-offline-01',
        estado: 'finalizada',
        formulario: { uuid: UUID_FORMULARIO, codigo: 'E2E-01', nombre: 'Encuesta E2E' },
        version: { numero_version: 1 },
        respuestas: [
          {
            seccion_codigo: 'SEC-VER',
            seccion_titulo: 'Verificacion',
            pregunta_codigo: 'P_VER',
            pregunta_texto: 'Codigo de verificacion',
            tipo_pregunta: 'texto_corto',
            valor: 'OFF123',
            observacion: '',
          },
          {
            seccion_codigo: 'SEC-01',
            seccion_titulo: 'Seccion principal',
            pregunta_codigo: 'P_NOMBRE',
            pregunta_texto: 'Su nombre',
            tipo_pregunta: 'texto_corto',
            valor: 'Usuario Offline',
            observacion: '',
          },
        ],
      },
    };
  }

  return null;
}

function obtenerRespuestaApiOffline(
  pathname: string,
  metodo: string,
): RespuestaApiSimulada | null {
  return (
    respuestaSesionOffline(pathname, metodo)
    ?? respuestaReglasYSincronizacion(pathname, metodo)
    ?? respuestaFinalizacionOffline(pathname, metodo)
  );
}

async function manejarRutaApiOffline(route: Route): Promise<void> {
  const solicitud = route.request();
  const url = new URL(solicitud.url());
  const respuesta = obtenerRespuestaApiOffline(url.pathname, solicitud.method());

  if (respuesta) {
    await route.fulfill({
      status: respuesta.status,
      contentType: 'application/json',
      body: JSON.stringify(respuesta.body),
    });
    return;
  }

  await route.continue();
}

test.describe('Flujo offline simulado', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/v1/**', manejarRutaApiOffline);
  });

  test('guarda respuesta sin red y sincroniza al reconectar', async ({ page, context }) => {
    test.setTimeout(60_000);
    await page.goto(`/encuestas/${UUID_FORMULARIO}/responder`);

    await page
      .getByRole('button', { name: /aceptar y comenzar encuesta/i })
      .click();

    const campo = page.getByRole('textbox');
    await expect(campo).toBeVisible({ timeout: 15_000 });

    await context.setOffline(true);
    await page.waitForTimeout(1200);

    await campo.fill('Offline');
    await page.waitForTimeout(1200);

    await expect(page.getByText(/pendiente de sincronizar/i)).toBeVisible({
      timeout: 10_000,
    });

    await context.setOffline(false);
    await page.evaluate(() => {
      globalThis.dispatchEvent(new Event('online'));
    });
    await page.waitForTimeout(2500);

    const botonReintentar = page.getByRole('button', { name: /reintentar sincronizacion/i });
    if (await botonReintentar.isVisible()) {
      await botonReintentar.click();
    }

    await expect(
      page.getByRole('status').filter({ hasText: /Sincronizado:\s*0 operacion/i })
    ).toBeVisible({
      timeout: 30_000,
    });

    await page.getByRole('button', { name: /continuar/i }).click();
    await expect(page.getByText(/su nombre/i)).toBeVisible();
  });
});
