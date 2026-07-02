import { test, expect } from '@playwright/test';

const UUID_FORMULARIO = '00000000-0000-4000-8000-000000000001';

test.describe('Flujo modales formulario E2E', () => {
  test('muestra terminos al iniciar encuesta y permite aceptar', async ({ page }) => {
    await page.goto(`/encuestas/${UUID_FORMULARIO}`);

    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/Terminos y Condiciones E2E/i)).toBeVisible();
    await expect(page.getByText(/tratamiento de datos personales/i)).toBeVisible();

    await page.getByRole('button', { name: /aceptar y comenzar encuesta/i }).click();
    await expect(page.getByRole('textbox')).toBeVisible({ timeout: 10_000 });
  });

  test('no vuelve a mostrar terminos tras aceptar en la misma sesion', async ({ page }) => {
    await page.goto(`/encuestas/${UUID_FORMULARIO}`);
    await page.getByRole('button', { name: /aceptar y comenzar encuesta/i }).click();
    await expect(page.getByRole('textbox')).toBeVisible();

    await page.reload();
    await expect(page.getByRole('textbox')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('pagina publica de terminos renderiza texto de API', async ({ page }) => {
    await page.goto('/terminos-condiciones');
    await expect(page.getByRole('heading', { name: /Terminos y Condiciones E2E/i })).toBeVisible();
    await expect(page.getByText(/tratamiento de datos personales/i)).toBeVisible();
  });

  test('intentar salir con progreso muestra modal salir sin guardar', async ({ page }) => {
    await page.goto(`/encuestas/${UUID_FORMULARIO}`);
    await page.getByRole('button', { name: /aceptar y comenzar encuesta/i }).click();

    const campo = page.getByRole('textbox');
    await campo.fill('ABC123');
    await page.getByRole('button', { name: /volver/i }).click();

    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText(/Salir sin guardar/i)).toBeVisible();

    await page.getByRole('button', { name: /volver a la encuesta/i }).click();
    await expect(campo).toHaveValue('ABC123');
  });
});
