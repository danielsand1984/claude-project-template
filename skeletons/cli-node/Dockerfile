# syntax=docker/dockerfile:1.7
# Optional container for the CLI. Useful for k8s CronJobs, GitHub Actions,
# or any environment where you don't want to install Node locally.

FROM node:20.18-alpine AS builder
WORKDIR /build
COPY package.json package-lock.json* ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
COPY scripts ./scripts
RUN npm run build

FROM node:20.18-alpine AS runtime
WORKDIR /app

RUN addgroup -g 10001 -S cli && adduser -u 10001 -S -G cli cli

COPY --from=builder /build/dist ./dist
COPY --from=builder /build/bin  ./bin
COPY package.json ./
RUN npm ci --omit=dev && npm cache clean --force

USER cli

# Replace {{PROJECT_NAME}} with the actual bin name.
ENTRYPOINT ["./bin/{{PROJECT_NAME}}.js"]
CMD ["--help"]
