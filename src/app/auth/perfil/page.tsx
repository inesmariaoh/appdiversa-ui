import { redirect } from 'next/navigation';

/**
 * Mantiene compatibilidad con la ruta historica /auth/perfil.
 */
export default function PaginaPerfilAuthRedirect() {
  redirect('/perfil');
}
