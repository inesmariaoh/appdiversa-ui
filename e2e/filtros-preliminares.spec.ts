import { test, expect } from '@playwright/test';

const UUID_FORMULARIO_FILTROS = '00000000-0000-4000-8000-000000000099';

test.describe('Filtros preliminares', () => {
  test('bloquea continuar con fecha menor de edad', async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto(`/encuestas/${UUID_FORMULARIO_FILTROS}`);

    await page.locator('#P1-anio').selectOption('2012');
    await page.locator('#P1-mes').selectOption('9');
    await page.locator('#P1-dia').selectOption('23');
    await expect(
      page.getByText('Debes tener 18 años o más para participar', { exact: false }),
    ).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('button', { name: /Continuar/i })).toBeDisabled();
  });

  test('muestra modal al responder No en residencia', async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto(`/encuestas/${UUID_FORMULARIO_FILTROS}`);

    await page.locator('#P1-anio').selectOption('1990');
    await page.locator('#P1-mes').selectOption('5');
    await page.locator('#P1-dia').selectOption('10');
    await page.getByRole('button', { name: /Continuar/i }).click();
    await page.locator('label[for="P2-OP-NO"]').click();
    await page.getByRole('button', { name: /Continuar/i }).click();
    await expect(page.getByText('Gracias por participar.')).toBeVisible({ timeout: 15_000 });
  });

  test('muestra verificacion exitosa y permite ingresar al formulario', async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto(`/encuestas/${UUID_FORMULARIO_FILTROS}`);

    await page.locator('#P1-anio').selectOption('1990');
    await page.locator('#P1-mes').selectOption('5');
    await page.locator('#P1-dia').selectOption('10');
    await page.getByRole('button', { name: /Continuar/i }).click();
    await page.locator('label[for="P2-OP-SI"]').click();
    await page.getByRole('button', { name: /Continuar/i }).click();
    await expect(page.getByText('¡Verificado con éxito!')).toBeVisible({ timeout: 15_000 });
    await page.getByRole('button', { name: /Aceptar y comenzar encuesta/i }).click();
    await expect(page).toHaveURL(new RegExp(`/encuestas/${UUID_FORMULARIO_FILTROS}/responder`), {
      timeout: 15_000,
    });
    await expect(page.getByText(/Pregunta principal/i)).toBeVisible({ timeout: 15_000 });
  });
});
