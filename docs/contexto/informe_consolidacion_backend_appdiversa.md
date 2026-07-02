# Informe de consolidación backend AppDiversa API

**Fecha de revisión:** 28 de junio de 2026  
**Alcance:** Auditoría técnica integral previa al frontend dinámico  
**Repositorio:** `appdiversa-api`  
**Comandos ejecutados (Docker):**

```bash
docker compose exec backend python manage.py test
docker compose exec backend python manage.py check
docker compose exec backend python manage.py makemigrations --check --dry-run
```

**Resultados de comandos:**

| Comando | Resultado |
|---------|-----------|
| `manage.py test` | **207 tests encontrados — 1 fallo** (`test_snapshot_serializa_campos_archivo`) |
| `manage.py check` | **OK** (0 issues en ejecución post-test) |
| `makemigrations --check --dry-run` | **No changes detected** |

**Cobertura:** El paquete `coverage` **no está instalado** en el contenedor backend (`pip show coverage` → no encontrado). No se generó reporte de cobertura. Se recomienda agregar `coverage` a `requirements-dev.txt` o `requirements.txt` y ejecutar `coverage run manage.py test` + `coverage report`.

---

## 1. Resumen ejecutivo

El backend AppDiversa API presenta un **motor de formularios parametrizables maduro** con capas bien separadas (modelos, selectores, servicios, API v1), auditoría transversal, soft delete, internacionalización multimodal, catálogos empresariales, motor de reglas, repositorio documental, analítica plana, notificaciones y exportaciones transversales. La arquitectura cumple en gran medida las reglas del proyecto (español sin tildes en identificadores técnicos, mensajes funcionales al frontend, DRF + drf-spectacular).

**Fortalezas principales:** parametrización desde Django Admin, contratos REST documentados en Swagger (desarrollo), 207 pruebas automatizadas, migraciones al día, preparación explícita para offline parcial (`uuid_sesion`, `origen_respuesta`, `version_respuesta`, `requiere_sincronizacion`), capa analítica normalizada para BI, motores transversales desacoplados (`ProveedorNotificacion`, `StorageBackend`, `GeneradorExportacion`).

**Riesgos principales:** **todos los endpoints REST usan `AllowAny`** (global en `REST_FRAMEWORK` y en cada vista); subida y descarga de archivos sin autenticación; app `sincronizacion` sin modelos ni endpoints; **no existe `uuid_local`** en modelos ni API (requisito documentado en reglas para idempotencia offline); restricciones únicas condicionadas (`esta_eliminado=False`) **no se aplican en MySQL** (warning W036); un test de auditoría fallando; README desactualizado respecto a apps y rutas actuales; sin medición de cobertura.

### Calificación estimada de madurez (escala 1–5)

| Área | Calificación | Comentario breve |
|------|--------------|------------------|
| Infraestructura | **4** | Docker Compose, MySQL 8, settings multi-entorno, SQLite en tests |
| Modelo de datos | **4** | Normalizado, auditoría y soft delete transversal; gaps MySQL y campos legacy |
| APIs | **4** | `/api/v1/` consistente, Swagger en DEBUG, sin paginación global |
| Seguridad | **2** | MVP anónimo abierto; prod settings básicos; sin Keycloak |
| Pruebas | **3,5** | 207 tests, 1 fallo; sin coverage; `sincronizacion` sin tests |
| Preparación frontend | **4** | Endpoints core listos; contratos claros para UI dinámica |
| Preparación despliegue | **3,5** | prod.py con headers seguros; falta endurecer CORS/DEBUG/Swagger en prod |

---

## 2. Arquitectura actual

### Apps implementadas y responsabilidad

| App | Responsabilidad |
|-----|-----------------|
| `comun` | Rutas agregadas bajo `/api/v1/`, health check |
| `formularios` | Motor parametrizable: formularios, versiones, secciones, preguntas, opciones, matrices, reglas, textos, catálogo geográfico legacy |
| `respuestas` | Persistencia y validación de respuestas por sesión/pregunta |
| `sesiones_anonimas` | Ciclo de vida de sesión anónima, finalización, resumen, evaluación de reglas |
| `sincronizacion` | **Placeholder** — solo `apps.py`, `admin.py`, `urls.py` vacío |
| `auditoria` | `AuditoriaModeloAbstracto`, `RegistroAuditoria`, middleware de contexto, snapshots |
| `contenidos` | `ConfiguracionInterfaz` (branding, textos legales, accesibilidad UI) |
| `analitica` | Normalización plana de respuestas para BI (sin modelos propios) |
| `catalogos` | Catálogos parametrizables e items jerárquicos |
| `archivos` | Repositorio documental (`ArchivoRepositorio`, `LocalStorageBackend`) |
| `internacionalizacion` | Idiomas, traducciones multimodales (texto, audio, etc.) |
| `notificaciones` | Plantillas y registro de notificaciones (`ProveedorDummy`) |
| `exportaciones` | Registro y generación CSV/XLSX/JSON/SQL; PDF/ODS preparados |

### Separación por capas

- **Views:** Delgadas en general; validan entrada, invocan servicios, retornan JSON con `{"detalle": ...}` en errores.
- **Serializers:** Validación y transformación; lógica de negocio en servicios.
- **Servicios:** Lógica de negocio centralizada (`servicios.py` por app, motor de reglas en `formularios/reglas/`).
- **Selectores:** Consultas ORM reutilizables.
- **Modelos:** Estructura y relaciones; sin lógica compleja.

**Dependencias entre apps (acoplamiento relevante):**

- `respuestas` → `formularios`, `sesiones_anonimas`
- `sesiones_anonimas` → `formularios`
- `analitica`, `exportaciones` → `respuestas`, `formularios`
- `contenidos`, `formularios` → `internacionalizacion`, `archivos`
- `exportaciones` → `archivos` (guardar archivos generados)

No se detectó duplicación crítica; el motor de reglas y la analítica comparten normalización de valores vía módulos dedicados.

**Observación SonarQube:** En `aplicaciones/analitica/servicios.py` hay un **import duplicado** de `typing.Any` (líneas 7 y 9). En `exportaciones/servicios.py` existe `except Exception` con captura controlada para marcar exportación fallida (justificado con `# noqa: BLE001`).

---

## 3. Modelo de datos

### Tabla resumen

| App | Modelo | Propósito | Estado | Observaciones | Riesgos |
|-----|--------|-----------|--------|---------------|---------|
| formularios | Formulario | Definición maestra de formulario | Operativo | UUID, código único, estado, tipo | — |
| formularios | FormularioVersion | Versionado publicable | Operativo | `es_publicada`, número de versión | — |
| formularios | TextoFormulario | Textos legales/UI del formulario | Operativo | Traducible vía i18n | — |
| formularios | SeccionFormulario | Secciones ordenadas | Operativo | Unique por versión + código | MySQL W036 en constraints condicionales |
| formularios | Pregunta | Preguntas parametrizables | Operativo | Tipos, catálogo, UI flags | Campos extensos; índices en tipo/orden |
| formularios | OpcionRespuesta | Opciones select/radio/checkbox | Operativo | — | — |
| formularios | PreguntaMatrizFila/Columna | Matrices | Operativo | — | — |
| formularios | ReglaPregunta | Motor de reglas | Operativo | Operadores y acciones | — |
| formularios | CatalogoGeografico | Catálogo geo legacy | Legacy compatible | Duplicación conceptual con `catalogos` | Consolidar en fase posterior |
| sesiones_anonimas | SesionAnonima | Sesión anónima | Operativo | `uuid_sesion`, `es_offline`, `token_cliente` | Sin `uuid_local` a nivel respuesta |
| respuestas | Respuesta | Valor por pregunta/sesión | Operativo | Multi-campo valor + geo + archivo legacy | `archivo_nombre`/`archivo_ruta` vs repositorio |
| catalogos | Catalogo | Catálogo parametrizable | Operativo | Tipos de dominio | — |
| catalogos | ItemCatalogo | Items jerárquicos | Operativo | `item_padre`, metadatos JSON | MySQL W036 |
| contenidos | ConfiguracionInterfaz | Branding y textos UI | Operativo | ImageField + FK repositorio (dual) | Campos duplicados logo/favicon |
| archivos | ArchivoRepositorio | Metadatos de archivos | Operativo | Checksum, MIME, soft delete propio | Subida pública sin auth |
| internacionalizacion | Idioma | Idiomas soportados | Operativo | — | — |
| internacionalizacion | TraduccionContenido | Traducciones multimodales | Operativo | Audio/archivo en repositorio | MySQL W036 |
| auditoria | RegistroAuditoria | Log central | Operativo | Campos Keycloak preparados | Sin API de consulta |
| notificaciones | PlantillaNotificacion | Plantillas | Operativo | Variables `{{nombre}}` | — |
| notificaciones | Notificacion | Registro de envíos | Operativo | Sin envío real SMTP | — |
| exportaciones | Exportacion | Jobs de exportación | Operativo | FK a archivo generado | — |

### Normalización y relaciones

- **Normalización:** Buena separación formulario → versión → sección → pregunta → respuesta.
- **FK:** Uso consistente de `on_delete` apropiado (CASCADE en respuestas, SET_NULL en plantillas/archivos).
- **Índices:** Presentes en campos de filtro frecuente (estado, uuid, código, fechas).
- **Soft delete:** `esta_eliminado` + `SoftDeleteManager` en `AuditoriaModeloAbstracto`.
- **Auditoría:** Campos `creado_por`, `modificado_por`, `eliminado_por`, `fecha_*`; `RegistroAuditoria` con `identificador_keycloak` y `uuid_sesion_anonima`.

### MySQL

- **Warning W036:** Restricciones únicas con `condition=Q(esta_eliminado=False)` en `Respuesta`, `ItemCatalogo`, `TraduccionContenido` y varios modelos de formularios **no se crean en MySQL**. El soft delete no tiene garantía de unicidad a nivel BD; la aplicación debe validar duplicados activos.
- **Charset:** `utf8mb4` configurado en `DATABASES`.
- **Tests:** Usan SQLite (`sys.argv` test → `.test_db.sqlite3`), por lo que constraints condicionales pueden comportarse distinto que en producción MySQL.

### Campos huérfanos / duplicados

- `Respuesta.archivo_nombre`, `Respuesta.archivo_ruta` coexisten con repositorio documental.
- `ConfiguracionInterfaz`: `logo_*` ImageField + `*_repositorio` FK (migración gradual).
- `CatalogoGeografico` vs motor general `catalogos`.

### Preparación Power BI / offline / Keycloak

| Aspecto | Estado |
|---------|--------|
| Power BI | Capa `analitica` + `exportaciones` con formato plano y filtros |
| IndexedDB/offline | Campos en sesión/respuesta; **falta API sincronización y `uuid_local`** |
| Keycloak | `identificador_keycloak` en auditoría y archivos; sin middleware JWT |

---

## 4. APIs disponibles

**Prefijo global:** `/api/v1/`  
**Autenticación actual:** `AllowAny` (default global + todas las vistas revisadas)  
**Autenticación futura esperada:** Keycloak (JWT / roles); endpoints admin y analítica restringidos

| Método | Endpoint | App | Auth actual | Auth futura | Consumidor frontend | Observaciones |
|--------|----------|-----|-------------|-------------|---------------------|---------------|
| GET | `/api/v1/salud/` | comun | Pública | Pública | Health check | `{"estado":"ok"}` |
| GET | `/api/v1/interfaz/configuracion/` | contenidos | Pública | Pública | App shell | Query: `idioma`, `incluir_accesibilidad` |
| GET | `/api/v1/formularios/disponibles/` | formularios | Pública | Pública | Listado encuestas | Query: `idioma` |
| GET | `/api/v1/formularios/{uuid}/estructura/` | formularios | Pública | Pública | Render dinámico | Incluye reglas, opciones, textos |
| GET | `/api/v1/catalogos/` | catalogos | Pública | Pública | Selects/autocomplete | — |
| GET | `/api/v1/catalogos/{codigo}/items/` | catalogos | Pública | Pública | Items catálogo | Filtros query |
| GET | `/api/v1/catalogos/{codigo}/items/{item}/hijos/` | catalogos | Pública | Pública | Jerarquías | — |
| GET | `/api/v1/internacionalizacion/traducciones/` | internacionalizacion | Pública | Pública | i18n global | — |
| POST | `/api/v1/sesiones/` | sesiones_anonimas | Pública | Pública (+ token sesión) | Inicio flujo | Crea `uuid_sesion` |
| GET | `/api/v1/sesiones/{uuid}/respuestas/` | sesiones_anonimas | Pública | Token sesión | Resumen parcial | — |
| POST | `/api/v1/sesiones/{uuid}/validar-finalizacion/` | sesiones_anonimas | Pública | Token sesión | Pre-submit | — |
| POST | `/api/v1/sesiones/{uuid}/finalizar/` | sesiones_anonimas | Pública | Token sesión | Cierre formulario | — |
| GET | `/api/v1/sesiones/{uuid}/resumen/` | sesiones_anonimas | Pública | Token sesión | Pantalla resumen | — |
| POST | `/api/v1/sesiones/{uuid}/evaluar-reglas/` | sesiones_anonimas | Pública | Token sesión | Reglas globales | — |
| POST | `/api/v1/sesiones/{uuid}/preguntas/{codigo}/evaluar-reglas/` | sesiones_anonimas | Pública | Token sesión | Reglas por pregunta | — |
| POST | `/api/v1/respuestas/` | respuestas | Pública | Token sesión | Guardar respuesta | 201 creación / 200 update |
| GET | `/api/v1/analitica/respuestas/` | analitica | Pública | **Admin/BI** | Tableros | Filtros query; debe protegerse |
| POST | `/api/v1/archivos/` | archivos | Pública | Autenticada | Upload respuestas | Validación MIME/ext |
| GET | `/api/v1/archivos/{uuid}/` | archivos | Pública | Autenticada | Metadatos | DELETE lógico |
| GET | `/api/v1/archivos/{uuid}/descargar/` | archivos | Pública | Controlada | Descarga | Riesgo si `es_publico` mal usado |
| GET | `/api/v1/notificaciones/` | notificaciones | Pública | Admin | — | Listado transversal |
| GET | `/api/v1/notificaciones/{uuid}/` | notificaciones | Pública | Admin | — | — |
| POST | `/api/v1/notificaciones/probar/` | notificaciones | Pública | Admin | — | Solo registro |
| POST | `/api/v1/exportaciones/respuestas/` | exportaciones | Pública | Admin | Export BI | — |
| POST | `/api/v1/exportaciones/catalogos/` | exportaciones | Pública | Admin | — | — |
| POST | `/api/v1/exportaciones/analitica/` | exportaciones | Pública | Admin | — | — |
| GET | `/api/v1/exportaciones/{uuid}/` | exportaciones | Pública | Admin | Estado job | — |
| — | `/api/v1/sincronizacion/` | sincronizacion | — | Autenticada | Offline sync | **Sin rutas** |
| — | `/api/v1/auditoria/` | auditoria | — | Admin | — | **Sin rutas** |

**Swagger / OpenAPI:** Disponible solo si `DEBUG=True` (`/api/schema/`, `/api/docs/`, `/api/redoc/`). Correcto para desarrollo; debe permanecer deshabilitado en producción.

**Paginación:** No hay `DEFAULT_PAGINATION_CLASS` en `REST_FRAMEWORK`. Listados grandes (analítica, notificaciones) retornan arrays completos → riesgo de rendimiento.

**Consistencia de errores:** Patrón `{"detalle": "mensaje funcional"}` sin exponer trazas del sistema.

---

## 5. Auditoría y soft delete

### Estado actual

- **Mixin transversal:** `AuditoriaModeloAbstracto` con timestamps, usuarios, `esta_eliminado`, managers filtrados.
- **Registro central:** `RegistroAuditoria` con acciones (`CREAR`, `EDITAR`, `ELIMINAR`, `EXPORTAR`, etc.), snapshots JSON, contexto IP/user-agent/sesión.
- **Middleware:** `AuditoriaContextoMiddleware` propaga contexto desde request.
- **Servicios críticos:** Notificaciones, exportaciones, respuestas registran auditoría en operaciones clave.

### Fortalezas

- Preparación Keycloak (`identificador_keycloak`).
- Snapshots sin campos sensibles (`SUBCADENAS_CAMPOS_SENSIBLES`).
- Admin con acciones de eliminación lógica y restauración.

### Riesgos

- Test fallido: `test_snapshot_serializa_campos_archivo` — el snapshot de `logo_institucional` (ImageField) no termina en `logo_institucional.png` en entorno de test (posible variación de ruta almacenada por Django FileField).
- Sin API para consultar auditoría desde frontend/admin externo.
- Unicidad condicional no enforced en MySQL puede permitir duplicados si falla validación aplicación.

---

## 6. Internacionalización y accesibilidad multimodal

### Estado actual

- **Modelos:** `Idioma`, `TraduccionContenido` (texto, audio vía repositorio, metadatos accesibilidad).
- **Endpoints:** `GET /api/v1/internacionalizacion/traducciones/`, integración en formularios e interfaz vía query `idioma` y `incluir_accesibilidad`.
- **Servicios:** `construir_mapa_traducciones`, `normalizar_codigo_idioma`, `resolver_uuid_entidad`.

### Recomendaciones

- Documentar en contrato frontend el mapa de traducciones por UUID de entidad.
- Definir idioma por defecto (`es-CO`) en contrato API explícito.
- Pruebas: 35 tests en internacionalizacion (buena cobertura relativa).

---

## 7. Catálogos y dominios

### Estado actual

- Motor general `catalogos` con jerarquía `item_padre`.
- API de listado e hijos operativa.
- Preguntas pueden asociar `catalogo_asociado` en formularios.
- `CatalogoGeografico` legacy en formularios.

### Recomendaciones

- Plan de convergencia geográfico → catálogos general.
- Cache en frontend para catálogos estáticos (países, sexo, etc.).
- Validación en respuestas ya verifica pertenencia al catálogo (`ValorNoPerteneceCatalogoError`).

---

## 8. Motor de reglas

### Estado actual

- Modelo `ReglaPregunta` con operadores y acciones (visibilidad, finalizar, no aplica).
- Evaluador en `formularios/reglas/` con auditoría de evaluación.
- Endpoints de evaluación en sesión y por pregunta.
- Respuesta al guardar incluye resultado de reglas (`GuardarRespuestaView`).
- **22 tests** en `test_motor_reglas.py` + tests API de reglas.

### Recomendaciones

- Frontend debe re-evaluar reglas tras cada respuesta relevante.
- Documentar orden de evaluación y prioridad de acciones en guía frontend.

---

## 9. Repositorio documental

### Estado actual

- `ArchivoRepositorio` + `StorageBackend` / `LocalStorageBackend`.
- Validación MIME por tipo, extensiones prohibidas, checksum.
- Integración: configuración interfaz, internacionalización, exportaciones, respuestas (preparación).

### Recomendaciones futuras S3/Commons

- Implementar `S3StorageBackend` sin cambiar servicios (`guardar_archivo`, `leer_contenido_archivo`).
- Endurecer permisos de descarga según `es_publico` y rol.
- Migrar `Respuesta.archivo_*` legacy al repositorio.
- Límite de tamaño y antivirus en fase de hardening.

---

## 10. Notificaciones y exportaciones

### Estado actual — **implementadas**

**Notificaciones:**

- Plantillas con variables `{{variable}}`, registro sin SMTP real.
- `ProveedorNotificacion` / `ProveedorDummy`.
- API listar, detalle, probar.
- **16 tests.**

**Exportaciones:**

- CSV, XLSX (openpyxl), JSON, SQL operativos; PDF/ODS interfaz preparada.
- `exportar_respuestas`, `exportar_catalogos`, `exportar_analitica`.
- Archivos persistidos en repositorio documental.
- **17 tests.**

### Recomendaciones

- Proteger endpoints antes de producción.
- Instalar `openpyxl` en imagen Docker (ya en `requirements.txt`; verificar rebuild).
- SMTP vía nuevo proveedor sin tocar dominio.

---

## 11. Analítica / Power BI

### Estado actual

- `GET /api/v1/analitica/respuestas/` — lista plana con ~25 campos útiles (formulario, sección, pregunta, valores tipados, origen, offline, fechas).
- Filtros: `formulario_codigo`, `fecha_inicio`, `fecha_fin`, `estado_sesion`.
- Exportaciones reutilizan `listar_respuestas_analiticas`.

### Recomendaciones

- **Power BI:** Conectar vía exportación CSV/JSON o API con auth; para grandes volúmenes preferir exportaciones batch o vistas SQL materializadas.
- **Rendimiento:** Sin paginación; agregar límites o cursor antes de producción con muchos registros.
- **Vistas SQL:** Recomendables para reporting pesado (TiDB/MySQL) con columnas ya normalizadas en servicio.
- **Campos útiles BI:** `formulario_codigo`, `tipo_pregunta`, `respuesta_valor`, `catalogo_codigo`, `estado_sesion`, `es_offline`, `origen_respuesta`, fechas ISO.

---

## 12. Seguridad

### Riesgos actuales

| Riesgo | Severidad | Detalle |
|--------|-----------|---------|
| Endpoints públicos totales | **Alta** | `DEFAULT_PERMISSION_CLASSES = AllowAny` |
| Upload/descarga archivos | **Alta** | Sin autenticación ni rate limit |
| Analítica/exportaciones expuestas | **Alta** | Datos agregados sensibles |
| DEBUG en desarrollo | Media | Swagger y media estáticos si DEBUG=True en prod |
| CORS | Media | Configurable vía env; vacío por defecto en base |
| CSRF | Baja en API JSON | Session middleware activo |
| Sin rate limiting | Media | Abuso de sesiones/respuestas |
| `token_cliente` en sesión | Media | No validado en endpoints actuales |

### Acciones antes de despliegue (Render/Vercel/TiDB)

1. `DEBUG=False`, `SECRET_KEY` fuerte, `ALLOWED_HOSTS` explícitos.
2. CORS solo orígenes del frontend Vercel.
3. Keycloak o API keys para rutas admin/BI/archivos.
4. Deshabilitar Swagger en prod (ya condicionado a DEBUG).
5. HTTPS forzado (`SECURE_*` parcialmente en prod.py).
6. Revisar exposición de `/media/` en DEBUG.

### Preparación Keycloak

- Campos listos en auditoría y archivos.
- Falta: middleware JWT, permisos DRF, vinculación `AUTH_USER_MODEL` operativa en API.

---

## 13. Pruebas y calidad

### Cantidad de tests (ejecución real)

- **Total ejecutado:** 207
- **Fallos:** 1
- **Errores:** 0

### Tests por app (métodos `def test_` en archivos)

| App | Tests aprox. | Archivos |
|-----|--------------|----------|
| formularios | ~62 | 6 archivos |
| respuestas | ~47 | 6 archivos |
| internacionalizacion | ~35 | 5 archivos |
| exportaciones | 17 | 1 |
| catalogos | ~22 | 3 |
| notificaciones | 15 | 1 |
| archivos | 15 | 1 |
| analitica | 14 | 2 |
| contenidos | 11 | 2 |
| auditoria | 8 | 1 (1 fallo) |
| sesiones_anonimas | 7 | 2 |
| comun | 1 | 1 |
| **sincronizacion** | **0** | — |

### Zonas sin cobertura

- App `sincronizacion` completa.
- API de notificaciones/exportaciones parcial (happy path).
- Permisos/autenticación (no implementados).
- Escenarios de carga y concurrencia offline.
- Integración MySQL real (tests usan SQLite).

### Cobertura

**No disponible** — instalar `coverage` y objetivo >90% en: `respuestas/servicios.py`, `formularios/reglas/`, `sesiones_anonimas/servicios.py`, sincronización futura.

### Test fallido

```
aplicaciones.auditoria.tests.test_auditoria.SnapshotModeloTests.test_snapshot_serializa_campos_archivo
AssertionError: snapshot["logo_institucional"].endswith("logo_institucional.png") → False
```

Causa probable: valor serializado del ImageField no coincide con expectativa del nombre de archivo en entorno de test.

---

## 14. Preparación para frontend

### Endpoints a consumir primero (orden sugerido)

1. **Configuración interfaz** — `GET /api/v1/interfaz/configuracion/?idioma=es-CO&incluir_accesibilidad=true`
2. **Traducciones** — `GET /api/v1/internacionalizacion/traducciones/`
3. **Formularios disponibles** — `GET /api/v1/formularios/disponibles/?idioma=es-CO`
4. **Estructura formulario** — `GET /api/v1/formularios/{uuid}/estructura/?idioma=es-CO`
5. **Catálogos** — `GET /api/v1/catalogos/` y items según preguntas
6. **Crear sesión** — `POST /api/v1/sesiones/`
7. **Guardar respuestas** — `POST /api/v1/respuestas/` (incluye reglas en respuesta)
8. **Evaluar reglas** — `POST /api/v1/sesiones/{uuid}/evaluar-reglas/` y por pregunta
9. **Validar finalización** — `POST /api/v1/sesiones/{uuid}/validar-finalizacion/`
10. **Finalizar** — `POST /api/v1/sesiones/{uuid}/finalizar/`
11. **Resumen** — `GET /api/v1/sesiones/{uuid}/resumen/`
12. **Archivos** — `POST /api/v1/archivos/` para preguntas con archivo/firma

### Contratos clave para UI dinámica

- Estructura JSON anidada: secciones → preguntas → opciones/matriz/reglas.
- Respuesta guardar: `version_respuesta`, `requiere_sincronizacion`, `reglas`.
- Errores: siempre campo `detalle` string.

---

## 15. Pendientes antes de frontend

### Alta

1. Corregir test fallido de auditoría o alinear expectativa con serialización ImageField.
2. Documentar contratos API para frontend (OpenAPI export + guía de flujo sesión).
3. Definir estrategia de `token_cliente` / validación de sesión en endpoints de sesión y respuestas.
4. Actualizar README (rutas, apps nuevas: archivos, i18n, notificaciones, exportaciones).
5. Rebuild Docker image para `openpyxl` en exportaciones Excel.

### Media

6. Implementar paginación o límites en analítica y listados grandes.
7. Planificar `uuid_local` e API de sincronización idempotente.
8. Instalar y baseline de `coverage` (>90% lógica crítica).
9. Resolver warning MySQL W036 (índices únicos parciales o validación explícita).
10. Consolidar campos archivo legacy en respuestas.

### Baja

11. Eliminar import duplicado en `analitica/servicios.py`.
12. Unificar README rutas (`/api/v1/sesiones/` vs documentación antigua).
13. Documentar variables de entorno adicionales si se agregan en despliegue.

---

## 16. Pendientes después del MVP

- Keycloak (JWT, roles admin, analista, encuestado).
- Power BI avanzado (vistas SQL, pipeline programado).
- GA4 / Clarity (frontend; backend eventos opcionales).
- Exportaciones PDF/ODS, SMTP/notificaciones reales.
- S3 / Apache Commons Storage backend.
- Rate limiting y WAF.
- Consolidación `CatalogoGeografico` → `catalogos`.
- API de consulta de auditoría para admin.

---

## 17. Recomendaciones finales

### Plan de próximos pasos

1. **Estabilizar calidad:** Corregir 1 test fallido; agregar `coverage` y medir baseline.
2. **Contrato frontend:** Exportar OpenAPI y escribir guía de flujo anónimo (sesión → respuesta → reglas → finalizar).
3. **Seguridad mínima pre-prod:** Aunque MVP sea anónimo, proteger analítica, exportaciones, archivos y admin; validar `token_cliente` en mutaciones.
4. **Iniciar frontend dinámico** contra endpoints de interfaz, formularios, catálogos y sesiones.
5. **Diseñar sincronización offline** (modelo `uuid_local`, batch sync, cola IndexedDB) antes de modo offline en producción.
6. **Despliegue:** Render backend + Vercel frontend con CORS y `DEBUG=False`; MySQL/TiDB gestionado.

El backend está **listo para iniciar el frontend dinámico** en el flujo core de formularios, con deuda conocida en seguridad, sincronización offline y un test de regresión en auditoría.

---

*Informe generado desde código fuente y comandos de diagnóstico ejecutados en el entorno Docker del repositorio. No se modificó código funcional ni se aplicaron migraciones durante esta auditoría.*
