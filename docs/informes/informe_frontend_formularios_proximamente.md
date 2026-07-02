# Informe — Formularios próximamente (frontend)

**Proyecto:** AppDiversa UI  
**Fecha:** 30 de junio de 2026  
**Alcance:** Visualización de encuestas futuras como “Próximamente” en el listado público, sin permitir inicio del flujo anónimo.

---

## 1. Resumen ejecutivo

Se ajustó el listado público de encuestas para consumir los campos de disponibilidad del backend y mostrar formularios futuros como tarjetas visibles con estado **Próximamente**, alineadas al diseño Figma.

| Componente | Estado |
|------------|--------|
| Tipos `FormularioDisponible` ampliados | Operativo |
| Normalización con fallback local | Operativo |
| Tarjeta con estilo atenuado/gris | Operativo |
| Bloqueo de navegación directa | Operativo |
| Tests unitarios | Operativo |
| E2E listado + bloqueo | Operativo |

---

## 2. Campos consumidos del backend

Endpoint: `GET /api/v1/formularios/disponibles/`

| Campo | Uso en frontend |
|-------|-----------------|
| `estado_disponibilidad` | Insignia y lógica visual (`disponible` \| `proximamente`) |
| `puede_iniciar` | Habilita/deshabilita CTA y navegación |
| `etiqueta_estado` | Texto de insignia y botón deshabilitado |
| `fecha_inicio` | Metadato “Lanzamiento: …” |
| `fecha_fin` | Fallback de vigencia cuando no vienen campos nuevos |

### Fallback local

Si el backend no envía `estado_disponibilidad` / `puede_iniciar`, se calculan desde `fecha_inicio` y `fecha_fin` con `formularioEstaVigente()`.

---

## 3. Archivos principales

| Archivo | Cambio |
|---------|--------|
| `src/types/formulario.ts` | Nuevos campos de disponibilidad |
| `src/utils/formatearFechaLanzamiento.ts` | Formato `Feb 2026` / `31 Jul 2026` en `es-CO` |
| `src/utils/formularioDisponibilidad.ts` | Normalización y fallback |
| `src/services/formulariosServicio.ts` | Normaliza listado; `obtenerFormularioDisponiblePorUuid` |
| `src/components/formularios/002_tarjeta_formulario/TarjetaFormulario.tsx` | UI Próximamente según Figma |
| `src/components/formularios/012_aviso_encuesta_proximamente/` | Mensaje al acceder por URL directa |
| `src/app/encuestas/[uuid]/page.tsx` | Bloqueo antes de verificación |
| `src/app/encuestas/[uuid]/responder/page.tsx` | Bloqueo antes de responder |
| `e2e/mockApi.mjs` | Encuesta disponible + encuesta futura |
| `e2e/proximamente.spec.ts` | Pruebas E2E del flujo |

---

## 4. Comportamiento de la tarjeta

### Disponible (`puede_iniciar=true`)

- Insignia: `etiqueta_estado` (p. ej. “Disponible offline”)
- Metadato: duración estimada
- CTA: enlace “Iniciar encuesta”
- Portada a color

### Próximamente (`puede_iniciar=false`, `estado_disponibilidad=proximamente`)

- Insignia con candado (`aria-hidden`) + `etiqueta_estado`
- Metadato: “Lanzamiento: Feb 2026”
- CTA: botón deshabilitado con `aria-disabled="true"`
- Portada en escala de grises
- `article` con `aria-label`: “Encuesta próximamente disponible: …”

---

## 5. Validación de navegación

Rutas `/encuestas/[uuid]` y `/encuestas/[uuid]/responder`:

1. Consultan `obtenerFormularioDisponiblePorUuid`
2. Si `puede_iniciar=false`, muestran:

   > Esta encuesta estará disponible próximamente.

3. No cargan estructura ni crean sesión

---

## 6. Accesibilidad

- Botón deshabilitado con `aria-disabled="true"`
- Estado no depende solo del color (texto + candado + insignia)
- Candado decorativo con `aria-hidden="true"`
- Artículo con descripción explícita para encuestas futuras

---

## 7. Pruebas

### Unitarias

| Archivo | Casos |
|---------|-------|
| `formatearFechaLanzamiento.test.ts` | Formato mes/año y día específico |
| `formularioDisponibilidad.test.ts` | Backend, fallback futuro, vigente |
| `TarjetaFormulario.test.tsx` | Disponible, futura, a11y, navegación |
| `formulariosServicio.test.ts` | Normalización y búsqueda por UUID |

### E2E (`proximamente.spec.ts`)

- Ambas encuestas visibles en inicio
- Futura muestra Próximamente y bloquea acceso directo
- Disponible inicia flujo tras aceptar términos

---

## 8. Conclusión

Las encuestas futuras aparecen en el listado con estado **Próximamente**, estilo visual atenuado y sin posibilidad de iniciar el flujo. Las encuestas disponibles conservan el comportamiento anterior. Todo el contenido proviene del backend; el fallback local solo aplica cuando faltan campos de disponibilidad.
