# Informe — Restaurar contraseña, contacto y copia de respuestas (frontend)

**Proyecto:** AppDiversa UI  
**Fecha:** 30 de junio de 2026  
**Alcance:** Solicitud/restauración de contraseña, formulario de contacto, envío de copia de respuestas, pruebas y validación.

---

## 1. Resumen ejecutivo

Se implementaron y validaron las funcionalidades frontend solicitadas:

- Solicitar restauración de contraseña por correo
- Restablecer contraseña con `uid` y `token` del enlace
- Enviar mensaje de contacto desde `/contacto`
- Enviar copia de respuestas al correo desde el resumen post-finalización

El flujo **anónimo** de encuestas permanece intacto. No se usa Keycloak ni `X-API-INTERNA`.

---

## 2. Servicios

| Servicio | Función | Endpoint |
|----------|---------|----------|
| `authServicio.ts` | `solicitarRestaurarPassword` | `POST /api/v1/auth/solicitar-restaurar-password/` |
| `authServicio.ts` | `restaurarPassword` | `POST /api/v1/auth/restaurar-password/` |
| `contactoServicio.ts` | `enviarMensajeContacto` | `POST /api/v1/contacto/` |
| `sesionesServicio.ts` | `enviarCopiaRespuestas` | `POST /api/v1/sesiones/{uuid}/enviar-copia/` |

Headers de sesión anónima en enviar copia: `X-Sesion-Anonima`, `X-Token-Sesion`.

---

## 3. Tipos

| Archivo | Tipos |
|---------|-------|
| `src/types/auth.ts` | `SolicitarRestaurarPasswordPayload`, `RestaurarPasswordPayload`, `RespuestaDetalle` |
| `src/types/contacto.ts` | `ContactoPayload` |
| `src/types/sesion.ts` | `EnviarCopiaRespuestasPayload` |

---

## 4. Rutas y pantallas

| Ruta | Componente | Comportamiento |
|------|------------|----------------|
| `/auth/solicitar-restaurar-password` | `FormularioSolicitarRestaurarPassword` | Email + Zod; mensaje genérico del backend; enlace a login |
| `/auth/restaurar-password?uid=&token=` | `FormularioRestaurarPassword` | Nueva contraseña; enlace inválido si faltan params |
| `/auth/login` | `FormularioLogin` | Enlace **¿Olvidaste tu contraseña?** |
| `/contacto` | `FormularioContacto` | nombre, correo, asunto, mensaje; toast éxito/error |
| `/encuestas/[uuid]/resumen` | `FormularioEnviarCopia` | Copia al correo sin exigir login |

---

## 5. Validaciones Zod

| Formulario | Reglas |
|------------|--------|
| Solicitar restauración | email obligatorio y válido |
| Restaurar contraseña | mínimo 8 caracteres; confirmación igual |
| Contacto | nombre, correo, asunto obligatorios; mensaje mínimo 10 caracteres |
| Enviar copia | correo obligatorio y válido |

---

## 6. Mensajes de éxito/error

- **Solicitar/restaurar contraseña:** `<output>` para éxito; `role="alert"` para errores
- **Contacto y copia:** `ToastProvider` con variantes `exito` / `error`
- Errores API: `extraerDetalleError` — solo mensaje funcional `{ detalle }`

---

## 7. Pruebas

### 7.1 Unitarias (Vitest) — 295 tests

| Área | Archivos |
|------|----------|
| Auth servicio | `authServicio.test.ts` |
| Contacto servicio | `contactoServicio.test.ts` |
| Sesiones servicio | `sesionesServicio.test.ts` |
| Solicitar restauración | `FormularioSolicitarRestaurarPassword.test.tsx` |
| Restaurar contraseña | `FormularioRestaurarPassword.test.tsx` |
| Contacto | `FormularioContacto.test.tsx` |
| Enviar copia | `FormularioEnviarCopia.test.tsx` |

### 7.2 E2E (Playwright) — 7 tests

| Archivo | Escenario |
|---------|-----------|
| `e2e/restaurar-copia.spec.ts` | Login → olvidé contraseña → solicitar → restaurar con uid/token fake |
| `e2e/contacto.spec.ts` | Contacto envía mensaje y muestra confirmación |
| `e2e/formulario.spec.ts` | Resumen envía copia a correo; flujo anónimo completo |
| `e2e/admin.spec.ts` | Encuesta anónima sigue funcionando tras logout admin |
| `e2e/offline.spec.ts` | Flujo offline intacto |
| `e2e/inicio.spec.ts` | Carga básica |

Mock API ampliado: `e2e/mockApi.mjs` (auth restaurar, contacto, enviar-copia).

---

## 8. Validación final

| Comando | Resultado |
|---------|-----------|
| `npm run typecheck` | **OK** |
| `npm run lint` | **OK** |
| `npm run test` | **295 tests OK** (77 archivos) |
| `npm run test:coverage` | **95.09 %** (umbral 95 % cumplido) |
| `npm run test:e2e` | **7/7 OK** |

---

## 9. Archivos creados o modificados en esta entrega

```
src/types/contacto.ts
src/services/contactoServicio.ts
src/services/contactoServicio.test.ts
src/components/contacto/001_formulario_contacto/
src/app/contacto/page.tsx (formulario real)
e2e/contacto.spec.ts
e2e/mockApi.mjs (POST /api/v1/contacto/)
src/components/auth/011_formulario_restaurar_password/FormularioRestaurarPassword.tsx (<output> a11y)
src/components/ui/011_modal/Modal.tsx (useId — lint)
docs/informes/informe_frontend_restaurar_password_contacto_copia.md
```

Archivos ya existentes del alcance (sesión anterior): auth, copia resumen, rutas auth, tests y E2E restaurar/copia.

---

## 10. Restricciones cumplidas

- Sin Keycloak
- Sin `X-API-INTERNA`
- Flujo anónimo de encuestas sin cambios de contrato
- Providers existentes: `AppThemeProvider`, `ProveedorApp`, `ToastProvider`, tokens CSS

---

*Informe generado como entrega del módulo restaurar contraseña, contacto y copia de respuestas — AppDiversa UI.*
