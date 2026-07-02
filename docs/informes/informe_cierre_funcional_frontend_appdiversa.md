# Informe — Cierre funcional E2E pre-demo AppDiversa UI

**Proyecto:** AppDiversa UI  
**Fecha:** 30 de junio de 2026  
**Alcance:** Validación y correcciones mínimas para demo funcional (auth Django, panel admin, encuesta online/offline, perfil e historial).

---

## 1. Resumen ejecutivo

Se cerraron los puntos críticos del frontend para la demo pre-producción:

- Autenticación Django con **guards por permiso y rol**.
- Separación **editar** vs **publicar** formularios (`formularios.editar` / `formularios.publicar`).
- Vinculación opcional de sesión anónima tras login (`POST /api/v1/sesiones/{uuid}/vincular-usuario/`).
- Mock E2E ampliado con usuarios demo y pruebas `e2e/auth.spec.ts`.
- Flujos online, offline, contacto y panel admin cubiertos por specs existentes o nuevos.

**No implementado (fuera de alcance):** Keycloak, `X-API-INTERNA`.

---

## 2. Usuarios Django para pruebas

| Usuario | Contraseña (mock E2E) | Grupo | Permisos clave |
|---------|----------------------|-------|----------------|
| `admin` | `admin123` | `administrador_general` | Todos (ver, editar, publicar, usuarios) |
| `admin_appdiversa` | `demo1234` | `admin_appdiversa` | Todos (ver, editar, publicar, usuarios) |
| `gestor_formularios` | `demo1234` | `gestor_formularios` | ver, editar, **publicar** |
| `editor_formularios` | `demo1234` | `editor_formularios` | ver, editar (sin publicar) |
| `lector_formularios` | `demo1234` | `lector_formularios` | solo **ver** |

En backend Django real, usar las credenciales configuradas en el entorno de desarrollo. El mock E2E (`e2e/mockApi.mjs`) replica estos perfiles para Playwright.

---

## 3. Guards implementados

| Escenario | Comportamiento |
|-----------|----------------|
| Sin autenticación → `/admin/*` | Redirección a `/auth/login` (`RutaProtegida`) |
| Lector | Listado admin solo lectura (botón **Ver**) |
| Editor | Crear/editar/duplicar/cerrar/eliminar; **sin** botón Publicar |
| Gestor | Edición + botón **Publicar** |
| Admin (`administrador_general` o `admin_appdiversa`) | Acceso a `/admin/usuarios` |

Archivos clave:

- `src/components/admin/002_listado_formularios/ListadoFormulariosAdmin.tsx`
- `src/types/auth.ts` — `PERMISO_FORMULARIOS_PUBLICAR`, grupos demo
- `src/store/authStore.ts` — `esAdministrador()`
- `src/components/auth/008_tiene_rol/TieneRol.tsx` — acepta rol único o lista

---

## 4. Flujos validados

### 4.1 Panel administrativo

- Login → listado → crear formulario → editor (secciones, preguntas) → vista previa → logout.
- Spec: `e2e/admin.spec.ts`.

### 4.2 Encuesta online anónima

- Inicio → términos → respuestas → finalizar → resumen → copia por correo.
- Spec: `e2e/formulario.spec.ts`, `e2e/modales.spec.ts`.

### 4.3 Encuesta offline anónima

- Respuesta sin red → IndexedDB → reconexión → sincronización automática → continuar formulario.
- Spec: `e2e/offline.spec.ts`.

### 4.4 Registro / login / perfil / historial

- Login Django, perfil (`/auth/perfil`), historial (`/mis-respuestas`), restaurar contraseña.
- Vinculación sesión: tras login con `uuid_sesion` + `token_cliente` (query o store).
- Specs: `e2e/auth.spec.ts`, `e2e/restaurar-copia.spec.ts`.

### 4.5 Contacto

- Spec: `e2e/contacto.spec.ts`.

---

## 5. Vinculación sesión ↔ usuario

Servicio: `vincularUsuarioSesion` en `src/services/sesionesServicio.ts`.

Se invoca desde `FormularioLogin` después de un login exitoso cuando existen:

- `uuid_sesion` y `token_cliente` en query string, o
- credenciales en `sesionStore` (flujo modal “guardar progreso”).

La URL de login/registro desde modales incluye ambos parámetros (`useFlujoModalesFormulario`).

Si el backend no expone el endpoint, la vinculación falla en silencio y el login continúa.

---

## 6. Cómo probar en desarrollo

### Online / admin

1. Backend Django en marcha con `NEXT_PUBLIC_API_BASE_URL` apuntando al API.
2. Iniciar frontend: `npm run dev`.
3. Probar login con usuarios de la tabla §2.

### Offline (DevTools)

1. Abrir encuesta en `/encuestas/{uuid}/responder`.
2. Aceptar términos y responder al menos una pregunta.
3. DevTools → **Network** → **Offline**.
4. Editar respuesta: debe aparecer “pendiente de sincronizar”.
5. Volver a **Online** o disparar evento `online`.
6. Verificar banner de sincronización y cola vacía.

### IndexedDB

1. DevTools → **Application** → **IndexedDB** → base `AppDiversaDb`.
2. Revisar stores: `sesiones`, `respuestas_locales`, `cola_sincronizacion`, `aceptaciones_terminos`.

### Correo (copia de respuestas)

- Solo funciona si el backend tiene SMTP configurado o usa consola/dummy en desarrollo.
- Endpoint: `POST /api/v1/sesiones/{uuid}/enviar-copia/`.

### E2E local (mock API)

```bash
npm run test:e2e -- e2e/admin.spec.ts e2e/offline.spec.ts e2e/auth.spec.ts e2e/contacto.spec.ts
```

Playwright levanta `e2e/mockApi.mjs` y Next.js en modo producción automáticamente.

---

## 7. Cambios realizados en esta iteración

| Archivo | Cambio |
|---------|--------|
| `src/types/auth.ts` | Grupos demo, `formularios.publicar`, helpers administrador |
| `src/store/authStore.ts` | `esAdministrador()` |
| `ListadoFormulariosAdmin.tsx` | Botón Publicar condicionado a permiso |
| `FormularioLogin.tsx` | Vinculación post-login |
| `sesionesServicio.ts` | `vincularUsuarioSesion` |
| `useFlujoModalesFormulario.ts` | `token_cliente` en URLs auth |
| `e2e/mockApi.mjs` | Perfiles multi-rol, seed formulario, vincular-usuario |
| `e2e/auth.spec.ts` | **Nuevo** — guards por rol |

---

## 8. Tests ejecutados (subset iteración)

Comandos solicitados:

```bash
npm run typecheck
npm run lint
npm run test -- --run src/components/admin src/components/formularios src/components/auth src/services
npm run test:e2e -- e2e/admin.spec.ts e2e/offline.spec.ts e2e/auth.spec.ts e2e/contacto.spec.ts
```

*(Resultados — 30 jun 2026)*

| Comando | Resultado |
|---------|-----------|
| `npm run typecheck` | OK |
| `npm run lint` | OK (0 errores; 2 warnings preexistentes) |
| `npm run test -- --run src/components/admin … src/services` | **125 tests OK** |
| `npm run test:e2e -- e2e/admin.spec.ts e2e/offline.spec.ts e2e/auth.spec.ts e2e/contacto.spec.ts` | **9 tests OK** |

---

## 9. Limitaciones conocidas

- OpenAPI local aún no documenta `vincular-usuario`; el frontend lo consume de forma defensiva.
- Registro por correo redirige a verificación; la vinculación se aplica en **login** posterior.
- Publicación real depende del backend aceptar `POST .../publicar/` con permiso `formularios.publicar`.
- Correo en desarrollo requiere configuración SMTP o salida dummy del backend.

---

## 10. Checklist demo

- [x] Login Django (4 roles + admin legacy)
- [x] Guards admin por permiso
- [x] CRUD formularios en panel (E2E admin)
- [x] Encuesta online anónima completa (E2E formulario/modales)
- [x] Offline + sync (E2E offline)
- [x] Perfil / historial / restaurar contraseña (rutas + E2E parcial)
- [x] Vincular sesión tras login (servicio + mock)
- [x] Informe y guía de pruebas en desarrollo
