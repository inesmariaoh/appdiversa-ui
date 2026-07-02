import { test, expect } from '@playwright/test';

test.describe('Contacto E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/v1/contacto/**', async (route) => {
      if (route.request().method() !== 'POST') {
        await route.continue();
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          detalle: 'Tu mensaje fue enviado correctamente. Te contactaremos pronto.',
        }),
      });
    });
  });

  test('envia mensaje de contacto y muestra confirmacion', async ({ page }) => {
    await page.goto('/contacto');

    await page.getByLabel(/^nombre$/i).fill('Usuario E2E');
    await page.getByLabel(/correo electronico/i).fill('contacto@correo.com');
    await page.getByLabel(/^asunto$/i).fill('Consulta E2E');
    await page.getByLabel(/^mensaje$/i).fill('Mensaje de prueba para contacto E2E.');
    await page.getByRole('button', { name: /enviar mensaje/i }).click();

    await expect(page.getByText(/mensaje fue enviado correctamente/i)).toBeVisible({
      timeout: 10_000,
    });
  });
});
