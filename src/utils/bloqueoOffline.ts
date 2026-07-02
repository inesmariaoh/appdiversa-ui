/**
 * Reglas de bloqueo del diligenciamiento cuando el formulario no admite offline.
 */

interface EvaluacionBloqueoOffline {
  modoPreview: boolean;
  enLinea: boolean;
  permiteOffline: boolean;
}

export function debeBloquearFormularioOffline({
  modoPreview,
  enLinea,
  permiteOffline,
}: EvaluacionBloqueoOffline): boolean {
  if (modoPreview) return false;
  if (enLinea) return false;
  return !permiteOffline;
}
