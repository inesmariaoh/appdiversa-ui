/**
 * Servidor HTTP minimo para pruebas E2E sin backend real.
 */

import { createServer } from 'node:http';

const UUID_FORMULARIO = '00000000-0000-4000-8000-000000000001';
const UUID_FORMULARIO_FUTURO = '00000000-0000-4000-8000-000000000002';
const UUID_FORMULARIO_FILTROS = '00000000-0000-4000-8000-000000000099';

const CONFIGURACION = {
  nombre_aplicativo: 'AppDiversa E2E',
  descripcion_aplicativo: 'Pruebas automatizadas',
  color_primario: '#3B2484',
  color_secundario: '#A50034',
  color_acento: '#00B4A0',
  color_fondo_pagina: '#F0F0F0',
  color_fondo_tarjeta: '#FFFFFF',
  color_error: '#E53E3E',
  texto_pie_pagina: 'E2E',
  texto_contacto: 'Contacto',
  url_contacto: '/contacto',
  email_soporte: 'soporte@e2e.test',
  accion_lengua_senas_habilitada: false,
  flujo_formulario: {
    modal_salir: {
      titulo: '¿Salir sin guardar?',
      parrafo_1: 'Si abandonas la encuesta ahora, perderas tus respuestas no guardadas.',
      parrafo_2: 'Para conservar tu progreso, inicia sesion antes de salir.',
      boton_volver: 'Volver a la encuesta',
      boton_salir: 'Salir sin guardar',
      link_sesion: 'Iniciar sesion',
    },
    modal_sesion: {
      titulo: 'Inicia sesion o registrate',
      parrafo: 'Conserva tus respuestas registrandote o iniciando sesion.',
      boton_login: 'Iniciar sesion',
      boton_registro: 'Registrarse',
      link_cancelar: 'Cancelar',
    },
    modal_guardado: {
      titulo: 'Encuesta guardada con exito',
      parrafo: 'Tu progreso fue guardado correctamente.',
      boton_seguir: 'Seguir viendo',
      boton_otras: 'Ver otras encuestas',
    },
    terminos: {
      titulo: 'Terminos y Condiciones E2E',
      contenido: 'Al continuar aceptas el tratamiento de datos personales segun la Ley 1581 de 2012.',
      parrafo_1: '',
      parrafo_2: '',
      parrafo_3: '',
      url_ley: 'https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=49981',
      url_politica_datos:
        'https://www.dane.gov.co/files/images/ventana-unica/documentos/politicadedatosdane.pdf',
      email_soporte: null,
      boton_aceptar: 'Aceptar y comenzar encuesta',
      boton_cerrar: 'Cerrar',
      enlace_terminos: 'Terminos y condiciones',
    },
  },
};

const FORMULARIOS = [
  {
    uuid: UUID_FORMULARIO,
    codigo: 'E2E-01',
    nombre: 'Encuesta E2E',
    descripcion: 'Formulario de prueba disponible',
    tipo_formulario: 'encuesta',
    tiempo_estimado_minutos: 5,
    fecha_inicio: null,
    fecha_fin: null,
    permite_anonimo: true,
    permite_registro_final: false,
    permite_multiples_respuestas: false,
    permite_offline: true,
    imagen_portada: null,
    estado_disponibilidad: 'disponible',
    puede_iniciar: true,
    etiqueta_estado: 'Disponible offline',
  },
  {
    uuid: UUID_FORMULARIO_FUTURO,
    codigo: 'E2E-02',
    nombre: 'Encuesta Futura E2E',
    descripcion: 'Formulario de prueba proximamente',
    tipo_formulario: 'encuesta',
    tiempo_estimado_minutos: null,
    fecha_inicio: '2026-08-01T00:00:00Z',
    fecha_fin: null,
    permite_anonimo: true,
    permite_registro_final: false,
    permite_multiples_respuestas: false,
    permite_offline: false,
    imagen_portada: null,
    estado_disponibilidad: 'proximamente',
    puede_iniciar: false,
    etiqueta_estado: 'Próximamente',
  },
  {
    uuid: UUID_FORMULARIO_FILTROS,
    codigo: 'E2E-FILTRO',
    nombre: 'Encuesta filtro E2E',
    descripcion: 'Formulario de prueba con filtros preliminares',
    tipo_formulario: 'encuesta',
    tiempo_estimado_minutos: 5,
    fecha_inicio: null,
    fecha_fin: null,
    permite_anonimo: true,
    permite_registro_final: false,
    permite_multiples_respuestas: false,
    permite_offline: true,
    imagen_portada: null,
    estado_disponibilidad: 'disponible',
    puede_iniciar: true,
    etiqueta_estado: 'Disponible offline',
  },
];

function crearPreguntaBase(codigo, tipo, texto, extra = {}) {
  return {
    codigo,
    texto,
    descripcion: '',
    tooltip: '',
    tipo_pregunta: tipo,
    es_obligatoria: true,
    es_pregunta_filtro: false,
    permite_otro: false,
    permite_observacion: false,
    orden: 1,
    longitud_minima: null,
    longitud_maxima: null,
    valor_minimo: null,
    valor_maximo: null,
    expresion_regular: '',
    mensaje_error: '',
    usa_catalogo: false,
    catalogo_asociado: null,
    pregunta_padre_catalogo: null,
    permite_busqueda_catalogo: false,
    limite_items_catalogo: null,
    fuente_opciones: '',
    opciones: [],
    filas_matriz: [],
    columnas_matriz: [],
    reglas_origen: [],
    ...extra,
  };
}

const ESTRUCTURA = {
  uuid: UUID_FORMULARIO,
  codigo: 'E2E-01',
  nombre: 'Encuesta E2E',
  descripcion: 'Formulario de prueba',
  introduccion: 'Responda la pregunta de verificacion.',
  objetivo: '',
  tipo_formulario: 'encuesta',
  imagen_portada: null,
  version: { id: 1, numero_version: 1 },
  textos: [],
  secciones: [
    {
      codigo: 'SEC-VER',
      titulo: 'Verificacion',
      descripcion: '',
      texto_ayuda: '',
      orden: 1,
      preguntas: [
        crearPreguntaBase('P_VER', 'texto_corto', 'Codigo de verificacion'),
      ],
    },
    {
      codigo: 'SEC-01',
      titulo: 'Seccion principal',
      descripcion: '',
      texto_ayuda: '',
      orden: 2,
      preguntas: [
        crearPreguntaBase('P_NOMBRE', 'texto_corto', 'Su nombre'),
      ],
    },
  ],
};

const ESTRUCTURA_FILTROS = {
  uuid: UUID_FORMULARIO_FILTROS,
  codigo: 'E2E-FILTRO',
  nombre: 'Encuesta filtro E2E',
  descripcion: 'Prueba de filtros',
  introduccion: '',
  objetivo: '',
  tipo_formulario: 'encuesta',
  imagen_portada: null,
  version: { id: 1, numero_version: 1 },
  textos: [
    {
      tipo: 'verificacion_exitosa',
      titulo: '¡Verificado con éxito!',
      contenido: 'Cumples con todos los requisitos para participar.',
    },
    {
      tipo: 'no_cumple_condiciones',
      titulo: 'Gracias por participar.',
      contenido:
        'En este momento no cumples las condiciones para diligenciar esta encuesta.',
    },
    {
      tipo: 'autorizacion_datos',
      titulo: 'Autorización',
      contenido: 'Texto de autorización de datos.',
    },
  ],
  secciones: [
    {
      codigo: 'PRE',
      titulo: 'Capítulo I - Preliminar',
      descripcion: '',
      texto_ayuda: '',
      orden: 1,
      preguntas: [
        {
          ...crearPreguntaBase('P1', 'fecha', '¿Cuál es su fecha de nacimiento?', {
            descripcion: 'Seleccione año, mes y día.',
            es_pregunta_filtro: true,
            tipo_validacion_filtro: 'rango_edad',
            valor_minimo: '18',
            valor_maximo: '109',
            mensaje_error:
              'Debes tener 18 años o más para participar. Revisa tu fecha o vuelve a la lista de encuestas.',
            bloquea_continuacion_si_no_cumple: true,
            orden: 1,
          }),
        },
        {
          ...crearPreguntaBase(
            'P2',
            'radio',
            '¿Ha vivido en Colombia durante los últimos 5 años?',
            {
              descripcion: 'Seleccione una opción.',
              es_pregunta_filtro: true,
              tipo_validacion_filtro: 'opcion_exacta',
              valor_filtro_esperado: { valor: 'si' },
              mensaje_no_cumple:
                'En este momento no cumples las condiciones para diligenciar esta encuesta.',
              bloquea_continuacion_si_no_cumple: true,
              fuente_opciones: 'estatica',
              orden: 2,
              opciones: [
                { codigo: 'OP-SI', etiqueta: 'Sí', valor: 'si', orden: 1 },
                { codigo: 'OP-NO', etiqueta: 'No', valor: 'no', orden: 2 },
              ],
            },
          ),
        },
      ],
    },
    {
      codigo: 'MAIN',
      titulo: 'Principal',
      descripcion: '',
      texto_ayuda: '',
      orden: 2,
      preguntas: [
        crearPreguntaBase('P3', 'texto_corto', 'Pregunta principal', { orden: 1 }),
      ],
    },
  ],
};

const sesionesPorCookie = new Map();
const COOKIE_SESION = 'e2e_session';

function leerCookieSesion(req) {
  const cookieHeader = req.headers.cookie ?? '';
  const partes = cookieHeader.split(';').map((parte) => parte.trim());
  for (const parte of partes) {
    if (parte.startsWith(`${COOKIE_SESION}=`)) {
      return parte.slice(COOKIE_SESION.length + 1);
    }
  }
  return null;
}

function obtenerPerfilSesion(req) {
  const idSesion = leerCookieSesion(req);
  if (!idSesion) return null;
  return sesionesPorCookie.get(idSesion) ?? null;
}

function cabecerasConCookieSesion(req, idSesion, eliminar = false) {
  const base = cabecerasCors(req);
  if (eliminar) {
    return {
      ...base,
      'Set-Cookie': `${COOKIE_SESION}=; Path=/; Max-Age=0; SameSite=Lax`,
    };
  }
  return {
    ...base,
    'Set-Cookie': `${COOKIE_SESION}=${idSesion}; Path=/; HttpOnly; SameSite=Lax`,
  };
}

let contadorFormularioAdmin = 1;
const formulariosAdmin = new Map();

const PERFIL_ADMIN = {
  usuario: {
    id: 1,
    username: 'admin',
    email: 'admin@e2e.test',
    nombre_completo: 'Administrador E2E',
    esta_activo: true,
  },
  grupos: ['administrador_general'],
  permisos: [
    'formularios.ver',
    'formularios.editar',
    'formularios.publicar',
    'usuarios.ver',
    'usuarios.editar',
  ],
};

const PERFIL_ADMIN_APPDIVERSA = {
  usuario: {
    id: 10,
    username: 'admin_appdiversa',
    email: 'admin@appdiversa.test',
    nombre_completo: 'Admin AppDiversa',
    esta_activo: true,
  },
  grupos: ['admin_appdiversa'],
  permisos: PERFIL_ADMIN.permisos,
};

const PERFIL_GESTOR = {
  usuario: {
    id: 11,
    username: 'gestor_formularios',
    email: 'gestor@appdiversa.test',
    nombre_completo: 'Gestor formularios',
    esta_activo: true,
  },
  grupos: ['gestor_formularios'],
  permisos: ['formularios.ver', 'formularios.editar', 'formularios.publicar'],
};

const PERFIL_EDITOR = {
  usuario: {
    id: 12,
    username: 'editor_formularios',
    email: 'editor@appdiversa.test',
    nombre_completo: 'Editor formularios',
    esta_activo: true,
  },
  grupos: ['editor_formularios'],
  permisos: ['formularios.ver', 'formularios.editar'],
};

const PERFIL_LECTOR = {
  usuario: {
    id: 13,
    username: 'lector_formularios',
    email: 'lector@appdiversa.test',
    nombre_completo: 'Lector formularios',
    esta_activo: true,
  },
  grupos: ['lector_formularios'],
  permisos: ['formularios.ver'],
};

const CREDENCIALES_E2E = {
  admin: { password: 'admin123', perfil: PERFIL_ADMIN },
  admin_appdiversa: { password: 'demo1234', perfil: PERFIL_ADMIN_APPDIVERSA },
  gestor_formularios: { password: 'demo1234', perfil: PERFIL_GESTOR },
  editor_formularios: { password: 'demo1234', perfil: PERFIL_EDITOR },
  lector_formularios: { password: 'demo1234', perfil: PERFIL_LECTOR },
};

formulariosAdmin.set(1, {
  id: 1,
  uuid: UUID_FORMULARIO,
  codigo: 'E2E-01',
  nombre: 'Encuesta E2E',
  descripcion: 'Formulario de prueba',
  tipo_formulario: 'encuesta',
  estado: 'borrador',
  fecha_inicio: null,
  fecha_fin: null,
  version_publicada: null,
  permite_offline: true,
  permite_registro_final: false,
  imagen_portada: null,
  fecha_creacion: '2026-01-01T00:00:00.000Z',
  fecha_modificacion: '2026-01-01T00:00:00.000Z',
});
contadorFormularioAdmin = 2;

const RESULTADO_REGLAS_VACIO = {
  preguntas_ocultas: [],
  preguntas_visibles: [],
  preguntas_deshabilitadas: [],
  preguntas_habilitadas: [],
  preguntas_obligatorias: [],
  preguntas_opcionales: [],
  saltar_a_pregunta: null,
  saltar_a_seccion: null,
  finalizar_formulario: false,
  no_aplica_formulario: false,
  mensajes: [],
};

function cabecerasCors(req) {
  const origen = req.headers.origin ?? 'http://127.0.0.1:3010';
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': origen,
    'Access-Control-Allow-Credentials': 'true',
  };
}

function enviarJson(res, status, cuerpo, req) {
  res.writeHead(status, cabecerasCors(req));
  res.end(JSON.stringify(cuerpo));
}

function leerCuerpo(req) {
  return new Promise((resolve) => {
    const partes = [];
    req.on('data', (chunk) => partes.push(chunk));
    req.on('end', () => {
      const texto = Buffer.concat(partes).toString('utf8');
      if (!texto) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(texto));
      } catch {
        resolve({});
      }
    });
  });
}

function responderOptions(req, res) {
  res.writeHead(204, {
    ...cabecerasCors(req),
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Sesion-Anonima, X-Token-Sesion, Cookie',
  });
  res.end();
}

async function manejarAuthLogin(ruta, metodo, req, res) {
  if (ruta !== '/api/v1/auth/login/' || metodo !== 'POST') return false;
  const cuerpo = await leerCuerpo(req);
  const credencial = CREDENCIALES_E2E[cuerpo.username];
  if (credencial && cuerpo.password === credencial.password) {
    const idSesion = crypto.randomUUID();
    sesionesPorCookie.set(idSesion, credencial.perfil);
    res.writeHead(200, cabecerasConCookieSesion(req, idSesion));
    res.end(JSON.stringify(credencial.perfil));
  } else {
    enviarJson(res, 403, { detalle: 'Credenciales invalidas.' }, req);
  }
  return true;
}

async function manejarAuthRestaurarPassword(ruta, metodo, req, res) {
  if (ruta === '/api/v1/auth/solicitar-restaurar-password/' && metodo === 'POST') {
    enviarJson(
      res,
      200,
      {
        detalle:
          'Si el correo esta registrado, recibiras instrucciones para restaurar la contrasena.',
      },
      req,
    );
    return true;
  }

  if (ruta === '/api/v1/auth/restaurar-password/' && metodo === 'POST') {
    const cuerpo = await leerCuerpo(req);
    if (cuerpo.uid && cuerpo.token && cuerpo.password_nueva) {
      enviarJson(res, 200, { detalle: 'Contrasena restaurada correctamente.' }, req);
    } else {
      enviarJson(res, 400, { detalle: 'Enlace de restauracion invalido.' }, req);
    }
    return true;
  }

  return false;
}

async function manejarContacto(ruta, metodo, req, res) {
  if (ruta !== '/api/v1/contacto/' || metodo !== 'POST') return false;

  const cuerpo = await leerCuerpo(req);
  if (cuerpo.nombre && cuerpo.correo && cuerpo.asunto && cuerpo.mensaje) {
    enviarJson(
      res,
      200,
      { detalle: 'Tu mensaje fue enviado correctamente. Te contactaremos pronto.' },
      req,
    );
  } else {
    enviarJson(res, 400, { detalle: 'Completa todos los campos del formulario de contacto.' }, req);
  }
  return true;
}

async function manejarAuth(ruta, metodo, req, res) {
  if (await manejarAuthLogin(ruta, metodo, req, res)) return true;

  if (ruta === '/api/v1/auth/logout/' && metodo === 'POST') {
    const idSesion = leerCookieSesion(req);
    if (idSesion) {
      sesionesPorCookie.delete(idSesion);
    }
    res.writeHead(200, cabecerasConCookieSesion(req, '', true));
    res.end(JSON.stringify({}));
    return true;
  }

  if (ruta === '/api/v1/auth/me/') {
    const perfil = obtenerPerfilSesion(req);
    if (perfil) {
      enviarJson(res, 200, perfil, req);
    } else {
      enviarJson(res, 403, { detalle: 'No autenticado.' }, req);
    }
    return true;
  }

  if (ruta === '/api/v1/auth/cambiar-password/' && metodo === 'POST') {
    enviarJson(res, 200, {}, req);
    return true;
  }

  if (await manejarAuthRestaurarPassword(ruta, metodo, req, res)) return true;

  return false;
}

async function crearFormularioAdmin(cuerpo) {
  const id = contadorFormularioAdmin++;
  const formulario = {
    id,
    uuid: crypto.randomUUID(),
    codigo: cuerpo.codigo,
    nombre: cuerpo.nombre,
    descripcion: cuerpo.descripcion ?? '',
    introduccion: cuerpo.introduccion ?? '',
    objetivo: cuerpo.objetivo ?? '',
    tipo_formulario: cuerpo.tipo_formulario ?? 'encuesta',
    estado: cuerpo.estado ?? 'borrador',
    fecha_inicio: cuerpo.fecha_inicio ?? null,
    fecha_fin: cuerpo.fecha_fin ?? null,
    version_publicada: null,
    permite_offline: cuerpo.permite_offline ?? true,
    permite_registro_final: cuerpo.permite_registro_final ?? false,
    imagen_portada: cuerpo.imagen_portada ?? null,
    fecha_creacion: new Date().toISOString(),
    fecha_modificacion: new Date().toISOString(),
  };
  formulariosAdmin.set(id, formulario);
  return formulario;
}

async function manejarAdminFormularioPorId(ruta, metodo, req, res) {
  const coincidenciaAdminFormulario = ruta.match(/^\/api\/v1\/admin\/formularios\/(\d+)\/?$/);
  if (!coincidenciaAdminFormulario) return false;

  const id = Number(coincidenciaAdminFormulario[1]);
  const existente = formulariosAdmin.get(id);
  if (!existente) {
    enviarJson(res, 404, { detalle: 'Formulario no encontrado.' }, req);
    return true;
  }
  if (metodo === 'GET' || metodo === 'PATCH') {
    if (metodo === 'PATCH') {
      const cuerpo = await leerCuerpo(req);
      Object.assign(existente, cuerpo, { fecha_modificacion: new Date().toISOString() });
    }
    enviarJson(res, 200, existente, req);
    return true;
  }
  return false;
}

function manejarAdminRecursosFormulario(ruta, metodo, req, res) {
  const coincidenciaAdminEstructura = ruta.match(
    /^\/api\/v1\/admin\/formularios\/(\d+)\/estructura\/$/,
  );
  if (coincidenciaAdminEstructura && metodo === 'GET') {
    enviarJson(res, 200, ESTRUCTURA, req);
    return true;
  }

  const coincidenciaAdminVersiones = ruta.match(
    /^\/api\/v1\/admin\/formularios\/(\d+)\/versiones\/$/,
  );
  if (coincidenciaAdminVersiones && metodo === 'GET') {
    enviarJson(
      res,
      200,
      [{ id: 1, numero_version: 1, estado: 'borrador', fecha_creacion: '2026-01-01', fecha_publicacion: null }],
      req,
    );
    return true;
  }

  if (ruta.match(/^\/api\/v1\/admin\/formularios\/(\d+)\/reglas\/$/) && metodo === 'GET') {
    enviarJson(res, 200, [], req);
    return true;
  }

  if (ruta.match(/^\/api\/v1\/admin\/formularios\/(\d+)\/(secciones|preguntas|textos|reglas)/) && metodo === 'POST') {
    enviarJson(res, 201, { guardado: true }, req);
    return true;
  }

  if (ruta.match(/^\/api\/v1\/admin\/formularios\/(\d+)\/textos\/$/) && metodo === 'PATCH') {
    enviarJson(res, 200, [], req);
    return true;
  }

  return false;
}

async function manejarAdminFormularios(ruta, metodo, req, res) {
  if (ruta === '/api/v1/admin/formularios/' && metodo === 'GET') {
    enviarJson(res, 200, [...formulariosAdmin.values()], req);
    return true;
  }

  if (ruta === '/api/v1/admin/formularios/' && metodo === 'POST') {
    const cuerpo = await leerCuerpo(req);
    const formulario = await crearFormularioAdmin(cuerpo);
    enviarJson(res, 201, formulario, req);
    return true;
  }

  if (await manejarAdminFormularioPorId(ruta, metodo, req, res)) return true;
  if (manejarAdminRecursosFormulario(ruta, metodo, req, res)) return true;

  return false;
}

function manejarAdminUsuarios(ruta, metodo, req, res) {
  const perfil = obtenerPerfilSesion(req);

  if (ruta === '/api/v1/admin/usuarios/' && metodo === 'GET') {
    enviarJson(
      res,
      200,
      [
        {
          ...(perfil?.usuario ?? PERFIL_ADMIN.usuario),
          grupos: perfil?.grupos ?? PERFIL_ADMIN.grupos,
          permisos: perfil?.permisos ?? PERFIL_ADMIN.permisos,
          fecha_creacion: '2026-01-01',
        },
      ],
      req,
    );
    return true;
  }

  if (ruta === '/api/v1/admin/grupos/' && metodo === 'GET') {
    enviarJson(res, 200, [{ codigo: 'administrador_general', nombre: 'Administrador general' }], req);
    return true;
  }

  return false;
}

function manejarRutasPublicas(ruta, metodo, req, res) {
  if (ruta === '/api/v1/interfaz/configuracion/') {
    enviarJson(res, 200, CONFIGURACION, req);
    return true;
  }

  if (ruta === '/api/v1/salud/') {
    enviarJson(res, 200, { estado: 'ok' }, req);
    return true;
  }

  if (ruta === '/api/v1/internacionalizacion/traducciones/') {
    enviarJson(res, 200, [], req);
    return true;
  }

  const coincidenciaCatalogoItems = ruta.match(/^\/api\/v1\/catalogos\/([^/]+)\/items\/$/);
  if (coincidenciaCatalogoItems) {
    enviarJson(
      res,
      200,
      [
        {
          codigo: 'ITEM-1',
          codigo_catalogo: coincidenciaCatalogoItems[1],
          nombre: 'Opcion catalogo',
          descripcion: '',
          valor: 'OP1',
          codigo_padre: null,
          codigo_externo: '',
          metadatos: {},
          orden: 1,
          esta_activo: true,
        },
      ],
      req,
    );
    return true;
  }

  if (ruta === '/api/v1/formularios/disponibles/') {
    enviarJson(res, 200, FORMULARIOS, req);
    return true;
  }

  const coincidenciaEstructura = ruta.match(/^\/api\/v1\/formularios\/([^/]+)\/estructura\/$/);
  if (coincidenciaEstructura) {
    const uuidFormulario = coincidenciaEstructura[1];
    const estructura =
      uuidFormulario === UUID_FORMULARIO_FILTROS ? ESTRUCTURA_FILTROS : ESTRUCTURA;
    enviarJson(res, 200, estructura, req);
    return true;
  }

  return false;
}

async function manejarCreacionSesion(ruta, metodo, req, res) {
  if (ruta !== '/api/v1/sesiones/' || metodo !== 'POST') return false;

  const cuerpo = await leerCuerpo(req);
  const uuidSesion = cuerpo.uuid_sesion ?? crypto.randomUUID();
  const tokenCliente = `token-${uuidSesion.slice(0, 8)}`;
  enviarJson(
    res,
    201,
    {
      uuid_sesion: uuidSesion,
      token_cliente: tokenCliente,
      estado: 'en_proceso',
    },
    req,
  );
  return true;
}

function manejarEvaluacionSesion(ruta, metodo, req, res) {
  const coincidenciaEvaluarReglas = ruta.match(/^\/api\/v1\/sesiones\/([^/]+)\/evaluar-reglas\/$/);
  if (coincidenciaEvaluarReglas && metodo === 'POST') {
    enviarJson(res, 200, RESULTADO_REGLAS_VACIO, req);
    return true;
  }

  const coincidenciaEvaluarPregunta = ruta.match(
    /^\/api\/v1\/sesiones\/([^/]+)\/preguntas\/([^/]+)\/evaluar-reglas\/$/,
  );
  if (coincidenciaEvaluarPregunta && metodo === 'POST') {
    enviarJson(res, 200, RESULTADO_REGLAS_VACIO, req);
    return true;
  }

  const coincidenciaEnviarCopia = ruta.match(/^\/api\/v1\/sesiones\/([^/]+)\/enviar-copia\/$/);
  if (coincidenciaEnviarCopia && metodo === 'POST') {
    enviarJson(
      res,
      200,
      { detalle: 'La copia de respuestas fue enviada al correo indicado.' },
      req,
    );
    return true;
  }

  const coincidenciaVincular = ruta.match(/^\/api\/v1\/sesiones\/([^/]+)\/vincular-usuario\/$/);
  if (coincidenciaVincular && metodo === 'POST') {
    enviarJson(
      res,
      200,
      { detalle: 'Sesion vinculada al usuario autenticado.' },
      req,
    );
    return true;
  }

  return false;
}

function manejarCierreSesion(ruta, metodo, req, res) {
  const coincidenciaValidar = ruta.match(/^\/api\/v1\/sesiones\/([^/]+)\/validar-finalizacion\/$/);
  if (coincidenciaValidar && metodo === 'POST') {
    enviarJson(
      res,
      200,
      {
        es_valido: true,
        total_pendientes: 0,
        preguntas_pendientes: [],
      },
      req,
    );
    return true;
  }

  const coincidenciaFinalizar = ruta.match(/^\/api\/v1\/sesiones\/([^/]+)\/finalizar\/$/);
  if (coincidenciaFinalizar && metodo === 'POST') {
    enviarJson(
      res,
      200,
      {
        estado: 'finalizada',
        mensaje: 'Formulario finalizado',
        resumen: {
          uuid_sesion: coincidenciaFinalizar[1],
          estado: 'finalizada',
          formulario: {
            uuid: UUID_FORMULARIO,
            codigo: 'E2E-01',
            nombre: 'Encuesta E2E',
          },
          version: { numero_version: 1 },
          respuestas: [],
        },
      },
      req,
    );
    return true;
  }

  const coincidenciaResumen = ruta.match(/^\/api\/v1\/sesiones\/([^/]+)\/resumen\/$/);
  if (coincidenciaResumen && metodo === 'GET') {
    enviarJson(
      res,
      200,
      {
        uuid_sesion: coincidenciaResumen[1],
        estado: 'finalizada',
        formulario: {
          uuid: UUID_FORMULARIO,
          codigo: 'E2E-01',
          nombre: 'Encuesta E2E',
        },
        version: { numero_version: 1 },
        respuestas: [
          {
            seccion_codigo: 'SEC-01',
            seccion_titulo: 'Seccion principal',
            pregunta_codigo: 'P_NOMBRE',
            pregunta_texto: 'Su nombre',
            tipo_pregunta: 'texto_corto',
            valor: 'Ana',
            observacion: '',
          },
        ],
      },
      req,
    );
    return true;
  }

  return false;
}

async function manejarSesiones(ruta, metodo, req, res) {
  if (await manejarCreacionSesion(ruta, metodo, req, res)) return true;

  if (ruta === '/api/v1/respuestas/' && metodo === 'POST') {
    enviarJson(res, 201, { guardado: true }, req);
    return true;
  }

  if (manejarEvaluacionSesion(ruta, metodo, req, res)) return true;

  const coincidenciaRespuesta = ruta.match(/^\/api\/v1\/sesiones\/([^/]+)\/respuestas\/$/);
  if (coincidenciaRespuesta && metodo === 'POST') {
    enviarJson(res, 201, { guardado: true }, req);
    return true;
  }

  if (manejarCierreSesion(ruta, metodo, req, res)) return true;

  if (ruta === '/api/v1/sincronizacion/' && metodo === 'POST') {
    enviarJson(res, 200, { procesadas: 0, errores: [] }, req);
    return true;
  }

  return false;
}

async function manejarSolicitud(req, res) {
  const url = new URL(req.url ?? '/', 'http://127.0.0.1:8000');
  const metodo = req.method ?? 'GET';
  const ruta = url.pathname;

  if (metodo === 'OPTIONS') {
    responderOptions(req, res);
    return;
  }

  if (await manejarAuth(ruta, metodo, req, res)) return;

  if (await manejarContacto(ruta, metodo, req, res)) return;

  if (ruta.startsWith('/api/v1/admin/') && !obtenerPerfilSesion(req)) {
    enviarJson(res, 403, { detalle: 'No autenticado.' }, req);
    return;
  }

  if (await manejarAdminFormularios(ruta, metodo, req, res)) return;
  if (manejarAdminUsuarios(ruta, metodo, req, res)) return;
  if (manejarRutasPublicas(ruta, metodo, req, res)) return;
  if (await manejarSesiones(ruta, metodo, req, res)) return;

  enviarJson(res, 404, { detalle: 'Ruta no encontrada en mock E2E.' }, req);
}

const servidor = createServer((req, res) => {
  manejarSolicitud(req, res).catch(() => {
    enviarJson(res, 500, { detalle: 'Error interno del mock E2E.' }, req);
  });
});

const PUERTO = Number(process.env.MOCK_API_PORT ?? 18000);

servidor.listen(PUERTO, '127.0.0.1', () => {
  process.stdout.write(`Mock API E2E escuchando en http://127.0.0.1:${PUERTO}\n`);
});
