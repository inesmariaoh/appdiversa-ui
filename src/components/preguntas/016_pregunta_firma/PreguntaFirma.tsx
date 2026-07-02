'use client';

/**
 * Pregunta de tipo firma: captura basica en canvas.
 */

import { useCallback, useRef } from 'react';
import { EncabezadoPregunta } from '../005_encabezado_pregunta';
import { Boton } from '@/components/ui/001_boton';
import { useSubirArchivo } from '@/hooks/useSubirArchivo';
import type { PropsPregunta } from '../types';
import { ejecutarSinEspera } from '@/utils/ejecutarSinEspera';

export function PreguntaFirma({
  pregunta,
  valor,
  onCambio,
  deshabilitada = false,
  obligatoria,
  error,
  idPrefijo,
}: PropsPregunta) {
  const id = idPrefijo ?? pregunta.codigo;
  const idError = error ? `${id}-error` : undefined;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dibujando = useRef(false);
  const { subir, subiendo } = useSubirArchivo();
  const valorFirma = typeof valor === 'string' ? valor : '';
  const firmaSubida =
    valor !== null &&
    valor !== undefined &&
    typeof valor === 'object' &&
    'uuid' in valor;
  const tieneFirma = Boolean(valorFirma || firmaSubida);

  const obtenerContexto = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext('2d');
  }, []);

  function iniciarDibujo(clientX: number, clientY: number) {
    const canvas = canvasRef.current;
    const ctx = obtenerContexto();
    if (!canvas || !ctx || deshabilitada) return;
    const rect = canvas.getBoundingClientRect();
    dibujando.current = true;
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  }

  function continuarDibujo(clientX: number, clientY: number) {
    if (!dibujando.current) return;
    const canvas = canvasRef.current;
    const ctx = obtenerContexto();
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.strokeStyle = 'var(--color-texto-primario)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function finalizarDibujo() {
    if (!dibujando.current) return;
    dibujando.current = false;
    const canvas = canvasRef.current;
    if (canvas) {
      ejecutarSinEspera(subirFirma(canvas.toDataURL('image/png')));
    }
  }

  async function subirFirma(dataUrl: string) {
    try {
      const respuesta = await fetch(dataUrl);
      const blob = await respuesta.blob();
      const archivo = new File([blob], 'firma.png', { type: 'image/png' });
      const resultado = await subir({
        archivo,
        tipo_archivo: 'firma',
        origen: 'respuesta',
        es_publico: true,
      });
      onCambio({
        uuid: resultado.uuid,
        nombre: resultado.nombre_original,
        url: resultado.url,
        mime_type: resultado.mime_type,
        tamano_bytes: resultado.tamano_bytes,
      });
    } catch {
      onCambio(dataUrl);
    }
  }

  function limpiar() {
    const canvas = canvasRef.current;
    const ctx = obtenerContexto();
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onCambio('');
  }

  return (
    <fieldset className="border-0 p-0 m-0 w-full" disabled={deshabilitada || subiendo}>
      <EncabezadoPregunta
        orden={pregunta.orden}
        texto={pregunta.texto}
        ayuda={pregunta.tooltip || pregunta.descripcion || null}
        obligatoria={obligatoria ?? pregunta.es_obligatoria}
      />
      <canvas
        ref={canvasRef}
        id={id}
        width={480}
        height={160}
        aria-label="Área de firma"
        aria-describedby={idError}
        className="w-full rounded-lg border cursor-crosshair touch-none"
        style={{
          borderColor: error ? 'var(--color-error)' : 'var(--color-borde-fuerte)',
          backgroundColor: 'var(--color-fondo-tarjeta)',
          maxWidth: '100%',
        }}
        onMouseDown={(e) => iniciarDibujo(e.clientX, e.clientY)}
        onMouseMove={(e) => continuarDibujo(e.clientX, e.clientY)}
        onMouseUp={finalizarDibujo}
        onMouseLeave={finalizarDibujo}
        onTouchStart={(e) => {
          const touch = e.touches[0];
          if (touch) iniciarDibujo(touch.clientX, touch.clientY);
        }}
        onTouchMove={(e) => {
          const touch = e.touches[0];
          if (touch) continuarDibujo(touch.clientX, touch.clientY);
        }}
        onTouchEnd={finalizarDibujo}
      />
      {tieneFirma && (
        <p className="text-xs mt-1" style={{ color: 'var(--color-texto-secundario)' }}>
          {subiendo ? 'Subiendo firma...' : 'Firma capturada.'}
        </p>
      )}
      <div className="mt-2">
        <Boton type="button" variante="fantasma" ancho="auto" onClick={limpiar} disabled={deshabilitada}>
          Limpiar firma
        </Boton>
      </div>
      {error && (
        <p id={idError} role="alert" className="text-xs mt-2" style={{ color: 'var(--color-error)' }}>
          {error}
        </p>
      )}
    </fieldset>
  );
}
