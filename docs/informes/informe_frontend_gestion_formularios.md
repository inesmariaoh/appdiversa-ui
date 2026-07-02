# Informe — Panel administrativo de gestión de formularios (frontend)

**Proyecto:** AppDiversa UI  
**Fecha:** 30 de junio de 2026  
**Alcance:** Panel administrativo, autenticación Django, gestión de formularios/usuarios, menú responsive, pruebas y validación de calidad.

---

## 1. Resumen ejecutivo

Se implementó y validó el **panel administrativo** para gestionar formularios desde la interfaz web, integrado con autenticación Django por sesión (cookies), guards de ruta/permiso y reutilización de providers, tokens y componentes UI existentes.

El **flujo público anónimo** de diligenciamiento de encuestas permanece intacto.

**No implementado:** Keycloak (integración futura documentada).  
**No utilizado:** `X-API-INTERNA` ni tokens internos de API.

---

## 2. Rutas implementadas

### 2.1 Panel administrativo (`src/app/admin/`)

| Ruta | Descripción |
|------|-------------|
| `/admin` | Redirección al listado de formularios |
| `/admin/formularios` | Listado con acciones CRUD, publicar, cerrar, soft delete |
| `/admin/formularios/nuevo` | Creación de formulario (React Hook Form + Zod) |
| `/admin/formularios/[id]` | Datos generales del formulario |
| `/admin/formularios/[id]/editor` | Editor por pestañas (secciones, preguntas, opciones, textos, reglas, vista previa) |
| `/admin/formularios/[id]/versiones` | Gestión de versiones |
| `/admin/usuarios` | Gestión básica de usuarios y grupos |

### 2.2 Autenticación

| Ruta | Descripción |
|------|-------------|
| `/auth/login` | Inicio de sesion Django |
| `/auth/salir` | Cierre de sesion |
| `/auth/perfil` | Perfil y cambio de contrasena |

### 2.3 Protección de rutas

- **`RutaProtegida`:** sin autenticación → redirección a `/auth/login?destino=...`
- **`TienePermiso` / `TieneRol`:** sin permiso → `Pantalla403` accesible
- **`InicializadorAuth` + `useAuthInicial`:** carga de perfil al arrancar la app

---

## 3. Arquitectura

### 3.1 Servicios (`src/services`)

| Servicio | Responsabilidad |
|----------|-----------------|
| `authServicio.ts` | Login, logout, perfil, cambio/restauración de contraseña |
| `formulariosAdminServicio.ts` | CRUD admin de formularios, secciones, preguntas, opciones, textos, reglas, versiones |
| `usuariosAdminServicio.ts` | Usuarios y grupos administrativos |
| `api.ts` | Cliente Axios con `withCredentials: true`; limpieza de sesión anónima ante `403` solo si hay header `X-Sesion-Anonima` |

### 3.2 Store

- **`authStore.ts`:** usuario, grupos, permisos, `iniciarSesion`, `cerrarSesion`, `tienePermiso`, `tieneRol`. No persiste contraseñas.

### 3.3 Tipos

- `src/types/auth.ts` — autenticación y permisos
- `src/types/admin.ts` — DTOs del panel administrativo

---

## 4. Componentes administrativos

| Componente | Función |
|------------|---------|
| `001_menu_lateral/MenuLateralAdmin` | Navegación lateral responsive |
| `002_listado_formularios/ListadoFormulariosAdmin` | Tabla de formularios y acciones |
| `003_formulario_base/FormularioBaseAdmin` | Datos generales con **RHF + Zod** |
| `004_editor_pestanas/EditorFormularioPestanas` | Pestañas del editor |
| `005_editor_secciones/EditorSecciones` | CRUD de secciones |
| `006_editor_preguntas/EditorPreguntas` | CRUD de preguntas por `tipo_pregunta` |
| `007_editor_opciones/EditorOpciones` | Opciones de preguntas |
| `008_editor_textos/EditorTextos` | Textos legales/confirmación (HTML sanitizado) |
| `009_editor_reglas/EditorReglas` | Reglas con `editorReglasAdmin.ts` |
| `010_vista_previa/VistaPreviaFormulario` | Preview con renderizador público (`modoPreview`) |
| `011_listado_usuarios/ListadoUsuariosAdmin` | Usuarios, grupos y permisos |
| `012_pantalla_403/Pantalla403` | Pantalla 403 amigable |

### 4.1 Editor y validación

- **Formulario base admin:** React Hook Form + Zod (`FormularioBaseAdmin.tsx`).
- **Editores de secciones/preguntas/opciones/reglas:** estado local con validación en servicios; alineados al contrato REST admin.
- **Vista previa:** reutiliza `PanelFormulario` con `modoPreview=true` (sin sesión anónima ni persistencia).

### 4.2 Menú hamburguesa (`009_menu_hamburguesa/MenuHamburguesa.tsx`)

En pantallas medianas/pequeñas, drawer con focus trap y navegación por teclado:

- Inicio, Encuestas, Contacto, Registro
- Inicio de sesión / Cerrar sesión
- **Perfil** (si autenticado) → `/auth/perfil`
- **Panel administrativo** (si tiene permisos)

---

## 5. Flujo público anónimo

- Rutas `/encuestas/[uuid]` sin cambios de contrato.
- Headers `X-Sesion-Anonima` y `X-Token-Sesion` intactos.
- `403` en endpoints admin **no** limpia la sesión anónima.
- E2E confirma que tras logout admin el usuario anónimo sigue viendo encuestas.

### 5.1 Mejora offline en esta entrega

Se integró `EstadoSincronizacion` en `PanelFormulario` para mostrar el conteo de operaciones pendientes y permitir reintento manual al reconectar.

---

## 6. Pruebas

### 6.1 Unitarias / integración (Vitest) — 288 tests

| Área solicitada | Archivo(s) |
|-----------------|------------|
| Auth guard | `RutaProtegida.test.tsx` |
| Menú hamburguesa | `MenuHamburguesa.test.tsx` |
| Listado formularios | `ListadoFormulariosAdmin.test.tsx` |
| Crear formulario | `FormularioBaseAdmin.test.tsx` |
| Editor pregunta | `EditorPreguntas.test.tsx` |
| Editor opciones | `EditorOpciones.test.tsx` |
| Editor reglas | `EditorReglas.test.tsx` |
| Vista previa | `VistaPreviaFormulario.test.tsx` |
| Permisos | `TienePermiso.test.tsx`, `Pantalla403.test.tsx` |
| Servicios admin | `formulariosAdminServicio.test.ts`, `usuariosAdminServicio.test.ts` |
| Auth | `authServicio.test.ts`, `authStore.test.ts`, `useAuthInicial.test.ts` |

### 6.2 E2E (Playwright) — 6 tests

| Archivo | Escenario |
|---------|-----------|
| `e2e/admin.spec.ts` | Login admin, crear formulario, sección, pregunta, preview, logout, encuesta pública anónima |
| `e2e/formulario.spec.ts` | Flujo completo de diligenciamiento con API simulada |
| `e2e/offline.spec.ts` | Guardado offline y sincronización al reconectar |
| `e2e/inicio.spec.ts` | Carga de aplicación y accesibilidad básica |
| `e2e/restaurar-copia.spec.ts` | Restauración de contraseña (flujo complementario) |

**Infraestructura E2E:**

- Mock API: `e2e/mockApi.mjs` (puerto `18000`)
- Next.js: `build` + `start` en puerto `3010` (evita conflicto con `next dev` en el mismo directorio)
- Variables: `NEXT_PUBLIC_API_BASE_URL` y `API_BASE_URL` apuntan al mock durante E2E

---

## 7. Validación final

| Comando | Resultado |
|---------|-----------|
| `npm run typecheck` | **OK** |
| `npm run lint` | **OK** (0 errores; 1 warning en artefacto `coverage/`) |
| `npm run test` | **288 tests OK** (75 archivos) |
| `npm run test:coverage` | **95.07 %** líneas/statements (umbral 95 % cumplido) |
| `npm run test:e2e` | **6/6 OK** |

---

## 8. Correcciones aplicadas en esta validación

1. **`EstadoSincronizacion`** renderizado en `PanelFormulario` para feedback offline visible en UI y E2E.
2. **`playwright.config.ts`:** servidores dedicados (`reuseExistingServer: false`), puerto dev E2E `3010`, comando `build && start`.
3. **Selectores E2E** ajustados: login admin, confirmación de envío (`/confirmar env/i`), editor admin (`main` + roles), reconexión offline con evento `online`.
4. **`MenuHamburguesa`:** enlace **Perfil** para usuarios autenticados.

---

## 9. Dependencia backend

Los endpoints admin se consumen bajo `/api/v1/admin/...` y auth bajo `/api/v1/auth/...` según documentación del proyecto. Validar contrato final con OpenAPI Django cuando esté publicado.

Credenciales mock E2E: `admin` / `admin123`.

---

## 10. Archivos principales

```
src/app/admin/**
src/app/auth/**
src/components/admin/001-012/**
src/components/auth/006_ruta_protegida/
src/components/auth/007_tiene_permiso/
src/components/auth/008_tiene_rol/
src/components/layout/009_menu_hamburguesa/
src/components/layout/010_inicializador_auth/
src/services/authServicio.ts
src/services/formulariosAdminServicio.ts
src/services/usuariosAdminServicio.ts
src/store/authStore.ts
src/types/auth.ts
src/types/admin.ts
src/utils/editorReglasAdmin.ts
e2e/admin.spec.ts
e2e/mockApi.mjs
playwright.config.ts
```

---

*Informe generado como entrega del panel administrativo de gestión de formularios — AppDiversa UI.*
