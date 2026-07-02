# Informe — Revisión ortográfica y normalización de textos UI en español

**Fecha:** 2026-07-01  
**Alcance:** textos visibles del frontend AppDiversa UI (fallbacks locales, validaciones Zod, aria-label, estados UI).

---

## Resumen ejecutivo

Se normalizó la ortografía y puntuación de los textos visibles al usuario en español: tildes, ñ, mayúsculas iniciales y puntuación en mensajes completos. No se modificó lógica de negocio, nombres técnicos, rutas ni textos que provienen exclusivamente de la API (salvo fallbacks locales cuando el backend no envía valor).

**Pruebas ejecutadas:** 16 archivos, 58 tests — todos pasaron.

---

## Archivos revisados (producción)

### Autenticación y perfil
- `src/components/auth/009_formulario_login/FormularioLogin.tsx`
- `src/components/auth/010_formulario_solicitar_restaurar_password/FormularioSolicitarRestaurarPassword.tsx`
- `src/components/auth/011_formulario_restaurar_password/FormularioRestaurarPassword.tsx`
- `src/components/auth/007_tiene_permiso/TienePermiso.tsx`
- `src/components/auth/008_tiene_rol/TieneRol.tsx`
- `src/app/auth/login/page.tsx`
- `src/app/auth/registro/page.tsx`
- `src/app/auth/registro/correo/page.tsx`
- `src/app/auth/registro/correo/FormularioRegistroCorreo.tsx`
- `src/app/auth/perfil/page.tsx`
- `src/app/auth/salir/page.tsx`
- `src/app/auth/restaurar-password/page.tsx`
- `src/app/auth/solicitar-restaurar-password/page.tsx`

### Layout y navegación
- `src/components/layout/001_encabezado/Encabezado.tsx`
- `src/components/layout/009_menu_hamburguesa/MenuHamburguesa.tsx`
- `src/components/layout/011_menu_perfil/MenuPerfil.tsx`
- `src/components/layout/004_migas/Migas.tsx`
- `src/utils/migasNavegacion.ts`

### Formularios y encuestas
- `src/components/formularios/003_panel_formulario/PanelFormulario.tsx`
- `src/components/formularios/006_resumen_sesion/ResumenSesion.tsx`
- `src/components/formularios/007_formulario_enviar_copia/FormularioEnviarCopia.tsx`
- `src/components/formularios/008_panel_consentimiento/PanelConsentimiento.tsx`
- `src/components/formularios/009_pantalla_envio_exitoso/PantallaEnvioExitoso.tsx`
- `src/components/formularios/010_barra_acciones_formulario/BarraAccionesFormulario.tsx`
- `src/components/formularios/010_contenido_terminos/ContenidoTerminos.tsx`
- `src/components/formularios/012_aviso_encuesta_proximamente/AvisoEncuestaProximamente.tsx` *(ya correcto; verificado)*
- `src/app/encuestas/[uuid]/PanelVerificacion.tsx`
- `src/app/terminos-condiciones/page.tsx`
- `src/app/contacto/page.tsx`
- `src/app/mis-respuestas/ContenidoHistorial.tsx`

### Contacto
- `src/components/contacto/001_formulario_contacto/FormularioContacto.tsx`

### Offline y sincronización
- `src/components/offline/001_indicador_conexion/IndicadorConexion.tsx`
- `src/components/offline/002_estado_sincronizacion/EstadoSincronizacion.tsx`
- `src/components/offline/003_aviso_conexion_offline/AvisoConexionOffline.tsx` *(ya correcto; verificado)*

### Accesibilidad
- `src/components/accesibilidad/001_barra_accesibilidad/BarraAccesibilidad.tsx`
- `src/components/accesibilidad/002_barra_flotante/BarraFlotante.tsx`
- `src/components/accesibilidad/002_contenido_accesible/ContenidoAccesiblePregunta.tsx`

### Preguntas dinámicas
- `src/components/preguntas/004_pregunta_select/PreguntaSelect.tsx`
- `src/components/preguntas/014_pregunta_matriz/PreguntaMatriz.tsx`
- `src/components/preguntas/016_pregunta_firma/PreguntaFirma.tsx`
- `src/components/preguntas/017_pregunta_geolocalizacion/PreguntaGeolocalizacion.tsx`
- `src/components/preguntas/021_campo_texto_otro/CampoTextoOtro.tsx`
- `src/components/preguntas/022_icono_tooltip_opcion/IconoTooltipOpcion.tsx`

### UI general
- `src/components/ui/011_modal/Modal.tsx`
- `src/components/ui/016_alerta_verificacion/AlertaVerificacion.tsx`
- `src/components/ui/006_proveedores_ui/ErrorBoundary.tsx`

### Panel administrativo
- `src/components/admin/001_menu_lateral/MenuLateralAdmin.tsx`
- `src/components/admin/002_listado_formularios/ListadoFormulariosAdmin.tsx`
- `src/components/admin/003_formulario_base/FormularioBaseAdmin.tsx`
- `src/components/admin/004_editor_pestanas/EditorFormularioPestanas.tsx`
- `src/components/admin/005_editor_secciones/EditorSecciones.tsx`
- `src/components/admin/006_editor_preguntas/EditorPreguntas.tsx`
- `src/components/admin/007_editor_opciones/EditorOpciones.tsx`
- `src/components/admin/008_editor_textos/EditorTextos.tsx`
- `src/components/admin/009_editor_reglas/EditorReglas.tsx`
- `src/components/admin/011_listado_usuarios/ListadoUsuariosAdmin.tsx`

### Utilidades y hooks (mensajes visibles)
- `src/utils/flujoFormularioFallback.ts`
- `src/utils/flujoFormularioInterfaz.ts`
- `src/utils/validacionPregunta.ts`
- `src/utils/editorReglasAdmin.ts`
- `src/hooks/useOpcionesPregunta.ts`
- `src/hooks/useSubirArchivo.ts`

---

## Textos corregidos (muestra representativa)

| Área | Antes | Después |
|------|-------|---------|
| Login | Iniciar sesion / Inicia Sesion | Iniciar sesión / Inicia sesión |
| Contraseña | Contrasena, contrasena | Contraseña |
| Correo | Correo electronico valido | Correo electrónico válido |
| Registro | Registrate, publicas | Regístrate, públicas |
| Éxito | exito | éxito |
| Sesión | No hay sesion activa | No hay sesión activa |
| Offline | Sin conexion, operacion(es) | Sin conexión, operación(es) |
| Menú | Menu de navegacion | Menú de navegación |
| Términos | Terminos y condiciones | Términos y condiciones |
| Validación Zod | Minimo, Maximo, opcion | Mínimo, Máximo, opción |
| Contacto fallback | Como podemos ayudarte? | ¿Cómo podemos ayudarte? |
| Historial | Aun no / aparecera aqui | Aún no / aparecerá aquí |
| Admin | Catalogos, Configuracion | Catálogos, Configuración |
| Accesibilidad | reduccion de animaciones | reducción de animaciones |
| Error boundary | Ocurrio un error | Ocurrió un error |

---

## Fallbacks corregidos

Archivo central: `src/utils/flujoFormularioFallback.ts`

- Modales salir, sesión y guardado: tildes en sesión, regístrate, aquí, más tarde, éxito.
- Términos: título, párrafos legales con aplicación, información, política, autorización, entenderá, será, contarán.
- Enlace combinado en `flujoFormularioInterfaz.ts`: `Términos y condiciones`.
- Contacto: `¿Cómo podemos ayudarte?` cuando `texto_contacto` no viene del backend.
- Pantallas de envío, verificación y consentimiento: fallbacks `Encuesta enviada con éxito`, `Verificado con éxito`.
- `ContenidoTerminos.tsx`: enlace Política de Protección, escríbenos a.

---

## Textos que vienen de API y no se tocaron

- `configuracion.descripcion_aplicativo`, `texto_contacto`, `nombre_aplicativo`, logos y colores.
- Textos de formularios: preguntas, opciones, secciones, tooltips, mensajes de reglas (`mensaje_error` del backend).
- Respuestas de API en toasts y errores (`detalle` de endpoints).
- Contenido de términos cuando `flujo_formulario.terminos.contenido` o párrafos vienen del backend.
- Textos tipo `confirmacion_envio`, `verificacion_exitosa`, `autorizacion_datos` en estructura de formulario.
- Mensajes de éxito de contacto/copia cuando el backend responde (p. ej. `Tu mensaje fue enviado correctamente.`).
- Badges de disponibilidad calculados (`Próximamente` en `formularioDisponibilidad.ts` ya estaban correctos).

---

## Inconsistencias detectadas

1. **Migas registro correo:** se unificó a `Registro con correo electrónico` para alinear con el título de página.
2. **Variante «Usted» vs «usted»:** en fallbacks de términos se normalizó a minúscula institucional (`usted`) salvo inicio de oración; el backend puede seguir enviando otra convención.
3. **Tests de servicios** (`erroresApi.test.ts`) simulan mensajes API sin tildes (`El token de sesion no es valido`) — reflejan contrato backend, no UI local.
4. **Typecheck/lint preexistentes** no introducidos por esta iteración (ver comandos).

---

## Pendientes para backend / BD

| Ítem | Descripción |
|------|-------------|
| `flujo_formulario` | Enviar textos con tildes desde configuración de interfaz para reducir dependencia de fallbacks. |
| `texto_contacto` | Confirmar valor en BD: `¿Cómo podemos ayudarte?` |
| Mensajes de error API | Normalizar `detalle` con ortografía (sesión, válido, contraseña). |
| Restaurar contraseña | Mensajes de éxito del endpoint (`detalle`) con tildes. |
| Editor admin textos | Etiquetas de tipos de texto en API si se externalizan. |

---

## Comandos ejecutados

```bash
npm run typecheck
# Resultado: errores preexistentes en .next/types y PreguntaUbicacionGeografica.tsx (no relacionados con esta iteración).

npm run lint
# Resultado: 2 errores preexistentes (PreguntaUbicacionGeografica setState-in-effect, respuestasStore unused var) y warnings previos.

npm run test -- --run \
  src/components/auth/009_formulario_login/FormularioLogin.test.tsx \
  src/app/auth/registro/correo/FormularioRegistroCorreo.test.tsx \
  src/components/contacto/001_formulario_contacto/FormularioContacto.test.tsx \
  src/components/ui/012_modal_terminos/ModalTerminos.test.tsx \
  src/components/ui/014_modal_login_registro/ModalIniciarSesionRegistro.test.tsx \
  src/components/formularios/012_aviso_encuesta_proximamente/AvisoEncuestaProximamente.test.tsx \
  src/utils/validacionPregunta.test.ts \
  src/utils/flujoFormularioFallback.test.ts \
  src/components/offline/002_estado_sincronizacion/EstadoSincronizacion.test.tsx \
  src/components/offline/003_aviso_conexion_offline/AvisoConexionOffline.test.tsx \
  src/components/formularios/010_contenido_terminos/ContenidoTerminos.test.tsx \
  src/components/auth/010_formulario_solicitar_restaurar_password/FormularioSolicitarRestaurarPassword.test.tsx \
  src/components/auth/011_formulario_restaurar_password/FormularioRestaurarPassword.test.tsx \
  src/utils/migasNavegacion.test.ts \
  src/components/layout/001_encabezado/Encabezado.test.tsx \
  src/components/layout/009_menu_hamburguesa/MenuHamburguesa.test.tsx
# Resultado: 16 archivos, 58 tests — OK
```

`npm run test:coverage` no se ejecutó para esta iteración (alcance acotado a tests ajustados).

---

## Pruebas creadas o ajustadas

### Nuevas
- `src/components/auth/009_formulario_login/FormularioLogin.test.tsx`
- `src/app/auth/registro/correo/FormularioRegistroCorreo.test.tsx`
- `src/components/formularios/012_aviso_encuesta_proximamente/AvisoEncuestaProximamente.test.tsx`
- `src/components/offline/002_estado_sincronizacion/EstadoSincronizacion.test.tsx`
- `src/utils/flujoFormularioFallback.test.ts`
- `src/components/formularios/010_contenido_terminos/ContenidoTerminos.test.tsx`

### Ajustadas
- `src/utils/migasNavegacion.test.ts`
- `src/utils/validacionPregunta.test.ts`
- `src/components/layout/001_encabezado/Encabezado.test.tsx`
- `src/components/layout/009_menu_hamburguesa/MenuHamburguesa.test.tsx`
- `src/components/auth/010_formulario_solicitar_restaurar_password/FormularioSolicitarRestaurarPassword.test.tsx`
- `src/components/auth/011_formulario_restaurar_password/FormularioRestaurarPassword.test.tsx`
- `src/components/contacto/001_formulario_contacto/FormularioContacto.test.tsx`

### Sin cambios (ya alineados con fallbacks actualizados)
- `ModalTerminos.test.tsx`, `ModalIniciarSesionRegistro.test.tsx`, `AvisoConexionOffline.test.tsx`

---

## Notas

- No se creó `src/utils/textos.ts`: los fallbacks ya están centralizados en `flujoFormularioFallback.ts` y no justificaba otra capa de abstracción.
- La variante técnica `exito` en `ToastProvider` / `uiStore` se mantiene como clave interna, no como texto visible.
