/**
 * Utilidades para disparar descargas de archivos binarios en el navegador.
 */

/**
 * Dispara la descarga de un Blob generando un enlace temporal.
 */
export function dispararDescargaBlob(blob: Blob, nombreArchivo: string): void {
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombreArchivo;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  URL.revokeObjectURL(url);
}
