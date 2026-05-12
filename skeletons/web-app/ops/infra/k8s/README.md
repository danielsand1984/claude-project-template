# Kubernetes manifests

Reference deployment patterns for this project. **Not** opinionated about which k8s flavour you ship to — these manifests work as-is on plain k8s, OpenShift, or as the base for Helm/Kustomize.

## Files

| File | What |
|------|------|
| `api-deployment.yml` | API Deployment + Service. Liveness `/healthz`, readiness `/readyz`. Copy + rename for additional HTTP services. |
| `web-deployment.yml` | Next.js Deployment + Service. |
| `worker-deployment.yml` | Python worker Deployment (no Service — workers consume queues). Copy per worker type. |
| `secret.example.yml` | Example Secret shape. **Do not commit real secrets.** Use Sealed Secrets, External Secrets Operator, or a Helm values file kept outside git. |
| `configmap.example.yml` | Example ConfigMap for non-secret config. |

## What's not here

- **Ingress / Gateway** — depends on your cluster (nginx-ingress, Traefik, Istio, etc.). Add when needed.
- **HPA / KEDA** — autoscaling rules depend on workload shape. Add when you have real load.
- **Postgres / Redis** — these manifests assume **managed** services (Azure Database for PostgreSQL, ElastiCache, etc.) injected via Secret. For in-cluster Postgres/Redis, use a Helm chart (bitnami) rather than rolling your own StatefulSet here.
- **Namespace** — pick during apply (`kubectl apply -n <ns> -f .`).

## Pattern conventions

- `livenessProbe` on `/healthz` — cheap check, restarts the pod if it fails
- `readinessProbe` on `/readyz` — checks downstream deps, removes from Service LB if it fails (no restart)
- `resources.requests` + `resources.limits` are **mandatory** — k8s schedules on requests, kills on limits
- `securityContext.runAsNonRoot: true` — paired with the non-root user in the Dockerfile
- One Deployment per service. Don't try to run API + worker in one pod.
