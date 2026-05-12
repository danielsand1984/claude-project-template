#!/usr/bin/env bash
# start.sh — Linux launcher for the dev stack.
# Run with: bash start.sh   (or chmod +x then ./start.sh)

set -e
cd "$(dirname "$0")"

echo "=== {{PROJECT_TITLE}} starter ==="
echo

if ! docker info >/dev/null 2>&1; then
  echo "X  Docker is not running or your user lacks permission."
  echo "   Try: sudo systemctl start docker"
  echo "   Or:  sudo usermod -aG docker \$USER  (then log out + back in)"
  exit 1
fi

if [ ! -f .env ]; then
  echo ".  Creating .env from .env.example"
  cp .env.example .env
fi

echo ".  Building containers..."
docker compose up -d --build

echo
echo ".  Waiting for services..."
sleep 5

echo
echo "==============================================================="
echo "  Web app:  http://localhost:3002"
echo "  API:      http://localhost:3000/healthz"
echo "==============================================================="
echo

xdg-open http://localhost:3002 2>/dev/null || true
