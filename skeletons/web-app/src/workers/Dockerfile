# syntax=docker/dockerfile:1.7
# Generic Python worker Dockerfile. Copy + customize per worker
# (one Dockerfile per worker if they have different deps).

# --- builder ---
FROM python:3.11-slim AS builder
WORKDIR /build

# Build deps if any C extensions need compiling (psycopg2, etc.)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN pip install --user --no-cache-dir -r requirements.txt

# --- runtime ---
FROM python:3.11-slim AS runtime
WORKDIR /app

# psycopg2 runtime + nothing else
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd -g 10001 -r worker \
    && useradd -u 10001 -r -g worker worker

# Copy installed packages from builder
COPY --from=builder /root/.local /home/worker/.local
ENV PATH=/home/worker/.local/bin:$PATH \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

COPY --chown=worker:worker . .

USER worker

# Workers don't expose HTTP — k8s liveness checks the heartbeat file
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD test -f /tmp/worker_heartbeat && find /tmp/worker_heartbeat -mmin -2 || exit 1

CMD ["python", "-m", "worker_name"]
