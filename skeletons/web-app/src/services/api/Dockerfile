# syntax=docker/dockerfile:1.7

# === deps (cached npm install layer) ==================================
FROM node:20.18-alpine AS deps
WORKDIR /app
RUN apk add --no-cache wget
COPY package.json package-lock.json* ./
# Use `npm ci` when a lockfile is present (reproducible), else `npm install`
# (fresh scaffolds ship without a lockfile — the first run generates it).
RUN if [ -f package-lock.json ]; then \
      npm ci; \
    else \
      npm install --no-audit --no-fund; \
    fi

# === dev (hot-reload via volume mount) ================================
# Used by docker-compose default. Source is mounted from host so file
# changes trigger tsx watch reload. node_modules lives in a named volume
# (faster than bind mount on Windows/Mac, avoids OS-specific binary issues).
FROM node:20.18-alpine AS dev
WORKDIR /app
RUN apk add --no-cache wget
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json* ./
COPY tsconfig.json ./
# src/ is mounted via compose at runtime; this COPY is a fallback for
# `docker run` without volumes so the image is at least functional.
COPY src ./src
EXPOSE 3000
ENV NODE_ENV=development
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/healthz || exit 1
CMD ["npx", "tsx", "watch", "src/index.ts"]

# === builder (compile TypeScript for prod) ============================
FROM node:20.18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json* tsconfig.json ./
COPY src ./src
RUN npx tsc -p tsconfig.json

# === runtime (prod) ===================================================
FROM node:20.18-alpine AS runtime
WORKDIR /app

# Non-root user (uid:gid 10001:10001)
RUN addgroup -g 10001 -S app && adduser -u 10001 -S -G app app

# Production deps only
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then \
      npm ci --omit=dev; \
    else \
      npm install --omit=dev --no-audit --no-fund; \
    fi \
    && npm cache clean --force

# Copy built artifacts
COPY --from=builder /app/dist ./dist

USER app
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/healthz || exit 1

ENV NODE_ENV=production
CMD ["node", "dist/index.js"]
