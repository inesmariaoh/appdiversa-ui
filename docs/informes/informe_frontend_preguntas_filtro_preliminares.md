# Informe frontend — Preguntas filtro/preliminares

## Arquitectura

Flujo global reutilizable sin lógica quemada por encuesta:

1. `/encuestas/{uuid}` — solo preguntas con `es_pregunta_filtro`
2. Modal de no elegibilidad o error inline (edad)
3. Panel de verificación exitosa (`PanelConsentimiento` + textos API)
4. `/encuestas/{uuid}/responder` — preguntas principales sin filtros

## Módulos nuevos

| Archivo | Responsabilidad |
|---|---|
| `src/types/filtros.ts` | Tipos de validación y resultados |
| `src/utils/filtrosFormulario.ts` | `calcularEdad`, `evaluarPreguntaFiltro`, etc. |
| `src/hooks/useFlujoPreguntasFiltro.ts` | Estado del flujo preliminar |
| `src/components/preguntas/022_pregunta_fecha_nacimiento/` | Fecha con validación de edad |
| `src/components/formularios/013_modal_no_cumple_condiciones/` | Modal genérico |
| `src/storage/filtrosSesion.ts` | Persistencia de filtros completados |
| `src/utils/estructuraFormularioFiltros.ts` | Separar filtros del flujo principal |

## Textos desde API

- `verificacion_exitosa` — título y cuerpo del banner
- `no_cumple_condiciones` — modal de no elegibilidad
- `autorizacion_datos` / `consentimiento_datos` — texto legal
- `mensaje_error` / `mensaje_no_cumple` por pregunta

## Tests de iteración

```bash
npm run typecheck
npm run test -- --run src/utils/filtrosFormulario.test.ts src/hooks/useFlujoPreguntasFiltro.test.ts src/components/preguntas/022_pregunta_fecha_nacimiento/PreguntaFechaNacimiento.test.tsx src/components/formularios/013_modal_no_cumple_condiciones/ModalNoCumpleCondiciones.test.tsx
npm run test:e2e -- e2e/filtros-preliminares.spec.ts
```

**Resultado:** typecheck OK, 11/11 unitarios OK, 3/3 E2E OK.

## Offline

- Respuestas de filtros se guardan con `useGuardarRespuesta` (IndexedDB + cola)
- `filtros_completados_{uuid}` en `sessionStorage` para gate del formulario principal
