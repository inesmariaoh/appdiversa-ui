import { describe, it, expect } from 'vitest';
import { aplicarTokensInterfaz, formularioEstaVigente } from './tokensInterfaz';
import { CONFIGURACION_FALLBACK } from '@/services/interfazServicio';

describe('tokensInterfaz', () => {
  it('genera variables CSS desde configuracion', () => {
    const estilos = aplicarTokensInterfaz(CONFIGURACION_FALLBACK);

    expect(estilos['--color-primario']).toBe(CONFIGURACION_FALLBACK.color_primario);
    expect(estilos['--color-secundario']).toBe(CONFIGURACION_FALLBACK.color_secundario);
  });

  it('valida vigencia de formulario por fechas', () => {
    const referencia = new Date('2026-06-01');
    expect(
      formularioEstaVigente('2026-01-01', '2026-12-31', referencia)
    ).toBe(true);
    expect(
      formularioEstaVigente('2027-01-01', null, referencia)
    ).toBe(false);
  });
});
