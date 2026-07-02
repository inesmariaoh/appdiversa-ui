'use client';

/**
 * Inicializa la sesion de autenticacion Django en el cliente.
 */

import { useAuthInicial } from '@/hooks/useAuthInicial';

export function InicializadorAuth() {
  useAuthInicial();
  return null;
}
