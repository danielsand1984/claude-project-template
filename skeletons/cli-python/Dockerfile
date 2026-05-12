# syntax=docker/dockerfile:1.7
# Optional container for the CLI. Useful for k8s CronJobs, GitHub Actions,
# or any environment where you don't want to install Python locally.

FROM python:3.11-slim AS builder
WORKDIR /build
COPY pyproject.toml ./
COPY src ./src
RUN pip install --user --no-cache-dir .

FROM python:3.11-slim AS runtime
WORKDIR /app

RUN groupadd -g 10001 -r cli && useradd -u 10001 -r -g cli -d /home/cli -m cli

COPY --from=builder /root/.local /home/cli/.local
ENV PATH=/home/cli/.local/bin:$PATH \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

USER cli

# Replace {{PROJECT_NAME}} with the actual CLI entry point name.
ENTRYPOINT ["{{PROJECT_NAME}}"]
CMD ["--help"]
