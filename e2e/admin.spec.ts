import { test, expect } from '@playwright/test';

const UUID_FORMULARIO = '00000000-0000-4000-8000-000000000001';

test.describe('Panel administrativo E2E', () => {
  test('login admin, crear formulario, preview y logout; anonimo sigue viendo encuestas', async ({
    page,
  }) => {
    test.setTimeout(60_000);
    await page.goto('/auth/login');
    await page
      .getByRole('textbox', { name: /correo electronico o numero de celular o usuario/i })
      .fill('admin');
    await page.getByLabel(/^contrasena$/i).fill('admin123');
    await page.getByRole('button', { name: /inicia sesion/i }).click();

    await expect(page).toHaveURL(/\/admin\/formularios/);
    await page.getByRole('link', { name: 'Crear formulario' }).click();
    await page.getByLabel('Codigo').fill('E2E-ADMIN-01');
    await page.getByLabel('Nombre').fill('Formulario E2E Admin');
    await page.getByRole('button', { name: 'Crear formulario' }).click();

    await expect(page).toHaveURL(/\/admin\/formularios\/\d+\/editor/);
    await page.getByRole('tab', { name: 'Secciones' }).click();
    const editor = page.getByRole('main');
    await editor.getByRole('textbox', { name: 'Codigo' }).fill('SEC-E2E');
    await editor.getByRole('textbox', { name: 'Titulo' }).fill('Seccion E2E');
    await page.getByRole('button', { name: 'Crear seccion' }).click();

    await page.getByRole('tab', { name: 'Preguntas' }).click();
    await editor.getByRole('textbox', { name: 'Codigo' }).fill('P-E2E');
    await editor.getByRole('textbox', { name: 'Texto', exact: true }).fill('Pregunta E2E');
    await page.getByRole('button', { name: 'Crear pregunta' }).click();

    await page.getByRole('tab', { name: 'Vista previa' }).click();
    await expect(page.getByText('Vista previa: las respuestas no se guardan')).toBeVisible();

    await page.goto('/auth/salir');
    await page.goto('/');

    await expect(page.getByText('Encuesta E2E')).toBeVisible();
    await page.goto(`/encuestas/${UUID_FORMULARIO}`);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});
