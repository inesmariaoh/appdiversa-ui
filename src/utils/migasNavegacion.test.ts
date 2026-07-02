import { describe, it, expect } from 'vitest';
import { migasDesdeInicio, resolverMigasAuth, MIGA_INICIO } from './migasNavegacion';

describe('migasNavegacion', () => {
  it('expone miga de inicio con enlace al listado de encuestas', () => {
    expect(MIGA_INICIO).toEqual({ etiqueta: 'Inicio', href: '/' });
  });

  it('construye migas desde inicio', () => {
    expect(migasDesdeInicio([{ etiqueta: 'Contacto' }])).toEqual([
      { etiqueta: 'Inicio', href: '/' },
      { etiqueta: 'Contacto' },
    ]);
  });

  it('resuelve migas para login', () => {
    const migas = resolverMigasAuth('/auth/login');
    expect(migas[0]).toEqual(MIGA_INICIO);
    expect(migas.at(-1)?.etiqueta).toBe('Iniciar sesión');
  });

  it('resuelve migas anidadas para registro con correo', () => {
    const migas = resolverMigasAuth('/auth/registro/correo');
    expect(migas).toEqual([
      { etiqueta: 'Inicio', href: '/' },
      { etiqueta: 'Registro', href: '/auth/registro' },
      { etiqueta: 'Registro con correo electrónico' },
    ]);
  });
});
