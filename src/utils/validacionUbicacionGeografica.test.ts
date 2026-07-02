import { describe, it, expect } from 'vitest';
import { validarRespuestaPregunta, valorInicialPorTipo } from './validacionPregunta';
import type { Pregunta } from '@/types/formulario';

function crearPreguntaUbicacion(): Pregunta {
  return {
    codigo: 'P7-ANT',
    texto: 'Ubicacion anterior',
    descripcion: '',
    tooltip: '',
    tipo_pregunta: 'ubicacion_geografica',
    es_obligatoria: true,
    es_pregunta_filtro: false,
    permite_otro: false,
    permite_observacion: false,
    orden: 2,
    longitud_minima: null,
    longitud_maxima: null,
    valor_minimo: null,
    valor_maximo: null,
    expresion_regular: '',
    mensaje_error: '',
    usa_catalogo: true,
    catalogo_asociado: { codigo: 'municipios' },
    pregunta_padre_catalogo: null,
    es_pregunta_geografica: true,
    preguntas_dependientes_geograficas: [],
    permite_busqueda_catalogo: false,
    limite_items_catalogo: null,
    fuente_opciones: '',
    opciones: [],
    filas_matriz: [],
    columnas_matriz: [],
    reglas_origen: [],
    visible_por_defecto: false,
    codigo_catalogo_departamento: 'departamentos',
  };
}

describe('validacion ubicacion geografica', () => {
  it('rechaza ubicacion incompleta cuando es obligatoria', () => {
    const pregunta = crearPreguntaUbicacion();
    const inicial = valorInicialPorTipo('ubicacion_geografica');
    expect(validarRespuestaPregunta(pregunta, inicial, true)).toContain('obligatorio');
  });

  it('acepta json estructurado completo', () => {
    const pregunta = crearPreguntaUbicacion();
    const valor = {
      departamento_codigo: '15',
      departamento_nombre: 'Boyaca',
      municipio_codigo: '15001',
      municipio_nombre: 'Tunja',
    };
    expect(validarRespuestaPregunta(pregunta, valor, true)).toBeNull();
  });
});
