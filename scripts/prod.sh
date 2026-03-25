#!/usr/bin/env bash
# Build and start ShowMatch in production mode.
# Run from repo root: bash scripts/prod.sh
set -e

cd "$(dirname "$0")/.."

echo "🔪 Killing existing servers..."
fuser -k 3000/tcp 2>/dev/null || true
fuser -k 3001/tcp 2>/dev/null || true
sleep 1

echo "🔨 Building socket server..."
npm run build --workspace=apps/socket-server

echo "🔨 Building Next.js..."
npm run build --workspace=apps/web

echo "🚀 Starting production servers..."
nohup npm run start >> /tmp/showmatch-prod.log 2>&1 &
disown

echo "✅ Done. Logs: tail -f /tmp/showmatch-prod.log"
