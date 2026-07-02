# ============================================================
# Etapa 1: dependencias
# ============================================================
FROM node:22-alpine AS deps

RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --no-fund --no-audit


# ============================================================
# Etapa 2: build
# ============================================================
FROM node:22-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variables de entorno disponibles en build time.
# NEXT_PUBLIC_* se incrusta en el bundle; pasar como ARG.
ARG NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
ARG API_BASE_URL=http://host.docker.internal:8000
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV API_BASE_URL=$API_BASE_URL

RUN npm run build


# ============================================================
# Etapa 3: imagen de produccion (standalone)
# ============================================================
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
ENV API_BASE_URL=http://host.docker.internal:8000

# Usuario sin privilegios para mayor seguridad.
RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nextjs

# Archivos publicos y build standalone.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# El servidor standalone de Next.js no necesita npm start.
CMD ["node", "server.js"]
