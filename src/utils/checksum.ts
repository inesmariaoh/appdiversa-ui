/**
 * Calculo de checksum SHA-256 para operaciones offline.
 * JSON canonico: { codigo_pregunta, valor, version_cliente } con claves ordenadas.
 */

export interface DatosChecksum {
  codigo_pregunta: string;
  valor: unknown;
  version_cliente: number;
}

function ordenarClaves(objeto: Record<string, unknown>): Record<string, unknown> {
  return Object.keys(objeto)
    .sort()
    .reduce<Record<string, unknown>>((acumulado, clave) => {
      acumulado[clave] = objeto[clave];
      return acumulado;
    }, {});
}

function serializarCanonico(datos: DatosChecksum): string {
  const canonico = ordenarClaves({
    codigo_pregunta: datos.codigo_pregunta,
    valor: datos.valor,
    version_cliente: datos.version_cliente,
  });
  return JSON.stringify(canonico);
}

export async function calcularChecksum(datos: DatosChecksum): Promise<string> {
  const payload = serializarCanonico(datos);
  const buffer = new TextEncoder().encode(payload);
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('');
}
