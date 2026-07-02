import { test, expect } from '@playwright/test';

test.describe('Pagina de inicio', () => {
  test('carga la aplicacion y muestra region principal', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#contenido-principal')).toBeVisible();
  });

  test('muestra enlace saltar al contenido', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: /saltar al contenido/i })).toBeAttached();
  });
});
