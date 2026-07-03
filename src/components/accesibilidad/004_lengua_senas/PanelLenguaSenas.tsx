'use client';

/**
 * Panel reutilizable que reproduce un video en lengua de senas asociado a una
 * instruccion o contenido. La fuente del video y los subtitulos WebVTT se
 * reciben por parametros, de modo que se administran desde el backend sin
 * modificar el codigo. No renderiza nada si no se provee una URL de video.
 */

interface PanelLenguaSenasProps {
  readonly urlVideo: string | null;
  readonly urlSubtitulos?: string | null;
  readonly titulo?: string;
  readonly abierto: boolean;
  readonly onCerrar: () => void;
}

const IDIOMA_SUBTITULOS = 'es';

export function PanelLenguaSenas({
  urlVideo,
  urlSubtitulos = null,
  titulo = 'Video en lengua de señas',
  abierto,
  onCerrar,
}: PanelLenguaSenasProps) {
  if (!abierto || urlVideo === null || urlVideo.length === 0) {
    return null;
  }

  return (
    <dialog className="panel-lengua-senas" aria-label={titulo} open>
      <div className="panel-lengua-senas-contenido">
        <div className="panel-lengua-senas-cabecera">
          <h2 className="panel-lengua-senas-titulo">{titulo}</h2>
          <button
            type="button"
            className="panel-lengua-senas-cerrar"
            onClick={onCerrar}
            aria-label="Cerrar video en lengua de señas"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        {/* eslint-disable-next-line jsx-a11y/media-has-caption -- la pista se agrega condicionalmente segun parametrizacion */}
        <video className="panel-lengua-senas-video" controls preload="metadata">
          <source src={urlVideo} />
          {urlSubtitulos && (
            <track
              kind="subtitles"
              src={urlSubtitulos}
              srcLang={IDIOMA_SUBTITULOS}
              label="Español"
              default
            />
          )}
          Su navegador no soporta la reproducción de video.
        </video>
      </div>
    </dialog>
  );
}
