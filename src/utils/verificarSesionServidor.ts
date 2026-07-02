/**
 * Verifica si existe una sesion Django activa en el servidor.
 * Comprueba la presencia de la cookie de sesion de Django ('sessionid').
 * No valida el token contra el backend — eso lo hace el componente cliente al cargar.
 * Para proteccion real de datos usar RutaProtegida en el cliente.
 */

import { cookies } from 'next/headers';

const NOMBRE_COOKIE_SESION_DJANGO = 'sessionid';

/**
 * Retorna true si la cookie de sesion Django esta presente.
 * Util para redirigir a /auth/login en Server Components sin doble fetch.
 */
export async function verificarSesionServidor(): Promise<boolean> {
  const almacen = await cookies();
  const cookie = almacen.get(NOMBRE_COOKIE_SESION_DJANGO);
  return Boolean(cookie?.value);
}
