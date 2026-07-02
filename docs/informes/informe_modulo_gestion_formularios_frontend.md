# Informe — Módulo de autenticación Django y gestión de formularios (frontend)

**Proyecto:** AppDiversa UI  
**Fecha:** 30 de junio de 2026  
**Alcance:** Autenticación Django, panel administrativo, gestión de formularios/usuarios, menú responsive, pruebas y validación.

---

## 1. Resumen ejecutivo

Se implementó el módulo frontend de **autenticación Django** y **gestión administrativa de formularios y usuarios**, reutilizando providers, tokens, stores y componentes existentes. El flujo **público anónimo** de diligenciamiento de encuestas se mantiene intacto.

**No implementado en esta entrega:** Keycloak (documentado como integración futura).  
**No utilizado:** `X-API-INTERNA` ni tokens internos.

---

## 2. Arquitectura implementada

### 2.1 Servicios (`src/services`)

| Servicio | Endpoints |
|----------|-----------|
| `authServicio.ts` | `POST /api/v1/auth/login/`, `logout/`, `GET me/`, `POST cambiar-password/` |
| `formulariosAdminServicio.ts` | CRUD bajo `/api/v1/admin/formularios/` (formularios, secciones, preguntas, opciones, textos, reglas, versiones) |
| `usuariosAdminServicio.ts` | `/api/v1/admin/usuarios/`, `/api/v1/admin/grupos/` |

`api.ts` actualizado con `withCredentials: true` para cookies de sesión Django. La limpieza de sesión anónima ante `403` solo ocurre cuando la petición incluye el header `X-Sesion-Anonima`, preservando el flujo público.

### 2.2 Store (`src/store/authStore.ts`)

Estado: `usuario`, `autenticado`, `grupos`, `permisos`, `cargando`, `error`, `inicializado`.  
Acciones: `iniciarSesion`, `cerrarSesion`, `cargarPerfil`, `tienePermiso`, `tieneRol`.  
**No se almacena contraseña.**

### 2.3 Tipos

- `src/types/auth.ts` — usuario, perfil, permisos, grupos.
- `src/types/admin.ts` — DTOs de formularios, secciones, preguntas, opciones, textos y reglas administrativas.

---

## 3. Rutas y protección

### 3.1 Autenticación

| Ruta | Comportamiento |
|------|----------------|
| `/auth/login` | Login Django vía `FormularioLogin` + `authStore` |
| `/auth/registro` | Mensaje de invitación administrativa; social Keycloak solo si hay env configurada |
| `/auth/salir` | Cierre de sesión y redirección |
| `/auth/perfil` | Cambio de contraseña autenticado |

### 3.2 Panel administrativo (`src/app/admin/`)

Rutas protegidas con `RutaProtegida`:

- `/admin`
- `/admin/formularios`
- `/admin/formularios/nuevo`
- `/admin/formularios/[id]`
- `/admin/formularios/[id]/versiones`
- `/admin/formularios/[id]/editor`
- `/admin/usuarios`

**Guards:** `RutaProtegida`, `TienePermiso`, `TieneRol`, `Pantalla403`.

- Sin autenticación → redirección a `/auth/login?destino=...`
- Sin permiso → pantalla 403 accesible

`InicializadorAuth` + `useAuthInicial` integrados en `ProveedorApp`.

---

## 4. Layout y navegación

### 4.1 Layout admin

- `MenuLateralAdmin` responsive (Formularios, Usuarios, Catálogos, Analítica futura, Configuración futura).
- Reutiliza `Encabezado`, `AppThemeProvider`, `ProveedorApp`, `BarraFlotante`, `tokens.css`, Tailwind.

### 4.2 Menú hamburguesa global

- Componente: `src/components/layout/009_menu_hamburguesa/MenuHamburguesa.tsx`
- Desktop: navegación estándar en `Encabezado`.
- Móvil/tablet: drawer con focus trap (`useFocusTrap`), Escape, `aria-label`, navegación por teclado.
- Enlaces: Inicio, Encuestas, Contacto, Registro, Inicio/Cierre sesión, Panel admin (si aplica).

### 4.3 Encabezado

- Muestra `MenuPerfil` cuando hay sesión Django.
- Enlace a panel admin si el usuario tiene permisos de formularios o rol `administrador_general`.

---

## 5. Gestión de formularios (admin)

### 5.1 Listado (`/admin/formularios`)

`ListadoFormulariosAdmin`: código, nombre, tipo, estado, fechas, versión publicada, acciones (crear, editar, duplicar, estructura, publicar, cerrar, eliminar lógico).

### 5.2 Creación (`/admin/formularios/nuevo`)

`FormularioBaseAdmin`: código, nombre, descripción, introducción, objetivo, tipo, estado, fechas, offline, registro final, imagen portada.

### 5.3 Editor (`/admin/formularios/[id]/editor`)

`EditorFormularioPestanas` con pestañas:

1. Datos generales  
2. Versiones  
3. Secciones (`EditorSecciones`)  
4. Preguntas + opciones (`EditorPreguntas`, `EditorOpciones`)  
5. Textos (`EditorTextos` — sanitización HTML)  
6. Reglas (`EditorReglas` + `editorReglasAdmin.ts`)  
7. Vista previa (`VistaPreviaFormulario`)

### 5.4 Vista previa

Reutiliza el renderizador público en **modo preview** (`modoPreview` en `PanelFormulario`, sesión anónima deshabilitada). No persiste respuestas reales.

---

## 6. Gestión de usuarios

`/admin/usuarios` — `ListadoUsuariosAdmin` visible solo para rol `administrador_general`: listar, crear, editar, activar/desactivar, asignar grupos, ver permisos.

---

## 7. Flujo público anónimo

- Sin cambios en rutas `/encuestas/[uuid]`.
- Sesión anónima (`X-Sesion-Anonima`, `X-Token-Sesion`) intacta.
- `403` en auth admin **no** limpia sesión anónima.
- Anchor `#encuestas` en listado público para menú móvil.

---

## 8. Keycloak (futuro)

Botones sociales en login/registro solo si existen `NEXT_PUBLIC_KEYCLOAK_*`. Documentado como fase posterior; login principal es Django.

---

## 9. Pruebas

### 9.1 Unitarias / integración (Vitest)

Cobertura en `services`, `hooks`, `utils`, `store`:

| Área | Archivos de prueba destacados |
|------|-------------------------------|
| Auth | `authServicio.test.ts`, `authStore.test.ts`, `useAuthInicial.test.ts` |
| Admin API | `formulariosAdminServicio.test.ts`, `usuariosAdminServicio.test.ts` |
| Guards | `RutaProtegida.test.tsx`, `Pantalla403.test.tsx` |
| UI admin | `ListadoFormulariosAdmin.test.tsx` |
| Menú | `MenuHamburguesa.test.tsx`, `useFocusTrap.test.ts`, `Encabezado.test.tsx` |
| Reglas | `editorReglasAdmin.test.ts` |
| API | `api.test.ts` (403 con/sin sesión anónima, host SSR) |

### 9.2 E2E (Playwright)

- `e2e/admin.spec.ts` — login admin, crear formulario borrador, sección, pregunta, preview, logout, encuesta pública anónima.
- `e2e/mockApi.mjs` ampliado con auth y endpoints admin.

**Requisito local:** detener cualquier instancia previa de `next dev` en el mismo directorio (Next.js 16 impide dos servidores de desarrollo simultáneos). Playwright levanta mock API en `:18000` y Next en `:3001` con `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:18000`.

---

## 10. Validación final

| Comando | Resultado |
|---------|-----------|
| `npm run typecheck` | OK |
| `npm run lint` | OK (0 errores; 2 warnings menores en coverage y eslint-disable) |
| `npm run test` | **246 tests OK** |
| `npm run test:coverage` | **95.11 %** líneas/statements (umbral 95 % cumplido) |
| `npm run test:e2e` | Requiere entorno limpio (ver §9.2). Selectores admin corregidos (`Inicia Sesion`, labels del formulario). |

---

## 11. Correcciones técnicas relevantes

1. **`ejecutarSinEspera`**: envuelve con `Promise.resolve()` para tolerar mocks que no devuelven promesa (evita fallo en carga de catálogos).
2. **`useOpcionesPregunta.test.ts`**: opciones estáticas vacías en tests de catálogo; mock de `guardarCatalogoEnCache` resuelve promesa.
3. **`MenuPerfil`**: refactor para cumplir regla `react-hooks/refs`.
4. **`playwright.config.ts`**: puerto configurable `PLAYWRIGHT_DEV_PORT`.

---

## 12. Dependencia backend

Los endpoints admin se consumen según convención REST inferida (`/api/v1/admin/...`). Validar contrato final con OpenAPI del backend Django cuando esté publicado. Credenciales mock E2E: `admin` / `admin123`.

---

## 13. Próximos pasos sugeridos

1. Publicar OpenAPI de auth/admin y alinear tipos si difieren.
2. Completar páginas placeholder (Catálogos admin, Analítica, Configuración).
3. Integración Keycloak cuando el backend lo habilite.
4. Ampliar tests E2E de editor de opciones/reglas y gestión de usuarios UI.
5. Pipeline CI con `CI=true` para E2E sin conflicto de puertos.

---

## 14. Archivos principales creados o modificados

```
src/services/authServicio.ts
src/services/formulariosAdminServicio.ts
src/services/usuariosAdminServicio.ts
src/store/authStore.ts
src/types/auth.ts, admin.ts
src/app/admin/**
src/app/auth/**
src/components/admin/001-012/**
src/components/auth/006-009/**
src/components/layout/009_menu_hamburguesa/
src/components/layout/010_inicializador_auth/
src/hooks/useAuthInicial.ts, useFocusTrap.ts
src/utils/editorReglasAdmin.ts
e2e/admin.spec.ts, e2e/mockApi.mjs (ampliado)
```

---

*Informe generado como parte de la implementación del módulo de gestión de formularios frontend AppDiversa UI.*
