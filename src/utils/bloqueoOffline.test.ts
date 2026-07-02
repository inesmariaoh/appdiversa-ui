import { describe, it, expect } from 'vitest';
import { debeBloquearFormularioOffline } from './bloqueoOffline';

describe('debeBloquearFormularioOffline', () => {
  it('bloquea cuando esta offline y el formulario no permite offline', () => {
    expect(
      debeBloquearFormularioOffline({
        modoPreview: false,
        enLinea: false,
        permiteOffline: false,
      })
    ).toBe(true);
  });

  it('no bloquea cuando esta en linea', () => {
    expect(
      debeBloquearFormularioOffline({
        modoPreview: false,
        enLinea: true,
        permiteOffline: false,
      })
    ).toBe(false);
  });

  it('no bloquea cuando el formulario permite offline', () => {
    expect(
      debeBloquearFormularioOffline({
        modoPreview: false,
        enLinea: false,
        permiteOffline: true,
      })
    ).toBe(false);
  });

  it('no bloquea en modo preview aunque este offline', () => {
    expect(
      debeBloquearFormularioOffline({
        modoPreview: true,
        enLinea: false,
        permiteOffline: false,
      })
    ).toBe(false);
  });
});
