import { describe, expect, it } from 'vitest';
import {
  opcionMuestraTooltip,
  textoAyudaPregunta,
  validarTooltipAdmin,
} from './tooltipFormulario';

describe('tooltipFormulario', () => {
  it('muestra tooltip de opcion solo cuando esta activado y tiene texto', () => {
    expect(opcionMuestraTooltip({ tiene_tooltip: true, tooltip: 'Ayuda' })).toBe(true);
    expect(opcionMuestraTooltip({ tiene_tooltip: false, tooltip: 'Ayuda' })).toBe(false);
    expect(opcionMuestraTooltip({ tiene_tooltip: true, tooltip: '   ' })).toBe(false);
  });

  it('prioriza tooltip de pregunta sobre descripcion cuando esta activo', () => {
    expect(
      textoAyudaPregunta({
        tiene_tooltip: true,
        tooltip: 'Definicion',
        descripcion: 'Descripcion',
      }),
    ).toBe('Definicion');
    expect(
      textoAyudaPregunta({
        tiene_tooltip: false,
        tooltip: 'Definicion',
        descripcion: 'Descripcion',
      }),
    ).toBe('Descripcion');
  });

  it('valida tooltip obligatorio en administracion', () => {
    expect(validarTooltipAdmin(true, '')).toContain('obligatorio');
    expect(validarTooltipAdmin(true, 'Texto')).toBeNull();
  });
});
