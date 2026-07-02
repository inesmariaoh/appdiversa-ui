import { test, expect } from '@playwright/test';

const UUID_FUTURO = '00000000-0000-4000-8000-000000000002';

test.describe('Encuestas proximamente E2E', () => {
  test('muestra encuesta disponible y futura en el listado', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('Encuesta E2E')).toBeVisible();
    await expect(page.getByText('Encuesta Futura E2E')).toBeVisible();
  });

  test('encuesta futura muestra Proximamente y no navega al formulario', async ({ page }) => {
    await page.goto('/');

    const tarjetaFutura = page.getByRole('article', {
      name: /encuesta próximamente disponible: encuesta futura e2e/i,
    });
    await expect(tarjetaFutura).toBeVisible();
    await expect(tarjetaFutura.getByText('Próximamente')).toHaveCount(2);
    await expect(tarjetaFutura.getByText(/Lanzamiento: Ago 2026/i)).toBeVisible();

    const botonProximamente = tarjetaFutura.getByRole('button', {
      name: /encuesta próximamente disponible/i,
    });
    await expect(botonProximamente).toBeDisabled();

    await page.goto(`/encuestas/${UUID_FUTURO}`);
    await expect(
      page.getByText(/esta encuesta estará disponible próximamente/i)
    ).toBeVisible();
    await expect(page.getByRole('textbox')).not.toBeVisible();
  });

  test('encuesta disponible inicia flujo al aceptar terminos', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: /iniciar encuesta: encuesta e2e/i }).click();
    await page.getByRole('button', { name: /aceptar y comenzar encuesta/i }).click();
    await expect(page.getByRole('textbox')).toBeVisible({ timeout: 10_000 });
  });
});
