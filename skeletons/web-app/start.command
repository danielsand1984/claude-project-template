#!/usr/bin/env bash
# start.command — one-click launcher for the dev stack on macOS.
# Double-click in Finder (you may need to chmod +x once on first download).
#
# Does:
#   1. Check Docker Desktop is running
#   2. Copy .env.example to .env if missing
#   3. Build + start all containers
#   4. Open http://localhost:3002 in your browser

set -e
cd "$(dirname "$0")"

echo "=== {{PROJECT_TITLE}} starter ==="
echo

# --- Docker check ----------------------------------------------------
if ! docker info >/dev/null 2>&1; then
  echo "X  Docker is not running."
  echo "   Open Docker Desktop, wait until it finishes starting, then try again."
  echo
  read -p "Press Enter to close..."
  exit 1
fi

# --- .env init -------------------------------------------------------
if [ ! -f .env ]; then
  echo ".  Creating .env from .env.example (edit it later if you need to)"
  cp .env.example .env
fi

# --- Build + start ---------------------------------------------------
echo ".  Building containers (this can take 3-5 minutes on first run, ~10s afterward)..."
if ! docker compose up -d --build; then
  echo
  echo "X  Something went wrong. To see what:"
  echo "      docker compose logs"
  echo
  read -p "Press Enter to close..."
  exit 1
fi

echo
echo ".  Waiting a few seconds for services to be ready..."
sleep 5

echo
echo "==============================================================="
echo "  Web app:  http://localhost:3002"
echo "  API:      http://localhost:3000/healthz"
echo
echo "  Useful commands:"
echo "    docker compose logs -f         (see live logs)"
echo "    docker compose down            (stop everything)"
echo "    docker compose down -v         (stop + wipe database)"
echo "==============================================================="
echo

open http://localhost:3002 2>/dev/null || true

echo "Done. You can close this window."
