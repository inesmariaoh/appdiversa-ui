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

function respuestaSesionYRespuestas(
  pathname: string,
  metodo: string,
): RespuestaApiSimulada | null {
  if (pathname.endsWith('/respuestas/') && metodo === 'GET') {
    return {
      status: 200,
      body: {
        uuid_sesion: 'e2e-sesion-0001',
        estado: 'en_proceso',
        respuestas: [],
      },
    };
  }

  if (pathname.endsWith('/sesiones/') && metodo === 'POST') {
    return {
      status: 201,
      body: {
        uuid_sesion: 'e2e-sesion-0001',
        token_cliente: 'e2e-token-0001',
        estado: 'en_proceso',
      },
    };
  }

  if (pathname === '/api/v1/respuestas/' && metodo === 'POST') {
    return {
      status: 201,
      body: { guardado: true },
    };
  }

  return null;
}

function respuestaReglasYFinalizacion(
  pathname: string,
  metodo: string,
): RespuestaApiSimulada | null {
  if (pathname.endsWith('/evaluar-reglas/') && metodo === 'POST') {
    return {
      status: 200,
      body: RESULTADO_REGLAS_VACIO,
    };
  }

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
        mensaje: 'Formulario finalizado',
        resumen: {
          uuid_sesion: 'e2e-sesion-0001',
          estado: 'finalizada',
          formulario: {
            uuid: UUID_FORMULARIO,
            codigo: 'E2E-01',
            nombre: 'Encuesta E2E',
          },
          version: { numero_version: 1 },
          respuestas: [],
        },
      },
    };
  }

  return null;
}

function respuestaResumenYUtilidades(
  pathname: string,
  metodo: string,
): RespuestaApiSimulada | null {
  if (pathname.endsWith('/resumen/') && metodo === 'GET') {
    return {
      status: 200,
      body: {
        uuid_sesion: 'e2e-sesion-0001',
        estado: 'finalizada',
        formulario: {
          uuid: UUID_FORMULARIO,
          codigo: 'E2E-01',
          nombre: 'Encuesta E2E',
        },
        version: { numero_version: 1 },
        respuestas: [
          {
            seccion_codigo: 'SEC-01',
            seccion_titulo: 'Seccion principal',
            pregunta_codigo: 'P_NOMBRE',
            pregunta_texto: 'Su nombre',
            tipo_pregunta: 'texto_corto',
            valor: 'Ana',
            observacion: '',
          },
        ],
      },
    };
  }

  if (pathname.endsWith('/enviar-copia/') && metodo === 'POST') {
    return {
      status: 200,
      body: {
        detalle: 'La copia de respuestas fue enviada al correo indicado.',
      },
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

  if (pathname === '/api/v1/salud/' && metodo === 'GET') {
    return {
      status: 200,
      body: { estado: 'ok' },
    };
  }

  return null;
}

function obtenerRespuestaApiSimulada(
  pathname: string,
  metodo: string,
): RespuestaApiSimulada | null {
  return (
    respuestaSesionYRespuestas(pathname, metodo)
    ?? respuestaReglasYFinalizacion(pathname, metodo)
    ?? respuestaResumenYUtilidades(pathname, metodo)
  );
}

async function manejarRutaApiSimulada(route: Route): Promise<void> {
  const solicitud = route.request();
  const url = new URL(solicitud.url());
  const respuesta = obtenerRespuestaApiSimulada(url.pathname, solicitud.method());

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

test.describe('Flujo de formulario con API simulada', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/v1/**', manejarRutaApiSimulada);
  });

  test('navega verificacion y diligencia la primera pregunta', async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto(`/encuestas/${UUID_FORMULARIO}`);

    await page
      .getByRole('button', { name: /aceptar y comenzar encuesta/i })
      .click();

    const campoVerificacion = page.getByRole('textbox');
    await expect(campoVerificacion).toBeVisible({ timeout: 15_000 });
    await campoVerificacion.fill('ABC123');
    await page.getByRole('button', { name: /continuar/i }).click();

    await expect(page).toHaveURL(new RegExp(`/encuestas/${UUID_FORMULARIO}/responder`));
    await expect(page.getByText(/codigo de verificacion/i)).toBeVisible();

    await page.getByRole('textbox').fill('ABC123');
    await page.getByRole('button', { name: /continuar/i }).click();

    await expect(page.getByText(/su nombre/i)).toBeVisible();

    await page.getByRole('textbox').fill('Ana');
    await page.getByRole('button', { name: /finalizar/i }).click();
    await page.getByRole('button', { name: /confirmar env/i }).click();

    await expect(page).toHaveURL(new RegExp(`/encuestas/${UUID_FORMULARIO}/resumen`), {
      timeout: 15_000,
    });
    await expect(page.getByText('Formulario enviado correctamente.')).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText(/ana/i)).toBeVisible();

    await page.getByLabel(/correo electronico/i).fill('copia@correo.com');
    await page.getByRole('button', { name: /enviar copia/i }).click();
    await expect(
      page.getByRole('status').filter({ hasText: /copia de respuestas/i })
    ).toBeVisible({ timeout: 10_000 });
  });
});
