#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────────
# prod.sh  —  LOCAL production (Raspberry Pi / LAN)
#
# Kills any running servers, rebuilds Next.js, and restarts both servers
# in the background. Logs go to /tmp/showmatch-prod.log.
#
# For CLOUD deployment (Fly.io + Vercel) use: bash scripts/deploy.sh
# ──────────────────────────────────────────────────────────────────────────────
set -e

cd "$(dirname "$0")/.."

echo "🔪 Killing existing servers..."
fuser -k 3000/tcp 2>/dev/null || true
fuser -k 3001/tcp 2>/dev/null || true
sleep 1

echo "🔨 Building Next.js..."
npm run build --workspace=apps/web

echo "🚀 Starting production servers..."
nohup npm run start >> /tmp/showmatch-prod.log 2>&1 &
disown

echo "✅ Done. Logs: tail -f /tmp/showmatch-prod.log"
