# syntax=docker/dockerfile:1.7

# === deps =============================================================
FROM node:20.18-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
# Use `npm ci` when a lockfile is present (reproducible), else `npm install`
# (fresh scaffolds ship without a lockfile — the first run generates it).
RUN if [ -f package-lock.json ]; then \
      npm ci; \
    else \
      npm install --no-audit --no-fund; \
    fi

# === dev (hot-reload via volume mount) ================================
# Used by docker-compose default. App folder is volume-mounted from host
# so Next's fast refresh works. node_modules + .next stay in named volumes.
FROM node:20.18-alpine AS dev
WORKDIR /app
RUN apk add --no-cache wget
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=development
ENV PORT=3002
EXPOSE 3002
HEALTHCHECK --interval=30s --timeout=3s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3002/ || exit 1
CMD ["npx", "next", "dev", "-p", "3002"]

# === builder ==========================================================
FROM node:20.18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# === runtime (prod) ===================================================
FROM node:20.18-alpine AS runtime
WORKDIR /app

RUN addgroup -g 10001 -S nextjs && adduser -u 10001 -S -G nextjs nextjs

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3002

# Next.js standalone output (requires `output: "standalone"` in next.config)
COPY --from=builder --chown=nextjs:nextjs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nextjs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nextjs /app/public ./public

USER nextjs
EXPOSE 3002

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3002/ || exit 1

CMD ["node", "server.js"]
