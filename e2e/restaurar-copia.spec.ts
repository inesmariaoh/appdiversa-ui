import { test, expect } from '@playwright/test';

test.describe('Restaurar contrasena E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/v1/**', async (route) => {
      const solicitud = route.request();
      const url = new URL(solicitud.url());
      const metodo = solicitud.method();
      const pathname = url.pathname;

      if (pathname.includes('solicitar-restaurar-password') && metodo === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            detalle:
              'Si el correo esta registrado, recibiras instrucciones para restaurar la contrasena.',
          }),
        });
        return;
      }

      if (pathname.includes('restaurar-password') && metodo === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ detalle: 'Contrasena restaurada correctamente.' }),
        });
        return;
      }

      await route.continue();
    });
  });

  test('login enlaza a solicitar restauracion y completa flujo', async ({ page }) => {
    await page.goto('/auth/login');
    await page.getByRole('link', { name: /olvidaste tu contrasena/i }).click();
    await expect(page).toHaveURL(/\/auth\/solicitar-restaurar-password/);

    await page.getByLabel(/correo electronico/i).fill('usuario@correo.com');
    await page.getByRole('button', { name: /enviar instrucciones/i }).click();
    await expect(page.getByRole('status').filter({ hasText: /instrucciones/i })).toBeVisible({
      timeout: 10_000,
    });

    await page.goto('/auth/restaurar-password?uid=fake-uid&token=fake-token');
    await page.getByLabel(/^nueva contrasena$/i).fill('nueva1234');
    await page.getByLabel(/confirmar contrasena/i).fill('nueva1234');
    await page.getByRole('button', { name: /restaurar contrasena/i }).click();
    await expect(page.getByRole('status').filter({ hasText: /restaurada/i })).toBeVisible();
    await page.getByRole('button', { name: /ir a inicio de sesion/i }).click();
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});
