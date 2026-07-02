'use client';

/**
 * Muestra contenido accesible multimodal asociado a una pregunta o texto.
 */

import { useIdiomaStore } from '@/store/idiomaStore';
import Image from 'next/image';
import type { ContenidoAccesible } from '@/types/accesibilidad';
import { sanitizarHtml, contieneHtml } from '@/utils/sanitizarHtml';

interface ContenidoAccesiblePreguntaProps {
  readonly contenido: ContenidoAccesible | null | undefined;
  readonly etiqueta?: string;
}

function BloqueTexto({ titulo, texto }: { titulo: string; texto: string }) {
  if (!texto.trim()) return null;
  return (
    <div className="mt-3 text-sm">
      <h3 className="font-semibold mb-1" style={{ color: 'var(--color-texto-primario)' }}>
        {titulo}
      </h3>
      {contieneHtml(texto) ? (
        <div
          className="prose prose-sm max-w-none"
          style={{ color: 'var(--color-texto-secundario)' }}
          dangerouslySetInnerHTML={{ __html: sanitizarHtml(texto) }}
        />
      ) : (
        <p style={{ color: 'var(--color-texto-secundario)' }}>{texto}</p>
      )}
    </div>
  );
}

export function ContenidoAccesiblePregunta({
  contenido,
  etiqueta = 'Contenido accesible',
}: ContenidoAccesiblePreguntaProps) {
  const incluirAccesibilidad = useIdiomaStore((s) => s.incluirAccesibilidad);

  if (!incluirAccesibilidad || !contenido) return null;

  const tieneContenido =
    contenido.lectura_facil?.trim() ||
    contenido.texto_alternativo?.trim() ||
    contenido.transcripcion?.trim() ||
    contenido.archivo_audio ||
    contenido.archivo_video ||
    contenido.archivo_imagen ||
    contenido.archivo_lengua_senas;

  if (!tieneContenido) return null;

  return (
    <aside
      className="mt-3 rounded-lg p-3 border"
      style={{
        borderColor: 'var(--color-borde-fuerte)',
        backgroundColor: 'var(--color-fondo-pagina)',
      }}
      aria-label={etiqueta}
    >
      <BloqueTexto titulo="Lectura fácil" texto={contenido.lectura_facil ?? ''} />
      <BloqueTexto titulo="Texto alternativo" texto={contenido.texto_alternativo ?? ''} />
      <BloqueTexto titulo="Transcripcion" texto={contenido.transcripcion ?? ''} />
      {contenido.archivo_imagen && (
        <figure className="mt-3">
          <Image
            src={contenido.archivo_imagen}
            alt={contenido.texto_alternativo ?? 'Imagen de apoyo'}
            width={800}
            height={450}
            unoptimized
            className="max-w-full h-auto rounded"
          />
        </figure>
      )}
      {contenido.archivo_audio && (
        <audio controls className="mt-3 w-full" src={contenido.archivo_audio}>
          <track kind="captions" />
        </audio>
      )}
      {contenido.archivo_video && (
        <video controls className="mt-3 w-full rounded" src={contenido.archivo_video}>
          <track kind="captions" />
        </video>
      )}
      {contenido.archivo_lengua_senas && (
        <video
          controls
          className="mt-3 w-full rounded"
          src={contenido.archivo_lengua_senas}
          aria-label="Video en lengua de señas"
        >
          <track kind="captions" />
        </video>
      )}
    </aside>
  );
}
