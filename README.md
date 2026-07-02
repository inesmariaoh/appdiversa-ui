# AppDiversa UI

Frontend dinámico para el **Motor de Formularios Parametrizable** de AppDiversa. Renderiza encuestas, reglas, catálogos y configuración visual desde el backend Django REST Framework, con soporte offline (IndexedDB), accesibilidad WCAG y panel administrativo.

## Stack

| Tecnología | Versión |
|------------|---------|
| Next.js (App Router) | 16 |
| React | 19 |
| TypeScript | Strict |
| Tailwind CSS | 4 |
| Zustand, Axios, React Hook Form, Zod, Dexie.js | — |
| Vitest, Testing Library, Playwright | — |

## Requisitos

- **Node.js** 20 o superior (recomendado 22, alineado con Docker)
- **npm** 10+
- Backend AppDiversa API en ejecución y accesible desde el navegador
- (Opcional) Docker y Docker Compose para despliegue en contenedor

## Instalación local

```bash
git clone <url-del-repositorio>
cd appdiversa-ui
npm ci
cp .env.example .env.local
```

Editar `.env.local` y definir al menos `NEXT_PUBLIC_API_BASE_URL` apuntando al backend (por ejemplo `http://127.0.0.1:8000`).

## Variables de entorno

| Variable | Obligatoria | Descripción |
|----------|-------------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | Sí (producción) | URL pública del backend. Usada por el navegador y como fallback en SSR. |
| `API_BASE_URL` | No | URL del backend solo para peticiones SSR (Docker/red interna). |
| `NEXT_PUBLIC_GA4_ID` | No | Google Analytics 4 (integración futura). |
| `NEXT_PUBLIC_CLARITY_ID` | No | Microsoft Clarity (integración futura). |
| `NEXT_PUBLIC_KEYCLOAK_GOOGLE_URL` | No | URL de login social Google. |
| `NEXT_PUBLIC_KEYCLOAK_FACEBOOK_URL` | No | URL de login social Facebook. |
| `NEXT_PUBLIC_URL_TERMINOS` | No | Enlace a términos en registro por correo. |

Plantilla completa en [`.env.example`](.env.example).

> **Nota:** el proyecto usa `NEXT_PUBLIC_API_BASE_URL` (no `NEXT_PUBLIC_API_URL`). Es la variable definida en las reglas del frontend y en `src/services/api.ts`.

## Comandos

```bash
# Desarrollo (http://localhost:3000)
npm run dev

# Verificación de tipos
npm run typecheck

# Lint
npm run lint

# Tests unitarios
npm test

# Tests E2E (requiere backend y Playwright)
npm run test:e2e

# Build de producción
npm run build

# Servidor de producción local (tras npm run build)
npm start
```

## Despliegue en Vercel

1. **Importar repositorio** en [vercel.com/new](https://vercel.com/new).
2. **Framework preset:** Next.js (detección automática).
3. **Build command:** `npm run build` (por defecto).
4. **Output directory:** dejar el valor por defecto de Next.js.
5. **Variables de entorno** (Settings → Environment Variables):
   - `NEXT_PUBLIC_API_BASE_URL` = URL HTTPS pública del backend (ej. `https://api.tudominio.gov.co`).
   - Opcionales: `NEXT_PUBLIC_GA4_ID`, `NEXT_PUBLIC_CLARITY_ID`, URLs Keycloak, etc.
6. **Redeploy** tras cambiar variables `NEXT_PUBLIC_*` (se incrustan en build time).
7. En el **backend Django**, configurar CORS y `ALLOWED_HOSTS` para el dominio de Vercel (ej. `*.vercel.app` o dominio custom).

### Docker (alternativa a Vercel)

Para despliegue self-hosted con imagen standalone:

```bash
docker compose up -d --build
```

Ver `docker-compose.yml` y `Dockerfile`. Requiere `NEXT_PUBLIC_API_BASE_URL` y, en contenedor, `API_BASE_URL` hacia el host del backend.

## Estructura del proyecto

```
src/
 ├── app/              # Rutas App Router
 ├── components/       # UI reutilizable
 ├── services/         # Cliente API (Axios)
 ├── store/            # Zustand
 ├── storage/          # IndexedDB / Dexie
 ├── hooks/
 ├── types/
 ├── utils/
 └── styles/
```

## Seguridad

- No incluir `.env.local` ni archivos con secretos en el repositorio.
- El frontend **no** debe usar `X-API-INTERNA` ni `API_INTERNA_TOKEN`.
- Tokens de sesión y credenciales se manejan vía cookies/headers del flujo público documentado en el backend.

## Pendientes antes de producción

- **CORS y ALLOWED_HOSTS:** el backend debe permitir el origen del frontend en Vercel (dominio `.vercel.app` o custom).
- **`NEXT_PUBLIC_API_BASE_URL` en Vercel:** debe apuntar a la API pública HTTPS; sin ella el build funciona pero las peticiones fallarán en runtime.
- **Registro por correo:** el formulario usa `authServicio.registrarCorreo` con `NEXT_PUBLIC_API_BASE_URL` (compatible con Vercel).
- **ESLint en CI:** `npm run lint` reporta errores preexistentes (SonarJS/unused vars). Corregir o configurar umbral en pipeline antes de bloquear merges.
- **Analytics:** `NEXT_PUBLIC_GA4_ID` y `NEXT_PUBLIC_CLARITY_ID` están preparadas en `.env.example` pero aún no integradas en el layout.
- **`output: 'standalone'`** en `next.config.ts` optimiza Docker; Vercel ignora el artefacto standalone y usa su propio runtime (compatible, sin cambio obligatorio).
- **Backend accesible en SSR:** el layout raíz llama a la API en servidor (`force-dynamic`). Vercel debe poder alcanzar `NEXT_PUBLIC_API_BASE_URL` (o `API_BASE_URL`) durante el renderizado.
- **Imágenes remotas:** `next.config.ts` configura `remotePatterns` según el hostname de la API; verificar que logos/media del backend carguen con el dominio de producción.

## Licencia

Proyecto privado — uso interno AppDiversa / DANE según acuerdos del equipo.
