import { test, expect, type Page } from '@playwright/test';

async function iniciarSesionAdmin(
  page: Page,
  usuario: string,
  contrasena: string
): Promise<void> {
  await page.goto('/auth/login');
  await page
    .getByRole('textbox', { name: /correo electronico o numero de celular o usuario/i })
    .fill(usuario);
  await page.getByLabel(/^contrasena$/i).fill(contrasena);
  await page.getByRole('button', { name: /inicia sesion/i }).click();
  await expect(page).toHaveURL(/\/admin\/formularios/, { timeout: 15_000 });
}

test.describe('Autenticacion Django y guards E2E', () => {
  test('usuario no autenticado no accede al panel admin', async ({ page }) => {
    await page.goto('/admin/formularios');
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 15_000 });
  });

  test('lector solo puede ver formularios sin editar ni publicar', async ({ page }) => {
    await iniciarSesionAdmin(page, 'lector_formularios', 'demo1234');

    await expect(page.getByRole('link', { name: 'Crear formulario' })).not.toBeVisible();
    await expect(page.getByRole('button', { name: 'Editar' })).not.toBeVisible();
    await expect(page.getByRole('button', { name: 'Publicar' })).not.toBeVisible();
    await expect(page.getByRole('button', { name: 'Ver', exact: true })).toBeVisible();
  });

  test('editor edita formularios pero no puede publicar', async ({ page }) => {
    await iniciarSesionAdmin(page, 'editor_formularios', 'demo1234');

    await expect(page.getByRole('link', { name: 'Crear formulario' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Editar' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Publicar' })).not.toBeVisible();
  });

  test('gestor puede publicar formularios', async ({ page }) => {
    await iniciarSesionAdmin(page, 'gestor_formularios', 'demo1234');

    await expect(page.getByRole('button', { name: 'Publicar' })).toBeVisible();
  });

  test('admin_appdiversa gestiona usuarios', async ({ page }) => {
    await iniciarSesionAdmin(page, 'admin_appdiversa', 'demo1234');

    await page.goto('/admin/usuarios');
    await expect(page.getByRole('heading', { name: 'Usuarios' })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByRole('button', { name: 'Crear usuario' })).toBeVisible();
  });

  test('editor no accede a gestion de usuarios', async ({ page }) => {
    await iniciarSesionAdmin(page, 'editor_formularios', 'demo1234');

    await page.goto('/admin/usuarios');
    await expect(page.getByText(/su rol no permite/i)).toBeVisible({ timeout: 15_000 });
  });
});
