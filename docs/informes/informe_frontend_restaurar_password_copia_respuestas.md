# Informe — Restaurar contraseña y copia de respuestas (frontend)

**Proyecto:** AppDiversa UI  
**Fecha:** 30 de junio de 2026  
**Alcance:** Solicitud/restauración de contraseña Django, envío de copia de respuestas en resumen, pruebas y validación.

---

## 1. Resumen ejecutivo

Se implementaron las pantallas y servicios para:

- Solicitar restauración de contraseña por correo
- Restablecer contraseña con `uid` y `token` del enlace
- Enviar copia de respuestas al correo desde el resumen post-finalización

El flujo **anónimo** de encuestas se mantiene intacto. No se usa Keycloak ni `X-API-INTERNA`.

---

## 2. Archivos creados

| Archivo | Descripción |
|---------|-------------|
| `src/app/auth/solicitar-restaurar-password/page.tsx` | Página solicitar restauración |
| `src/app/auth/restaurar-password/page.tsx` | Página nueva contraseña |
| `src/components/auth/010_formulario_solicitar_restaurar_password/` | Formulario + tests |
| `src/components/auth/011_formulario_restaurar_password/` | Formulario + tests |
| `src/components/formularios/007_formulario_enviar_copia/` | Formulario enviar copia + tests |
| `e2e/restaurar-copia.spec.ts` | E2E flujo completo |
| `docs/informes/informe_frontend_restaurar_password_copia_respuestas.md` | Este informe |

---

## 3. Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `src/services/authServicio.ts` | `solicitarRestaurarPassword`, `restaurarPassword` |
| `src/services/sesionesServicio.ts` | `enviarCopiaRespuestas` con headers de sesión |
| `src/types/auth.ts` | `RespuestaDetalle`, payloads de restauración |
| `src/types/sesion.ts` | `EnviarCopiaRespuestasPayload` |
| `src/components/auth/009_formulario_login/FormularioLogin.tsx` | Enlace a `/auth/solicitar-restaurar-password` |
| `src/components/formularios/006_resumen_sesion/ResumenSesion.tsx` | Sección enviar copia |
| `src/services/authServicio.test.ts` | Tests nuevos endpoints |
| `src/services/sesionesServicio.test.ts` | Test enviar copia |
| `e2e/mockApi.mjs` | Mock auth restaurar + enviar-copia |

---

## 4. Rutas nuevas

| Ruta | Comportamiento |
|------|----------------|
| `/auth/solicitar-restaurar-password` | Formulario email → mensaje genérico de éxito |
| `/auth/restaurar-password?uid=&token=` | Nueva contraseña; error si faltan params |

Enlace desde login: **¿Olvidaste tu contraseña?**

---

## 5. Servicios y endpoints

### Auth (`authServicio.ts`)

- `POST /api/v1/auth/solicitar-restaurar-password/` — payload `{ email }`
- `POST /api/v1/auth/restaurar-password/` — payload `{ uid, token, password_nueva, password_confirmacion }`

### Sesiones (`sesionesServicio.ts`)

- `POST /api/v1/sesiones/{uuid}/enviar-copia/` — payload `{ correo }`  
  Headers: `X-Sesion-Anonima`, `X-Token-Sesion`

---

## 6. Tipos

```typescript
// auth.ts
RespuestaDetalle
SolicitarRestaurarPasswordPayload
RestaurarPasswordPayload

// sesion.ts
EnviarCopiaRespuestasPayload
```

---

## 7. Validaciones (Zod + RHF)

| Formulario | Reglas |
|------------|--------|
| Solicitar restauración | Email obligatorio y formato válido |
| Restaurar contraseña | Mínimo 8 caracteres, confirmación igual |
| Enviar copia | Correo obligatorio y válido |

---

## 8. UI y accesibilidad

- Componentes: `CampoTexto`, `CampoContrasena`, `Boton`, `VentanaAuth`, `EncabezadoAuth`
- Toast en envío de copia vía `useToast` / `ToastProvider`
- Labels asociados, `aria-describedby` en errores, `role="alert"` / `role="status"`
- Submit deshabilitado durante carga
- No se muestran `uid`/`token` en consola ni en mensajes de error genéricos

---

## 9. Manejo de errores

- Errores API: campo `detalle` del backend vía `extraerDetalleError`
- Fallback: mensaje funcional genérico del utilitario existente
- Solicitar restauración: mensaje de éxito **no revela** si el correo existe

---

## 10. Pruebas agregadas

| Área | Archivo |
|------|---------|
| Auth servicio | `authServicio.test.ts` (+3 casos) |
| Sesiones servicio | `sesionesServicio.test.ts` (+1 caso) |
| Solicitar restauración | `FormularioSolicitarRestaurarPassword.test.tsx` |
| Restaurar contraseña | `FormularioRestaurarPassword.test.tsx` |
| Enviar copia | `FormularioEnviarCopia.test.tsx` |
| E2E auth | `e2e/restaurar-copia.spec.ts` |
| E2E copia en resumen | `e2e/formulario.spec.ts` (ampliado) |

---

## 11. Resultados de comandos

| Comando | Resultado |
|---------|-----------|
| `npm run typecheck` | OK |
| `npm run lint` | OK (0 errores) |
| `npm run test` | **275 tests OK** |
| `npm run test:coverage` | **95.07 %** (umbral cumplido) |
| `npm run test:e2e` | Requiere entorno sin `next dev` previo en el mismo directorio |

---

## 12. Pendientes

1. Validar contrato exacto con OpenAPI del backend cuando se publique.
2. Ejecutar E2E en CI con servidores mock levantados por Playwright.
3. Mensaje de éxito de restauración: confirmar texto definitivo con backend.

---

## 13. Riesgos

| Riesgo | Mitigación |
|--------|------------|
| Endpoints admin/auth no documentados en OpenAPI local | Rutas alineadas al requerimiento funcional |
| E2E local bloqueado por instancia `next dev` activa | Documentado; usar CI o detener dev previo |
| Correo de copia depende de sesión anónima activa | Solo se muestra si hay `uuid_sesion` y `token_cliente` en store |

---

## 14. Flujo anónimo

- Encuestas públicas sin login: **sin cambios**
- Envío de copia usa sesión anónima existente, no autenticación Django
- Headers de sesión anónima no interfieren con auth admin

---

*Informe generado como parte de la implementación frontend AppDiversa UI.*
