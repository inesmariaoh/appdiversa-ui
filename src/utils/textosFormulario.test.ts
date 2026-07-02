import { describe, it, expect } from 'vitest';
import {
  buscarTextoFormulario,
  contenidoTextoFormulario,
  obtenerOpcionesConfirmacionEnvio,
  tituloTextoFormulario,
} from './textosFormulario';
import type { FormularioEstructura } from '@/types/formulario';

const estructura = {
  uuid: 'f1',
  codigo: 'F1',
  nombre: 'Encuesta',
  descripcion: '',
  introduccion: '',
  objetivo: '',
  tipo_formulario: 'encuesta',
  imagen_portada: null,
  version: { id: 1, numero_version: 1 },
  secciones: [],
  textos: [
    {
      tipo: 'confirmacion_envio' as const,
      titulo: 'Confirmar',
      contenido: '¿Desea enviar?',
    },
  ],
} satisfies FormularioEstructura;

describe('textosFormulario', () => {
  it('busca texto por tipo', () => {
    expect(buscarTextoFormulario(estructura, 'confirmacion_envio')?.titulo).toBe(
      'Confirmar'
    );
    expect(buscarTextoFormulario(estructura, 'agradecimiento')).toBeUndefined();
  });

  it('resuelve contenido y titulo con fallback', () => {
    expect(contenidoTextoFormulario(estructura, 'confirmacion_envio', 'FB')).toBe(
      '¿Desea enviar?'
    );
    expect(contenidoTextoFormulario(estructura, 'agradecimiento', 'Gracias')).toBe(
      'Gracias'
    );
    expect(tituloTextoFormulario(estructura, 'confirmacion_envio', 'Titulo')).toBe(
      'Confirmar'
    );
  });

  it('resuelve opciones del modal de confirmacion de envio', () => {
    expect(obtenerOpcionesConfirmacionEnvio(estructura)).toEqual({
      titulo: 'Confirmar',
      mensaje: '¿Desea enviar?',
      etiquetaConfirmar: 'Confirmar',
      etiquetaCancelar: 'Cancelar',
    });
  });
});
