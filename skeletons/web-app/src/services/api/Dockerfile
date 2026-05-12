# syntax=docker/dockerfile:1.7

# --- builder ---
FROM node:20.18-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# --- runtime ---
FROM node:20.18-alpine AS runtime
WORKDIR /app

# Non-root user (uid:gid 10001:10001)
RUN addgroup -g 10001 -S app && adduser -u 10001 -S -G app app

# Production deps only
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy built artifacts
COPY --from=builder /app/dist ./dist

USER app
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/healthz || exit 1

# Handle SIGTERM cleanly via tini
ENV NODE_ENV=production
CMD ["node", "dist/index.js"]
