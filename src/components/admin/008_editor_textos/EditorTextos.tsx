'use client';

/**
 * Editor de textos legales y funcionales del formulario.
 */

import { useState } from 'react';
import { Boton } from '@/components/ui/001_boton';
import type { TextoFormulario, TipoTextoFormulario } from '@/types/formulario';
import type { TextoAdminEntrada } from '@/types/admin';
import { actualizarTextosAdmin } from '@/services/formulariosAdminServicio';
import { sanitizarHtml } from '@/utils/sanitizarHtml';
import { extraerDetalleError } from '@/utils/erroresApi';
import { ejecutarSinEspera } from '@/utils/ejecutarSinEspera';

const TIPOS_TEXTO: { tipo: TipoTextoFormulario; etiqueta: string }[] = [
  { tipo: 'introduccion', etiqueta: 'Introducción' },
  { tipo: 'consentimiento_datos', etiqueta: 'Consentimiento de datos' },
  { tipo: 'terminos', etiqueta: 'Términos' },
  { tipo: 'confirmacion_envio', etiqueta: 'Confirmación de envío' },
  { tipo: 'verificacion_exitosa', etiqueta: 'Verificación exitosa' },
  { tipo: 'autorizacion_datos', etiqueta: 'Autorización de datos' },
  { tipo: 'resumen_respuestas', etiqueta: 'Resumen de respuestas' },
  { tipo: 'contacto', etiqueta: 'Contacto' },
  { tipo: 'ayuda_accesibilidad', etiqueta: 'Ayuda accesibilidad' },
];

interface EditorTextosProps {
  readonly idFormulario: number;
  readonly textos: TextoFormulario[];
  readonly onActualizado: () => void;
}

export function EditorTextos({ idFormulario, textos, onActualizado }: EditorTextosProps) {
  const [valores, setValores] = useState<Record<string, string>>(() => {
    const mapa: Record<string, string> = {};
    for (const item of TIPOS_TEXTO) {
      const existente = textos.find((t) => t.tipo === item.tipo);
      mapa[item.tipo] = existente?.contenido ?? '';
    }
    return mapa;
  });
  const [vistaPrevia, setVistaPrevia] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function guardar() {
    setGuardando(true);
    setError(null);
    try {
      const payload: TextoAdminEntrada[] = TIPOS_TEXTO.map((item) => ({
        tipo: item.tipo,
        contenido: valores[item.tipo] ?? '',
      }));
      await actualizarTextosAdmin(idFormulario, payload);
      onActualizado();
    } catch (err) {
      setError(extraerDetalleError(err));
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-bold" style={{ color: 'var(--color-texto-primario)' }}>
        Textos del formulario
      </h2>
      {error && <p role="alert" style={{ color: 'var(--color-error)' }}>{error}</p>}

      {TIPOS_TEXTO.map((item) => (
        <div key={item.tipo} className="flex flex-col gap-1 max-w-2xl">
          <label htmlFor={`texto-${item.tipo}`} className="text-sm font-medium">
            {item.etiqueta}
          </label>
          <textarea
            id={`texto-${item.tipo}`}
            rows={4}
            value={valores[item.tipo] ?? ''}
            onChange={(e) => setValores({ ...valores, [item.tipo]: e.target.value })}
            className="w-full rounded-lg px-4 py-3 text-sm"
            style={{
              border: '1.5px solid var(--color-borde-fuerte)',
              backgroundColor: 'var(--color-fondo-tarjeta)',
            }}
          />
          <button
            type="button"
            className="text-xs underline self-start"
            style={{ color: 'var(--color-primario)' }}
            onClick={() => setVistaPrevia(sanitizarHtml(valores[item.tipo] ?? ''))}
          >
            Vista previa HTML
          </button>
        </div>
      ))}

      {vistaPrevia !== null && (
        <div
          className="p-4 rounded-lg border max-w-2xl"
          style={{ borderColor: 'var(--color-borde)' }}
          role="region"
          aria-label="Vista previa sanitizada"
        >
          <div dangerouslySetInnerHTML={{ __html: vistaPrevia }} />
          <button type="button" className="mt-2 text-sm underline" onClick={() => setVistaPrevia(null)}>
            Cerrar vista previa
          </button>
        </div>
      )}

      <Boton type="button" cargando={guardando} onClick={() => ejecutarSinEspera(guardar())}>
        Guardar textos
      </Boton>
    </div>
  );
}
