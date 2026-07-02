import { describe, expect, it } from 'vitest';
import type { OpcionRespuesta } from '@/types/formulario';
import {
  ACCION_EXCLUIR_OTRAS_OPCIONES,
  ACCION_MOSTRAR_CAMPO_TEXTO,
  calcularSeleccionMultiple,
  debeMostrarCampoTextoOtro,
  hayOpcionExcluyenteSeleccionada,
  opcionBloqueadaPorExclusion,
  opcionEsExcluyente,
  opcionRequiereCampoTexto,
} from './interaccionOpciones';

function crearOpcion(parcial: Partial<OpcionRespuesta> = {}): OpcionRespuesta {
  return {
    codigo: 'OP1',
    etiqueta: 'Opcion',
    valor: 'opcion',
    orden: 1,
    ...parcial,
  };
}

describe('interaccionOpciones', () => {
  it('usa acciones_ui del backend para campo otro', () => {
    const opcion = crearOpcion({
      acciones_ui: [ACCION_MOSTRAR_CAMPO_TEXTO],
      activa_otro: false,
    });
    expect(opcionRequiereCampoTexto(opcion)).toBe(true);
  });

  it('usa acciones_ui del backend para opcion excluyente', () => {
    const opcion = crearOpcion({
      valor: 'no_he_sentido',
      acciones_ui: [ACCION_EXCLUIR_OTRAS_OPCIONES],
    });
    expect(opcionEsExcluyente(opcion)).toBe(true);
  });

  it('al seleccionar excluyente deja solo esa opcion', () => {
    const opciones = [
      crearOpcion({ valor: 'a', codigo: 'A' }),
      crearOpcion({
        valor: 'no_he_sentido',
        codigo: 'NO',
        acciones_ui: [ACCION_EXCLUIR_OTRAS_OPCIONES],
        es_excluyente: true,
      }),
    ];
    const resultado = calcularSeleccionMultiple(
      ['a'],
      'no_he_sentido',
      true,
      opciones,
    );
    expect(resultado).toEqual(['no_he_sentido']);
  });

  it('bloquea otras opciones cuando hay excluyente activa', () => {
    const opciones = [
      crearOpcion({ valor: 'a', codigo: 'A' }),
      crearOpcion({
        valor: 'no_he_sentido',
        codigo: 'NO',
        es_excluyente: true,
      }),
    ];
    expect(hayOpcionExcluyenteSeleccionada(['no_he_sentido'], opciones)).toBe(true);
    expect(opcionBloqueadaPorExclusion(opciones[0], ['no_he_sentido'], opciones)).toBe(
      true,
    );
  });

  it('muestra campo otro solo con opcion activa seleccionada', () => {
    const opciones = [
      crearOpcion({
        valor: 'otros',
        activa_otro: true,
        acciones_ui: [ACCION_MOSTRAR_CAMPO_TEXTO],
      }),
    ];
    expect(debeMostrarCampoTextoOtro(['otros'], opciones)).toBe(true);
    expect(debeMostrarCampoTextoOtro(['otra'], opciones)).toBe(false);
  });
});
